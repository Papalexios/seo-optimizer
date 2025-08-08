

import type { CrawlProgress, SitemapUrlEntry } from "../types";

const CONCURRENCY_LIMIT = 8;
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

// Enhanced fetch with retry and exponential backoff
const fetchWithRetry = async (url: string, signal: AbortSignal): Promise<Response> => {
    let lastError: Error | undefined;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
    
    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const response = await fetch(proxyUrl, { signal });
            if (!response.ok) {
                // Don't retry on client errors like 404, but do on server errors
                if (response.status >= 400 && response.status < 500) {
                    throw new Error(`Client error fetching ${url}: Status ${response.status}`);
                }
                // For 5xx errors, we will retry
                throw new Error(`Server error fetching ${url}: Status ${response.status}`);
            }
            return response;
        } catch (error) {
            lastError = error as Error;
            if (i < MAX_RETRIES - 1) {
                const delay = INITIAL_RETRY_DELAY * Math.pow(2, i);
                console.warn(`Attempt ${i + 1} failed for ${url}. Retrying in ${delay}ms...`, error);
                await new Promise(res => setTimeout(res, delay));
            }
        }
    }
    throw new Error(`Failed to fetch ${url} after ${MAX_RETRIES} attempts. Last error: ${lastError?.message}`);
};

const extractUrlsFromXml = (xmlDoc: Document): SitemapUrlEntry[] => {
    const urlEntries: SitemapUrlEntry[] = [];
    const urlNodes = xmlDoc.querySelectorAll("url");

    urlNodes.forEach(node => {
        const loc = node.querySelector("loc")?.textContent;
        if (loc) {
            const lastMod = node.querySelector("lastmod")?.textContent;
            const priorityText = node.querySelector("priority")?.textContent;
            const priority = priorityText ? parseFloat(priorityText) : undefined;
            urlEntries.push({ url: loc, lastMod, priority });
        }
    });

    return urlEntries;
};

export const crawlSitemap = async (initialSitemapUrl: string, onProgress: (progress: CrawlProgress) => void): Promise<SitemapUrlEntry[]> => {
    const parser = new DOMParser();
    const allPageUrlEntries = new Map<string, SitemapUrlEntry>();
    
    const controller = new AbortController();
    const signal = controller.signal;
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutes

    try {
        const contentSitemapUrls = new Set<string>();
        const processedIndexes = new Set<string>();

        onProgress({ type: 'preflight', count: 0, total: 1, pagesFound: 0 });

        // Phase 1: Discover all content sitemaps sequentially
        const queue = [initialSitemapUrl];
        while (queue.length > 0) {
            if (signal.aborted) throw new Error("Crawl timed out during sitemap discovery.");
            const currentSitemapUrl = queue.shift()!;
            if (processedIndexes.has(currentSitemapUrl)) continue;

            try {
                const response = await fetchWithRetry(currentSitemapUrl, signal);
                const sitemapText = await response.text();
                processedIndexes.add(currentSitemapUrl);
                const xmlDoc = parser.parseFromString(sitemapText, "text/xml");
                if (xmlDoc.getElementsByTagName("parsererror").length > 0) continue;

                const sitemapIndexNodes = xmlDoc.querySelectorAll("sitemap > loc");
                if (sitemapIndexNodes.length > 0) {
                    const nestedUrls = Array.from(sitemapIndexNodes).map(node => node.textContent).filter(Boolean) as string[];
                    queue.push(...nestedUrls);
                } else {
                    contentSitemapUrls.add(currentSitemapUrl);
                }
                onProgress({ type: 'preflight', count: processedIndexes.size, total: processedIndexes.size + queue.length, currentSitemap: currentSitemapUrl, pagesFound: 0 });
            } catch (e) {
                 console.warn(`Could not process sitemap index ${currentSitemapUrl}:`, e instanceof Error ? e.message : String(e));
            }
        }
        
        // --- NEW: Phase 1.5: Count all URLs in PARALLEL ---
        let totalUrlCount = 0;
        const sitemapsToCount = Array.from(contentSitemapUrls);
        onProgress({ type: 'counting', count: 0, total: sitemapsToCount.length, pagesFound: 0 });
        
        const countPromises = sitemapsToCount.map(async (sitemapUrl) => {
            if (signal.aborted) return 0;
            try {
                const response = await fetchWithRetry(sitemapUrl, signal);
                const sitemapText = await response.text();
                const xmlDoc = parser.parseFromString(sitemapText, "text/xml");
                if (xmlDoc.getElementsByTagName("parsererror").length > 0) return 0;
                const locNodes = xmlDoc.querySelectorAll("url > loc");
                return locNodes.length;
            } catch(e) {
                console.warn(`Could not count URLs in ${sitemapUrl}:`, e instanceof Error ? e.message : String(e));
                return 0;
            }
        });

        const counts = await Promise.all(countPromises);
        totalUrlCount = counts.reduce((sum, count) => sum + (count || 0), 0);
        onProgress({ type: 'counting', count: sitemapsToCount.length, total: sitemapsToCount.length, pagesFound: totalUrlCount });


        // --- Phase 2: Crawl content sitemaps in PARALLEL ---
        const sitemapsToCrawl = Array.from(contentSitemapUrls);
        const totalSitemaps = sitemapsToCrawl.length;
        let processedCount = 0;
        
        const sitemapQueue = [...sitemapsToCrawl];

        const processWorker = async () => {
             while(sitemapQueue.length > 0) {
                const sitemapUrl = sitemapQueue.shift();
                if (!sitemapUrl) continue;
            
                try {
                    if (signal.aborted) throw new Error("Crawl timed out during content processing.");
                    const response = await fetchWithRetry(sitemapUrl, signal);
                    const sitemapText = await response.text();
                    const xmlDoc = parser.parseFromString(sitemapText, "text/xml");
                    if (xmlDoc.getElementsByTagName("parsererror").length > 0) continue;

                    const entries = extractUrlsFromXml(xmlDoc);

                    entries.forEach(entry => {
                        if (!allPageUrlEntries.has(entry.url)) {
                           allPageUrlEntries.set(entry.url, entry);
                            onProgress({
                                type: 'crawling',
                                count: processedCount,
                                total: totalSitemaps,
                                currentSitemap: sitemapUrl,
                                pagesFound: allPageUrlEntries.size,
                                lastUrlFound: entry.url,
                                totalUrls: totalUrlCount,
                            });
                        }
                    });
                } catch (e) {
                    console.warn(`Could not process content sitemap ${sitemapUrl}:`, e instanceof Error ? e.message : String(e));
                } finally {
                    processedCount++;
                    onProgress({ type: 'crawling', count: processedCount, total: totalSitemaps, currentSitemap: sitemapUrl, pagesFound: allPageUrlEntries.size, totalUrls: totalUrlCount });
                }
            }
        }

        const workers = Array.from({ length: Math.min(CONCURRENCY_LIMIT, sitemapsToCrawl.length) }).map(processWorker);
        await Promise.all(workers);

    } finally {
        clearTimeout(timeoutId);
    }
    
    return Array.from(allPageUrlEntries.values());
};
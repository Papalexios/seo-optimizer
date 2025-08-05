

import type { CrawlProgress } from "../types";

const fetchWithProxy = async (targetUrl: string, signal: AbortSignal, options: RequestInit = {}) => {
    // This proxy is used for the browser environment to bypass CORS.
    // In a real backend implementation, this would be a direct fetch.
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    const response = await fetch(proxyUrl, { ...options, signal });
     if (!response.ok) {
        throw new Error(`Failed to fetch from ${targetUrl} via proxy. Status: ${response.status}`);
     }
    return response;
}

const CONCURRENCY_LIMIT = 8;

/**
 * Crawls a sitemap, handling nested sitemap indexes and reporting progress.
 * @param initialSitemapUrl The starting URL of the sitemap.
 * @param onProgress A callback function to report progress.
 * @returns A Promise that resolves to a Set of all discovered page URLs.
 */
export const crawlSitemap = async (initialSitemapUrl: string, onProgress: (progress: CrawlProgress) => void): Promise<Set<string>> => {
    const parser = new DOMParser();
    const allPageUrls = new Set<string>();
    
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
                const sitemapText = await (await fetchWithProxy(currentSitemapUrl, signal)).text();
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
                 console.warn(`Could not process sitemap index ${currentSitemapUrl}:`, e);
            }
        }
        
        // --- NEW: Phase 1.5: Count all URLs in PARALLEL ---
        let totalUrlCount = 0;
        const sitemapsToCount = Array.from(contentSitemapUrls);
        let sitemapsCounted = 0;
        
        onProgress({ type: 'counting', count: 0, total: sitemapsToCount.length, pagesFound: 0 });
        
        const countQueue = [...sitemapsToCount];
        const countWorker = async () => {
            while(countQueue.length > 0) {
                const sitemapUrl = countQueue.shift();
                if (!sitemapUrl) continue;

                if (signal.aborted) throw new Error("Crawl timed out during URL counting.");
                try {
                    const sitemapText = await (await fetchWithProxy(sitemapUrl, signal)).text();
                    const xmlDoc = parser.parseFromString(sitemapText, "text/xml");
                    if (xmlDoc.getElementsByTagName("parsererror").length > 0) continue;
                    
                    const locNodes = xmlDoc.querySelectorAll("url > loc");
                    // This is thread-safe in JS single-threaded environment
                    totalUrlCount += locNodes.length;
                } catch(e) {
                    console.warn(`Could not count URLs in ${sitemapUrl}:`, e);
                } finally {
                    sitemapsCounted++;
                    onProgress({ type: 'counting', count: sitemapsCounted, total: sitemapsToCount.length, pagesFound: totalUrlCount });
                }
            }
        }
        
        const countWorkers = Array.from({ length: Math.min(CONCURRENCY_LIMIT, sitemapsToCount.length) }).map(countWorker);
        await Promise.all(countWorkers);


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
                    const sitemapText = await (await fetchWithProxy(sitemapUrl, signal)).text();
                    const xmlDoc = parser.parseFromString(sitemapText, "text/xml");
                    if (xmlDoc.getElementsByTagName("parsererror").length > 0) continue;

                    const locNodes = xmlDoc.querySelectorAll("url > loc");
                    const urlsFromCurrentSitemap = Array.from(locNodes).map(node => node.textContent).filter(Boolean) as string[];

                    urlsFromCurrentSitemap.forEach(pageUrl => {
                        const previousSize = allPageUrls.size;
                        allPageUrls.add(pageUrl);
                        if (allPageUrls.size > previousSize) {
                            onProgress({
                                type: 'crawling',
                                count: processedCount,
                                total: totalSitemaps,
                                currentSitemap: sitemapUrl,
                                pagesFound: allPageUrls.size,
                                lastUrlFound: pageUrl,
                                totalUrls: totalUrlCount,
                            });
                        }
                    });
                } catch (e) {
                    console.warn(`Could not process content sitemap ${sitemapUrl}:`, e);
                } finally {
                    processedCount++;
                    onProgress({ type: 'crawling', count: processedCount, total: totalSitemaps, currentSitemap: sitemapUrl, pagesFound: allPageUrls.size, totalUrls: totalUrlCount });
                }
            }
        }

        const workers = Array.from({ length: Math.min(CONCURRENCY_LIMIT, sitemapsToCrawl.length) }).map(processWorker);
        await Promise.all(workers);

    } finally {
        clearTimeout(timeoutId);
    }
    
    return allPageUrls;
}
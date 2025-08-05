

import type { SitemapUrlEntry } from '../types';

const KEYWORD_BOOSTS: { [key: string]: number } = {
    // Commercial keywords
    'product': 10, 'service': 10, 'pricing': 12, 'buy': 10, 'shop': 8,
    'demo': 12, 'solutions': 8, 'features': 8, 'case-study': 8, 'integration': 7,
    // High-value informational / Pillar Content
    'docs': 3, 'api': 4, 'guide': 7, 'tutorial': 6, 'learn': 7,
    'hub': 9, 'pillar': 9, 'guides': 8,
    // Navigational
    'contact': 5, 'about': 5,
    // De-prioritize
    'blog': -5, '/blog/': 2, 'policy': -15, 'terms': -15, 'legal': -15,
    'author': -10, 'tag': -10, 'category': -10, 'page/': -20,
};

const calculateScore = (entry: SitemapUrlEntry): number => {
    const { url, lastMod, priority } = entry;
    try {
        let score = 100;
        const urlObject = new URL(url);
        const urlPath = urlObject.pathname;

        // 1. Path Depth Penalty (shorter is better)
        const segments = (urlPath || '').split('/').filter(Boolean);
        score -= segments.length * 5;

        // 2. Keyword Boosts/Penalties
        for (const keyword in KEYWORD_BOOSTS) {
            if (url.includes(keyword)) {
                score += KEYWORD_BOOSTS[keyword];
            }
        }

        // 3. Date in URL Penalty (often indicates old content)
        if (/\/\d{4}\/\d{2}/.test(urlPath)) {
            score -= 15;
        }
        
        // 4. Penalty for non-html file extensions
        if (/\.(pdf|jpg|png|zip|xml|css|js)$/i.test(urlPath)) {
            return 0; // Exclude these files entirely
        }

        // 5. Huge boost for root/homepage
        if (urlPath === '/') {
            score += 50;
        }
        
        // 6. NEW: Priority Boost from sitemap
        if (priority !== undefined) {
            score += (priority - 0.5) * 20; // e.g., priority 1.0 gives +10, 0.1 gives -8
        }

        // 7. NEW: Freshness Boost from lastMod
        if (lastMod) {
            const modDate = new Date(lastMod);
            const now = new Date();
            const diffDays = (now.getTime() - modDate.getTime()) / (1000 * 3600 * 24);
            
            if (diffDays < 30) score += 15; // Updated in last month
            else if (diffDays < 90) score += 10; // Updated in last 3 months
            else if (diffDays > 365) score -= 10; // Over a year old
            if (diffDays > 730) score -= 15; // Over two years old
        }

        return Math.max(0, score);
    } catch (e) {
        console.error(`Could not parse URL for scoring: ${url}`, e);
        return 0;
    }
};

/**
 * Ranks an array of SitemapUrlEntry objects based on their estimated SEO importance.
 * @param entries An array of SitemapUrlEntry objects.
 * @returns A new array of URL strings sorted from most to least important.
 */
export const rankUrls = (entries: SitemapUrlEntry[]): string[] => {
    return [...entries]
        .map(entry => ({ url: entry.url, score: calculateScore(entry) }))
        .sort((a, b) => b.score - a.score)
        .map(item => item.url);
};
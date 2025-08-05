
const KEYWORD_BOOSTS: { [key: string]: number } = {
    // Commercial keywords
    'product': 10,
    'service': 10,
    'pricing': 12,
    'buy': 10,
    'shop': 8,
    'demo': 12,
    'solutions': 8,
    'features': 8,
    'case-study': 8,
    'integration': 7,

    // High-value informational / Pillar Content
    'docs': 3,
    'api': 4,
    'guide': 7,
    'tutorial': 6,
    'learn': 7,
    'hub': 9,
    'pillar': 9,
    'guides': 8,

    // Navigational
    'contact': 5,
    'about': 5,

    // De-prioritize
    'blog': -5, // Penalize generic blog listing pages
    '/blog/': 2, // But give a small boost to individual posts
    'policy': -15,
    'terms': -15,
    'legal': -15,
    'author': -10,
    'tag': -10,
    'category': -10,
    'page/': -20, // Penalize pagination
};

const calculateScore = (url: string): number => {
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

        return Math.max(0, score); // Ensure score doesn't go below zero
    } catch (e) {
        console.error(`Could not parse URL for scoring: ${url}`, e);
        return 0; // Invalid URLs get no score
    }
};

/**
 * Ranks an array of URLs based on their estimated SEO importance.
 * @param urls An array of URL strings.
 * @returns A new array of URL strings sorted from most to least important.
 */
export const rankUrls = (urls: string[]): string[] => {
    return [...urls]
        .map(url => ({ url, score: calculateScore(url) }))
        .sort((a, b) => b.score - a.score)
        .map(item => item.url);
};

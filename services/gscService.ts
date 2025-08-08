export interface GscSite {
    siteUrl: string;
    permissionLevel: string;
}

export interface GscPerformanceData {
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
}

const GSC_API_BASE = 'https://www.googleapis.com/webmasters/v3';

/**
 * Fetches the list of sites (properties) from the user's GSC account.
 */
export const fetchGscSites = async (accessToken: string): Promise<GscSite[]> => {
    const response = await fetch(`${GSC_API_BASE}/sites`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ error: { message: 'Unknown error' }}));
        throw new Error(`Failed to fetch GSC sites: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.siteEntry || [];
};

/**
 * Fetches search performance data for a specific page URL within a site.
 */
export const fetchGscPerformanceForUrl = async (
    pageUrl: string,
    siteUrl: string,
    accessToken: string
): Promise<GscPerformanceData | null> => {
    // Dates: last 90 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 90);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    const requestBody = {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
        dimensions: ['page'],
        dimensionFilterGroups: [{
            filters: [{
                dimension: 'page',
                operator: 'equals',
                expression: pageUrl,
            }],
        }],
        rowLimit: 1,
    };

    const response = await fetch(`${GSC_API_BASE}/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        // It's common to not find data for a specific URL, so we don't throw an error, just log and return null.
        console.warn(`Could not fetch GSC performance for ${pageUrl}. Status: ${response.status}`);
        return null;
    }

    const data = await response.json();
    if (data.rows && data.rows.length > 0) {
        return data.rows[0]; // The API returns { keys, clicks, impressions, ctr, position }
    }

    return null; // No data found for this specific URL
};

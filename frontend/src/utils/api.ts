const MOCK_DATA: Record<string, any> = {
    '/api/rto-metrics': [
        { title: 'Total RTO', value: '0', gradient: 'from-red-500', lineColor: 'text-red-500' },
        { title: 'Recovery Rate', value: '0%', gradient: 'from-emerald-500', lineColor: 'text-emerald-500' },
        { title: 'Risk Score', value: 'N/A', gradient: 'from-blue-500', lineColor: 'text-blue-500' },
        { title: 'Net Savings', value: '₹0', gradient: 'from-purple-500', lineColor: 'text-purple-500' },
    ],
    '/api/dashboard-stats': {
        revenue: 0,
        total_orders: 0,
        high_risk_pincodes: 0,
        rto_orders: 0,
        is_mock: true
    },
    '/api/orders': { data: [], total: 0, total_pages: 1 },
    '/api/shopify/connection': { connected: false }
};

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        // If generic error or 404, we throw
        if (!response.ok) {
            throw new Error(`Offline: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error("Invalid Content Type");
        }

        return await response.json();
    } catch (error) {
        // Find if we have a mock for this endpoint (ignoring query params)
        const pureEndpoint = endpoint.split('?')[0];
        if (MOCK_DATA[pureEndpoint]) {
            console.warn(`API ${endpoint} failed. Showing empty state fallback.`);
            return MOCK_DATA[pureEndpoint];
        }
        throw error;
    }
}

const MOCK_DATA: Record<string, any> = {
    '/api/rto-metrics': [
        { title: 'Total RTO', value: '124', gradient: 'from-red-500', lineColor: 'text-red-500' },
        { title: 'Recovery Rate', value: '68%', gradient: 'from-emerald-500', lineColor: 'text-emerald-500' },
        { title: 'Risk Score', value: 'Low', gradient: 'from-blue-500', lineColor: 'text-blue-500' },
        { title: 'Net Savings', value: '₹14.2K', gradient: 'from-purple-500', lineColor: 'text-purple-500' },
    ],
    '/api/dashboard-stats': {
        revenue: 452000,
        total_orders: 1240,
        high_risk_pincodes: 5,
        rto_orders: 0
    },
    '/api/rto-trends': {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
        series: [{ name: 'RTO', data: [31, 40, 28, 51, 42] }]
    },
    '/api/pincode-risk': {
        high: 12, medium: 45, low: 120
    }
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

        // If generic error or 404, try to give mock data if available
        if (!response.ok) {
            console.warn(`API ${endpoint} failed (${response.status}). Using fallback.`);
            return MOCK_DATA[endpoint] || {};
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            console.warn(`API ${endpoint} returned non-JSON. Using fallback.`);
            return MOCK_DATA[endpoint] || {};
        }

        return await response.json();
    } catch (error) {
        console.warn(`Fetch error for ${endpoint}. Using fallback.`);
        return MOCK_DATA[endpoint] || {};
    }
}

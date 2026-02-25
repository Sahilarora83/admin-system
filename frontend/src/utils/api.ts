const MOCK_DATA: Record<string, any> = {
    '/api/rto-metrics': [
        { title: 'Total RTO', value: '0', gradient: 'from-red-500', lineColor: 'text-red-500' },
        { title: 'Recovery Rate', value: '0%', gradient: 'from-emerald-500', lineColor: 'text-emerald-500' },
        { title: 'Risk Score', value: 'N/A', gradient: 'from-blue-500', lineColor: 'text-blue-500' },
        { title: 'Net Savings', value: '₹0', gradient: 'from-purple-500', lineColor: 'text-purple-500' },
    ],
    '/api/dashboard-stats': { revenue: 0, total_orders: 0, high_risk_pincodes: 0, rto_orders: 0, is_mock: true },
    '/api/orders': { data: [], total: 0, total_pages: 1 },
    '/api/shopify/connection': { connected: false },
    '/api/notifications': [],
    '/api/fraud-customers': [],
    '/api/delivery-speed': { labels: [], series: [] },
    '/api/cashflow-insights': { daily: [], total_in: 0, total_out: 0, zoneCode: 'N/A', rtoHigherBy: '0%', amountSaved: '0' },
    '/api/rto-trends': {
        categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        rto: [0, 0, 0, 0, 0, 0, 0],
        cod: [0, 0, 0, 0, 0, 0, 0],
        stats: [
            { label: 'RTO Rate', value: '0%', color: 'indigo' },
            { label: 'COD %', value: '0%', color: 'pink' },
            { label: 'Efficiency', value: '0%', color: 'emerald' },
            { label: 'Deliveries', value: '0', color: 'cyan' }
        ]
    },
    '/api/net-recovery': {
        categories: ['W1', 'W2', 'W3', 'W4'],
        current: [0, 0, 0, 0],
        target: [0, 0, 0, 0],
        series: [{ name: 'Recovery', data: [0, 0, 0, 0] }]
    },
    '/api/courier-performance': [],
    '/api/pincode-risk': { highRiskCount: 0, users: [], high: 0, medium: 0, low: 0 },
    '/api/delivery-table': [],
    '/api/profile': { firstName: 'Sahil', lastName: 'Admin', email: 'admin@rtoshield.com', avatar: '' },
    '/api/monthly-target': { target: 100, current: 0 },
    '/api/monthly-sales': { labels: [], series: [] }
};

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    const cleanEndpoint = endpoint.split('?')[0];
    const url = endpoint.startsWith('http') ? endpoint : `${baseUrl}${endpoint}`;

    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
        });

        if (!response.ok) {
            if (MOCK_DATA[cleanEndpoint]) return MOCK_DATA[cleanEndpoint];
            throw new Error(`HTTP ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            if (MOCK_DATA[cleanEndpoint]) return MOCK_DATA[cleanEndpoint];
            throw new Error("Response was not JSON");
        }

        return await response.json();
    } catch (error) {
        if (MOCK_DATA[cleanEndpoint]) return MOCK_DATA[cleanEndpoint];
        return Array.isArray(MOCK_DATA[cleanEndpoint]) ? [] : {};
    }
}

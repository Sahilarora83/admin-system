import { useState, useEffect, useRef, useCallback } from "react";
import PageMeta from "../components/common/PageMeta";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Order {
    id: number;
    shopify_order_id: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    amount: number;
    payment_method: string;
    status: string;
    fulfillment_status: string;
    shopify_risk_level: string;
    city: string;
    state: string;
    pincode: string;
    pincode_risk: string;
    ordered_at: string;
    line_items: string;
}

interface OrdersResponse {
    data: Order[];
    total: number;
    page: number;
    per_page: number;
    total_pages: number;
}

interface ShopifyConnection {
    connected: boolean;
    shop_domain?: string;
    last_synced_at?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
    delivered: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    in_transit: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    rto: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    cancelled: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    out_for_delivery: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
};

const RISK_BADGE: Record<string, string> = {
    High: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    Medium: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
    Low: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
};

function fmt(n: number) {
    return "₹" + n.toLocaleString("en-IN");
}

function timeAgo(dateStr: string) {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    const days = Math.floor(diff / 86_400_000);
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    return days + " days ago";
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // Import state
    const [uploading, setUploading] = useState(false);
    const [importMsg, setImportMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Shopify connect state
    const [showConnect, setShowConnect] = useState(false);
    const [shopDomain, setShopDomain] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [connecting, setConnecting] = useState(false);
    const [connection, setConnection] = useState<ShopifyConnection | null>(null);

    // ── Fetch orders ──────────────────────────────────────────────────────────
    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: String(page),
                per_page: "20",
                ...(statusFilter && { status: statusFilter }),
                ...(search && { search }),
            });
            const res = await fetch(`/api/orders?${params}`);
            const data: OrdersResponse = await res.json();
            setOrders(data.data ?? []);
            setTotal(data.total ?? 0);
            setTotalPages(data.total_pages ?? 1);
        } catch {
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [page, statusFilter, search]);

    useEffect(() => { fetchOrders(); }, [fetchOrders]);

    // ── Fetch Shopify connection ──────────────────────────────────────────────
    useEffect(() => {
        fetch("/api/shopify/connection")
            .then(r => r.json())
            .then(setConnection)
            .catch(() => { });
    }, []);

    // ── CSV Upload ────────────────────────────────────────────────────────────
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setImportMsg(null);

        const formData = new FormData();
        formData.append("csv", file);

        try {
            const res = await fetch("/api/shopify/import", { method: "POST", body: formData });
            const result = await res.json();
            if (result.success) {
                setImportMsg({
                    type: "success",
                    text: `✅ Import complete — ${result.inserted} inserted, ${result.updated} updated`,
                });
                fetchOrders();
            } else {
                setImportMsg({ type: "error", text: "❌ " + (result.error ?? "Import failed") });
            }
        } catch {
            setImportMsg({ type: "error", text: "❌ Network error during upload" });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    // ── Shopify API Connect ───────────────────────────────────────────────────
    const handleShopifyConnect = async () => {
        if (!shopDomain || !accessToken) return;
        setConnecting(true);
        setImportMsg(null);
        try {
            const res = await fetch("/api/shopify/connect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ shop_domain: shopDomain, access_token: accessToken }),
            });
            const result = await res.json();
            if (result.success) {
                setImportMsg({
                    type: "success",
                    text: `✅ Shopify sync complete — ${result.inserted} inserted, ${result.updated} updated`,
                });
                setShowConnect(false);
                setConnection({ connected: true, shop_domain: shopDomain, last_synced_at: new Date().toISOString() });
                fetchOrders();
            } else {
                setImportMsg({ type: "error", text: "❌ " + (result.error ?? "Shopify connect failed") });
            }
        } catch {
            setImportMsg({ type: "error", text: "❌ Network error during Shopify connect" });
        } finally {
            setConnecting(false);
        }
    };

    // ─── Render ──────────────────────────────────────────────────────────────
    return (
        <>
            <PageMeta title="RTOShield | Orders" description="Import and manage Shopify orders" />

            <div className="p-3 sm:p-4 md:p-6 lg:p-8 font-sans">

                {/* ── Header ──────────────────────────────────────────────────────── */}
                <div className="flex flex-col gap-4 mb-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                                {total > 0 ? `${total.toLocaleString()} orders imported` : "No orders yet — import below"}
                            </p>
                        </div>

                        <div className="flex items-center gap-2 flex-wrap">
                            {/* Shopify Connection Badge */}
                            {connection?.connected && (
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-400">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    {connection.shop_domain}
                                </div>
                            )}

                            {/* Shopify API Connect */}
                            <button
                                id="btn-shopify-connect"
                                onClick={() => setShowConnect(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-[#96bf48] hover:bg-[#7daa35] text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                </svg>
                                {connection?.connected ? "Re-sync Shopify" : "Connect Shopify"}
                            </button>

                            {/* CSV Upload */}
                            <input
                                type="file"
                                accept=".csv"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                            />
                            <button
                                id="btn-csv-upload"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploading}
                                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
                            >
                                {uploading ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                    </svg>
                                )}
                                {uploading ? "Importing..." : "Upload CSV"}
                            </button>
                        </div>
                    </div>

                    {/* Import message */}
                    {importMsg && (
                        <div className={`px-4 py-3 rounded-lg text-sm font-medium ${importMsg.type === "success"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800"
                                : "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                            }`}>
                            {importMsg.text}
                        </div>
                    )}
                </div>

                {/* ── Shopify Connect Modal ─────────────────────────────────────── */}
                {showConnect && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-md mx-4">
                            <div className="flex items-center justify-between mb-5">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <svg className="w-5 h-5 text-[#96bf48]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                    Connect Shopify Store
                                </h2>
                                <button onClick={() => setShowConnect(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Shop Domain
                                    </label>
                                    <input
                                        id="input-shop-domain"
                                        type="text"
                                        placeholder="mystore.myshopify.com"
                                        value={shopDomain}
                                        onChange={e => setShopDomain(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#96bf48]"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Admin API Access Token
                                    </label>
                                    <input
                                        id="input-access-token"
                                        type="password"
                                        placeholder="shpat_xxxxxxxxxxxx"
                                        value={accessToken}
                                        onChange={e => setAccessToken(e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#96bf48]"
                                    />
                                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                                        Shopify Admin → Apps → Develop apps → API credentials
                                    </p>
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setShowConnect(false)}
                                        className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        id="btn-confirm-connect"
                                        onClick={handleShopifyConnect}
                                        disabled={connecting || !shopDomain || !accessToken}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-[#96bf48] hover:bg-[#7daa35] disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors"
                                    >
                                        {connecting ? (
                                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : null}
                                        {connecting ? "Syncing..." : "Sync Orders"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Filters ──────────────────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1 max-w-sm">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                            id="search-orders"
                            type="text"
                            placeholder="Search by order ID, email, phone..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                    </div>

                    <select
                        id="filter-status"
                        value={statusFilter}
                        onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="in_transit">In Transit</option>
                        <option value="delivered">Delivered</option>
                        <option value="rto">RTO</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* ── Table ────────────────────────────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                                <svg className="w-8 h-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                </svg>
                            </div>
                            <div className="text-center">
                                <p className="text-gray-600 dark:text-gray-300 font-semibold">No orders found</p>
                                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Upload a Shopify CSV or connect your Shopify store to get started</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConnect(true)}
                                    className="px-4 py-2 bg-[#96bf48] hover:bg-[#7daa35] text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Connect Shopify
                                </button>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Upload CSV
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                                        <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">Order ID</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">Customer</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">Amount</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">Payment</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">Status</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">Risk</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">Location</th>
                                        <th className="text-left px-4 py-3 font-semibold text-gray-500 dark:text-gray-400 whitespace-nowrap">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                                    {orders.map(order => {
                                        const lineItems = (() => {
                                            try { return JSON.parse(order.line_items || "[]"); } catch { return []; }
                                        })();
                                        return (
                                            <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="font-semibold text-gray-900 dark:text-white">{order.shopify_order_id}</div>
                                                    {lineItems[0] && (
                                                        <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate max-w-[140px]" title={lineItems[0].name}>
                                                            {lineItems[0].name}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="font-medium text-gray-800 dark:text-gray-200">{order.customer_name || "—"}</div>
                                                    <div className="text-xs text-gray-400 dark:text-gray-500">{order.customer_phone || order.customer_email}</div>
                                                </td>
                                                <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap">
                                                    {fmt(order.amount)}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${order.payment_method === "COD"
                                                            ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                                            : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                        }`}>
                                                        {order.payment_method}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[order.status] ?? STATUS_BADGE.pending}`}>
                                                        {order.status.replace("_", " ")}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${RISK_BADGE[order.shopify_risk_level] ?? RISK_BADGE.Low
                                                        }`}>
                                                        {order.shopify_risk_level || "Low"}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-gray-700 dark:text-gray-300">{order.city || "—"}</div>
                                                    <div className="text-xs text-gray-400 dark:text-gray-500">{order.state} {order.pincode && `· ${order.pincode}`}</div>
                                                </td>
                                                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 whitespace-nowrap text-xs">
                                                    {timeAgo(order.ordered_at)}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ── Pagination ─────────────────────────────────────────────────── */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                Page {page} of {totalPages} ({total.toLocaleString()} orders)
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                                >
                                    ← Prev
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-700 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
                                >
                                    Next →
                                </button>
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </>
    );
}

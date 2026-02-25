import { useState } from "react";
import { apiFetch } from "../../utils/api";

interface LineItem {
    name: string;
    quantity: number;
    price: number;
}

interface Courier {
    courier_id: number;
    courier_name: string;
    rate: number;
    etd: string;
    cod: number;
    rating: number;
}

interface Props {
    order: {
        id: number;
        shopify_order_id: string;
        customer_name: string;
        customer_phone: string;
        city: string;
        state: string;
        pincode: string;
        amount: number;
        payment_method: string;
        line_items: any;
    };
    onClose: () => void;
    onSuccess: (awb: string, courierName: string) => void;
}

type Step = "dimensions" | "select_courier" | "done";

export default function DispatchModal({ order, onClose, onSuccess }: Props) {
    const [step, setStep] = useState<Step>("dimensions");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Step 1: dimensions
    const [dims, setDims] = useState({ weight: "", length: "", breadth: "", height: "" });

    // Step 2: courier selection
    const [shipmentId, setShipmentId] = useState<number | null>(null);
    const [couriers, setCouriers] = useState<Courier[]>([]);
    const [selectedCourier, setSelectedCourier] = useState<Courier | null>(null);
    const [confirming, setConfirming] = useState(false);

    // Done
    const [awb, setAwb] = useState("");

    const lineItems: LineItem[] = (() => {
        if (typeof order.line_items === 'object' && order.line_items !== null) return order.line_items;
        try { return JSON.parse(order.line_items || "[]"); } catch { return []; }
    })();

    // ── Step 1: Get Available Couriers ────────────────────────────────────────
    const handleGetCouriers = async () => {
        if (!dims.weight || !dims.length || !dims.breadth || !dims.height) {
            setError("All dimensions are required");
            return;
        }
        setError("");
        setLoading(true);
        try {
            const data = await apiFetch("/api/dispatch/initiate", {
                method: "POST",
                body: JSON.stringify({
                    order_id: order.id,
                    weight: parseFloat(dims.weight),
                    length: parseInt(dims.length),
                    breadth: parseInt(dims.breadth),
                    height: parseInt(dims.height),
                }),
            });
            if (data.error) throw new Error(data.error);

            setShipmentId(data.shipment_id);
            setCouriers(data.couriers ?? []);
            setStep("select_courier");
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Network error");
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2: Confirm Courier ───────────────────────────────────────────────
    const handleConfirmDispatch = async () => {
        if (!selectedCourier || !shipmentId) return;
        setConfirming(true);
        setError("");
        try {
            const data = await apiFetch("/api/dispatch/confirm", {
                method: "POST",
                body: JSON.stringify({
                    shipment_id: shipmentId,
                    courier_id: selectedCourier.courier_id,
                    courier_name: selectedCourier.courier_name,
                }),
            });
            if (data.error || !data.success) throw new Error(data.error ?? "Confirm failed");

            setAwb(data.awb_code ?? "");
            setStep("done");
            onSuccess(data.awb_code, selectedCourier.courier_name);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Network error");
        } finally {
            setConfirming(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            {step === "done" ? "✅ Dispatched!" : "Dispatch Order"}
                        </h2>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{order.shopify_order_id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="px-6 py-5">

                    {/* Order Summary */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 mb-5 text-sm">
                        <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-gray-700 dark:text-gray-200">{order.customer_name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${order.payment_method === "COD"
                                ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                                : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                }`}>{order.payment_method}</span>
                        </div>
                        <p className="text-gray-400 dark:text-gray-500 text-xs">{order.city}, {order.state} — {order.pincode}</p>
                        {lineItems[0] && (
                            <p className="text-gray-500 dark:text-gray-400 text-xs mt-1 truncate">{lineItems[0].name}{lineItems.length > 1 ? ` +${lineItems.length - 1} more` : ""}</p>
                        )}
                        <p className="font-semibold text-gray-900 dark:text-white mt-1">₹{order.amount.toLocaleString("en-IN")}</p>
                    </div>

                    {error && (
                        <div className="mb-4 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    {/* ── Step 1: Dimensions ───────────────────────────────────────── */}
                    {step === "dimensions" && (
                        <>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Package Dimensions</p>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                                {(["weight", "length", "breadth", "height"] as const).map(field => (
                                    <div key={field}>
                                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 capitalize">
                                            {field} {field === "weight" ? "(kg)" : "(cm)"}
                                        </label>
                                        <input
                                            id={`dispatch-${field}`}
                                            type="number"
                                            min="0.1"
                                            step={field === "weight" ? "0.1" : "1"}
                                            value={dims[field]}
                                            onChange={e => setDims(d => ({ ...d, [field]: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                                            placeholder={field === "weight" ? "0.5" : "20"}
                                        />
                                    </div>
                                ))}
                            </div>

                            <button
                                id="btn-get-couriers"
                                onClick={handleGetCouriers}
                                disabled={loading}
                                className="w-full flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white font-medium rounded-lg text-sm transition-colors"
                            >
                                {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                {loading ? "Fetching Couriers..." : "Get Available Couriers →"}
                            </button>
                        </>
                    )}

                    {/* ── Step 2: Select Courier ───────────────────────────────────── */}
                    {step === "select_courier" && (
                        <>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                                Select Courier ({couriers.length} available)
                            </p>

                            {couriers.length === 0 ? (
                                <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
                                    No couriers available for this route. Try adjusting dimensions.
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                    {couriers.map(c => (
                                        <button
                                            key={c.courier_id}
                                            onClick={() => setSelectedCourier(c)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all ${selectedCourier?.courier_id === c.courier_id
                                                ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                                                : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
                                                }`}
                                        >
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white text-sm">{c.courier_name}</p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                                                    ETA: {c.etd || "3-5 days"} · Rating: {c.rating || "N/A"}
                                                    {c.cod > 0 && " · COD ✓"}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-900 dark:text-white">₹{c.rate}</p>
                                                {selectedCourier?.courier_id === c.courier_id && (
                                                    <span className="text-xs text-purple-600 dark:text-purple-400">Selected</span>
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div className="flex gap-3 mt-4">
                                <button
                                    onClick={() => setStep("dimensions")}
                                    className="flex-1 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    ← Back
                                </button>
                                <button
                                    id="btn-confirm-dispatch"
                                    onClick={handleConfirmDispatch}
                                    disabled={!selectedCourier || confirming}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-medium rounded-lg text-sm transition-colors"
                                >
                                    {confirming ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                                    {confirming ? "Confirming..." : "Confirm Dispatch"}
                                </button>
                            </div>
                        </>
                    )}

                    {/* ── Step 3: Done ─────────────────────────────────────────────── */}
                    {step === "done" && (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Order Dispatched!</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">via {selectedCourier?.courier_name}</p>
                            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl px-6 py-4 inline-block">
                                <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">AWB Code</p>
                                <p className="text-xl font-mono font-bold text-purple-600 dark:text-purple-400 tracking-wider">{awb}</p>
                            </div>
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                                Tracking will auto-update via Shiprocket webhook
                            </p>
                            <button
                                onClick={onClose}
                                className="mt-5 w-full py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium rounded-lg text-sm transition-colors hover:opacity-90"
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

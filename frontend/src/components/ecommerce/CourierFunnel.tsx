import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";

interface CourierStat {
    courier: string;
    pending: number;
    in_transit: number;
    out_for_delivery: number;
    delivered: number;
    rto: number;
}

export default function CourierFunnel() {
    const [data, setData] = useState<CourierStat[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        apiFetch("/api/courier-funnel")
            .then((res) => {
                setData(res);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="h-64 flex items-center justify-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
            <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (!data.length) return null;

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
                    Courier Delivery Funnel
                </h3>
                <span className="text-xs text-gray-400">Live from Shiprocket</span>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-50 dark:border-gray-800">
                            <th className="text-left py-3 font-medium">Courier</th>
                            <th className="text-center py-3 font-medium">Pending</th>
                            <th className="text-center py-3 font-medium">Transit</th>
                            <th className="text-center py-3 font-medium">OFD</th>
                            <th className="text-center py-3 font-medium text-emerald-500">Delivered</th>
                            <th className="text-center py-3 font-medium text-red-500">RTO</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                        {data.map((row) => (
                            <tr key={row.courier} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                                <td className="py-4 font-semibold text-gray-700 dark:text-gray-200">
                                    {row.courier}
                                </td>
                                <td className="py-4 text-center text-gray-500 dark:text-gray-400">
                                    {row.pending}
                                </td>
                                <td className="py-4 text-center text-gray-500 dark:text-gray-400">
                                    {row.in_transit}
                                </td>
                                <td className="py-4 text-center text-purple-600 dark:text-purple-400 font-medium">
                                    {row.out_for_delivery}
                                </td>
                                <td className="py-4 text-center">
                                    <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg font-bold">
                                        {row.delivered}
                                    </span>
                                </td>
                                <td className="py-4 text-center">
                                    <span className="px-2 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg font-bold">
                                        {row.rto}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

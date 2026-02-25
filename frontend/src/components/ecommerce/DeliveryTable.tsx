import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";

export default function DeliveryTable() {
    const [data, setData] = useState<any[]>([]);

    useEffect(() => {
        apiFetch('/api/delivery-table')
            .then(d => setData(d))
            .catch(err => console.error("Failed to fetch delivery table", err));
    }, []);

    if (!data.length) return null;

    return (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden dark:bg-gray-900 dark:border-gray-800">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                    <span className="font-semibold text-gray-700 text-xs sm:text-sm dark:text-gray-200">North</span>
                </div>
                <div className="flex gap-1 text-[10px] sm:text-xs text-gray-500 font-medium">
                    <span className="w-9 sm:w-11 text-center">South</span>
                    <span className="w-9 sm:w-11 text-center">West</span>
                    <span className="w-9 sm:w-11 text-center">East</span>
                </div>
            </div>

            {/* Rows */}
            {data.map((row, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    {/* Courier name */}
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                        <span className="w-3.5 h-3.5 text-gray-400 shrink-0">
                            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 truncate">{row.name}</span>
                    </div>
                    {/* Zone bars */}
                    <div className="flex gap-1 shrink-0">
                        <span className={`w-9 sm:w-11 py-1 text-center text-[10px] sm:text-xs font-semibold text-white/90 rounded-sm ${row.bgNorth}`}>{row.north}</span>
                        <span className={`w-9 sm:w-11 py-1 text-center text-[10px] sm:text-xs font-semibold text-white/90 rounded-sm ${row.bgSouth}`}>{row.south}</span>
                        <span className={`w-9 sm:w-11 py-1 text-center text-[10px] sm:text-xs font-semibold text-white/90 rounded-sm ${row.bgWest}`}>{row.west}</span>
                        <span className={`w-9 sm:w-11 py-1 text-center text-[10px] sm:text-xs font-semibold text-white/90 rounded-sm ${row.bgEast}`}>{row.east}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

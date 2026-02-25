import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";

export default function CourierPerformance() {
    const [metrics, setMetrics] = useState<any[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        apiFetch('/api/courier-performance')
            .then(data => setMetrics(data))
            .catch(err => console.error("Failed to load courier performance", err));
    }, []);

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm dark:bg-gray-900 dark:border-gray-800 relative">
            <div className="flex justify-between items-center mb-4 relative">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white/90">Courier Performance</h3>
                <div className="relative">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                        </svg>
                    </button>
                    {isMenuOpen && (
                        <div className="absolute top-6 right-0 w-32 bg-white border border-gray-100 rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700 z-50">
                            <ul className="py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-200">
                                <li><button onClick={() => setIsMenuOpen(false)} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700">Daily View</button></li>
                                <li><button onClick={() => setIsMenuOpen(false)} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700">Weekly View</button></li>
                                <li><button onClick={() => setIsMenuOpen(false)} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 text-purple-600">Export</button></li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {metrics.map((item, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm text-center relative overflow-hidden flex flex-col justify-start pb-10">
                        <div className="relative z-10 pt-3 sm:pt-4 px-1">
                            {/* Name — truncate on very small screens */}
                            <div className="text-gray-500 text-[10px] sm:text-xs mb-1 font-medium dark:text-gray-400 truncate">{item.name}</div>
                            {/* Value — scales from xl on mobile */}
                            <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-200">{item.value}</div>
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 h-[48px] w-full pointer-events-none">
                            <svg className="w-full h-full opacity-90" preserveAspectRatio="none" viewBox="0 0 100 50" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <linearGradient id={`grad-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                                        <stop offset="0%" className={item.fillColor} fill="currentColor" stopOpacity="0.2" />
                                        <stop offset="100%" className={item.fillColor} fill="currentColor" stopOpacity="0.0" />
                                    </linearGradient>
                                </defs>
                                <path d={item.path} fill={`url(#grad-${idx})`} />
                                <path d={item.line} fill="none" className={item.stroke} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

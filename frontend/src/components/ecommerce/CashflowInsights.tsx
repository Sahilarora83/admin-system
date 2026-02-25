import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";

export default function CashflowInsights() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        apiFetch('/api/cashflow-insights')
            .then(d => setData(d))
            .catch(err => console.error("Failed to load cashflow insights", err));
    }, []);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    if (!data) return null;

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm dark:bg-gray-900 dark:border-gray-800 relative">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white/90">Cashflow Insights</h3>
                </div>
                <div className="flex items-center gap-1 shrink-0 relative">
                    <button className="p-1 text-gray-400 hover:text-gray-600 border rounded transition">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </button>
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-1 text-gray-400 hover:text-gray-600 transition">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                    </button>

                    {isMenuOpen && (
                        <div className="absolute top-10 right-0 w-40 bg-white border border-gray-100 rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700 z-50">
                            <ul className="py-2 text-sm text-gray-700 dark:text-gray-200">
                                <li><button className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700">Refresh Data</button></li>
                                <li><button className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700">Export PDF</button></li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-purple-50/50 rounded-xl p-4 border border-purple-100/50 dark:bg-purple-900/10 dark:border-purple-800/30">
                <div className="flex items-center gap-2 mb-3">
                    <span className="w-6 h-6 rounded flex items-center justify-center bg-purple-100 text-purple-600 shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    </span>
                    <span className="font-semibold text-gray-700 text-sm dark:text-gray-200">{data.zoneCode}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
                    Your UP zone <strong className="text-gray-800 dark:text-gray-200 font-semibold">RTO is {data.rtoHigherBy} higher than average.</strong> We recommend analyzing this zone closely to mitigate potential risks.
                </p>

                {/* Bottom action row — stacks on very narrow screens */}
                <div className="flex flex-wrap items-center gap-3 mt-2">
                    <span className="text-sm text-gray-500 whitespace-nowrap">
                        You Save <span className="text-gray-800 dark:text-white/90 font-bold">₹{data.amountSaved}</span>
                    </span>
                    <div className="flex-grow h-1.5 rounded-full bg-gradient-to-r from-purple-100 to-purple-400 dark:from-purple-900 dark:to-purple-500 min-w-[40px]" />
                    <button
                        onClick={() => {
                            setIsAnalyzing(true);
                            setTimeout(() => setIsAnalyzing(false), 2000);
                        }}
                        className="text-purple-600 hover:text-purple-700 px-3 py-1.5 rounded-lg font-bold shadow-sm border border-purple-100 bg-white dark:bg-gray-800 dark:border-gray-700 transition-colors text-sm whitespace-nowrap flex items-center gap-2"
                        disabled={isAnalyzing}
                    >
                        {isAnalyzing ? (
                            <>
                                <span className="w-3 h-3 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin"></span>
                                Analyzing...
                            </>
                        ) : "Analyze Now"}
                    </button>
                </div>
            </div>
        </div>
    );
}

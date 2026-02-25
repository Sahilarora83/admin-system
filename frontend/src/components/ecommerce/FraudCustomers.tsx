import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";

export default function FraudCustomers() {
    const [customers, setCustomers] = useState<any[]>([]);

    useEffect(() => {
        apiFetch('/api/fraud-customers')
            .then(data => setCustomers(data))
            .catch(err => console.error("Failed to load fraud customers", err));
    }, []);

    return (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <div className="px-4 py-3 sm:px-5 flex justify-between items-center border-b border-gray-50 dark:border-gray-800/50">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white/90">Fraud &amp; Risk Customers</h3>
                <button
                    onClick={() => {
                        const allBlocked = customers.every(c => c.blocked);
                        setCustomers(customers.map(c => ({ ...c, blocked: !allBlocked })));
                    }}
                    className="text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 border px-2.5 py-1.5 rounded-lg shadow-sm border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center gap-1 shrink-0"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 11-12.728 0m12.728 0a9 9 0 00-12.728 0m12.728 0L5.636 18.364" /></svg>
                    Block All
                </button>
            </div>
            <div className="p-2">
                {customers.map((user, i) => (
                    <div key={i} className="flex items-center gap-2 px-2 py-2.5 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 rounded-xl transition">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full bg-gray-200 overflow-hidden shrink-0">
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        </div>

                        {/* Name + ID — takes available space */}
                        <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-800 text-xs sm:text-sm truncate dark:text-gray-200">{user.name}</div>
                            <div className="text-[10px] sm:text-xs text-gray-400 tabular-nums">{user.id} · {user.phone}</div>
                        </div>

                        {/* Risk badge */}
                        <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-md whitespace-nowrap shrink-0 ${user.riskColor}`}>
                            {user.risk}
                        </span>

                        {/* Arrow */}
                        <button
                            onClick={() => {
                                const newCustomers = [...customers];
                                newCustomers[i].blocked = !newCustomers[i].blocked;
                                setCustomers(newCustomers);
                            }}
                            className={`px-2 py-1 ml-2 text-xs font-semibold rounded-lg shadow-sm transition-colors shrink-0 ${user.blocked ? "bg-red-500 text-white hover:bg-red-600" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"}`}
                        >
                            {user.blocked ? "Blocked" : "Block"}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}


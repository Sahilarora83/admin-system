
const customers = [
    { name: "Ajay Sharma", id: "21333-22322", phone: "9878542210", risk: "High", riskColor: "text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400", avatar: "/images/user/user-01.jpg" },
    { name: "Priya Malhotra", id: "47943-37221", phone: "8766432109", risk: "Medium", riskColor: "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400", avatar: "/images/user/user-02.jpg" },
    { name: "Rahul Verma", id: "65087-77908", phone: "9988770655", risk: "High", riskColor: "text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400", avatar: "/images/user/user-03.jpg" }
];

export default function FraudCustomers() {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <div className="px-4 py-3 sm:px-5 flex justify-between items-center border-b border-gray-50 dark:border-gray-800/50">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white/90">Fraud &amp; Risk Customers</h3>
                <button className="text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 border px-2.5 py-1.5 rounded-lg shadow-sm border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 flex items-center gap-1 shrink-0">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 11-12.728 0m12.728 0a9 9 0 00-12.728 0m12.728 0L5.636 18.364" /></svg>
                    Block
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
                        <button className="p-1 rounded-lg bg-gray-50 border border-gray-100 dark:border-gray-700 dark:bg-gray-800 shrink-0">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

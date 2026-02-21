const metrics = [
    {
        name: "Delhivery",
        value: "28%",
        stroke: "text-purple-400",
        fillColor: "text-purple-400",
        path: "M0,35 C15,35 20,15 35,15 C50,15 55,40 70,40 C85,40 90,20 100,20 L100,50 L0,50 Z",
        line: "M0,35 C15,35 20,15 35,15 C50,15 55,40 70,40 C85,40 90,20 100,20"
    },
    {
        name: "Blue Dart",
        value: "17%",
        stroke: "text-blue-400",
        fillColor: "text-blue-400",
        path: "M0,20 C15,20 25,40 40,40 C55,40 65,15 80,15 C90,15 95,25 100,25 L100,50 L0,50 Z",
        line: "M0,20 C15,20 25,40 40,40 C55,40 65,15 80,15 C90,15 95,25 100,25"
    },
    {
        name: "Xpressbees",
        value: "28%",
        stroke: "text-purple-400",
        fillColor: "text-purple-400",
        path: "M0,30 C15,30 20,10 35,10 C50,10 60,40 75,40 C85,40 95,25 100,25 L100,50 L0,50 Z",
        line: "M0,30 C15,30 20,10 35,10 C50,10 60,40 75,40 C85,40 95,25 100,25"
    }
];

export default function CourierPerformance() {
    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white/90">Courier Performance</h3>
                <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                </button>
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

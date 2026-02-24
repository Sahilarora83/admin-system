import { VectorMap } from "@react-jvectormap/core";
import { inMill } from "@react-jvectormap/india";
import { useMemo, memo, useState, useEffect } from "react";

const PincodeRisk = memo(function PincodeRisk() {
    // Generate explicit color values for all states
    const mapData = useMemo(() => {
        const colors = [
            "#bbf7d0", // Very light green
            "#86efac", // Light green
            "#4ade80", // Green       
            "#fde047", // Yellow      
            "#fb923c", // Orange      
            "#f87171"  // Red         
        ];

        const paths = (inMill as any).content?.paths || (inMill as any).paths || {};

        return Object.keys(paths).reduce((acc: Record<string, string>, key) => {
            const seed = (key.charCodeAt(3) * 17 + key.charCodeAt(4) * 31);
            let colorIndex = 0;
            const rand = seed % 100;

            if (rand < 50) colorIndex = 0;
            else if (rand < 75) colorIndex = 1;
            else if (rand < 85) colorIndex = 2;
            else if (rand < 92) colorIndex = 3;
            else if (rand < 97) colorIndex = 4;
            else colorIndex = 5;

            acc[key] = colors[colorIndex];
            return acc;
        }, {});
    }, []);

    const [mounted, setMounted] = useState(false);
    const [pincodeData, setPincodeData] = useState<any>(null);

    useEffect(() => {
        setMounted(true);
        fetch('/api/pincode-risk')
            .then(res => res.json())
            .then(d => setPincodeData(d))
            .catch(err => console.error("Failed to fetch pincodes", err));
    }, []);

    if (!pincodeData) return null;

    return (
        <div className="flex flex-col gap-6">
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col dark:bg-gray-900 dark:border-gray-800">
                <div className="p-5">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white/90 mb-3">Pincode Risk Overview</h3>
                    <div className="flex flex-wrap gap-2 sm:gap-4 mb-3">
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#4ade80' }}></span><span className="text-xs text-gray-600 dark:text-gray-400">Low Risk</span></div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#fde047' }}></span><span className="text-xs text-gray-600 dark:text-gray-400">Medium Risk</span></div>
                        <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#f87171' }}></span><span className="text-xs text-gray-600 dark:text-gray-400">High Risk</span></div>
                    </div>

                    <div className="h-[220px] mb-2 relative rounded-xl overflow-hidden shrink-0 mt-2 w-full">
                        {mounted && (
                            <VectorMap
                                map={inMill}
                                backgroundColor="transparent"
                                zoomOnScroll={false}
                                regionStyle={{
                                    initial: {
                                        fill: "#e5e7eb",
                                        fillOpacity: 1,
                                        stroke: "#ffffff",
                                        strokeWidth: 0.5,
                                        strokeOpacity: 1
                                    },
                                    hover: {
                                        fillOpacity: 0.8,
                                        cursor: "pointer"
                                    }
                                }}
                                series={{
                                    regions: [
                                        {
                                            attribute: "fill",
                                            values: mapData as any
                                        }
                                    ]
                                }}
                                style={{ height: "100%", width: "100%", margin: "0 auto" }}
                            />
                        )}
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-2 py-2 px-1 mt-auto">
                        <span className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200">
                            <span className="text-red-500 font-bold">{pincodeData.highRiskCount}</span> Pincodes flagged as <span className="font-semibold">High Risk</span>
                        </span>
                        <button className="text-xs font-semibold text-gray-600 bg-white hover:bg-gray-50 border px-2.5 py-1.5 rounded-lg shadow-sm border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition shrink-0">Block &gt;</button>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col dark:bg-gray-900 dark:border-gray-800">
                <div className="p-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-800">
                    <span className="text-sm font-semibold text-gray-600 flex items-center gap-2 dark:text-gray-400"><span className="w-2 h-2 rounded-full bg-blue-500"></span> TTA RoCP Owners</span>
                    <button><svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg></button>
                </div>
                <div className="p-2 flex-grow">
                    {pincodeData.users.map((user: any, i: number) => (
                        <div key={i} className="flex items-center gap-2 p-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition">
                            <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden shrink-0">
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-800 text-xs sm:text-sm truncate dark:text-gray-200">{user.name}</div>
                                <div className="text-[10px] sm:text-xs text-gray-500 tabular-nums">{user.id}</div>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                                <span className={`px-2 py-0.5 text-[10px] sm:text-xs font-semibold rounded-md ${user.blocked ? "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"}`}>
                                    {user.blocked ? "Blocked" : "Risk"}
                                </span>
                                <button
                                    onClick={() => {
                                        const newUsers = [...pincodeData.users];
                                        newUsers[i].blocked = !newUsers[i].blocked;
                                        setPincodeData({ ...pincodeData, users: newUsers });
                                    }}
                                    className={`px-2 py-1 text-[10px] sm:text-xs font-semibold rounded shadow-sm border ${user.blocked ? "bg-red-500 text-white border-red-500 hover:bg-red-600" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700"}`}
                                >
                                    {user.blocked ? "Unblock" : "Block"}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
});

export default PincodeRisk;

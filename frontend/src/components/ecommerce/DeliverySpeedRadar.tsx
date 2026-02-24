import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";

export default function DeliverySpeedRadar() {
    const [series, setSeries] = useState<any[]>([]);
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    useEffect(() => {
        fetch('/api/delivery-speed')
            .then(res => res.json())
            .then(data => {
                setSeries([
                    { name: "Current", data: data.current },
                    { name: "Target", data: data.target }
                ]);
            })
            .catch(err => console.error("Failed to load delivery speed", err));
    }, []);

    const options: ApexOptions = {
        chart: { type: "radar", toolbar: { show: false }, dropShadow: { enabled: true, blur: 4, left: 1, top: 1, opacity: 0.1 } },
        colors: ["#8B5CF6", "#F472B6"],
        stroke: { width: 1.5 },
        fill: { opacity: 0.1 },
        markers: { size: 3, hover: { size: 5 } },
        xaxis: {
            categories: ["Speed", "On-Time", "Returns", "Damage", "Support"],
            labels: {
                show: true,
                style: { colors: Array(5).fill("#9CA3AF"), fontSize: "10px" }
            }
        },
        yaxis: { show: false, tickAmount: 4 },
        legend: {
            show: true,
            position: "bottom",
            horizontalAlign: "center",
            fontSize: "11px",
            labels: { colors: "#6B7280" }
        },
        plotOptions: { radar: { polygons: { strokeColors: "#e5e7eb", connectorColors: "#e5e7eb" } } },
        dataLabels: { enabled: false }
    };

    return (

        <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm dark:bg-gray-900 dark:border-gray-800 relative">

            <div className="flex justify-between items-start mb-1 relative">
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white/90">Delivery Speed</h3>
                    <span className="text-gray-400 text-xs">Total Last 7 days</span>
                </div>
                <div className="relative">
                    <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-gray-400 hover:text-gray-600 p-1 shrink-0 transition">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                    </button>
                    {isMenuOpen && (
                        <div className="absolute top-6 right-0 w-32 bg-white border border-gray-100 rounded-xl shadow-lg dark:bg-gray-800 dark:border-gray-700 z-50">
                            <ul className="py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-200">
                                <li><button onClick={() => setIsMenuOpen(false)} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700">Refresh Data</button></li>
                                <li><button onClick={() => setIsMenuOpen(false)} className="w-full text-left px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700">Download PDF</button></li>
                            </ul>
                        </div>
                    )}
                </div>
            </div>

            {/* Full-width radar — no fixed left sidebar */}
            <div className="-mx-2 -mb-2" style={{ height: 200 }}>
                <Chart options={options} series={series} type="radar" height="100%" width="100%" />
            </div>
        </div>
    );
}

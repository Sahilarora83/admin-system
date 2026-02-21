
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function DeliverySpeedRadar() {
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

    const series = [
        { name: "Current", data: [80, 50, 30, 40, 100] },
        { name: "Target", data: [20, 30, 40, 80, 50] }
    ];

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <div className="flex justify-between items-start mb-1">
                <div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white/90">Delivery Speed</h3>
                    <span className="text-gray-400 text-xs">Total Last 7 days</span>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-1 shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                </button>
            </div>

            {/* Full-width radar — no fixed left sidebar */}
            <div className="-mx-2 -mb-2" style={{ height: 200 }}>
                <Chart options={options} series={series} type="radar" height="100%" width="100%" />
            </div>
        </div>
    );
}

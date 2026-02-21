
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function NetRecoveryChart() {
    const options: ApexOptions = {
        chart: { type: "line", toolbar: { show: false }, zoom: { enabled: false } },
        colors: ["#8B5CF6", "#E5E7EB"],
        stroke: { curve: "smooth", width: [3, 2], dashArray: [0, 5] },
        markers: { size: [4, 0] },
        dataLabels: { enabled: false },
        xaxis: {
            categories: ["1:00 PM", "4:00 PM", "12:00 PM", "23:00 PM", "12:00 PM"],
            labels: { style: { colors: "#9CA3AF", fontSize: "10px" } }
        },
        yaxis: {
            labels: { style: { colors: "#9CA3AF", fontSize: "10px" } },
            min: 22500, max: 30000
        },
        grid: { borderColor: "#F3F4F6", strokeDashArray: 4 },
        legend: { show: false }
    };

    const series = [
        { name: "Current", data: [22500, 24000, 27500, 28000, 30000] },
        { name: "Target", data: [28000, 27000, 27500, 29000, 28500] }
    ];

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <div className="flex flex-col mb-2">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Net Recovery Potential</h3>
                <span className="text-gray-400 text-xs">Total Last 7 days</span>
            </div>
            <div className="-ml-2">
                <Chart options={options} series={series} type="line" height={180} />
            </div>
        </div>
    );
}

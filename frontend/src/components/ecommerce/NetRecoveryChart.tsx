import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";

export default function NetRecoveryChart() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        apiFetch('/api/net-recovery')
            .then(d => setData(d))
            .catch(err => console.error("Failed to fetch net recovery data", err));
    }, []);

    const options: ApexOptions = {
        chart: { type: "line", toolbar: { show: false }, zoom: { enabled: false } },
        colors: ["#8B5CF6", "#E5E7EB"],
        stroke: { curve: "smooth", width: [3, 2], dashArray: [0, 5] },
        markers: { size: [4, 0] },
        dataLabels: { enabled: false },
        xaxis: {
            categories: data?.categories || [],
            labels: { style: { colors: "#9CA3AF", fontSize: "10px" } }
        },
        yaxis: {
            labels: { style: { colors: "#9CA3AF", fontSize: "10px" } },
            min: 22500, max: 30000
        },
        grid: { borderColor: "#F3F4F6", strokeDashArray: 4 },
        legend: { show: false }
    };

    const series = data ? [
        { name: "Current", data: data.current },
        { name: "Target", data: data.target }
    ] : [];

    if (!data) return null;

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

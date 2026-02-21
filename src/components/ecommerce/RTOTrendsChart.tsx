
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { memo } from "react";

const RTOTrendsChart = memo(function RTOTrendsChart() {
    const options: ApexOptions = {
        chart: {
            type: "area",
            toolbar: { show: false },
            fontFamily: "inherit",
            zoom: { enabled: false },
        },
        colors: ["#8B5CF6", "#C4B5FD"], // Purple colors fitting the image
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.4,
                opacityTo: 0.05,
                stops: [0, 90, 100]
            }
        },
        dataLabels: { enabled: false },
        stroke: { curve: "smooth", width: 2 },
        xaxis: {
            categories: ["1:00 PM", "6:00 PM", "8:00 PM", "10:00 PM", "12:00 PM", "8:10 PM", "1:00 PM", "12:33 PM"],
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: {
                style: { colors: "#9CA3AF", fontSize: "11px" },
            },
        },
        yaxis: {
            labels: {
                style: { colors: "#9CA3AF", fontSize: "11px" },
                formatter: (val) => val.toFixed(2)
            },
        },
        grid: {
            borderColor: "#F3F4F6",
            strokeDashArray: 4,
            yaxis: { lines: { show: true } },
        },
        legend: { show: false },
    };

    const series = [
        {
            name: "RTO",
            data: [1.10, 2.00, 1.40, 1.25, 1.80, 2.40, 2.80, 2.90],
        },
        {
            name: "COD",
            data: [1.20, 1.50, 1.30, 1.50, 1.60, 1.90, 2.20, 2.10],
        }
    ];

    return (
        <div className="rounded-2xl border border-gray-100 bg-white p-5 py-6 md:p-6 shadow-sm dark:bg-gray-900 dark:border-gray-800">
            <div className="flex flex-col gap-2 mb-4">
                {/* Title row */}
                <div className="flex items-center justify-between">
                    <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white/90 font-sans">
                        Revenue &amp; RTO Trends
                    </h3>
                    <select className="bg-gray-50 border border-gray-200 text-gray-600 rounded-lg py-1 px-2 text-xs dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300">
                        <option>Last 7 days</option>
                        <option>Last 30 days</option>
                    </select>
                </div>
                {/* Legend row — always single line, wraps if needed */}
                <div className="flex items-center gap-3 text-xs flex-wrap">
                    <span className="flex items-center gap-1 text-purple-600 font-medium"><span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" /> RTO Orders</span>
                    <span className="flex items-center gap-1 text-green-500 font-medium"><span className="w-2 h-2 rounded-full bg-green-500 shrink-0" /> Delivered</span>
                    <span className="flex items-center gap-1 text-yellow-500 font-medium"><span className="w-2 h-2 rounded-full bg-yellow-500 shrink-0" /> COD %</span>
                </div>
            </div>

            <div className="-ml-3 h-[250px]">
                <Chart options={options} series={series} type="area" height="100%" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {[
                    {
                        icon: (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        ),
                        label: "Weekly Revenue",
                        value: "₹4.7L",
                        bg: "bg-gradient-to-br from-indigo-500 to-purple-500",
                        color: "text-white",
                        iconBg: "bg-white/20",
                        waveColor: "text-white/20",
                        textColor: "text-white",
                        labelColor: "text-white/80"
                    },
                    {
                        icon: (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                            </svg>
                        ),
                        label: "RTO Loss",
                        value: "₹91,300",
                        bg: "bg-white dark:bg-gray-800",
                        color: "text-pink-500",
                        iconBg: "bg-pink-50 dark:bg-pink-500/10",
                        gradient: "from-pink-100 to-transparent",
                        waveColor: "text-pink-300",
                        textColor: "text-gray-800 dark:text-white/90",
                        labelColor: "text-gray-500 dark:text-gray-400"
                    },
                    {
                        icon: (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        ),
                        label: "COD Rate",
                        value: "65%",
                        bg: "bg-white dark:bg-gray-800",
                        color: "text-emerald-500",
                        iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
                        gradient: "from-emerald-100 to-transparent",
                        waveColor: "text-emerald-300",
                        textColor: "text-gray-800 dark:text-white/90",
                        labelColor: "text-gray-500 dark:text-gray-400"
                    },
                    {
                        icon: (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        ),
                        label: "COD Rate",
                        value: "65%",
                        bg: "bg-white dark:bg-gray-800",
                        color: "text-cyan-500",
                        iconBg: "bg-cyan-50 dark:bg-cyan-500/10",
                        gradient: "from-cyan-100 to-transparent",
                        waveColor: "text-cyan-300",
                        textColor: "text-gray-800 dark:text-white/90",
                        labelColor: "text-gray-500 dark:text-gray-400"
                    },
                ].map((item, i) => (
                    <div key={i} className={`relative overflow-hidden flex gap-3 items-center rounded-2xl border border-gray-100 dark:border-gray-800 p-3 sm:p-4 shadow-sm ${item.bg}`}>
                        {item.gradient && (
                            <div className={`absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t ${item.gradient} opacity-30 dark:opacity-20`} />
                        )}
                        <svg className={`absolute bottom-0 left-0 w-full h-8 ${item.waveColor}`} preserveAspectRatio="none" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
                            <path fill="currentColor" fillOpacity={item.gradient ? "0.2" : "0.4"} d="M0,160L48,170.7C96,181,192,203,288,186.7C384,171,480,117,576,106.7C672,96,768,128,864,138.7C960,149,1056,139,1152,144C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
                        </svg>

                        <div className={`relative z-10 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex shrink-0 items-center justify-center ${item.iconBg} ${item.color}`}>
                            {item.icon}
                        </div>
                        <div className="relative z-10 min-w-0 flex-1">
                            <div className={`text-[10px] sm:text-xs font-medium mb-0.5 truncate ${item.labelColor}`}>{item.label}</div>
                            <div className={`font-bold text-sm sm:text-base md:text-lg leading-tight ${item.textColor}`}>{item.value}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
});

export default RTOTrendsChart;

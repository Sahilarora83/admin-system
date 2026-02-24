import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { memo, useEffect, useState } from "react";

const RTOTrendsChart = memo(function RTOTrendsChart() {
    const [data, setData] = useState<any>(null);

    useEffect(() => {
        fetch('/api/rto-trends')
            .then(res => res.json())
            .then(d => setData(d))
            .catch(err => console.error("Failed to fetch rto trends", err));
    }, []);

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
            categories: data?.categories || [],
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

    const series = data ? [
        {
            name: "RTO",
            data: data.rto,
        },
        {
            name: "COD",
            data: data.cod,
        }
    ] : [];

    if (!data) return null;

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
                {(data.stats || []).map((item: any, _i: number) => {
                    const bgColors: Record<string, string> = {
                        indigo: "bg-gradient-to-br from-indigo-500 to-purple-500",
                        pink: "bg-white dark:bg-gray-800",
                        emerald: "bg-white dark:bg-gray-800",
                        cyan: "bg-white dark:bg-gray-800"
                    };
                    const textColors: Record<string, string> = {
                        indigo: "text-white",
                        pink: "text-pink-500",
                        emerald: "text-emerald-500",
                        cyan: "text-cyan-500"
                    };
                    const iconBgs: Record<string, string> = {
                        indigo: "bg-white/20",
                        pink: "bg-pink-50 dark:bg-pink-500/10",
                        emerald: "bg-emerald-50 dark:bg-emerald-500/10",
                        cyan: "bg-cyan-50 dark:bg-cyan-500/10"
                    };
                    const gradients: Record<string, string> = {
                        indigo: "",
                        pink: "from-pink-100 to-transparent",
                        emerald: "from-emerald-100 to-transparent",
                        cyan: "from-cyan-100 to-transparent"
                    };
                    const waveColors: Record<string, string> = {
                        indigo: "text-white/20",
                        pink: "text-pink-300",
                        emerald: "text-emerald-300",
                        cyan: "text-cyan-300"
                    };
                    const titleColors: Record<string, string> = {
                        indigo: "text-white",
                        pink: "text-gray-800 dark:text-white/90",
                        emerald: "text-gray-800 dark:text-white/90",
                        cyan: "text-gray-800 dark:text-white/90"
                    };
                    const labelColors: Record<string, string> = {
                        indigo: "text-white/80",
                        pink: "text-gray-500 dark:text-gray-400",
                        emerald: "text-gray-500 dark:text-gray-400",
                        cyan: "text-gray-500 dark:text-gray-400"
                    };

                    const bg = bgColors[item.color];
                    const color = textColors[item.color];
                    const iconBg = iconBgs[item.color];
                    const gradient = gradients[item.color];
                    const waveColor = waveColors[item.color];
                    const textColor = titleColors[item.color];
                    const labelColor = labelColors[item.color];

                    const icon = item.color === 'indigo' || item.color === 'emerald' ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                    ) : item.color === 'pink' ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" /></svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                    );

                    return {
                        ...item,
                        bg, color, iconBg, gradient, waveColor, textColor, labelColor, icon
                    };
                }).map((item: any, i: number) => (
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

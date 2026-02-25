import { useEffect, useRef, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import flatpickr from "flatpickr";
import ChartTab from "../common/ChartTab";
import { CalenderIcon } from "../../icons";
import { apiFetch } from "../../utils/api";

export default function StatisticsChart() {
  const datePickerRef = useRef<HTMLInputElement>(null);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    apiFetch('/api/statistics')
      .then(d => setData(d))
      .catch(err => console.error("Failed to fetch statistics", err));
  }, []);

  useEffect(() => {
    if (!datePickerRef.current) return;
    const today = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(today.getDate() - 6);
    const fp = flatpickr(datePickerRef.current, {
      mode: "range",
      static: true,
      monthSelectorType: "static",
      dateFormat: "M d",
      defaultDate: [sevenDaysAgo, today],
      clickOpens: true,
      prevArrow: '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M12.5 15L7.5 10L12.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      nextArrow: '<svg class="stroke-current" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7.5 15L12.5 10L7.5 5" stroke="" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    });
    return () => { if (!Array.isArray(fp)) fp.destroy(); };
  }, []);

  const options: ApexOptions = {
    legend: { show: false, position: "top", horizontalAlign: "left" },
    colors: ["#465FFF", "#9CB9FF"],
    chart: { fontFamily: "Outfit, sans-serif", height: 260, type: "line", toolbar: { show: false } },
    stroke: { curve: "straight", width: [2, 2] },
    fill: { type: "gradient", gradient: { opacityFrom: 0.55, opacityTo: 0 } },
    markers: { size: 0, strokeColors: "#fff", strokeWidth: 2, hover: { size: 6 } },
    grid: { xaxis: { lines: { show: false } }, yaxis: { lines: { show: true } } },
    dataLabels: { enabled: false },
    tooltip: { enabled: true, x: { format: "dd MMM yyyy" } },
    xaxis: {
      type: "category",
      categories: data?.categories || [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      tooltip: { enabled: false },
      labels: { style: { fontSize: "10px", colors: "#9CA3AF" } }
    },
    yaxis: {
      labels: { style: { fontSize: "11px", colors: ["#6B7280"] } },
      title: { text: "", style: { fontSize: "0px" } },
    },
  };

  const series = data ? [
    { name: "Sales", data: data.sales },
    { name: "Revenue", data: data.revenue },
  ] : [];

  if (!data) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-4 pb-4 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-5 sm:pt-5">
      {/* Header — title wraps, controls on second line on mobile */}
      <div className="flex flex-col gap-3 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white/90">Statistics</h3>
          <p className="mt-0.5 text-gray-500 text-xs sm:text-sm dark:text-gray-400">Target you've set for each month</p>
        </div>
        {/* Controls row — always on one line, compact on mobile */}
        <div className="flex items-center gap-2">
          <ChartTab />
          {/* Calendar — icon-only on mobile, full input on lg+ */}
          <div className="relative inline-flex items-center ml-auto">
            <CalenderIcon className="absolute left-2 top-1/2 -translate-y-1/2 lg:left-3 size-4 text-gray-500 dark:text-gray-400 pointer-events-none z-10" />
            <input
              ref={datePickerRef}
              className="h-8 w-8 lg:w-36 lg:h-auto lg:pl-9 lg:pr-3 lg:py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-transparent lg:text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:lg:text-gray-300 cursor-pointer"
              placeholder="Select date"
            />
          </div>
        </div>
      </div>

      {/* Chart — scrollable on mobile */}
      <div className="overflow-x-auto">
        <div className="min-w-[480px] xl:min-w-full">
          <Chart options={options} series={series} type="area" height={260} />
        </div>
      </div>
    </div>
  );
}

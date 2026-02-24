import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { MoreDotIcon } from "../../icons";
import { useEffect, useState } from "react";

export default function MonthlySalesChart() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch('/api/monthly-sales')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(err => console.error("Failed to fetch monthly sales", err));
  }, []);

  const options: ApexOptions = {
    colors: ["#465fff"],
    chart: { fontFamily: "Outfit, sans-serif", type: "bar", height: 160, toolbar: { show: false } },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "45%", borderRadius: 4, borderRadiusApplication: "end" },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 3, colors: ["transparent"] },
    xaxis: {
      categories: data?.categories || [],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { fontSize: "9px", colors: "#9CA3AF" }, rotate: -30 }
    },
    legend: { show: false },
    yaxis: { title: { text: undefined }, labels: { style: { colors: "#9CA3AF", fontSize: "10px" } } },
    grid: { yaxis: { lines: { show: true } } },
    fill: { opacity: 1 },
    tooltip: { x: { show: false }, y: { formatter: (val: number) => `${val}` } },
  };

  const series = data ? [{ name: "Sales", data: data.sales }] : [];
  const [isOpen, setIsOpen] = useState(false);

  if (!data) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white px-4 pt-4 dark:border-gray-800 dark:bg-white/[0.03] sm:px-5 sm:pt-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base sm:text-lg font-semibold text-gray-800 dark:text-white/90">Monthly Sales</h3>
        <div className="relative inline-block">
          <button className="dropdown-toggle" onClick={() => setIsOpen(!isOpen)}>
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 size-5" />
          </button>
          <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-36 p-2">
            <DropdownItem onItemClick={() => setIsOpen(false)} className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">View More</DropdownItem>
            <DropdownItem onItemClick={() => setIsOpen(false)} className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300">Delete</DropdownItem>
          </Dropdown>
        </div>
      </div>

      {/* Chart — scrollable only if needed */}
      <div className="overflow-x-auto">
        <div className="min-w-[320px] xl:min-w-full -ml-3">
          <Chart options={options} series={series} type="bar" height={160} />
        </div>
      </div>
    </div>
  );
}

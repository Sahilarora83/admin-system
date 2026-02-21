import PageMeta from "../components/common/PageMeta";
import CashflowInsights from "../components/ecommerce/CashflowInsights";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

export default function Cashflow() {
  const options: ApexOptions = {
    chart: { type: "area", toolbar: { show: false }, zoom: { enabled: false }, fontFamily: "Outfit, sans-serif" },
    colors: ["#9ca3af", "#465fff"],
    stroke: { curve: "smooth", width: [2, 3], dashArray: [0, 4] },
    dataLabels: { enabled: false },
    fill: {
      type: "gradient",
      gradient: { opacityFrom: 0.15, opacityTo: 0 }
    },
    xaxis: {
      categories: ["Jan", "Feb", "Mar", "Apr", "May (Est)", "Jun (Est)"],
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: "#9CA3AF" }, rotate: -30 }
    },
    yaxis: { labels: { style: { colors: "#9CA3AF" } } },
    grid: { borderColor: "#F3F4F6", strokeDashArray: 4 },
    legend: { show: true, position: "top", horizontalAlign: "right" }
  };

  const series = [
    { name: "Historical Cashflow", data: [42000, 50000, 47000, 62000, null, null] },
    { name: "Predictive Recovery", data: [null, null, null, 62000, 78000, 95000] }
  ];

  return (
    <>
      <PageMeta title="RTOShield | Cashflow Insights" description="RTOShield Admin Dashboard" />
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 font-sans max-w-7xl mx-auto">
        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white/90">Cashflow &amp; Recovery</h2>
          <p className="text-gray-500 mt-1 text-sm dark:text-gray-400">Discover actionable insights to improve cashflow liquidity.</p>
        </div>

        {/* Stacks on mobile, sidebar + chart on md+ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 items-start">
          <CashflowInsights />

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 sm:p-6 shadow-sm flex flex-col lg:col-span-2">
            <h3 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white/90 mb-1">Predictive Cashflow Modeling</h3>
            <p className="text-sm text-gray-500 mb-4 dark:text-gray-400">Forecasted liquidity based on historical RTO losses and active recovery attempts.</p>
            <div className="-ml-3 mt-2" style={{ minHeight: 260 }}>
              <Chart options={options} series={series} type="area" height={280} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

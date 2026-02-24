import PageMeta from "../components/common/PageMeta";
import RTOMetrics from "../components/ecommerce/RTOMetrics";
import StatisticsChart from "../components/ecommerce/StatisticsChart";
import MonthlySalesChart from "../components/ecommerce/MonthlySalesChart";

export default function Metrics() {
  return (
    <>
      <PageMeta title="RTOShield | Metrics" description="RTOShield Admin Dashboard" />
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 font-sans max-w-7xl mx-auto">
        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white/90">Key Metrics Overview</h2>
          <p className="text-gray-500 mt-1 text-sm dark:text-gray-400">Detailed breakdown of key performance indicators.</p>
        </div>

        <div className="flex flex-col gap-4 md:gap-6">
          <RTOMetrics />

          {/* Charts: stacked on md and below, side-by-side on xl */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6">
            <div className="xl:col-span-8">
              <StatisticsChart />
            </div>
            <div className="xl:col-span-4">
              <MonthlySalesChart />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

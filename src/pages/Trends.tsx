import PageMeta from "../components/common/PageMeta";
import RTOTrendsChart from "../components/ecommerce/RTOTrendsChart";
import NetRecoveryChart from "../components/ecommerce/NetRecoveryChart";
import MonthlyTarget from "../components/ecommerce/MonthlyTarget";

export default function Trends() {
  return (
    <>
      <PageMeta title="RTOShield | Trends" description="RTOShield Admin Dashboard" />
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 font-sans max-w-7xl mx-auto">

        {/* Header — wraps on mobile */}
        <div className="mb-5 flex flex-wrap gap-3 items-start justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white/90">Revenue &amp; RTO Trends</h2>
            <p className="text-gray-500 mt-1 text-sm dark:text-gray-400">Track and analyze cash flow fluctuations over time.</p>
          </div>
          <button className="flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm shrink-0">
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Export PDF
          </button>
        </div>

        <div className="flex flex-col gap-4 md:gap-6">
          <RTOTrendsChart />

          {/* Bottom row: stacks on mobile, side-by-side on lg+ */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <NetRecoveryChart />
            <MonthlyTarget />
          </div>
        </div>
      </div>
    </>
  );
}

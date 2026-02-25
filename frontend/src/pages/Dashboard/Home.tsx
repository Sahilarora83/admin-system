import PageMeta from "../../components/common/PageMeta";
import RTOMetrics from "../../components/ecommerce/RTOMetrics";
import RTOTrendsChart from "../../components/ecommerce/RTOTrendsChart";
import NetRecoveryChart from "../../components/ecommerce/NetRecoveryChart";
import PincodeRisk from "../../components/ecommerce/PincodeRisk";
import CourierPerformance from "../../components/ecommerce/CourierPerformance";
import FraudCustomers from "../../components/ecommerce/FraudCustomers";
import DeliverySpeedRadar from "../../components/ecommerce/DeliverySpeedRadar";
import CashflowInsights from "../../components/ecommerce/CashflowInsights";
import DeliveryTable from "../../components/ecommerce/DeliveryTable";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { apiFetch } from "../../utils/api";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<string>("Checking...");

  useEffect(() => {
    apiFetch('/api/dashboard-stats')
      .then((data) => {
        if (data.is_mock) {
          setBackendStatus("Offline");
        } else {
          setBackendStatus("Connected ✓");
        }
      })
      .catch(() => setBackendStatus("Offline"));
  }, []);

  return (
    <>
      <PageMeta
        title="RTOShield | Dashboard"
        description="RTOShield Admin Dashboard"
      />

      <div className="p-3 sm:p-4 md:p-6 lg:p-8 font-sans">

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className={`text-sm font-medium px-3 py-1.5 rounded-lg inline-block ${backendStatus.includes("✓")
            ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
            : backendStatus === "Checking..."
              ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
              : "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
            }`}>
            Backend: {backendStatus}
          </div>

          <Link
            to="/orders"
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            Manage Orders
          </Link>
        </div>

        {/* Main Grid: stacks on mobile, 12-col on xl */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6">

          {/* LEFT COLUMN */}
          <div className="xl:col-span-8 flex flex-col gap-4 md:gap-6">
            <RTOMetrics />
            <RTOTrendsChart />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <PincodeRisk />
              <div className="flex flex-col gap-4 md:gap-6">
                <CourierPerformance />
                <FraudCustomers />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN — stacks below left on < xl */}
          <div className="xl:col-span-4 flex flex-col gap-4 md:gap-6">
            <NetRecoveryChart />
            <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:bg-gray-900 dark:border-gray-800 overflow-hidden flex flex-col [&>div>div]:border-none [&>div>div]:shadow-none [&>div>div]:rounded-none">
              <div>
                <DeliverySpeedRadar />
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800">
                <DeliveryTable />
              </div>
            </div>
            <CashflowInsights />
          </div>

        </div>
      </div>
    </>
  );
}

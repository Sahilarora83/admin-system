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

export default function Home() {
  return (
    <>
      <PageMeta
        title="RTOShield | Dashboard"
        description="RTOShield Admin Dashboard"
      />

      <div className="p-3 sm:p-4 md:p-6 lg:p-8 font-sans">
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

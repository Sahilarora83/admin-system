import PageMeta from "../components/common/PageMeta";
import CourierPerformance from "../components/ecommerce/CourierPerformance";
import DeliverySpeedRadar from "../components/ecommerce/DeliverySpeedRadar";
import DeliveryTable from "../components/ecommerce/DeliveryTable";

export default function Couriers() {
  return (
    <>
      <PageMeta title="RTOShield | Courier Analysis" description="RTOShield Admin Dashboard" />
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 font-sans max-w-7xl mx-auto">
        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white/90">Courier Analysis</h2>
          <p className="text-gray-500 mt-1 text-sm dark:text-gray-400">Evaluate delivery partner performance and speed metrics.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
          <CourierPerformance />
          <DeliverySpeedRadar />
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto">
          <DeliveryTable />
        </div>
      </div>
    </>
  );
}

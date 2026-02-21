import PageMeta from "../components/common/PageMeta";
import PincodeRisk from "../components/ecommerce/PincodeRisk";
import FraudCustomers from "../components/ecommerce/FraudCustomers";

export default function Frauds() {
  return (
    <>
      <PageMeta title="RTOShield | Fraud Customers" description="RTOShield Admin Dashboard" />
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 font-sans max-w-7xl mx-auto">
        <div className="mb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white/90">Fraud &amp; Risk Customers</h2>
          <p className="text-gray-500 mt-1 text-sm dark:text-gray-400">Monitor high-risk demographics and problematic areas.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 items-start">
          <PincodeRisk />
          <FraudCustomers />
        </div>
      </div>
    </>
  );
}

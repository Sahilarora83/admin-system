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
import { useEffect, useState, useRef } from "react";

export default function Home() {
  const [backendStatus, setBackendStatus] = useState<string>("Checking backend connection...");
  const [uploading, setUploading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // This fetches from the backend (localhost:5000 proxied via Vite config)
    fetch('/api/dashboard-stats')
      .then(res => res.json())
      .then(data => {
        console.log("Backend Link Successful! Data:", data);
        setBackendStatus("Connected to Backend!");
      })
      .catch(err => {
        console.error("Backend Link Failed:", err);
        setBackendStatus("Failed to connect to backend");
      });
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append('csv', file);

    try {
      const response = await fetch('/api/shopify/import', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        alert(result.message || "Shopify Report Imported Successfully! Dashboard updated with new data.");
      } else {
        alert("Upload failed: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload file due to a network error.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <PageMeta
        title="RTOShield | Dashboard"
        description="RTOShield Admin Dashboard"
      />

      <div className="p-3 sm:p-4 md:p-6 lg:p-8 font-sans">

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-lg inline-block">
            Backend Link: {backendStatus}
          </div>

          <div className="flex items-center gap-3">
            <input
              type="file"
              accept=".csv, .xlsx"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-70 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
            >
              {uploading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              )}
              {uploading ? "Importing Data..." : "Upload Shopify Report"}
            </button>
          </div>
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

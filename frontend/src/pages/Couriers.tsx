import { useEffect, useState } from "react";
import PageMeta from "../components/common/PageMeta";
import CourierPerformance from "../components/ecommerce/CourierPerformance";
import DeliverySpeedRadar from "../components/ecommerce/DeliverySpeedRadar";
import DeliveryTable from "../components/ecommerce/DeliveryTable";

import { apiFetch } from "../utils/api";

interface FunnelRow {
  courier: string;
  pending: number;
  in_transit: number;
  out_for_delivery: number;
  delivered: number;
  rto: number;
}

const STAGES = [
  { key: "pending", label: "Pending", color: "bg-yellow-400" },
  { key: "in_transit", label: "In Transit", color: "bg-blue-400" },
  { key: "out_for_delivery", label: "Out for Delivery", color: "bg-purple-400" },
  { key: "delivered", label: "Delivered", color: "bg-emerald-400" },
  { key: "rto", label: "RTO", color: "bg-red-400" },
] as const;

export default function Couriers() {
  const [funnel, setFunnel] = useState<FunnelRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/api/courier-funnel")
      .then(data => { setFunnel(data ?? []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);



  return (
    <>
      <PageMeta title="RTOShield | Courier Analysis" description="Courier performance and status funnel" />
      <div className="p-3 sm:p-4 md:p-6 lg:p-8 font-sans max-w-7xl mx-auto">

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Courier Analysis</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Delivery partner performance, speed metrics, and order status funnel.</p>
        </div>

        {/* ── Performance Charts ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
          <CourierPerformance />
          <DeliverySpeedRadar />
        </div>

        {/* ── Courier Status Funnel ───────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Courier Status Funnel</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Order flow per courier from pickup to final status</p>
            </div>
            {/* Legend */}
            <div className="hidden sm:flex items-center gap-3 flex-wrap justify-end">
              {STAGES.map(s => (
                <div key={s.key} className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                  <span className={`w-2.5 h-2.5 rounded-full ${s.color}`} />
                  {s.label}
                </div>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : funnel.length === 0 ? (
            <div className="py-16 text-center text-sm text-gray-400 dark:text-gray-500">
              No shipment data yet — dispatch orders to see the funnel
            </div>
          ) : (
            <div className="p-6 space-y-5">
              {funnel.map(row => {
                const total = row.pending + row.in_transit + row.out_for_delivery + row.delivered + row.rto;
                const rtoRate = total > 0 ? ((row.rto / total) * 100).toFixed(1) : "0.0";
                const delRate = total > 0 ? ((row.delivered / total) * 100).toFixed(1) : "0.0";

                return (
                  <div key={row.courier}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">{row.courier}</span>
                      <div className="flex items-center gap-3 text-xs">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">{delRate}% delivered</span>
                        <span className="text-red-500 dark:text-red-400 font-medium">{rtoRate}% RTO</span>
                        <span className="text-gray-400 dark:text-gray-500">{total.toLocaleString()} orders</span>
                      </div>
                    </div>

                    {/* Stacked bar */}
                    <div className="flex h-6 rounded-xl overflow-hidden w-full gap-px">
                      {STAGES.map(stage => {
                        const count = row[stage.key as keyof FunnelRow] as number;
                        const pct = total > 0 ? (count / total) * 100 : 0;
                        if (pct < 0.5) return null;
                        return (
                          <div
                            key={stage.key}
                            className={`${stage.color} flex items-center justify-center text-white text-[10px] font-bold transition-all`}
                            style={{ width: `${pct}%` }}
                            title={`${stage.label}: ${count}`}
                          >
                            {pct > 8 ? count.toLocaleString() : ""}
                          </div>
                        );
                      })}
                    </div>

                    {/* Count breakdown */}
                    <div className="flex gap-4 mt-1.5 flex-wrap">
                      {STAGES.map(stage => {
                        const count = row[stage.key as keyof FunnelRow] as number;
                        return (
                          <div key={stage.key} className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className={`w-2 h-2 rounded-full ${stage.color}`} />
                            {stage.label}: <span className="font-medium text-gray-700 dark:text-gray-300 ml-0.5">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── Delivery Table ──────────────────────────────────────────────── */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-x-auto">
          <DeliveryTable />
        </div>

      </div>
    </>
  );
}

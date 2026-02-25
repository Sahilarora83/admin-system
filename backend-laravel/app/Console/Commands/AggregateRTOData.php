<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class AggregateRTOData extends Command
{
    protected $signature = 'rto:aggregate {--date= : Date to aggregate (Y-m-d, default: today}';
    protected $description = 'Nightly aggregation: RTO stats, pincode summary, courier summary';

    public function handle(): int
    {
        $date = $this->option('date') ?? now()->toDateString();

        $this->info("Aggregating RTO data for {$date}...");

        $this->aggregateDailyRTO($date);
        $this->aggregatePincodeSummary();
        $this->aggregateCourierSummary();
        $this->updatePincodeRiskLevels();
        $this->updateCustomerRiskLevels();
        $this->sendHighRiskAlerts();

        $this->info('Done ✅');
        return 0;
    }

    // ── Daily / Weekly / Monthly RTO ─────────────────────────────────────────
    private function aggregateDailyRTO(string $date): void
    {
        $today = DB::table('orders')->whereDate('ordered_at', $date);

        $todayRTO = (clone $today)->where('status', 'rto')->count();
        $todayDelivered = (clone $today)->where('status', 'delivered')->count();
        $totalToday = (clone $today)->count();
        $codCollected = (clone $today)->where('payment_method', 'COD')->where('status', 'delivered')->sum('amount');
        $rtoLoss = (clone $today)->where('status', 'rto')->sum('amount');

        // Weekly (last 7 days from given date)
        $weeklyRTO = DB::table('orders')
            ->whereBetween('ordered_at', [now()->subDays(6)->startOfDay(), now()->endOfDay()])
            ->where('status', 'rto')->count();

        // Monthly
        $monthlyRTO = DB::table('orders')
            ->whereYear('ordered_at', now()->year)
            ->whereMonth('ordered_at', now()->month)
            ->where('status', 'rto')->count();

        DB::table('rto_aggregations')->updateOrInsert(
            ['date' => $date],
            [
                'today_rto' => $todayRTO,
                'weekly_rto' => $weeklyRTO,
                'monthly_rto' => $monthlyRTO,
                'today_delivered' => $todayDelivered,
                'total_orders_today' => $totalToday,
                'cod_collected_today' => $codCollected,
                'rto_loss_today' => $rtoLoss,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        $this->line("  Daily RTO: {$todayRTO} | Weekly: {$weeklyRTO} | Monthly: {$monthlyRTO}");
    }

    // ── Pincode Summary ───────────────────────────────────────────────────────
    private function aggregatePincodeSummary(): void
    {
        $pincodes = DB::table('orders')
            ->join('pincodes', 'orders.pincode_id', '=', 'pincodes.id')
            ->select(
                'pincodes.pincode',
                'orders.state',
                DB::raw('COUNT(*) as total'),
                DB::raw("SUM(CASE WHEN orders.status = 'rto' THEN 1 ELSE 0 END) as rto_count")
            )
            ->groupBy('pincodes.id', 'pincodes.pincode', 'orders.state')
            ->get();

        foreach ($pincodes as $p) {
            $pct = $p->total > 0 ? round(($p->rto_count / $p->total) * 100, 2) : 0;
            $risk = $pct >= 30 ? 'high' : ($pct >= 15 ? 'medium' : 'low');

            DB::table('pincode_summary')->updateOrInsert(
                ['pincode' => $p->pincode],
                [
                    'state' => $p->state,
                    'total_orders' => $p->total,
                    'rto_orders' => $p->rto_count,
                    'rto_percentage' => $pct,
                    'risk_level' => $risk,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }

        $this->line("  Pincode summary updated: {$pincodes->count()} pincodes");
    }

    // ── Courier Summary ───────────────────────────────────────────────────────
    private function aggregateCourierSummary(): void
    {
        $couriers = DB::table('shipments')
            ->whereNotNull('courier_name')
            ->select(
                'courier_name',
                DB::raw('COUNT(*) as total'),
                DB::raw("SUM(CASE WHEN current_status = 'DELIVERED' THEN 1 ELSE 0 END) as delivered"),
                DB::raw("SUM(CASE WHEN rto_flag = 1 THEN 1 ELSE 0 END) as rto_count"),
                DB::raw('AVG(DATEDIFF(delivered_at, shipped_at)) as avg_days')
            )
            ->groupBy('courier_name')
            ->get();

        foreach ($couriers as $c) {
            $rtoPct = $c->total > 0 ? round(($c->rto_count / $c->total) * 100, 2) : 0;

            DB::table('courier_summary')->updateOrInsert(
                ['courier_name' => $c->courier_name],
                [
                    'total_shipments' => $c->total,
                    'delivered_count' => $c->delivered,
                    'rto_count' => $c->rto_count,
                    'avg_delivery_days' => round($c->avg_days ?? 0, 1),
                    'rto_percentage' => $rtoPct,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }

        $this->line("  Courier summary updated: {$couriers->count()} couriers");
    }

    // ── Update Pincode Risk Levels in pincodes table ──────────────────────────
    private function updatePincodeRiskLevels(): void
    {
        DB::statement("
            UPDATE pincodes p
            JOIN pincode_summary ps ON p.pincode = ps.pincode
            SET p.rto_rate   = ps.rto_percentage,
                p.risk_level = ps.risk_level,
                p.total_orders = ps.total_orders,
                p.rto_orders   = ps.rto_orders
        ");

        $this->line('  Pincode risk levels updated');
    }

    // ── Update Customer Risk Levels ───────────────────────────────────────────
    private function updateCustomerRiskLevels(): void
    {
        // For each customer, recalculate RTO rate and set risk level
        DB::statement("
            UPDATE customers c
            JOIN (
                SELECT customer_id,
                       COUNT(*) as total_orders,
                       SUM(status = 'rto') as rto_count,
                       ROUND((SUM(status = 'rto') / COUNT(*)) * 100, 2) as rto_pct
                FROM orders
                GROUP BY customer_id
            ) o ON c.id = o.customer_id
            SET c.order_count = o.total_orders,
                c.rto_count   = o.rto_count,
                c.risk_level  = CASE
                    WHEN o.rto_pct >= 50 THEN 'High'
                    WHEN o.rto_pct >= 20 THEN 'Medium'
                    ELSE 'Low'
                END,
                c.is_fraud = CASE WHEN o.rto_pct >= 70 THEN 1 ELSE 0 END
        ");

        $this->line('  Customer risk levels updated');
    }

    // ── Send High Risk Pincode Alerts ─────────────────────────────────────────
    private function sendHighRiskAlerts(): void
    {
        $highRisk = DB::table('pincode_summary')
            ->where('risk_level', 'high')
            ->where('rto_percentage', '>=', 30)
            ->where('total_orders', '>=', 5) // Only flag if enough data
            ->get();

        foreach ($highRisk as $pin) {
            // Check for cluster: same pincode + multiple customers with RTO
            $clusterCount = DB::table('orders')
                ->join('pincodes', 'orders.pincode_id', '=', 'pincodes.id')
                ->where('pincodes.pincode', $pin->pincode)
                ->where('orders.status', 'rto')
                ->distinct('orders.customer_id')
                ->count('orders.customer_id');

            // Log notification (in production: send to notifications table / email)
            DB::table('notifications')->updateOrInsert(
                ['title' => "⚠ High Risk Pincode: {$pin->pincode}"],
                [
                    'message' => "RTO rate: {$pin->rto_percentage}% | {$pin->rto_orders}/{$pin->total_orders} orders | {$clusterCount} unique customers RTOed",
                    'is_read' => false,
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }

        $this->line("  High risk pincode alerts: {$highRisk->count()}");
    }
}

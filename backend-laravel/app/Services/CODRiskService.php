<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\DB;

class CODRiskService
{
    // Thresholds
    const HIGH_RISK = 60;
    const MEDIUM_RISK = 35;

    public function calculateScore(Order $order): array
    {
        $customer = $order->customer;

        // ── 40% Customer History ──────────────────────────────────────────────
        $custOrders = Order::where('customer_id', $customer->id)->count();
        $custRTOs = Order::where('customer_id', $customer->id)->where('status', 'rto')->count();
        $custRate = $custOrders > 0 ? ($custRTOs / $custOrders) * 100 : 15; // default 15%
        $custScore = min($custRate, 100) * 0.40;

        // ── 30% Pincode Risk ──────────────────────────────────────────────────
        $pincode = $order->pincode;
        $pincodeRate = $pincode ? (float) $pincode->rto_rate : 15;

        // Also check pincode_summary for aggregated data
        $pincodeSum = DB::table('pincode_summary')->where('pincode', $pincode?->pincode)->first();
        if ($pincodeSum) {
            $pincodeRate = (float) $pincodeSum->rto_percentage;
        }

        $pincodeScore = min($pincodeRate, 100) * 0.30;

        // ── 20% Courier Risk ──────────────────────────────────────────────────
        $courierRate = 15; // default avg
        if ($order->courier_name) {
            $summary = DB::table('courier_summary')->where('courier_name', $order->courier_name)->first();
            if ($summary)
                $courierRate = (float) $summary->rto_percentage;
        }
        $courierScore = min($courierRate, 100) * 0.20;

        // ── 10% Order Value Risk ──────────────────────────────────────────────
        // Higher COD value = higher non-delivery risk
        // Scale: ₹0 = 0, ₹5000 = 50, ₹10000+ = 100
        $valueScore = min(($order->amount / 100), 100) * 0.10;

        $total = round($custScore + $pincodeScore + $courierScore + $valueScore, 1);

        // ── Decision ──────────────────────────────────────────────────────────
        [$risk, $action, $actionLabel] = $this->decide($total, $order->payment_method);

        return [
            'score' => $total,
            'risk' => $risk,
            'action' => $action,
            'label' => $actionLabel,
            'breakdown' => [
                'customer_history' => round($custScore, 1),
                'pincode_risk' => round($pincodeScore, 1),
                'courier_risk' => round($courierScore, 1),
                'order_value' => round($valueScore, 1),
            ],
            'stats' => [
                'customer_orders' => $custOrders,
                'customer_rtos' => $custRTOs,
                'pincode_rto_pct' => round($pincodeRate, 1),
                'courier_rto_pct' => round($courierRate, 1),
            ],
        ];
    }

    private function decide(float $score, string $paymentMethod): array
    {
        if ($paymentMethod !== 'COD') {
            return ['low', 'allow', 'Prepaid — No COD Risk'];
        }
        if ($score >= self::HIGH_RISK) {
            return ['high', 'block_cod', 'Block COD — Request Prepaid'];
        }
        if ($score >= self::MEDIUM_RISK) {
            return ['medium', 'suggest_prepaid', 'Suggest Prepaid — High RTO Risk'];
        }
        return ['low', 'allow_cod', 'COD Allowed'];
    }

    /**
     * Bulk score for a list of order IDs — returns map of order_id → score
     */
    public function bulkScore(array $orderIds): array
    {
        $orders = Order::with(['customer', 'pincode'])->whereIn('id', $orderIds)->get();
        $result = [];
        foreach ($orders as $order) {
            try {
                $result[$order->id] = $this->calculateScore($order);
            } catch (\Exception $e) {
                $result[$order->id] = ['score' => 0, 'risk' => 'low', 'action' => 'allow_cod', 'label' => 'Unknown'];
            }
        }
        return $result;
    }
}

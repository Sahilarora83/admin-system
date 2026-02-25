<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Shipment;
use App\Models\ShipmentEvent;
use App\Services\ShiprocketService;
use App\Services\CODRiskService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ShiprocketController extends Controller
{
    public function __construct(
        private ShiprocketService $shiprocket,
        private CODRiskService $codRisk,
    ) {
    }

    // ── STEP 1: Initiate Dispatch ─────────────────────────────────────────────
    // Creates Shiprocket order, returns available couriers
    public function initiateDispatch(Request $request): JsonResponse
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'weight' => 'required|numeric|min:0.1',
            'length' => 'required|integer|min:1',
            'breadth' => 'required|integer|min:1',
            'height' => 'required|integer|min:1',
        ]);

        $order = Order::with(['customer', 'pincode'])->findOrFail($request->order_id);

        if ($order->status === 'delivered') {
            return response()->json(['error' => 'Order already delivered'], 422);
        }

        $dims = $request->only(['weight', 'length', 'breadth', 'height']);

        try {
            // Call Shiprocket to create order
            $srResponse = $this->shiprocket->createOrder($order, $dims);

            $shiprocketOrderId = $srResponse['order_id'] ?? null;
            $shiprocketShipmentId = $srResponse['shipment_id'] ?? null;

            // Save/update shipment record with dimensions
            $shipment = Shipment::updateOrCreate(
                ['order_id' => $order->id],
                [
                    'shiprocket_order_id' => $shiprocketOrderId,
                    'shiprocket_shipment_id' => $shiprocketShipmentId,
                    'weight' => $dims['weight'],
                    'length' => $dims['length'],
                    'breadth' => $dims['breadth'],
                    'height' => $dims['height'],
                    'expected_cod_amount' => $order->payment_method === 'COD' ? $order->amount : 0,
                ]
            );

            // Get available couriers for this delivery pincode
            $deliveryPincode = $order->pincode?->pincode ?? '';
            $couriers = $this->shiprocket->getAvailableCouriers(
                $deliveryPincode,
                $dims['weight'],
                $order->payment_method === 'COD' ? $order->amount : 0
            );

            return response()->json([
                'shipment_id' => $shipment->id,
                'shiprocket_shipment_id' => $shiprocketShipmentId,
                'couriers' => $couriers,
            ]);
        } catch (\Exception $e) {
            Log::error('[Shiprocket Dispatch] ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ── STEP 2: Confirm Courier & Get AWB ─────────────────────────────────────
    public function confirmDispatch(Request $request): JsonResponse
    {
        $request->validate([
            'shipment_id' => 'required|exists:shipments,id',
            'courier_id' => 'required|integer',
            'courier_name' => 'required|string',
        ]);

        $shipment = Shipment::with('order')->findOrFail($request->shipment_id);

        try {
            $awbResponse = $this->shiprocket->assignAWB(
                $shipment->shiprocket_shipment_id,
                $request->courier_id
            );

            $awb = $awbResponse['response']['data']['awb_code'] ?? null;
            $shippingCost = $awbResponse['response']['data']['applied_weight'] ?? null;

            // Update shipment
            $shipment->update([
                'courier_id' => $request->courier_id,
                'courier_name' => $request->courier_name,
                'awb_code' => $awb,
                'shipping_cost' => $shippingCost,
                'current_status' => 'PICKUP_PENDING',
                'shipped_at' => now(),
            ]);

            // Update the parent order
            $shipment->order->update([
                'status' => 'in_transit',
                'courier_name' => $request->courier_name,
                'awb_code' => $awb,
                'shipped_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'awb_code' => $awb,
                'courier_name' => $request->courier_name,
            ]);
        } catch (\Exception $e) {
            Log::error('[Shiprocket Confirm] ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    // ── Shiprocket Webhook Handler ─────────────────────────────────────────────
    // Configure this URL in Shiprocket panel: POST /api/webhook/shiprocket
    public function handleWebhook(Request $request): JsonResponse
    {
        // Verify HMAC signature (Shiprocket sends X-Shiprocket-Hmac-Sha256 header)
        $secret = config('services.shiprocket.webhook_secret');
        $signature = $request->header('X-Shiprocket-Hmac-Sha256');
        if ($secret && $signature) {
            $computed = hash_hmac('sha256', $request->getContent(), $secret);
            if (!hash_equals($computed, $signature)) {
                Log::warning('[Webhook] Invalid Shiprocket signature');
                return response()->json(['error' => 'Invalid signature'], 401);
            }
        }

        $payload = $request->all();
        Log::info('[Shiprocket Webhook]', $payload);

        $awb = $payload['awb'] ?? $payload['awb_code'] ?? null;
        $status = $payload['current_status'] ?? $payload['status'] ?? null;

        if (!$awb || !$status) {
            return response()->json(['ok' => true]); // Ignore non-tracking pings
        }

        // ── Map Shiprocket status → our status ────────────────────────────────
        $statusMap = [
            'SHIPPED' => 'in_transit',
            'IN_TRANSIT' => 'in_transit',
            'OUT_FOR_DELIVERY' => 'out_for_delivery',
            'DELIVERED' => 'delivered',
            'RTO' => 'rto',
            'RTO INITIATED' => 'rto',
            'RTO_DELIVERED' => 'rto',
            'UNDELIVERED' => 'in_transit',
            'PICKUP PENDING' => 'pending',
        ];

        $mappedStatus = $statusMap[strtoupper($status)] ?? 'in_transit';
        $location = $payload['location'] ?? $payload['city'] ?? null;
        $eventAt = $payload['timestamp'] ?? now()->toDateTimeString();

        // ── Find shipment by AWB ──────────────────────────────────────────────
        $shipment = Shipment::where('awb_code', $awb)->first();
        if (!$shipment) {
            // Try finding by order awb_code column
            $order = Order::where('awb_code', $awb)->first();
            if ($order) {
                $shipment = Shipment::where('order_id', $order->id)->first();
            }
        }

        if ($shipment) {
            $updateData = ['current_status' => strtoupper($status)];
            if ($mappedStatus === 'delivered') {
                $updateData['delivered_at'] = $eventAt;
            }
            if ($mappedStatus === 'rto') {
                $updateData['rto_flag'] = true;
            }
            if (str_contains(strtolower($status), 'undelivered') || str_contains(strtolower($status), 'failed')) {
                $updateData['attempt_count'] = $shipment->attempt_count + 1;
            }
            $shipment->update($updateData);

            // Update parent order status
            $shipment->order->update([
                'status' => $mappedStatus,
                'delivered_at' => $mappedStatus === 'delivered' ? $eventAt : $shipment->order->delivered_at,
                'attempt_count' => $updateData['attempt_count'] ?? $shipment->order->attempt_count,
            ]);
        }

        // ── Store event ───────────────────────────────────────────────────────
        $orderId = $shipment?->order_id ?? Order::where('awb_code', $awb)->value('id');
        if ($orderId) {
            ShipmentEvent::create([
                'order_id' => $orderId,
                'awb_code' => $awb,
                'status' => $status,
                'location' => $location,
                'event_at' => $eventAt,
                'raw_payload' => json_encode($payload),
            ]);
        }

        return response()->json(['ok' => true]);
    }

    // ── List Shipments ─────────────────────────────────────────────────────────
    public function listShipments(Request $request): JsonResponse
    {
        $page = (int) ($request->page ?? 1);
        $perPage = (int) ($request->per_page ?? 20);
        $status = $request->status;

        $query = DB::table('shipments')
            ->join('orders', 'shipments.order_id', '=', 'orders.id')
            ->join('customers', 'orders.customer_id', '=', 'customers.id')
            ->select(
                'shipments.*',
                'orders.shopify_order_id',
                'orders.amount',
                'orders.payment_method',
                'orders.state',
                'orders.city',
                'customers.name as customer_name',
                'customers.phone as customer_phone',
            )
            ->orderBy('shipments.created_at', 'desc');

        if ($status) {
            $query->where('shipments.current_status', 'like', "%$status%");
        }

        $total = $query->count();
        $shipments = $query->skip(($page - 1) * $perPage)->take($perPage)->get();

        return response()->json([
            'data' => $shipments,
            'total' => $total,
            'page' => $page,
            'total_pages' => ceil($total / $perPage),
        ]);
    }

    // ── Courier Status Funnel ──────────────────────────────────────────────────
    public function courierFunnel(): JsonResponse
    {
        $funnelStatuses = [
            'Pending' => ['PICKUP_PENDING', 'PICKUP_QUEUED', 'pending'],
            'In Transit' => ['in_transit', 'IN_TRANSIT', 'SHIPPED'],
            'Out for Delivery' => ['out_for_delivery', 'OUT_FOR_DELIVERY'],
            'Delivered' => ['delivered', 'DELIVERED'],
            'RTO' => ['rto', 'RTO', 'RTO INITIATED', 'RTO_DELIVERED'],
        ];

        $couriers = DB::table('shipments')
            ->whereNotNull('courier_name')
            ->select('courier_name')
            ->distinct()
            ->pluck('courier_name');

        if ($couriers->isEmpty()) {
            // Return demo funnel data
            return response()->json([
                ['courier' => 'Delhivery', 'pending' => 34, 'in_transit' => 120, 'out_for_delivery' => 45, 'delivered' => 380, 'rto' => 67],
                ['courier' => 'Blue Dart', 'pending' => 12, 'in_transit' => 88, 'out_for_delivery' => 31, 'delivered' => 290, 'rto' => 29],
                ['courier' => 'Xpressbees', 'pending' => 28, 'in_transit' => 95, 'out_for_delivery' => 28, 'delivered' => 210, 'rto' => 55],
                ['courier' => 'Ecom Express', 'pending' => 19, 'in_transit' => 74, 'out_for_delivery' => 22, 'delivered' => 175, 'rto' => 41],
            ]);
        }

        return response()->json($couriers->map(function ($courier) use ($funnelStatuses) {
            $row = ['courier' => $courier];
            foreach ($funnelStatuses as $label => $statuses) {
                $key = strtolower(str_replace(' ', '_', $label));
                $row[$key] = DB::table('shipments')
                    ->where('courier_name', $courier)
                    ->whereIn('current_status', $statuses)
                    ->count();
            }
            return $row;
        }));
    }

    // ── COD Risk Score ────────────────────────────────────────────────────────
    public function codRiskScore(int $orderId): JsonResponse
    {
        $order = Order::with(['customer', 'pincode'])->findOrFail($orderId);
        return response()->json($this->codRisk->calculateScore($order));
    }

    // ── COD Risk Bulk ─────────────────────────────────────────────────────────
    public function codRiskBulk(Request $request): JsonResponse
    {
        $ids = $request->validate(['ids' => 'required|array', 'ids.*' => 'integer'])['ids'];
        return response()->json($this->codRisk->bulkScore($ids));
    }

    // ── Manual Tracking Sync (cron fallback) ──────────────────────────────────
    // GET /api/shipments/sync — triggers manual sync for pending shipments
    public function syncTracking(): JsonResponse
    {
        $pending = Shipment::whereNotIn('current_status', ['DELIVERED', 'RTO_DELIVERED'])
            ->whereNotNull('awb_code')
            ->take(50) // Batch of 50
            ->get();

        $updated = 0;
        foreach ($pending as $shipment) {
            try {
                $trackData = $this->shiprocket->trackByAWB($shipment->awb_code);
                $status = $trackData['tracking_data']['shipment_status'] ?? null;
                if ($status) {
                    $shipment->update(['current_status' => $status]);
                    $updated++;
                }
            } catch (\Exception $e) {
                Log::warning("[Sync] AWB {$shipment->awb_code}: " . $e->getMessage());
            }
        }

        return response()->json(['synced' => $updated, 'total_checked' => $pending->count()]);
    }
}

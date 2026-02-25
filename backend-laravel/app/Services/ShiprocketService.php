<?php

namespace App\Services;

use App\Models\Order;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ShiprocketService
{
    private string $base = 'https://apiv2.shiprocket.in/v1/external';

    // ── Auth ──────────────────────────────────────────────────────────────────
    private function token(): string
    {
        return Cache::remember('shiprocket_jwt', 82800, function () {
            $res = Http::post("{$this->base}/auth/login", [
                'email' => config('services.shiprocket.email'),
                'password' => config('services.shiprocket.password'),
            ]);
            if ($res->failed()) {
                throw new \Exception('Shiprocket auth failed: ' . $res->body());
            }
            return $res->json()['token'];
        });
    }

    private function http()
    {
        return Http::withToken($this->token());
    }

    // ── Create Order on Shiprocket ────────────────────────────────────────────
    public function createOrder(Order $order, array $dims): array
    {
        $customer = $order->customer;
        $pincode = $order->pincode?->pincode ?? '';
        $lineItems = is_array($order->line_items) ? $order->line_items : json_decode($order->line_items ?? '[]', true);

        $payload = [
            'order_id' => $order->shopify_order_id,
            'order_date' => now()->format('Y-m-d H:i'),
            'pickup_location' => config('services.shiprocket.pickup_location', 'Primary'),
            'billing_customer_name' => $customer->name ?? 'Customer',
            'billing_address' => $order->city ?? 'Address',
            'billing_city' => $order->city ?? '',
            'billing_pincode' => $pincode,
            'billing_state' => $order->state ?? '',
            'billing_country' => 'India',
            'billing_email' => $customer->email ?? '',
            'billing_phone' => $customer->phone ?? '',
            'shipping_is_billing' => true,
            'order_items' => collect($lineItems)->map(fn($i) => [
                'name' => $i['name'] ?? 'Item',
                'units' => $i['quantity'] ?? 1,
                'selling_price' => $i['price'] ?? 0,
                'sku' => $i['sku'] ?? '',
            ])->toArray(),
            'payment_method' => $order->payment_method === 'COD' ? 'COD' : 'Prepaid',
            'sub_total' => $order->amount,
            'length' => $dims['length'],
            'breadth' => $dims['breadth'],
            'height' => $dims['height'],
            'weight' => $dims['weight'],
        ];

        $res = $this->http()->post("{$this->base}/orders/create/adhoc", $payload);

        Log::info('[Shiprocket] Create order response', ['status' => $res->status(), 'body' => $res->json()]);

        if ($res->failed()) {
            throw new \Exception('Shiprocket create order failed: ' . $res->body());
        }

        return $res->json();
    }

    // ── Get Available Couriers ─────────────────────────────────────────────────
    public function getAvailableCouriers(string $deliveryPincode, float $weight, float $codAmount = 0): array
    {
        $pickupPincode = config('services.shiprocket.pickup_pincode', '110001');

        $res = $this->http()->get("{$this->base}/courier/serviceability/", [
            'pickup_postcode' => $pickupPincode,
            'delivery_postcode' => $deliveryPincode,
            'weight' => $weight,
            'cod' => $codAmount > 0 ? 1 : 0,
        ]);

        if ($res->failed()) {
            Log::error('[Shiprocket] Get couriers failed', ['body' => $res->body()]);
            return [];
        }

        $couriers = $res->json()['data']['available_courier_companies'] ?? [];

        // Return only what the frontend needs
        return collect($couriers)->map(fn($c) => [
            'courier_id' => $c['courier_company_id'],
            'courier_name' => $c['courier_name'],
            'rate' => $c['rate'] ?? 0,
            'etd' => $c['etd'] ?? '',
            'cod' => $c['cod'] ?? 0,
            'rating' => $c['rating'] ?? 0,
        ])->toArray();
    }

    // ── Assign AWB (Confirm Courier Selection) ────────────────────────────────
    public function assignAWB(string $shiprocketShipmentId, int $courierId): array
    {
        $res = $this->http()->post("{$this->base}/courier/assign/awb", [
            'shipment_id' => $shiprocketShipmentId,
            'courier_id' => $courierId,
        ]);

        if ($res->failed()) {
            throw new \Exception('Assign AWB failed: ' . $res->body());
        }

        return $res->json();
    }

    // ── Track by AWB ──────────────────────────────────────────────────────────
    public function trackByAWB(string $awb): array
    {
        $res = $this->http()->get("{$this->base}/courier/track/awb/{$awb}");
        return $res->json();
    }

    // ── Refresh Token (call if 401) ───────────────────────────────────────────
    public function refreshToken(): void
    {
        Cache::forget('shiprocket_jwt');
        $this->token();
    }
}

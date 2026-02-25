<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Customer;
use App\Models\Courier;
use App\Models\Pincode;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;

class ShopifyImportController extends Controller
{
    /**
     * CSV Upload Handler — Parses Shopify order export CSV and upserts into DB
     */
    public function upload(Request $request): JsonResponse
    {
        $request->validate([
            'csv' => 'required|file|mimes:csv,txt'
        ]);

        $file = $request->file('csv');
        $path = $file->getRealPath();
        $result = $this->parseCsvAndImport($path);

        return response()->json($result, $result['success'] ? 200 : 500);
    }

    /**
     * Shopify API Connect — Exchange store + token and pull orders directly
     */
    public function connectShopify(Request $request): JsonResponse
    {
        $request->validate([
            'shop_domain' => 'required|string',   // e.g. mystore.myshopify.com
            'access_token' => 'required|string',
            'limit' => 'nullable|integer|min:1|max:250',
        ]);

        $domain = rtrim($request->shop_domain, '/');
        $token = $request->access_token;
        $limit = $request->limit ?? 250;

        try {
            $response = Http::withHeaders([
                'X-Shopify-Access-Token' => $token,
                'Content-Type' => 'application/json',
            ])->get("https://{$domain}/admin/api/2024-01/orders.json", [
                        'status' => 'any',
                        'limit' => $limit,
                    ]);

            if ($response->failed()) {
                return response()->json([
                    'success' => false,
                    'error' => 'Shopify API returned: ' . $response->status() . ' ' . $response->body()
                ], 422);
            }

            $orders = $response->json()['orders'] ?? [];
            $counts = ['inserted' => 0, 'updated' => 0, 'skipped' => 0];

            DB::beginTransaction();
            foreach ($orders as $o) {
                $this->upsertShopifyOrder($o, $counts);
            }
            DB::commit();

            // Save credentials for future syncs
            \DB::table('shopify_connections')->updateOrInsert(
                ['shop_domain' => $domain],
                [
                    'access_token' => $token,
                    'last_synced_at' => now(),
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );

            return response()->json([
                'success' => true,
                'message' => "Shopify sync complete.",
                'inserted' => $counts['inserted'],
                'updated' => $counts['updated'],
                'skipped' => $counts['skipped'],
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[Shopify Connect] ' . $e->getMessage());
            return response()->json(['success' => false, 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * List Orders from DB (paginated)
     */
    public function orders(Request $request): JsonResponse
    {
        $page = (int) ($request->page ?? 1);
        $perPage = (int) ($request->per_page ?? 25);
        $status = $request->status;
        $search = $request->search;

        $query = DB::table('orders')
            ->join('customers', 'orders.customer_id', '=', 'customers.id')
            ->leftJoin('pincodes', 'orders.pincode_id', '=', 'pincodes.id')
            ->select(
                'orders.id',
                'orders.shopify_order_id',
                'orders.amount',
                'orders.payment_method',
                'orders.status',
                'orders.rto_status',
                'orders.created_at',
                'customers.email as customer_email',
                'customers.phone as customer_phone',
                'customers.name as customer_name',
                'pincodes.pincode',
                'pincodes.risk_level as pincode_risk',
                'orders.state',
                'orders.city',
                'orders.fulfillment_status',
                'orders.shopify_risk_level',
                'orders.line_items'
            )
            ->orderBy('orders.created_at', 'desc');

        if ($status) {
            $query->where('orders.status', $status);
        }
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('orders.shopify_order_id', 'like', "%$search%")
                    ->orWhere('customers.email', 'like', "%$search%")
                    ->orWhere('customers.phone', 'like', "%$search%")
                    ->orWhere('customers.name', 'like', "%$search%");
            });
        }

        $total = $query->count();
        $orders = $query->skip(($page - 1) * $perPage)->take($perPage)->get();

        return response()->json([
            'data' => $orders,
            'total' => $total,
            'page' => $page,
            'per_page' => $perPage,
            'total_pages' => ceil($total / $perPage),
        ]);
    }

    /**
     * Get saved Shopify connection
     */
    public function getConnection(): JsonResponse
    {
        $conn = DB::table('shopify_connections')->first();
        if ($conn) {
            return response()->json([
                'connected' => true,
                'shop_domain' => $conn->shop_domain,
                'last_synced_at' => $conn->last_synced_at,
            ]);
        }
        return response()->json(['connected' => false]);
    }

    // ─── Internal Helpers ──────────────────────────────────────────────────────

    private function parseCsvAndImport(string $path): array
    {
        $handle = fopen($path, "r");
        $header = fgetcsv($handle, 4096, ",");

        if (!$header) {
            fclose($handle);
            return ['success' => false, 'error' => 'Could not read CSV header'];
        }

        // Normalize header keys
        $header = array_map('trim', $header);

        $counts = ['inserted' => 0, 'updated' => 0, 'skipped' => 0];

        // Group rows by order ID (Shopify repeats rows for multi-item orders)
        $grouped = [];
        while (($row = fgetcsv($handle, 4096, ",")) !== false) {
            if (count($header) !== count($row))
                continue;
            $item = array_combine($header, $row);
            $orderId = trim($item['Name'] ?? '');
            if (!$orderId)
                continue;
            if (!isset($grouped[$orderId])) {
                $grouped[$orderId] = $item; // First row has order-level data
                $grouped[$orderId]['_line_items'] = [];
            }
            $grouped[$orderId]['_line_items'][] = [
                'name' => $item['Lineitem name'] ?? '',
                'quantity' => $item['Lineitem quantity'] ?? 1,
                'price' => $item['Lineitem price'] ?? 0,
                'sku' => $item['Lineitem sku'] ?? '',
                'status' => $item['Lineitem fulfillment status'] ?? '',
            ];
        }
        fclose($handle);

        DB::beginTransaction();
        try {
            foreach ($grouped as $orderId => $row) {
                $this->upsertFromCsvRow($orderId, $row, $counts);
            }
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('[CSV Import] ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }

        return [
            'success' => true,
            'message' => "Import complete.",
            'inserted' => $counts['inserted'],
            'updated' => $counts['updated'],
            'skipped' => $counts['skipped'],
        ];
    }

    private function upsertFromCsvRow(string $shopifyOrderId, array $row, array &$counts): void
    {
        $email = trim($row['Email'] ?? '');
        $phone = $this->normalizePhone($row['Shipping Phone'] ?? $row['Phone'] ?? '');
        $name = trim($row['Billing Name'] ?? $row['Shipping Name'] ?? '');

        $customer = Customer::firstOrCreate(
            ['email' => $email ?: null],
            ['phone' => $phone, 'name' => $name]
        );
        if ($phone && !$customer->phone) {
            $customer->update(['phone' => $phone]);
        }

        $rawPincode = $this->cleanPincode($row['Shipping Zip'] ?? '');
        $pincodeId = null;
        if ($rawPincode) {
            $pinObj = Pincode::firstOrCreate(['pincode' => $rawPincode]);
            $pincodeId = $pinObj->id;
        }

        // Derive payment method
        $paymentMethod = 'COD';
        $paymentColRaw = strtolower($row['Payment Method'] ?? '');
        if (str_contains($paymentColRaw, 'razorpay') || str_contains($paymentColRaw, 'upi') || str_contains($paymentColRaw, 'prepaid')) {
            $paymentMethod = 'Prepaid';
        } elseif ($row['Financial Status'] === 'paid') {
            $paymentMethod = 'Prepaid';
        }

        $amount = (float) ($row['Total'] ?? $row['Subtotal'] ?? 0);

        // Map Shopify fulfillment status -> internal status
        $fulfillStatus = strtolower($row['Fulfillment Status'] ?? '');
        $status = 'pending';
        if ($fulfillStatus === 'fulfilled')
            $status = 'delivered';
        if ($fulfillStatus === 'unfulfilled')
            $status = 'pending';

        $lineItems = json_encode($row['_line_items'] ?? []);

        $existing = Order::where('shopify_order_id', $shopifyOrderId)->first();
        $payload = [
            'customer_id' => $customer->id,
            'pincode_id' => $pincodeId,
            'amount' => $amount,
            'payment_method' => $paymentMethod,
            'status' => $status,
            'state' => trim($row['Shipping Province Name'] ?? $row['Shipping Province'] ?? ''),
            'city' => trim($row['Shipping City'] ?? ''),
            'fulfillment_status' => $row['Fulfillment Status'] ?? '',
            'shopify_risk_level' => $row['Risk Level'] ?? '',
            'line_items' => $lineItems,
            'ordered_at' => $this->parseDate($row['Created at'] ?? ''),
        ];

        if ($existing) {
            $existing->update($payload);
            $counts['updated']++;
        } else {
            Order::create(array_merge(['shopify_order_id' => $shopifyOrderId], $payload));
            $counts['inserted']++;
        }
    }

    private function upsertShopifyOrder(array $o, array &$counts): void
    {
        $shopifyOrderId = (string) ($o['name'] ?? $o['id']);
        $customerData = $o['customer'] ?? [];
        $shipping = $o['shipping_address'] ?? [];

        $email = $customerData['email'] ?? $o['email'] ?? '';
        $phone = $this->normalizePhone($shipping['phone'] ?? $customerData['phone'] ?? '');
        $name = trim(($shipping['first_name'] ?? '') . ' ' . ($shipping['last_name'] ?? ''));

        $customer = Customer::firstOrCreate(
            ['email' => $email ?: null],
            ['phone' => $phone, 'name' => $name]
        );

        $rawPincode = $this->cleanPincode($shipping['zip'] ?? '');
        $pincodeId = null;
        if ($rawPincode) {
            $pinObj = Pincode::firstOrCreate(['pincode' => $rawPincode]);
            $pincodeId = $pinObj->id;
        }

        $paymentGateway = $o['payment_gateway'] ?? '';
        $paymentMethod = (str_contains(strtolower($paymentGateway), 'cod') || str_contains(strtolower($paymentGateway), 'cash'))
            ? 'COD' : 'Prepaid';

        $fulfilledAt = $o['fulfillments'][0]['created_at'] ?? null;
        $fulfillCount = count($o['fulfillments'] ?? []);
        $status = $fulfillCount > 0 ? 'delivered' : 'pending';

        $lineItems = json_encode(array_map(fn($li) => [
            'name' => $li['name'] ?? '',
            'quantity' => $li['quantity'] ?? 1,
            'price' => $li['price'] ?? 0,
            'sku' => $li['sku'] ?? '',
        ], $o['line_items'] ?? []));

        $riskLevel = $o['risk_level'] ?? '';

        $payload = [
            'customer_id' => $customer->id,
            'pincode_id' => $pincodeId,
            'amount' => (float) ($o['total_price'] ?? 0),
            'payment_method' => $paymentMethod,
            'status' => $status,
            'state' => $shipping['province'] ?? '',
            'city' => $shipping['city'] ?? '',
            'fulfillment_status' => $fulfillCount > 0 ? 'fulfilled' : 'unfulfilled',
            'shopify_risk_level' => $riskLevel,
            'line_items' => $lineItems,
            'ordered_at' => $this->parseDate($o['created_at'] ?? ''),
        ];

        $existing = Order::where('shopify_order_id', $shopifyOrderId)->first();
        if ($existing) {
            $existing->update($payload);
            $counts['updated']++;
        } else {
            Order::create(array_merge(['shopify_order_id' => $shopifyOrderId], $payload));
            $counts['inserted']++;
        }
    }

    private function normalizePhone(string $phone): string
    {
        $phone = preg_replace('/[^0-9+]/', '', $phone);
        // Remove leading country code +91
        if (str_starts_with($phone, '+91'))
            $phone = substr($phone, 3);
        if (str_starts_with($phone, '91') && strlen($phone) === 12)
            $phone = substr($phone, 2);
        return $phone;
    }

    private function cleanPincode(string $zip): string
    {
        // Remove leading ' (Shopify sometimes adds it)
        return preg_replace('/[^0-9]/', '', ltrim($zip, "'"));
    }

    private function parseDate(string $dateStr): ?string
    {
        try {
            return $dateStr ? \Carbon\Carbon::parse($dateStr)->toDateTimeString() : null;
        } catch (\Exception $e) {
            return null;
        }
    }
}

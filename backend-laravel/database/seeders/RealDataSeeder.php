<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class RealDataSeeder extends Seeder
{
    public function run()
    {
        // 1. Pincodes
        $pincodes = [
            ['pincode' => '110001', 'risk_level' => 'low', 'rto_rate' => 5.2],
            ['pincode' => '110044', 'risk_level' => 'high', 'rto_rate' => 35.8],
            ['pincode' => '400001', 'risk_level' => 'medium', 'rto_rate' => 12.4],
            ['pincode' => '560001', 'risk_level' => 'low', 'rto_rate' => 2.1],
        ];
        foreach ($pincodes as $p) {
            DB::table('pincodes')->updateOrInsert(['pincode' => $p['pincode']], array_merge($p, ['created_at' => now(), 'updated_at' => now()]));
        }

        // 2. Customers
        $customers = [
            ['name' => 'Sahil Arora', 'email' => 'sahil@example.com', 'phone' => '9812345678', 'risk_level' => 'Low', 'order_count' => 5, 'rto_count' => 0],
            ['name' => 'Amit Sharma', 'email' => 'amit@fraud.com', 'phone' => '9999988888', 'risk_level' => 'High', 'is_fraud' => true, 'order_count' => 2, 'rto_count' => 2],
            ['name' => 'Priya Singh', 'email' => 'priya@gmail.com', 'phone' => '9876543210', 'risk_level' => 'Medium', 'order_count' => 3, 'rto_count' => 1],
        ];
        foreach ($customers as $c) {
            DB::table('customers')->updateOrInsert(['email' => $c['email']], array_merge($c, ['created_at' => now(), 'updated_at' => now()]));
        }

        // 3. Orders
        $customerIds = DB::table('customers')->pluck('id')->toArray();
        $pincodeIds = DB::table('pincodes')->pluck('id')->toArray();

        for ($i = 1; $i <= 50; $i++) {
            $status = collect(['delivered', 'delivered', 'delivered', 'rto', 'pending'])->random();
            $payment = collect(['COD', 'Prepaid', 'COD'])->random();
            $date = Carbon::now()->subDays(rand(0, 30));

            DB::table('orders')->insert([
                'shopify_order_id' => 'ORD-' . (1000 + $i),
                'customer_id' => collect($customerIds)->random(),
                'pincode_id' => collect($pincodeIds)->random(),
                'amount' => rand(500, 5000),
                'payment_method' => $payment,
                'status' => $status,
                'city' => 'Sample City',
                'state' => 'Sample State',
                'courier_name' => collect(['Delhivery', 'Blue Dart', 'Xpressbees'])->random(),
                'ordered_at' => $date,
                'created_at' => $date,
                'updated_at' => $date,
            ]);
        }

        // 4. Notifications
        DB::table('notifications')->insert([
            ['title' => 'High RTO Detect', 'message' => 'Pincode 110044 is showing 40% RTO rate.', 'is_read' => false, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'System Connected', 'message' => 'Shopify store successfully synced.', 'is_read' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // 1. Couriers
        Schema::create('couriers', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            $table->decimal('rto_rate', 5, 2)->default(0);
            $table->decimal('avg_delivery_days', 5, 2)->nullable();
            $table->timestamps();
        });

        // 2. Customers
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('shopify_id')->unique()->nullable();
            $table->string('phone', 20)->nullable()->index();
            $table->string('email')->nullable()->unique();
            $table->string('name')->nullable();
            $table->boolean('is_fraud')->default(false);
            $table->boolean('is_blocked')->default(false);
            $table->string('risk_level')->default('Low'); // Low / Medium / High
            $table->integer('rto_count')->default(0);
            $table->integer('order_count')->default(0);
            $table->timestamps();
        });

        // 3. Pincodes (Pincode Risk Scoring)
        Schema::create('pincodes', function (Blueprint $table) {
            $table->id();
            $table->string('pincode', 10)->unique();
            $table->enum('risk_level', ['low', 'medium', 'high'])->default('low');
            $table->decimal('rto_rate', 5, 2)->default(0);
            $table->integer('total_orders')->default(0);
            $table->integer('rto_orders')->default(0);
            $table->timestamps();
        });

        // 4. Orders (core table — both CSV & API imports land here)
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('shopify_order_id')->unique();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('courier_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('pincode_id')->nullable()->constrained()->nullOnDelete();

            $table->decimal('amount', 10, 2)->default(0);
            $table->string('payment_method')->default('COD'); // COD | Prepaid
            $table->enum('status', ['pending', 'in_transit', 'out_for_delivery', 'delivered', 'rto', 'cancelled'])->default('pending');
            $table->enum('rto_status', ['none', 'initiated', 'completed'])->default('none');

            // Address / geo
            $table->string('city')->nullable();
            $table->string('state')->nullable();

            // Shopify-level info
            $table->string('fulfillment_status')->nullable();
            $table->string('shopify_risk_level')->nullable(); // Low / Medium / High from Shopify
            $table->json('line_items')->nullable();           // serialized line items

            // Shipment tracking (Shiprocket)
            $table->string('awb_code')->nullable();
            $table->string('courier_name')->nullable();
            $table->decimal('shipping_cost', 8, 2)->nullable();
            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->integer('attempt_count')->default(0);

            $table->timestamp('ordered_at')->nullable();
            $table->timestamps();
        });

        // 5. Shipment tracking events (webhook payloads)
        Schema::create('shipment_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('awb_code')->nullable()->index();
            $table->string('status');
            $table->string('location')->nullable();
            $table->timestamp('event_at')->nullable();
            $table->json('raw_payload')->nullable();
            $table->timestamps();
        });

        // 6. Shopify Store Connections
        Schema::create('shopify_connections', function (Blueprint $table) {
            $table->id();
            $table->string('shop_domain')->unique();
            $table->string('access_token');
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();
        });

        // 7. Courier Summary (aggregated — refreshed by cron)
        Schema::create('courier_summary', function (Blueprint $table) {
            $table->id();
            $table->string('courier_name')->unique();
            $table->integer('total_shipments')->default(0);
            $table->integer('delivered_count')->default(0);
            $table->integer('rto_count')->default(0);
            $table->decimal('avg_delivery_days', 5, 2)->nullable();
            $table->decimal('rto_percentage', 5, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('courier_summary');
        Schema::dropIfExists('shopify_connections');
        Schema::dropIfExists('shipment_events');
        Schema::dropIfExists('orders');
        Schema::dropIfExists('pincodes');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('couriers');
    }
};

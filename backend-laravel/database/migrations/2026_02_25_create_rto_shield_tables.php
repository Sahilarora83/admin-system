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
            $table->string('phone')->nullable()->index();
            $table->string('email')->nullable();
            $table->boolean('is_fraud')->default(false); // Flag repeat fraud buyers
            $table->timestamps();
        });

        // 3. Pincodes (Pincode Risk Scoring)
        Schema::create('pincodes', function (Blueprint $table) {
            $table->id();
            $table->string('pincode', 10)->unique();
            $table->enum('risk_level', ['low', 'medium', 'high'])->default('low');
            $table->decimal('rto_rate', 5, 2)->default(0);
            $table->timestamps();
        });

        // 4. Orders
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('shopify_order_id')->unique();
            $table->foreignId('customer_id')->constrained()->cascadeOnDelete();
            $table->foreignId('courier_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('pincode_id')->nullable()->constrained()->nullOnDelete();

            $table->decimal('amount', 10, 2);
            $table->string('payment_method')->default('COD'); // COD or Prepaid
            $table->enum('status', ['delivered', 'rto', 'in_transit', 'cancelled'])->default('in_transit');
            $table->enum('rto_status', ['none', 'initiated', 'completed'])->default('none');

            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('orders');
        Schema::dropIfExists('pincodes');
        Schema::dropIfExists('customers');
        Schema::dropIfExists('couriers');
    }
};

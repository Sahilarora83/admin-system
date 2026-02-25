<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up()
    {
        // Shipments — created when merchant dispatches via Shiprocket
        Schema::create('shipments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();

            // Shiprocket identifiers
            $table->string('shiprocket_order_id')->nullable();
            $table->string('shiprocket_shipment_id')->nullable();
            $table->string('awb_code')->nullable()->index();
            $table->integer('courier_id')->nullable();       // Shiprocket courier ID
            $table->string('courier_name')->nullable();

            // Package details (filled by merchant)
            $table->decimal('weight', 8, 3)->nullable();    // kg
            $table->integer('length')->nullable();           // cm
            $table->integer('breadth')->nullable();
            $table->integer('height')->nullable();

            // Financials
            $table->decimal('shipping_cost', 8, 2)->nullable();
            $table->decimal('expected_cod_amount', 10, 2)->nullable();

            // Tracking
            $table->string('current_status')->default('pending'); // matches Shiprocket statuses
            $table->integer('attempt_count')->default(0);
            $table->boolean('rto_flag')->default(false);

            $table->timestamp('shipped_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamps();
        });

        // Pincode Summary — aggregated nightly
        Schema::create('pincode_summary', function (Blueprint $table) {
            $table->id();
            $table->string('pincode', 10)->unique();
            $table->string('state')->nullable();
            $table->integer('total_orders')->default(0);
            $table->integer('rto_orders')->default(0);
            $table->decimal('rto_percentage', 5, 2)->default(0);
            $table->enum('risk_level', ['low', 'medium', 'high'])->default('low');
            $table->timestamps();
        });

        // RTO Aggregations — one row per day, computed nightly by cron
        Schema::create('rto_aggregations', function (Blueprint $table) {
            $table->id();
            $table->date('date')->unique();
            $table->integer('today_rto')->default(0);
            $table->integer('weekly_rto')->default(0);
            $table->integer('monthly_rto')->default(0);
            $table->integer('today_delivered')->default(0);
            $table->integer('total_orders_today')->default(0);
            $table->decimal('cod_collected_today', 12, 2)->default(0);
            $table->decimal('rto_loss_today', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('rto_aggregations');
        Schema::dropIfExists('pincode_summary');
        Schema::dropIfExists('shipments');
    }
};

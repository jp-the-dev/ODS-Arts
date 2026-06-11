<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Shiprocket order / shipment identifiers
            $table->string('shiprocket_order_id')->nullable()->after('notes');
            $table->string('shiprocket_shipment_id')->nullable()->after('shiprocket_order_id');

            // AWB (tracking number) + assigned courier
            $table->string('awb_code')->nullable()->after('shiprocket_shipment_id');
            $table->unsignedInteger('courier_id')->nullable()->after('awb_code');
            $table->string('courier_name')->nullable()->after('courier_id');

            // Delivery estimate + live status from Shiprocket webhooks
            $table->date('estimated_delivery_date')->nullable()->after('courier_name');
            $table->string('shiprocket_status', 64)->nullable()->after('estimated_delivery_date');

            // Pickup pincode (stored for reference / support)
            $table->string('pickup_pincode', 10)->nullable()->after('shiprocket_status');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'shiprocket_order_id',
                'shiprocket_shipment_id',
                'awb_code',
                'courier_id',
                'courier_name',
                'estimated_delivery_date',
                'shiprocket_status',
                'pickup_pincode',
            ]);
        });
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Stock is taken when the order is created, before payment. Nothing gave it
 * back, so every abandoned or declined checkout held its units forever — the
 * catalogue reported items as sold out that nobody had bought.
 *
 * This records when an order's stock was returned, which is what makes the
 * release safe to run repeatedly: without it a scheduled job would credit the
 * same units on every pass and inflate inventory without limit.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->timestamp('stock_released_at')->nullable()->after('ordered_at');
            $table->index(['payment_status', 'stock_released_at']);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table): void {
            $table->dropIndex(['payment_status', 'stock_released_at']);
            $table->dropColumn('stock_released_at');
        });
    }
};

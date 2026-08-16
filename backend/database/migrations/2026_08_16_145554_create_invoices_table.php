<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A GST tax invoice, issued once an order is paid.
 *
 * Everything the document shows is snapshotted here rather than read back from
 * config at render time. An invoice is a legal record given to a customer: if
 * the GST rate changes, or we move premises, or the catalogue price is edited,
 * a reprint must still show what was actually invoiced.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('invoices', function (Blueprint $table): void {
            $table->id();

            // One invoice per order — the unique key is what makes issuing
            // idempotent when a webhook and /verify both confirm the payment.
            $table->foreignId('order_id')->unique()->constrained()->cascadeOnDelete();

            $table->string('number')->unique();
            // Kept apart from `number` so the next sequence can be found under a
            // lock without parsing the formatted string.
            $table->string('financial_year', 9);
            $table->unsignedInteger('sequence');

            $table->timestamp('issued_at');

            // Seller snapshot.
            $table->string('seller_name');
            $table->string('seller_gstin')->nullable();
            $table->text('seller_address');
            $table->string('seller_state');
            $table->string('seller_state_code', 2);

            // Place of supply — decides CGST+SGST versus IGST.
            $table->string('place_of_supply');
            $table->string('place_of_supply_code', 2)->nullable();
            $table->boolean('is_intra_state');

            // Money, all in paise. taxable + tax == the order total, always.
            $table->string('hsn_code')->nullable();
            $table->decimal('gst_rate', 5, 2);
            $table->unsignedInteger('taxable_value');
            $table->unsignedInteger('cgst');
            $table->unsignedInteger('sgst');
            $table->unsignedInteger('igst');
            $table->unsignedInteger('total');

            $table->timestamps();

            $table->unique(['financial_year', 'sequence']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};

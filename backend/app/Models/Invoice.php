<?php

declare(strict_types=1);

namespace App\Models;

use Database\Factories\InvoiceFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A GST tax invoice for a paid order.
 *
 * Every field is a snapshot taken when the invoice was issued — nothing here is
 * recomputed from config or from the order, so a reprint years later shows the
 * document the customer was actually given.
 */
class Invoice extends Model
{
    /** @use HasFactory<InvoiceFactory> */
    use HasFactory;

    protected $fillable = [
        'order_id',
        'number',
        'financial_year',
        'sequence',
        'issued_at',
        'seller_name',
        'seller_gstin',
        'seller_address',
        'seller_state',
        'seller_state_code',
        'place_of_supply',
        'place_of_supply_code',
        'is_intra_state',
        'hsn_code',
        'gst_rate',
        'taxable_value',
        'cgst',
        'sgst',
        'igst',
        'total',
    ];

    protected function casts(): array
    {
        return [
            'issued_at' => 'datetime',
            'is_intra_state' => 'boolean',
            'gst_rate' => 'decimal:2',
            'sequence' => 'integer',
            'taxable_value' => 'integer',
            'cgst' => 'integer',
            'sgst' => 'integer',
            'igst' => 'integer',
            'total' => 'integer',
        ];
    }

    /** @return BelongsTo<Order, $this> */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    /** Total tax across every head. */
    public function taxTotal(): int
    {
        return $this->cgst + $this->sgst + $this->igst;
    }
}

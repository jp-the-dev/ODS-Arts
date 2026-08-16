<?php

namespace App\Models;

use Database\Factories\OrderFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    /** @use HasFactory<OrderFactory> */
    use HasFactory;

    protected $fillable = [
        'user_id',
        'email',
        'phone',
        'order_number',
        'status',
        'subtotal',
        'tax',
        'shipping_cost',
        'discount',
        'total',
        'payment_status',
        'payment_method',
        'billing_address',
        'shipping_address',
        'notes',
        'currency',
        'ordered_at',
        'stock_released_at',
        'razorpay_order_id',
        'razorpay_payment_id',
        'razorpay_signature',
        // Shiprocket shipping fields
        'shiprocket_order_id',
        'shiprocket_shipment_id',
        'awb_code',
        'courier_id',
        'courier_name',
        'estimated_delivery_date',
        'shiprocket_status',
        'pickup_pincode',
    ];

    protected function casts(): array
    {
        return [
            'billing_address' => 'array',
            'shipping_address' => 'array',
            'ordered_at' => 'datetime',
            'stock_released_at' => 'datetime',
            'estimated_delivery_date' => 'date',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    /** Raised once the order is paid, so an unpaid order has none. */
    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }
}

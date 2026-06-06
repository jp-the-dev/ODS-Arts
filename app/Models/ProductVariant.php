<?php

namespace App\Models;

use Database\Factories\ProductVariantFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariant extends Model
{
    /** @use HasFactory<ProductVariantFactory> */
    use HasFactory;

    protected $fillable = [
        'product_id',
        'sku',
        'size_label',
        'dimensions_cm',
        'base_price_paise',
        'stock_qty',
        'weight_grams',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'base_price_paise' => 'integer',
            'stock_qty' => 'integer',
            'weight_grams' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}

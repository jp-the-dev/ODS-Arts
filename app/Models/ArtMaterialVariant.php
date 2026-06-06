<?php

namespace App\Models;

use Database\Factories\ArtMaterialVariantFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArtMaterialVariant extends Model
{
    /** @use HasFactory<ArtMaterialVariantFactory> */
    use HasFactory;

    protected $fillable = [
        'art_product_id',
        'sku',
        'material',
        'size_label',
        'dimensions_cm',
        'price_paise',
        'stock_qty',
        'weight_grams',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'price_paise' => 'integer',
            'stock_qty' => 'integer',
            'weight_grams' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function artProduct(): BelongsTo
    {
        return $this->belongsTo(ArtProduct::class);
    }
}

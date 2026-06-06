<?php

namespace App\Http\Resources;

use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read ProductVariant $resource
 */
class ProductVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'sku' => $this->resource->sku,
            'size_label' => $this->resource->size_label,
            'dimensions_cm' => $this->resource->dimensions_cm,
            'base_price_paise' => $this->resource->base_price_paise,
            'stock_qty' => $this->resource->stock_qty,
            'weight_grams' => $this->resource->weight_grams,
            'sort_order' => $this->resource->sort_order,
        ];
    }
}

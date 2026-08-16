<?php

namespace App\Http\Resources;

use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read OrderItem $resource
 */
class OrderItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'product_id' => $this->resource->product_id,
            'product_variant_id' => $this->resource->product_variant_id,
            'name' => $this->resource->name,
            'sku' => $this->resource->sku,
            'unit_price_paise' => $this->resource->unit_price_paise,
            'quantity' => $this->resource->quantity,
            'subtotal_paise' => $this->resource->subtotal_paise,
            'options' => $this->resource->options,
        ];
    }
}

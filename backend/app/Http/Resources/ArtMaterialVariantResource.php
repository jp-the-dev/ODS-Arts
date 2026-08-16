<?php

namespace App\Http\Resources;

use App\Models\ArtMaterialVariant;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read ArtMaterialVariant $resource
 */
class ArtMaterialVariantResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'sku' => $this->resource->sku,
            'material' => $this->resource->material,
            'size_label' => $this->resource->size_label,
            'dimensions_cm' => $this->resource->dimensions_cm,
            'price_paise' => $this->resource->price_paise,
            'stock_qty' => $this->resource->stock_qty,
            'weight_grams' => $this->resource->weight_grams,
        ];
    }
}

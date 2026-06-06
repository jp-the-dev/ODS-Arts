<?php

namespace App\Http\Resources;

use App\Models\FinishOption;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read FinishOption $resource
 */
class FinishOptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'name' => $this->resource->name,
            'slug' => $this->resource->slug,
            'swatch_hex' => $this->resource->swatch_hex,
            'price_delta_paise' => $this->resource->price_delta_paise,
            'sort_order' => $this->resource->sort_order,
        ];
    }
}

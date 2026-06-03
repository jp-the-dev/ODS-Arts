<?php

namespace App\Http\Resources;

use App\Models\FrameOption;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read FrameOption $resource
 */
class FrameOptionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'type' => $this->resource->type,
            'slug' => $this->resource->slug,
            'name' => $this->resource->name,
            'material' => $this->resource->material,
            'finish' => $this->resource->finish,
            'price_modifier' => $this->resource->price_modifier,
        ];
    }
}

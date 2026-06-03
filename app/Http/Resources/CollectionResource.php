<?php

namespace App\Http\Resources;

use App\Models\Collection;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read Collection $resource
 */
class CollectionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'slug' => $this->resource->slug,
            'name' => $this->resource->name,
            'tagline' => $this->resource->tagline,
            'description' => $this->resource->description,
            'cover_image' => $this->resource->cover_image
                ? asset('storage/'.$this->resource->cover_image)
                : null,
            'products_count' => $this->whenLoaded('products', fn () => $this->resource->products->count()),
        ];
    }
}

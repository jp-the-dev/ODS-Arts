<?php

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read Product $resource
 */
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'slug' => $this->resource->slug,
            'name' => $this->resource->name,
            'description' => $this->resource->description,
            'material' => $this->resource->material,
            'dimensions' => $this->resource->dimensions,
            // price exposed as rupees float (e.g. 1499.00)
            'price' => $this->resource->price,
            'is_featured' => $this->resource->is_featured,
            'collection' => $this->whenLoaded('collection', fn () => [
                'id' => $this->resource->collection->id,
                'slug' => $this->resource->collection->slug,
                'name' => $this->resource->collection->name,
            ]),
            'images' => ProductImageResource::collection($this->whenLoaded('images', fn () => $this->resource->images)),
        ];
    }
}

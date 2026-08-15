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
            'tagline' => $this->resource->tagline,
            'description' => $this->resource->description,
            'delivery_days' => $this->resource->delivery_days,
            'care_instructions' => $this->resource->care_instructions ?? [],
            'material' => $this->resource->material,
            'materials' => $this->resource->materials ?? [],
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
            'variants' => ProductVariantResource::collection(
                $this->whenLoaded('variants', fn () => $this->resource->variants)
            ),
            'finish_options' => FinishOptionResource::collection(
                $this->whenLoaded('finishOptions', fn () => $this->resource->finishOptions)
            ),
        ];
    }
}

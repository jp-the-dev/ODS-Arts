<?php

namespace App\Http\Resources;

use App\Models\ArtProduct;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read ArtProduct $resource
 */
class ArtProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'slug' => $this->resource->slug,
            'category_slug' => $this->resource->category?->slug,
            'name' => $this->resource->name,
            'tagline' => $this->resource->tagline,
            'description' => $this->resource->description,
            'artist' => $this->resource->artist,
            'medium' => $this->resource->medium,
            'delivery_days' => $this->resource->delivery_days,
            'currency' => 'INR',
            'material_variants' => ArtMaterialVariantResource::collection($this->whenLoaded('materialVariants')),
            'images' => ArtImageResource::collection($this->whenLoaded('images')),
            'tags' => $this->resource->tags ?? [],
        ];
    }
}

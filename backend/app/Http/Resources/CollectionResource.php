<?php

namespace App\Http\Resources;

use App\Models\Collection;
use App\Services\ImageUrl;
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
            'number' => $this->resource->display_number,
            'eyebrow' => $this->resource->eyebrow,
            'tagline' => $this->resource->tagline,
            'description' => $this->resource->description,
            'long_description' => $this->resource->long_description,
            'materials' => $this->resource->materials ?? [],
            'features' => $this->resource->features ?? [],
            'image_src' => $this->resource->image_path,
            'image_alt' => $this->resource->image_alt,
            'image_position' => $this->resource->image_position ?? 'left',
            'cover_image' => ImageUrl::for($this->resource->cover_image),
            'finish_options' => FinishOptionResource::collection($this->whenLoaded('finishOptions', fn () => $this->resource->finishOptions)),
            'products_count' => $this->whenLoaded('products', fn () => $this->resource->products->count()),
            'products' => $this->whenLoaded('products', fn () => ProductResource::collection($this->resource->products)),
        ];
    }
}

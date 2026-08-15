<?php

namespace App\Http\Resources;

use App\Models\ArtCategory;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read ArtCategory $resource
 */
class ArtCategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->resource->id,
            'slug' => $this->resource->slug,
            'number' => $this->resource->display_number,
            'eyebrow' => $this->resource->eyebrow,
            'title' => $this->resource->title,
            'tagline' => $this->resource->tagline,
            'description' => $this->resource->description,
            'cover_image' => $this->resource->cover_image,
            'cover_image_alt' => $this->resource->cover_image_alt,
            'accent_color' => $this->resource->accent_color,
            'art_count' => $this->whenCounted('artProducts'),
            'art_products' => ArtProductResource::collection($this->whenLoaded('artProducts')),
        ];
    }
}

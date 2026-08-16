<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @property-read User $resource
 */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $hasOAuth = $this->resource->relationLoaded('oauthProviders') && $this->resource->oauthProviders->isNotEmpty();

        return [
            'id' => $this->resource->id,
            'name' => $this->resource->name,
            'email' => $this->resource->email,
            'phone' => $this->resource->phone,
            'auth_provider' => $hasOAuth ? 'google' : 'email',
            'avatar_url' => $hasOAuth ? $this->resource->oauthProviders->first()->avatar : null,
            'addresses' => AddressResource::collection($this->whenLoaded('addresses')),
            'created_at' => $this->resource->created_at,
        ];
    }
}

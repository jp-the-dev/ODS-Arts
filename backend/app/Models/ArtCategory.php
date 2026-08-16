<?php

namespace App\Models;

use Database\Factories\ArtCategoryFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ArtCategory extends Model
{
    /** @use HasFactory<ArtCategoryFactory> */
    use HasFactory;

    protected $fillable = [
        'slug',
        'display_number',
        'eyebrow',
        'title',
        'tagline',
        'description',
        'cover_image',
        'cover_image_alt',
        'accent_color',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function artProducts(): HasMany
    {
        return $this->hasMany(ArtProduct::class)->orderBy('sort_order');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}

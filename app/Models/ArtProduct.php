<?php

namespace App\Models;

use Database\Factories\ArtProductFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ArtProduct extends Model
{
    /** @use HasFactory<ArtProductFactory> */
    use HasFactory;

    protected $fillable = [
        'art_category_id',
        'slug',
        'name',
        'tagline',
        'description',
        'artist',
        'medium',
        'delivery_days',
        'tags',
        'is_featured',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'delivery_days' => 'integer',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ArtCategory::class, 'art_category_id');
    }

    public function materialVariants(): HasMany
    {
        return $this->hasMany(ArtMaterialVariant::class)->orderBy('sort_order');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ArtImage::class)->orderBy('sort_order');
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }
}

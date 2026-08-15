<?php

namespace App\Models;

use Database\Factories\CollectionFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Collection extends Model
{
    /** @use HasFactory<CollectionFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'display_number',
        'tagline',
        'eyebrow',
        'description',
        'long_description',
        'materials',
        'features',
        'cover_image',
        'image_path',
        'image_alt',
        'image_position',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'materials' => 'array',
        'features' => 'array',
    ];

    public function products(): HasMany
    {
        return $this->hasMany(Product::class)->orderBy('sort_order');
    }

    /** Finishes shared by every product in this collection. */
    public function finishOptions(): HasMany
    {
        return $this->hasMany(FinishOption::class)->orderBy('sort_order');
    }

    /**
     * Scope to only active collections.
     *
     * @param  Builder<Collection>  $query
     * @return Builder<Collection>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }
}

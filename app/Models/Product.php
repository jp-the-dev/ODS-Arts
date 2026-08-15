<?php

namespace App\Models;

use Database\Factories\ProductFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Product extends Model
{
    /** @use HasFactory<ProductFactory> */
    use HasFactory;

    protected $fillable = [
        'collection_id',
        'name',
        'tagline',
        'slug',
        'description',
        'delivery_days',
        'care_instructions',
        'material',
        'materials',
        'dimensions',
        'price_in_paise',
        'is_featured',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price_in_paise' => 'integer',
        'is_featured' => 'boolean',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'delivery_days' => 'integer',
        'care_instructions' => 'array',
        'materials' => 'array',
    ];

    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    /** Orderable SKUs, one per size. */
    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class)->orderBy('sort_order');
    }

    /**
     * Finishes available for this product. Defined on the collection, since every
     * product in a collection shares the same finish set.
     *
     * @return HasManyThrough<FinishOption, Collection, $this>
     */
    public function finishOptions(): HasManyThrough
    {
        return $this->hasManyThrough(
            FinishOption::class,
            Collection::class,
            'id',            // collections.id
            'collection_id', // finish_options.collection_id
            'collection_id', // products.collection_id
            'id',            // collections.id
        )->orderBy('finish_options.sort_order');
    }

    public function testimonials(): HasMany
    {
        return $this->hasMany(Testimonial::class);
    }

    /**
     * @param  Builder<Product>  $query
     * @return Builder<Product>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * @param  Builder<Product>  $query
     * @return Builder<Product>
     */
    public function scopeFeatured(Builder $query): Builder
    {
        return $query->where('is_featured', true);
    }

    /** Price in whole rupees as a float for display. */
    public function getPriceAttribute(): float
    {
        return $this->price_in_paise / 100;
    }
}

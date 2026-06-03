<?php

namespace App\Models;

use Database\Factories\FrameOptionFactory;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class FrameOption extends Model
{
    /** @use HasFactory<FrameOptionFactory> */
    use HasFactory;

    protected $fillable = [
        'type',
        'name',
        'slug',
        'material',
        'finish',
        'price_modifier_in_paise',
        'is_active',
        'sort_order',
    ];

    protected $casts = [
        'price_modifier_in_paise' => 'integer',
        'is_active' => 'boolean',
        'sort_order' => 'integer',
    ];

    /**
     * @param  Builder<FrameOption>  $query
     * @return Builder<FrameOption>
     */
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    /**
     * @param  Builder<FrameOption>  $query
     * @return Builder<FrameOption>
     */
    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('type', $type);
    }

    /** Price modifier in whole rupees. */
    public function getPriceModifierAttribute(): float
    {
        return $this->price_modifier_in_paise / 100;
    }
}

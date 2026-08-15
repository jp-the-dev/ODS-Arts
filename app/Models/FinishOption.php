<?php

namespace App\Models;

use Database\Factories\FinishOptionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A finish offered on every product in a collection — swatch colour plus a price
 * delta applied on top of the chosen variant.
 *
 * Not to be confused with {@see FrameOption}, which drives the custom-framing
 * wizard (wood / mat / glass).
 */
class FinishOption extends Model
{
    /** @use HasFactory<FinishOptionFactory> */
    use HasFactory;

    protected $fillable = [
        'collection_id',
        'name',
        'slug',
        'swatch_hex',
        'price_delta_paise',
        'sort_order',
    ];

    protected $casts = [
        'price_delta_paise' => 'integer',
        'sort_order' => 'integer',
    ];

    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class);
    }
}

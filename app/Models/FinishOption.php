<?php

namespace App\Models;

use Database\Factories\FinishOptionFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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

    protected function casts(): array
    {
        return [
            'price_delta_paise' => 'integer',
            'sort_order' => 'integer',
        ];
    }

    public function collection(): BelongsTo
    {
        return $this->belongsTo(Collection::class);
    }
}

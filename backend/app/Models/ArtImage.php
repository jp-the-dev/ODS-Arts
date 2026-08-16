<?php

namespace App\Models;

use App\Services\ImageUrl;
use Database\Factories\ArtImageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArtImage extends Model
{
    /** @use HasFactory<ArtImageFactory> */
    use HasFactory;

    protected $fillable = [
        'art_product_id',
        'path',
        'alt',
        'role',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'sort_order' => 'integer',
        ];
    }

    public function artProduct(): BelongsTo
    {
        return $this->belongsTo(ArtProduct::class);
    }

    public function getUrlAttribute(): string
    {
        return (string) ImageUrl::for($this->path);
    }
}

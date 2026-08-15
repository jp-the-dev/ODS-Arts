<?php

namespace App\Models;

use Database\Factories\ProductImageFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductImage extends Model
{
    /** @use HasFactory<ProductImageFactory> */
    use HasFactory;

    protected $fillable = [
        'product_id',
        'path',
        'alt',
        'sort_order',
    ];

    protected $casts = [
        'sort_order' => 'integer',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * URL for the storefront.
     *
     * Seeded rows store a storefront-relative path (/images/...) served from the
     * Next.js public folder, so it is returned unchanged. Uploaded images live on
     * the public disk and need an absolute URL, since the storefront is on a
     * different origin to the API.
     */
    public function getUrlAttribute(): string
    {
        if (str_starts_with($this->path, '/')) {
            return $this->path;
        }

        return asset('storage/'.$this->path);
    }

    /**
     * URL for the admin panel.
     *
     * Identical for uploads, but a storefront-relative path has to be made
     * absolute against the storefront: the admin is served from the API origin,
     * where /images/... does not exist.
     */
    public function getAdminUrlAttribute(): string
    {
        if (str_starts_with($this->path, '/')) {
            return rtrim((string) config('app.frontend_url'), '/').$this->path;
        }

        return asset('storage/'.$this->path);
    }
}

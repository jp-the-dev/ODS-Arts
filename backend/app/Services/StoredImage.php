<?php

namespace App\Services;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

/**
 * Removes an image file from the public disk once nothing points at it.
 *
 * Uploads were previously never cleaned up: replacing a product photo wrote a
 * new file and repointed the row, leaving the old one on disk forever, and
 * deleting a product removed its rows but none of its files. On a bucket that
 * is billed by the gigabyte the cost only ever goes up.
 *
 * Deleting is deliberately conservative. A path that is not on the disk is left
 * alone, and so is one another row still references — the seeder reused a single
 * source image across several products, and while odsarts:images-to-disk now
 * gives each row its own copy, a hand-edited row could still share one.
 */
final class StoredImage
{
    /**
     * @param  class-string<Model>  $model
     */
    public static function forget(?string $path, string $model, string $column = 'path'): void
    {
        if (blank($path) || str_starts_with($path, '/')) {
            // Storefront-relative paths belong to the Next.js public folder and
            // are version-controlled, not ours to delete.
            return;
        }

        if ($model::query()->where($column, $path)->exists()) {
            return;
        }

        $disk = Storage::disk('public');

        if ($disk->exists($path)) {
            $disk->delete($path);
        }
    }
}

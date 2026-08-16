<?php

namespace App\Services;

/**
 * Turns a stored image path into a URL the storefront can load.
 *
 * Two kinds of path coexist. Uploads live on the public disk and are stored
 * relative to it ("products/abc.jpg"); they need an absolute URL because the
 * storefront runs on a different origin to the API. Older rows store a
 * storefront-relative path ("/images/hero.png") served from the Next.js public
 * folder, which must be passed through untouched — prefixing it would produce
 * /storage//images/hero.png and 404.
 *
 * This lived in three places with two different behaviours: the product and art
 * image models applied the leading-slash rule, while the collection and art
 * category resources did not. Sharing it means a path cannot resolve one way on
 * one endpoint and another way elsewhere.
 */
final class ImageUrl
{
    public static function for(?string $path): ?string
    {
        if (blank($path)) {
            return null;
        }

        if (str_starts_with($path, '/')) {
            return $path;
        }

        return asset('storage/'.$path);
    }

    /**
     * URL for the admin panel, which is served from the API origin where a
     * storefront-relative path does not resolve.
     */
    public static function forAdmin(?string $path): ?string
    {
        if (blank($path)) {
            return null;
        }

        if (str_starts_with($path, '/')) {
            return rtrim((string) config('app.frontend_url'), '/').$path;
        }

        return asset('storage/'.$path);
    }
}

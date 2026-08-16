<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Allows the Next.js frontend (localhost:3000 locally, odsarts.in in
    | production) to call the Laravel API.
    |
    | Note: this cannot cover /storage. Uploaded images are served straight off
    | disk by the web server (and by `artisan serve`) without booting Laravel, so
    | no middleware runs and no CORS header is added. Browse the admin on the same
    | host APP_URL uses and the question does not arise; if images later move to
    | S3 or a CDN, set the CORS policy there instead.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => array_values(array_filter([
        // Storefront
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
        env('FRONTEND_URL', 'https://odsarts.in'),

        // The API's own origins. Browsers treat localhost and 127.0.0.1 as
        // different origins, so the admin loading its own images is a
        // cross-origin request whenever the host in the URL bar differs from
        // the one APP_URL generates.
        'http://localhost:8000',
        'http://127.0.0.1:8000',
        env('APP_URL'),
    ])),

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];

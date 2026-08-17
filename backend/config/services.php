<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    /*
     * Razorpay. Called over HTTP rather than via the vendor SDK so the app takes
     * on no extra dependency; signatures are verified with hash_hmac.
     */
    'razorpay' => [
        'key' => env('RAZORPAY_KEY'),
        'secret' => env('RAZORPAY_SECRET'),
        'webhook_secret' => env('RAZORPAY_WEBHOOK_SECRET'),
        'base_url' => env('RAZORPAY_BASE_URL', 'https://api.razorpay.com/v1'),
    ],

    /*
    | Google sign-in. The redirect must match the authorised redirect URI in the
    | Google Cloud console exactly, including scheme and trailing path. Unset
    | credentials make /auth/social/google answer 503 rather than half-working.
    */
    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'redirect' => env('GOOGLE_REDIRECT_URI', env('APP_URL', 'http://localhost:8000').'/api/v1/auth/social/google/callback'),
    ],

    'shiprocket' => [
        'email' => env('SHIPROCKET_EMAIL'),
        'password' => env('SHIPROCKET_PASSWORD'),
        'pickup_postcode' => env('SHIPROCKET_PICKUP_POSTCODE', '360002'),
        // Must match the *nickname* of a pickup address in the Shiprocket panel
        // exactly, or order creation 4xxs. Not every account has one called
        // "Primary" — ours is "Home".
        'pickup_location' => env('SHIPROCKET_PICKUP_LOCATION', 'Primary'),
        'courier_mode' => env('SHIPROCKET_COURIER_MODE', 'auto_cheapest'),
        'dry_run' => env('SHIPROCKET_DRY_RUN', true),
        // Sent by Shiprocket as the x-api-key header. Unset means the status
        // webhook fails closed (503) rather than accepting anonymous pushes.
        'webhook_token' => env('SHIPROCKET_WEBHOOK_TOKEN'),
        'base_url' => 'https://apiv2.shiprocket.in/v1/external',
    ],

];

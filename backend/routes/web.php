<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| This application is API-only: the storefront is the Next.js app and the
| admin is Filament at /admin. Nothing should be served from the web root, so
| it redirects to the storefront rather than showing Laravel's welcome page.
|
*/

Route::get('/', fn () => redirect()->away(config('app.frontend_url')))
    ->name('home');

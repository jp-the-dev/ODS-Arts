<?php

use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\EnquiryController;
use App\Http\Controllers\Api\FrameOptionController;
use App\Http\Controllers\Api\FramingController;
use App\Http\Controllers\Api\NewsletterController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\TestimonialController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes — ODSArts v1
|--------------------------------------------------------------------------
|
| All storefront routes are public (no auth required).
| Admin panel is handled by Filament at /admin.
|
*/

Route::prefix('v1')->name('api.v1.')->group(function (): void {
    // Collections
    Route::get('/collections', [CollectionController::class, 'index'])->name('collections.index');
    Route::get('/collections/{slug}', [CollectionController::class, 'show'])->name('collections.show');

    // Products
    Route::get('/products', [ProductController::class, 'index'])->name('products.index');
    Route::get('/products/featured', [ProductController::class, 'featured'])->name('products.featured');
    Route::get('/products/{slug}', [ProductController::class, 'show'])->name('products.show');

    // Frame options (wood, mat, glass) — for the custom framing calculator
    Route::get('/frame-options', [FrameOptionController::class, 'index'])->name('frame-options.index');

    // Framing price calculator
    Route::post('/framing/calculate-price', [FramingController::class, 'calculatePrice'])->name('framing.calculate-price');

    // Testimonials
    Route::get('/testimonials', [TestimonialController::class, 'index'])->name('testimonials.index');

    // Enquiries (contact / custom framing / gifting forms)
    Route::post('/enquiries', [EnquiryController::class, 'store'])->name('enquiries.store');

    // Newsletter
    Route::post('/newsletter/subscribe', [NewsletterController::class, 'subscribe'])->name('newsletter.subscribe');
});

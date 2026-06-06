<?php

use App\Http\Controllers\Api\AddressController;
use App\Http\Controllers\Api\ArtCategoryController;
use App\Http\Controllers\Api\ArtController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CollectionController;
use App\Http\Controllers\Api\EnquiryController;
use App\Http\Controllers\Api\FrameOptionController;
use App\Http\Controllers\Api\FramingController;
use App\Http\Controllers\Api\NewsletterController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\TestimonialController;
use App\Http\Controllers\Api\WishlistController;
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

    // Art Categories
    Route::get('/art/categories', [ArtCategoryController::class, 'index'])->name('art.categories.index');
    Route::get('/art/categories/{slug}', [ArtCategoryController::class, 'show'])->name('art.categories.show');

    // Art Products
    Route::get('/art', [ArtController::class, 'index'])->name('art.index');
    Route::get('/art/featured', [ArtController::class, 'featured'])->name('art.featured');
    Route::get('/art/{slug}', [ArtController::class, 'show'])->name('art.show');

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

    // Webhooks (no auth)
    Route::post('/webhooks/razorpay', [PaymentController::class, 'webhook'])->name('webhooks.razorpay');

    // Auth — guest
    Route::post('/auth/register', [AuthController::class, 'register'])->name('auth.register');
    Route::post('/auth/login', [AuthController::class, 'login'])->name('auth.login');
    Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword'])->name('auth.forgot-password');
    Route::post('/auth/reset-password', [AuthController::class, 'resetPassword'])->name('auth.reset-password');

    // Auth — authenticated
    Route::middleware('auth:sanctum')->group(function (): void {
        Route::post('/auth/logout', [AuthController::class, 'logout'])->name('auth.logout');
        Route::get('/auth/user', [AuthController::class, 'user'])->name('auth.user');
        Route::put('/auth/user', [AuthController::class, 'updateProfile'])->name('auth.user.update');
        Route::put('/auth/user/password', [AuthController::class, 'updatePassword'])->name('auth.user.password');

        // Addresses
        Route::get('/auth/addresses', [AddressController::class, 'index'])->name('auth.addresses.index');
        Route::post('/auth/addresses', [AddressController::class, 'store'])->name('auth.addresses.store');
        Route::put('/auth/addresses/{address}', [AddressController::class, 'update'])->name('auth.addresses.update');
        Route::delete('/auth/addresses/{address}', [AddressController::class, 'destroy'])->name('auth.addresses.destroy');

        // Wishlist
        Route::get('/auth/wishlist', [WishlistController::class, 'index'])->name('auth.wishlist.index');
        Route::post('/auth/wishlist', [WishlistController::class, 'store'])->name('auth.wishlist.store');
        Route::delete('/auth/wishlist/{wishlistItem}', [WishlistController::class, 'destroy'])->name('auth.wishlist.destroy');

        // Orders
        Route::get('/auth/orders', [OrderController::class, 'index'])->name('auth.orders.index');
        Route::post('/auth/orders', [OrderController::class, 'store'])->name('auth.orders.store');
        Route::get('/auth/orders/{orderNumber}', [OrderController::class, 'show'])->name('auth.orders.show');
        Route::post('/auth/orders/{orderNumber}/pay', [PaymentController::class, 'pay'])->name('auth.orders.pay');
        Route::post('/auth/orders/{orderNumber}/verify', [PaymentController::class, 'verify'])->name('auth.orders.verify');
    });
});

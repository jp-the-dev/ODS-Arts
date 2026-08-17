<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        $this->configureRateLimiting();
        $this->configurePasswordResetLink();
    }

    /**
     * Point the password reset email at the storefront.
     *
     * Laravel's stock notification builds its link with `route('password.reset')`
     * — a web route that does not exist here, because this application is an API
     * and `routes/web.php` only redirects to the storefront. Without this,
     * POST /auth/forgot-password creates the token row and then throws a 500
     * building the email, which is exactly what it did until the reset UI was
     * built and someone finally called it.
     *
     * The path must match the storefront's page, and the query string is what
     * `PasswordResetForm` reads.
     */
    private function configurePasswordResetLink(): void
    {
        ResetPassword::createUrlUsing(fn (object $notifiable, string $token): string => rtrim(
            (string) config('app.frontend_url'),
            '/'
        ).'/reset-password?'.http_build_query([
            'token' => $token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ]));
    }

    /**
     * Rate limits for the public storefront API.
     *
     * Keyed by authenticated user where possible, falling back to IP. Writes are
     * limited far more tightly than reads: the catalogue is browsed constantly,
     * whereas order, payment and form endpoints are the ones worth abusing.
     */
    private function configureRateLimiting(): void
    {
        // Catalogue reads — generous enough for a browsing session.
        RateLimiter::for('api', fn (Request $request) => Limit::perMinute(120)->by($this->fingerprint($request)));

        // Checkout. Tight, but high enough to survive a customer retrying.
        RateLimiter::for('orders', fn (Request $request) => Limit::perMinute(10)->by($this->fingerprint($request)));

        // Payment start/verify — a few attempts per order is normal, spamming is not.
        RateLimiter::for('payments', fn (Request $request) => Limit::perMinute(20)->by($this->fingerprint($request)));

        // Credential endpoints — brute force and enumeration protection. Keyed by
        // IP *and* submitted email so one attacker cannot lock out a real customer.
        RateLimiter::for('auth', fn (Request $request) => Limit::perMinute(6)
            ->by($request->ip().'|'.(string) $request->input('email')));

        // Contact / newsletter forms — the classic spam target.
        RateLimiter::for('forms', fn (Request $request) => Limit::perMinute(5)->by($this->fingerprint($request)));

        // Webhooks are signature-verified and retried by the provider, so the
        // limit only exists to blunt a flood — it must not throttle normal retries.
        RateLimiter::for('webhooks', fn (Request $request) => Limit::perMinute(120)->by($request->ip()));
    }

    private function fingerprint(Request $request): string
    {
        return $request->user()?->id
            ? 'user:'.$request->user()->id
            : 'ip:'.$request->ip();
    }
}

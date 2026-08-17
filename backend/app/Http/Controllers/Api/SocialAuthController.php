<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;
use Throwable;

/**
 * Sign in with a social provider.
 *
 * The storefront authenticates with Sanctum bearer tokens, not sessions, so the
 * callback cannot simply log the user in and redirect — the browser would come
 * back still holding nothing. Instead it mints the token, stashes it behind a
 * short-lived single-use code, and sends only that code back in the URL. The
 * storefront exchanges the code for the token over POST.
 *
 * Putting the token in the redirect itself would leak it into browser history,
 * the Referer header sent to third parties, and every access log in between.
 */
class SocialAuthController extends Controller
{
    /** Providers this application is willing to talk to. */
    private const SUPPORTED = ['google'];

    /**
     * Long enough to survive the redirect and a slow page load, short enough
     * that a code lifted from a log or shoulder-surfed URL is already dead.
     */
    private const CODE_TTL_SECONDS = 120;

    private const CODE_CACHE_PREFIX = 'social-auth:';

    /** GET /api/v1/auth/social/{provider} — hand off to the provider. */
    public function redirect(string $provider): RedirectResponse|JsonResponse
    {
        if (! $this->isConfigured($provider)) {
            return response()->json(['message' => 'That sign-in method is unavailable.'], 503);
        }

        return Socialite::driver($provider)->redirect();
    }

    /**
     * GET /api/v1/auth/social/{provider}/callback — the provider returns here.
     *
     * Always redirects to the storefront, never renders. Any failure is the
     * customer's failure to see, so it carries a reason rather than a stack
     * trace — a cancelled consent screen is a normal outcome, not an error.
     */
    public function callback(Request $request, string $provider): RedirectResponse
    {
        if (! $this->isConfigured($provider)) {
            return $this->back('unavailable');
        }

        // The customer pressed cancel, or the provider refused.
        if (filled($request->query('error'))) {
            return $this->back('cancelled');
        }

        try {
            $socialUser = Socialite::driver($provider)->user();
        } catch (Throwable $e) {
            Log::warning('Social sign-in failed at the provider', [
                'provider' => $provider,
                'error' => $e->getMessage(),
            ]);

            return $this->back('failed');
        }

        $email = $socialUser->getEmail();

        // Without an email there is nothing to key an account on, and silently
        // inventing one would create an account the customer can never recover.
        if (blank($email)) {
            return $this->back('no-email');
        }

        $user = $this->resolveUser($provider, $socialUser, $email);

        $token = $user->createToken('social:'.$provider)->plainTextToken;

        $code = Str::random(64);
        Cache::put(self::CODE_CACHE_PREFIX.$code, $token, self::CODE_TTL_SECONDS);

        return $this->back(null, $code);
    }

    /**
     * POST /api/v1/auth/social/exchange — trade the one-time code for the token.
     *
     * Single use: the code is pulled from the cache, so a replay finds nothing.
     */
    public function exchange(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:128'],
        ]);

        $token = Cache::pull(self::CODE_CACHE_PREFIX.$validated['code']);

        if (blank($token)) {
            return response()->json(['message' => 'That sign-in link has expired. Please try again.'], 422);
        }

        return response()->json(['data' => ['token' => $token]]);
    }

    /**
     * Find or create the account behind a social identity.
     *
     * Linking to an existing account by email is only safe because Google
     * verifies addresses. A provider that did not would let anyone claiming an
     * address take over the account it belongs to.
     */
    private function resolveUser(string $provider, object $socialUser, string $email): User
    {
        return DB::transaction(function () use ($provider, $socialUser, $email): User {
            $providerId = (string) $socialUser->getId();

            $user = User::whereHas(
                'oauthProviders',
                fn ($query) => $query->where('provider', $provider)->where('provider_id', $providerId)
            )->first()
                ?? User::where('email', $email)->first()
                ?? $this->createFromProvider($socialUser, $email);

            // Refreshed on every sign-in — the avatar changes and the tokens expire.
            $user->oauthProviders()->updateOrCreate(
                ['provider' => $provider, 'provider_id' => $providerId],
                [
                    'avatar' => $socialUser->getAvatar(),
                    'token' => $socialUser->token ?? null,
                    'refresh_token' => $socialUser->refreshToken ?? null,
                ],
            );

            return $user;
        });
    }

    /**
     * Create the account behind a first-time social sign-in.
     *
     * `email_verified_at` is set after the insert rather than passed to
     * create(): the User model's Fillable list deliberately excludes it, so
     * mass assignment drops it silently — and widening that list would let a
     * plain registration request mark itself verified.
     */
    private function createFromProvider(object $socialUser, string $email): User
    {
        $user = User::create([
            'name' => $socialUser->getName() ?: $socialUser->getNickname() ?: Str::before($email, '@'),
            'email' => $email,
            // Never null: a null password would let a blank credential through
            // anywhere that checks one. Unusable and unguessable instead.
            'password' => Hash::make(Str::random(64)),
        ]);

        // The provider verified the address, so verifying it again is theatre.
        $user->forceFill(['email_verified_at' => now()])->save();

        return $user;
    }

    private function isConfigured(string $provider): bool
    {
        return in_array($provider, self::SUPPORTED, true)
            && filled(config("services.{$provider}.client_id"))
            && filled(config("services.{$provider}.client_secret"));
    }

    /** Back to the storefront's callback page, with an outcome it can render. */
    private function back(?string $error, ?string $code = null): RedirectResponse
    {
        $query = filled($error) ? ['error' => $error] : ['code' => $code];

        return redirect()->away(
            rtrim((string) config('app.frontend_url'), '/').'/auth/social-callback?'.http_build_query($query)
        );
    }
}

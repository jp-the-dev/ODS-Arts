<?php

declare(strict_types=1);

use App\Models\OAuthProvider;
use App\Models\User;
use Laravel\Socialite\Contracts\Provider;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;

/** A Google profile as Socialite hands it back. */
function fakeGoogleUser(string $id = 'google-123', string $email = 'priya@example.com'): SocialiteUser
{
    $user = new SocialiteUser;
    $user->map([
        'id' => $id,
        'name' => 'Priya Mehta',
        'email' => $email,
        'avatar' => 'https://lh3.googleusercontent.com/a/priya',
    ]);
    $user->token = 'provider-access-token';
    $user->refreshToken = 'provider-refresh-token';

    return $user;
}

function mockSocialiteReturning(SocialiteUser $user): void
{
    $provider = Mockery::mock(Provider::class);
    $provider->shouldReceive('user')->andReturn($user);

    Socialite::shouldReceive('driver')->with('google')->andReturn($provider);
}

/** The `code` the callback put in its redirect. */
function codeFromRedirect(?string $location): string
{
    parse_str((string) parse_url((string) $location, PHP_URL_QUERY), $query);

    return (string) ($query['code'] ?? '');
}

beforeEach(function (): void {
    config()->set('services.google.client_id', 'client-id');
    config()->set('services.google.client_secret', 'client-secret');
    config()->set('app.frontend_url', 'http://localhost:3000');
});

describe('social sign-in availability', function (): void {
    it('refuses a provider with no credentials rather than half-working', function (): void {
        config()->set('services.google.client_id', null);

        $this->getJson('/api/v1/auth/social/google')->assertStatus(503);
    });

    it('refuses a provider it does not support', function (): void {
        $this->getJson('/api/v1/auth/social/myspace')->assertStatus(503);
    });
});

describe('callback', function (): void {
    /**
     * The storefront authenticates with bearer tokens, so the callback cannot
     * just log in and redirect. It hands back something the SPA can trade for a
     * token — and that something must not be the token itself, which would land
     * in browser history, Referer headers and every access log in between.
     */
    it('redirects with a one-time code and never the token', function (): void {
        mockSocialiteReturning(fakeGoogleUser());

        $response = $this->get('/api/v1/auth/social/google/callback');

        $response->assertRedirect();
        $location = (string) $response->headers->get('Location');

        expect($location)->toStartWith('http://localhost:3000/auth/social-callback?')
            ->and($location)->toContain('code=')
            ->and($location)->not->toContain('token=');
    });

    it('creates an account and links the provider on first sign-in', function (): void {
        mockSocialiteReturning(fakeGoogleUser());

        $this->get('/api/v1/auth/social/google/callback')->assertRedirect();

        $user = User::where('email', 'priya@example.com')->firstOrFail();

        expect($user->name)->toBe('Priya Mehta')
            // Google verified the address, so verifying it again is theatre.
            ->and($user->email_verified_at)->not->toBeNull();

        $link = OAuthProvider::where('user_id', $user->id)->firstOrFail();

        expect($link->provider)->toBe('google')
            ->and($link->provider_id)->toBe('google-123')
            ->and($link->avatar)->toBe('https://lh3.googleusercontent.com/a/priya');
    });

    it('links to an existing account with the same email instead of duplicating it', function (): void {
        $existing = User::factory()->create(['email' => 'priya@example.com']);

        mockSocialiteReturning(fakeGoogleUser());

        $this->get('/api/v1/auth/social/google/callback')->assertRedirect();

        expect(User::where('email', 'priya@example.com')->count())->toBe(1)
            ->and(OAuthProvider::where('user_id', $existing->id)->count())->toBe(1);
    });

    it('does not create a second account or link on a repeat sign-in', function (): void {
        mockSocialiteReturning(fakeGoogleUser());

        $this->get('/api/v1/auth/social/google/callback')->assertRedirect();
        $this->get('/api/v1/auth/social/google/callback')->assertRedirect();

        expect(User::where('email', 'priya@example.com')->count())->toBe(1)
            ->and(OAuthProvider::count())->toBe(1);
    });

    /** A provider that shares no email gives us nothing to key an account on. */
    it('reports back when the provider shares no email', function (): void {
        mockSocialiteReturning(fakeGoogleUser(email: ''));

        $this->get('/api/v1/auth/social/google/callback')
            ->assertRedirect('http://localhost:3000/auth/social-callback?error=no-email');

        expect(User::count())->toBe(0);
    });

    /** Pressing cancel on the consent screen is a normal outcome, not a 500. */
    it('reports a cancelled consent screen', function (): void {
        $this->get('/api/v1/auth/social/google/callback?error=access_denied')
            ->assertRedirect('http://localhost:3000/auth/social-callback?error=cancelled');
    });

    it('reports a provider failure without leaking the exception', function (): void {
        $provider = Mockery::mock(Provider::class);
        $provider->shouldReceive('user')->andThrow(new RuntimeException('invalid state'));
        Socialite::shouldReceive('driver')->with('google')->andReturn($provider);

        $this->get('/api/v1/auth/social/google/callback')
            ->assertRedirect('http://localhost:3000/auth/social-callback?error=failed');
    });
});

describe('POST /auth/social/exchange', function (): void {
    it('trades the code for a token that actually authenticates', function (): void {
        mockSocialiteReturning(fakeGoogleUser());

        $code = codeFromRedirect($this->get('/api/v1/auth/social/google/callback')->headers->get('Location'));

        $token = $this->postJson('/api/v1/auth/social/exchange', ['code' => $code])
            ->assertOk()
            ->json('data.token');

        expect($token)->toBeString()->not->toBeEmpty();

        // It must authenticate, not merely look like a token.
        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/auth/user')
            ->assertOk();
    });

    it('cannot be replayed', function (): void {
        mockSocialiteReturning(fakeGoogleUser());

        $code = codeFromRedirect($this->get('/api/v1/auth/social/google/callback')->headers->get('Location'));

        $this->postJson('/api/v1/auth/social/exchange', ['code' => $code])->assertOk();
        $this->postJson('/api/v1/auth/social/exchange', ['code' => $code])->assertStatus(422);
    });

    it('rejects a code that was never issued', function (): void {
        $this->postJson('/api/v1/auth/social/exchange', ['code' => 'never-issued'])->assertStatus(422);
    });

    it('rejects an expired code', function (): void {
        mockSocialiteReturning(fakeGoogleUser());

        $code = codeFromRedirect($this->get('/api/v1/auth/social/google/callback')->headers->get('Location'));

        // Past the two-minute window the callback stores it for.
        $this->travel(3)->minutes();

        $this->postJson('/api/v1/auth/social/exchange', ['code' => $code])->assertStatus(422);
    });

    it('requires a code', function (): void {
        $this->postJson('/api/v1/auth/social/exchange', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors('code');
    });
});

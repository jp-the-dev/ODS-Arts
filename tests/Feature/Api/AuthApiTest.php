<?php

declare(strict_types=1);

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;

describe('POST /auth/register', function (): void {
    it('creates an account and returns a token', function (): void {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Priya Mehta',
            'email' => 'priya@example.com',
            'password' => 'sup3r-secret',
            'password_confirmation' => 'sup3r-secret',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.user.email', 'priya@example.com')
            ->assertJsonStructure(['data' => ['user' => ['id', 'name', 'email'], 'token']]);

        $this->assertDatabaseHas('users', ['email' => 'priya@example.com']);
    });

    it('stores the password hashed, never in plain text', function (): void {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Priya', 'email' => 'p@example.com',
            'password' => 'sup3r-secret', 'password_confirmation' => 'sup3r-secret',
        ])->assertCreated();

        $user = User::first();

        expect($user->password)->not->toBe('sup3r-secret')
            ->and(Hash::check('sup3r-secret', $user->password))->toBeTrue();
    });

    it('never leaks the password hash in the response', function (): void {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Priya', 'email' => 'p@example.com',
            'password' => 'sup3r-secret', 'password_confirmation' => 'sup3r-secret',
        ]);

        expect($response->json('data.user'))->not->toHaveKey('password');
    });

    it('cannot self-promote to admin through the registration payload', function (): void {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Sneaky', 'email' => 'sneaky@example.com',
            'password' => 'sup3r-secret', 'password_confirmation' => 'sup3r-secret',
            'is_admin' => true,
        ])->assertCreated();

        expect(User::where('email', 'sneaky@example.com')->first()->is_admin)->toBeFalse();
    });

    it('cannot self-promote to admin through a profile update', function (): void {
        $user = User::factory()->create(['is_admin' => false]);
        Sanctum::actingAs($user);

        $this->putJson('/api/v1/auth/user', ['name' => 'Still A Customer', 'is_admin' => true])
            ->assertOk();

        expect($user->fresh()->is_admin)->toBeFalse();
    });

    it('rejects a duplicate email', function (): void {
        User::factory()->create(['email' => 'taken@example.com']);

        $this->postJson('/api/v1/auth/register', [
            'name' => 'Someone', 'email' => 'taken@example.com',
            'password' => 'sup3r-secret', 'password_confirmation' => 'sup3r-secret',
        ])->assertStatus(422)->assertJsonValidationErrors('email');
    });

    it('requires a confirmed password of at least 8 characters', function (): void {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'Someone', 'email' => 'new@example.com',
            'password' => 'short', 'password_confirmation' => 'mismatch',
        ])->assertStatus(422)->assertJsonValidationErrors('password');
    });
});

describe('POST /auth/login', function (): void {
    it('returns a token for valid credentials', function (): void {
        User::factory()->create(['email' => 'priya@example.com', 'password' => 'sup3r-secret']);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'priya@example.com', 'password' => 'sup3r-secret',
        ])->assertOk()->assertJsonStructure(['data' => ['user', 'token']]);
    });

    it('gives the same generic error for a wrong password and an unknown email', function (): void {
        User::factory()->create(['email' => 'real@example.com', 'password' => 'sup3r-secret']);

        $wrongPassword = $this->postJson('/api/v1/auth/login', [
            'email' => 'real@example.com', 'password' => 'nope',
        ])->assertStatus(422);

        $unknownEmail = $this->postJson('/api/v1/auth/login', [
            'email' => 'ghost@example.com', 'password' => 'nope',
        ])->assertStatus(422);

        // Identical responses — the endpoint must not reveal which emails exist.
        expect($wrongPassword->json('errors'))->toBe($unknownEmail->json('errors'));
    });
});

describe('authenticated session', function (): void {
    it('rejects the profile endpoint without a token', function (): void {
        $this->getJson('/api/v1/auth/user')->assertUnauthorized();
    });

    it('returns the signed-in customer', function (): void {
        $user = User::factory()->create(['email' => 'me@example.com']);
        Sanctum::actingAs($user);

        $this->getJson('/api/v1/auth/user')
            ->assertOk()
            ->assertJsonPath('data.email', 'me@example.com');
    });

    it('updates the profile', function (): void {
        $user = User::factory()->create(['name' => 'Old Name']);
        Sanctum::actingAs($user);

        $this->putJson('/api/v1/auth/user', ['name' => 'New Name', 'phone' => '+91 9876543210'])
            ->assertOk()
            ->assertJsonPath('data.name', 'New Name')
            ->assertJsonPath('data.phone', '+91 9876543210');
    });

    it('rejects an email already used by someone else', function (): void {
        User::factory()->create(['email' => 'taken@example.com']);
        Sanctum::actingAs(User::factory()->create());

        $this->putJson('/api/v1/auth/user', ['email' => 'taken@example.com'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('email');
    });

    it('changes the password when the current one is correct', function (): void {
        $user = User::factory()->create(['password' => 'old-password']);
        Sanctum::actingAs($user);

        $this->putJson('/api/v1/auth/user/password', [
            'current_password' => 'old-password',
            'new_password' => 'brand-new-password',
            'new_password_confirmation' => 'brand-new-password',
        ])->assertOk();

        expect(Hash::check('brand-new-password', $user->fresh()->password))->toBeTrue();
    });

    it('refuses a password change without the correct current password', function (): void {
        $user = User::factory()->create(['password' => 'old-password']);
        Sanctum::actingAs($user);

        $this->putJson('/api/v1/auth/user/password', [
            'current_password' => 'wrong',
            'new_password' => 'brand-new-password',
            'new_password_confirmation' => 'brand-new-password',
        ])->assertStatus(422)->assertJsonValidationErrors('current_password');

        expect(Hash::check('old-password', $user->fresh()->password))->toBeTrue();
    });
});

describe('POST /auth/forgot-password', function (): void {
    it('reports success for an unknown email, to avoid revealing accounts', function (): void {
        $this->postJson('/api/v1/auth/forgot-password', ['email' => 'ghost@example.com'])
            ->assertOk()
            ->assertJsonStructure(['message']);
    });

    it('requires a valid email', function (): void {
        $this->postJson('/api/v1/auth/forgot-password', ['email' => 'not-an-email'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('email');
    });
});

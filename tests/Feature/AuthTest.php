<?php

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

// ── Registration ──────────────────────────────────────────────────────────────

it('registers a new user', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertCreated()
        ->assertJsonStructure(['message', 'user' => ['id', 'name', 'email']]);

    $this->assertDatabaseHas('users', ['email' => 'jane@example.com']);
});

it('requires password confirmation on register', function () {
    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'password' => 'password',
        'password_confirmation' => 'wrong',
    ]);

    $response->assertUnprocessable();
});

it('requires a unique email on register', function () {
    User::factory()->create(['email' => 'jane@example.com']);

    $response = $this->postJson('/api/v1/auth/register', [
        'name' => 'Jane Doe',
        'email' => 'jane@example.com',
        'password' => 'password',
        'password_confirmation' => 'password',
    ]);

    $response->assertUnprocessable();
});

// ── Login ─────────────────────────────────────────────────────────────────────

it('logs in with valid credentials', function () {
    $user = User::factory()->create([
        'email' => 'jane@example.com',
        'password' => bcrypt('password'),
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'jane@example.com',
        'password' => 'password',
    ]);

    $response->assertOk()
        ->assertJsonStructure(['message', 'user' => ['id', 'name', 'email']]);

    $this->assertAuthenticated();
});

it('rejects invalid credentials', function () {
    User::factory()->create([
        'email' => 'jane@example.com',
        'password' => bcrypt('password'),
    ]);

    $response = $this->postJson('/api/v1/auth/login', [
        'email' => 'jane@example.com',
        'password' => 'wrong-password',
    ]);

    $response->assertUnprocessable();
});

// ── Authenticated routes ──────────────────────────────────────────────────────

it('returns the authenticated user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->getJson('/api/v1/auth/user');

    $response->assertOk()
        ->assertJson([
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
});

it('requires authentication for user endpoint', function () {
    $response = $this->getJson('/api/v1/auth/user');

    $response->assertUnauthorized();
});

it('updates the profile', function () {
    $user = User::factory()->create([
        'name' => 'Original Name',
        'email' => 'original@example.com',
    ]);

    $response = $this->actingAs($user)
        ->putJson('/api/v1/auth/user', [
            'name' => 'Updated Name',
        ]);

    $response->assertOk()
        ->assertJson([
            'data' => [
                'name' => 'Updated Name',
                'email' => 'original@example.com',
            ],
        ]);

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'name' => 'Updated Name',
    ]);
});

it('updates the password', function () {
    $user = User::factory()->create([
        'password' => bcrypt('current-password'),
    ]);

    $response = $this->actingAs($user)
        ->putJson('/api/v1/auth/user/password', [
            'current_password' => 'current-password',
            'new_password' => 'new-password',
            'new_password_confirmation' => 'new-password',
        ]);

    $response->assertOk()
        ->assertJson(['message' => 'Password updated successfully.']);
});

it('rejects wrong current password', function () {
    $user = User::factory()->create([
        'password' => bcrypt('current-password'),
    ]);

    $response = $this->actingAs($user)
        ->putJson('/api/v1/auth/user/password', [
            'current_password' => 'wrong-password',
            'new_password' => 'new-password',
            'new_password_confirmation' => 'new-password',
        ]);

    $response->assertUnprocessable();
});

// ── Logout ────────────────────────────────────────────────────────────────────

it('logs out the authenticated user', function () {
    $user = User::factory()->create();

    $response = $this->actingAs($user)
        ->postJson('/api/v1/auth/logout');

    $response->assertOk()
        ->assertJson(['message' => 'Logged out.']);
});

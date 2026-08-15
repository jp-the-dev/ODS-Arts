<?php

declare(strict_types=1);

use App\Models\Subscriber;

describe('POST /api/v1/newsletter/subscribe', function (): void {
    it('persists a new subscriber', function (): void {
        $this->postJson('/api/v1/newsletter/subscribe', ['email' => 'reader@example.com'])
            ->assertOk()
            ->assertJsonStructure(['message']);

        $this->assertDatabaseHas('subscribers', [
            'email' => 'reader@example.com',
            'status' => 'subscribed',
        ]);
    });

    it('stamps subscribed_at', function (): void {
        $this->postJson('/api/v1/newsletter/subscribe', ['email' => 'reader@example.com'])
            ->assertOk();

        expect(Subscriber::first()->subscribed_at)->not->toBeNull();
    });

    it('is idempotent — a repeat signup does not error or duplicate', function (): void {
        $this->postJson('/api/v1/newsletter/subscribe', ['email' => 'reader@example.com'])->assertOk();
        $this->postJson('/api/v1/newsletter/subscribe', ['email' => 'reader@example.com'])->assertOk();

        expect(Subscriber::where('email', 'reader@example.com')->count())->toBe(1);
    });

    it('re-activates a previously unsubscribed address', function (): void {
        Subscriber::factory()->unsubscribed()->create(['email' => 'returning@example.com']);

        $this->postJson('/api/v1/newsletter/subscribe', ['email' => 'returning@example.com'])
            ->assertOk();

        $subscriber = Subscriber::where('email', 'returning@example.com')->first();

        expect($subscriber->status)->toBe('subscribed')
            ->and($subscriber->unsubscribed_at)->toBeNull();
    });

    it('requires an email', function (): void {
        $this->postJson('/api/v1/newsletter/subscribe', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors('email');
    });

    it('rejects a malformed email', function (): void {
        $this->postJson('/api/v1/newsletter/subscribe', ['email' => 'not-an-email'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('email');

        $this->assertDatabaseCount('subscribers', 0);
    });
});

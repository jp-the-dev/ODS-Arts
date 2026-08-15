<?php

declare(strict_types=1);

use App\Models\Address;
use App\Models\User;
use Laravel\Sanctum\Sanctum;

function addressPayload(array $overrides = []): array
{
    return array_merge([
        'label' => 'Home',
        'full_name' => 'Priya Mehta',
        'phone' => '+91 9876543210',
        'address_line1' => '12 Marine Drive',
        'city' => 'Mumbai',
        'state' => 'Maharashtra',
        'postal_code' => '400020',
        'country' => 'IN',
    ], $overrides);
}

describe('saved addresses', function (): void {
    it('requires authentication', function (): void {
        $this->getJson('/api/v1/auth/addresses')->assertUnauthorized();
        $this->postJson('/api/v1/auth/addresses', addressPayload())->assertUnauthorized();
    });

    it('saves an address', function (): void {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/auth/addresses', addressPayload())
            ->assertCreated()
            ->assertJsonPath('data.label', 'Home')
            ->assertJsonPath('data.city', 'Mumbai');

        $this->assertDatabaseHas('addresses', ['postal_code' => '400020']);
    });

    it('makes the first address the default even when not asked', function (): void {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/auth/addresses', addressPayload(['is_default' => false]))
            ->assertCreated()
            ->assertJsonPath('data.is_default', true);
    });

    it('demotes the previous default when a new default is added', function (): void {
        $user = User::factory()->create();
        Sanctum::actingAs($user);

        $this->postJson('/api/v1/auth/addresses', addressPayload(['label' => 'First']))->assertCreated();
        $this->postJson('/api/v1/auth/addresses', addressPayload(['label' => 'Second', 'is_default' => true]))->assertCreated();

        $defaults = $user->addresses()->where('is_default', true)->get();

        expect($defaults)->toHaveCount(1)
            ->and($defaults->first()->label)->toBe('Second');
    });

    it('lists the default address first', function (): void {
        $user = User::factory()->create();
        $user->addresses()->create(addressPayload(['label' => 'Old', 'is_default' => false]));
        $user->addresses()->create(addressPayload(['label' => 'Default', 'is_default' => true]));

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/v1/auth/addresses')->assertOk();

        expect(array_column($response->json('data'), 'label')[0])->toBe('Default');
    });

    it('only ever lists the signed-in customer addresses', function (): void {
        $mine = User::factory()->create();
        $mine->addresses()->create(addressPayload(['label' => 'Mine']));
        User::factory()->create()->addresses()->create(addressPayload(['label' => 'Theirs']));

        Sanctum::actingAs($mine);

        $response = $this->getJson('/api/v1/auth/addresses')->assertOk();

        expect(array_column($response->json('data'), 'label'))->toBe(['Mine']);
    });

    it('updates an address', function (): void {
        $user = User::factory()->create();
        $address = $user->addresses()->create(addressPayload());
        Sanctum::actingAs($user);

        $this->putJson("/api/v1/auth/addresses/{$address->id}", ['city' => 'Pune'])
            ->assertOk()
            ->assertJsonPath('data.city', 'Pune');
    });

    it('404s when updating an address owned by someone else', function (): void {
        $theirs = User::factory()->create()->addresses()->create(addressPayload());
        Sanctum::actingAs(User::factory()->create());

        $this->putJson("/api/v1/auth/addresses/{$theirs->id}", ['city' => 'Hacked'])
            ->assertNotFound();

        expect($theirs->fresh()->city)->toBe('Mumbai');
    });

    it('404s when deleting an address owned by someone else', function (): void {
        $theirs = User::factory()->create()->addresses()->create(addressPayload());
        Sanctum::actingAs(User::factory()->create());

        $this->deleteJson("/api/v1/auth/addresses/{$theirs->id}")->assertNotFound();

        expect(Address::find($theirs->id))->not->toBeNull();
    });

    it('deletes an address', function (): void {
        $user = User::factory()->create();
        $address = $user->addresses()->create(addressPayload());
        Sanctum::actingAs($user);

        $this->deleteJson("/api/v1/auth/addresses/{$address->id}")->assertOk();

        expect(Address::find($address->id))->toBeNull();
    });

    it('promotes another address to default when the default is deleted', function (): void {
        $user = User::factory()->create();
        $default = $user->addresses()->create(addressPayload(['label' => 'Default', 'is_default' => true]));
        $other = $user->addresses()->create(addressPayload(['label' => 'Other', 'is_default' => false]));

        Sanctum::actingAs($user);

        $this->deleteJson("/api/v1/auth/addresses/{$default->id}")->assertOk();

        expect($other->fresh()->is_default)->toBeTrue();
    });

    it('validates required fields', function (): void {
        Sanctum::actingAs(User::factory()->create());

        $this->postJson('/api/v1/auth/addresses', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['label', 'full_name', 'phone', 'address_line1', 'city', 'state', 'postal_code']);
    });
});

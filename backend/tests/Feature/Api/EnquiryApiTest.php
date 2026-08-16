<?php

declare(strict_types=1);

use App\Models\Enquiry;

describe('POST /api/v1/enquiries', function (): void {
    it('stores a valid enquiry and returns its id', function (): void {
        $response = $this->postJson('/api/v1/enquiries', [
            'name' => 'Priya Mehta',
            'email' => 'priya@example.com',
            'message' => 'I would like a quote for a walnut frame.',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['data' => ['id'], 'message']);

        $this->assertDatabaseHas('enquiries', [
            'email' => 'priya@example.com',
            'type' => 'contact',
            'status' => 'new',
        ]);
    });

    it('defaults to the contact type', function (): void {
        $this->postJson('/api/v1/enquiries', [
            'name' => 'Test',
            'email' => 'test@example.com',
            'message' => 'Hello.',
        ])->assertCreated();

        expect(Enquiry::first()->type)->toBe('contact');
    });

    it('accepts the custom_framing and gifting types', function (string $type): void {
        $this->postJson('/api/v1/enquiries', [
            'name' => 'Test',
            'email' => 'test@example.com',
            'message' => 'Hello.',
            'type' => $type,
        ])->assertCreated();

        expect(Enquiry::first()->type)->toBe($type);
    })->with(['custom_framing', 'gifting']);

    it('rejects an unknown type', function (): void {
        $this->postJson('/api/v1/enquiries', [
            'name' => 'Test',
            'email' => 'test@example.com',
            'message' => 'Hello.',
            'type' => 'spam',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('type');
    });

    it('requires name, email and message', function (): void {
        $this->postJson('/api/v1/enquiries', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'message']);
    });

    it('rejects a malformed email', function (): void {
        $this->postJson('/api/v1/enquiries', [
            'name' => 'Test',
            'email' => 'not-an-email',
            'message' => 'Hello.',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('email');
    });

    it('rejects a message longer than 2000 characters', function (): void {
        $this->postJson('/api/v1/enquiries', [
            'name' => 'Test',
            'email' => 'test@example.com',
            'message' => str_repeat('a', 2001),
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('message');
    });

    it('stores an optional phone number', function (): void {
        $this->postJson('/api/v1/enquiries', [
            'name' => 'Test',
            'email' => 'test@example.com',
            'phone' => '+91 9876543210',
            'message' => 'Hello.',
        ])->assertCreated();

        $this->assertDatabaseHas('enquiries', ['phone' => '+91 9876543210']);
    });
});

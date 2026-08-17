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

    /**
     * The custom-framing form sends the chosen configuration alongside the
     * message. The column, the cast and the fillable entry were all in place,
     * but nothing validated it — and the controller spreads only what was
     * validated, so every one of these arrived with metadata NULL.
     */
    it('stores the structured metadata a framing enquiry carries', function (): void {
        $metadata = [
            'artwork_provided' => true,
            'size' => ['width_cm' => 40, 'height_cm' => 50],
            'mat' => ['style' => 'single', 'colour' => 'ivory'],
            'frame' => ['collection' => 'walnut', 'finish' => 'natural'],
            'estimated_price_paise' => 249900,
        ];

        $this->postJson('/api/v1/enquiries', [
            'name' => 'Priya Mehta',
            'email' => 'priya@example.com',
            'message' => 'Please quote for this piece.',
            'type' => 'custom_framing',
            'metadata' => $metadata,
        ])->assertCreated();

        $enquiry = Enquiry::latest('id')->firstOrFail();

        expect($enquiry->type)->toBe('custom_framing')
            // Cast to array, so it comes back as it went in.
            ->and($enquiry->metadata)->toBe($metadata);
    });

    it('leaves metadata null when none is sent', function (): void {
        $this->postJson('/api/v1/enquiries', [
            'name' => 'Test',
            'email' => 'test@example.com',
            'message' => 'Just a question.',
        ])->assertCreated();

        expect(Enquiry::latest('id')->firstOrFail()->metadata)->toBeNull();
    });

    it('rejects metadata that is not an object', function (): void {
        $this->postJson('/api/v1/enquiries', [
            'name' => 'Test',
            'email' => 'test@example.com',
            'message' => 'Hello.',
            'metadata' => 'not-an-object',
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('metadata');
    });

    /**
     * This endpoint is public and unauthenticated, so the payload is bounded.
     * Counting top-level keys alone would accept a handful of keys holding
     * megabytes of nested junk, which is why the encoded size is checked too.
     */
    it('rejects metadata with too many keys', function (): void {
        $this->postJson('/api/v1/enquiries', [
            'name' => 'Test',
            'email' => 'test@example.com',
            'message' => 'Hello.',
            'metadata' => array_fill_keys(array_map(fn (int $i): string => "k{$i}", range(1, 41)), 'v'),
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('metadata');
    });

    it('rejects metadata that is small in keys but huge in bytes', function (): void {
        $this->postJson('/api/v1/enquiries', [
            'name' => 'Test',
            'email' => 'test@example.com',
            'message' => 'Hello.',
            'metadata' => ['blob' => str_repeat('a', 9000)],
        ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('metadata');
    });
});

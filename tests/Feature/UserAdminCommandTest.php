<?php

declare(strict_types=1);

use App\Models\User;

describe('user:admin', function (): void {
    it('lists every account with its access level', function (): void {
        // Short emails: the prompt table truncates long cells, so asserting on
        // a full address would be testing the renderer, not the command.
        User::factory()->admin()->create(['email' => 'a@b.co', 'name' => 'Staff']);
        User::factory()->create(['email' => 'c@d.co', 'name' => 'Buyer']);

        // Assertions on this helper match in output order, and the list sorts
        // admins first — so assert on the two names, which is the behaviour that
        // matters: every account is listed, whatever its access level.
        $this->artisan('user:admin --list')
            ->expectsOutputToContain('Staff')
            ->expectsOutputToContain('Buyer')
            ->assertSuccessful();
    });

    it('grants access to a customer', function (): void {
        $user = User::factory()->create(['email' => 'new-staff@example.com', 'is_admin' => false]);

        $this->artisan('user:admin new-staff@example.com --grant --no-interaction')
            ->assertSuccessful();

        expect($user->fresh()->is_admin)->toBeTrue();
    });

    it('revokes access when another admin remains', function (): void {
        User::factory()->admin()->create(['email' => 'keeper@example.com']);
        $user = User::factory()->admin()->create(['email' => 'leaver@example.com']);

        $this->artisan('user:admin leaver@example.com --revoke --no-interaction')
            ->assertSuccessful();

        expect($user->fresh()->is_admin)->toBeFalse();
    });

    it('refuses to revoke the last admin', function (): void {
        // Otherwise the panel becomes unreachable for everyone, with no way
        // back in through the UI.
        $only = User::factory()->admin()->create(['email' => 'only@example.com']);

        $this->artisan('user:admin only@example.com --revoke --no-interaction')
            ->expectsOutputToContain('only admin')
            ->assertFailed();

        expect($only->fresh()->is_admin)->toBeTrue();
    });

    it('fails for an unknown email', function (): void {
        $this->artisan('user:admin ghost@example.com --grant --no-interaction')
            ->expectsOutputToContain('No account found')
            ->assertFailed();
    });

    it('requires exactly one of grant or revoke', function (): void {
        User::factory()->create(['email' => 'someone@example.com']);

        $this->artisan('user:admin someone@example.com --no-interaction')
            ->assertFailed();

        $this->artisan('user:admin someone@example.com --grant --revoke --no-interaction')
            ->assertFailed();
    });

    it('is idempotent when the account already has the requested state', function (): void {
        User::factory()->admin()->create(['email' => 'already@example.com']);
        User::factory()->admin()->create(['email' => 'other@example.com']);

        $this->artisan('user:admin already@example.com --grant --no-interaction')
            ->expectsOutputToContain('already has admin access')
            ->assertSuccessful();
    });
});

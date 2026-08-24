<?php

declare(strict_types=1);

use App\Models\FrameOption;
use App\Models\Product;
use App\Models\User;

/** Put the environment in a launch-ready state, so each test can break one thing. */
function readyEnvironment(): void
{
    config()->set('app.debug', false);
    config()->set('app.key', 'base64:'.base64_encode(str_repeat('a', 32)));
    config()->set('app.frontend_url', 'https://odsarts.in');
    config()->set('app.name', 'ODSArts');
    config()->set('mail.default', 'smtp');
    config()->set('mail.from.address', 'hello@odsarts.in');
    config()->set('services.razorpay.key', 'rzp_key');
    config()->set('services.razorpay.secret', 'rzp_secret');
    config()->set('services.razorpay.webhook_secret', 'hook');
    config()->set('services.shiprocket.email', 'ops@odsarts.in');
    config()->set('services.shiprocket.password', 'secret');
    config()->set('services.shiprocket.dry_run', false);
    config()->set('services.shiprocket.webhook_token', 'shiprocket-webhook');

    Product::factory()->create();
    FrameOption::factory()->create();
    User::factory()->admin()->create();
}

describe('odsarts:preflight', function (): void {
    it('passes when everything is configured', function (): void {
        readyEnvironment();

        $this->artisan('odsarts:preflight')
            ->expectsOutputToContain('No blockers')
            ->assertSuccessful();
    });

    it('blocks when mail would silently discard confirmations', function (): void {
        readyEnvironment();
        config()->set('mail.default', 'log');

        $this->artisan('odsarts:preflight')
            ->expectsOutputToContain('silently discards')
            ->assertFailed();
    });

    it('blocks when payments are unconfigured', function (): void {
        readyEnvironment();
        config()->set('services.razorpay.key', null);

        $this->artisan('odsarts:preflight')
            ->expectsOutputToContain('cannot take payment')
            ->assertFailed();
    });

    it('blocks when nobody can reach the admin panel', function (): void {
        readyEnvironment();
        User::query()->update(['is_admin' => false]);

        $this->artisan('odsarts:preflight')
            ->expectsOutputToContain('nobody can reach /admin')
            ->assertFailed();
    });

    it('blocks when the catalogue is empty', function (): void {
        config()->set('mail.default', 'smtp');
        config()->set('services.razorpay.key', 'k');
        config()->set('services.razorpay.secret', 's');
        User::factory()->admin()->create();

        $this->artisan('odsarts:preflight')
            ->expectsOutputToContain('no active products')
            ->assertFailed();
    });

    it('blocks while the app name is still the framework default', function (): void {
        readyEnvironment();
        config()->set('app.name', 'Laravel');

        // It is the sender name on every order confirmation, so a customer
        // would receive mail from "Laravel".
        $this->artisan('odsarts:preflight')
            ->expectsOutputToContain('still "Laravel"')
            ->assertFailed();
    });

    it('blocks when debug mode is on in production', function (): void {
        readyEnvironment();
        config()->set('app.debug', true);
        app()->detectEnvironment(fn (): string => 'production');

        $this->artisan('odsarts:preflight')
            ->expectsOutputToContain('leaks stack traces')
            ->assertFailed();
    });

    it('warns without blocking when shipping is still in dry run', function (): void {
        readyEnvironment();
        config()->set('services.shiprocket.dry_run', true);

        // Dry-run shipping is a normal pre-launch state, not a blocker: orders
        // still complete, they just are not booked with a courier.
        $this->artisan('odsarts:preflight')
            ->expectsOutputToContain('dry run')
            ->assertSuccessful();
    });

    it('warns without blocking when the payment webhook secret is missing', function (): void {
        readyEnvironment();
        config()->set('services.razorpay.webhook_secret', null);

        $this->artisan('odsarts:preflight')
            ->expectsOutputToContain('may never confirm')
            ->assertSuccessful();
    });
});

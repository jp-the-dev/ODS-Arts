<?php

declare(strict_types=1);

it('redirects the web root to the storefront', function (): void {
    // This app is API-only: the storefront is the Next.js front end and the
    // admin is Filament at /admin, so nothing is served from the web root.
    config()->set('app.frontend_url', 'https://odsarts.in');

    $this->get('/')->assertRedirect('https://odsarts.in');
});

it('serves the health check', function (): void {
    $this->get('/up')->assertOk();
});

<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
| Return the stock held by checkouts that were never paid for. Without this the
| catalogue drifts towards reporting sold out for units nobody bought, and the
| drift is invisible until it turns a real customer away.
|
| withoutOverlapping matters: a slow pass must not run alongside the next one.
*/
Schedule::command('odsarts:release-abandoned-stock')
    ->everyFifteenMinutes()
    ->withoutOverlapping()
    ->runInBackground();

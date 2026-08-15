<?php

namespace App\Console\Commands;

use App\Models\FrameOption;
use App\Models\Product;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

/**
 * Launch readiness check.
 *
 * Most of what stands between this codebase and taking real money is
 * configuration, not code — and every item is silent when wrong: a missing
 * Razorpay key only surfaces when a customer tries to pay, `MAIL_MAILER=log`
 * quietly discards order confirmations, and an unrun queue worker leaves both
 * mail and fulfilment sitting in a table.
 *
 * This makes each of those loud and checkable before launch rather than after.
 */
class Preflight extends Command
{
    protected $signature = 'odsarts:preflight';

    protected $description = 'Check whether this environment is ready to take real orders';

    /** @var list<array{level: string, area: string, detail: string}> */
    private array $results = [];

    public function handle(): int
    {
        $this->newLine();
        $this->line('  <options=bold>ODSArts preflight</> — '.config('app.env'));
        $this->newLine();

        $this->checkEnvironment();
        $this->checkDatabase();
        $this->checkCatalogue();
        $this->checkAdmin();
        $this->checkMail();
        $this->checkQueue();
        $this->checkPayments();
        $this->checkShipping();

        $this->render();

        $blockers = collect($this->results)->where('level', 'fail')->count();

        if ($blockers > 0) {
            $this->newLine();
            $this->error("  {$blockers} blocker".($blockers === 1 ? '' : 's').' — this environment cannot take real orders yet.');
            $this->newLine();

            return self::FAILURE;
        }

        $this->newLine();
        $this->info('  No blockers. Warnings above are worth reading before launch.');
        $this->newLine();

        return self::SUCCESS;
    }

    private function checkEnvironment(): void
    {
        $isProduction = app()->environment('production');

        $this->record(
            $isProduction ? 'pass' : 'warn',
            'Environment',
            $isProduction ? 'production' : config('app.env').' — set APP_ENV=production before launch',
        );

        $this->record(
            config('app.debug') ? ($isProduction ? 'fail' : 'warn') : 'pass',
            'Debug mode',
            config('app.debug')
                ? 'APP_DEBUG is on — it leaks stack traces and config to visitors'
                : 'off',
        );

        $this->record(
            filled(config('app.key')) ? 'pass' : 'fail',
            'App key',
            filled(config('app.key')) ? 'set' : 'missing — run php artisan key:generate',
        );

        $frontend = (string) config('app.frontend_url');
        $isLocal = str_contains($frontend, 'localhost') || str_contains($frontend, '127.0.0.1');

        $this->record(
            blank($frontend) ? 'fail' : ($isLocal ? 'warn' : 'pass'),
            'Storefront URL',
            blank($frontend) ? 'FRONTEND_URL is unset — email links will be broken' : $frontend,
        );
    }

    private function checkDatabase(): void
    {
        try {
            DB::connection()->getPdo();
        } catch (Throwable $e) {
            $this->record('fail', 'Database', 'cannot connect — '.$e->getMessage());

            return;
        }

        $this->record('pass', 'Database', config('database.default').' connected');

        // A pending migration in production means the schema does not match the
        // code that is about to run against it.
        $pending = collect(app('migrator')->getMigrationFiles(database_path('migrations')))
            ->keys()
            ->diff(app('migrator')->getRepository()->getRan())
            ->count();

        $this->record(
            $pending === 0 ? 'pass' : 'fail',
            'Migrations',
            $pending === 0 ? 'all applied' : "{$pending} pending — run php artisan migrate",
        );
    }

    private function checkCatalogue(): void
    {
        $products = Product::active()->count();

        $this->record(
            $products > 0 ? 'pass' : 'fail',
            'Catalogue',
            $products > 0 ? "{$products} active products" : 'no active products — the storefront would be empty',
        );

        // This one bit us once already: the seeder existed and was registered,
        // but had never run, so the framing calculator could match no options.
        $frameOptions = FrameOption::active()->count();

        $this->record(
            $frameOptions > 0 ? 'pass' : 'warn',
            'Frame options',
            $frameOptions > 0
                ? "{$frameOptions} options"
                : 'none — run php artisan db:seed --class=FrameOptionSeeder',
        );
    }

    private function checkAdmin(): void
    {
        if (! Schema::hasColumn('users', 'is_admin')) {
            $this->record('fail', 'Admin access', 'users.is_admin missing — run php artisan migrate');

            return;
        }

        $admins = User::where('is_admin', true)->count();

        $this->record(
            $admins > 0 ? 'pass' : 'fail',
            'Admin access',
            $admins > 0
                ? "{$admins} account".($admins === 1 ? '' : 's').' can reach /admin'
                : 'nobody can reach /admin — php artisan user:admin you@example.com --grant',
        );
    }

    private function checkMail(): void
    {
        $mailer = config('mail.default');

        $this->record(
            $mailer === 'log' ? 'fail' : ($mailer === 'array' ? 'fail' : 'pass'),
            'Mail',
            in_array($mailer, ['log', 'array'], true)
                ? "MAIL_MAILER={$mailer} silently discards order confirmations"
                : $mailer,
        );

        $from = (string) config('mail.from.address');

        $this->record(
            blank($from) || str_contains($from, 'example.com') ? 'warn' : 'pass',
            'Mail from',
            blank($from) ? 'unset' : $from,
        );
    }

    private function checkQueue(): void
    {
        $driver = config('queue.default');

        $this->record(
            $driver === 'sync' ? 'warn' : 'pass',
            'Queue driver',
            $driver === 'sync'
                ? 'sync — order mail and fulfilment run inline, slowing checkout'
                : $driver,
        );

        if ($driver === 'sync' || ! Schema::hasTable('jobs')) {
            return;
        }

        $pending = DB::table('jobs')->count();
        $failed = Schema::hasTable('failed_jobs') ? DB::table('failed_jobs')->count() : 0;

        // A backlog usually means no worker is running — which looks like
        // "customers get no email" rather than an error anyone would notice.
        $this->record(
            $pending > 25 ? 'warn' : 'pass',
            'Queue backlog',
            $pending === 0
                ? 'empty — remember a worker must be running (php artisan queue:work)'
                : "{$pending} pending — is a worker running?",
        );

        if ($failed > 0) {
            $this->record('warn', 'Failed jobs', "{$failed} — inspect with php artisan queue:failed");
        }
    }

    private function checkPayments(): void
    {
        $configured = filled(config('services.razorpay.key'))
            && filled(config('services.razorpay.secret'));

        $this->record(
            $configured ? 'pass' : 'fail',
            'Payments',
            $configured
                ? 'Razorpay keys present'
                : 'RAZORPAY_KEY/SECRET unset — checkout creates orders but cannot take payment',
        );

        // Without this the browser is the only confirmation path, so a customer
        // closing the tab mid-payment leaves a paid order stuck as pending.
        $this->record(
            filled(config('services.razorpay.webhook_secret')) ? 'pass' : 'warn',
            'Payment webhook',
            filled(config('services.razorpay.webhook_secret'))
                ? 'secret present'
                : 'RAZORPAY_WEBHOOK_SECRET unset — captured payments may never confirm',
        );
    }

    private function checkShipping(): void
    {
        $configured = filled(config('services.shiprocket.email'))
            && filled(config('services.shiprocket.password'));
        $dryRun = (bool) config('services.shiprocket.dry_run', true);

        $this->record(
            $configured && ! $dryRun ? 'pass' : 'warn',
            'Shipping',
            match (true) {
                ! $configured => 'Shiprocket credentials unset — orders will not be booked',
                $dryRun => 'dry run — nothing is actually booked (SHIPROCKET_DRY_RUN=false to go live)',
                default => 'live',
            },
        );
    }

    private function record(string $level, string $area, string $detail): void
    {
        $this->results[] = compact('level', 'area', 'detail');
    }

    private function render(): void
    {
        foreach ($this->results as $result) {
            [$icon, $colour] = match ($result['level']) {
                'pass' => ['✓', 'green'],
                'warn' => ['!', 'yellow'],
                default => ['✗', 'red'],
            };

            $this->line(sprintf(
                '  <fg=%s>%s</> %-18s <fg=gray>%s</>',
                $colour, $icon, $result['area'], $result['detail'],
            ));
        }
    }
}

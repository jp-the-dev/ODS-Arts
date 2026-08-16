<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;

use function Laravel\Prompts\confirm;

/**
 * Manage Filament panel access.
 *
 * Storefront customers and staff share the `users` table, and registration is
 * public — so panel access is an explicit flag rather than "any account".
 * Granting it through a command keeps that decision visible and repeatable,
 * instead of a tinker one-liner nobody can audit.
 */
class UserAdmin extends Command
{
    protected $signature = 'user:admin
                            {email? : The account to change}
                            {--grant : Give this account admin access}
                            {--revoke : Remove admin access}
                            {--list : Show every account and its access}';

    protected $description = 'Grant, revoke or list admin access to the Filament panel';

    public function handle(): int
    {
        if ($this->option('list') || blank($this->argument('email'))) {
            return $this->listUsers();
        }

        $email = (string) $this->argument('email');
        $user = User::where('email', $email)->first();

        if (! $user) {
            $this->error("No account found for {$email}.");

            return self::FAILURE;
        }

        $grant = $this->option('grant');
        $revoke = $this->option('revoke');

        if ($grant === $revoke) {
            $this->error('Pass exactly one of --grant or --revoke.');

            return self::FAILURE;
        }

        if ($grant && $user->is_admin) {
            $this->info("{$email} already has admin access.");

            return self::SUCCESS;
        }

        if ($revoke && ! $user->is_admin) {
            $this->info("{$email} does not have admin access.");

            return self::SUCCESS;
        }

        // Refuse to remove the last admin — that locks everyone out of /admin
        // with no way back in except another command run.
        if ($revoke && User::where('is_admin', true)->count() === 1) {
            $this->error("{$email} is the only admin. Grant access to someone else first.");

            return self::FAILURE;
        }

        $action = $grant ? 'Grant' : 'Revoke';

        if (! $this->option('no-interaction') && ! confirm("{$action} admin access for {$email}?")) {
            $this->line('No change made.');

            return self::SUCCESS;
        }

        $user->update(['is_admin' => $grant]);

        $this->info($grant
            ? "{$email} can now sign in at /admin."
            : "{$email} no longer has admin access.");

        return self::SUCCESS;
    }

    private function listUsers(): int
    {
        $users = User::orderByDesc('is_admin')->orderBy('id')->get();

        if ($users->isEmpty()) {
            $this->warn('No accounts yet.');

            return self::SUCCESS;
        }

        // $this->table() rather than Laravel\Prompts\table(): the prompt helper
        // targets interactive terminals and does not render into captured output.
        $this->table(
            ['ID', 'Name', 'Email', 'Panel access', 'Registered'],
            $users->map(fn (User $user): array => [
                $user->id,
                $user->name,
                $user->email,
                $user->is_admin ? 'admin' : 'customer',
                $user->created_at?->format('d M Y') ?? '—',
            ])->all(),
        );

        $this->line('  Grant with:  php artisan user:admin someone@example.com --grant');
        $this->line('  Revoke with: php artisan user:admin someone@example.com --revoke');

        return self::SUCCESS;
    }
}

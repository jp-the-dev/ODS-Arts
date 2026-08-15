<?php

namespace App\Console\Commands;

use App\Models\Order;
use App\Services\OrderStock;
use Illuminate\Console\Command;

/**
 * Give back the stock held by checkouts that were never paid for.
 *
 * Stock is decremented when the order is created, so every abandoned cart and
 * every declined card holds its units. Nothing released them, so the catalogue
 * drifts steadily towards reporting things as sold out that nobody bought — and
 * it is invisible until a real customer is turned away.
 */
class ReleaseAbandonedStock extends Command
{
    protected $signature = 'odsarts:release-abandoned-stock
                            {--minutes= : How long an order may go unpaid first}
                            {--dry-run : List what would be released, change nothing}';

    protected $description = 'Return stock held by orders that were never paid for';

    public function handle(): int
    {
        $minutes = (int) ($this->option('minutes') ?? config('orders.release_stock_after_minutes', 60));

        if ($minutes < 1) {
            $this->error('  --minutes must be at least 1.');

            return self::FAILURE;
        }

        $dryRun = (bool) $this->option('dry-run');
        $cutoff = now()->subMinutes($minutes);

        $orders = Order::query()
            ->with('items')
            ->whereIn('payment_status', ['pending', 'failed'])
            ->whereNull('stock_released_at')
            ->where('created_at', '<=', $cutoff)
            ->orderBy('id')
            ->get();

        if ($orders->isEmpty()) {
            $this->info("  Nothing to release — no unpaid orders older than {$minutes} minutes.");

            return self::SUCCESS;
        }

        $this->newLine();
        $this->line("  <options=bold>{$orders->count()}</> unpaid order".($orders->count() === 1 ? '' : 's')." older than {$minutes} minutes.");

        if ($dryRun) {
            $this->line('  <fg=yellow>Dry run — no stock will be returned.</>');
        }

        $this->newLine();

        $released = 0;

        foreach ($orders as $order) {
            $units = $dryRun
                ? (int) $order->items->sum('quantity')
                : OrderStock::release($order);

            if ($units === 0 && ! $dryRun) {
                // Paid or already released between the query and the update.
                $this->line(sprintf('  <fg=gray>–</> %-22s skipped', $order->order_number));

                continue;
            }

            $this->line(sprintf(
                '  <fg=green>✓</> %-22s %-10s %d unit%s returned',
                $order->order_number,
                $order->payment_status,
                $units,
                $units === 1 ? '' : 's',
            ));

            $released += $units;
        }

        $this->newLine();
        $this->info("  {$released} unit".($released === 1 ? '' : 's').($dryRun ? ' would be returned.' : ' returned to stock.'));
        $this->newLine();

        return self::SUCCESS;
    }
}

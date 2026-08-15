<?php

namespace App\Console\Commands;

use App\Mail\OrderConfirmation;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Prove the mail setup actually delivers.
 *
 * Order confirmations are queued, so a broken mail configuration fails inside a
 * worker where nobody is looking — checkout still returns 201 and the customer
 * simply never hears from us. This sends the real OrderConfirmation mailable,
 * rendered from a real order, so a misconfiguration surfaces here instead.
 */
class MailTest extends Command
{
    protected $signature = 'odsarts:mail-test
                            {email : Where to send the test}
                            {--queue : Dispatch through the queue, as checkout does}';

    protected $description = 'Send a real order confirmation to verify mail delivery';

    public function handle(): int
    {
        $to = (string) $this->argument('email');

        if (! filter_var($to, FILTER_VALIDATE_EMAIL)) {
            $this->error("'{$to}' is not a valid email address.");

            return self::FAILURE;
        }

        $mailer = config('mail.default');

        if (in_array($mailer, ['log', 'array'], true)) {
            $this->warn("MAIL_MAILER={$mailer} — nothing will actually be delivered.");
            $this->line(match ($mailer) {
                'log' => '  The message will be written to storage/logs/laravel.log instead.',
                default => '  The message will be discarded entirely.',
            });
            $this->newLine();
        }

        $order = $this->sampleOrder();

        if (! $order) {
            $this->error('No orders exist to render. Place one first, or seed the database.');

            return self::FAILURE;
        }

        $this->line("  Mailer:  <options=bold>{$mailer}</>");
        $this->line('  From:    '.config('mail.from.address'));
        $this->line("  To:      {$to}");
        $this->line('  Order:   '.$order->order_number);
        $this->newLine();

        try {
            if ($this->option('queue')) {
                Mail::to($to)->queue(new OrderConfirmation($order));

                $this->info('  Queued. Run a worker to send it: php artisan queue:work --once');
                $this->line('  <fg=gray>This is the path checkout uses, so it also proves the worker.</>');

                return self::SUCCESS;
            }

            Mail::to($to)->send(new OrderConfirmation($order));
        } catch (Throwable $e) {
            $this->newLine();
            $this->error('  Delivery failed: '.$e->getMessage());
            $this->line('  <fg=gray>Check MAIL_HOST, MAIL_PORT, MAIL_USERNAME and MAIL_PASSWORD.</>');

            return self::FAILURE;
        }

        $this->info('  Sent without error.');

        if ($mailer === 'log') {
            $this->line('  <fg=gray>Look in storage/logs/laravel.log — it was not actually delivered.</>');
        } else {
            $this->line("  <fg=gray>Check {$to}, including its spam folder.</>");
        }

        return self::SUCCESS;
    }

    /**
     * A real order to render, so the test exercises the same template and data
     * a customer receives rather than a stand-in that cannot fail the same way.
     */
    private function sampleOrder(): ?Order
    {
        $order = Order::with('items')->latest('id')->first();

        if (! $order) {
            return null;
        }

        // An order with no line items would render an empty table and hide a
        // broken loop, so give the preview one.
        if ($order->items->isEmpty()) {
            $order->setRelation('items', collect([
                new OrderItem([
                    'name' => 'Classic Box — 8" × 10"',
                    'sku' => 'SAMPLE',
                    'unit_price_paise' => 899900,
                    'quantity' => 1,
                    'subtotal_paise' => 899900,
                ]),
            ]));
        }

        return $order;
    }
}

<?php

declare(strict_types=1);

namespace App\Services;

use App\Models\Invoice;
use App\Models\Order;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * Issues the GST tax invoice for a paid order.
 *
 * GST requires a consecutive series, which rules out deriving the number from
 * the order reference — those are random by design so they cannot be guessed.
 * The sequence therefore lives on the invoice itself and is allocated under a
 * row lock.
 */
final class InvoiceIssuer
{
    /**
     * Issue the invoice for an order, or return the one it already has.
     *
     * Idempotent: payment is confirmed from both /verify and the Razorpay
     * webhook, and either may arrive first or twice.
     */
    public static function issue(Order $order): Invoice
    {
        return DB::transaction(function () use ($order): Invoice {
            $existing = Invoice::where('order_id', $order->getKey())->first();

            if ($existing) {
                return $existing;
            }

            $issuedAt = now();
            $financialYear = self::financialYear($issuedAt);

            // Serialise allocation of the next number. Two payments confirming
            // at the same moment would otherwise read the same last sequence
            // and both try to write it — one dies on the unique key, and the
            // series is meant to have no gaps.
            $lastSequence = (int) Invoice::where('financial_year', $financialYear)
                ->lockForUpdate()
                ->max('sequence');

            $sequence = $lastSequence + 1;

            $order->loadMissing('items');

            $address = $order->billing_address ?: $order->shipping_address ?: [];
            $buyerState = $address['state'] ?? null;
            $intraState = Gst::isIntraState($buyerState);

            // Carve the tax out of the gross total. Shipping is currently always
            // zero; when it starts being charged it needs its own HSN line
            // rather than being folded in here.
            $split = Gst::split((int) $order->total);
            $heads = Gst::heads($split['tax'], $intraState);

            return Invoice::create([
                'order_id' => $order->getKey(),
                'number' => self::formatNumber($financialYear, $sequence),
                'financial_year' => $financialYear,
                'sequence' => $sequence,
                'issued_at' => $issuedAt,

                'seller_name' => (string) config('invoice.seller.legal_name'),
                'seller_gstin' => config('invoice.seller.gstin'),
                'seller_address' => self::sellerAddress(),
                'seller_state' => (string) config('invoice.seller.state'),
                'seller_state_code' => (string) config('invoice.seller.state_code'),

                'place_of_supply' => (string) ($buyerState ?: config('invoice.seller.state')),
                'place_of_supply_code' => Gst::stateCode($buyerState),
                'is_intra_state' => $intraState,

                'hsn_code' => config('invoice.gst.hsn_code'),
                'gst_rate' => Gst::enabled() ? Gst::rate() : 0,
                'taxable_value' => $split['taxable'],
                'cgst' => $heads['cgst'],
                'sgst' => $heads['sgst'],
                'igst' => $heads['igst'],
                'total' => (int) $order->total,
            ]);
        });
    }

    /**
     * The Indian financial year containing a date, as `2026-27`.
     *
     * It begins on 1 April, so anything in January to March belongs to the year
     * that started the previous April.
     */
    public static function financialYear(Carbon $date): string
    {
        $startYear = $date->month >= 4 ? $date->year : $date->year - 1;

        return $startYear.'-'.substr((string) ($startYear + 1), 2);
    }

    private static function formatNumber(string $financialYear, int $sequence): string
    {
        return sprintf(
            '%s/%s/%s',
            config('invoice.series.prefix'),
            $financialYear,
            str_pad((string) $sequence, (int) config('invoice.series.padding'), '0', STR_PAD_LEFT),
        );
    }

    private static function sellerAddress(): string
    {
        return collect([
            config('invoice.seller.address_line_1'),
            config('invoice.seller.address_line_2'),
            trim(implode(' ', array_filter([
                config('invoice.seller.city'),
                config('invoice.seller.pincode'),
            ]))),
            config('invoice.seller.state'),
        ])->filter(fn ($line): bool => filled($line))->implode("\n");
    }
}

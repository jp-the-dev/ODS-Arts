<?php

declare(strict_types=1);

namespace App\Services;

/**
 * GST arithmetic and place-of-supply rules.
 *
 * Prices are tax-inclusive, so the taxable value is carved back out of the
 * gross amount rather than added to it — the customer pays the sticker price
 * either way, and only the invoice split changes.
 */
final class Gst
{
    /**
     * State names to GST state codes, used for the place of supply.
     *
     * Addresses are captured as free text, so this is matched leniently and a
     * miss is not fatal: the invoice still prints the state the customer gave,
     * just without a code.
     *
     * @var array<string, string>
     */
    private const STATE_CODES = [
        'jammu and kashmir' => '01', 'himachal pradesh' => '02', 'punjab' => '03',
        'chandigarh' => '04', 'uttarakhand' => '05', 'haryana' => '06',
        'delhi' => '07', 'rajasthan' => '08', 'uttar pradesh' => '09',
        'bihar' => '10', 'sikkim' => '11', 'arunachal pradesh' => '12',
        'nagaland' => '13', 'manipur' => '14', 'mizoram' => '15',
        'tripura' => '16', 'meghalaya' => '17', 'assam' => '18',
        'west bengal' => '19', 'jharkhand' => '20', 'odisha' => '21',
        'chhattisgarh' => '22', 'madhya pradesh' => '23', 'gujarat' => '24',
        'maharashtra' => '27', 'karnataka' => '29', 'goa' => '30',
        'lakshadweep' => '31', 'kerala' => '32', 'tamil nadu' => '33',
        'puducherry' => '34', 'andaman and nicobar islands' => '35',
        'telangana' => '36', 'andhra pradesh' => '37', 'ladakh' => '38',
        'dadra and nagar haveli and daman and diu' => '26',
    ];

    public static function enabled(): bool
    {
        return (bool) config('invoice.gst.enabled');
    }

    public static function rate(): float
    {
        return (float) config('invoice.gst.rate');
    }

    /**
     * Split a tax-inclusive amount into taxable value and tax.
     *
     * The tax is derived by subtraction rather than computed independently, so
     * the two halves always add back to exactly the gross amount — no rounding
     * remainder can appear between the invoice and what was charged.
     *
     * @return array{taxable: int, tax: int}
     */
    public static function split(int $grossPaise): array
    {
        if (! self::enabled() || self::rate() <= 0) {
            return ['taxable' => $grossPaise, 'tax' => 0];
        }

        $taxable = (int) round($grossPaise / (1 + (self::rate() / 100)));

        return ['taxable' => $taxable, 'tax' => $grossPaise - $taxable];
    }

    /**
     * Whether the supply is within the seller's own state.
     *
     * Intra-state supplies carry CGST + SGST at half the rate each; anything
     * else carries IGST at the full rate.
     */
    public static function isIntraState(?string $buyerState): bool
    {
        return self::normalise($buyerState) === self::normalise((string) config('invoice.seller.state'));
    }

    /** GST state code for a free-text state name, or null when unrecognised. */
    public static function stateCode(?string $state): ?string
    {
        return self::STATE_CODES[self::normalise($state)] ?? null;
    }

    /**
     * Break a tax amount into its component heads.
     *
     * CGST and SGST are derived by subtraction for the same reason as the split
     * above: halving an odd number of paise twice would lose one.
     *
     * @return array{cgst: int, sgst: int, igst: int}
     */
    public static function heads(int $taxPaise, bool $intraState): array
    {
        if (! $intraState) {
            return ['cgst' => 0, 'sgst' => 0, 'igst' => $taxPaise];
        }

        $cgst = intdiv($taxPaise, 2);

        return ['cgst' => $cgst, 'sgst' => $taxPaise - $cgst, 'igst' => 0];
    }

    private static function normalise(?string $value): string
    {
        return trim(mb_strtolower((string) $value));
    }
}

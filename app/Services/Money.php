<?php

namespace App\Services;

/**
 * Formats an integer paise amount for display.
 *
 * Every monetary column in this application stores paise as an integer, because
 * floats cannot represent currency exactly. Display is therefore always a
 * conversion, and getting it wrong is invisible in the code and glaring to a
 * customer: the admin's order items were formatted without dividing, so a ₹8,999
 * frame appeared as ₹899,900 next to a total that read ₹8,999.
 */
final class Money
{
    public static function rupees(?int $paise): string
    {
        $paise ??= 0;

        return '₹'.number_format($paise / 100, 2);
    }

    /**
     * Same, but signed — for a line that subtracts from the total, where an
     * unsigned figure reads as though it were being added.
     */
    public static function negative(?int $paise): string
    {
        return '−'.self::rupees($paise);
    }
}

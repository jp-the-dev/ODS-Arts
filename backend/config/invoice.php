<?php

declare(strict_types=1);

return [

    /*
    |--------------------------------------------------------------------------
    | GST
    |--------------------------------------------------------------------------
    |
    | Prices in the catalogue are GST-INCLUSIVE: the listed price is what the
    | customer pays, and the tax is carved back out of it for the invoice. The
    | order total is therefore unchanged by GST — only the split between taxable
    | value and tax is recorded. Switching this to exclusive would change the
    | amount taken at Razorpay.
    |
    | The rate and HSN default to the wooden-picture-frame slab. Confirm both
    | with your accountant before issuing real invoices — an incorrect rate or
    | HSN makes every invoice you have issued wrong.
    |
    */

    'gst' => [
        'enabled' => (bool) env('GST_ENABLED', true),
        'rate' => (float) env('GST_RATE', 12),
        'hsn_code' => (string) env('GST_HSN_CODE', '4414'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Seller
    |--------------------------------------------------------------------------
    |
    | Printed on every invoice and snapshotted onto it at issue, so a later
    | change here cannot alter an invoice that has already been given to a
    | customer. `state_code` decides CGST+SGST versus IGST.
    |
    */

    'seller' => [
        'legal_name' => (string) env('INVOICE_SELLER_NAME', 'ODSArts'),
        'gstin' => env('INVOICE_SELLER_GSTIN'),
        'address_line_1' => (string) env('INVOICE_SELLER_ADDRESS_1', ''),
        'address_line_2' => (string) env('INVOICE_SELLER_ADDRESS_2', ''),
        'city' => (string) env('INVOICE_SELLER_CITY', 'Rajkot'),
        'state' => (string) env('INVOICE_SELLER_STATE', 'Gujarat'),
        'state_code' => (string) env('INVOICE_SELLER_STATE_CODE', '24'),
        'pincode' => (string) env('INVOICE_SELLER_PINCODE', '360002'),
        'email' => (string) env('INVOICE_SELLER_EMAIL', (string) env('MAIL_FROM_ADDRESS', '')),
        'phone' => (string) env('INVOICE_SELLER_PHONE', ''),
    ],

    /*
    |--------------------------------------------------------------------------
    | Numbering
    |--------------------------------------------------------------------------
    |
    | GST requires a consecutive series. Order numbers are random, so invoices
    | carry their own: <prefix>/<financial year>/<zero-padded sequence>, e.g.
    | ODS/2026-27/0001, restarting at 1 each Indian financial year (1 April).
    |
    */

    'series' => [
        'prefix' => (string) env('INVOICE_PREFIX', 'ODS'),
        'padding' => 4,
    ],

];

<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Releasing stock from unpaid orders
    |--------------------------------------------------------------------------
    |
    | Stock is taken when the order is created, before payment, so an abandoned
    | or declined checkout holds its units until they are given back. This is
    | how long an order may sit unpaid before odsarts:release-abandoned-stock
    | returns them.
    |
    | Too short and a customer paying through a link loses their reservation
    | mid-payment; too long and the catalogue reports things as sold out that
    | nobody bought. An hour comfortably outlives a Razorpay checkout session.
    |
    */

    'release_stock_after_minutes' => (int) env('ORDER_RELEASE_STOCK_AFTER_MINUTES', 60),

];

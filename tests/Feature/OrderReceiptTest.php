<?php

declare(strict_types=1);

use App\Filament\Resources\Orders\Pages\ViewOrder;
use App\Filament\Resources\Orders\RelationManagers\OrderItemRelationManager;
use App\Mail\OrderConfirmation;
use App\Models\Order;
use App\Models\User;
use App\Services\Money;
use Livewire\Livewire;

/** An order whose total cannot be reached from the line items alone. */
function receiptOrder(array $overrides = []): Order
{
    $order = Order::factory()->create(array_merge([
        'order_number' => 'ODS-RECEIPT',
        'subtotal' => 1799800,
        'discount' => 50000,
        'shipping_cost' => 15000,
        'tax' => 89990,
        'total' => 1854790,
        'shipping_address' => [
            'full_name' => 'Samir Chavda',
            'line1' => 'office no. 314 novas complex',
            'line2' => 'Near X Road',
            'city' => 'Rajkot',
            'state' => 'Gujarat',
            'pincode' => '360002',
            'phone' => '09904949861',
        ],
    ], $overrides));

    $order->items()->create([
        'name' => 'Classic Box — 8" × 10"',
        'sku' => 'BOX-1',
        'unit_price_paise' => 899900,
        'quantity' => 2,
        'subtotal_paise' => 1799800,
    ]);

    return $order->fresh('items');
}

function receiptText(Order $order): string
{
    $html = (new OrderConfirmation($order))->render();

    return preg_replace('/\s+/', ' ', html_entity_decode(strip_tags($html))) ?? '';
}

describe('order confirmation receipt', function (): void {
    it('shows every amount that makes up the total', function (): void {
        // The receipt previously listed line items and a total with nothing
        // between them, so a customer saw ₹17,998 of items against a ₹18,547.90
        // total and no way to account for the difference.
        $text = receiptText(receiptOrder());

        expect($text)
            ->toContain(Money::rupees(1799800))   // subtotal
            ->toContain(Money::negative(50000))   // discount, signed
            ->toContain(Money::rupees(15000))     // shipping
            ->toContain(Money::rupees(89990))     // GST
            ->toContain(Money::rupees(1854790));  // total
    });

    it('reconciles: the parts add up to the total shown', function (): void {
        $order = receiptOrder();

        $computed = $order->subtotal - $order->discount + $order->shipping_cost + $order->tax;

        expect($computed)->toBe($order->total)
            ->and(receiptText($order))->toContain(Money::rupees($computed));
    });

    it('distinguishes unit price from line amount', function (): void {
        // Two at ₹8,999 previously showed ₹17,998 under a "Price" heading.
        $text = receiptText(receiptOrder());

        expect($text)
            ->toContain(Money::rupees(899900))
            ->toContain(Money::rupees(1799800))
            ->toContain('Unit price');
    });

    it('keeps the address on separate lines', function (): void {
        // A single newline is not a line break in Markdown, so the street ran
        // straight into the city: "...novas complexRajkot".
        $html = (new OrderConfirmation(receiptOrder()))->render();

        expect($html)->not->toContain('novas complexRajkot')
            ->and($html)->not->toContain('Near X RoadRajkot');
    });

    it('says shipping is free rather than showing nothing', function (): void {
        $order = receiptOrder(['shipping_cost' => 0, 'total' => 1839790]);

        expect(receiptText($order))->toContain('Free');
    });

    it('omits a discount line when there is no discount', function (): void {
        $order = receiptOrder(['discount' => 0, 'total' => 1904790]);

        expect(receiptText($order))->not->toContain('Discount');
    });

    it('prefers a real delivery date over the generic estimate', function (): void {
        $order = receiptOrder(['estimated_delivery_date' => now()->addDays(9)]);

        expect(receiptText($order))
            ->toContain(now()->addDays(9)->format('j F Y'))
            ->not->toContain('7–14 working days');
    });

    it('falls back to the estimate when no date has been set', function (): void {
        expect(receiptText(receiptOrder()))->toContain('7–14 working days');
    });

    it('addresses the customer and names the order', function (): void {
        expect(receiptText(receiptOrder()))
            ->toContain('Samir Chavda')
            ->toContain('ODS-RECEIPT');
    });
});

describe('admin order amounts', function (): void {
    beforeEach(fn () => $this->actingAs(User::factory()->admin()->create()));

    it('shows item prices in rupees, not paise', function (): void {
        // ->money('INR') without divideBy rendered a ₹8,999 frame as ₹899,900,
        // next to an order total on the same page that read ₹8,999. The items
        // load through Livewire, so the rendered page alone would not catch it.
        $order = receiptOrder();

        Livewire::test(OrderItemRelationManager::class, [
            'ownerRecord' => $order,
            'pageClass' => ViewOrder::class,
        ])
            ->assertSee('₹8,999.00')
            ->assertSee('₹17,998.00')
            ->assertDontSee('₹899,900.00');
    });

    it('shows the amounts that make up the total', function (): void {
        $order = receiptOrder();

        $html = $this->get("/admin/orders/{$order->id}")->assertOk()->getContent();

        expect($html)->toContain('17,998.00')   // subtotal
            ->and($html)->toContain('500.00')   // discount
            ->and($html)->toContain('899.90')   // GST
            ->and($html)->toContain('18,547.90'); // total
    });
});

describe('money formatting', function (): void {
    it('converts paise to rupees', function (): void {
        expect(Money::rupees(899900))->toBe('₹8,999.00')
            ->and(Money::rupees(0))->toBe('₹0.00')
            ->and(Money::rupees(null))->toBe('₹0.00');
    });

    it('signs an amount that subtracts from the total', function (): void {
        expect(Money::negative(50000))->toBe('−₹500.00');
    });
});

<?php

namespace App\Filament\Resources\Orders\Schemas;

use Filament\Infolists\Components\TextEntry;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class OrderInfolist
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Order')
                    ->columns(3)
                    ->schema([
                        TextEntry::make('order_number')->label('Reference')->copyable(),
                        TextEntry::make('status')->badge(),
                        TextEntry::make('payment_status')->badge(),
                        TextEntry::make('total')->money('INR', divideBy: 100),
                        TextEntry::make('ordered_at')->dateTime('d M Y, H:i'),
                        TextEntry::make('payment_method')->placeholder('—'),
                    ]),

                // Without these the page showed a total that could not be
                // checked against anything — the same defect as the receipt.
                Section::make('Amounts')
                    ->columns(4)
                    ->schema([
                        TextEntry::make('subtotal')
                            ->label('Taxable value')
                            ->helperText('Prices include GST, so this is the total net of tax.')
                            ->money('INR', divideBy: 100),
                        TextEntry::make('discount')->money('INR', divideBy: 100),
                        TextEntry::make('shipping_cost')->label('Shipping')->money('INR', divideBy: 100),
                        TextEntry::make('tax')->label('GST')->money('INR', divideBy: 100),
                    ]),

                // An invoice exists only once the order is paid, so this whole
                // section stays hidden until then rather than showing blanks.
                Section::make('Tax invoice')
                    ->columns(3)
                    ->visible(fn ($record): bool => $record->invoice !== null)
                    ->schema([
                        TextEntry::make('invoice.number')->label('Invoice number')->copyable(),
                        TextEntry::make('invoice.issued_at')->label('Issued')->dateTime('d M Y, H:i'),
                        TextEntry::make('invoice.place_of_supply')
                            ->label('Place of supply')
                            ->formatStateUsing(fn ($state, $record): string => $state.($record->invoice?->is_intra_state ? ' — CGST + SGST' : ' — IGST')),
                    ]),

                Section::make('Customer')
                    ->columns(3)
                    ->schema([
                        TextEntry::make('email')->copyable(),
                        TextEntry::make('phone')->placeholder('—'),
                        TextEntry::make('user.name')->label('Account')->placeholder('Guest checkout'),
                    ]),

                Section::make('Delivery')
                    ->columns(2)
                    ->schema([
                        // Built with state() from the record rather than
                        // formatStateUsing(): TextEntry treats an array state as
                        // *multiple* values and calls the formatter once per
                        // element, so a closure typed against the whole array
                        // receives a single string and fails.
                        TextEntry::make('shipping_address')
                            ->label('Address')
                            ->state(function ($record): string {
                                $address = $record->shipping_address;

                                if (! is_array($address)) {
                                    return filled($address) ? (string) $address : '—';
                                }

                                $parts = array_filter([
                                    $address['full_name'] ?? null,
                                    $address['line1'] ?? null,
                                    $address['line2'] ?? null,
                                    $address['city'] ?? null,
                                    $address['state'] ?? null,
                                    $address['pincode'] ?? $address['postal_code'] ?? null,
                                ]);

                                return $parts ? implode(', ', $parts) : '—';
                            })
                            ->columnSpanFull(),
                        TextEntry::make('courier_name')->placeholder('Not assigned'),
                        TextEntry::make('awb_code')->label('AWB')->placeholder('Not shipped'),
                        TextEntry::make('shiprocket_status')->placeholder('—'),
                        TextEntry::make('estimated_delivery_date')->date()->placeholder('—'),
                    ]),

                Section::make('Payment references')
                    ->columns(2)
                    ->collapsed()
                    ->schema([
                        TextEntry::make('razorpay_order_id')->placeholder('—'),
                        TextEntry::make('razorpay_payment_id')->placeholder('—'),
                    ]),
            ]);
    }
}

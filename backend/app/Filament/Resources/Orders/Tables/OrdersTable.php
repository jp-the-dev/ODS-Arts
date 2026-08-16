<?php

namespace App\Filament\Resources\Orders\Tables;

use Filament\Actions\ViewAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class OrdersTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->defaultSort('ordered_at', 'desc')
            ->columns([
                TextColumn::make('order_number')
                    ->label('Order')
                    ->searchable()
                    ->copyable()
                    ->weight('medium'),
                TextColumn::make('email')
                    ->label('Customer')
                    ->searchable()
                    ->description(fn ($record): ?string => $record->phone),
                TextColumn::make('items_count')
                    ->counts('items')
                    ->label('Items'),
                // Totals are stored in paise; shown here as rupees.
                TextColumn::make('total')
                    ->label('Total')
                    ->money('INR', divideBy: 100)
                    ->sortable(),
                TextColumn::make('payment_status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'paid' => 'success',
                        'failed' => 'danger',
                        default => 'warning',
                    }),
                TextColumn::make('status')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'delivered' => 'success',
                        'shipped' => 'info',
                        'cancelled', 'returned' => 'danger',
                        default => 'gray',
                    }),
                TextColumn::make('awb_code')
                    ->label('AWB')
                    ->placeholder('Not shipped')
                    ->toggleable(),
                TextColumn::make('ordered_at')
                    ->dateTime('d M Y, H:i')
                    ->sortable(),
            ])
            ->filters([
                SelectFilter::make('payment_status')
                    ->options([
                        'pending' => 'Pending',
                        'paid' => 'Paid',
                        'failed' => 'Failed',
                    ]),
                SelectFilter::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'confirmed' => 'Confirmed',
                        'shipped' => 'Shipped',
                        'delivered' => 'Delivered',
                        'cancelled' => 'Cancelled',
                        'returned' => 'Returned',
                    ]),
            ])
            ->recordActions([
                ViewAction::make(),
            ]);
    }
}

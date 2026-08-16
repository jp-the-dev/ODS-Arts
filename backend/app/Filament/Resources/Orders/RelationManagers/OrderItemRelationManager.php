<?php

namespace App\Filament\Resources\Orders\RelationManagers;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class OrderItemRelationManager extends RelationManager
{
    protected static string $relationship = 'items';

    protected static ?string $recordTitleAttribute = 'name';

    protected static bool $isReadOnly = true;

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('name')
                    ->label('Product')
                    ->searchable(),
                TextColumn::make('sku')
                    ->label('SKU')
                    ->placeholder('—'),
                TextColumn::make('unit_price_paise')
                    ->label('Unit Price')
                    ->money('INR', divideBy: 100),
                TextColumn::make('quantity'),
                TextColumn::make('subtotal_paise')
                    ->label('Subtotal')
                    ->money('INR', divideBy: 100),
                TextColumn::make('options')
                    ->formatStateUsing(fn ($state) => $state ? json_encode($state) : '—'),
            ])
            ->defaultSort('id')
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}

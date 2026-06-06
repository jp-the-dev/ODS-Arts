<?php

namespace App\Filament\Resources\Products\RelationManagers;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\TextInput;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ProductVariantRelationManager extends RelationManager
{
    protected static string $relationship = 'variants';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('sku')
                    ->required()
                    ->maxLength(100)
                    ->unique(ignoreRecord: true),

                TextInput::make('size_label')
                    ->required()
                    ->maxLength(255)
                    ->placeholder('e.g. 8×10'),

                TextInput::make('dimensions_cm')
                    ->required()
                    ->maxLength(255)
                    ->placeholder('e.g. 20×25'),

                TextInput::make('base_price_paise')
                    ->label('Base price (paise)')
                    ->numeric()
                    ->required()
                    ->helperText('Enter amount in paise (e.g. 24900 = ₹249).'),

                TextInput::make('stock_qty')
                    ->label('Stock quantity')
                    ->numeric()
                    ->default(10),

                TextInput::make('weight_grams')
                    ->label('Weight (g)')
                    ->numeric()
                    ->default(0),

                TextInput::make('sort_order')
                    ->label('Sort order')
                    ->numeric()
                    ->default(0),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('sku')
                    ->searchable()
                    ->weight('bold'),

                TextColumn::make('size_label')
                    ->label('Size'),

                TextColumn::make('dimensions_cm')
                    ->label('Dimensions (cm)'),

                TextColumn::make('base_price_paise')
                    ->label('Base price')
                    ->formatStateUsing(fn (int $state): string => '₹'.number_format($state / 100, 0))
                    ->sortable(),

                TextColumn::make('stock_qty')
                    ->label('Stock')
                    ->numeric()
                    ->sortable(),

                TextColumn::make('sort_order')
                    ->label('Order')
                    ->numeric()
                    ->sortable(),
            ])
            ->defaultSort('sort_order')
            ->recordActions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}

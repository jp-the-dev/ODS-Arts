<?php

declare(strict_types=1);

namespace App\Filament\Resources\Products\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class ProductsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                // Resolved through the model's url accessor rather than a disk:
                // seeded rows store storefront-relative paths (/images/...) that
                // live in the Next.js public folder, while uploads go to the
                // public disk. A fixed disk only renders one of the two.
                ImageColumn::make('images.path')
                    ->label('Photo')
                    ->getStateUsing(fn ($record): ?string => $record->images->first()?->admin_url)
                    ->width(60)
                    ->height(40)
                    ->defaultImageUrl('https://placehold.co/60x40/F5F0E8/3D2B1F?text=ODS'),

                TextColumn::make('name')
                    ->searchable()
                    ->sortable()
                    ->weight('bold'),

                TextColumn::make('collection.name')
                    ->label('Collection')
                    ->badge()
                    ->color('warning')
                    ->sortable(),

                TextColumn::make('tagline')
                    ->searchable()
                    ->limit(30)
                    ->placeholder('—')
                    ->toggleable(),

                TextColumn::make('price_in_paise')
                    ->label('Price')
                    ->formatStateUsing(fn (int $state): string => '₹'.number_format($state / 100, 0))
                    ->sortable(),

                TextColumn::make('material')
                    ->placeholder('—')
                    ->toggleable(),

                TextColumn::make('delivery_days')
                    ->label('Delivery')
                    ->numeric()
                    ->toggleable(),

                TextColumn::make('dimensions')
                    ->placeholder('—')
                    ->toggleable(),

                IconColumn::make('is_featured')
                    ->label('Featured')
                    ->boolean(),

                IconColumn::make('is_active')
                    ->label('Active')
                    ->boolean(),

                TextColumn::make('sort_order')
                    ->label('Order')
                    ->numeric()
                    ->sortable(),
            ])
            ->defaultSort('sort_order')
            ->filters([
                SelectFilter::make('collection_id')
                    ->label('Collection')
                    ->relationship('collection', 'name'),

                TernaryFilter::make('is_featured')
                    ->label('Featured'),

                TernaryFilter::make('is_active')
                    ->label('Active'),
            ])
            ->recordActions([
                ViewAction::make(),
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}

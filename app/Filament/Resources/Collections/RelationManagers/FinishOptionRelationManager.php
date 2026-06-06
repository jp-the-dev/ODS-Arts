<?php

namespace App\Filament\Resources\Collections\RelationManagers;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\TextInput;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\ColorColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class FinishOptionRelationManager extends RelationManager
{
    protected static string $relationship = 'finishOptions';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required()
                    ->maxLength(255)
                    ->live(onBlur: true)
                    ->afterStateUpdated(fn (Set $set, ?string $state) => $set('slug', Str::slug($state ?? ''))),

                TextInput::make('slug')
                    ->required()
                    ->maxLength(255),

                TextInput::make('swatch_hex')
                    ->label('Swatch color (hex)')
                    ->placeholder('#C9A96E')
                    ->maxLength(7),

                TextInput::make('price_delta_paise')
                    ->label('Price delta (paise)')
                    ->numeric()
                    ->default(0)
                    ->helperText('Positive = surcharge, negative = discount.'),

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
                TextColumn::make('name')
                    ->searchable()
                    ->weight('bold'),

                TextColumn::make('slug')
                    ->searchable(),

                ColorColumn::make('swatch_hex')
                    ->label('Swatch'),

                TextColumn::make('price_delta_paise')
                    ->label('Price delta')
                    ->formatStateUsing(fn (int $state): string => ($state >= 0 ? '+' : '').'₹'.number_format($state / 100, 0))
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

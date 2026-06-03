<?php

declare(strict_types=1);

namespace App\Filament\Resources\FrameOptions;

use App\Filament\Resources\FrameOptions\Pages\ManageFrameOptions;
use App\Models\FrameOption;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Forms\Set;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;
use Illuminate\Support\Str;

class FrameOptionResource extends Resource
{
    protected static ?string $model = FrameOption::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'name';

    protected static \UnitEnum|string|null $navigationGroup = 'Framing';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('type')
                    ->options(['wood' => 'Wood', 'mat' => 'Mat', 'glass' => 'Glass'])
                    ->required()
                    ->native(false),

                TextInput::make('name')
                    ->required()
                    ->maxLength(255)
                    ->live(onBlur: true)
                    ->afterStateUpdated(fn (Set $set, ?string $state) => $set('slug', Str::slug($state ?? ''))),

                TextInput::make('slug')
                    ->required()
                    ->maxLength(255)
                    ->unique(ignoreRecord: true),

                TextInput::make('material')
                    ->placeholder('e.g. Walnut, Linen, Museum Glass')
                    ->maxLength(255),

                TextInput::make('finish')
                    ->placeholder('e.g. Satin, Matte, Anti-reflective')
                    ->maxLength(255),

                TextInput::make('price_modifier_in_rupees')
                    ->label('Price modifier (₹)')
                    ->prefix('₹')
                    ->numeric()
                    ->step(1)
                    ->default(0)
                    ->helperText('Positive = surcharge, negative = discount. Stored in paise.')
                    ->afterStateHydrated(function (TextInput $component, ?int $state): void {
                        $component->state(($state ?? 0) / 100);
                    })
                    ->dehydrated(false),

                TextInput::make('price_modifier_in_paise')
                    ->numeric()
                    ->default(0)
                    ->hidden()
                    ->dehydrated(true)
                    ->afterStateHydrated(function (): void {}),

                Toggle::make('is_active')
                    ->label('Active')
                    ->default(true),

                TextInput::make('sort_order')
                    ->label('Display order')
                    ->numeric()
                    ->default(0),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('type')
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'wood' => 'warning',
                        'mat' => 'success',
                        'glass' => 'info',
                        default => 'gray',
                    })
                    ->sortable(),

                TextColumn::make('name')
                    ->searchable()
                    ->weight('bold'),

                TextColumn::make('material')
                    ->searchable()
                    ->placeholder('—'),

                TextColumn::make('finish')
                    ->placeholder('—'),

                TextColumn::make('price_modifier_in_paise')
                    ->label('Price modifier')
                    ->formatStateUsing(fn (int $state): string => ($state >= 0 ? '+' : '').number_format($state / 100, 0).' ₹')
                    ->sortable(),

                IconColumn::make('is_active')
                    ->label('Active')
                    ->boolean(),

                TextColumn::make('sort_order')
                    ->label('Order')
                    ->sortable(),
            ])
            ->defaultSort('type')
            ->filters([
                SelectFilter::make('type')
                    ->options(['wood' => 'Wood', 'mat' => 'Mat', 'glass' => 'Glass']),
            ])
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

    public static function getPages(): array
    {
        return [
            'index' => ManageFrameOptions::route('/'),
        ];
    }
}

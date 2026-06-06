<?php

declare(strict_types=1);

namespace App\Filament\Resources\Products\Schemas;

use App\Models\Collection;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Grid;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class ProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Section::make('Product Details')
                    ->description('Core product information.')
                    ->schema([
                        Select::make('collection_id')
                            ->label('Collection')
                            ->options(Collection::active()->orderBy('sort_order')->pluck('name', 'id'))
                            ->searchable()
                            ->required(),

                        TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(fn (Set $set, ?string $state) => $set('slug', Str::slug($state ?? ''))),

                        TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->unique(ignoreRecord: true)
                            ->helperText('Auto-filled from name.'),

                        TextInput::make('tagline')
                            ->maxLength(255)
                            ->placeholder('e.g. Wide profile. Deep grain. Timeless.'),

                        Textarea::make('description')
                            ->rows(4)
                            ->columnSpanFull(),

                        TextInput::make('material')
                            ->placeholder('e.g. Solid Walnut, Oak')
                            ->maxLength(255),

                        TagsInput::make('materials')
                            ->label('Materials list')
                            ->placeholder('Add a material'),

                        TextInput::make('dimensions')
                            ->placeholder('e.g. 12×16 inches')
                            ->maxLength(255),

                        TextInput::make('delivery_days')
                            ->label('Delivery (working days)')
                            ->numeric()
                            ->default(14)
                            ->suffix('days'),

                        TagsInput::make('care_instructions')
                            ->label('Care Instructions')
                            ->placeholder('Add a care instruction'),
                    ])
                    ->columns(2),

                Section::make('Pricing')
                    ->schema([
                        TextInput::make('price_in_rupees')
                            ->label('Price (₹)')
                            ->prefix('₹')
                            ->numeric()
                            ->minValue(0)
                            ->step(1)
                            ->live()
                            ->default(0)
                            // Display stored paise as rupees
                            ->afterStateHydrated(function (TextInput $component, ?int $state): void {
                                $component->state(($state ?? 0) / 100);
                            })
                            // Convert rupees to paise on save via virtual field
                            ->dehydrated(false)
                            ->helperText('Enter price in whole rupees — stored as paise internally.'),

                        // Hidden field: actual paise value synced from the rupees input
                        TextInput::make('price_in_paise')
                            ->numeric()
                            ->default(0)
                            ->hidden()
                            ->dehydrated(true)
                            ->afterStateHydrated(function (): void {})
                            ->live(),
                    ]),

                Section::make('Product Images')
                    ->description('Add one or more images. The first image is used as the primary display.')
                    ->schema([
                        Repeater::make('images')
                            ->relationship()
                            ->schema([
                                FileUpload::make('path')
                                    ->label('Image')
                                    ->image()
                                    ->directory('products')
                                    ->disk('public')
                                    ->imageEditor()
                                    ->maxSize(5120)
                                    ->required(),

                                TextInput::make('alt')
                                    ->label('Alt text')
                                    ->placeholder('Describe the image for accessibility')
                                    ->maxLength(255),

                                TextInput::make('sort_order')
                                    ->label('Order')
                                    ->numeric()
                                    ->default(0),
                            ])
                            ->columns(3)
                            ->itemLabel(fn (array $state): ?string => $state['alt'] ?? 'Image')
                            ->orderColumn(fn () => 'sort_order')
                            ->collapsible(),
                    ]),

                Section::make('Visibility & Ordering')
                    ->schema([
                        Grid::make(3)->schema([
                            Toggle::make('is_featured')
                                ->label('Featured product')
                                ->helperText('Shows on homepage featured section.'),

                            Toggle::make('is_active')
                                ->label('Active (visible on website)')
                                ->default(true),

                            TextInput::make('sort_order')
                                ->label('Display order')
                                ->numeric()
                                ->default(0),
                        ]),
                    ]),
            ]);
    }
}

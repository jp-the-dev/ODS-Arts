<?php

namespace App\Filament\Resources\ArtProducts;

use App\Filament\Resources\ArtProducts\Pages\CreateArtProduct;
use App\Filament\Resources\ArtProducts\Pages\EditArtProduct;
use App\Filament\Resources\ArtProducts\Pages\ListArtProducts;
use App\Filament\Resources\ArtProducts\Pages\ViewArtProduct;
use App\Models\ArtProduct;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TagsInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Filters\TernaryFilter;
use Filament\Tables\Table;

class ArtProductResource extends Resource
{
    protected static ?string $model = ArtProduct::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedPhoto;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('art_category_id')
                    ->relationship('category', 'title')
                    ->required()
                    ->searchable(),
                TextInput::make('name')
                    ->required()
                    ->maxLength(255),
                TextInput::make('slug')
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->helperText('Storefront URL: /art/{category}/{slug}'),
                TextInput::make('tagline')
                    ->maxLength(255)
                    ->columnSpanFull(),
                Textarea::make('description')
                    ->rows(4)
                    ->columnSpanFull(),
                TextInput::make('artist')
                    ->default('ODSArts Studio')
                    ->maxLength(255),
                TextInput::make('medium')
                    ->maxLength(255)
                    ->helperText('e.g. Digital illustration, Oil on canvas'),
                TextInput::make('delivery_days')
                    ->numeric()
                    ->default(7),
                TagsInput::make('tags')
                    ->helperText('Used by search — e.g. rajasthan, heritage')
                    ->columnSpanFull(),
                TextInput::make('sort_order')
                    ->numeric()
                    ->default(0),
                Toggle::make('is_featured'),
                Toggle::make('is_active')
                    ->default(true),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('name')
            ->defaultSort('sort_order')
            ->columns([
                TextColumn::make('name')->searchable()->sortable(),
                TextColumn::make('category.title')->label('Category')->searchable()->sortable(),
                TextColumn::make('artist')->toggleable(),
                TextColumn::make('material_variants_count')
                    ->counts('materialVariants')
                    ->label('Variants'),
                IconColumn::make('is_featured')->boolean(),
                IconColumn::make('is_active')->boolean(),
                TextColumn::make('sort_order')->sortable()->toggleable(),
            ])
            ->filters([
                SelectFilter::make('art_category_id')
                    ->relationship('category', 'title')
                    ->label('Category'),
                TernaryFilter::make('is_active'),
                TernaryFilter::make('is_featured'),
            ])
            ->recordActions([
                ViewAction::make(),
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
            'index' => ListArtProducts::route('/'),
            'create' => CreateArtProduct::route('/create'),
            'view' => ViewArtProduct::route('/{record}'),
            'edit' => EditArtProduct::route('/{record}/edit'),
        ];
    }
}

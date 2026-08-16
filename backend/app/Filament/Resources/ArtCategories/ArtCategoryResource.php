<?php

namespace App\Filament\Resources\ArtCategories;

use App\Filament\Resources\ArtCategories\Pages\CreateArtCategory;
use App\Filament\Resources\ArtCategories\Pages\EditArtCategory;
use App\Filament\Resources\ArtCategories\Pages\ListArtCategories;
use App\Filament\Resources\ArtCategories\Pages\ViewArtCategory;
use App\Models\ArtCategory;
use BackedEnum;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Actions\ViewAction;
use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Columns\IconColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ArtCategoryResource extends Resource
{
    protected static ?string $model = ArtCategory::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedSwatch;

    protected static ?string $recordTitleAttribute = 'title';

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('title')
                    ->required()
                    ->maxLength(255),
                TextInput::make('slug')
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->helperText('Used in the storefront URL: /art/{slug}'),
                TextInput::make('display_number')
                    ->maxLength(8),
                TextInput::make('eyebrow')
                    ->maxLength(255),
                TextInput::make('tagline')
                    ->maxLength(255)
                    ->columnSpanFull(),
                Textarea::make('description')
                    ->rows(4)
                    ->columnSpanFull(),
                TextInput::make('cover_image')
                    ->maxLength(255),
                TextInput::make('cover_image_alt')
                    ->maxLength(255),
                ColorPicker::make('accent_color'),
                TextInput::make('sort_order')
                    ->numeric()
                    ->default(0),
                Toggle::make('is_active')
                    ->default(true),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->recordTitleAttribute('title')
            ->defaultSort('sort_order')
            ->columns([
                TextColumn::make('display_number')->label('#'),
                TextColumn::make('title')->searchable()->sortable(),
                TextColumn::make('slug')->searchable()->toggleable(),
                TextColumn::make('art_products_count')
                    ->counts('artProducts')
                    ->label('Pieces'),
                IconColumn::make('is_active')->boolean(),
                TextColumn::make('sort_order')->sortable(),
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
            'index' => ListArtCategories::route('/'),
            'create' => CreateArtCategory::route('/create'),
            'view' => ViewArtCategory::route('/{record}'),
            'edit' => EditArtCategory::route('/{record}/edit'),
        ];
    }
}

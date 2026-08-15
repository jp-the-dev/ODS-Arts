<?php

namespace App\Filament\Resources\ArtProducts\Pages;

use App\Filament\Resources\ArtProducts\ArtProductResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListArtProducts extends ListRecords
{
    protected static string $resource = ArtProductResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}

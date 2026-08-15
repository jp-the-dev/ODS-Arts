<?php

namespace App\Filament\Resources\ArtCategories\Pages;

use App\Filament\Resources\ArtCategories\ArtCategoryResource;
use Filament\Resources\Pages\EditRecord;

class EditArtCategory extends EditRecord
{
    protected static string $resource = ArtCategoryResource::class;
}

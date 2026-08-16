<?php

namespace App\Filament\Resources\Enquiries\Schemas;

use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class EnquiryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                TextInput::make('email')
                    ->label('Email address')
                    ->email()
                    ->required(),
                TextInput::make('phone')
                    ->tel(),
                Textarea::make('message')
                    ->required()
                    ->columnSpanFull(),
                Select::make('type')
                    ->options(['contact' => 'Contact', 'custom_framing' => 'Custom framing', 'gifting' => 'Gifting'])
                    ->default('contact')
                    ->required(),
                Select::make('status')
                    ->options(['new' => 'New', 'read' => 'Read', 'replied' => 'Replied'])
                    ->default('new')
                    ->required(),
            ]);
    }
}

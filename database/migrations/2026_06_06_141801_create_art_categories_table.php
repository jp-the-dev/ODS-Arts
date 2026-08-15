<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('art_categories', function (Blueprint $table): void {
            $table->id();
            $table->string('slug')->unique();
            $table->string('display_number')->nullable();
            $table->string('eyebrow')->nullable();
            $table->string('title');
            $table->text('tagline')->nullable();
            $table->text('description')->nullable();
            $table->string('cover_image')->nullable();
            $table->string('cover_image_alt')->nullable();
            $table->string('accent_color')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('art_categories');
    }
};

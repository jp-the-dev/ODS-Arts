<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('art_images', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('art_product_id')->constrained('art_products')->cascadeOnDelete();
            $table->string('path');
            $table->string('alt')->nullable();
            $table->string('role')->default('hero');
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('art_images');
    }
};

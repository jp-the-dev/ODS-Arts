<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('frame_options', function (Blueprint $table): void {
            $table->id();
            // type: 'wood' | 'mat' | 'glass'
            $table->enum('type', ['wood', 'mat', 'glass']);
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('material')->nullable();
            $table->string('finish')->nullable();
            // Price modifier stored in paise — can be negative (discount) or positive (surcharge)
            $table->integer('price_modifier_in_paise')->default(0);
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('frame_options');
    }
};

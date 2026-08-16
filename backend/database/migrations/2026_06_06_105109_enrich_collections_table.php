<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('collections', function (Blueprint $table) {
            $table->string('display_number')->nullable()->after('slug');
            $table->string('eyebrow')->nullable()->after('tagline');
            $table->text('long_description')->nullable()->after('description');
            $table->json('materials')->nullable()->after('long_description');
            $table->json('features')->nullable()->after('materials');
            $table->string('image_path')->nullable()->after('cover_image');
            $table->string('image_alt')->nullable()->after('image_path');
            $table->string('image_position')->default('left')->after('image_alt');
        });
    }

    public function down(): void
    {
        Schema::table('collections', function (Blueprint $table) {
            $table->dropColumn([
                'display_number',
                'eyebrow',
                'long_description',
                'materials',
                'features',
                'image_path',
                'image_alt',
                'image_position',
            ]);
        });
    }
};

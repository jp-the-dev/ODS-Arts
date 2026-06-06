<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('tagline')->nullable()->after('name');
            $table->unsignedTinyInteger('delivery_days')->default(14)->after('description');
            $table->json('care_instructions')->nullable()->after('delivery_days');
            $table->json('materials')->nullable()->after('care_instructions');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn([
                'tagline',
                'delivery_days',
                'care_instructions',
                'materials',
            ]);
        });
    }
};

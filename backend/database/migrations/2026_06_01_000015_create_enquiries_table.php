<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('enquiries', function (Blueprint $table): void {
            $table->id();
            $table->string('name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->text('message');
            // type: 'contact' | 'custom_framing' | 'gifting'
            $table->enum('type', ['contact', 'custom_framing', 'gifting'])->default('contact');
            // status: 'new' | 'read' | 'replied'
            $table->enum('status', ['new', 'read', 'replied'])->default('new');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('enquiries');
    }
};

<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('uploaded_files', function (Blueprint $table) {
            $table->ulid('id')->primary();
            $table->foreignId('users')->nullable()->constrained('users')->nullOnDelete();
            $table->string('original_name');
            $table->string('title')->nullable();
            $table->string('path');
            $table->unsignedBigInteger('size');
            $table->string('mime_type');
            $table->string('disk');
            $table->timestamps();

            $table->unique(['path', 'disk']);
            $table->index(['path', 'disk']);
        });

        Schema::create('uploaded_files_models', function (Blueprint $table) {
            $table->foreignUlid('upload_id')->constrained('uploaded_files', 'id')->cascadeOnDelete();
            $table->morphs('model');
            $table->string('name')->nullable();
        });


    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('uploaded_files_models');
        Schema::dropIfExists('uploaded_files');
    }
};

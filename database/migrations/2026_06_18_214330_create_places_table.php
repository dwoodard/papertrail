<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('places', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('project_id')->constrained()->cascadeOnDelete();
            $table->string('place_id');
            $table->string('name');
            $table->string('category')->nullable();
            $table->string('street_address')->nullable();
            $table->string('city')->nullable();
            $table->string('state', 2)->nullable();
            $table->string('zip')->nullable();
            $table->string('phone')->nullable();
            $table->string('website')->nullable();
            $table->string('plus_code')->nullable();
            $table->text('hours')->nullable();
            $table->string('status')->nullable();
            $table->string('price_range')->nullable();
            $table->text('maps_url')->nullable();
            $table->decimal('rating', 3, 1)->nullable();
            $table->integer('reviews_count')->nullable();
            $table->boolean('is_sponsored')->default(false);
            $table->string('keyword')->nullable();
            $table->string('source')->nullable();
            $table->timestampTz('captured_at')->nullable();
            $table->timestamps();

            $table->unique(['project_id', 'place_id']);
            $table->index('project_id');
            $table->index('keyword');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('places');
    }
};

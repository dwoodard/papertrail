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
        Schema::create('graph_nodes', function (Blueprint $table) {
            $table->id();
            $table->uuid('project_id')->constrained('projects', 'id')->onDelete('cascade');
            $table->string('type', 50); // business, category, phone, domain, search_query, address, city, etc
            $table->text('label'); // Display name
            $table->string('normalized_key')->index(); // Deduplication key
            $table->string('source', 50)->nullable(); // google_maps, facebook, linkedin, etc
            $table->text('external_id')->nullable(); // Google Place ID, Domain, Phone, etc
            $table->jsonb('properties')->default('{}'); // rating, review_count, status, hours, etc
            $table->timestamps();

            $table->unique(['project_id', 'type', 'normalized_key']);
            $table->index(['project_id', 'type']);
            $table->index('source');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('graph_nodes');
    }
};

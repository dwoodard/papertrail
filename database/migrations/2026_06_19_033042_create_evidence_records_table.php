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
        Schema::create('evidence_records', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('project_id')->constrained('projects')->onDelete('cascade');
            $table->string('source', 50); // google_maps, facebook, linkedin, etc
            $table->string('source_module', 75); // maps_search, maps_details, etc
            $table->text('source_url')->nullable(); // Original URL/link
            $table->timestamp('captured_at')->nullable(); // When the data was collected
            $table->string('checksum', 64)->nullable()->unique(); // For deduplication
            $table->jsonb('raw_data'); // Original data (CSV row, JSON response, etc)
            $table->timestamps();

            $table->index(['project_id', 'source']);
            $table->index(['source', 'source_module']);
            $table->index('captured_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('evidence_records');
    }
};

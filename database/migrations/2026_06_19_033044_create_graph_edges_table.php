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
        Schema::create('graph_edges', function (Blueprint $table) {
            $table->id();
            $table->uuid('project_id')->constrained('projects', 'id')->onDelete('cascade');
            $table->foreignId('from_node_id')->constrained('graph_nodes')->onDelete('cascade');
            $table->foreignId('to_node_id')->constrained('graph_nodes')->onDelete('cascade');
            $table->string('type', 75); // RETURNED_RESULT, CATEGORIZED_AS, HAS_PHONE, USES_DOMAIN, etc
            $table->decimal('confidence', 5, 4)->default(1.0); // 0.0 to 1.0, 1.0 = confirmed
            $table->foreignId('evidence_id')->nullable()->constrained('evidence_records')->onDelete('set null');
            $table->jsonb('properties')->default('{}'); // Additional edge metadata
            $table->timestamps();

            $table->unique(['project_id', 'from_node_id', 'to_node_id', 'type']);
            $table->index(['project_id', 'type']);
            $table->index(['from_node_id', 'type']);
            $table->index(['to_node_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('graph_edges');
    }
};

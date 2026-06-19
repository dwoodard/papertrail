<?php

use Illuminate\Database\Migrations\Migration;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement('CREATE EXTENSION IF NOT EXISTS age');
        DB::statement('SELECT load_graph_search_path()');
        DB::statement("SELECT create_graph('papertrail_graph')");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("SELECT drop_graph('papertrail_graph', true)");
        DB::statement('DROP EXTENSION IF NOT EXISTS age');
    }
};

<?php

namespace Tests\Feature;

use App\Models\Place;
use App\Models\Project;
use App\Services\PlaceGraphSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PlaceGraphSyncTest extends TestCase
{
    use RefreshDatabase;

    private PlaceGraphSyncService $syncService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->syncService = app(PlaceGraphSyncService::class);

        // Ensure Apache AGE extension is set up
        if (! $this->isAgeInstalled()) {
            $this->markTestSkipped('Apache AGE extension not installed');
        }
    }

    public function test_place_can_be_synced_to_graph(): void
    {
        $project = Project::factory()->create();
        $place = Place::factory()->create([
            'project_id' => $project->id,
            'name' => 'John\'s Plumbing',
            'place_id' => '0x123abc',
            'phone' => '(555) 123-4567',
            'street_address' => '123 Main St',
            'city' => 'Salt Lake City',
            'state' => 'UT',
            'zip' => '84015',
            'website' => 'https://johnsplumbing.com',
        ]);

        // This should not throw
        $this->syncService->syncPlace($place);

        // Verify place node exists in graph
        $result = DB::select("
            SELECT * FROM cypher('papertrail_graph', $$
                MATCH (p:Place {id: \$1})
                RETURN p.name as name, p.placeId as placeId
            $$) AS (name agtype, placeId agtype)
        ", [$place->id]);

        $this->assertNotEmpty($result);
        $this->assertEquals('John\'s Plumbing', $result[0]->name);
    }

    public function test_place_with_phone_creates_phone_node(): void
    {
        $project = Project::factory()->create();
        $place = Place::factory()->create([
            'project_id' => $project->id,
            'phone' => '(555) 123-4567',
        ]);

        $this->syncService->syncPlace($place);

        $result = DB::select("
            SELECT * FROM cypher('papertrail_graph', $$
                MATCH (p:Place {id: \$1})-[:HAS_PHONE]->(phone:Phone)
                RETURN phone.number as number
            $$) AS (number agtype)
        ", [$place->id]);

        $this->assertNotEmpty($result);
        $this->assertStringContainsString('5551234567', $result[0]->number);
    }

    public function test_place_with_address_creates_address_node(): void
    {
        $project = Project::factory()->create();
        $place = Place::factory()->create([
            'project_id' => $project->id,
            'street_address' => '123 Main St',
            'city' => 'Salt Lake City',
            'state' => 'UT',
            'zip' => '84015',
        ]);

        $this->syncService->syncPlace($place);

        $result = DB::select("
            SELECT * FROM cypher('papertrail_graph', $$
                MATCH (p:Place {id: \$1})-[:HAS_ADDRESS]->(addr:Address)
                RETURN addr.city as city, addr.state as state
            $$) AS (city agtype, state agtype)
        ", [$place->id]);

        $this->assertNotEmpty($result);
        $this->assertEquals('Salt Lake City', $result[0]->city);
        $this->assertEquals('UT', $result[0]->state);
    }

    public function test_multiple_places_can_share_phone_in_graph(): void
    {
        $project = Project::factory()->create();
        $phone = '(555) 999-8888';

        $place1 = Place::factory()->create([
            'project_id' => $project->id,
            'name' => 'Business A',
            'phone' => $phone,
        ]);

        $place2 = Place::factory()->create([
            'project_id' => $project->id,
            'name' => 'Business B',
            'phone' => $phone,
        ]);

        $this->syncService->syncPlace($place1);
        $this->syncService->syncPlace($place2);

        // Query for places sharing the same phone
        $result = DB::select("
            SELECT * FROM cypher('papertrail_graph', $$
                MATCH (p1:Place)-[:HAS_PHONE]->(phone:Phone)<-[:HAS_PHONE]-(p2:Place)
                WHERE p1.id < p2.id
                RETURN p1.name as place1, p2.name as place2, phone.number as phone
            $$) AS (place1 agtype, place2 agtype, phone agtype)
        ");

        $this->assertNotEmpty($result);
        $this->assertEquals('Business A', $result[0]->place1);
        $this->assertEquals('Business B', $result[0]->place2);
    }

    public function test_place_synced_without_phone_does_not_create_phone_node(): void
    {
        $project = Project::factory()->create();
        $place = Place::factory()->create([
            'project_id' => $project->id,
            'phone' => null,
        ]);

        $this->syncService->syncPlace($place);

        $result = DB::select("
            SELECT * FROM cypher('papertrail_graph', $$
                MATCH (p:Place {id: \$1})-[:HAS_PHONE]->(phone:Phone)
                RETURN phone
            $$) AS (phone agtype)
        ", [$place->id]);

        $this->assertEmpty($result);
    }

    private function isAgeInstalled(): bool
    {
        try {
            DB::select('SELECT * FROM ag_catalog.ag_graph');

            return true;
        } catch (\Exception) {
            return false;
        }
    }
}

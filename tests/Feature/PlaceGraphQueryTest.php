<?php

namespace Tests\Feature;

use App\Models\Place;
use App\Models\Project;
use App\Services\PlaceGraphQueryService;
use App\Services\PlaceGraphSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

class PlaceGraphQueryTest extends TestCase
{
    use RefreshDatabase;

    private PlaceGraphSyncService $syncService;

    private PlaceGraphQueryService $queryService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->syncService = app(PlaceGraphSyncService::class);
        $this->queryService = app(PlaceGraphQueryService::class);

        if (! $this->isAgeInstalled()) {
            $this->markTestSkipped('Apache AGE extension not installed');
        }
    }

    public function test_find_shared_phone_connections(): void
    {
        $project = Project::factory()->create();

        // Create two places with the same phone
        $place1 = Place::factory()->create([
            'project_id' => $project->id,
            'name' => 'Plumbing A',
            'phone' => '(555) 111-1111',
        ]);

        $place2 = Place::factory()->create([
            'project_id' => $project->id,
            'name' => 'Plumbing B',
            'phone' => '(555) 111-1111',
        ]);

        // Third place with different phone
        Place::factory()->create([
            'project_id' => $project->id,
            'name' => 'Electrical C',
            'phone' => '(555) 222-2222',
        ]);

        $this->syncService->syncPlace($place1);
        $this->syncService->syncPlace($place2);

        $connections = $this->queryService->findSharedPhoneConnections($project->id);

        $this->assertNotEmpty($connections);
        $this->assertArrayHasKey('shared_phone', $connections[0]);
    }

    public function test_find_shared_addresses(): void
    {
        $project = Project::factory()->create();

        // Create two places at the same address
        $place1 = Place::factory()->create([
            'project_id' => $project->id,
            'name' => 'Business A',
            'street_address' => '123 Main St',
            'city' => 'Salt Lake City',
            'state' => 'UT',
        ]);

        $place2 = Place::factory()->create([
            'project_id' => $project->id,
            'name' => 'Business B',
            'street_address' => '123 Main St',
            'city' => 'Salt Lake City',
            'state' => 'UT',
        ]);

        $this->syncService->syncPlace($place1);
        $this->syncService->syncPlace($place2);

        $connections = $this->queryService->findSharedAddresses($project->id);

        $this->assertNotEmpty($connections);
        $this->assertArrayHasKey('city', $connections[0]);
    }

    public function test_find_shared_websites(): void
    {
        $project = Project::factory()->create();

        // Create two places with the same website (franchise)
        $place1 = Place::factory()->create([
            'project_id' => $project->id,
            'name' => 'Franchise Unit 1',
            'website' => 'https://franchisenetwork.com',
        ]);

        $place2 = Place::factory()->create([
            'project_id' => $project->id,
            'name' => 'Franchise Unit 2',
            'website' => 'https://franchisenetwork.com',
        ]);

        $this->syncService->syncPlace($place1);
        $this->syncService->syncPlace($place2);

        $connections = $this->queryService->findSharedWebsites($project->id);

        $this->assertNotEmpty($connections);
    }

    public function test_find_cross_project_phone_connections(): void
    {
        $project1 = Project::factory()->create();
        $project2 = Project::factory()->create();
        $sharedPhone = '(555) 999-9999';

        // Same phone in different projects
        $place1 = Place::factory()->create([
            'project_id' => $project1->id,
            'name' => 'Business in Project 1',
            'phone' => $sharedPhone,
        ]);

        $place2 = Place::factory()->create([
            'project_id' => $project2->id,
            'name' => 'Business in Project 2',
            'phone' => $sharedPhone,
        ]);

        $this->syncService->syncPlace($place1);
        $this->syncService->syncPlace($place2);

        $connections = $this->queryService->findCrossProjectPhoneConnections();

        $this->assertNotEmpty($connections);
        $this->assertGreaterThanOrEqual(2, count($connections[0]->project_count ?? 1));
    }

    public function test_get_place_network(): void
    {
        $project = Project::factory()->create();

        // Create a small network
        $place1 = Place::factory()->create([
            'project_id' => $project->id,
            'name' => 'Hub Business',
            'phone' => '(555) 111-1111',
        ]);

        $place2 = Place::factory()->create([
            'project_id' => $project->id,
            'name' => 'Connected Business',
            'phone' => '(555) 111-1111', // Same phone - directly connected
        ]);

        $this->syncService->syncPlace($place1);
        $this->syncService->syncPlace($place2);

        $network = $this->queryService->getPlaceNetwork($place1->id);

        // Network should contain the connected place
        $this->assertNotEmpty($network);
    }

    public function test_get_project_graph_stats(): void
    {
        $project = Project::factory()->create();

        Place::factory()->count(3)->create([
            'project_id' => $project->id,
            'phone' => '(555) 123-4567',
        ]);

        foreach ($project->places as $place) {
            $this->syncService->syncPlace($place);
        }

        $stats = $this->queryService->getProjectGraphStats($project->id);

        $this->assertArrayHasKey('total_places', $stats);
        $this->assertArrayHasKey('places_with_phone', $stats);
        $this->assertGreaterThan(0, $stats['total_places']);
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

<?php

use App\Models\Place;
use App\Models\Project;
use App\Models\User;

test('sync endpoint creates new places', function () {
    $project = Project::factory()->create();

    $places = [
        [
            'placeId' => '0x123',
            'name' => 'Test Business 1',
            'category' => 'Contractor',
            'address' => '123 Main St, Salt Lake City, UT 84111',
            'phone' => '(801) 555-1234',
            'rating' => '4.5',
            'reviews' => '10 reviews',
            'keyword' => 'contractor',
            'source' => 'bulk',
            'capturedAt' => now()->toIso8601String(),
        ],
        [
            'placeId' => '0x456',
            'name' => 'Test Business 2',
            'category' => 'Builder',
            'address' => '456 Oak Ave, Provo, UT 84601',
            'phone' => '(801) 555-5678',
            'rating' => '3.8',
            'reviews' => '25 reviews',
            'keyword' => 'contractor',
            'source' => 'bulk',
            'capturedAt' => now()->toIso8601String(),
        ],
    ];

    $response = $this->postJson('/api/places/sync', [
        'project_id' => $project->id,
        'places' => $places,
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'created' => 2,
            'updated' => 0,
        ]);

    expect(Place::count())->toBe(2);
    expect(Place::where('place_id', '0x123')->first()->name)->toBe('Test Business 1');
    expect(Place::where('place_id', '0x456')->first()->name)->toBe('Test Business 2');
});

test('sync endpoint updates existing places (upsert)', function () {
    $project = Project::factory()->create();

    // Create initial place
    Place::create([
        'project_id' => $project->id,
        'place_id' => '0x123',
        'name' => 'Old Name',
        'keyword' => 'initial',
    ]);

    $places = [
        [
            'placeId' => '0x123',
            'name' => 'Updated Name',
            'category' => 'Contractor',
            'keyword' => 'contractor',
            'source' => 'bulk',
            'capturedAt' => now()->toIso8601String(),
        ],
    ];

    $response = $this->postJson('/api/places/sync', [
        'project_id' => $project->id,
        'places' => $places,
    ]);

    $response->assertStatus(200)
        ->assertJson([
            'created' => 0,
            'updated' => 1,
        ]);

    expect(Place::count())->toBe(1);
    expect(Place::where('place_id', '0x123')->first()->name)->toBe('Updated Name');
});

test('sync endpoint validates places field', function () {
    $project = Project::factory()->create();

    $response = $this->postJson('/api/places/sync', [
        'project_id' => $project->id,
    ]);

    $response->assertStatus(422);
});

test('sync endpoint normalizes hours', function () {
    $project = Project::factory()->create();

    $places = [
        [
            'placeId' => '0x789',
            'name' => 'Hours Test',
            'hours' => 'Monday9 AM–5 PM(Holiday)Suggest new hoursTuesday9 AM–5 PM',
            'keyword' => 'test',
            'source' => 'bulk',
        ],
    ];

    $response = $this->postJson('/api/places/sync', [
        'project_id' => $project->id,
        'places' => $places,
    ]);

    $response->assertStatus(200);

    $place = Place::where('place_id', '0x789')->first();
    expect($place->hours)
        ->toContain('Monday')
        ->toContain('9 AM-5 PM')
        ->not->toContain('Suggest new hours')
        ->not->toContain('(Holiday)');
});

<?php

use App\Actions\Imports\ImportGoogleMapsCsv;
use App\Models\GraphNode;
use App\Models\Project;

it('imports a city node when state is missing', function () {
    $project = Project::factory()->create();

    $result = (new ImportGoogleMapsCsv(
        project: $project,
        keyword: 'roofers near ogden',
    ))->execute([
        [
            'name' => 'Wasatch Roofing',
            'place_id' => 'maps-place-1',
            'street_address' => '123 Main St',
            'city' => 'Ogden',
            'state' => null,
            'zip' => '84401',
        ],
    ]);

    expect($result)
        ->toMatchArray([
            'total' => 1,
            'created' => 1,
            'errors' => [],
        ]);

    expect(GraphNode::query()
        ->where('project_id', $project->id)
        ->where('type', 'city')
        ->where('normalized_key', 'city:Ogden')
        ->first())
        ->not->toBeNull()
        ->label->toBe('Ogden');
});

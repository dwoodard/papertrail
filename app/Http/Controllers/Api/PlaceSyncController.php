<?php

namespace App\Http\Controllers\Api;

use App\Actions\Graph\PlaceToGraphImporter;
use App\Http\Controllers\Controller;
use App\Models\Place;
use App\Models\Project;
use App\Services\PlaceNormalizer;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PlaceSyncController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private PlaceToGraphImporter $graphImporter,
    ) {}

    public function sync(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => ['required', 'uuid', Rule::exists('projects', 'id')],
            'places' => ['required', 'array'],
            'places.*' => ['array'],
        ]);

        $projectId = (string) $validated['project_id'];
        $placesData = $validated['places'];

        // Verify project exists
        $project = Project::query()->whereKey($projectId)->firstOrFail();

        $created = 0;
        $updated = 0;

        foreach ($placesData as $placeData) {
            $normalized = PlaceNormalizer::normalize($placeData);

            $result = Place::updateOrCreate(
                [
                    'project_id' => $project->id,
                    'place_id' => $normalized['place_id'],
                ],
                $normalized
            );

            // Create graph nodes and edges
            $this->graphImporter->execute($result);

            if ($result->wasRecentlyCreated) {
                $created++;
            } else {
                $updated++;
            }
        }

        return response()->json([
            'created' => $created,
            'updated' => $updated,
        ]);
    }
}

<?php

namespace App\Http\Controllers\Api;

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

    public function sync(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => ['required', 'uuid', Rule::exists('projects', 'id')],
            'places' => ['required', 'array'],
            'places.*' => ['array'],
        ]);

        $projectId = $validated['project_id'];
        $placesData = $validated['places'];

        // Verify project exists
        $project = Project::findOrFail($projectId);

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

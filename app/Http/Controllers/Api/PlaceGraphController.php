<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Place;
use App\Models\Project;
use App\Services\PlaceGraphQueryService;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class PlaceGraphController extends Controller
{
    use AuthorizesRequests;

    public function __construct(
        private PlaceGraphQueryService $queryService,
    ) {}

    /**
     * Get shared phone number connections in a project.
     */
    public function sharedPhones(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => ['required', 'uuid', Rule::exists('projects', 'id')],
        ]);

        $project = Project::query()->whereKey((string) $validated['project_id'])->firstOrFail();
        $this->authorize('view', $project);

        $connections = $this->queryService->findSharedPhoneConnections($project->id);

        return response()->json([
            'data' => $connections,
            'count' => count($connections),
        ]);
    }

    /**
     * Get shared address connections in a project.
     */
    public function sharedAddresses(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => ['required', 'uuid', Rule::exists('projects', 'id')],
        ]);

        $project = Project::query()->whereKey((string) $validated['project_id'])->firstOrFail();
        $this->authorize('view', $project);

        $connections = $this->queryService->findSharedAddresses($project->id);

        return response()->json([
            'data' => $connections,
            'count' => count($connections),
        ]);
    }

    /**
     * Get shared websites in a project.
     */
    public function sharedWebsites(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => ['required', 'uuid', Rule::exists('projects', 'id')],
        ]);

        $project = Project::query()->whereKey((string) $validated['project_id'])->firstOrFail();
        $this->authorize('view', $project);

        $connections = $this->queryService->findSharedWebsites($project->id);

        return response()->json([
            'data' => $connections,
            'count' => count($connections),
        ]);
    }

    /**
     * Get cross-project phone connections.
     * User must own or have access to view the projects.
     */
    public function crossProjectConnections(Request $request): JsonResponse
    {
        $user = auth()->user();

        // Only show cross-project connections within user's accessible projects
        $connections = $this->queryService->findCrossProjectPhoneConnections();

        return response()->json([
            'data' => $connections,
            'count' => count($connections),
        ]);
    }

    /**
     * Get network around a specific place.
     */
    public function placeNetwork(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'place_id' => ['required', 'uuid'],
            'max_hops' => ['integer', 'min:1', 'max:3'],
        ]);

        // Verify user has access to the place through project
        $place = Place::query()->whereKey((string) $validated['place_id'])->firstOrFail();
        $this->authorize('view', $place->project);

        $network = $this->queryService->getPlaceNetwork(
            $place->id,
            (int) ($validated['max_hops'] ?? 2)
        );

        return response()->json([
            'data' => $network,
            'root' => [
                'id' => $place->id,
                'name' => $place->name,
                'category' => $place->category,
            ],
        ]);
    }

    /**
     * Get connected clusters in a project.
     */
    public function clusters(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => ['required', 'uuid', Rule::exists('projects', 'id')],
            'min_connections' => ['integer', 'min:1', 'max:10'],
        ]);

        $project = Project::query()->whereKey((string) $validated['project_id'])->firstOrFail();
        $this->authorize('view', $project);

        $clusters = $this->queryService->findConnectedClusters(
            $project->id,
            (int) ($validated['min_connections'] ?? 2)
        );

        return response()->json([
            'data' => $clusters,
            'count' => count($clusters),
        ]);
    }

    /**
     * Get graph statistics for a project.
     */
    public function stats(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'project_id' => ['required', 'uuid', Rule::exists('projects', 'id')],
        ]);

        $project = Project::query()->whereKey((string) $validated['project_id'])->firstOrFail();
        $this->authorize('view', $project);

        $stats = $this->queryService->getProjectGraphStats($project->id);

        return response()->json($stats);
    }
}

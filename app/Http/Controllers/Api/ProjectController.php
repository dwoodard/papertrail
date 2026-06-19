<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProjectController extends Controller
{
    public function index(): JsonResponse
    {
        $projects = Project::all();

        return response()->json($projects);
    }

    /**
     * Create a new project from extension.
     * The extension creates projects locally with a UUID;
     * this endpoint creates them in the database.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'id' => ['required', 'uuid'],
            'name' => ['required', 'string', 'max:255'],
            'goal' => ['nullable', 'string'],
        ]);

        // Check if project already exists
        $project = Project::where('id', $validated['id'])->first();

        if (! $project) {
            // Generate unique slug
            $baseSlug = Str::slug($validated['name']);
            $slug = $baseSlug;
            $counter = 1;

            while (Project::where('slug', $slug)->exists()) {
                $slug = "{$baseSlug}-{$counter}";
                $counter++;
            }

            $project = Project::create([
                'id' => $validated['id'],
                'user_id' => auth()->id() ?? 1, // Default to user 1 if not authenticated
                'name' => $validated['name'],
                'slug' => $slug,
                'goal' => $validated['goal'],
                'status' => 'active',
            ]);
        }

        return response()->json($project, 201);
    }
}

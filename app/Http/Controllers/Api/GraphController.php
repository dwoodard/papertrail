<?php

namespace App\Http\Controllers\Api;

use App\Models\GraphEdge;
use App\Models\GraphNode;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GraphController extends Controller
{
    /**
     * Get all projects with graph statistics.
     */
    public function projects(): JsonResponse
    {
        $projects = Project::with('places')
            ->get()
            ->map(function ($project) {
                $nodeCount = GraphNode::where('project_id', $project->id)->count();
                $edgeCount = GraphEdge::where('project_id', $project->id)->count();

                return [
                    'id' => $project->id,
                    'name' => $project->name,
                    'slug' => $project->slug,
                    'goal' => $project->goal,
                    'status' => $project->status,
                    'nodeCount' => $nodeCount,
                    'edgeCount' => $edgeCount,
                    'placeCount' => $project->places()->count(),
                ];
            });

        return response()->json(['projects' => $projects]);
    }

    /**
     * Get graph data for a project (nodes and edges).
     * Supports filtering by search query and node types.
     */
    public function projectGraph(Request $request, $projectId): JsonResponse
    {
        $project = Project::findOrFail($projectId);
        $search = $request->query('search', '');
        $types = $request->query('types', []); // array of node types to include
        $minConnections = (int) $request->query('minConnections', 0);

        // Get all nodes for this project
        $query = GraphNode::where('project_id', $projectId);

        // Filter by type if specified
        if (! empty($types)) {
            $query->whereIn('type', (array) $types);
        }

        // Filter by search
        if ($search) {
            $query->where('label', 'ilike', "%{$search}%");
        }

        $nodes = $query->get()->map(fn ($node) => [
            'id' => $node->id,
            'label' => $node->label,
            'type' => $node->type,
            'source' => $node->source,
            'properties' => $node->properties,
        ])->keyBy('id');

        // Get edges between nodes
        $edges = GraphEdge::where('project_id', $projectId)
            ->whereIn('from_node_id', $nodes->keys())
            ->whereIn('to_node_id', $nodes->keys())
            ->get()
            ->map(fn ($edge) => [
                'id' => $edge->id,
                'source' => (string) $edge->from_node_id,
                'target' => (string) $edge->to_node_id,
                'type' => $edge->type,
                'confidence' => (float) $edge->confidence,
            ]);

        // Count connections and filter by minConnections if specified
        if ($minConnections > 0) {
            $connectionCounts = collect($edges)->reduce(function ($carry, $edge) {
                $carry[$edge['source']] = ($carry[$edge['source']] ?? 0) + 1;
                $carry[$edge['target']] = ($carry[$edge['target']] ?? 0) + 1;

                return $carry;
            }, []);

            // Filter nodes
            $nodes = $nodes->filter(function ($node) use ($connectionCounts, $minConnections) {
                return ($connectionCounts[$node['id']] ?? 0) >= $minConnections;
            });

            // Filter edges
            $edges = $edges->filter(function ($edge) use ($nodes) {
                return $nodes->has($edge['source']) && $nodes->has($edge['target']);
            });
        }

        // Add connection count to each node
        $connectionCounts = collect($edges)->reduce(function ($carry, $edge) {
            $carry[$edge['source']] = ($carry[$edge['source']] ?? 0) + 1;
            $carry[$edge['target']] = ($carry[$edge['target']] ?? 0) + 1;

            return $carry;
        }, []);

        $nodesWithCounts = $nodes->map(function ($node) use ($connectionCounts) {
            return array_merge($node, [
                'value' => $connectionCounts[$node['id']] ?? 0,
                'confidence' => 1,
            ]);
        });

        return response()->json([
            'project' => [
                'id' => $project->id,
                'name' => $project->name,
                'slug' => $project->slug,
            ],
            'nodes' => $nodesWithCounts->values(),
            'links' => $edges->values(),
        ]);
    }

    /**
     * Get all relations for a specific node.
     */
    public function nodeRelations(Request $request, $nodeId): JsonResponse
    {
        $node = GraphNode::findOrFail($nodeId);

        $relations = [];

        // Outgoing edges
        $outgoing = GraphEdge::where('from_node_id', $nodeId)
            ->with('toNode')
            ->get();

        foreach ($outgoing as $edge) {
            $relations[] = [
                'nodeId' => (string) $edge->toNode->id,
                'nodeName' => $edge->toNode->label,
                'nodeType' => $edge->toNode->type,
                'relationType' => $edge->type,
                'direction' => 'outgoing',
                'confidence' => (float) $edge->confidence,
            ];
        }

        // Incoming edges
        $incoming = GraphEdge::where('to_node_id', $nodeId)
            ->with('fromNode')
            ->get();

        foreach ($incoming as $edge) {
            $relations[] = [
                'nodeId' => (string) $edge->fromNode->id,
                'nodeName' => $edge->fromNode->label,
                'nodeType' => $edge->fromNode->type,
                'relationType' => $edge->type,
                'direction' => 'incoming',
                'confidence' => (float) $edge->confidence,
            ];
        }

        // Count total connections per related node
        $connectionMap = collect($relations)->countBy('nodeId');
        $relations = array_map(fn ($r) => array_merge($r, [
            'connectionCount' => $connectionMap[$r['nodeId']] ?? 1,
        ]), $relations);

        return response()->json([
            'node' => [
                'id' => (string) $node->id,
                'label' => $node->label,
                'type' => $node->type,
            ],
            'relations' => $relations,
        ]);
    }

    /**
     * Get cross-project connections (shared nodes like phones, domains, addresses).
     */
    public function sharedNodes(): JsonResponse
    {
        // Find nodes that appear in multiple projects (by normalized_key)
        $sharedNodes = GraphNode::selectRaw('normalized_key, type, label, COUNT(DISTINCT project_id) as project_count')
            ->whereNotNull('normalized_key')
            ->groupBy('normalized_key', 'type', 'label')
            ->having('project_count', '>', 1)
            ->get()
            ->map(fn ($node) => [
                'type' => $node->type,
                'label' => $node->label,
                'projectCount' => $node->project_count,
                'normalizedKey' => $node->normalized_key,
            ]);

        return response()->json(['sharedNodes' => $sharedNodes]);
    }
}

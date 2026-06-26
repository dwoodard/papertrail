<?php

namespace App\Http\Controllers\Api;

use App\Models\GraphEdge;
use App\Models\GraphNode;
use App\Models\Project;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Routing\Controller;
use Illuminate\Support\Collection;

class GraphController extends Controller
{
    /**
     * Get all projects with graph statistics.
     */
    public function projects(): JsonResponse
    {
        $projects = Project::with('places')
            ->get()
            ->map(function (Project $project) {
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
    public function projectGraph(Request $request, string $projectId): JsonResponse
    {
        $project = Project::query()->whereKey($projectId)->firstOrFail();
        $search = (string) $request->query('search', '');
        $types = $request->query('types', []); // array of node types to include
        $minConnections = (int) $request->query('minConnections', 0);

        // Get all nodes for this project
        $query = GraphNode::where('project_id', $projectId);

        // Filter by type if specified (using db types, not frontend types)
        if (! empty($types)) {
            $dbTypes = $this->mapFrontendTypesToDbTypes((array) $types);
            $query->whereIn('type', $dbTypes);
        }

        // Filter by search
        if ($search) {
            $query->where('label', 'ilike', "%{$search}%");
        }

        $nodes = $query->get()->map(fn (GraphNode $node) => [
            'id' => $node->id,
            'label' => $node->label,
            'type' => $this->normalizeNodeType($node->type),
            'source' => $node->source,
            'properties' => $node->properties,
        ])->keyBy('id');

        // Get all edges (including LOCATED_IN for location mapping)
        $allEdges = GraphEdge::where('project_id', $projectId)
            ->whereIn('from_node_id', $nodes->keys())
            ->get();

        // Map nodes to their location (city) via LOCATED_IN edges
        $nodeLocations = [];
        foreach ($allEdges as $edge) {
            if ($edge->type === 'LOCATED_IN') {
                $locationNode = GraphNode::find($edge->to_node_id);
                if ($locationNode && $locationNode->type === 'city') {
                    $nodeLocations[$edge->from_node_id] = [
                        'id' => $locationNode->id,
                        'name' => $locationNode->label,
                    ];
                }
            }
        }

        // Add location info to nodes
        $nodes = $nodes->map(function (array $node) use ($nodeLocations) {
            return array_merge($node, [
                'location' => $nodeLocations[$node['id']] ?? null,
            ]);
        });

        // Get edges between nodes (only those within visible node set)
        $edges = $allEdges
            ->whereIn('to_node_id', $nodes->keys())
            ->map(fn (GraphEdge $edge) => [
                'id' => $edge->id,
                'source' => (int) $edge->from_node_id,
                'target' => (int) $edge->to_node_id,
                'type' => $edge->type,
                'confidence' => (float) $edge->confidence,
            ]);

        // Count connections and filter by minConnections if specified
        if ($minConnections > 0) {
            $connectionCounts = $this->connectionCounts($edges);

            // Filter nodes
            $nodes = $nodes->filter(function (array $node) use ($connectionCounts, $minConnections) {
                return ($connectionCounts[$node['id']] ?? 0) >= $minConnections;
            });

            // Filter edges
            $edges = $edges->filter(function (array $edge) use ($nodes) {
                return $nodes->has($edge['source']) && $nodes->has($edge['target']);
            });
        }

        // Add connection count to each node
        $connectionCounts = $this->connectionCounts($edges);

        $nodesWithCounts = $nodes->map(function (array $node) use ($connectionCounts) {
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
            'nodes' => $nodesWithCounts->values()->toArray(),
            'links' => $edges->values()->toArray(),
        ]);
    }

    /**
     * @param  Collection<int, array{id: int, source: int, target: int, type: string, confidence: float}>  $edges
     * @return array<int, int>
     */
    private function connectionCounts(Collection $edges): array
    {
        return $edges->reduce(function (array $carry, array $edge): array {
            $carry[$edge['source']] = ($carry[$edge['source']] ?? 0) + 1;
            $carry[$edge['target']] = ($carry[$edge['target']] ?? 0) + 1;

            return $carry;
        }, []);
    }

    /**
     * Get all relations for a specific node.
     */
    public function nodeRelations(Request $request, string $nodeId): JsonResponse
    {
        $node = GraphNode::query()->whereKey($nodeId)->firstOrFail();

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

    /**
     * Normalize database node types to frontend types.
     * Maps internal types to the set of types the UI expects.
     */
    private function normalizeNodeType(string $dbType): string
    {
        return match ($dbType) {
            'phone' => 'contact',
            'domain' => 'website',
            'address' => 'location',
            'city' => 'location',
            'category' => 'business', // Categorizations grouped with business
            default => $dbType, // business, website, person stay as-is
        };
    }

    /**
     * Map frontend types (what user selected) to database types.
     * Reverses the normalization for queries.
     *
     * @param  array<int, string>  $frontendTypes
     * @return array<int, string>
     */
    private function mapFrontendTypesToDbTypes(array $frontendTypes): array
    {
        $dbTypes = [];

        foreach ($frontendTypes as $type) {
            match ($type) {
                'contact' => $dbTypes[] = 'phone',
                'website' => array_push($dbTypes, 'website', 'domain'),
                'location' => array_push($dbTypes, 'address', 'city'),
                'business' => array_push($dbTypes, 'business', 'category'),
                default => $dbTypes[] = $type,
            };
        }

        return array_unique($dbTypes);
    }
}

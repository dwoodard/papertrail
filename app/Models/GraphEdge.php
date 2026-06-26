<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property string $project_id
 * @property int $from_node_id
 * @property int $to_node_id
 * @property string $type
 * @property string $confidence
 * @property int|null $evidence_id
 * @property array<string, mixed>|null $properties
 * @property GraphNode $fromNode
 * @property GraphNode $toNode
 */
class GraphEdge extends Model
{
    protected $fillable = [
        'project_id',
        'from_node_id',
        'to_node_id',
        'type',
        'confidence',
        'evidence_id',
        'properties',
    ];

    protected $casts = [
        'confidence' => 'decimal:4',
        'properties' => 'json',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * @return BelongsTo<Project, $this>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * @return BelongsTo<GraphNode, $this>
     */
    public function fromNode(): BelongsTo
    {
        return $this->belongsTo(GraphNode::class, 'from_node_id');
    }

    /**
     * @return BelongsTo<GraphNode, $this>
     */
    public function toNode(): BelongsTo
    {
        return $this->belongsTo(GraphNode::class, 'to_node_id');
    }

    /**
     * @return BelongsTo<EvidenceRecord, $this>
     */
    public function evidence(): BelongsTo
    {
        return $this->belongsTo(EvidenceRecord::class, 'evidence_id');
    }
}

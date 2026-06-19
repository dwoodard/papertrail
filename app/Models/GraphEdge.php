<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

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

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function fromNode(): BelongsTo
    {
        return $this->belongsTo(GraphNode::class, 'from_node_id');
    }

    public function toNode(): BelongsTo
    {
        return $this->belongsTo(GraphNode::class, 'to_node_id');
    }

    public function evidence(): BelongsTo
    {
        return $this->belongsTo(EvidenceRecord::class, 'evidence_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GraphNode extends Model
{
    protected $fillable = [
        'project_id',
        'type',
        'label',
        'normalized_key',
        'source',
        'external_id',
        'properties',
    ];

    protected $casts = [
        'properties' => 'json',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function outgoingEdges(): HasMany
    {
        return $this->hasMany(GraphEdge::class, 'from_node_id');
    }

    public function incomingEdges(): HasMany
    {
        return $this->hasMany(GraphEdge::class, 'to_node_id');
    }
}

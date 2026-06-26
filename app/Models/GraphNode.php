<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property string $project_id
 * @property string $type
 * @property string $label
 * @property string|null $normalized_key
 * @property string|null $source
 * @property string|null $external_id
 * @property array<string, mixed>|null $properties
 * @property int $project_count
 */
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

    /**
     * @return BelongsTo<Project, $this>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    /**
     * @return HasMany<GraphEdge, $this>
     */
    public function outgoingEdges(): HasMany
    {
        return $this->hasMany(GraphEdge::class, 'from_node_id');
    }

    /**
     * @return HasMany<GraphEdge, $this>
     */
    public function incomingEdges(): HasMany
    {
        return $this->hasMany(GraphEdge::class, 'to_node_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $project_id
 * @property string $source
 * @property string $source_module
 * @property string|null $source_url
 * @property Carbon|null $captured_at
 * @property string|null $checksum
 * @property array<string, mixed> $raw_data
 */
class EvidenceRecord extends Model
{
    protected $fillable = [
        'project_id',
        'source',
        'source_module',
        'source_url',
        'captured_at',
        'checksum',
        'raw_data',
    ];

    protected $casts = [
        'raw_data' => 'json',
        'captured_at' => 'datetime',
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
    public function edges(): HasMany
    {
        return $this->hasMany(GraphEdge::class, 'evidence_id');
    }
}

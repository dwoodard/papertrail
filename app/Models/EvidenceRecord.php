<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

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

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }

    public function edges(): HasMany
    {
        return $this->hasMany(GraphEdge::class, 'evidence_id');
    }
}

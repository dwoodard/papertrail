<?php

namespace App\Models;

use Database\Factories\PlaceFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Place extends Model
{
    /** @use HasFactory<PlaceFactory> */
    use HasFactory, HasUuids;

    protected $keyType = 'string';

    public $incrementing = false;

    protected $fillable = [
        'project_id',
        'place_id',
        'name',
        'category',
        'street_address',
        'city',
        'state',
        'zip',
        'phone',
        'website',
        'plus_code',
        'hours',
        'status',
        'price_range',
        'maps_url',
        'rating',
        'reviews_count',
        'is_sponsored',
        'keyword',
        'source',
        'captured_at',
    ];

    protected $casts = [
        'rating' => 'decimal:1',
        'is_sponsored' => 'boolean',
        'captured_at' => 'datetime',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}

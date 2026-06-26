<?php

namespace App\Models;

use Database\Factories\PlaceFactory;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property string $id
 * @property string $project_id
 * @property string|null $place_id
 * @property string|null $name
 * @property string|null $category
 * @property string|null $street_address
 * @property string|null $city
 * @property string|null $state
 * @property string|null $zip
 * @property string|null $phone
 * @property string|null $website
 * @property string|null $plus_code
 * @property string|null $hours
 * @property string|null $status
 * @property string|null $price_range
 * @property string|null $maps_url
 * @property string|null $rating
 * @property int|null $reviews_count
 * @property bool $is_sponsored
 * @property string|null $keyword
 * @property string|null $source
 * @property Carbon|null $captured_at
 * @property Project $project
 */
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

    /**
     * @return BelongsTo<Project, $this>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class);
    }
}

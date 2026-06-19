# Stage 02: Place Model — Generation Plan

## Artisan Commands to Run

### 1. Migration (Depends on Project migration)
```bash
php artisan make:migration create_places_table --no-interaction
```
**Output:** `database/migrations/2026_06_18_214330_create_places_table.php`

**Schema:** (Must run AFTER projects migration due to FK dependency)
```php
Schema::create('places', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->foreignUuid('project_id')->constrained()->cascadeOnDelete();
    $table->string('place_id');
    $table->string('name');
    $table->string('category')->nullable();
    $table->string('street_address')->nullable();
    $table->string('city')->nullable();
    $table->string('state', 2)->nullable();
    $table->string('zip')->nullable();
    $table->string('phone')->nullable();
    $table->string('website')->nullable();
    $table->string('plus_code')->nullable();
    $table->text('hours')->nullable();
    $table->string('status')->nullable();
    $table->string('price_range')->nullable();
    $table->text('maps_url')->nullable();
    $table->decimal('rating', 3, 1)->nullable();
    $table->integer('reviews_count')->nullable();
    $table->boolean('is_sponsored')->default(false);
    $table->string('keyword')->nullable();
    $table->string('source')->nullable();
    $table->timestampTz('captured_at')->nullable();
    $table->timestamps();

    $table->unique(['project_id', 'place_id']);
    $table->index('project_id');
    $table->index('keyword');
});
```

### 2. Model
```bash
php artisan make:model Place --no-interaction
```
**Output:** `app/Models/Place.php`

**Key properties:**
- Extend Model
- Use HasFactory, HasUuids traits
- Set `protected $keyType = 'string'` and `public $incrementing = false`
- Add `protected $fillable = [all fields]`
- Add `protected $casts = ['rating' => 'decimal:1', 'is_sponsored' => 'boolean', 'captured_at' => 'datetime', ...]`
- Add relationship: `project()` → BelongsTo

### 3. Factory
```bash
php artisan make:model Place --factory --no-interaction
```
**Output:** `database/factories/PlaceFactory.php`

**Definition:** (Minimal - most data comes from API sync)
```php
return [
    'project_id' => Project::factory(),
    'place_id' => '0x' . fake()->sha256(),
    'name' => fake()->company(),
    'keyword' => fake()->word(),
];
```

---

## Files to Create

### Create (New)
- ✅ `database/migrations/2026_06_18_214330_create_places_table.php`
- ✅ `app/Models/Place.php`
- ✅ `database/factories/PlaceFactory.php`

### Also Created (Not from artisan)
- ✅ `app/Services/PlaceNormalizer.php` — Data normalization service
- ✅ `app/Http/Controllers/Api/PlaceSyncController.php` — Sync endpoint

---

## Execution Strategy

1. **Run migration generator**
2. **Run model generator**
3. **Run factory generator**
4. **Create PlaceNormalizer service** (manual)
5. **Create PlaceSyncController** (manual)
6. **Hand-customize:** Add relationships, traits, casts
7. **Run migrations** → `php artisan migrate`
8. **Test with PlaceSyncTest**

---

## Order Dependency

**Places migration must run AFTER Projects:**
- Timestamp: `2026_06_18_214329` (projects)
- Timestamp: `2026_06_18_214330` (places)

---

## Testing Strategy

**Sync tests:**
```php
$project = Project::factory()->create();
$places = [
    ['placeId' => '0x123', 'name' => 'Business 1', ...],
    ['placeId' => '0x456', 'name' => 'Business 2', ...],
];

$response = $this->actingAs($user)->postJson('/api/places/sync', [
    'project_id' => $project->id,
    'places' => $places,
]);

expect($response->json())->toHaveKeys(['created', 'updated']);
```

---

## Notes

- Places are created exclusively via the sync API
- No direct Place factory usage in most tests (sync API drives it)
- Normalization happens before storage, so no messy data in DB
- Upsert pattern ensures idempotent syncing

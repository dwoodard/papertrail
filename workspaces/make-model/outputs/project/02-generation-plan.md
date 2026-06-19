# Stage 02: Project Model — Generation Plan

## Artisan Commands to Run

### 1. Migration
```bash
php artisan make:migration create_projects_table --no-interaction
```
**Output:** `database/migrations/2026_06_18_214329_create_projects_table.php`

**Schema:**
```php
Schema::create('projects', function (Blueprint $table) {
    $table->uuid('id')->primary();
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->string('name');
    $table->text('goal')->nullable();
    $table->string('status')->default('active');
    $table->timestamps();
});
```

### 2. Model
```bash
php artisan make:model Project --no-interaction
```
**Output:** `app/Models/Project.php`

**Key properties:**
- Extend Model
- Use HasFactory, HasUuids traits
- Set `protected $keyType = 'string'` and `public $incrementing = false` (for UUID)
- Add `protected $fillable = ['user_id', 'name', 'goal', 'status']`
- Add `protected $casts = ['created_at' => 'datetime', 'updated_at' => 'datetime']`
- Add relationships: `user()` → BelongsTo, `places()` → HasMany

### 3. Factory
```bash
php artisan make:model Project --factory --no-interaction
```
**Output:** `database/factories/ProjectFactory.php`

**Definition:**
```php
return [
    'user_id' => User::factory(),
    'name' => fake()->sentence(3),
    'goal' => fake()->sentence(),
    'status' => 'active',
];
```

### 4. Policy (for authorization)
```bash
php artisan make:policy ProjectPolicy --model=Project --no-interaction
```
**Output:** `app/Policies/ProjectPolicy.php`

**Key method:**
```php
public function own(User $user, Project $project): bool
{
    return $user->id === $project->user_id;
}
```

---

## Files to Create/Modify

### Create (New)
- ✅ `database/migrations/2026_06_18_214329_create_projects_table.php`
- ✅ `app/Models/Project.php`
- ✅ `database/factories/ProjectFactory.php`
- ✅ `app/Policies/ProjectPolicy.php`

### Modify (Relationships)
- ✅ `app/Models/User.php` — add `hasMany(Project)` relationship

---

## Execution Strategy

1. **Run migration generator** → creates table definition
2. **Run model generator** → creates base model class
3. **Run factory generator** → creates factory for seeding/testing
4. **Run policy generator** → creates authorization policy
5. **Hand-customize** → add relationships, traits, casts
6. **Run migrations** → `php artisan migrate`
7. **Test** → verify in tinker or via tests

---

## Order Dependency

**Projects must be created BEFORE Places** because:
- Places table has FK → projects(id)
- Migration order: projects (2026_06_18_214329), places (2026_06_18_214330)

---

## Testing Strategy

**Factory usage:**
```php
$project = Project::factory()->create();
$projectWithUser = Project::factory()->for(User::factory())->create();
```

**Relationship tests:**
```php
$project->user; // Should return User
$project->places()->count(); // Should return place count
```

---

## Notes

- UUID as primary key requires `HasUuids` trait and manual key configuration
- Factory should use `User::factory()` for relations, not hardcoded IDs
- Policy's `own()` method enables `$this->authorize('own', $project)` in controllers
- Migration timestamp ensures projects table created before places table

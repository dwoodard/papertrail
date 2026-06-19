# Stage 01: Project Model — Complete Schema Definition

## Model Overview

**Name:** Project  
**Plural:** projects  
**Namespace:** App\Models  
**Table:** projects  
**Purpose:** Manages OSINT research projects — each project belongs to a user and contains many captured places

---

## Fields Specification

| Field | Type | Nullable | Unique | Default | Constraints | Indexed | Notes |
|-------|------|----------|--------|---------|-------------|---------|-------|
| `id` | uuid | No | Yes | Auto | Primary key | Yes | UuidV4, auto-generated |
| `user_id` | bigint | No | No | — | FK → users(id) on cascade delete | Yes | Project owner |
| `name` | string | No | No | — | Max 255 | Yes | Project name (searchable) |
| `goal` | text | Yes | No | null | — | No | Research objective (optional long text) |
| `status` | string | No | No | 'active' | In: active, archived, completed | Yes | Project lifecycle status |
| `created_at` | datetime | No | No | now() | Timestamp | Yes | Record creation |
| `updated_at` | datetime | No | No | now() | Timestamp | Yes | Last modification |

---

## Relationships

### Outbound
- **belongsTo(User):** The user who owns this project. Cascade delete on user deletion.
  - Foreign key: `user_id`
  - Required: Yes
  - Eager load hint: yes (projects are always queried with owner context)

### Inbound
- **hasMany(Place):** All places (captured businesses) belonging to this project.
  - Foreign key: `project_id` (on places table)
  - Cascade delete: Yes (delete places when project deleted)
  - Eager load hint: lazy (loaded only when accessed)

---

## Validation Rules

```php
[
    'name' => ['required', 'string', 'max:255'],
    'goal' => ['nullable', 'string', 'max:2000'],
    'status' => ['required', 'string', 'in:active,archived,completed'],
    'user_id' => ['required', 'exists:users,id'],
]
```

---

## Casting Rules

```php
[
    'created_at' => 'datetime',
    'updated_at' => 'datetime',
]
```

---

## Fillable Attributes

```php
['user_id', 'name', 'goal', 'status']
```

---

## Key Properties

- **Primary Key:** `id` (UUID string)
- **Timestamps:** Yes (`created_at`, `updated_at`)
- **Soft Deletes:** No
- **Versioning:** No
- **Audit Fields:** No (created_at/updated_at sufficient)

---

## Migration Directives

**Table Name:** `projects`

**Columns:**
```sql
- uuid id PRIMARY KEY
- bigint user_id NOT NULL (FK → users.id ON DELETE CASCADE)
- varchar(255) name NOT NULL
- text goal NULLABLE
- varchar(255) status NOT NULL DEFAULT 'active'
- timestamp created_at
- timestamp updated_at
```

**Indexes:**
```sql
- PRIMARY KEY (id)
- UNIQUE (none beyond PK)
- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
- INDEX (user_id) — for fast owner lookup
- INDEX (status) — for filtering by project state
- INDEX (created_at) — for chronological sorting
```

---

## API / Controller Scope

**Routes anticipated:**
- `GET /api/projects` — list authenticated user's projects (ProjectController@index)
- `POST /api/projects` — create project (ProjectController@store)
- `GET /api/projects/{id}` — view one project (ProjectController@show)
- `PUT /api/projects/{id}` — update project (ProjectController@update)
- `DELETE /api/projects/{id}` — delete project (ProjectController@destroy)

**Authorization:** User can only view/modify their own projects (ProjectPolicy)

---

## Special Handling

- **Ownership:** Every project is tied to `auth()->user()->id`. Controller methods should eager-load user for context.
- **Soft Delete:** Not needed — projects are rarely truly deleted in practice, but can be `archived`.
- **Multi-tenancy:** Implicit via `user_id` FK. No shared projects across users.
- **Timestamps:** Standard Laravel timestamps track creation and last update.

---

## Status Enum Values

- `active` — Project is being actively researched (default)
- `archived` — Project is complete or paused
- `completed` — Research is finished and exported

---

## Form/UI Hints (Optional)

**Admin Form Sections:**
- **Details:** name, goal (text area)
- **Status:** status dropdown (active/archived/completed)
- **Metadata:** created_at (read-only), updated_at (read-only)

**List/Table Display:**
- Key columns: name, status, created_at, user.name
- Filterable by: status, created_at
- Searchable: name, goal

---

## Notes

This model is the top-level container for OSINT research work. All captured data (places) flows into projects. Projects are owned by users and have simple lifecycle management (active → archived → completed).

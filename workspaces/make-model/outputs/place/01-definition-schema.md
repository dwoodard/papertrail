# Stage 01: Place Model — Complete Schema Definition

## Model Overview

**Name:** Place  
**Plural:** places  
**Namespace:** App\Models  
**Table:** places  
**Purpose:** Represents a captured business/entity from Google Maps (or other sources). Stores raw and normalized location data with metadata.

---

## Fields Specification

| Field | Type | Nullable | Unique | Default | Constraints | Indexed | Notes |
|-------|------|----------|--------|---------|-------------|---------|-------|
| `id` | uuid | No | Yes | Auto | Primary key | Yes | UuidV4, auto-generated |
| `project_id` | uuid | No | No | — | FK → projects(id) on cascade | Yes | Which project owns this |
| `place_id` | string | No | No | — | Google's 0x... hex ID | Yes | Natural key (Google ID) |
| `name` | string | No | No | — | Max 255, business name | Yes | Searchable |
| `category` | string | Yes | No | null | Business category | No | Contractor, Builder, etc. |
| `street_address` | string | Yes | No | null | Street portion only | No | "123 Main St" |
| `city` | string | Yes | No | null | City name | No | "Salt Lake City" |
| `state` | string(2) | Yes | No | null | 2-char state code | No | "UT", "CA" |
| `zip` | string | Yes | No | null | ZIP/postal code | No | "84111" |
| `phone` | string | Yes | No | null | Cleaned phone number | No | Not searchable (privacy) |
| `website` | string | Yes | No | null | Business website URL | No | Extracted from Google |
| `plus_code` | string | Yes | No | null | Google Plus Code | No | Geo-location reference |
| `hours` | text | Yes | No | null | Business hours (normalized) | No | "Mon-Fri: 9AM-5PM" |
| `status` | string | Yes | No | null | Open/Closed/Open 24h | No | Current status |
| `price_range` | string | Yes | No | null | $, $$, $$$, $$$$ | No | Price tier |
| `maps_url` | text | Yes | No | null | Full Google Maps link | No | Source URL |
| `rating` | decimal(3,1) | Yes | No | null | 0.0–5.0 stars | No | Google rating |
| `reviews_count` | integer | Yes | No | null | Number of reviews | No | Review count |
| `is_sponsored` | boolean | No | false | false | Ad/promoted listing | No | Boolean flag |
| `keyword` | string | Yes | No | null | Search term that found it | Yes | Indexed for filtering |
| `source` | string | Yes | No | null | passive/bulk/partial | No | Collection method |
| `captured_at` | timestampTz | Yes | No | null | When captured | Yes | Chronological |
| `created_at` | datetime | No | now() | Timestamp | Record insertion | Yes | When synced to DB |
| `updated_at` | datetime | No | now() | Timestamp | Last update | Yes | When last updated |

---

## Relationships

### Outbound
- **belongsTo(Project):** The project containing this place. Cascade delete on project deletion.
  - Foreign key: `project_id`
  - Required: Yes
  - Eager load hint: yes (places always queried within project context)

### Inbound
- None (places are leaf nodes in the data structure)

---

## Validation Rules

```php
[
    'project_id' => ['required', 'uuid', Rule::exists('projects', 'id')],
    'place_id' => ['required', 'string', 'max:255'],
    'name' => ['required', 'string', 'max:255'],
    'category' => ['nullable', 'string', 'max:255'],
    'street_address' => ['nullable', 'string', 'max:255'],
    'city' => ['nullable', 'string', 'max:255'],
    'state' => ['nullable', 'string', 'size:2'],
    'zip' => ['nullable', 'string', 'max:20'],
    'phone' => ['nullable', 'string', 'max:20'],
    'website' => ['nullable', 'url', 'max:255'],
    'rating' => ['nullable', 'decimal:1', 'between:0,5'],
    'reviews_count' => ['nullable', 'integer', 'min:0'],
    'is_sponsored' => ['boolean'],
    'keyword' => ['nullable', 'string', 'max:255'],
    'source' => ['nullable', 'string', 'in:passive,bulk,partial'],
]
```

---

## Casting Rules

```php
[
    'rating' => 'decimal:1',
    'is_sponsored' => 'boolean',
    'captured_at' => 'datetime',
    'created_at' => 'datetime',
    'updated_at' => 'datetime',
]
```

---

## Fillable Attributes

```php
[
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
]
```

---

## Key Properties

- **Primary Key:** `id` (UUID string)
- **Natural Key:** `(project_id, place_id)` — unique constraint for upsert safety
- **Timestamps:** Yes (`created_at`, `updated_at`)
- **Soft Deletes:** No
- **Versioning:** No

---

## Migration Directives

**Table Name:** `places`

**Columns:**
```sql
- uuid id PRIMARY KEY
- uuid project_id NOT NULL (FK → projects.id ON DELETE CASCADE)
- varchar(255) place_id NOT NULL
- varchar(255) name NOT NULL
- varchar(255) category NULLABLE
- varchar(255) street_address NULLABLE
- varchar(255) city NULLABLE
- char(2) state NULLABLE
- varchar(20) zip NULLABLE
- varchar(20) phone NULLABLE
- varchar(255) website NULLABLE
- varchar(255) plus_code NULLABLE
- text hours NULLABLE
- varchar(255) status NULLABLE
- varchar(10) price_range NULLABLE
- text maps_url NULLABLE
- decimal(3,1) rating NULLABLE
- integer reviews_count NULLABLE
- boolean is_sponsored NOT NULL DEFAULT false
- varchar(255) keyword NULLABLE
- varchar(255) source NULLABLE
- timestamptz captured_at NULLABLE
- timestamp created_at
- timestamp updated_at
```

**Indexes:**
```sql
- PRIMARY KEY (id)
- UNIQUE (project_id, place_id) — ensures no duplicates per project
- FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
- INDEX (project_id) — for fast project lookups
- INDEX (keyword) — for filtering by search term
- INDEX (captured_at) — for chronological sorting
- INDEX (name) — for searching by business name
```

---

## Data Quality & Normalization

All raw data from Google Maps is **normalized before storage** via `PlaceNormalizer`:

**Hours normalization:**
- Strips noise: "Suggest new hours", "Hours might differ", holiday annotations
- Normalizes em-dash: `–` → `-`
- Collapses whitespace
- Result: Clean, readable string

**Address parsing:**
- Input: "2277 N 3600 W, Clinton, UT 84015" (comma-separated)
- Output: street_address, city, state, zip (separate columns)
- Format: "Street, City, ST ZIP"

**Reviews count:**
- Input: "31 reviews" (with suffix)
- Output: 31 (integer, no suffix)

**Rating:**
- Input: "4.2" (string from Google)
- Output: 4.2 (float, stored as decimal)

**N/A handling:**
- Any field with literal "N/A" → NULL in database
- Privacy-safe nulling for missing data

---

## API / Controller Scope

**Routes:**
- `POST /api/places/sync` — bulk sync places into a project
  - Input: project_id + array of raw Google Maps place data
  - Output: `{created: N, updated: M}`
  - Uses `Place::updateOrCreate()` for upsert safety

**Upsert behavior:**
```php
Place::updateOrCreate(
    ['project_id' => $id, 'place_id' => $placeId],
    $normalized
);
// Same place_id in same project → UPDATE
// New place_id → INSERT
// Zero duplicates guaranteed
```

---

## Special Handling

- **Bulk upsert:** No "create only" or "update only" — sync is always upsert
- **Data normalization:** Raw fields cleaned before storage (PlaceNormalizer)
- **Timezone-aware:** `captured_at` stored as timestamptz for accuracy
- **Privacy:** Phone, address, website stored but not indexed
- **Deduplication:** `(project_id, place_id)` unique constraint prevents duplicates

---

## Source Values

- `passive` — captured via MutationObserver (user navigating Google Maps)
- `bulk` — captured via Scroll & Collect (scrape all results from search)
- `partial` — partially captured (incomplete data)

---

## Form/UI Hints (Optional)

**Admin List View:**
- Key columns: name, city, state, keyword, rating, captured_at
- Searchable: name, city, keyword
- Filterable: status, keyword, source, rating

**No direct form:** Places created only via sync API, not user input

---

## Notes

This model represents the leaf data captured from Google Maps. Places belong to projects (owned by users). The upsert pattern ensures that re-running the same search doesn't create duplicates. All raw data is normalized to ensure consistency and readability.

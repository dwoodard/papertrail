# Graph Database Quick Start

## What Was Created

### 1. Apache AGE Setup
- **Migration:** Enables the AGE extension and creates the `papertrail_graph`
- **Docs:** [APACHE_AGE_SETUP.md](APACHE_AGE_SETUP.md) for installation and troubleshooting

### 2. Graph Sync Service
`app/Services/PlaceGraphSyncService.php`

Automatically called when Places are synced. Transforms a Place into:
- `:Place` node with business metadata
- `:Phone` node (deduplicated)
- `:Address` node (deduplicated)  
- `:Website` node (deduplicated)
- Edges connecting them

### 3. Graph Query Service
`app/Services/PlaceGraphQueryService.php`

Seven investigative queries:
1. **findSharedPhoneConnections()** — Places sharing phone numbers
2. **findSharedAddresses()** — Places at same location
3. **findSharedWebsites()** — Franchise patterns
4. **findCrossProjectPhoneConnections()** — Cross-project intelligence
5. **getPlaceNetwork()** — Connected places (N hops)
6. **findConnectedClusters()** — Tightly connected groups
7. **getProjectGraphStats()** — Summary statistics

### 4. API Endpoints
All in `app/Http/Controllers/Api/PlaceGraphController.php`:

```
GET /api/graph/shared-phones?project_id={uuid}
GET /api/graph/shared-addresses?project_id={uuid}
GET /api/graph/shared-websites?project_id={uuid}
GET /api/graph/cross-project-connections
GET /api/graph/place-network?place_id={uuid}&max_hops=2
GET /api/graph/clusters?project_id={uuid}&min_connections=2
GET /api/graph/stats?project_id={uuid}
```

### 5. Tests
- `tests/Feature/PlaceGraphSyncTest.php` — Verify sync works
- `tests/Feature/PlaceGraphQueryTest.php` — Verify queries work

## Setup Steps

### Step 1: Install Apache AGE

**macOS:**
```bash
brew install age
```

**Linux/Docker:** See [APACHE_AGE_SETUP.md](APACHE_AGE_SETUP.md)

### Step 2: Enable in PostgreSQL

If using Laravel Herd, Apache AGE should be auto-available. Otherwise, run this once on your PostgreSQL instance:

```sql
CREATE EXTENSION IF NOT EXISTS age;
```

### Step 3: Run Migration

```bash
php artisan migrate
```

This creates the `papertrail_graph` and sets up the structure.

### Step 4: Test It

```bash
php artisan test tests/Feature/PlaceGraphSyncTest.php
php artisan test tests/Feature/PlaceGraphQueryTest.php
```

If tests skip with "Apache AGE extension not installed", AGE isn't available in your PostgreSQL.

## Usage Example

### 1. Sync Places (Already Automatic)

```php
// PlaceSyncController already calls this after creating Place
$syncService = app(PlaceGraphSyncService::class);
$syncService->syncPlace($place);
```

### 2. Query the Graph

```php
// Via service
$queryService = app(PlaceGraphQueryService::class);
$connections = $queryService->findSharedPhoneConnections($projectId);

// Via API (from frontend)
GET /api/graph/shared-phones?project_id=abc-def-ghi

// Returns:
{
  "data": [
    {
      "business_1": "John's Plumbing",
      "shared_phone": "5551234567",
      "business_2": "Jane's Plumbing",
      "business_1_rating": 4.5,
      "business_2_rating": 4.2
    }
  ],
  "count": 1
}
```

### 3. Custom Cypher Queries

```php
use Illuminate\Support\Facades\DB;

$results = DB::select("
    SELECT * FROM cypher('papertrail_graph', $$
        MATCH (p:Place {id: \$1})-[:HAS_PHONE]->(phone:Phone)
        RETURN p.name as name, phone.number as phone
    $$) AS (name agtype, phone agtype)
", [$placeId]);

foreach ($results as $row) {
    echo $row->name . ' → ' . $row->phone;
}
```

## Common Workflows

### Find Businesses Under Same Decision-Maker

```bash
GET /api/graph/shared-phones?project_id=davis-county-contractors
```

Groups of places with identical phone numbers likely have the same decision-maker or are shell entities.

### Find Business Complexes

```bash
GET /api/graph/shared-addresses?project_id=davis-county-contractors
```

Multiple businesses at same address could indicate shared ownership or complex.

### Detect Networks (Franchises, Parent Companies)

```bash
GET /api/graph/shared-websites?project_id=davis-county-contractors
```

Same website across businesses suggests franchise, branch, or shell network.

### Cross-Project Intelligence (Hidden Connections)

```bash
GET /api/graph/cross-project-connections
```

**Critical for investigation:** Same phone in multiple projects could reveal the same person/entity operating across seemingly unrelated areas.

### Analyze Network Around One Business

```bash
GET /api/graph/place-network?place_id=abc-uuid&max_hops=2
```

See all connected places (within 2 degrees of connection). Useful for targeting related businesses.

### Find Clusters

```bash
GET /api/graph/clusters?project_id=davis-county-contractors&min_connections=2
```

Identify tightly connected groups (share 2+ contact points).

## Data Flow

```
Extension Scraper
    ↓ POST /api/places/sync
PostgreSQL places table
    ↓ (PlaceSyncController)
PlaceGraphSyncService
    ↓ Cypher CREATE statements
Apache AGE Graph
    ↓ (PlaceGraphQueryService)
API Endpoints
    ↓ 
Frontend (visualization, analysis)
```

## Troubleshooting

**Tests skip with "Apache AGE extension not installed"**
- AGE isn't available on your PostgreSQL instance
- macOS: `brew install age`
- See [APACHE_AGE_SETUP.md](APACHE_AGE_SETUP.md) for other platforms

**"Graph 'papertrail_graph' does not exist"**
- Run `php artisan migrate`

**Cypher syntax error in custom queries**
- Check Apache AGE Cypher support: not all Neo4j features are available
- Use `MERGE` for contact nodes, not `CREATE`, to avoid duplicates

**Queries returning empty results**
- Verify Places are synced: check if graph nodes exist with a quick test query
- Check project_id matches

## Next Steps

1. ✅ Set up Apache AGE
2. ✅ Run migrations
3. ✅ Test with unit tests
4. → Build frontend to visualize graph results
5. → Add custom queries for investigation workflows
6. → Implement network visualization (D3.js, Cytoscape.js)

## File Reference

- Migration: `database/migrations/2026_06_19_020547_enable_apache_age_extension.php`
- Sync: `app/Services/PlaceGraphSyncService.php`
- Queries: `app/Services/PlaceGraphQueryService.php`
- API: `app/Http/Controllers/Api/PlaceGraphController.php`
- Routes: `routes/api.php`
- Tests: `tests/Feature/PlaceGraph*.php`
- Docs: `_docs/APACHE_AGE_SETUP.md` (detailed)

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│ Google Maps Scraper (Extension)             │
└────────────────┬────────────────────────────┘
                 │ Raw scraped data
                 ↓
┌─────────────────────────────────────────────┐
│ PlaceNormalizer                             │
│ (Clean address, phone, website fields)      │
└────────────────┬────────────────────────────┘
                 │ Normalized data
                 ↓
┌─────────────────────────────────────────────┐
│ PostgreSQL places table                     │
│ (Relational data store)                     │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│ PlaceGraphSyncService                       │
│ (Extract contact points, create nodes)      │
└────────────────┬────────────────────────────┘
                 │ Cypher CREATE/MERGE
                 ↓
┌─────────────────────────────────────────────┐
│ Apache AGE Graph (papertrail_graph)         │
│                                             │
│ Place --HAS_PHONE--> Phone                  │
│ Place --HAS_ADDRESS--> Address              │
│ Place --HAS_WEBSITE--> Website              │
│ Project --CONTAINS--> Place                 │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│ PlaceGraphQueryService                      │
│ (Find connections, clusters, networks)      │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│ API Endpoints (PlaceGraphController)        │
│ (/api/graph/shared-phones, etc)             │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│ Frontend (Vue components)                   │
│ (Display graphs, connections, networks)     │
└─────────────────────────────────────────────┘
```

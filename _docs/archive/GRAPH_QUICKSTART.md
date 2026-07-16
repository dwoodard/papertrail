# Graph Database Quick Start

## What Was Created

### 1. Graph Sync Service
`app/Services/PlaceGraphSyncService.php`

Automatically called when Places are synced. Transforms a Place into:
- `:Place` node with business metadata
- `:Phone` node (deduplicated)
- `:Address` node (deduplicated)  
- `:Website` node (deduplicated)
- Edges connecting them

### 2. Graph Query Service
`app/Services/PlaceGraphQueryService.php`

Seven investigative queries:
1. **findSharedPhoneConnections()** — Places sharing phone numbers
2. **findSharedAddresses()** — Places at same location
3. **findSharedWebsites()** — Franchise patterns
4. **findCrossProjectPhoneConnections()** — Cross-project intelligence
5. **getPlaceNetwork()** — Connected places (N hops)
6. **findConnectedClusters()** — Tightly connected groups
7. **getProjectGraphStats()** — Summary statistics

### 3. API Endpoints
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

### 4. Tests
- `tests/Feature/PlaceGraphSyncTest.php` — Verify sync works
- `tests/Feature/PlaceGraphQueryTest.php` — Verify queries work

## Setup Steps

### Step 1: Run Migrations

```bash
php artisan migrate
```

This creates the necessary database structure for graph operations.

### Step 2: Test It

```bash
php artisan test tests/Feature/PlaceGraphSyncTest.php
php artisan test tests/Feature/PlaceGraphQueryTest.php
```

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
    ↓ Graph relationship creation
Graph data structure
    ↓ (PlaceGraphQueryService)
API Endpoints
    ↓ 
Frontend (visualization, analysis)
```

## Troubleshooting

**Graph operations failing**
- Run `php artisan migrate` to ensure database structure is set up
- Check that Places have been synced to the database

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

- Sync: `app/Services/PlaceGraphSyncService.php`
- Queries: `app/Services/PlaceGraphQueryService.php`
- API: `app/Http/Controllers/Api/PlaceGraphController.php`
- Routes: `routes/api.php`
- Tests: `tests/Feature/PlaceGraph*.php`

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
                 │ Graph relationship creation
                 ↓
┌─────────────────────────────────────────────┐
│ Graph Structure                             │
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

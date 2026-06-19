# Apache AGE Graph Database Setup

This document explains how to set up Apache AGE (Advanced Graph Engine) as a PostgreSQL extension for Papertrail's graph analysis capabilities.

## What is Apache AGE?

Apache AGE is an open-source PostgreSQL extension that adds **native graph database capabilities** directly into PostgreSQL. It allows you to:

- Write Cypher queries (Neo4j syntax) within PostgreSQL
- Store and query graph relationships efficiently
- Mix relational and graph queries seamlessly
- Avoid maintaining a separate graph database

## Installation

### 1. Install Apache AGE Extension (PostgreSQL Server)

Apache AGE needs to be installed at the PostgreSQL server level, not just in your Laravel app.

#### Via Homebrew (macOS)
```bash
brew install age
```

#### Via Package Manager (Linux)
```bash
# Ubuntu/Debian
sudo apt-get install postgresql-<version>-age

# CentOS/RHEL
sudo yum install age
```

#### Via Docker (if using Docker Compose)
```dockerfile
FROM postgres:15

RUN apt-get update && \
    apt-get install -y postgresql-15-age && \
    apt-get clean

RUN echo "shared_preload_libraries = 'age'" >> /etc/postgresql/15/main/postgresql.conf
```

#### Manual Build (if needed)
```bash
git clone https://github.com/apache/age.git
cd age
make
sudo make install
```

### 2. Enable AGE in PostgreSQL

After installing, enable the extension in your PostgreSQL database:

```sql
CREATE EXTENSION IF NOT EXISTS age;
SELECT load_graph_search_path();
```

### 3. Run Laravel Migration

Once AGE is installed and enabled, run the migration to set up the Papertrail graph:

```bash
php artisan migrate
```

This runs `enable_apache_age_extension.php` which:
- Creates the `papertrail_graph` graph
- Sets up graph nodes and relationships

## Architecture

### Graph Structure

```
Place (node)
├── HAS_PHONE → Phone (node)
├── HAS_ADDRESS → Address (node)
└── HAS_WEBSITE → Website (node)

Project (node)
└── CONTAINS → Place (node)
```

### Data Flow

```
Google Maps Scraper
    ↓ (PlaceNormalizer)
PostgreSQL Place Table
    ↓ (PlaceGraphSyncService)
Apache AGE Graph Nodes + Relationships
    ↓ (PlaceGraphQueryService)
API Endpoints → Frontend
```

## Usage

### Syncing Places to Graph

When a Place is created/updated via the sync API:

```php
// PlaceSyncController automatically calls:
$this->graphSync->syncPlace($place);
```

This creates:
1. A `:Place` node with place data
2. A `:Phone` node (if phone exists) + `HAS_PHONE` edge
3. An `:Address` node (if address exists) + `HAS_ADDRESS` edge
4. A `:Website` node (if website exists) + `HAS_WEBSITE` edge
5. Links the Place to its Project with `CONTAINS` edge

### Querying the Graph

#### Example 1: Find places sharing the same phone

```php
// Via PlaceGraphQueryService
$connections = $queryService->findSharedPhoneConnections($projectId);
```

#### Example 2: Find all places in a project that share an address

```php
$shared = $queryService->findSharedAddresses($projectId);
```

#### Example 3: Network visualization

```php
$network = $queryService->getPlaceNetwork($placeId, $maxHops = 2);
```

#### Example 4: Cross-project intelligence

```php
// Find phone numbers appearing in multiple projects
$crossProject = $queryService->findCrossProjectPhoneConnections();
```

## API Endpoints

### Graph Analysis Endpoints

All endpoints require authentication and return JSON data.

#### Shared Phone Connections
```
GET /api/graph/shared-phones?project_id={uuid}
```
Returns places in a project that share phone numbers.

**Response:**
```json
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

#### Shared Addresses
```
GET /api/graph/shared-addresses?project_id={uuid}
```
Returns addresses with multiple places (business complexes, shared suites).

#### Shared Websites
```
GET /api/graph/shared-websites?project_id={uuid}
```
Returns websites appearing in multiple places (franchises, networks).

#### Cross-Project Connections
```
GET /api/graph/cross-project-connections
```
Returns phone numbers appearing across multiple projects.

**Critical for intelligence**: Same phone in different projects suggests the same decision-maker or contact point connecting disparate research areas.

#### Place Network
```
GET /api/graph/place-network?place_id={uuid}&max_hops=2
```
Returns all nodes connected to a specific place within N hops.

#### Connected Clusters
```
GET /api/graph/clusters?project_id={uuid}&min_connections=2
```
Returns tightly connected clusters of places (groups sharing multiple contact points).

#### Graph Statistics
```
GET /api/graph/stats?project_id={uuid}
```
Returns summary stats for a project's graph.

**Response:**
```json
{
  "total_places": 42,
  "places_with_phone": 35,
  "places_with_address": 38,
  "places_with_website": 12
}
```

## Raw Cypher Queries

If you need to write custom queries directly, you can use the `cypher()` function in Laravel:

```php
use Illuminate\Support\Facades\DB;

// Find all places in a project
$results = DB::select("
    SELECT * FROM cypher('papertrail_graph', $$
        MATCH (proj:Project {projectId: $1})-[:CONTAINS]->(p:Place)
        RETURN p.name as name, p.rating as rating
    $$) AS (name agtype, rating agtype)
", [$projectId]);

foreach ($results as $row) {
    echo $row->name . ' - Rating: ' . $row->rating;
}
```

### Common Cypher Patterns

#### Pattern 1: Find Places Sharing Contact Info
```cypher
MATCH (p1:Place)-[:HAS_PHONE|HAS_ADDRESS|HAS_WEBSITE]-(contact)<-[:HAS_PHONE|HAS_ADDRESS|HAS_WEBSITE]-(p2:Place)
WHERE p1.id < p2.id
RETURN p1.name, p2.name, contact
```

#### Pattern 2: Find Hubs (Places with Many Connections)
```cypher
MATCH (p:Place)-[rel]-()
WITH p, count(rel) as degree
WHERE degree > 5
RETURN p.name, degree
ORDER BY degree DESC
```

#### Pattern 3: Find Paths Between Two Places
```cypher
MATCH path = (start:Place {id: $1})-[*1..3]-(end:Place {id: $2})
RETURN path
```

#### Pattern 4: Network Centrality (most connected)
```cypher
MATCH (p:Place)-[rel]-()
WITH p, count(rel) as connections
RETURN p.name, connections
ORDER BY connections DESC
LIMIT 10
```

## Troubleshooting

### "Extension 'age' does not exist"

The AGE PostgreSQL extension is not installed on your server.

**Solution:** Install it following the installation steps above.

### "Graph 'papertrail_graph' does not exist"

The migration hasn't been run yet.

**Solution:** Run `php artisan migrate`

### "Cypher syntax error"

Check Cypher syntax against the [Apache AGE documentation](https://age.apache.org/docs/cypher_support/). Note: AGE supports most Cypher but not all features.

### Performance Issues on Large Graphs

If queries are slow with 10,000+ places:

1. Add indexes to frequently queried properties:
```cypher
MATCH (p:Place) CALL apoc.index.addNode(p, ["id", "name"]) RETURN p
```

2. Use `MERGE` for phone/address nodes to avoid duplicates
3. Consider batching sync operations

## Best Practices

1. **Always use MERGE for contact point nodes** — prevents duplicate phone/address nodes
2. **Normalize before syncing** — PlaceNormalizer handles this
3. **Batch syncs** — Sync multiple places in one request for efficiency
4. **Use transactions** — PlaceGraphSyncService wraps operations in DB::beginTransaction()
5. **Cache results** — Graph queries can be expensive; cache results with Laravel's cache

## Performance Tips

- Phone/address/website deduplication happens automatically via MERGE
- Queries return up to 1000 results by default
- For large projects (10k+ places), use pagination or filters
- Consider archiving old projects to keep active graph lean

## Next Steps

1. Set up Apache AGE on your PostgreSQL instance
2. Run migrations: `php artisan migrate`
3. Sync places via the API: `POST /api/places/sync`
4. Query connections via API endpoints
5. Build frontend to visualize graph results

## References

- [Apache AGE Official Docs](https://age.apache.org/)
- [Cypher Query Language](https://age.apache.org/docs/cypher_support/)
- [PostgreSQL Graph Extensions](https://wiki.postgresql.org/wiki/Graph_algorithms)

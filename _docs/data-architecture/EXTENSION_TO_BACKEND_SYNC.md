# Papertrail Data Architecture

## Overview
Data flows from extension local storage → export/sync → Laravel/Postgres backend (with graph/vector storage)

```
┌─────────────────────────────────────────────────────────────────┐
│                    Browser Extension                             │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │            Chrome Local Storage (Module-based)             │ │
│  │  • results (Google Maps scraped listings)                  │ │
│  │  • pt.projects (project metadata)                          │ │
│  │  • pt.activeProjectId (current project context)            │ │
│  │  • pt.observations (observations/notes)                    │ │
│  │  • [other modules...]                                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│            ↓ (Export/Sync)                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │         UI Components (Vue)                                │ │
│  │  • Main.vue (projects hub)                                 │ │
│  │  • GoogleMapsModule.vue (scraper)                          │ │
│  │  • YelpModule.vue (scraper)                                │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
              ↓ (HTTP API - not yet implemented)
┌─────────────────────────────────────────────────────────────────┐
│              Laravel Backend (Papertrail App)                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  PostgreSQL Database                                       │ │
│  │  • projects (project definitions)                          │ │
│  │  • entities (business, person, location, website, contact) │ │
│  │  • relationships (links between entities)                  │ │
│  │  • observations (notes, evidence, metadata)                │ │
│  │  • [audit trail, versioning, etc]                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Graph/Vector Storage (for entity relationships)           │ │
│  │  • Entity embeddings (for similarity search)               │ │
│  │  • Relationship graph (for traversal & analysis)           │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Models

### In Extension (Chrome Local Storage)

#### `results` (Google Maps/Yelp scraped data)
```javascript
{
  placeId: "0x...",           // unique identifier from Google Maps
  name: "Business Name",
  category: "Contractor",
  rating: 4.5,
  reviews: 128,
  address: "123 Main St",
  phone: "(555) 123-4567",
  website: "https://...",
  latitude: 40.7128,
  longitude: -74.0060,
  status: "OPEN",
  priceRange: "$$",
  hours: "...",
  source: "bulk" | "partial" | "passive",  // enrichment status
  keyword: "contractors",                   // search term used
  capturedAt: "2026-06-18T...",
  projectId?: "davis-county-contractors",   // ← NEW: link to project
  project?: { id, name, goal, ... },        // ← NEW: enriched project data
}
```

#### `pt.projects` (Project metadata)
```javascript
[
  {
    id: "davis-county-contractors",
    name: "Davis County Contractors",
    goal: "Find decision makers for contractor businesses",
    observations: 48,
    entities: 12,
    suggestions: 6,
    lastActivity: "2 hours ago",
  },
  // ...
]
```

#### `pt.activeProjectId`
```javascript
"davis-county-contractors"  // current project context
```

#### `pt.observations` (from observations layer)
```javascript
[
  {
    // observation data structure (needs definition)
  }
]
```

### In Backend (PostgreSQL)

#### `projects` table
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  name VARCHAR(255),
  goal TEXT,
  description TEXT,
  status ENUM('active', 'archived'),
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
);
```

#### `entities` table
```sql
CREATE TABLE entities (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  type ENUM('business', 'person', 'location', 'website', 'contact'),
  name VARCHAR(255),
  data JSONB,  -- flexible schema for scraped fields
  confidence FLOAT DEFAULT 1.0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
);
```

#### `relationships` table
```sql
CREATE TABLE relationships (
  id UUID PRIMARY KEY,
  source_entity_id UUID REFERENCES entities(id),
  target_entity_id UUID REFERENCES entities(id),
  type VARCHAR(50),  -- 'DIRECTOR', 'PHONE', 'WEBSITE', etc
  status ENUM('confirmed', 'suggested'),
  evidence TEXT,
  created_at TIMESTAMP,
);
```

#### `observations` table
```sql
CREATE TABLE observations (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  entity_id UUID REFERENCES entities(id),
  type VARCHAR(50),
  content TEXT,
  created_at TIMESTAMP,
);
```

## Data Flow

### 1. Scraping → Extension Storage
1. User browses Google Maps/Yelp
2. Content script scrapes listing details
3. Data stored in `results` (Chrome local storage)
4. Entry enriched with current `pt.activeProjectId`

### 2. User Creates Project
1. User creates project in Main.vue
2. Project saved to `pt.projects` (Chrome local storage)
3. Project ID set as `pt.activeProjectId`
4. All new entries automatically assigned to this project

### 3. Export → Backend (TODO: Not Yet Implemented)
1. User clicks "Export to Project" or similar
2. Selected entries sent to Laravel API
3. Backend creates `entities` rows
4. Backend detects relationships, creates `relationships` rows
5. Data synced back to extension (optional)

### 4. Enrich Entry with Project Data (CURRENT)
When entry is added/loaded:
```
entry → read pt.activeProjectId → find in pt.projects → attach project object → display
```

## Open Questions

### 1. Project Scope
- Is a project created in the **extension** (Main.vue) or in the **backend**?
- Can projects be created in both places?
- How do they stay in sync?

### 2. Entry Assignment to Projects
- When an entry is scraped, should it be automatically assigned to the active project?
- Can an entry belong to multiple projects?
- Can an entry be moved between projects?

### 3. Observations
- Where do observations live during active research (extension vs backend)?
- How are they synced?
- Can they be edited in the backend and synced back?

### 4. Export Strategy
- Is export one-way (extension → backend) or bidirectional?
- What triggers an export? (button click, auto-sync, schedule?)
- What data gets exported? (just entries? relationships? observations?)
- Do exported entries stay in local storage or get removed?

### 5. Graph/Vector Storage
- When are entity embeddings created? (at backend ingest time?)
- Are relationships automatically detected during export or manually created?
- What's the confidence calculation based on?

## Current Implementation Status

✅ **Done:**
- Extension scrapes Google Maps/Yelp into local storage
- Projects created in Main.vue
- Projects saved to `pt.projects` in storage
- Active project tracked in `pt.activeProjectId`
- Entries enriched with project data when loaded/added
- Project name displayed in DetailsModal

❌ **Not Done:**
- Backend API to receive exports
- Entity/relationship models in backend
- Export mechanism (extension → backend)
- Bidirectional sync
- Graph/vector operations
- Observations management

## Next Steps

1. **Define export API contract** - what does the extension send to the backend?
2. **Build backend models** - entities, relationships, observations
3. **Implement export mechanism** - how/when data flows to backend
4. **Design sync strategy** - one-way vs bidirectional
5. **Build graph/vector layer** - entity embeddings, similarity search

# Google Maps to Graph Data Mapping

## Data Flow Overview

```
Google Maps Listing
    ↓
extractListingDetails() → GoogleMapsListingData
    ↓
listingToObservation() → GoogleMapsListingObservation (with entityHints)
    ↓
[Stored in Database as observations]
    ↓
buildHubGraphData() → Graph Nodes & Links
```

## Google Maps Extracted Data Structure

```typescript
GoogleMapsListingData {
  name: string              // Business name (e.g., "Barlow Masonry")
  category: string          // Business type (e.g., "Masonry")
  rating: string            // Star rating (e.g., "4.8")
  reviews: string           // Review count (e.g., "150")
  address: string           // Full address
  website: string           // Website URL
  phone: string             // Phone number
  plusCode: string          // Plus code
  hours: string             // Operating hours
  status: string            // Open/Closed status
  priceRange: string        // $ to $$$$
  latitude: string          // GPS coordinate
  longitude: string         // GPS coordinate
  placeId: string           // Google's unique identifier (0x...)
  mapsUrl: string           // Direct Google Maps link
  isSponsored: boolean
  keyword: string           // Search term used
}
```

## Entity Hints Generated

From one Google Maps listing, we generate **entity hints**:

```typescript
// Primary entity
{
  type: "Business",
  label: "Barlow Masonry",
  canonicalKey: "0x847f...",  // placeId
  status: "confirmed"
}

// Related entities (if present)
{
  type: "Phone",
  label: "(801) 555-0123",
  canonicalKey: "8015550123",  // digits only
  status: "confirmed"
}

{
  type: "Website",
  label: "https://barlowmasonry.com",
  canonicalKey: "barlowmasonry.com",  // domain only
  status: "confirmed"
}

{
  type: "Address",
  label: "123 Main St, Davis County, UT",
  status: "confirmed"
}
```

## Mapping to Graph Structure

### Google Maps Listing → Graph Nodes

```json
{
  "name": "Barlow Masonry",
  "category": "Masonry",
  "phone": "(801) 555-0123",
  "website": "https://barlowmasonry.com",
  "address": "123 Main St, Davis County, UT",
  "placeId": "0x847f...",
  "latitude": "40.7128",
  "longitude": "-74.0060"
}
```

**Becomes graph nodes:**

```json
{
  "id": "business_barlow_masonry",
  "name": "Barlow Masonry",
  "type": "business",
  "value": 3,
  "confidence": 1.0
}

{
  "id": "contact_8015550123",
  "name": "(801) 555-0123",
  "type": "contact",
  "value": 1,
  "confidence": 1.0
}

{
  "id": "website_barlowmasonry",
  "name": "barlowmasonry.com",
  "type": "website",
  "value": 1,
  "confidence": 1.0
}

{
  "id": "location_123_main_st",
  "name": "123 Main St, Davis County, UT",
  "type": "location",
  "value": 1,
  "confidence": 1.0
}
```

### Google Maps Relationships → Graph Links

```json
{
  "source": "business_barlow_masonry",
  "target": "contact_8015550123",
  "type": "PHONE",
  "status": "confirmed",
  "evidence": "Google Maps listing - (801) 555-0123"
}

{
  "source": "business_barlow_masonry",
  "target": "website_barlowmasonry",
  "type": "WEBSITE",
  "status": "confirmed",
  "evidence": "Google Maps listing - https://barlowmasonry.com"
}

{
  "source": "business_barlow_masonry",
  "target": "location_123_main_st",
  "type": "ADDRESS",
  "status": "confirmed",
  "evidence": "Google Maps listing - 123 Main St, Davis County, UT"
}
```

## Complete Example: Single Listing

### Raw Google Maps Data (extracted)
```typescript
{
  name: "Barlow Masonry",
  category: "Masonry",
  rating: "4.8",
  reviews: "142",
  phone: "(801) 555-0123",
  website: "https://barlowmasonry.com",
  address: "123 Main St, Davis County, UT",
  placeId: "0x847fffe1234567ab",
  mapsUrl: "https://www.google.com/maps/place/...",
  keyword: "masonry contractors davis county"
}
```

### Stored in Database (Observation)
```typescript
{
  id: "obs_123...",
  projectId: "davis-county-contractors",
  kind: "business_listing",
  data: { /* Google Maps data above */ },
  entityHints: [
    { type: "Business", label: "Barlow Masonry", canonicalKey: "0x847fffe1234567ab" },
    { type: "Phone", label: "(801) 555-0123", canonicalKey: "8015550123" },
    { type: "Website", label: "https://barlowmasonry.com", canonicalKey: "barlowmasonry.com" },
    { type: "Address", label: "123 Main St, Davis County, UT" }
  ],
  status: "confirmed",
  evidence: { type: "page_url", sourceUrl: "https://www.google.com/maps/..." }
}
```

### Rendered in Graph
```json
{
  "nodes": [
    {
      "id": "business_barlow_masonry",
      "name": "Barlow Masonry",
      "type": "business",
      "value": 3,
      "confidence": 1.0
    },
    {
      "id": "contact_8015550123",
      "name": "(801) 555-0123",
      "type": "contact",
      "value": 1,
      "confidence": 1.0
    },
    {
      "id": "website_barlowmasonry",
      "name": "barlowmasonry.com",
      "type": "website",
      "value": 1,
      "confidence": 1.0
    },
    {
      "id": "location_123_main_st",
      "name": "123 Main St, Davis County, UT",
      "type": "location",
      "value": 1,
      "confidence": 1.0
    }
  ],
  "links": [
    {
      "source": "business_barlow_masonry",
      "target": "contact_8015550123",
      "type": "PHONE",
      "status": "confirmed",
      "evidence": "Google Maps listing"
    },
    {
      "source": "business_barlow_masonry",
      "target": "website_barlowmasonry",
      "type": "WEBSITE",
      "status": "confirmed",
      "evidence": "Google Maps listing"
    },
    {
      "source": "business_barlow_masonry",
      "target": "location_123_main_st",
      "type": "ADDRESS",
      "status": "confirmed",
      "evidence": "Google Maps listing"
    }
  ]
}
```

## Entity Types Mapping

| Google Maps Field | Entity Type | Graph Type | Confidence |
|---|---|---|---|
| name | Business | business | 1.0 |
| phone | Phone | contact | 1.0 |
| website | Website | website | 1.0 |
| address | Address | location | 1.0 |
| category | Business (category tag) | business | 0.95 |
| rating | Business (metadata) | business | 0.9 |

## Relationship Types from Google Maps

| Source | Target | Relationship | Status |
|---|---|---|---|
| Business | Phone | PHONE | confirmed |
| Business | Website | WEBSITE | confirmed |
| Business | Address | ADDRESS | confirmed |
| Business | Category | CATEGORY | suggested |
| Business | Rating | RATED | suggested |

## Storage & Query Strategy

### Observation Storage
- **Primary Key**: `observation.id` (UUID)
- **Dedup Key**: `data.placeId` or `data.name.toLowerCase()`
- **Project**: `projectId` links observations to a project
- **Evidence**: `mapsUrl` points to original Google Maps listing

### Entity Resolution
- **Business**: deduplicated by `placeId` or name
- **Phone**: deduplicated by `phoneKey` (digits only: "8015550123")
- **Website**: deduplicated by `domainKey` (domain only: "barlowmasonry.com")
- **Address**: deduplicated by full address string

### Relationship Inference
- All relationships from Google Maps observations are marked `confirmed`
- Multiple observations for the same entity strengthen confidence
- Cross-observation relationships can be suggested based on entity matching

## Example Integration Flow

```
1. User scrapes Google Maps results for "masonry contractors davis county"
   → Extracts 12 business listings

2. Each listing becomes:
   - 1 GoogleMapsListingObservation
   - 4 Entity hints (business + phone + website + address)
   
3. All observations stored in project "davis-county-contractors"

4. When viewing Graph tab:
   - buildHubGraphData() reads all observations in the project
   - Creates nodes from entity hints (deduplicated)
   - Creates links from relationships
   - Result: 48 nodes (12 businesses × 4 entities/business)
   - Result: 36+ links (12 × 3 relationships/business)

5. User can:
   - See network of all businesses, phones, websites, locations
   - Identify which phone number is used by multiple businesses
   - Find common website domain patterns
   - Spot address duplicates (potential business clusters)
   - Discover relationships not visible in raw data
```

## Future Enhancements

- **Person Entity**: Extract business owner/manager from Google reviews or linked data
- **Multiple Observations**: Merge multiple observations of same entity with confidence scoring
- **Temporal Data**: Track when each listing was captured (address changes, phone changes)
- **Suggested Links**: Auto-detect relationships between entities (e.g., shared phone = potentially connected businesses)
- **Enrichment**: Layer in additional data (reverse phone lookup, WHOIS, etc.)

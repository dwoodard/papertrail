# Observations Flow

What happens when a module emits data.

## The Observation Object

```typescript
{
  id: string,                    // crypto.randomUUID()
  projectId: string | null,      // user's selected project
  moduleId: string,              // e.g., 'google-maps'
  kind: ObservationKind,         // 'business_listing', 'person', etc.
  data: Record<string, unknown>, // YOUR EXTRACTED DATA
  source: {
    type: 'live_page',
    url: string,
    capturedAt: ISODateTime,
  },
  status: 'confirmed',           // or 'suggested' for AI
  dedupeKey?: string,            // optional: for deduplication
}
```

## The Dispatch Path

`emit(observations)` → `dispatchObservations(observations)`

**In dispatcher.ts:**
1. Store in `chrome.storage` (source of truth)
2. Broadcast `OBSERVATIONS` message to side panel
3. (Optional) POST to backend API if configured

## Storage

- **Source of truth:** `chrome.storage.local`
- **Where:** `observations/*` key namespace
- **Dedup:** By `dedupeKey` — if exists, update instead of insert

## Side Panel Reaction

Receives `OBSERVATIONS` message → updates UI with new data.

## Backend Sync

When backend API is ready:
- Configure via `configureApiClient()`
- Dispatcher will POST observations
- Already stored locally; API delivery can retry

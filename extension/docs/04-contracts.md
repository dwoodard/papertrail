# Contracts (Shared Types)

Location: `contracts/`

## What They Are

Shared TypeScript interfaces used across service worker, side panel, and content script.

Organized into groups:

**`core/`** — Foundation
- `Entity`, `EntityType` — graph nodes (Business, Person, etc.)
- `Evidence`, `EvidenceRef` — proof/source of data
- `Relationship` — graph edges
- `Project`, `ProjectMember` — workspaces

**`module/`** — Module System
- `ModuleId` — 'google-maps' | 'foo-bar' | etc.
- `ModuleDescriptor` — id, label, capabilities
- `CollectorModule` — module interface (descriptor + matcher + runtime)
- `ModuleRuntime` — extraction methods (startPassiveCapture, bulkCollect, etc.)

**`observation/`** — Data Model
- `Observation<T>` — extracted data shape
- `ObservationKind` — type of thing (business_listing, person, etc.)

**`messages/`** — IPC
- `PtMessage` — discriminated union of all message types
- `BulkCollectOptions`, `CollectProgress` — command/response data

## Import Everything From

```typescript
import type { ModuleId, Observation, PtMessage } from '@contracts'
```

All re-exported from `contracts/index.ts` for convenience.

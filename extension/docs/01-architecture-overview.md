# Architecture Overview

## Three Main Contexts

**Service Worker** ([background/service-worker.ts](../src/background/service-worker.ts))
- Routes URLs to modules
- Broadcasts active module to side panel
- Relays messages

**Side Panel** ([side-panel/](../src/side-panel/))
- User UI (buttons, progress, results)
- Shows active module component
- Sends commands to content script

**Content Script** ([content/content-script.ts](../src/content/content-script.ts))
- Runs on matched websites
- Creates module runtime
- Extracts data from DOM
- Emits observations

## Message Flow

```
Side Panel clicks button
  ↓ (message)
Service Worker
  ↓ (relay)
Content Script (calls runtime method)
  ↓
DOM extraction
  ↓ (observations)
dispatchObservations
  ↓ (stores + broadcasts)
Side Panel receives & displays
```

## Contracts

Shared types for all three contexts:
- `ModuleId`, `ModuleDescriptor` — identify modules
- `CollectorModule`, `ModuleRuntime` — module interface
- `Observation` — extracted data shape
- `PtMessage` — message bus types

See `contracts/` for full definitions.

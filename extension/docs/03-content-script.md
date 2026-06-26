# Content Script

File: [content/content-script.ts](../src/content/content-script.ts)

## What It Does

Runs on matched URLs (from manifest `content_scripts`). Four steps:

1. **Resolve** — Get module for current URL via `resolveModule()`
2. **Create** — Call `module.createRuntime(emit)` with dispatcher
3. **Listen** — Set up message listener with `onMessage()`
4. **Route** — Send messages to runtime methods

## Message Types

**Inbound (from side panel):**
- `ACTIVATE_PASSIVE` → `startPassiveCapture()` / `stopPassiveCapture()`
- `BULK_COLLECT` → `bulkCollect(options)`
- `STOP_COLLECT` → `stopCollect()`

**Outbound (to side panel):**
- `OBSERVATIONS` — extracted data
- `COLLECT_PROGRESS` — bulk collect progress
- `COLLECT_DONE` — collection finished

## The Emit Flow

```typescript
runtime.startPassiveCapture?.()
  ↓
(DOM observer detects change)
  ↓
emit([observations])
  ↓
dispatchObservations(observations)
  ↓
- Store in chrome.storage
- Broadcast to side panel
- (Optional) Send to backend API
```

## Error Handling

Wrapped in try/catch. Errors logged with `[Papertrail]` prefix.

If a module has no runtime, content script still loads but just logs warning.

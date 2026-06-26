# Quick Reference

## Create a New Module

1. Make `modules/module-name/module.ts`
2. Make `modules/module-name/ModuleName.vue`
3. Make `modules/module-name/index.ts`
4. Add to `modules/config.ts`
5. TypeScript auto-updates `ModuleId`

See [modules/README.md](../src/modules/README.md) for full template.

## Extract Data in Module Runtime

```typescript
startPassiveCapture: () => {
  new MutationObserver(() => {
    const data = extract_from_dom()
    if (data) {
      emit([{
        id: crypto.randomUUID(),
        projectId: null,
        moduleId: 'my-module',
        kind: 'business_listing',
        data,
        source: { type: 'live_page', url: window.location.href, capturedAt: new Date().toISOString() },
        status: 'confirmed',
      }])
    }
  }).observe(document.body, { childList: true, subtree: true })
}
```

## Send Message from Side Panel to Content Script

```typescript
import { sendToActiveTab } from '@/utils/messaging'

await sendToActiveTab({ type: 'BULK_COLLECT', options: { scrollToBottom: true } })
```

## Listen for Messages in Component

```typescript
import { onMessage } from '@/utils/messaging'

onMessage((message) => {
  if (message.type === 'OBSERVATIONS') {
    // handle observations
  }
})
```

## Import Types

```typescript
import type { CollectorModule, ModuleId, Observation, PtMessage } from '@contracts'
```

## Debug in Extension

`chrome://extensions/` → Papertrail → Inspect background page → Console

Look for `[Papertrail]` prefixed logs.

## Common Paths

- Module registry: [modules/config.ts](../src/modules/config.ts)
- Module types: [contracts/module/](../src/contracts/module/)
- Observation dispatcher: [observations/dispatcher.ts](../src/observations/dispatcher.ts)
- Content script: [content/content-script.ts](../src/content/content-script.ts)
- Service worker: [background/service-worker.ts](../src/background/service-worker.ts)

# Module System

Modules are self-contained collectors for specific websites.

## Quick Setup: FooBar Module

### 1. Create `src/modules/foo-bar/module.ts`
```typescript
import type { CollectorModule } from '@contracts'

export const fooBarModule: CollectorModule = {
  descriptor: {
    id: 'foo-bar',
    label: 'FooBar',
    supportsPassiveCapture: true,
    supportsBulkCollect: true,
  },
  matches: (url: string): boolean => /^https:\/\/www\.foobar\.com/.test(url),
  createRuntime: (emit) => ({
    startPassiveCapture: () => {
      console.log('[Papertrail] FooBar passive capture started')
    },
    stopPassiveCapture: () => {
      console.log('[Papertrail] FooBar passive capture stopped')
    },
    bulkCollect: async () => {
      console.log('[Papertrail] FooBar bulk collect started')
    },
    stopCollect: () => {
      console.log('[Papertrail] FooBar bulk collect stopped')
    },
  }),
}
```

### 2. Create `src/modules/foo-bar/index.ts`
```typescript
export { fooBarModule } from './module'
export { default as FooBarModule } from './FooBarModule.vue'
```

### 3. Create `src/modules/foo-bar/FooBarModule.vue`
```vue
<template>
  <div class="foo-bar-module">
    <h2>FooBar Module</h2>
    <button @click="togglePassive">{{ passiveActive ? 'Stop' : 'Start' }} Passive</button>
    <button @click="bulkCollect">Bulk Collect</button>
    <p>{{ status }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const passiveActive = ref(false)
const status = ref('Ready')

function togglePassive() {
  passiveActive.value = !passiveActive.value
  status.value = passiveActive.value ? 'Passive active' : 'Ready'
}

async function bulkCollect() {
  status.value = 'Collecting...'
  // TODO: implement
  status.value = 'Ready'
}
</script>

<style scoped>
.foo-bar-module {
  padding: 16px;
}
</style>
```

### 4. Register in `config.ts`
```typescript
import { fooBarModule } from './foo-bar'

export const moduleRegistry = {
  fooBar: fooBarModule,
} as const
```

**Done.** TypeScript auto-updates `ModuleId` to include `'foo-bar'`.

## Structure

```
src/modules/
├── config.ts              ← Register modules here
├── ids.ts                 ← Auto-generated ModuleId type
├── registry.ts            ← Router logic
└── foo-bar/
    ├── module.ts
    ├── index.ts
    └── FooBarModule.vue
```

## How It Works

**Descriptor** (`id`, `label`, capabilities) — tells system what the module is.

**Matcher** (`matches(url)`) — URL pattern to activate module.

**Runtime** (`startPassiveCapture`, `bulkCollect`, etc.) — extraction behavior.

When user navigates to foobar.com:
1. Service worker calls `matches(url)` → `true`
2. UI loads FooBarModule.vue
3. User clicks button → runtime method called
4. Code extracts data → calls `emit(observations)`

## Messages

**UI → Content Script:**
```typescript
{ type: 'ACTIVATE_PASSIVE', active: boolean }
{ type: 'BULK_COLLECT', options: { scrollToBottom?: boolean } }
{ type: 'STOP_COLLECT' }
```

**Content Script → UI:**
```typescript
{ type: 'OBSERVATIONS', observations: Observation[] }
{ type: 'COLLECT_PROGRESS', progress: { done: number, total: number } }
{ type: 'COLLECT_DONE' }
```

## Observation Shape

What you emit:
```typescript
{
  id: crypto.randomUUID(),
  projectId: null,
  moduleId: 'foo-bar',
  kind: 'business_listing',
  data: {
    name: 'Company Name',
    phone: '555-1234',
    website: 'https://example.com',
    // ... any fields you extract
  },
  source: {
    type: 'live_page',
    url: window.location.href,
    capturedAt: new Date().toISOString(),
  },
  status: 'confirmed',
  dedupeKey: 'unique-id',
}
```

## Example: Extract & Emit

```typescript
createRuntime: (emit) => ({
  startPassiveCapture: () => {
    new MutationObserver(() => {
      const name = document.querySelector('.title')?.textContent
      const phone = document.querySelector('.phone')?.textContent
      
      if (name) {
        emit([{
          id: crypto.randomUUID(),
          projectId: null,
          moduleId: 'foo-bar',
          kind: 'business_listing',
          data: { name, phone },
          source: { type: 'live_page', url: window.location.href, capturedAt: new Date().toISOString() },
          status: 'confirmed',
        }])
      }
    }).observe(document.body, { childList: true, subtree: true })
  },
})
```

## Types

All from `@contracts`:

```typescript
interface CollectorModule {
  descriptor: ModuleDescriptor
  matches(url: string): boolean
  createRuntime?(emit: EmitObservations): ModuleRuntime
}

interface ModuleRuntime {
  startPassiveCapture?(): void
  stopPassiveCapture?(): void
  bulkCollect?(options: BulkCollectOptions): Promise<void>
  stopCollect?(): void
}

interface Observation {
  id: string
  projectId: string | null
  moduleId: string
  kind: ObservationKind
  data: Record<string, unknown>
  source: { type: string, url?: string, capturedAt: string }
  status: 'confirmed' | 'suggested'
  dedupeKey?: string
}
```

## Debug

- DevTools: `chrome://extensions/` → Papertrail → Inspect background page
- Check console for `[Papertrail]` logs
- Test matcher: `matches('https://www.foobar.com/page')` should return `true`

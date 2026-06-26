# Module System

## Key Files

**[modules/config.ts](../src/modules/config.ts)** — Registry definition (source of truth)
```typescript
export const moduleRegistry = {
  googleMaps: googleMapsModule,
  // Add new modules here
} as const
```

**[modules/ids.ts](../src/modules/ids.ts)** — Auto-generated ModuleId type
- Derives from config.ts
- TypeScript auto-updates when you add to registry

**[modules/registry.ts](../src/modules/registry.ts)** — Router logic
- `resolveModule(url)` → finds matching module
- `resolveDescriptor(url)` → gets module info
- `buildModuleContext(tabId, url)` → creates side panel context

## Module Structure

```
modules/module-name/
├── module.ts         (CollectorModule definition)
├── index.ts          (barrel export)
└── ModuleName.vue    (UI component)
```

## Adding a New Module

1. Create `modules/module-name/` directory
2. Implement `module.ts` with descriptor, matcher, createRuntime
3. Create `ModuleName.vue` UI component
4. Add to `config.ts`: `moduleName: moduleNameModule`
5. Done — ModuleId auto-updates

See `/modules/README.md` for complete example.

## Circular Dependency Avoidance

- `config.ts` has NO imports (just module definitions)
- `ids.ts` imports from config (derives types)
- `registry.ts` imports from config + contracts
- `contracts` imports from ids (for ModuleId type)

Result: No circular dependencies.

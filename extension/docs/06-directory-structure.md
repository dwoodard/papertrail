# Directory Structure

## Key Decisions

### `modules/` — Self-contained modules
```
modules/
├── config.ts          ← Module registry (source of truth)
├── ids.ts             ← Auto-generated ModuleId type
├── registry.ts        ← Router logic
└── module-name/
    ├── module.ts      ← Descriptor, matcher, runtime
    ├── index.ts       ← Barrel export
    ├── ModuleName.vue ← UI component
    └── composables/   ← Optional: helper logic
```

Modules are self-contained. Everything for one module lives in its directory.

### `side-panel/` — UI shell
```
side-panel/
├── App.vue            ← Root
├── ModuleLayout.vue   ← Router (shows active module)
├── layouts/
│   └── DefaultModule.vue  ← Home page
└── components/        ← Generic UI components
```

Side panel imports module UIs from `modules/`, not the other way around.

### `contracts/` — Shared types
```
contracts/
├── core/              ← Foundation types
├── module/            ← Module system types
├── observation/       ← Data model
└── messages/          ← Message bus types
```

All organized by semantic group, not by file size.

### `content/` — Content script
```
content/
└── content-script.ts  ← Runs on matched URLs
```

Single entry point. Resolves modules, creates runtime, routes messages.

### Other Key Dirs

- `background/` — Service worker (routing, lifecycle)
- `composables/` — Shared Vue logic
- `observations/` — Data storage & dispatch
- `pages/` — Main app (dashboard, projects)
- `popup/` — Browser action popup

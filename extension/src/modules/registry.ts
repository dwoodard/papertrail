import type { ActiveModuleContext, CollectorModule, ModuleDescriptor } from '@contracts'

import { moduleRegistry } from './config'

/** Ordered list of modules. First match wins (product spec §6). */
const modules: CollectorModule[] = Object.values(moduleRegistry)

const unknownDescriptor: ModuleDescriptor = {
    id: 'unknown',
    label: 'No module',
}

/** Resolve the collector module that handles a URL, or null if none match. */
export function resolveModule(url: string | undefined | null): CollectorModule | null {
    if (!url) {
        return null
    }

    return modules.find((module) => module.matches(url)) ?? null
}

/** Resolve a module descriptor for a URL, falling back to the "unknown" module. */
export function resolveDescriptor(url: string | undefined | null): ModuleDescriptor {
    return resolveModule(url)?.descriptor ?? unknownDescriptor
}

/** Build the side-panel-facing context for the active tab. */
export function buildModuleContext(tabId: number, url: string): ActiveModuleContext {
    const descriptor = resolveDescriptor(url)

    return { moduleId: descriptor.id, label: descriptor.label, url, tabId }
}

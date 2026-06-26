import type { ModuleId } from '@/modules/ids'

/**
 * Describes a collector module for the side panel / router. Site-specific
 * collection behaviour lives in the content-side implementation; this is the
 * lightweight descriptor shared across contexts.
 */
export interface ModuleDescriptor {
    id: ModuleId
    label: string
}

/** Resolved module context for the active tab, surfaced to the side panel. */
export interface ActiveModuleContext {
    moduleId: ModuleId
    label: string
    url: string
    tabId: number
}

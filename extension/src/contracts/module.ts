/**
 * Stable identifiers for collector modules. The router resolves the current
 * page URL to one of these (product spec §6).
 */
export type ModuleId = 'google-maps' | 'generic-website' | 'unknown'

/**
 * Describes a collector module for the side panel / router. Site-specific
 * collection behaviour lives in the content-side implementation; this is the
 * lightweight descriptor shared across contexts.
 */
export interface ModuleDescriptor {
    id: ModuleId
    label: string
    /** Whether the module captures automatically without an explicit action. */
    supportsPassiveCapture: boolean
    /** Whether the module exposes an explicit bulk collect action. */
    supportsBulkCollect: boolean
}

/** Resolved module context for the active tab, surfaced to the side panel. */
export interface ActiveModuleContext {
    moduleId: ModuleId
    label: string
    url: string
    tabId: number
}

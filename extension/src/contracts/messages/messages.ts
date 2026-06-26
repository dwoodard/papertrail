import type { ActiveModuleContext } from './module'
import type { Observation } from './observation'

/**
 * The typed message bus shared between the content script, background service
 * worker, side panel, and popup. Every message is a discriminated union keyed
 * on `type`, so handlers stay exhaustively type-checked.
 */

/** Options for an explicit bulk collect run (module-specific behaviour). */
export interface BulkCollectOptions {
    /** Scroll the results feed to the bottom before collecting (Maps). */
    scrollToBottom?: boolean
    /** Limit collection by status, e.g. only un-enriched results. */
    statusFilter?: 'all' | 'pending' | 'enriched'
}

export interface CollectProgress {
    done: number
    total: number
}

export interface ScrapedListing {
    name: string
    address: string
    phone: string
    website: string
    websiteUrl: string
    id: string
}

export type PtMessage =
    // --- side panel / popup -> content ---
    | { type: 'ACTIVATE_PASSIVE'; active: boolean }
    | { type: 'BULK_COLLECT'; options: BulkCollectOptions }
    | { type: 'STOP_COLLECT' }
    | { type: 'REQUEST_MODULE_CONTEXT' }
    | { type: 'START_MAPS_SCRAPE'; scrollToLoadAll?: boolean }
    | { type: 'STOP_MAPS_SCRAPE' }
    | { type: 'REQUEST_CURRENT_SEARCH_TERM' }
    | { type: 'SET_SEARCH_TERM'; searchTerm: string }
    // --- content -> side panel / popup / background ---
    | { type: 'OBSERVATIONS'; observations: Observation[] }
    | { type: 'COLLECT_PROGRESS'; progress: CollectProgress }
    | { type: 'COLLECT_DONE' }
    | { type: 'MODULE_ACTIVE'; context: ActiveModuleContext }
    | { type: 'MAPS_SCRAPE_STARTING'; searchTerm: string; totalListings?: number }
    | { type: 'MAPS_RESULT'; listing: ScrapedListing; index: number; total: number; searchTerm: string }
    | { type: 'MAPS_SCRAPE_WAITING'; waitSeconds: number; collectedCount: number }
    | { type: 'MAPS_SCRAPE_DONE'; totalCount: number; searchTerm: string }
    | { type: 'CURRENT_SEARCH_TERM'; searchTerm: string }
    // --- background / popup -> all ---
    | { type: 'ACTIVE_PROJECT_CHANGED'; projectId: string | null }

export type PtMessageType = PtMessage['type']

/** Narrow a message to a specific variant by its `type`. */
export type PtMessageOf<T extends PtMessageType> = Extract<PtMessage, { type: T }>

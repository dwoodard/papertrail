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

export type PtMessage =
    // --- side panel / popup -> content ---
    | { type: 'ACTIVATE_PASSIVE'; active: boolean }
    | { type: 'BULK_COLLECT'; options: BulkCollectOptions }
    | { type: 'STOP_COLLECT' }
    | { type: 'REQUEST_MODULE_CONTEXT' }
    // --- content -> side panel / popup / background ---
    | { type: 'OBSERVATIONS'; observations: Observation[] }
    | { type: 'COLLECT_PROGRESS'; progress: CollectProgress }
    | { type: 'COLLECT_DONE' }
    | { type: 'MODULE_ACTIVE'; context: ActiveModuleContext }
    // --- background / popup -> all ---
    | { type: 'ACTIVE_PROJECT_CHANGED'; projectId: string | null }

export type PtMessageType = PtMessage['type']

/** Narrow a message to a specific variant by its `type`. */
export type PtMessageOf<T extends PtMessageType> = Extract<PtMessage, { type: T }>

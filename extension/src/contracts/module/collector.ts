import type { BulkCollectOptions, Observation } from '@contracts'
import type { ModuleDescriptor } from './module'

/** Callback a module uses to emit captured observations. */
export type EmitObservations = (observations: Observation[]) => void

/**
 * Content-side collection behaviour for a module. Created per page in the
 * content script (see `createRuntime`).
 *
 * ALL METHODS ARE OPTIONAL. A module implements only what makes sense for
 * that website. For example:
 * - Job posting scraper: only bulkCollect
 * - Price monitor: only startPassiveCapture/stopPassiveCapture
 * - Google Maps: all of the above
 *
 * The content script safely checks before calling: runtime.startPassiveCapture?.()
 */
export interface ModuleRuntime {
    startPassiveCapture?(): void
    stopPassiveCapture?(): void
    bulkCollect?(options: BulkCollectOptions): Promise<void>
    stopCollect?(): void
    scrapeAllMaps?(): Promise<void>
    stopMapsScrape?(): void
}

/**
 * A collector module: a descriptor, a URL matcher, and a factory that builds
 * its content-side runtime. The descriptor + matcher are usable from any
 * context; `createRuntime` is only called inside a content script.
 */
export interface CollectorModule {
    descriptor: ModuleDescriptor
    matches(url: string): boolean
    createRuntime?(emit: EmitObservations): ModuleRuntime
}

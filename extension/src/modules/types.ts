import type { BulkCollectOptions, ModuleDescriptor, Observation } from '@contracts'

/** Callback a module uses to emit captured observations. */
export type EmitObservations = (observations: Observation[]) => void

/**
 * Content-side collection behaviour for a module. Created per page in the
 * content script (see `createRuntime`). Behaviours are optional so a module
 * can support passive capture, bulk collect, both, or neither.
 */
export interface ModuleRuntime {
    startPassiveCapture?(): void
    stopPassiveCapture?(): void
    bulkCollect?(options: BulkCollectOptions): Promise<void>
    stopCollect?(): void
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

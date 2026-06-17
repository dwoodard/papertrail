import type { IsoDateTime } from './common'

/**
 * A project is a focused layer over the global graph (product spec §3, §4).
 * Creation is intentionally lightweight: a name, an optional goal, and an
 * optional starting target.
 */
export interface Project {
    id: string
    name: string
    goal?: string
    startingTarget?: string
    createdAt: IsoDateTime
    updatedAt: IsoDateTime
}

/** Shape used when creating a project from the popup. */
export interface NewProjectInput {
    name: string
    goal?: string
    startingTarget?: string
}

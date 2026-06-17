import type { IsoDateTime } from './common'

/** How a piece of evidence was captured (product spec §9). */
export type EvidenceType =
    | 'page_capture'
    | 'screenshot'
    | 'copied_text'
    | 'copied_table'
    | 'note'
    | 'imported_csv'
    | 'page_url'
    | 'html_snapshot'

export interface Evidence {
    id: string
    type: EvidenceType
    /** Source URL the evidence came from, when applicable. */
    sourceUrl?: string
    /** Inline payload (text/note) or a reference to stored binary (screenshot). */
    content?: string
    capturedAt: IsoDateTime
}

/** A pointer from an observation/relationship to a stored evidence item. */
export interface EvidenceRef {
    type: EvidenceType
    sourceUrl?: string
    capturedAt: IsoDateTime
}

import type { ClaimStatus, IsoDateTime } from './common'

/**
 * The kinds of nodes that live in the global graph. Mirrors the entity types
 * listed in the product spec (§14, §17).
 */
export type EntityType =
    | 'Business'
    | 'Person'
    | 'Website'
    | 'Domain'
    | 'Email'
    | 'Phone'
    | 'Address'
    | 'SocialProfile'
    | 'Listing'
    | 'Review'
    | 'Keyword'
    | 'SearchResult'
    | 'Page'
    | 'EvidenceItem'

/**
 * A graph node. The extension rarely creates entities directly — it emits
 * observations, and the backend resolves/merges them into entities. This type
 * exists so both sides speak the same shape.
 */
export interface Entity {
    id: string
    type: EntityType
    /** Human-readable label, e.g. a business name or a phone number. */
    label: string
    /**
     * Normalised key used for de-duplication / matching across projects,
     * e.g. a digits-only phone number or a lowercased apex domain.
     */
    canonicalKey?: string
    data?: Record<string, unknown>
    createdAt?: IsoDateTime
}

/**
 * A lightweight pointer an observation carries to help the backend resolve the
 * entity it describes, before a real entity id exists.
 */
export interface EntityHint {
    type: EntityType
    label: string
    canonicalKey?: string
    /** facts are `confirmed`; inferred identities arrive as `suggested`. */
    status?: ClaimStatus
}

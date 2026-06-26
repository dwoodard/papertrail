import type { ClaimStatus, Confidence, IsoDateTime } from './common'

/**
 * Directed edge types in the graph. Mirrors the relationship examples in the
 * product spec (§17). Kept as a string union for type-safety while remaining
 * easy to extend per module.
 */
export type RelationshipType =
    | 'BUSINESS_HAS_WEBSITE'
    | 'BUSINESS_HAS_PHONE'
    | 'BUSINESS_HAS_EMAIL'
    | 'BUSINESS_AT_ADDRESS'
    | 'BUSINESS_HAS_LISTING'
    | 'WEBSITE_LINKS_TO_SOCIAL'
    | 'WEBSITE_HAS_PAGE'
    | 'PAGE_MENTIONS_PERSON'
    | 'PERSON_WORKS_AT_BUSINESS'
    | 'PERSON_POSSIBLE_OWNER_OF_BUSINESS'
    | 'ENTITY_APPEARS_IN_PROJECT'
    | 'ENTITY_MATCHES_ENTITY'

/** Re-export under the spec's name for relationship statuses. */
export type RelationshipStatus = ClaimStatus

export interface Relationship {
    id: string
    type: RelationshipType
    fromEntityId: string
    toEntityId: string
    status: RelationshipStatus
    confidence?: Confidence
    /** Evidence item ids that justify this edge. */
    evidenceIds?: string[]
    createdAt?: IsoDateTime
}

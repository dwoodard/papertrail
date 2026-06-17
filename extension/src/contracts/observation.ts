import type { ClaimStatus, Confidence, IsoDateTime } from './common'
import type { EntityHint } from './entity'
import type { EvidenceRef } from './evidence'

/** What an observation is about. Extensible per module. */
export type ObservationKind =
    | 'business_listing'
    | 'business'
    | 'person'
    | 'website'
    | 'page'
    | 'phone'
    | 'email'
    | 'address'
    | 'social_profile'
    | 'search_result'
    | 'note'

/** Where/how the observation was collected. */
export type ObservationSourceType =
    | 'live_page'
    | 'screenshot'
    | 'pasted_text'
    | 'pasted_table'
    | 'note'
    | 'imported'

export interface ObservationSource {
    type: ObservationSourceType
    /** Page URL the observation came from, when applicable. */
    url?: string
    capturedAt: IsoDateTime
}

/**
 * The universal currency of the system. Modules collect facts and emit them as
 * observations; the backend resolves them into entities/relationships.
 *
 * Facts default to `status: 'confirmed'`. AI-derived meaning is emitted as
 * `'suggested'` and stays reviewable (product spec §8).
 */
export interface Observation<TData = Record<string, unknown>> {
    id: string
    projectId: string | null
    moduleId: string
    kind: ObservationKind
    data: TData
    /** Pointers that help the backend resolve which entity this describes. */
    entityHints?: EntityHint[]
    source: ObservationSource
    evidence?: EvidenceRef
    status: ClaimStatus
    confidence?: Confidence
    /** Stable key for client/server de-duplication (e.g. a Google Place ID). */
    dedupeKey?: string
}

/**
 * Fields extracted from a Google Maps business listing. Mirrors the data the
 * reference scraper collects, normalised to typed fields.
 */
export interface GoogleMapsListingData {
    name: string
    category?: string
    rating?: string
    reviews?: string
    address?: string
    website?: string
    phone?: string
    plusCode?: string
    hours?: string
    status?: string
    priceRange?: string
    latitude?: string
    longitude?: string
    placeId?: string
    mapsUrl?: string
    isSponsored?: boolean
    keyword?: string
    /** capture origin within the module: passive observe vs explicit bulk scrape. */
    captureMode?: 'passive' | 'bulk'
}

export type GoogleMapsListingObservation = Observation<GoogleMapsListingData>

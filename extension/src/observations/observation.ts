import type {
    EntityHint,
    GoogleMapsListingData,
    GoogleMapsListingObservation,
    IsoDateTime,
} from '@contracts'

import { uuid } from '@/utils/id'

/** Normalise a phone number to a digits-only canonical key for matching. */
function phoneKey(phone: string): string {
    return phone.replace(/\D+/g, '')
}

/** Reduce a URL to its lowercased apex-ish host for matching. */
function domainKey(website: string): string | undefined {
    try {
        return new URL(website).hostname.replace(/^www\./, '').toLowerCase()
    } catch {
        return undefined
    }
}

/**
 * Build the entity hints a Maps listing implies, so the backend can resolve and
 * connect entities. The business is primary; phone/website/address are emitted
 * as `confirmed` facts the graph can attach to it.
 */
function buildEntityHints(data: GoogleMapsListingData): EntityHint[] {
    const hints: EntityHint[] = [
        {
            type: 'Business',
            label: data.name,
            canonicalKey: data.placeId ?? data.name.toLowerCase(),
            status: 'confirmed',
        },
    ]

    if (data.phone) {
        hints.push({ type: 'Phone', label: data.phone, canonicalKey: phoneKey(data.phone), status: 'confirmed' })
    }
    if (data.website) {
        hints.push({ type: 'Website', label: data.website, canonicalKey: domainKey(data.website), status: 'confirmed' })
    }
    if (data.address) {
        hints.push({ type: 'Address', label: data.address, status: 'confirmed' })
    }

    return hints
}

export interface ToObservationOptions {
    projectId: string | null
    captureMode: 'passive' | 'bulk'
    capturedAt?: IsoDateTime
}

/**
 * Map an extracted Google Maps listing into an Observation. Facts default to
 * `confirmed`; the Maps page URL is attached as evidence (product spec §8, §9).
 */
export function listingToObservation(
    data: GoogleMapsListingData,
    options: ToObservationOptions,
): GoogleMapsListingObservation {
    const capturedAt = options.capturedAt ?? new Date().toISOString()

    return {
        id: uuid(),
        projectId: options.projectId,
        moduleId: 'google-maps',
        kind: 'business_listing',
        data: { ...data, captureMode: options.captureMode },
        entityHints: buildEntityHints(data),
        source: {
            type: 'live_page',
            url: data.mapsUrl,
            capturedAt,
        },
        evidence: data.mapsUrl
            ? { type: 'page_url', sourceUrl: data.mapsUrl, capturedAt }
            : undefined,
        status: 'confirmed',
        dedupeKey: data.placeId ?? data.name.toLowerCase(),
    }
}

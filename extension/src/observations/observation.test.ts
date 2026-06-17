import type { GoogleMapsListingData } from '@contracts'
import { describe, expect, it } from 'vitest'

import { listingToObservation } from './observation'

const listing: GoogleMapsListingData = {
    name: 'ABC Landscaping',
    phone: '(801) 555-1234',
    website: 'https://www.abclandscaping.com/',
    address: '123 Main St, Layton, UT',
    placeId: '0xabc123',
    mapsUrl: 'https://www.google.com/maps/place/ABC',
}

describe('listingToObservation', () => {
    it('maps a listing into a confirmed business_listing observation', () => {
        const observation = listingToObservation(listing, { projectId: 'p1', captureMode: 'bulk' })

        expect(observation.kind).toBe('business_listing')
        expect(observation.moduleId).toBe('google-maps')
        expect(observation.projectId).toBe('p1')
        expect(observation.status).toBe('confirmed')
        expect(observation.data.captureMode).toBe('bulk')
        expect(observation.dedupeKey).toBe('0xabc123')
        expect(observation.evidence).toEqual(
            expect.objectContaining({ type: 'page_url', sourceUrl: listing.mapsUrl }),
        )
    })

    it('derives canonical keys for business, phone, and website hints', () => {
        const observation = listingToObservation(listing, { projectId: null, captureMode: 'passive' })
        const hints = observation.entityHints ?? []

        expect(hints.find((h) => h.type === 'Business')?.canonicalKey).toBe('0xabc123')
        expect(hints.find((h) => h.type === 'Phone')?.canonicalKey).toBe('8015551234')
        expect(hints.find((h) => h.type === 'Website')?.canonicalKey).toBe('abclandscaping.com')
    })

    it('falls back to a lowercased name dedupe key when no place id', () => {
        const observation = listingToObservation(
            { name: 'No Place Co', mapsUrl: 'https://www.google.com/maps' },
            { projectId: 'p1', captureMode: 'passive' },
        )
        expect(observation.dedupeKey).toBe('no place co')
    })
})

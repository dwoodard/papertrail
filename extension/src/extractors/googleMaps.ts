import type { GoogleMapsListingData } from '@contracts'

/**
 * Pure extraction logic for Google Maps. Ported from the reference scraper and
 * split out from orchestration so it can be unit-tested without a browser.
 *
 * Functions that read the live DOM take a `Document`/`Element` so they can be
 * exercised with jsdom; functions that parse a URL or string are fully pure.
 */

export const GOOGLE_MAPS_SELECTORS = {
    feedContainer: 'div[role="feed"]',
    feedContainerAlt: '.m6QErb.DxyBCb',
    listing: '.Nv2PK',
    listingName: '.qBF1Pd',
    clickTarget: 'a.hfpxzc',
    panelContainer: '.m6QErb[role="main"]',
    panelContainerAlt: 'div[role="main"]',
    name: 'h1.DUwDvf',
    category: 'button[jsaction*="category"]',
    rating: '.F7nice span span[aria-hidden="true"]',
    address: 'button[data-item-id="address"]',
    website: 'a.CsEnBe[aria-label^="Website"]',
    phone: 'button[data-item-id^="phone:"] .Io6YTe',
    plusCode: 'button[data-item-id="oloc"]',
    hours: '.t39EBf',
} as const

const NA = 'N/A'

function text(el: Element | null): string | undefined {
    const value = (el as HTMLElement | null)?.innerText?.trim()
    return value && value !== '' ? value : undefined
}

/** Collapse whitespace; return undefined for empty / N/A values. */
export function sanitizeValue(value: string | null | undefined): string | undefined {
    if (value === null || value === undefined) {
        return undefined
    }
    const cleaned = String(value).replace(/\s+/g, ' ').trim()
    return cleaned === '' || cleaned === NA ? undefined : cleaned
}

/** Derive the active search keyword from a Maps URL (and document title fallback). */
export function extractKeyword(url: string, documentTitle = ''): string | undefined {
    const dataMatch = url.match(/!1s([^!]+)!/)
    if (dataMatch) {
        return decodeURIComponent(dataMatch[1].replace(/\+/g, ' '))
    }

    const searchMatch = url.match(/\/maps\/search\/([^/@]+)/)
    if (searchMatch) {
        return decodeURIComponent(searchMatch[1].replace(/\+/g, ' '))
    }

    const placeMatch = url.match(/\/maps\/place\/([^/@]+)/)
    if (placeMatch) {
        return decodeURIComponent(placeMatch[1].replace(/\+/g, ' '))
    }

    const titleMatch = documentTitle.match(/^([^-]+)\s*-\s*Google Maps/)
    if (titleMatch) {
        return titleMatch[1].trim()
    }

    return undefined
}

/** Parse `@lat,lng,zoom` coordinates from a Maps URL. */
export function extractCoordinates(url: string): { latitude?: string; longitude?: string } {
    const match = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (match) {
        return { latitude: match[1], longitude: match[2] }
    }
    return {}
}

/** Parse the `0x…` place id from a Maps URL. */
export function extractPlaceId(url: string): string | undefined {
    const match = url.match(/0x[a-f0-9]+/i)
    return match ? match[0] : undefined
}

/** Parse the `0x…` place id from a listing element's click target href. */
export function extractPlaceIdFromListing(listing: Element): string | undefined {
    const clickTarget = listing.querySelector(GOOGLE_MAPS_SELECTORS.clickTarget) as
        | HTMLAnchorElement
        | null
    if (clickTarget?.href) {
        return extractPlaceId(clickTarget.href)
    }
    return undefined
}

/** Read open/closed status from the hours element. */
export function extractOpenClosedStatus(root: Document | Element): string | undefined {
    const el = root.querySelector(GOOGLE_MAPS_SELECTORS.hours)
    if (!el) {
        return undefined
    }
    const inner = (el as HTMLElement).innerText?.toLowerCase() ?? ''
    const aria = el.getAttribute('aria-label')?.toLowerCase() ?? ''
    const full = `${inner} ${aria}`
    if (full.includes('open 24')) {
        return 'Open 24h'
    }
    if (full.includes('open now') || full.includes('currently open')) {
        return 'Open'
    }
    if (full.includes('closed') || full.includes('closes')) {
        return 'Closed'
    }
    return undefined
}

/** Find a price indicator ($, $$, $$$, $$$$) in the detail panel. */
export function extractPriceRange(root: Document | Element): string | undefined {
    const candidates = Array.from(root.querySelectorAll('span, button, div')).filter((el) => {
        const value = (el as HTMLElement).innerText?.trim() ?? ''
        return /^\$+$/.test(value) && value.length <= 4
    })
    if (candidates.length > 0) {
        return (candidates[0] as HTMLElement).innerText.trim()
    }
    return undefined
}

/** Find a "123 reviews" count among span elements. */
export function extractReviewCount(root: Document | Element): string | undefined {
    const spans = Array.from(root.querySelectorAll('span'))
    for (const span of spans) {
        const value = (span as HTMLElement).innerText?.trim() ?? ''
        if (/^\(?\d[\d,]*\s*reviews?\)?$/i.test(value)) {
            return value.replace(/[()]/g, '').trim()
        }
    }
    return undefined
}

/**
 * Extract the full set of fields for the currently-open detail panel.
 * `url` is passed in (rather than read from `window`) to keep this testable.
 */
export function extractListingDetails(
    doc: Document,
    url: string,
    keyword?: string,
): GoogleMapsListingData {
    const panel =
        doc.querySelector(GOOGLE_MAPS_SELECTORS.panelContainer) ??
        doc.querySelector(GOOGLE_MAPS_SELECTORS.panelContainerAlt) ??
        doc

    const isSponsored = (panel as HTMLElement).innerText?.toLowerCase().includes('sponsored') ?? false

    const website = doc.querySelector(GOOGLE_MAPS_SELECTORS.website) as HTMLAnchorElement | null
    const hoursEl = doc.querySelector(GOOGLE_MAPS_SELECTORS.hours)
    const hours = hoursEl?.getAttribute('aria-label') ?? text(hoursEl)
    const coords = extractCoordinates(url)

    return {
        name: text(doc.querySelector(GOOGLE_MAPS_SELECTORS.name)) ?? NA,
        category: sanitizeValue(text(doc.querySelector(GOOGLE_MAPS_SELECTORS.category))),
        rating: sanitizeValue(text(doc.querySelector(GOOGLE_MAPS_SELECTORS.rating))),
        reviews: extractReviewCount(panel),
        address: sanitizeValue(text(doc.querySelector(GOOGLE_MAPS_SELECTORS.address))),
        website: website?.href,
        phone: sanitizeValue(text(doc.querySelector(GOOGLE_MAPS_SELECTORS.phone))),
        plusCode: sanitizeValue(text(doc.querySelector(GOOGLE_MAPS_SELECTORS.plusCode))),
        hours: sanitizeValue(hours),
        status: extractOpenClosedStatus(panel),
        priceRange: extractPriceRange(panel),
        latitude: coords.latitude,
        longitude: coords.longitude,
        placeId: extractPlaceId(url),
        mapsUrl: url,
        isSponsored,
        keyword,
    }
}

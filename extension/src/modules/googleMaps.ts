import type { BulkCollectOptions } from '@contracts'

import {
    extractKeyword,
    extractListingDetails,
    extractPlaceIdFromListing,
    GOOGLE_MAPS_SELECTORS as S,
} from '@/extractors/googleMaps'
import { listingToObservation } from '@/observations/observation'
import { getActiveProjectId } from '@/utils/activeProject'
import { sendRuntimeMessage } from '@/utils/messaging'
import { rand, sleep } from '@/utils/timing'

import type { CollectorModule, EmitObservations, ModuleRuntime } from './types'

/** Timing knobs for human-like pacing during bulk collection. */
const TIMING = {
    debounceMs: 800,
    clickMinMs: 400,
    clickMaxMs: 1200,
    detailMinMs: 2200,
    detailMaxMs: 4800,
    scrollMinMs: 1500,
    scrollMaxMs: 2800,
}

/**
 * Content-side runtime for Google Maps. Ported from the reference scraper:
 *  - passive capture watches the open detail panel and emits each business
 *  - bulk collect scrolls the results feed, then clicks each listing in turn
 */
function createRuntime(emit: EmitObservations): ModuleRuntime {
    let panelObserver: MutationObserver | null = null
    let debounceTimer: ReturnType<typeof setTimeout> | undefined
    let collecting = false
    const capturedKeys = new Set<string>()

    function panelRoot(): Element | null {
        return document.querySelector(S.panelContainer) ?? document.querySelector(S.panelContainerAlt)
    }

    async function emitCurrentDetail(captureMode: 'passive' | 'bulk'): Promise<void> {
        const url = window.location.href
        const keyword = extractKeyword(url, document.title)
        const data = extractListingDetails(document, url, keyword)
        if (!data.name || data.name === 'N/A') {
            return
        }

        const key = data.placeId ?? data.name.toLowerCase()
        if (captureMode === 'passive' && capturedKeys.has(key)) {
            return
        }
        capturedKeys.add(key)

        const projectId = await getActiveProjectId()
        emit([listingToObservation(data, { projectId, captureMode })])
    }

    function startPassiveCapture(): void {
        if (panelObserver) {
            return
        }
        const root = panelRoot()
        if (!root) {
            return
        }
        panelObserver = new MutationObserver(() => {
            clearTimeout(debounceTimer)
            debounceTimer = setTimeout(() => {
                const nameEl = document.querySelector(S.name) as HTMLElement | null
                if (nameEl?.innerText) {
                    void emitCurrentDetail('passive')
                }
            }, TIMING.debounceMs)
        })
        panelObserver.observe(root, { childList: true, subtree: true })
        console.log('[Papertrail] Google Maps passive capture started')
    }

    function stopPassiveCapture(): void {
        panelObserver?.disconnect()
        panelObserver = null
        clearTimeout(debounceTimer)
    }

    async function scrollCollect(scrollToBottom: boolean): Promise<Element[]> {
        const feed = document.querySelector(S.feedContainer) ?? document.querySelector(S.feedContainerAlt)
        if (!feed) {
            return Array.from(document.querySelectorAll(S.listing))
        }

        let previous = -1
        while (collecting) {
            const listings = document.querySelectorAll(S.listing)
            if (listings.length === previous) {
                break
            }
            previous = listings.length

            if (scrollToBottom) {
                ;(feed as HTMLElement).scrollTop = (feed as HTMLElement).scrollHeight
                await sleep(rand(TIMING.scrollMinMs, TIMING.scrollMaxMs))
            } else {
                await sleep(rand(TIMING.scrollMinMs / 2, TIMING.scrollMaxMs / 2))
            }
        }

        return Array.from(document.querySelectorAll(S.listing))
    }

    async function bulkCollect(options: BulkCollectOptions): Promise<void> {
        if (collecting) {
            return
        }
        collecting = true
        const keyword = extractKeyword(window.location.href, document.title)
        const projectId = await getActiveProjectId()

        try {
            const collected = await scrollCollect(options.scrollToBottom !== false)
            const total = collected.length
            void sendRuntimeMessage({ type: 'COLLECT_PROGRESS', progress: { done: 0, total } })

            for (let i = 0; i < total && collecting; i++) {
                const listing = document.querySelectorAll(S.listing)[i]
                if (!listing) {
                    void sendRuntimeMessage({ type: 'COLLECT_PROGRESS', progress: { done: i + 1, total } })
                    continue
                }

                const placeId = extractPlaceIdFromListing(listing)
                if (placeId && capturedKeys.has(placeId)) {
                    void sendRuntimeMessage({ type: 'COLLECT_PROGRESS', progress: { done: i + 1, total } })
                    continue
                }

                await sleep(rand(TIMING.clickMinMs, TIMING.clickMaxMs))

                const clickTarget =
                    (listing.querySelector(S.clickTarget) as HTMLElement | null) ?? (listing as HTMLElement)
                const preventNav = (event: Event) => {
                    if (clickTarget.tagName === 'A') {
                        event.preventDefault()
                    }
                }
                clickTarget.addEventListener('click', preventNav, true)
                clickTarget.click()
                clickTarget.removeEventListener('click', preventNav, true)

                await sleep(rand(TIMING.detailMinMs, TIMING.detailMaxMs))

                const data = extractListingDetails(document, window.location.href, keyword)
                if (data.name && data.name !== 'N/A') {
                    capturedKeys.add(data.placeId ?? data.name.toLowerCase())
                    emit([listingToObservation(data, { projectId, captureMode: 'bulk' })])
                }

                void sendRuntimeMessage({ type: 'COLLECT_PROGRESS', progress: { done: i + 1, total } })
            }
        } finally {
            collecting = false
            void sendRuntimeMessage({ type: 'COLLECT_DONE' })
        }
    }

    function stopCollect(): void {
        collecting = false
    }

    return { startPassiveCapture, stopPassiveCapture, bulkCollect, stopCollect }
}

/**
 * Google Maps collector module: descriptor, URL matcher, and content runtime.
 */
export const googleMapsModule: CollectorModule = {
    descriptor: {
        id: 'google-maps',
        label: 'Google Maps',
        supportsPassiveCapture: true,
        supportsBulkCollect: true,
    },
    matches: (url: string): boolean => /^https:\/\/www\.google\.com\/maps/.test(url),
    createRuntime,
}

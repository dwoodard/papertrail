import type { ScrapedListing } from '@contracts'
import { sendRuntimeMessage } from '@/utils/messaging'

let isScraping = false
let shouldScrollToLoadAll = true
const extractedIds = new Set<string>()

export function extractSearchTerm(): string {
  // Try to extract from URL: https://www.google.com/maps/search/query+here
  const urlMatch = window.location.pathname.match(/\/maps\/search\/([^/?]+)/)

  if (urlMatch?.[1]) {
    return decodeURIComponent(urlMatch[1]).replace(/\+/g, ' ')
  }

  // Fallback: try to find the search input element
  const searchInput = document.querySelector('input[aria-label*="Search"]') as HTMLInputElement | null

  if (searchInput?.value) {
    return searchInput.value
  }

  // Last resort: check the page title
  const titleMatch = document.title.match(/(.+?)\s*[-–]\s*Google Maps/)

  if (titleMatch?.[1]) {
    return titleMatch[1]
  }

  return 'Unknown Search'
}

function cleanText(text?: string): string | null {
  if (!text) return null
  const cleaned = text.trim().replace(/\n/g, ' ').replace(/\s+/g, ' ').replace(/\s*·\s*Visited link\s*$/, '').trim()
  return cleaned || null
}

function extractId(href: string): string | null {
  const patterns = [
    /0x[a-f0-9]+:0x[a-f0-9]+/i,
    /place\/([^/?&]+)/,
    /data=([^&]+)/,
  ]
  for (const pattern of patterns) {
    const match = href.match(pattern)
    if (match) return match[match.length - 1]
  }
  return null
}

function findListingLink(el: HTMLElement): HTMLAnchorElement | null {
  if (el instanceof HTMLAnchorElement) return el
  const closest = el.closest('a')
  if (closest) return closest as HTMLAnchorElement
  const querySelector = el.querySelector('a')
  if (querySelector) return querySelector as HTMLAnchorElement
  let parent = el.parentElement
  while (parent) {
    if (parent instanceof HTMLAnchorElement) return parent
    const anchor = parent.querySelector('a')
    if (anchor) return anchor as HTMLAnchorElement
    parent = parent.parentElement
  }
  return null
}

function extractListingData(listing: HTMLElement): ScrapedListing | null {
  try {
    let name = listing.getAttribute('aria-label') || 'N/A'

    if (name !== 'N/A') {
      name = name.replace(/\s*·\s*Visited link\s*$/, '').trim()
    }

    const linkElement = findListingLink(listing)
    const id = linkElement?.href ? extractId(linkElement.href) : null

    if (!id) {
      console.log(`[Papertrail] Skipping listing (no ID): ${name}`)
      return null
    }

    // Check if we already extracted this
    if (extractedIds.has(id)) {
      return null
    }

    const ratingElement = listing.querySelector('[aria-hidden="true"]') as HTMLElement | null
    const reviewsElement = listing.querySelector('[aria-label*="review"]') as HTMLElement | null

    const rating = ratingElement ? cleanText(ratingElement.textContent) : null
    const reviews = reviewsElement ? cleanText(reviewsElement.getAttribute('aria-label') ?? reviewsElement.textContent) : null

    const priceMatch = listing.innerText?.match(/\$[0-9–]+/)?.[0] ?? null

    const info: ScrapedListing = {
      name,
      address: null,
      phone: null,
      website: null,
      websiteUrl: null,
      id,
      rating,
      reviews,
      priceRange: priceMatch,
      category: null,
      description: null,
    }

    extractedIds.add(id)
    return info
  } catch (error) {
    console.error('[Papertrail] Error extracting listing data:', error)
    return null
  }
}

function getVisibleListings(): HTMLElement[] {
  return Array.from(document.querySelectorAll('.hfpxzc') as NodeListOf<HTMLElement>)
}

export async function scrapeAllMaps(scrollToLoadAll: boolean = true) {
  isScraping = true
  shouldScrollToLoadAll = scrollToLoadAll
  let scrapedCount = 0
  const searchTerm = extractSearchTerm()

  console.log(`[Papertrail] Extracted search term: "${searchTerm}"`)

  // Reset extracted IDs for this scrape session
  extractedIds.clear()

  // Notify side panel that scraping is starting
  void sendRuntimeMessage({
    type: 'MAPS_SCRAPE_STARTING',
    searchTerm: searchTerm,
  })

  // Max 5 minutes to prevent infinite loops
  const timeoutId = setTimeout(() => {
    isScraping = false
    console.warn('[Papertrail] Scraper timeout reached (5 min)')
  }, 5 * 60 * 1000)

  try {
    console.log('[Papertrail] Scraper initialization started')

    // Find the scrollable container
    const scrollContainer =
      document.querySelector('div[role="feed"]') ||
      document.querySelector('.m6B1nf') ||
      document.querySelector('.UL7Qtf')?.parentElement

    if (!scrollContainer) {
      console.error('[Papertrail] ❌ Scrollable container not found. Make sure the results list is visible.')
      clearTimeout(timeoutId)
      return
    }

    console.log('[Papertrail] ✓ Scroll container found')

    // PHASE 1: Immediately extract all currently visible listings
    console.log('[Papertrail] --- Phase 1: Greedy extraction of visible listings ---')
    const visibleListings = getVisibleListings()
    console.log(`[Papertrail] Found ${visibleListings.length} visible listings. Extracting now...`)

    for (const listing of visibleListings) {
      if (!isScraping) break

      const data = extractListingData(listing)
      if (data) {
        scrapedCount++
        console.log(`[Papertrail] ✓ [${scrapedCount}] ${data.name} (${data.rating || 'unrated'})`)

        void sendRuntimeMessage({
          type: 'MAPS_RESULT',
          listing: data,
          index: scrapedCount,
          searchTerm: searchTerm,
        })
      }
    }

    console.log(`[Papertrail] Phase 1 complete: ${scrapedCount} listings extracted`)

    // PHASE 2: Incremental scroll and extract
    if (shouldScrollToLoadAll && isScraping) {
      console.log('[Papertrail] --- Phase 2: Incremental scroll & extract ---')
      let scrollAttempts = 0
      const maxScrollAttempts = 50
      let consecutiveNoNewListings = 0
      let lastCount = scrapedCount

      while (isScraping && scrollAttempts < maxScrollAttempts && consecutiveNoNewListings < 3) {
        scrollAttempts++

        // Scroll down gradually
        scrollContainer.scrollBy({
          top: 800, // Scroll less aggressively
          behavior: 'smooth',
        })

        // Respectful delay (2-4s, random)
        const delayMs = 2000 + Math.floor(Math.random() * 2001)
        const delaySec = Math.ceil(delayMs / 1000)

        void sendRuntimeMessage({
          type: 'MAPS_SCRAPE_WAITING',
          waitSeconds: delaySec,
          collectedCount: scrapedCount,
        })

        await new Promise((r) => setTimeout(r, delayMs))

        if (!isScraping) break

        // Extract newly visible listings
        const current = getVisibleListings()
        console.log(`[Papertrail] Scroll ${scrollAttempts}: Found ${current.length} total visible, extracting new...`)

        let newInThisScroll = 0
        for (const listing of current) {
          const data = extractListingData(listing)
          if (data) {
            scrapedCount++
            newInThisScroll++
            console.log(`[Papertrail] ✓ [${scrapedCount}] ${data.name} (${data.rating || 'unrated'})`)

            void sendRuntimeMessage({
              type: 'MAPS_RESULT',
              listing: data,
              index: scrapedCount,
              searchTerm: searchTerm,
            })
          }
        }

        if (newInThisScroll === 0) {
          consecutiveNoNewListings++
          console.log(
            `[Papertrail] No new listings in this scroll (${consecutiveNoNewListings}/3 attempts without new results)`
          )
        } else {
          consecutiveNoNewListings = 0
          console.log(`[Papertrail] Extracted ${newInThisScroll} new listings in scroll ${scrollAttempts}`)
        }

        lastCount = scrapedCount
      }

      if (consecutiveNoNewListings >= 3) {
        console.log('[Papertrail] Reached end of results (3 consecutive scrolls with no new listings)')
      }
    } else if (!shouldScrollToLoadAll) {
      console.log('[Papertrail] --- Phase 2: Skipped (quick mode enabled) ---')
    }

    console.log('[Papertrail] --- DONE! ---')
    console.log(`[Papertrail] Successfully scraped ${scrapedCount} listings`)

    // Send completion message
    void sendRuntimeMessage({
      type: 'MAPS_SCRAPE_DONE',
      totalCount: scrapedCount,
      searchTerm: searchTerm,
    })
  } catch (error) {
    console.error('[Papertrail] Scraper error:', error)
    void sendRuntimeMessage({
      type: 'MAPS_SCRAPE_DONE',
      totalCount: scrapedCount ?? 0,
      searchTerm: searchTerm,
    })
  } finally {
    clearTimeout(timeoutId)
    isScraping = false
  }
}

export function stopMapsScrape() {
  isScraping = false
  console.log('[Papertrail] Maps scrape stopped by user')
}

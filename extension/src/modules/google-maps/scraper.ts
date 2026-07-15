import type { ScrapedListing } from '@contracts'
import { sendRuntimeMessage } from '@/utils/messaging'

let isScraping = false
let shouldScrollToLoadAll = true

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

export async function scrapeAllMaps(scrollToLoadAll: boolean = true) {
  isScraping = true
  shouldScrollToLoadAll = scrollToLoadAll
  let scrapedCount = 0
  const searchTerm = extractSearchTerm()

  console.log(`[Papertrail] Extracted search term: "${searchTerm}"`)

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
    // 1. Identify the scrollable container
    const scrollContainer =
      document.querySelector('div[role="feed"]') ||
      document.querySelector('.m6B1nf') ||
      document.querySelector('.UL7Qtf')?.parentElement

    if (!scrollContainer) {
      console.error('[Papertrail] Scrollable container not found. Make sure the results list is visible.')
      clearTimeout(timeoutId)

      return
    }

    if (shouldScrollToLoadAll) {
      console.log('[Papertrail] --- Phase 1: Scrolling to bottom ---')
      let lastHeight = scrollContainer.scrollHeight
      let scrollAttempts = 0
      const maxScrollAttempts = 50

      while (isScraping && scrollAttempts < maxScrollAttempts) {
        scrollAttempts++
        scrollContainer.scrollTo(0, scrollContainer.scrollHeight)

        const waitMs = 5000 + Math.floor(Math.random() * 5001)
        const waitSec = Math.ceil(waitMs / 1000)
        void sendRuntimeMessage({
          type: 'MAPS_SCRAPE_WAITING',
          waitSeconds: waitSec,
          collectedCount: scrapedCount,
        })
        await new Promise((r) => setTimeout(r, waitMs)) // Wait 5-10s for new items to load

        if (scrollContainer.scrollHeight === lastHeight) {
          // Check once more to be sure we're at the very bottom
          scrollContainer.scrollTo(0, scrollContainer.scrollHeight)
          const waitMs2 = 5000 + Math.floor(Math.random() * 5001)
          const waitSec2 = Math.ceil(waitMs2 / 1000)
          void sendRuntimeMessage({
            type: 'MAPS_SCRAPE_WAITING',
            waitSeconds: waitSec2,
            collectedCount: scrapedCount,
          })
          await new Promise((r) => setTimeout(r, waitMs2))

          if (scrollContainer.scrollHeight === lastHeight) { break }
        }

        lastHeight = scrollContainer.scrollHeight
        console.log(`[Papertrail] Loading more listings... (attempt ${scrollAttempts}/${maxScrollAttempts})`)
      }
    } else {
      console.log('[Papertrail] --- Phase 1: Skipping scroll (quick mode enabled) ---')
    }

    if (!isScraping) {
      console.log('[Papertrail] Scrape cancelled by user during scroll phase')
      clearTimeout(timeoutId)

      return
    }

    // 1a. Grab all final listings (Google Maps selector - can break if DOM changes)
    const listings = document.querySelectorAll('.hfpxzc')

    if (listings.length === 0) {
      console.error('[Papertrail] No listings found. The selector ".hfpxzc" may have changed.')
      clearTimeout(timeoutId)

      return
    }

    console.log(
      `[Papertrail] --- Phase 2: Found ${listings.length} total listings. Starting data extraction ---`
    )

    // Notify side panel of total listings found
    const totalListings = listings.length
    void sendRuntimeMessage({
      type: 'MAPS_SCRAPE_STARTING',
      searchTerm: searchTerm,
      totalListings: totalListings,
    })

    // 2. Extract visible data from each listing (no clicks, all in-page)
    for (let i = 0; i < listings.length; i++) {
      if (!isScraping) {
        console.log(`[Papertrail] Scrape cancelled by user at listing ${i + 1}/${listings.length}`)
        break
      }

      const listing = listings[i] as HTMLElement
      let name = listing.getAttribute('aria-label') || 'N/A'

      // Remove "Visited link" indicator from the name
      if (name !== 'N/A') {
        name = name
          .replace(/\s*·\s*Visited link\s*$/, '') // Remove "· Visited link" suffix
          .trim()
      }

      console.log(`[Papertrail] [${i + 1}/${listings.length}] Extracting: ${name}`)

      try {
        const cleanText = (text?: string): string | null => {
          if (!text) return null
          const cleaned = text.trim().replace(/\n/g, ' ').replace(/\s+/g, ' ').replace(/\s*·\s*Visited link\s*$/, '').trim()
          return cleaned || null
        }

        const extractId = (href: string): string | null => {
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

        const findListingLink = (el: HTMLElement): HTMLAnchorElement | null => {
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

        // Extract visible data directly from listing element
        const linkElement = findListingLink(listing)
        const id = linkElement?.href ? extractId(linkElement.href) : null

        // Extract rating and review count from visible elements within the listing
        const ratingElement = listing.querySelector('[aria-hidden="true"]') as HTMLElement | null
        const reviewsElement = listing.querySelector('[aria-label*="review"]') as HTMLElement | null

        const rating = ratingElement ? cleanText(ratingElement.textContent) : null
        const reviews = reviewsElement ? cleanText(reviewsElement.getAttribute('aria-label') ?? reviewsElement.textContent) : null

        // Extract price range if visible in the listing
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

        scrapedCount++

        if (rating || reviews) {
          console.log(`[Papertrail] Rating: ${rating}, Reviews: ${reviews}`)
        }

        if (id) {
          console.log(`[Papertrail] Extracted ID for "${name}": ${id}`)
        }

        // Send result back to side panel in real-time
        void sendRuntimeMessage({
          type: 'MAPS_RESULT',
          listing: info,
          index: i + 1,
          total: listings.length,
          searchTerm: searchTerm,
        })
      } catch (error) {
        console.error(`[Papertrail] Error extracting data for listing ${i + 1}:`, error)
      }
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
      totalCount: scrapedCount,
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

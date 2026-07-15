import type { ScrapedListing } from '@contracts'
import { sendRuntimeMessage } from '@/utils/messaging'

let isScraping = false
let shouldScrollToLoadAll = true
const extractedIds = new Set<string>()

async function waitForPanel(): Promise<boolean> {
  for (let i = 0; i < 30; i++) {
    if (document.querySelector('[role="main"]')) return true
    await new Promise((r) => setTimeout(r, 100))
  }
  return false
}

function cleanData(text: string | null | undefined): string | null {
  if (!text) return null
  return text
    .replace(/\s+/g, ' ') // normalize whitespace
    .replace(/^[\s·•]+|[\s·•]+$/g, '') // trim bullets/dots
    .trim()
}

function extractFromPanel(): Partial<ScrapedListing> {
  const panel = document.querySelector('[role="main"]')
  if (!panel) return {}

  const result: Partial<ScrapedListing> = {}
  const infoRegion = panel.querySelector('[role="region"]')

  // Address: button with "Address:" label
  const addrBtn = Array.from(infoRegion?.querySelectorAll('button') || []).find((b) => b.textContent?.includes('Address:'))
  if (addrBtn) {
    const raw = addrBtn.textContent
      ?.split('Address:')[1]
      ?.split('Copy address')[0]
    result.address = cleanData(raw)
  }

  // Phone: button with "Phone:" label
  const phoneBtn = Array.from(infoRegion?.querySelectorAll('button') || []).find((b) => b.textContent?.includes('Phone:'))
  if (phoneBtn) {
    const raw = phoneBtn.textContent
      ?.split('Phone:')[1]
      ?.split('Copy phone')[0]
    result.phone = cleanData(raw)
  }

  // Website: href="http" excluding known services
  const exclude = ['maps.google', 'google.com', 'facebook', 'instagram', 'twitter', 'booking', 'expedia', 'tripadvisor', 'grubhub', 'doordash', 'ubereats']
  const link = Array.from(panel.querySelectorAll('a[href^="http"]')).find((a) => {
    const href = (a as HTMLAnchorElement).href || ''
    return !exclude.some((e) => href.includes(e))
  })
  if (link) {
    const url = (link as HTMLAnchorElement).href
    if (url && url.length > 10) result.websiteUrl = url
  }

  // Reviews: "number reviews" pattern
  const rev = Array.from(panel.querySelectorAll('button, div, span'))
    .map((b) => b.textContent)
    .find((text) => text?.match(/\d+\s+reviews?/i))
  if (rev) result.reviews = cleanData(rev)

  return result
}

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

    // Extract rating and reviews from image alt text (e.g., "3.9 stars 1,423 Reviews")
    let rating: string | null = null
    let reviews: string | null = null
    const ratingImg = listing.querySelector('img[alt*="star"]') as HTMLImageElement | null
    if (ratingImg?.alt) {
      const altText = ratingImg.alt
      const starsMatch = altText.match(/(\d+\.?\d*)\s*stars?/i)
      if (starsMatch) {
        rating = starsMatch[1] + ' stars'
      }
      const reviewsMatch = altText.match(/(\d+(?:,\d+)?)\s*reviews?/i)
      if (reviewsMatch) {
        reviews = reviewsMatch[1] + ' reviews'
      }
    }

    // Extract price from the visible text
    const text = listing.innerText || ''
    const priceMatch = text.match(/\$(\d+)/)?.[0] ?? null

    // Extract category/type from visible text (e.g., "2-star hotel", "Restaurant", etc.)
    let category: string | null = null
    const lines = text.split('\n').filter((l) => l.trim().length > 0)
    if (lines.length > 1) {
      const potentialCategory = lines[1]
      if (potentialCategory && potentialCategory.length < 80) {
        category = potentialCategory
      }
    }

    // Extract description: natural descriptive text from the DOM
    // Skip specific keywords - just pull what's in the text naturally
    let description: string | null = null
    for (let i = 2; i < Math.min(lines.length, 5); i++) {
      const line = lines[i]
      if (line && line.length > 15 && !line.match(/^\$/)) {
        description = line
        break
      }
    }

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
      category,
      description,
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

  // Max 10 minutes to prevent infinite loops
  const timeoutId = setTimeout(() => {
    isScraping = false
    console.warn('[Papertrail] Scraper timeout reached (10 min)')
  }, 10 * 60 * 1000)

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

    // PHASE 1: Aggressively load all results by scrolling
    if (shouldScrollToLoadAll) {
      console.log('[Papertrail] --- Phase 1: Aggressive scroll to load all results ---')
      let lastHeight = scrollContainer.scrollHeight
      let scrollAttempts = 0
      const maxScrollAttempts = 100
      let consecutiveNoNew = 0

      while (isScraping && scrollAttempts < maxScrollAttempts && consecutiveNoNew < 2) {
        scrollAttempts++
        scrollContainer.scrollBy({
          top: 1200, // Scroll more aggressively
          behavior: 'smooth',
        })

        // Faster delays for loading (1-2s)
        const delayMs = 1000 + Math.floor(Math.random() * 1001)
        const delaySec = Math.ceil(delayMs / 1000)

        void sendRuntimeMessage({
          type: 'MAPS_SCRAPE_WAITING',
          waitSeconds: delaySec,
          collectedCount: 0, // Don't count yet, we're just loading
        })

        await new Promise((r) => setTimeout(r, delayMs))

        const newHeight = scrollContainer.scrollHeight
        if (newHeight === lastHeight) {
          consecutiveNoNew++
          console.log(`[Papertrail] No new results loaded (${consecutiveNoNew}/2)`)
        } else {
          consecutiveNoNew = 0
        }
        lastHeight = newHeight

        console.log(`[Papertrail] Load attempt ${scrollAttempts}: height = ${lastHeight}`)
      }

      console.log(`[Papertrail] Phase 1 complete: Loaded all results (${scrollAttempts} scrolls)`)
    } else {
      console.log('[Papertrail] --- Phase 1: Skipped (quick mode) ---')
    }

    if (!isScraping) {
      console.log('[Papertrail] Scrape cancelled during load phase')
      clearTimeout(timeoutId)
      return
    }

    // PHASE 2: Click each listing and extract full details
    console.log('[Papertrail] --- Phase 2: Click & extract full details ---')
    const listings = getVisibleListings()
    console.log(`[Papertrail] Found ${listings.length} total listings. Starting detailed extraction...`)

    void sendRuntimeMessage({
      type: 'MAPS_SCRAPE_STARTING',
      searchTerm: searchTerm,
      totalListings: listings.length,
    })

    for (let i = 0; i < listings.length; i++) {
      if (!isScraping) {
        console.log(`[Papertrail] Scrape cancelled at listing ${i + 1}/${listings.length}`)
        break
      }

      const listing = listings[i] as HTMLElement

      // Extract visible data from feed
      const data = extractListingData(listing)
      if (!data) continue

      // Click listing to open detail panel
      const link = findListingLink(listing)
      if (!link) continue

      link.click()
      const panelReady = await waitForPanel()
      if (!panelReady) {
        console.log(`[Papertrail] Panel failed to load for: ${data.name}`)
        continue
      }

      // Extract from detail panel and merge
      const panelData = extractFromPanel()
      Object.assign(data, panelData)

      scrapedCount++
      console.log(`[Papertrail] ✓ [${scrapedCount}/${listings.length}] ${data.name} | ${data.address || 'no address'} | ${data.phone || 'no phone'}`)

      void sendRuntimeMessage({
        type: 'MAPS_RESULT',
        listing: data,
        index: scrapedCount,
        total: listings.length,
        searchTerm: searchTerm,
      })

      // Close detail panel (click close button or press Escape)
      const closeBtn = document.querySelector('[role="main"] button[aria-label*="Close"]')
      if (closeBtn) (closeBtn as HTMLElement).click()
      else document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

      // Respectful delay before next listing (3-5s)
      const delayMs = 3000 + Math.floor(Math.random() * 2001)
      const delaySec = Math.ceil(delayMs / 1000)

      void sendRuntimeMessage({
        type: 'MAPS_SCRAPE_WAITING',
        waitSeconds: delaySec,
        collectedCount: scrapedCount,
      })

      await new Promise((r) => setTimeout(r, delayMs))
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

import type { Commenter } from './storage'

export interface ChannelInfo {
  handle: string
  subs: number
  links?: Record<string, string>
}

export interface VideoData {
  channelHandle: string
  links: string[]
  commenters: Omit<Commenter, 'tier'>[]
}

export interface ChannelData {
  handle: string
  subs: number
  links?: Record<string, string>
}

/**
 * Wait for elements to appear in DOM after scrolling
 * @param selector CSS selector to wait for
 * @param timeout Maximum time to wait in ms
 * @returns Promise that resolves when element appears or timeout
 */
function waitForElement(selector: string, timeout = 3000): Promise<boolean> {
  return new Promise((resolve) => {
    const startTime = Date.now()

    const check = () => {
      if (document.querySelector(selector)) {
        resolve(true)
        return
      }

      if (Date.now() - startTime > timeout) {
        resolve(false)
        return
      }

      setTimeout(check, 100)
    }

    check()
  })
}

/**
 * Extract commenter data from video page (YouTube /watch)
 * Handles lazy-loaded comments by triggering scroll and waiting for load
 * Based on live DOM analysis via Chrome DevTools
 *
 * @returns Promise resolving to array of commenters with name, handle, channel URL, verification status
 */
export async function extractVideoCommenters(): Promise<Omit<Commenter, 'tier'>[]> {
  const commenters: Omit<Commenter, 'tier'>[] = []

  try {
    // Trigger lazy loading by scrolling to comments section
    const commentsSection = document.querySelector('ytd-comments') as HTMLElement | null
    if (commentsSection) {
      console.log('[YouTube] Found comments section, scrolling to trigger lazy loading')
      commentsSection.scrollIntoView({ behavior: 'auto' })
      window.scrollBy(0, 500)

      // Wait for comments to load after scroll
      console.log('[YouTube] Waiting for comments to load...')
      const commentLoaded = await waitForElement('ytd-comment-thread-renderer', 3000)
      if (commentLoaded) {
        console.log('[YouTube] Comments loaded successfully')
      } else {
        console.log('[YouTube] Timeout waiting for comments to load')
      }
    } else {
      console.log('[YouTube] ytd-comments section not found on page')
    }

    // Extract comments using incremental scroll strategy for virtualized lists
    async function scrollForAllComments() {
      if (!commentsSection) {
        console.log('[YouTube] ❌ Comments section not found, skipping scroll')
        return 0
      }

      // Scroll to comments first
      commentsSection.scrollIntoView({ behavior: 'auto' })
      await new Promise((r) => setTimeout(r, 300))

      // Now scroll the window/page to load all comments (comments load as page scrolls)
      let lastCount = 0
      let unchangedAttempts = 0
      let attempts = 0
      const maxAttempts = 60
      const scrollTimeout = 20000 // 20 second timeout

      console.log('[YouTube] ⏱️ Starting scroll with 5s timeout...')
      const startTime = Date.now()

      while (unchangedAttempts < 2 && attempts < maxAttempts) {
        // Check timeout
        if (Date.now() - startTime > scrollTimeout) {
          console.log('[YouTube] ⏰ TIMEOUT reached, stopping scroll')
          break
        }

        // Scroll down aggressively to trigger lazy loading
        window.scrollBy(0, 1500)
        await new Promise((r) => setTimeout(r, 100)) // Reduced from 150ms

        const currentCount = document.querySelectorAll('ytd-comment-thread-renderer').length
        console.log(`[YouTube] Scroll #${attempts + 1}: ${currentCount} comments found`)

        if (currentCount === lastCount) {
          unchangedAttempts++
          console.log(`[YouTube] No new comments (${unchangedAttempts}/2)`)
        } else {
          unchangedAttempts = 0
          lastCount = currentCount
        }

        attempts++
      }

      console.log(`[YouTube] ✅ Scroll complete: ${lastCount} comments after ${attempts} attempts`)
      return lastCount
    }

    await scrollForAllComments()
    let commentThreads = document.querySelectorAll('ytd-comment-thread-renderer')
    console.log('[YouTube] Found', commentThreads.length, 'total comment threads after scrolling')

    commentThreads.forEach((thread) => {
      // Try both old and new selectors
      let authorEl = thread.querySelector('#author-text') as HTMLAnchorElement | null

      if (!authorEl) {
        authorEl = thread.querySelector('a#author-text') as HTMLAnchorElement | null
      }

      if (!authorEl) {
        return // Skip if no author found
      }

      const authorName = authorEl.innerText?.trim()
      const href = authorEl.getAttribute('href')

      if (!authorName || !href) {
        return
      }

      // Extract handle from href (always most reliable)
      let handle: string | undefined
      const handleMatch = href.match(/@[\w.-]+/)
      if (handleMatch) {
        handle = handleMatch[0]
      } else if (authorName.startsWith('@')) {
        handle = authorName
      }

      // Check for verified badge
      const isVerified = !!thread.querySelector('ytd-author-comment-badge-renderer')

      const commenter: Omit<Commenter, 'tier'> = {
        name: authorName,
        handle,
        url: new URL(href, window.location.origin).href,
        isVerified,
        count: 1,
        status: 'new',
      }

      commenters.push(commenter)
    })

    console.log('[YouTube] Extracted', commenters.length, 'commenters')
  } catch (error) {
    console.error('[YouTube] Error extracting commenters:', error)
  }

  return commenters
}

/**
 * Extract links from video description and comments
 * Dedupes and filters to external links only (excludes youtube.com)
 *
 * @returns Promise resolving to array of unique external URLs
 */
export async function extractVideoLinks(): Promise<string[]> {
  const links: string[] = []

  try {
    // Extract from description - try multiple selectors as YouTube structure varies
    let descriptionLinks: string[] = []

    // Try confirmed selector first
    let links1 = Array.from(
      document.querySelectorAll('#description-inline-expander a'),
    ).map((a) => (a as HTMLAnchorElement).href)

    // Fallback: broader description selector
    let links2 = Array.from(
      document.querySelectorAll('ytd-text-inline-expander a, yt-formatted-string a'),
    ).map((a) => (a as HTMLAnchorElement).href)

    descriptionLinks = [...new Set([...links1, ...links2])]
    console.log('[YouTube] Found', descriptionLinks.length, 'links in description (tried', links1.length, 'primary,', links2.length, 'fallback)')

    // Extract from comments - scroll to load them first
    const commentsSection = document.querySelector('ytd-comments') as HTMLElement | null
    if (commentsSection) {
      console.log('[YouTube] Scrolling to comments to load them for link extraction')
      commentsSection.scrollIntoView({ behavior: 'auto' })
      window.scrollBy(0, 500)

      // Wait for comments to load
      await waitForElement('ytd-comment-thread-renderer', 3000)
    }

    const commentLinks = Array.from(
      document.querySelectorAll('ytd-comment-thread-renderer #content-text a'),
    ).map((a) => (a as HTMLAnchorElement).href)
    console.log('[YouTube] Found', commentLinks.length, 'links in comments')

    const allLinks = [...descriptionLinks, ...commentLinks]

    // Dedupe and filter to external links only
    const uniqueExternalUrls = [...new Set(allLinks)].filter((url) => {
      try {
        const domain = new URL(url).hostname.toLowerCase()
        return url.startsWith('http') && !domain.includes('youtube.com') && !domain.includes('youtu.be')
      } catch {
        return false
      }
    })

    links.push(...uniqueExternalUrls)
    console.log('[YouTube] Extracted', links.length, 'unique external links from', allLinks.length, 'total')
  } catch (error) {
    console.error('[YouTube] Error extracting links:', error)
  }

  return links
}

/**
 * Extract channel creator info from video page
 * Gets channel handle and subscriber count from video owner section
 *
 * @returns Promise resolving to channel handle (@format) and subscriber count as number
 */
export async function extractVideoChannelInfo(): Promise<ChannelInfo | null> {
  try {
    console.log('[YouTube] 📊 Starting channel info extraction...')

    // Parse subscriber count with localization support
    const parseSubs = (text: string): number | null => {
      if (!text) return null

      const match = text.match(/([\d,.]+)\s*(thousand|million|billion|k|m|b)?/i)
      if (!match) return null

      let num = parseFloat(match[1].replace(/,/g, ''))
      const unit = match[2]?.toLowerCase()

      if (unit === 'thousand' || unit === 'k') num *= 1000
      else if (unit === 'million' || unit === 'm') num *= 1000000
      else if (unit === 'billion' || unit === 'b') num *= 1000000000

      return Math.floor(num)
    }

    // Try primary selector for video owner info (channel info section below video title)
    let ownerRenderer = document.querySelector('ytd-video-owner-renderer')
    console.log('[YouTube] 🔍 Looking for ytd-video-owner-renderer:', !!ownerRenderer)

    // Fallback: try looking in video-secondary-info for channel link
    if (!ownerRenderer) {
      console.log('[YouTube] ⚠️ Trying video-secondary-info...')
      ownerRenderer = document.querySelector('ytd-video-secondary-info-renderer')
      console.log('[YouTube] Trying ytd-video-secondary-info-renderer:', !!ownerRenderer)
    }

    // Fallback: try channel tagline
    if (!ownerRenderer) {
      ownerRenderer = document.querySelector('ytd-channel-tagline-renderer')
      console.log('[YouTube] Trying ytd-channel-tagline-renderer:', !!ownerRenderer)
    }

    if (!ownerRenderer) {
      console.log('[YouTube] ❌ Could not find owner/channel element, searching page for channel link...')
      // Search entire page for any channel link (/@handle format)
      const channelLink = document.querySelector('a[href^="/@"]') as HTMLAnchorElement | null
      if (channelLink) {
        const href = channelLink.getAttribute('href') || ''
        const handleMatch = href.match(/@([\w.-]+)/)
        if (handleMatch) {
          const handle = `@${handleMatch[1]}`
          console.log('[YouTube] Found channel handle via page search:', handle)
          return { handle, subs: 0 }
        }
      }
      console.log('[YouTube] No channel link found on page')
      return null
    }

    console.log('[YouTube] ✅ Found owner element')

    // Strategy 1: Look for link in owner renderer with href
    let channelLink = ownerRenderer.querySelector('a[href^="/@"]') as HTMLAnchorElement | null

    // Strategy 2: If not found, try video description info cards (where link #62 is)
    if (!channelLink) {
      console.log('[YouTube] Strategy 1 failed, trying description infocards...')
      const descSection = document.querySelector('ytd-video-description-infocards-section-renderer')
      if (descSection) {
        channelLink = descSection.querySelector('a[href^="/@"]') as HTMLAnchorElement | null
      }
    }

    // Strategy 3: If still not found, search entire page for channel link
    if (!channelLink) {
      console.log('[YouTube] Strategy 2 failed, searching entire page...')
      channelLink = document.querySelector('a[href^="/@"]') as HTMLAnchorElement | null
    }

    if (!channelLink) {
      console.log('[YouTube] ❌ Could not find any channel link with href containing /@')
      return null
    }

    console.log('[YouTube] ✅ Found channel link via strategy')
    const href = channelLink.getAttribute('href') || ''

    // Extract handle from href (/@handle format)
    let handle: string | null = null
    const handleMatch = href.match(/@([\w.-]+)/)
    if (handleMatch) {
      handle = `@${handleMatch[1]}`
    } else {
      const channelIdMatch = href.match(/\/channel\/([\w-]+)/)
      if (channelIdMatch) {
        handle = `@${channelIdMatch[1]}`
      }
    }

    // Get subscriber count from #owner-sub-count
    // Use aria-label for accurate number (e.g., "17.7 million subscribers")
    const subsEl = ownerRenderer.querySelector('#owner-sub-count') as HTMLElement | null
    const subsAriaLabel = subsEl?.getAttribute('aria-label') || ''
    const subsInnerText = subsEl?.innerText || ''

    console.log('[YouTube] Sub count sources - aria-label:', subsAriaLabel, 'innerText:', subsInnerText)

    // Try aria-label first (more accurate), then innerText
    const subs = parseSubs(subsAriaLabel) || parseSubs(subsInnerText)

    if (!handle) {
      console.log('[YouTube] Could not extract handle from href:', href)
      return null
    }

    if (subs === null) {
      console.log('[YouTube] Could not parse subscriber count')
      return null
    }

    console.log('[YouTube] Extracted channel info:', { handle, subs })
    return { handle, subs }
  } catch (error) {
    console.error('[YouTube] Error extracting channel info:', error)
    return null
  }
}

/**
 * Extract channel profile data from channel page (/@handle)
 * Gets handle and subscriber count from channel header
 *
 * @returns Promise resolving to channel handle (@format), subscriber count as number
 */
export async function extractChannelProfile(): Promise<ChannelData | null> {
  try {
    // Extract handle from URL pathname
    const pathname = window.location.pathname
    const handleMatch = pathname.match(/^\/(@[\w.-]+)/)
    const handle = handleMatch ? handleMatch[1] : null

    // Find subscriber count element
    const subsEl = document.querySelector('yt-page-header-view-model span[aria-label*="subscriber"]')

    // Parse subscriber count helper
    const parseSubs = (text: string): number | null => {
      if (!text) return null

      const multiplierMap: Record<string, number> = {
        k: 1000,
        thousand: 1000,
        m: 1000000,
        million: 1000000,
        b: 1000000000,
        billion: 1000000000,
      }

      // Remove commas and extract number + unit
      const cleanText = text.replace(/,/g, '')
      const match = cleanText.match(/([\d.]+)\s*([KMB]|thousand|million|billion)?/i)

      if (!match) return null

      let num = parseFloat(match[1])
      const unit = match[2]?.toLowerCase()

      if (unit && multiplierMap[unit]) {
        num *= multiplierMap[unit]
      }

      return Math.floor(num)
    }

    // Get subscriber count from aria-label or innerText
    const rawSubsText = (subsEl as HTMLElement | null)?.getAttribute('aria-label') || (subsEl as HTMLElement | null)?.innerText
    const subs = parseSubs(rawSubsText || '')

    if (!handle) {
      console.log('[YouTube] Missing channel handle, cannot extract profile')
      return null
    }

    console.log('[YouTube] Extracted channel profile:', { handle, subs: subs || 0 })
    return { handle, subs: subs || 0 }
  } catch (error) {
    console.error('[YouTube] Error extracting channel profile:', error)
    return null
  }
}

/**
 * Extract links from channel description
 * Organized by type (website, twitter, patreon, etc.)
 *
 * TODO: Fill in DOM selectors using Chrome DOM AI
 */
export async function extractChannelLinks(): Promise<Record<string, string>> {
  const links: Record<string, string> = {}

  try {
    // Helper to categorize URL by domain/path
    const getLinkType = (url: string): string | null => {
      try {
        const urlObj = new URL(url)
        const hostname = urlObj.hostname.toLowerCase()

        // Match against known social/link sites
        if (hostname.includes('twitter.com') || hostname.includes('x.com')) return 'twitter'
        if (hostname.includes('instagram.com')) return 'instagram'
        if (hostname.includes('facebook.com') || hostname.includes('fb.com')) return 'facebook'
        if (hostname.includes('tiktok.com')) return 'tiktok'
        if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return null // Skip YouTube links
        if (hostname.includes('twitch.tv')) return 'twitch'
        if (hostname.includes('discord.gg') || hostname.includes('discord.com')) return 'discord'
        if (hostname.includes('patreon.com')) return 'patreon'
        if (hostname.includes('linktr.ee')) return 'linktree'
        if (hostname.includes('reddit.com')) return 'reddit'
        if (hostname.includes('linkedin.com')) return 'linkedin'
        if (hostname.includes('github.com')) return 'github'

        // Default to website for anything else
        return 'website'
      } catch {
        return null
      }
    }

    // Find all links in channel header and about sections
    // YouTube channel pages structure: header has links, about section has links
    const allLinkElements = Array.from(
      document.querySelectorAll(
        'yt-page-header-view-model a,' +
        'ytd-channel-tagline-renderer a,' +
        'ytd-about-channel-renderer a,' +
        'ytd-rich-text-renderer a,' +
        'yt-formatted-string a'
      )
    ).filter(el => el instanceof HTMLAnchorElement) as HTMLAnchorElement[]

    // Extract and dedupe URLs
    const urlSet = new Set<string>()
    for (const linkEl of allLinkElements) {
      const href = linkEl.getAttribute('href')
      if (href && href.startsWith('http')) {
        urlSet.add(href)
      }
    }

    // Categorize each link
    for (const url of urlSet) {
      const type = getLinkType(url)
      if (type && !links[type]) {
        links[type] = url
      }
    }

    console.log('[YouTube] Extracted', Object.keys(links).length, 'channel link types:', Object.keys(links))
  } catch (error) {
    console.error('[YouTube] Error extracting channel links:', error)
  }

  return links
}

/**
 * Extract video transcript from YouTube's transcript panel
 * Uses MutationObserver to watch for transcript segments appearing, then extracts immediately
 */
export async function extractVideoTranscript(): Promise<string> {
  try {
    console.log('[YouTube] Starting transcript extraction...')

    // Find and click the transcript button
    const transcriptButton = document.querySelector(
      'button[aria-label="Show transcript"], #primary-button ytd-button-shape button'
    ) as HTMLElement | null

    if (!transcriptButton) {
      console.error('[YouTube] Transcript button not found. Description may need to be expanded first.')
      return ''
    }

    console.log('[YouTube] Found transcript button, clicking...')
    transcriptButton.click()

    // Wait for transcript segments to appear using observer pattern
    const transcript = await new Promise<string>((resolve, reject) => {
      let observer: MutationObserver | null = null
      let resolved = false
      let timeoutId: NodeJS.Timeout | null = null

      const extractText = (segments: Element[]): string => {
        console.log(`[YouTube] Extracting text from ${segments.length} segments...`)
        const lines = segments
          .map((segment: any) => {
            const timestamp =
              segment.querySelector('.ytwTranscriptSegmentViewModelTimestamp')?.innerText?.trim() || ''
            const text = segment.querySelector('.ytAttributedStringHost')?.innerText?.trim() || ''
            return `${timestamp} ${text}`.trim()
          })
          .filter((line: string) => line.length > 0)

        return lines.join('\n')
      }

      const finish = (segments: Element[]) => {
        if (resolved) return
        resolved = true

        if (observer) observer.disconnect()
        if (timeoutId) clearTimeout(timeoutId)

        console.log(`[YouTube] ✅ Transcript ready with ${segments.length} segments`)
        const text = extractText(segments)
        resolve(text)
      }

      const checkForSegments = (): Element[] | null => {
        const container = document.querySelector('.ytSectionListRendererContents')
        if (!container) {
          console.log('[YouTube] Container not found yet')
          return null
        }

        const segments = Array.from(container.querySelectorAll('.ytwTranscriptSegmentViewModelHost'))
        if (segments.length === 0) {
          console.log('[YouTube] No segments found yet')
          return null
        }

        console.log(`[YouTube] Found ${segments.length} segments!`)
        return segments
      }

      // Check if already loaded
      const existingSegments = checkForSegments()
      if (existingSegments && existingSegments.length > 0) {
        console.log('[YouTube] Transcript already loaded, extracting immediately')
        finish(existingSegments)
        return
      }

      // Watch the entire document for transcript segments to appear
      observer = new MutationObserver((mutations) => {
        // Only check on mutations that could add segments
        const hasRelevantMutation = mutations.some(
          (m) => m.type === 'childList' || (m.type === 'characterData' && m.target.nodeValue?.trim().length)
        )

        if (!hasRelevantMutation) return

        const segments = checkForSegments()
        if (segments && segments.length > 0) {
          console.log('[YouTube] 🎯 Segments detected via observer!')
          finish(segments)
        }
      })

      // Watch the entire document for transcript content
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
        attributes: false,
      })

      console.log('[YouTube] Observer ready, watching for transcript segments...')

      // Fallback timeout - if nothing appears in 15 seconds, give up
      timeoutId = setTimeout(() => {
        if (!resolved) {
          resolved = true
          if (observer) observer.disconnect()
          console.error('[YouTube] ⏱️ Timeout waiting for transcript segments after 15 seconds')
          reject(new Error('Transcript did not load within 15 seconds. Transcript may not be available for this video.'))
        }
      }, 15000)
    })

    console.log('[YouTube] Transcript extraction complete')
    return transcript
  } catch (error) {
    console.error('[YouTube] Error extracting transcript:', error)
    return ''
  }
}

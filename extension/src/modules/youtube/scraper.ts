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
 * Extract commenter data from video page (YouTube /watch)
 * Only extracts comments currently visible in DOM (infinite scroll)
 * Based on live DOM analysis via Chrome DevTools
 *
 * @returns Array of commenters with name, handle, channel URL, verification status
 */
export function extractVideoCommenters(): Omit<Commenter, 'tier'>[] {
  const commenters: Omit<Commenter, 'tier'>[] = []

  try {
    const commentThreads = document.querySelectorAll('ytd-comment-thread-renderer')
    console.log('[YouTube] Found', commentThreads.length, 'comment threads')

    commentThreads.forEach((thread) => {
      const commentEl = thread.querySelector('ytd-comment-view-model')
      if (!commentEl) {
        return
      }

      let authorLinkEl = commentEl.querySelector('a#author-text') as HTMLAnchorElement | null

      // Fallback: check yt-formatted-string if primary selector empty
      if (!authorLinkEl) {
        authorLinkEl = commentEl.querySelector('yt-formatted-string#text a') as HTMLAnchorElement | null
      }

      if (!authorLinkEl) {
        return // Skip deleted/removed comments
      }

      const authorName = authorLinkEl.innerText.trim()
      const href = authorLinkEl.getAttribute('href')

      if (!href) {
        return
      }

      // Extract handle from href (always most reliable)
      let handle: string | undefined
      const handleMatch = href.match(/@[\w.-]+/)
      if (handleMatch) {
        handle = handleMatch[0]
      } else if (authorName.startsWith('@')) {
        // Fallback to name if href parsing fails
        handle = authorName
      }

      // Verify badge check using SVG path detection
      const badge = commentEl.querySelector('ytd-author-comment-badge-renderer')
      const isVerified = !!badge?.querySelector('path[d^="M9.03 2.242"]')

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
 * @returns Array of unique external URLs
 */
export function extractVideoLinks(): string[] {
  const links: string[] = []

  try {
    // Extract from description
    const descriptionLinks = Array.from(
      document.querySelectorAll('#description a, ytd-text-inline-expander a'),
    ).map((a) => (a as HTMLAnchorElement).href)

    // Extract from comments
    const commentLinks = Array.from(
      document.querySelectorAll('ytd-comment-thread-renderer #content-text a'),
    ).map((a) => (a as HTMLAnchorElement).href)

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
 * @returns Channel handle (@format) and subscriber count as number
 */
export function extractVideoChannelInfo(): ChannelInfo | null {
  try {
    const ownerRenderer = document.querySelector('ytd-video-owner-renderer')
    if (!ownerRenderer) {
      console.log('[YouTube] No owner renderer found')
      return null
    }

    const channelLink = ownerRenderer.querySelector('a.ytd-video-owner-renderer') as HTMLAnchorElement | null
    const subsEl = ownerRenderer.querySelector('#owner-sub-count') as HTMLElement | null

    const href = channelLink?.getAttribute('href') || ''
    const subsText = subsEl?.innerText || ''

    // Extract handle from href (/@handle format)
    const handle = href.startsWith('/@') ? href.replace('/', '') : null

    // Parse subscriber count with localization support
    const parseSubs = (text: string, ariaLabel?: string): number | null => {
      // Try aria-label first (more precise, language-independent)
      const labelToUse = ariaLabel || text
      const match = labelToUse.match(/([\d,.]+)\s*([KMB])?/i)
      if (!match) return null

      // Remove commas and convert to number
      let num = parseFloat(match[1].replace(/,/g, ''))
      const multiplier = match[2]?.toUpperCase()

      if (multiplier === 'K') num *= 1000
      else if (multiplier === 'M') num *= 1000000
      else if (multiplier === 'B') num *= 1000000000

      return Math.floor(num)
    }

    const ariaLabel = subsEl?.getAttribute('aria-label') || undefined
    const subs = parseSubs(subsText, ariaLabel)

    if (!handle || subs === null) {
      console.log('[YouTube] Missing handle or subs:', { handle, subs })
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
 * @returns Channel handle (@format), subscriber count as number
 */
export function extractChannelProfile(): ChannelData | null {
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

    if (!handle || subs === null) {
      console.log('[YouTube] Missing channel profile data:', { handle, subs })
      return null
    }

    console.log('[YouTube] Extracted channel profile:', { handle, subs })
    return { handle, subs }
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
export function extractChannelLinks(): Record<string, string> {
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

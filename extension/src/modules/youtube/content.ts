/**
 * YouTube Module Content Script
 * Runs on YouTube pages and extracts data from the DOM
 * Sends extracted data to the side panel
 */

console.log('[YouTube Content] Module loading...')

import { detectPageType } from './navigator'
import {
  extractVideoCommenters,
  extractVideoLinks,
  extractVideoChannelInfo,
  extractChannelProfile,
  extractChannelLinks,
} from './scraper'

// Guard: only initialize on YouTube pages
const isYouTubePage = window.location.hostname.includes('youtube.com')
if (!isYouTubePage) {
  throw new Error('[YouTube Content] Not on YouTube, skipping')
}

console.log('[YouTube Content] Initializing on YouTube page...')

// Store accumulated data from continuous monitoring
let accumulatedVideoCommenters: any[] = []
let accumulatedVideoLinks: string[] = []
let mutationObserverStarted = false

interface ExtractedData {
  pageType: string
  videoCommenters?: unknown[]
  videoLinks?: string[]
  videoChannelInfo?: unknown
  videoInfo?: { id: string; title: string; url: string }
  channelProfile?: unknown
  channelLinks?: unknown
}

function startCommentMutationObserver(): void {
  if (mutationObserverStarted) return
  mutationObserverStarted = true

  console.log('[YouTube Content] Starting MutationObserver for continuous comment extraction')

  const observer = new MutationObserver(() => {
    // Look for new comment threads
    const commentThreads = document.querySelectorAll('ytd-comment-thread-renderer')

    // Extract only new comments we haven't seen before
    const currentCommenters = new Map<string, any>()
    for (const thread of commentThreads) {
      const authorEl = thread.querySelector('#author-text') as HTMLAnchorElement | null
      if (!authorEl) continue

      const authorName = authorEl.innerText?.trim()
      const href = authorEl.getAttribute('href')

      if (!authorName || !href) continue

      let handle: string | undefined
      const handleMatch = href.match(/@[\w.-]+/)
      if (handleMatch) {
        handle = handleMatch[0]
      } else if (authorName.startsWith('@')) {
        handle = authorName
      }

      const isVerified = !!thread.querySelector('ytd-author-comment-badge-renderer')

      const key = `${authorName}__${href}`
      if (!currentCommenters.has(key)) {
        currentCommenters.set(key, {
          name: authorName,
          handle,
          url: new URL(href, window.location.origin).href,
          isVerified,
          count: 1,
          status: 'new',
        })
      }
    }

    // Update accumulated commenters, avoiding duplicates
    const existingKeys = new Set(accumulatedVideoCommenters.map((c) => `${c.name}__${c.url}`))
    for (const [key, commenter] of currentCommenters) {
      if (!existingKeys.has(key)) {
        accumulatedVideoCommenters.push(commenter)
        console.log('[YouTube Content] Found new commenter:', commenter.name)
      }
    }
  })

  // Watch for mutations in the comments section
  const commentsSection = document.querySelector('ytd-comments')
  if (commentsSection) {
    observer.observe(commentsSection, {
      childList: true,
      subtree: true,
      attributes: false,
    })
    console.log('[YouTube Content] MutationObserver attached to comments section')
  }
}

function extractVideoTitle(): string | null {
  // Try selectors in order of reliability
  const selectors = [
    'ytd-video-primary-info-renderer h1 yt-formatted-string',
    'h1 yt-formatted-string',
    'h1',
  ]

  for (const selector of selectors) {
    const el = document.querySelector(selector)
    const title = el?.textContent?.trim()
    if (title) return title
  }

  return null
}

async function extractData(): Promise<ExtractedData | null> {
  try {
    const pageContext = detectPageType()
    console.log('[YouTube Content] Page type detected:', pageContext.type)

    const data: ExtractedData = {
      pageType: pageContext.type,
    }

    if (pageContext.type === 'video') {
      // Extract video page data
      console.log('[YouTube Content] 📹 VIDEO PAGE - Extracting data...')

      // Extract video info from YouTube page
      console.log('[YouTube Content] 🎬 Extracting video info...')
      console.log('[YouTube Content] Window location:', window.location.href)
      console.log('[YouTube Content] Document title:', document.title)

      const urlMatch = window.location.href.match(/v=([a-zA-Z0-9_-]+)/)
      const videoId = urlMatch?.[1] || 'unknown'

      // Try to extract title from DOM first, fall back to document.title
      let videoTitle = extractVideoTitle()

      if (!videoTitle) {
        // Fall back to document title parsing
        videoTitle = document.title.trim()
        // Strip tab unread-count prefix e.g. "(205) "
        videoTitle = videoTitle.replace(/^\(\d+\)\s*/, '')
        if (videoTitle.includes(' - YouTube')) {
          videoTitle = videoTitle.replace(/\s*-\s*YouTube\s*$/, '').trim()
        }
      }

      if (!videoTitle) {
        videoTitle = 'Untitled Video'
      }

      data.videoInfo = {
        id: videoId,
        title: videoTitle,
        url: window.location.href,
      }
      console.log('[YouTube Content] ✅ Video info extracted:', data.videoInfo)

      // Start continuous comment monitoring if not already started
      startCommentMutationObserver()

      try {
        console.log('[YouTube Content] 🧵 Extracting commenters...')
        // Use accumulated commenters from mutation observer, plus any fresh extraction
        const freshCommenters = await extractVideoCommenters()
        // Combine accumulated with fresh, summing counts for duplicates
        const countsMap = new Map<string, any>()

        // Build initial map from accumulated
        for (const c of accumulatedVideoCommenters) {
          const key = `${c.name}__${c.url}`
          countsMap.set(key, c)
        }

        // Merge fresh, summing counts for duplicates
        for (const commenter of freshCommenters) {
          const key = `${commenter.name}__${commenter.url}`
          if (countsMap.has(key)) {
            countsMap.get(key)!.count += commenter.count
          } else {
            countsMap.set(key, commenter)
          }
        }

        data.videoCommenters = Array.from(countsMap.values())
        console.log(`[YouTube Content] ✅ Commenters: ${data.videoCommenters?.length || 0} found`)
      } catch (e) {
        console.error('[YouTube Content] ❌ Error extracting commenters:', e)
        data.videoCommenters = accumulatedVideoCommenters
      }
      try {
        console.log('[YouTube Content] 🔗 Extracting links...')
        data.videoLinks = await extractVideoLinks()
        console.log(`[YouTube Content] ✅ Links: ${data.videoLinks?.length || 0} found`)
      } catch (e) {
        console.error('[YouTube Content] ❌ Error extracting links:', e)
        data.videoLinks = []
      }
      try {
        console.log('[YouTube Content] 📊 Extracting channel info...')
        data.videoChannelInfo = await extractVideoChannelInfo()
        console.log(`[YouTube Content] ✅ Channel info: ${data.videoChannelInfo ? 'found' : 'NOT FOUND'}`)
      } catch (e) {
        console.error('[YouTube Content] ❌ Error extracting channel info:', e)
      }
      console.log('[YouTube Content] 📹 VIDEO EXTRACTION COMPLETE:', { commenters: data.videoCommenters?.length, links: data.videoLinks?.length, channelInfo: !!data.videoChannelInfo })
    } else if (pageContext.type === 'channel') {
      // Extract channel page data
      console.log('[YouTube Content] 🎬 CHANNEL PAGE - Extracting data...')
      try {
        console.log('[YouTube Content] 👤 Extracting channel profile...')
        data.channelProfile = await extractChannelProfile()
        console.log(`[YouTube Content] ✅ Channel profile: ${data.channelProfile ? 'found' : 'NOT FOUND'}`)
        if (data.channelProfile) {
          console.log('[YouTube Content] Profile data:', data.channelProfile)
        }
      } catch (e) {
        console.error('[YouTube Content] ❌ Error extracting profile:', e)
      }
      try {
        console.log('[YouTube Content] 🔗 Extracting channel links...')
        data.channelLinks = await extractChannelLinks()
        console.log(`[YouTube Content] ✅ Channel links: ${Object.keys(data.channelLinks || {}).length} found`)
      } catch (e) {
        console.error('[YouTube Content] ❌ Error extracting channel links:', e)
        data.channelLinks = {}
      }
      console.log('[YouTube Content] 🎬 CHANNEL EXTRACTION COMPLETE:', { profile: !!data.channelProfile, links: Object.keys(data.channelLinks || {}).length })
    }

    return data
  } catch (error) {
    console.error('[YouTube Content] Error extracting data:', error)
    return null
  }
}

// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[YouTube Content] 📥 Received message:', request.action)

  if (request.action === 'extractData') {
    console.log('[YouTube Content] 🔍 Starting extraction...')
    // Handle async extraction
    extractData().then((data) => {
      console.log('[YouTube Content] ✅ EXTRACTION COMPLETE')
      console.log('[YouTube Content] Data to send back:', {
        pageType: data?.pageType,
        videoCommenters: data?.videoCommenters?.length || 0,
        videoLinks: data?.videoLinks?.length || 0,
        videoInfo: data?.videoInfo ? { id: data.videoInfo.id, title: data.videoInfo.title, url: data.videoInfo.url } : null,
        videoChannelInfo: !!data?.videoChannelInfo,
        channelProfile: !!data?.channelProfile,
        channelLinks: data?.channelLinks ? Object.keys(data.channelLinks).length : 0,
      })
      console.log('[YouTube Content] 📤 Sending response...')
      sendResponse({ success: true, data })
      console.log('[YouTube Content] ✅ Response sent successfully')
    }).catch((error) => {
      console.error('[YouTube Content] ❌ ERROR during extraction:', error)
      sendResponse({ success: false, error: error.message })
    })

    return true // Keep the message channel open for async response
  }
})

console.log('[YouTube Content] Script loaded and listening for messages')

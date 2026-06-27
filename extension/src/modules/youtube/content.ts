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

interface ExtractedData {
  pageType: string
  videoCommenters?: unknown[]
  videoLinks?: string[]
  videoChannelInfo?: unknown
  channelProfile?: unknown
  channelLinks?: unknown
}

function extractData(): ExtractedData | null {
  try {
    const pageContext = detectPageType()
    console.log('[YouTube Content] Page type detected:', pageContext.type)

    const data: ExtractedData = {
      pageType: pageContext.type,
    }

    if (pageContext.type === 'video') {
      // Extract video page data
      console.log('[YouTube Content] Extracting video data...')
      data.videoCommenters = extractVideoCommenters()
      data.videoLinks = extractVideoLinks()
      data.videoChannelInfo = extractVideoChannelInfo()
      console.log('[YouTube Content] Video extraction complete:', {
        commenters: data.videoCommenters?.length,
        links: data.videoLinks?.length,
      })
    } else if (pageContext.type === 'channel') {
      // Extract channel page data
      console.log('[YouTube Content] Extracting channel data...')
      data.channelProfile = extractChannelProfile()
      data.channelLinks = extractChannelLinks()
      console.log('[YouTube Content] Channel extraction complete:', {
        profile: !!data.channelProfile,
        links: Object.keys(data.channelLinks || {}).length,
      })
    }

    return data
  } catch (error) {
    console.error('[YouTube Content] Error extracting data:', error)
    return null
  }
}

// Listen for messages from the side panel
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('[YouTube Content] Received message:', request.action)

  if (request.action === 'extractData') {
    const data = extractData()
    console.log('[YouTube Content] Extracted data:', data)
    sendResponse({ success: true, data })
  }

  return true // Keep the message channel open for async response
})

console.log('[YouTube Content] Script loaded and listening for messages')

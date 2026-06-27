import type { PtMessage } from '@contracts'
import { resolveModule } from '@/modules/registry'
import { dispatchObservations } from '@/observations/dispatcher'
import { onMessage, sendRuntimeMessage } from '@/utils/messaging'

// Load YouTube module content script
// Imported directly so side effects (listeners, periodic extraction) execute immediately
// Initialization is guarded in the module itself to only run on YouTube pages
import '../modules/youtube/content'

/**
 * Resolve module → create runtime → listen for messages → route to runtime
 *
 * This script runs on matched URLs (e.g., google.com/maps) and:
 * 1. Resolves which module should handle this URL
 * 2. Creates the module's runtime with the observation dispatcher as emit
 * 3. Listens for commands from the side panel
 * 4. Routes commands to the appropriate runtime methods
 */

let runtime: any = null

try {
  const module = resolveModule(window.location.href)

  if (!module) {
    console.log('[Papertrail] No module found for this URL')
  } else {
    console.log(`[Papertrail] Loaded module: ${module.descriptor.label}`)

    // Create the module's runtime, passing the dispatcher as the emit callback
    runtime = module.createRuntime?.((observations) =>
      dispatchObservations(observations)
    )
  }
} catch (err) {
  console.error('[Papertrail] Failed to initialize module:', err)
}

// Handle GET_YOUTUBE_DATA with return value
chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  if (message.type === 'GET_YOUTUBE_DATA') {
    console.log('[Papertrail] GET_YOUTUBE_DATA message received')
    ;(async () => {
      try {
        const { isChannelPage, isVideoPage, extractChannelMetadata, extractVideoMetadata, extractChannelAboutDetails } = await import('@/modules/youtube/scraper')

        console.log('[Papertrail] Scraper imported, checking page type...')
        console.log('[Papertrail] isChannelPage:', isChannelPage())
        console.log('[Papertrail] isVideoPage:', isVideoPage())

        let data = null
        if (isChannelPage()) {
          console.log('[Papertrail] Extracting channel metadata...')
          data = extractChannelMetadata()

          // Also extract About details for channels
          console.log('[Papertrail] Extracting About details...')
          const aboutData = await extractChannelAboutDetails()
          data = { ...data, ...aboutData }

          console.log('[Papertrail] Extracted data:', data)
        } else if (isVideoPage()) {
          console.log('[Papertrail] Extracting video metadata...')
          data = extractVideoMetadata()
          console.log('[Papertrail] Extracted data:', data)
        } else {
          console.log('[Papertrail] Unknown YouTube page type')
        }

        console.log('[Papertrail] Sending response:', data)
        sendResponse(data)
      } catch (err) {
        console.error('[Papertrail] Error getting YouTube data:', err)
        sendResponse(null)
      }
    })()
    return true // Indicate we'll send a response
  }
})

// Listen for messages regardless of module initialization
onMessage(async (message: PtMessage) => {
  console.log('[Papertrail] Message received:', message.type)

  try {
    if (message.type === 'ACTIVATE_PASSIVE') {
          if (message.active) {
            console.log('[Papertrail] Starting passive capture')
            runtime.startPassiveCapture?.()
          } else {
            console.log('[Papertrail] Stopping passive capture')
            runtime.stopPassiveCapture?.()
          }
        } else if (message.type === 'BULK_COLLECT') {
          console.log('[Papertrail] Starting bulk collect')
          void runtime.bulkCollect?.(message.options)
        } else if (message.type === 'STOP_COLLECT') {
          console.log('[Papertrail] Stopping bulk collect')
          runtime.stopCollect?.()
        } else if (message.type === 'START_MAPS_SCRAPE') {
          console.log('[Papertrail] Starting Google Maps scrape')
          const scrollToLoadAll = message.scrollToLoadAll !== false
          console.log(`[Papertrail] Scroll to load all: ${scrollToLoadAll}`)
          runtime.scrapeAllMaps?.(scrollToLoadAll)
        } else if (message.type === 'STOP_MAPS_SCRAPE') {
          console.log('[Papertrail] Stopping Google Maps scrape')
          runtime.stopMapsScrape?.()
        } else if (message.type === 'REQUEST_CURRENT_SEARCH_TERM') {
          try {
            const { extractSearchTerm } = await import('../modules/google-maps/scraper')
            const searchTerm = extractSearchTerm()
            console.log(`[Papertrail] Sending current search term: "${searchTerm}"`)
            void sendRuntimeMessage({ type: 'CURRENT_SEARCH_TERM', searchTerm: searchTerm })
          } catch (err) {
            console.error('[Papertrail] Failed to load scraper:', err)
          }
        } else if (message.type === 'SET_SEARCH_TERM') {
          console.log(`[Papertrail] Loading search term: "${message.searchTerm}"`)
          // Navigate to the Google Maps search page for this term
          const encodedTerm = encodeURIComponent(message.searchTerm)
          const searchUrl = `https://www.google.com/maps/search/${encodedTerm}`
          window.location.href = searchUrl
        }
      } catch (error) {
        console.error('[Papertrail] Runtime error:', error)
      }
    })

console.log('[Papertrail] Content script ready')

export {}

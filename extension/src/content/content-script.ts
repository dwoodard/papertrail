import type { PtMessage } from '@contracts'
import { resolveModule } from '@/modules/registry'
import { dispatchObservations } from '@/observations/dispatcher'
import { onMessage, sendRuntimeMessage } from '@/utils/messaging'

// Load YouTube module content script
// Imported directly so side effects (listeners, periodic extraction) execute immediately
// Initialization is guarded in the module itself to only run on YouTube pages
try {
  import('../modules/youtube/content').catch(err => {
    console.log('[Papertrail] YouTube module not applicable for this page:', err.message)
  })
} catch (e) {
  console.log('[Papertrail] YouTube module import failed:', (e as Error).message)
}

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
    localStorage.setItem('__PAPERTRAIL_DEBUG__', JSON.stringify({
      status: 'no-module',
      url: window.location.href.substring(0, 100),
      timestamp: Date.now()
    }))
  } else {
    console.log(`[Papertrail] Loaded module: ${module.descriptor.label}`)

    // Create the module's runtime, passing the dispatcher as the emit callback
    runtime = module.createRuntime?.((observations) =>
      dispatchObservations(observations)
    )

    // Write status to localStorage for monitoring
    localStorage.setItem('__PAPERTRAIL_DEBUG__', JSON.stringify({
      status: 'module-loaded',
      module: module.descriptor.label,
      url: window.location.href.substring(0, 100),
      timestamp: Date.now()
    }))
  }
} catch (err) {
  console.error('[Papertrail] Failed to initialize module:', err)
  localStorage.setItem('__PAPERTRAIL_DEBUG__', JSON.stringify({
    status: 'error',
    error: err.message,
    timestamp: Date.now()
  }))
}

// Handle all incoming messages
chrome.runtime.onMessage.addListener((message: any, sender, sendResponse) => {
  const respond = (data?: any) => {
    try {
      sendResponse(data || { ok: true })
    } catch {
      // Port may have closed, ignore
    }
  }

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
    return true
  } else if (message.type === 'START_MAPS_SCRAPE') {
    console.log('[Papertrail] ✓ START_MAPS_SCRAPE received - initiating scraper')
    const scrollToLoadAll = message.scrollToLoadAll !== false
    console.log('[Papertrail] Calling runtime.scrapeAllMaps with scrollToLoadAll:', scrollToLoadAll)
    runtime.scrapeAllMaps?.(scrollToLoadAll)
    respond({ status: 'scraping' })
  } else if (message.type === 'DEBUG_PING') {
    console.log('[Papertrail] ✓ DEBUG_PING received')
    respond({ status: 'ok' })
  } else {
    console.log('[Papertrail] Unknown message type:', message.type)
    respond()
  }
})

console.log('[Papertrail] Content script ready')

export function onExecute() {
  console.log('[Papertrail] Content script initialization complete')
}

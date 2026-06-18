import { ref } from 'vue'

export function useContentMessaging(onEntry, onEntrySaved) {
  const isScraping = ref(false)
  const progress = ref({ done: 0, total: 0 })
  const activeKeyword = ref(null)

  function loadCaptured() {
    // Load any previously captured data from content script
    console.log('[Messaging] Loading captured data')
  }

  async function activate(isActive) {
    try {
      await chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'activate',
            payload: { isActive }
          }).catch(() => {
            console.log('[Messaging] Content script not loaded yet')
          })
        }
      })
      console.log(`[Messaging] Activated: ${isActive}`)
    } catch (error) {
      console.error('[Messaging] Activation failed:', error)
    }
  }

  async function bulkScrape(options = {}) {
    try {
      isScraping.value = true
      await chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'bulkScrape',
            payload: options
          }).catch(() => {
            console.log('[Messaging] Content script not loaded')
            isScraping.value = false
          })
        }
      })
    } catch (error) {
      console.error('[Messaging] Bulk scrape failed:', error)
      isScraping.value = false
    }
  }

  async function stopScrape() {
    try {
      await chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'stopScrape'
          }).catch(() => {
            console.log('[Messaging] Content script not loaded')
          })
        }
      })
      isScraping.value = false
      console.log('[Messaging] Scraping stopped')
    } catch (error) {
      console.error('[Messaging] Stop scrape failed:', error)
    }
  }

  // Listen for messages from content script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'entry') {
      onEntry(message.payload)
      if (onEntrySaved) {
        onEntrySaved(message.payload)
      }
      sendResponse({ received: true })
    } else if (message.type === 'progress') {
      progress.value = message.payload
    } else if (message.type === 'activeKeyword') {
      activeKeyword.value = message.payload.keyword
    }
  })

  return {
    isScraping,
    progress,
    activeKeyword,
    loadCaptured,
    activate,
    bulkScrape,
    stopScrape
  }
}

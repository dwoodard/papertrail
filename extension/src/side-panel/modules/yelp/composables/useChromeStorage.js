import { ref, watch } from 'vue'

export function useChromeStorage(module = 'yelp') {
  const results = ref([])
  const popupSize = ref({ width: 800, height: 600 })
  const panelWidth = ref(30)

  async function load() {
    try {
      const storageKey = `papertrail_${module}`
      const data = await chrome.storage.local.get(storageKey)
      if (data[storageKey]) {
        results.value = data[storageKey]
        console.log(`[Storage] Loaded ${results.value.length} results for ${module}`)
      }
    } catch (error) {
      console.error(`[Storage] Failed to load data: ${error}`)
    }
  }

  async function setAll(newResults) {
    results.value = newResults
    try {
      const storageKey = `papertrail_${module}`
      await chrome.storage.local.set({ [storageKey]: newResults })
      console.log(`[Storage] Saved ${newResults.length} results for ${module}`)
    } catch (error) {
      console.error(`[Storage] Failed to save data: ${error}`)
    }
  }

  async function clearKeyword(keyword) {
    const filtered = results.value.filter(r => r.keyword !== keyword)
    await setAll(filtered)
    console.log(`[Storage] Cleared keyword: ${keyword}`)
  }

  async function savePopupSize(size) {
    popupSize.value = size
    try {
      const storageKey = `papertrail_${module}_popup_size`
      await chrome.storage.local.set({ [storageKey]: size })
      console.log(`[Storage] Saved popup size`)
    } catch (error) {
      console.error(`[Storage] Failed to save popup size: ${error}`)
    }
  }

  async function savePanelWidth(width) {
    panelWidth.value = width
    try {
      const storageKey = `papertrail_${module}_panel_width`
      await chrome.storage.local.set({ [storageKey]: width })
      console.log(`[Storage] Saved panel width`)
    } catch (error) {
      console.error(`[Storage] Failed to save panel width: ${error}`)
    }
  }

  return {
    results,
    popupSize,
    panelWidth,
    load,
    setAll,
    clearKeyword,
    savePopupSize,
    savePanelWidth
  }
}

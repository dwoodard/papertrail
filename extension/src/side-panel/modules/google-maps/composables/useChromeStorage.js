import { ref } from 'vue'

function toPlain(value) {
  return JSON.parse(JSON.stringify(value))
}

/**
 * Convert observation to result format for display
 * Handles both flat and nested data structures
 */
function observationToResult(observation) {
  // Flatten nested data structure if it exists
  const data = observation.data || observation

  return {
    id: observation.id,
    name: data.name || 'N/A',
    placeId: data.placeId,
    phone: data.phone,
    website: data.website,
    address: data.address,
    keyword: data.keyword || 'unknown',
    category: data.category,
    rating: data.rating,
    reviews: data.reviews,
    hours: data.hours,
    plusCode: data.plusCode,
    priceRange: data.priceRange,
    status: data.status,
    mapsUrl: data.mapsUrl,
    isSponsored: data.isSponsored ?? false,
    source: data.source || 'unknown',
    capturedAt: data.capturedAt,
    projectId: observation.projectId || data.projectId
  }
}

export function useChromeStorage() {
  const results = ref([])
  const popupSize = ref({ width: 500, height: 600 })
  const panelWidth = ref(30)

  async function load() {
    return new Promise(resolve => {
      chrome.storage.local.get(['pt.observations', 'popupSize', 'panelWidth', 'pt.activeProjectId', 'pt.projects'], ({ 'pt.observations': observations = [], popupSize: size, panelWidth: width, 'pt.activeProjectId': activeProjectId, 'pt.projects': projectsData = [] }) => {
        // Convert projects object to array if needed
        const projects = Array.isArray(projectsData) ? projectsData : Object.values(projectsData || {})

        console.log('[useChromeStorage] Loading observations:', {
          observationsCount: observations.length,
          activeProjectId,
          projectsCount: projects.length
        })

        // Convert observations to results format
        const converted = observations.map(obs => observationToResult(obs))

        results.value = converted
        if (size) {
          popupSize.value = size
        }
        if (width) {
          panelWidth.value = width
        }
        resolve()
      })
    })
  }

  function setAll(newResults) {
    return new Promise(resolve => {
      // Store as observations in the observations key
      chrome.storage.local.set({ 'pt.observations': toPlain(newResults) }, () => {
        results.value = newResults
        resolve()
      })
    })
  }

  function clearKeyword(keyword) {
    const filtered = results.value.filter(r => (r.keyword || 'unknown') !== keyword)
    return setAll(filtered)
  }

  function savePopupSize(size) {
    return new Promise(resolve => {
      popupSize.value = size
      chrome.storage.local.set({ popupSize: toPlain(size) }, resolve)
    })
  }

  function savePanelWidth(width) {
    return new Promise(resolve => {
      panelWidth.value = width
      chrome.storage.local.set({ panelWidth: toPlain(width) }, resolve)
    })
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

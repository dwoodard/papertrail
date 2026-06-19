import { ref } from 'vue'

function toPlain(value) {
  return JSON.parse(JSON.stringify(value))
}

/**
 * Convert observation to result format for display
 */
function observationToResult(observation) {
  return {
    id: observation.id,
    name: observation.data?.name || 'N/A',
    placeId: observation.data?.placeId,
    phone: observation.data?.phone,
    website: observation.data?.website,
    address: observation.data?.address,
    keyword: observation.data?.keyword || 'unknown',
    captureMode: observation.captureMode,
    capturedAt: observation.capturedAt,
    projectId: observation.projectId,
    source: observation.captureMode === 'bulk' ? 'bulk' : 'passive'
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

import { ref } from 'vue'

function toPlain(value) {
  return JSON.parse(JSON.stringify(value))
}

export function useChromeStorage() {
  const results = ref([])
  const popupSize = ref({ width: 500, height: 600 })
  const panelWidth = ref(30)

  async function load() {
    return new Promise(resolve => {
      chrome.storage.local.get(['results', 'popupSize', 'panelWidth', 'pt.activeProjectId', 'pt.projects'], ({ results: stored = [], popupSize: size, panelWidth: width, 'pt.activeProjectId': activeProjectId, 'pt.projects': projectsData = [] }) => {
        // Convert projects object to array if needed
        const projects = Array.isArray(projectsData) ? projectsData : Object.values(projectsData || {})

        console.log('[useChromeStorage] All storage keys:', Object.keys({ results: stored, popupSize: size, panelWidth: width, 'pt.activeProjectId': activeProjectId, 'pt.projects': projects }))
        console.log('[useChromeStorage] Loading data:', {
          resultsCount: stored.length,
          activeProjectId,
          projectsCount: projects.length,
          projects,
          storedResults: stored.slice(0, 2) // Show first 2 results
        })

        // Enrich results with project information
        const enriched = stored.map(result => {
          const matchedProject = activeProjectId && projects.length > 0
            ? projects.find(p => p.id === activeProjectId)
            : null

          console.log(`[useChromeStorage] Result "${result.name}": projectId=${result.projectId}, activeProjectId=${activeProjectId}, matched=${!!matchedProject}, projectName=${matchedProject?.name || 'N/A'}`)

          return {
            ...result,
            projectId: activeProjectId,
            project: matchedProject
          }
        })

        results.value = enriched
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
      chrome.storage.local.set({ results: toPlain(newResults) }, () => {
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

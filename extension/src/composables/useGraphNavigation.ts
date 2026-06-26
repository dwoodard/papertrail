import { ref } from 'vue'

export interface GraphNavigationState {
  currentView: 'hub' | 'project'
  selectedProjectId: string | null
  zoomStateCache: Record<string, { k: number; x: number; y: number }>
  highlightedProjectId: string | null
}

export function useGraphNavigation() {
  const state = ref<GraphNavigationState>({
    currentView: 'hub',
    selectedProjectId: null,
    zoomStateCache: {},
    highlightedProjectId: null,
  })

  function navigateToProject(projectId: string, currentZoom?: { k: number; x: number; y: number }) {
    // Save current zoom state for hub before leaving
    if (state.value.currentView === 'hub' && currentZoom) {
      state.value.zoomStateCache['__hub'] = currentZoom
    }

    state.value.currentView = 'project'
    state.value.selectedProjectId = projectId
    state.value.highlightedProjectId = projectId
  }

  function navigateToHub(currentZoom?: { k: number; x: number; y: number }) {
    // Save current zoom state for project before leaving
    if (state.value.currentView === 'project' && currentZoom && state.value.selectedProjectId) {
      state.value.zoomStateCache[state.value.selectedProjectId] = currentZoom
    }

    state.value.currentView = 'hub'
    state.value.selectedProjectId = null
  }

  function getRestoreZoom(context: 'hub' | string): { k: number; x: number; y: number } | null {
    const key = context === 'hub' ? '__hub' : context

    return state.value.zoomStateCache[key] || null
  }

  function getBreadcrumbs(): Array<{ label: string; action: () => void }> {
    const crumbs: Array<{ label: string; action: () => void }> = [
      { label: 'Papertrail', action: () => navigateToHub() },
      { label: 'Graph', action: () => navigateToHub() },
    ]

    if (state.value.currentView === 'project' && state.value.selectedProjectId) {
      crumbs.push({
        label: state.value.selectedProjectId,
        action: () => navigateToProject(state.value.selectedProjectId!),
      })
      crumbs.push({
        label: 'Project Graph',
        action: () => {}, // Current page
      })
    }

    return crumbs
  }

  return {
    state,
    navigateToProject,
    navigateToHub,
    getRestoreZoom,
    getBreadcrumbs,
  }
}

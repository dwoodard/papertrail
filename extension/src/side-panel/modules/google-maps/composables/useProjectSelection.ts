import { ref, computed, onMounted } from 'vue'
import { fetchProjects, type Project } from '@/api/projects'
import { STORAGE_KEYS } from '@/stores/keys'

const STORAGE_KEY = STORAGE_KEYS.activeProjectId

export function useProjectSelection() {
  const projects = ref<Project[]>([])
  const selectedProjectId = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const selectedProject = computed(() =>
    projects.value.find(p => p.id === selectedProjectId.value),
  )

  async function loadProjects() {
    isLoading.value = true
    error.value = null

    try {
      projects.value = await fetchProjects()

      // Restore last selected project from chrome.storage.local (syncs across all contexts)
      return new Promise<void>((resolve) => {
        chrome.storage.local.get([STORAGE_KEY], (result) => {
          const saved = result[STORAGE_KEY]
          if (saved && projects.value.some(p => p.id === saved)) {
            selectedProjectId.value = saved
          } else if (projects.value.length > 0) {
            // Default to first project if no saved selection
            selectedProjectId.value = projects.value[0].id
            chrome.storage.local.set({ [STORAGE_KEY]: projects.value[0].id })
          }
          isLoading.value = false
          resolve()
        })
      })
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load projects'
      console.error('Error loading projects:', err)
      isLoading.value = false
    }
  }

  function selectProject(projectId: string) {
    selectedProjectId.value = projectId
    chrome.storage.local.set({ [STORAGE_KEY]: projectId })
  }

  onMounted(() => {
    loadProjects()
  })

  // Listen for project changes from other contexts (popup, etc)
  chrome.storage.local.onChanged.addListener((changes) => {
    if (changes[STORAGE_KEY]) {
      selectedProjectId.value = changes[STORAGE_KEY].newValue || null
      console.log(`[useProjectSelection] Project changed to: ${selectedProjectId.value}`)
    }
  })

  return {
    projects,
    selectedProjectId,
    selectedProject,
    isLoading,
    error,
    loadProjects,
    selectProject,
  }
}

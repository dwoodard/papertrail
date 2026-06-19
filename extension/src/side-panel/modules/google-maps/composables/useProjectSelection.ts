import { ref, computed, onMounted } from 'vue'
import { fetchProjects, type Project } from '@/api/projects'

const STORAGE_KEY = 'papertrail_active_project_id'

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

      // Restore last selected project from localStorage
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved && projects.value.some(p => p.id === saved)) {
        selectedProjectId.value = saved
      } else if (projects.value.length > 0) {
        // Default to first project if no saved selection
        selectedProjectId.value = projects.value[0].id
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load projects'
      console.error('Error loading projects:', err)
    } finally {
      isLoading.value = false
    }
  }

  function selectProject(projectId: string) {
    selectedProjectId.value = projectId
    localStorage.setItem(STORAGE_KEY, projectId)
  }

  onMounted(() => {
    loadProjects()
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

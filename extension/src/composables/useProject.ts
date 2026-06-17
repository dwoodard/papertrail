import type { NewProjectInput, Project } from '@contracts'
import { computed } from 'vue'

import { sendRuntimeMessage } from '@/utils/messaging'
import { uuid } from '@/utils/id'
import { STORAGE_KEYS } from '@/stores/keys'

import { useChromeStorage } from './useChromeStorage'

const PROJECTS_KEY = STORAGE_KEYS.projects
const ACTIVE_PROJECT_KEY = STORAGE_KEYS.activeProjectId

/**
 * Coerce a stored projects value into an array. Earlier builds wrote the list
 * as an object (`{0: …}`) when a Vue reactive proxy was structured-cloned, so
 * tolerate and heal that shape.
 */
function asProjectArray(value: unknown): Project[] {
    if (Array.isArray(value)) {
        return value as Project[]
    }
    if (value && typeof value === 'object') {
        return Object.values(value as Record<string, Project>)
    }
    return []
}

/**
 * Manages the project list and the active project (product spec §3). Backed by
 * `chrome.storage.local`, so popup and side panel stay in sync across contexts.
 */
export function useProject() {
    const { state: projects, ready: projectsReady } = useChromeStorage<Project[]>(PROJECTS_KEY, [])
    const { state: activeProjectId, ready: activeReady } = useChromeStorage<string | null>(
        ACTIVE_PROJECT_KEY,
        null,
    )

    // Self-heal any legacy object-shaped list, persisting it back as an array.
    const ready = Promise.all([projectsReady, activeReady]).then(() => {
        if (!Array.isArray(projects.value)) {
            projects.value = asProjectArray(projects.value)
        }
    })

    const projectList = computed<Project[]>(() => asProjectArray(projects.value))

    const activeProject = computed<Project | null>(
        () => projectList.value.find((project) => project.id === activeProjectId.value) ?? null,
    )

    function createProject(input: NewProjectInput): Project {
        const now = new Date().toISOString()
        const project: Project = {
            id: uuid(),
            name: input.name.trim(),
            goal: input.goal?.trim() || undefined,
            startingTarget: input.startingTarget?.trim() || undefined,
            createdAt: now,
            updatedAt: now,
        }
        projects.value = [...projectList.value, project]
        void selectProject(project.id)
        return project
    }

    async function selectProject(id: string | null): Promise<void> {
        activeProjectId.value = id
        await sendRuntimeMessage({ type: 'ACTIVE_PROJECT_CHANGED', projectId: id })
    }

    function removeProject(id: string): void {
        const remaining = projectList.value.filter((project) => project.id !== id)
        projects.value = remaining
        if (activeProjectId.value === id) {
            void selectProject(remaining[0]?.id ?? null)
        }
    }

    return {
        projects: projectList,
        activeProjectId,
        activeProject,
        ready,
        createProject,
        selectProject,
        removeProject,
    }
}

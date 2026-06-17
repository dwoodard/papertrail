import type { NewProjectInput, Project } from '@contracts'
import { computed } from 'vue'

import { sendRuntimeMessage } from '@/utils/messaging'
import { uuid } from '@/utils/id'

import { useChromeStorage } from './useChromeStorage'

const PROJECTS_KEY = 'pt.projects'
const ACTIVE_PROJECT_KEY = 'pt.activeProjectId'

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

    const ready = Promise.all([projectsReady, activeReady]).then(() => undefined)

    const activeProject = computed<Project | null>(
        () => projects.value.find((project) => project.id === activeProjectId.value) ?? null,
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
        projects.value = [...projects.value, project]
        void selectProject(project.id)
        return project
    }

    async function selectProject(id: string | null): Promise<void> {
        activeProjectId.value = id
        await sendRuntimeMessage({ type: 'ACTIVE_PROJECT_CHANGED', projectId: id })
    }

    function removeProject(id: string): void {
        projects.value = projects.value.filter((project) => project.id !== id)
        if (activeProjectId.value === id) {
            void selectProject(projects.value[0]?.id ?? null)
        }
    }

    return {
        projects,
        activeProjectId,
        activeProject,
        ready,
        createProject,
        selectProject,
        removeProject,
    }
}

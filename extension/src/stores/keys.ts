/** Single source of truth for chrome.storage.local keys used across contexts. */
export const STORAGE_KEYS = {
    projects: 'pt.projects',
    activeProjectId: 'pt.activeProjectId',
    observations: 'pt.observations',
} as const

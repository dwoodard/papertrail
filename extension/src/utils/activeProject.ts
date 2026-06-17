import { STORAGE_KEYS } from '@/stores/keys'

/**
 * Read the active project id directly from storage. Used by the content script
 * (which doesn't run Vue) to stamp observations with the current project.
 */
export function getActiveProjectId(): Promise<string | null> {
    return new Promise((resolve) => {
        chrome.storage.local.get([STORAGE_KEYS.activeProjectId], (result) => {
            resolve((result[STORAGE_KEYS.activeProjectId] as string | null | undefined) ?? null)
        })
    })
}

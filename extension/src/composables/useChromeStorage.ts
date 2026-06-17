import { ref, watch, type Ref } from 'vue'

export interface ChromeStorageHandle<T> {
    /** Reactive value, two-way bound to `chrome.storage.local[key]`. */
    state: Ref<T>
    /** Resolves once the initial value has been loaded from storage. */
    ready: Promise<void>
    /** Stop syncing (removes the storage change listener). */
    dispose: () => void
}

/** Strip Vue reactivity to a plain, structured-cloneable value. */
function toPlain<T>(value: T): T {
    return JSON.parse(JSON.stringify(value)) as T
}

/**
 * Reactive wrapper around a single `chrome.storage.local` key.
 *
 * Writes persist a plain JSON snapshot — passing a Vue reactive proxy straight
 * to `chrome.storage.local.set` throws "An object could not be cloned", which
 * silently drops the write. A `lastSynced` comparison suppresses echoes so two
 * open contexts (popup + side panel) don't ping-pong identical writes.
 */
export function useChromeStorage<T>(key: string, defaultValue: T): ChromeStorageHandle<T> {
    const state = ref(defaultValue) as Ref<T>
    let lastSynced = JSON.stringify(defaultValue)

    const ready = new Promise<void>((resolve) => {
        chrome.storage.local.get([key], (result) => {
            if (result[key] !== undefined) {
                lastSynced = JSON.stringify(result[key])
                state.value = result[key] as T
            }
            resolve()
        })
    })

    const stopWatch = watch(
        state,
        (value) => {
            const json = JSON.stringify(value)
            if (json === lastSynced) {
                return
            }
            lastSynced = json
            chrome.storage.local.set({ [key]: toPlain(value) }, () => {
                void chrome.runtime.lastError
            })
        },
        { deep: true },
    )

    const onChanged = (
        changes: Record<string, chrome.storage.StorageChange>,
        areaName: string,
    ): void => {
        if (areaName !== 'local' || !(key in changes)) {
            return
        }
        const json = JSON.stringify(changes[key].newValue)
        if (json === lastSynced) {
            return
        }
        lastSynced = json
        state.value = changes[key].newValue as T
    }
    chrome.storage.onChanged.addListener(onChanged)

    return {
        state,
        ready,
        dispose: () => {
            stopWatch()
            chrome.storage.onChanged.removeListener(onChanged)
        },
    }
}

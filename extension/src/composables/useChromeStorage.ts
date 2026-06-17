import { ref, watch, type Ref } from 'vue'

export interface ChromeStorageHandle<T> {
    /** Reactive value, two-way bound to `chrome.storage.local[key]`. */
    state: Ref<T>
    /** Resolves once the initial value has been loaded from storage. */
    ready: Promise<void>
    /** Stop syncing (removes the storage change listener). */
    dispose: () => void
}

/**
 * Reactive wrapper around a single `chrome.storage.local` key. Writes are
 * persisted automatically; external changes (from other extension contexts)
 * are reflected back. A guard prevents our own writes from echoing into an
 * update loop.
 */
export function useChromeStorage<T>(key: string, defaultValue: T): ChromeStorageHandle<T> {
    const state = ref(defaultValue) as Ref<T>
    let writingFromState = false
    let applyingFromStorage = false

    const ready = new Promise<void>((resolve) => {
        chrome.storage.local.get([key], (result) => {
            if (result[key] !== undefined) {
                applyingFromStorage = true
                state.value = result[key] as T
                applyingFromStorage = false
            }
            resolve()
        })
    })

    const stopWatch = watch(
        state,
        (value) => {
            if (applyingFromStorage) {
                return
            }
            writingFromState = true
            chrome.storage.local.set({ [key]: value }, () => {
                writingFromState = false
            })
        },
        { deep: true },
    )

    const onChanged = (
        changes: Record<string, chrome.storage.StorageChange>,
        areaName: string,
    ): void => {
        if (areaName !== 'local' || !(key in changes) || writingFromState) {
            return
        }
        applyingFromStorage = true
        state.value = changes[key].newValue as T
        applyingFromStorage = false
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

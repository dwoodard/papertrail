import type { Observation } from '@contracts'
import { computed, type Ref } from 'vue'

import { STORAGE_KEYS } from '@/stores/keys'

import { useChromeStorage } from './useChromeStorage'

/**
 * Reactive view of captured observations, scoped to the active project. Backed
 * by chrome.storage, so it updates live as the content script dispatches
 * captures (whether or not the panel was open at capture time).
 */
export function useObservations(activeProjectId: Ref<string | null>) {
    const { state: all } = useChromeStorage<Observation[]>(STORAGE_KEYS.observations, [])

    const observations = computed(() =>
        all.value.filter((observation) => observation.projectId === activeProjectId.value),
    )

    return { all, observations }
}

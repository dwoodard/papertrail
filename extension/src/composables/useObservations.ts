import type { Observation } from '@contracts'
import { computed  } from 'vue'
import type {Ref} from 'vue';

import { useChromeStorage } from './useChromeStorage'
import { STORAGE_KEYS } from '@/stores/keys'


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

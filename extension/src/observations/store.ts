import type { Observation } from '@contracts'

import { STORAGE_KEYS } from '@/stores/keys'

/**
 * chrome.storage-backed observation store. This is the source of truth for
 * Phase 1 (the Laravel graph backend comes later). Persistence happens here —
 * independent of whether the side panel is open — so nothing is lost.
 */

export const OBSERVATIONS_KEY = STORAGE_KEYS.observations

export function getObservations(): Promise<Observation[]> {
    return new Promise((resolve) => {
        chrome.storage.local.get([OBSERVATIONS_KEY], (result) => {
            resolve((result[OBSERVATIONS_KEY] as Observation[] | undefined) ?? [])
        })
    })
}

function setObservations(observations: Observation[]): Promise<void> {
    return new Promise((resolve) => {
        chrome.storage.local.set({ [OBSERVATIONS_KEY]: observations }, () => resolve())
    })
}

/**
 * Append observations, de-duplicating within a project by `dedupeKey`. An
 * incoming observation with the same key as an existing one (e.g. a bulk
 * capture enriching a passive one) merges its data over the existing record.
 */
export async function appendObservations(incoming: Observation[]): Promise<Observation[]> {
    if (incoming.length === 0) {
        return getObservations()
    }

    const existing = await getObservations()
    const indexByKey = new Map<string, number>()
    existing.forEach((observation, index) => {
        if (observation.dedupeKey) {
            indexByKey.set(`${observation.projectId}:${observation.dedupeKey}`, index)
        }
    })

    for (const observation of incoming) {
        const key = observation.dedupeKey ? `${observation.projectId}:${observation.dedupeKey}` : null
        const at = key !== null ? indexByKey.get(key) : undefined

        if (at !== undefined) {
            existing[at] = {
                ...existing[at],
                ...observation,
                id: existing[at].id,
                data: { ...existing[at].data, ...observation.data },
            }
        } else {
            if (key !== null) {
                indexByKey.set(key, existing.length)
            }

            existing.push(observation)
        }
    }

    await setObservations(existing)

    return existing
}

/** Remove all observations belonging to a project. */
export async function clearObservationsForProject(projectId: string | null): Promise<void> {
    const existing = await getObservations()
    await setObservations(existing.filter((observation) => observation.projectId !== projectId))
}

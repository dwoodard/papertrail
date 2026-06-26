import type { Observation } from '@contracts'

import { appendObservations } from './store'
import { sendRuntimeMessage } from '@/utils/messaging'


/**
 * Optional backend sink. Phase 1 leaves this unconfigured — observations live
 * in chrome.storage. When the Laravel Observation API exists, point the client
 * here and observations will also be POSTed.
 */
export interface ApiClient {
    sendObservations(observations: Observation[]): Promise<void>
}

let apiClient: ApiClient | null = null

export function configureApiClient(client: ApiClient | null): void {
    apiClient = client
}

/**
 * Persist captured observations and surface them to any open UI.
 *  1. write to chrome.storage (source of truth) with de-duplication
 *  2. broadcast OBSERVATIONS so the side panel can react immediately
 *  3. best-effort forward to the backend API if configured (stubbed for now)
 */
export async function dispatchObservations(observations: Observation[]): Promise<void> {
    if (observations.length === 0) {
        return
    }

    await appendObservations(observations)
    await sendRuntimeMessage({ type: 'OBSERVATIONS', observations })

    if (apiClient) {
        try {
            await apiClient.sendObservations(observations)
        } catch (error) {
            // Storage already holds the observations; API delivery can retry later.
            console.warn('[Papertrail] observation API delivery failed', error)
        }
    }
}

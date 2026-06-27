import { API_BASE } from './config'

export interface SyncResult {
  created: number
  updated: number
}

export async function syncObservations(
  projectId: string | null,
  observations: Record<string, unknown>[],
): Promise<SyncResult> {
  const response = await fetch(`${API_BASE}/api/observations/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project_id: projectId,
      observations,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
    }))

    throw new Error(error.message || `Sync failed: ${response.statusText}`)
  }

  return response.json()
}

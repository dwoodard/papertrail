import { API_BASE } from './config'

export interface SyncResult {
  created: number
  updated: number
}

export async function syncPlaces(
  projectId: string,
  places: Record<string, unknown>[],
): Promise<SyncResult> {
  const response = await fetch(`${API_BASE}/api/places/sync`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      project_id: projectId,
      places,
    }),
    credentials: 'include',
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText,
    }))
    throw new Error(error.message || `Sync failed: ${response.statusText}`)
  }

  return response.json()
}

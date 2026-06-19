import { ref } from 'vue'
import { syncPlaces, type SyncResult } from '@/api/syncPlaces'

export function useSyncPlaces() {
  const isSyncing = ref(false)
  const lastSyncResult = ref<SyncResult | null>(null)
  const syncError = ref<string | null>(null)
  const syncMessage = ref<string | null>(null)

  async function handleSync(projectId: string, places: Record<string, unknown>[]) {
    if (!projectId || places.length === 0) {
      syncError.value = 'Project and places required'
      return
    }

    isSyncing.value = true
    syncError.value = null
    syncMessage.value = null

    try {
      const result = await syncPlaces(projectId, places)
      lastSyncResult.value = result

      // Format success message
      const plural = result.created === 1 ? 'place' : 'places'
      syncMessage.value = `✓ ${places.length} synced (${result.created} new, ${result.updated} updated)`
    } catch (err) {
      syncError.value = err instanceof Error ? err.message : 'Sync failed'
      console.error('Sync error:', err)
    } finally {
      isSyncing.value = false
    }
  }

  return {
    isSyncing,
    lastSyncResult,
    syncError,
    syncMessage,
    handleSync,
  }
}

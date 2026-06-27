import { ref } from 'vue'
import { syncObservations } from '@/api/syncObservations'
import type { SyncResult } from '@/api/syncObservations'

export function useSyncObservations() {
  const isSyncing = ref(false)
  const lastSyncResult = ref<SyncResult | null>(null)
  const syncError = ref<string | null>(null)
  const syncMessage = ref<string | null>(null)

  async function handleSync(projectId: string | null, observations: Record<string, unknown>[]) {
    if (!observations.length) {
      syncError.value = 'No observations to sync'
      return
    }

    isSyncing.value = true
    syncError.value = null
    syncMessage.value = null

    try {
      const result = await syncObservations(projectId, observations)
      lastSyncResult.value = result

      // Format readable success message with details
      let details = ''
      if (result.created > 0) {
        details += `${result.created} new`
      }
      if (result.updated > 0) {
        if (details) details += ', '
        details += `${result.updated} updated`
      }

      syncMessage.value = `✓ Synced to Papertrail: ${details}`
    } catch (err) {
      syncError.value = err instanceof Error ? err.message : 'Sync failed'
      console.error('Sync error:', err)
    } finally {
      isSyncing.value = false
    }
  }

  function clearMessages() {
    syncMessage.value = null
    syncError.value = null
  }

  return {
    isSyncing,
    lastSyncResult,
    syncError,
    syncMessage,
    handleSync,
    clearMessages,
  }
}

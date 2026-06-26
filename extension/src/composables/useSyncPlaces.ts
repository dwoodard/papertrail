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
      // Filter out places without valid IDs to prevent duplicates
      const placesWithValidIds = places.filter((place) => {
        if (place.id === 'N/A' || !place.id) {
          console.warn('[Papertrail] Skipping place without valid ID:', place.name)
          return false
        }
        return true
      })

      if (placesWithValidIds.length === 0) {
        syncError.value = 'No places with valid IDs to sync'
        isSyncing.value = false
        return
      }

      // Transform scraped data to match API expectations
      const transformedPlaces = placesWithValidIds.map((place) => {
        const transformed: Record<string, unknown> = {
          placeId: place.id,
          name: place.name,
          address: place.address,
          phone: place.phone,
          website: place.website,
        }

        // Add optional fields if present
        if (place.category) transformed.category = place.category
        if (place.plusCode) transformed.plusCode = place.plusCode
        if (place.hours) transformed.hours = place.hours
        if (place.priceRange) transformed.priceRange = place.priceRange
        if (place.mapsUrl) transformed.mapsUrl = place.mapsUrl
        if (place.rating) transformed.rating = place.rating
        if (place.reviews) transformed.reviews = place.reviews
        if (place.isSponsored) transformed.isSponsored = place.isSponsored
        if (place.keyword) transformed.keyword = place.keyword
        if (place.source) transformed.source = place.source
        if (place.capturedAt) transformed.capturedAt = place.capturedAt

        return transformed
      })

      const result = await syncPlaces(projectId, transformedPlaces)
      lastSyncResult.value = result

      // Format success message
      const plural = result.created === 1 ? 'place' : 'places'
      syncMessage.value = `✓ ${result.created} ${plural} synced (${result.updated} updated)`
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

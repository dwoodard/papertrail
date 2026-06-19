<template>
  <div class="container">
    <AppHeader
      :active="activeToggle"
      :total="results.length"
      :results="exportData"
      :is-side-panel="isSidePanel"
      :selected-keyword="selectedKeyword"
      :projects="projectSelection.projects.value"
      :selected-project-id="projectSelection.selectedProjectId.value"
      @toggle-active="handleToggleActive"
      @clean-done="handleCleanDone"
      @select-project="projectSelection.selectProject"
    />

    <!-- Active Project Display -->
    <div v-if="activeProject" class="project-display">
      <span class="project-label">Project:</span>
      <span class="project-name">{{ activeProject.name }}</span>
    </div>

    <div v-if="isScraping" class="scraping-banner">
      <div class="scraping-spinner">⟳</div>
      <div class="scraping-text">
        <div class="scraping-title">
          Scraping in progress...
          <span v-if="messaging.activeKeyword.value" class="active-keyword">
            "{{ messaging.activeKeyword.value }}"
          </span>
        </div>
        <div class="scraping-details">
          <span class="progress-count">{{ progress.done }} / {{ progress.total }}</span>
          <span class="separator">•</span>
          <span class="results-count">{{ scrapingStats.total }} results</span>
          <span class="separator">•</span>
          <span class="enrichment-status">{{ scrapingStats.status }}</span>
        </div>
      </div>
      <div class="enrichment-bar">
        <div
          class="enrichment-fill"
          :style="{ width: scrapingStats.enrichmentPercent + '%' }"
        ></div>
      </div>
    </div>

    <ScrapeControls
      :isScraping="isScraping"
      @bulk-scrape="handleBulkScrape"
    />

    <div class="content" ref="contentArea">
      <KeywordList
        :keyword-groups="keywordGroups"
        :selected-keyword="selectedKeyword"
        :active-keyword="messaging.activeKeyword.value"
        @select="handleSelectKeyword"
        @request-clear="showClearKeywordModal"
      />

      <div
        class="panel-divider"
        ref="panelDivider"
        @mousedown="startPanelResize"
        title="Drag to resize panels"
      ></div>

      <ResultsTable
        ref="resultsTable"
        :selected-keyword="selectedKeyword"
        :keyword-groups="keywordGroups"
        @delete="handleDeleteItem"
        @scroll-to-listing="handleScrollToListing"
      />
    </div>

    <ProgressBar
      v-if="isScraping"
      :done="progress.done"
      :total="progress.total"
      @stop="handleStopScrape"
    />

    <!-- Sync Section -->
    <div v-if="results.length > 0" class="sync-section">
      <button
        class="sync-button"
        :disabled="syncState.isSyncing.value || !activeProject"
        @click="syncState.handleSync(activeProject.id, exportData)"
      >
        <span v-if="syncState.isSyncing.value" class="spinner">⟳</span>
        {{ syncState.isSyncing.value ? 'Syncing...' : 'Sync to Papertrail' }}
      </button>

      <div v-if="syncState.syncMessage.value" class="sync-success">
        {{ syncState.syncMessage.value }}
      </div>
      <div v-if="syncState.syncError.value" class="sync-error">
        ✗ {{ syncState.syncError.value }}
      </div>
    </div>

    <ResizeHandle
      :popup-size="popupSize"
      :on-save-size="handleSavePopupSize"
    />

    <ConfirmModal
      :model-value="!!pendingClear"
      :title="clearModalTitle"
      :message="clearModalMessage"
      :confirm-label="clearConfirmLabel"
      :danger="true"
      @confirm="handleConfirmClear"
      @cancel="pendingClear = null"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import AppHeader from './components/AppHeader.vue'
import ScrapeControls from './components/ScrapeControls.vue'
import KeywordList from './components/KeywordList.vue'
import ResultsTable from './components/ResultsTable.vue'
import ProgressBar from './components/ProgressBar.vue'
import ResizeHandle from './components/ResizeHandle.vue'
import ConfirmModal from './components/ConfirmModal.vue'
import { useChromeStorage } from './composables/useChromeStorage.js'
import { useKeywordGroups } from './composables/useKeywordGroups.js'
import { useContentMessaging } from './composables/useContentMessaging.js'
import { useSyncPlaces } from './composables/useSyncPlaces'
import { useProjectSelection } from './composables/useProjectSelection'

const storage = useChromeStorage()
const { results, popupSize, panelWidth } = storage

const syncState = useSyncPlaces()
const projectSelection = useProjectSelection()

// Update activeProject when selectedProjectId changes
const activeProject = computed(() => projectSelection.selectedProject.value)

const selectedKeyword = ref(null)
const pendingClear = ref(null)
const activeToggle = ref(false)
const contentArea = ref(null)
const panelDivider = ref(null)
const resultsTable = ref(null)
let isResizingPanel = false

const keywordGroups = useKeywordGroups(results)

const messaging = useContentMessaging(
  (entry) => {
    // Check for duplicate by Place ID before adding to avoid duplicates in UI
    if (entry) {
      const placeId = entry.placeId || `unknown-${entry.name}`
      const existingIndex = results.value.findIndex(r => {
        const rPlaceId = r.placeId || `unknown-${r.name}`
        return rPlaceId === placeId
      })

      // Enrich entry before adding/updating
      enrichEntryWithProject(entry).then(enrichedEntry => {
        if (existingIndex !== -1) {
          // Update existing entry (enrichment in progress)
          Object.assign(results.value[existingIndex], enrichedEntry)
          console.log(`[App] 🔄 Updated in UI: ${enrichedEntry.name} (${enrichedEntry.source})`)
        } else {
          // Add new entry
          results.value.push(enrichedEntry)
          console.log(`[App] ✅ Added to UI: ${enrichedEntry.name} (${enrichedEntry.source})`)
        }
      })
    }
  },
  async (entry) => {
    // Persist new entry to storage immediately
    if (entry) {
      await storage.setAll([...results.value])
      console.log(`[App] 💾 Saved to storage: ${entry.name}`)
    }
  }
)

const { isScraping, progress } = messaging

// Enrich entry with project data
function enrichEntryWithProject(entry) {
  return new Promise(resolve => {
    chrome.storage.local.get(['pt.activeProjectId', 'pt.projects'], ({ 'pt.activeProjectId': activeProjectId, 'pt.projects': projectsData = [] }) => {
      // Convert projects object to array if needed
      const projects = Array.isArray(projectsData) ? projectsData : Object.values(projectsData || {})

      const enriched = {
        ...entry,
        projectId: activeProjectId,
        project: activeProjectId && projects.length > 0
          ? projects.find(p => p.id === activeProjectId)
          : null
      }
      resolve(enriched)
    })
  })
}

const scrapingStats = computed(() => {
  // Show stats for current keyword only if selected, otherwise all
  const filtered = selectedKeyword.value
    ? (keywordGroups.value[selectedKeyword.value] || [])
    : results.value

  const total = filtered.length
  const enriched = filtered.filter(r => r.source === 'bulk').length
  const pending = filtered.filter(r => r.source === 'partial').length
  const enrichmentPercent = total > 0 ? Math.round((enriched / total) * 100) : 0

  return {
    total,
    enriched,
    pending,
    enrichmentPercent,
    status: pending > 0 ? `${enriched}/${total} enriched` : `${total} total`
  }
})

const clearModalTitle = computed(() => {
  if (!pendingClear.value) return ''
  return `Clear results for "${pendingClear.value.keyword}"?`
})

const clearModalMessage = computed(() => {
  if (!pendingClear.value) return ''
  const count = keywordGroups.value[pendingClear.value.keyword]?.length || 0
  return `This will permanently delete ${count} result${count !== 1 ? 's' : ''} for this search term.`
})

const clearConfirmLabel = computed(() => {
  return 'Clear Keyword'
})

const isSidePanel = computed(() => {
  return window.location.pathname.includes('side-panel')
})

const exportData = computed(() => {
  return resultsTable.value?.getFilteredData?.() || results.value
})

onMounted(async () => {
  await storage.load()
  const tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0]
  if (tab) {
    messaging.loadCaptured()
  }
  // Auto-Capture is always on — enable passive listening by default
  activeToggle.value = true
  await messaging.activate(true)

  // Load active project from Chrome storage
  chrome.storage.local.get(['pt.activeProjectId', 'pt.projects'], ({ 'pt.activeProjectId': activeProjectSlug, 'pt.projects': projectsData = [] }) => {
    if (activeProjectSlug && projectsData.length > 0) {
      // Find project by slug (pt.activeProjectId)
      const project = projectsData.find(p => p.slug === activeProjectSlug)
      if (project) {
        activeProject.value = project
        console.log(`[GoogleMapsModule] Active project loaded: ${project.name} (UUID: ${project.id})`)
      }
    }
  })

  // Initialize panel width and layout
  if (contentArea.value) {
    contentArea.value.style.setProperty('--left-panel-width', panelWidth.value + '%')
    // Reset scrollTop to prevent content from being pushed out of view
    contentArea.value.scrollTop = 0
  }
})

function handleToggleActive(active) {
  activeToggle.value = active
  messaging.activate(active)
}

async function handleBulkScrape(options = {}) {
  // Show immediate visual feedback before async message
  messaging.isScraping.value = true
  messaging.progress.value = { done: 0, total: 0 }

  // Get the current filter from results table
  const statusFilter = resultsTable.value?.statusFilter || 'all'

  // Then send the message (don't await so UI updates immediately)
  messaging.bulkScrape({ ...options, statusFilter })
}

async function handleStopScrape() {
  await messaging.stopScrape()
}

function handleSelectKeyword(keyword) {
  selectedKeyword.value = keyword
}

function showClearKeywordModal(keyword) {
  pendingClear.value = { type: 'keyword', keyword }
}

async function handleConfirmClear() {
  if (!pendingClear.value) return

  await storage.clearKeyword(pendingClear.value.keyword)
  if (selectedKeyword.value === pendingClear.value.keyword) {
    selectedKeyword.value = null
  }

  pendingClear.value = null
}

async function handleSavePopupSize(size) {
  await storage.savePopupSize(size)
}

function startPanelResize(e) {
  isResizingPanel = true
  const container = contentArea.value
  if (!container) return
  document.body.classList.add('resizing-panel')

  const handleMouseMove = (moveEvent) => {
    if (!isResizingPanel) return

    const rect = container.getBoundingClientRect()
    const percentage = ((moveEvent.clientX - rect.left) / rect.width) * 100
    const newLeftWidth = Math.max(25, Math.min(75, percentage))

    panelWidth.value = newLeftWidth
    container.style.setProperty('--left-panel-width', newLeftWidth + '%')
  }

  const handleMouseUp = () => {
    isResizingPanel = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
    document.body.classList.remove('resizing-panel')
    storage.savePanelWidth(panelWidth.value)
  }

  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

onUnmounted(() => {
  isResizingPanel = false
})

async function handleCleanDone() {
  // Reload data after cleaning
  await storage.load()
}

async function handleScrollToListing(entry) {
  // Scroll the listing into view on the Google Maps page
  messaging.scrollToListing(entry.placeId, entry.name)
}

async function handleDeleteItem(entry) {
  // Remove the item from results
  const index = results.value.findIndex(r => {
    const rPlaceId = r.placeId || `unknown-${r.name}`
    const ePlaceId = entry.placeId || `unknown-${entry.name}`
    return rPlaceId === ePlaceId
  })

  if (index !== -1) {
    results.value.splice(index, 1)
    await storage.setAll([...results.value])
    console.log(`[App] 🗑️ Deleted item: ${entry.name}`)
  }
}
</script>

<style scoped>
.project-display {
  padding: 8px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f0f9ff;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.project-label {
  color: #0c4a6e;
  font-weight: 500;
}

.project-name {
  color: #0369a1;
  font-weight: 600;
}

.sync-section {
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sync-button {
  padding: 10px 14px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: background 0.2s;
}

.sync-button:hover:not(:disabled) {
  background: #2563eb;
}

.sync-button:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}

.sync-button .spinner {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.sync-success {
  color: #059669;
  font-size: 12px;
  padding: 6px;
  background: #ecfdf5;
  border-radius: 4px;
  border-left: 3px solid #059669;
}

.sync-error {
  color: #dc2626;
  font-size: 12px;
  padding: 6px;
  background: #fef2f2;
  border-radius: 4px;
  border-left: 3px solid #dc2626;
}
</style>

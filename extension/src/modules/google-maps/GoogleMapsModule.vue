<template>
  <main class="scraper-shell">
    <header class="scraper-topbar">
      <div class="title-group">
        <div class="eyebrow"><span class="eyebrow-dot"></span> Live Maps Collector</div>
        <h1>Maps Scraper</h1>
      </div>

      <div class="top-actions">
        <div class="export-wrap">
          <button class="export-button" type="button" @click="toggleExportMenu">
            <span>Export</span>
            <span>▾</span>
          </button>
          <div :class="['export-menu', { open: exportMenuOpen }]">
            <button type="button" @click="copyJson" :disabled="!hasResults">Copy JSON</button>
            <button type="button" @click="downloadJson" :disabled="!hasResults">Download JSON</button>
            <button type="button" @click="downloadCsv" :disabled="!hasResults">Download CSV</button>
          </div>
        </div>
        <button class="icon-button" type="button" title="Close preview">×</button>
      </div>
    </header>

    <section class="scraper-main" @mousemove="handleResize" @mouseup="stopResize" @mouseleave="stopResize">
      <aside class="card search-panel" :style="{ width: `${searchPanelWidth}%` }" aria-label="Search terms panel">
        <div class="card-header">
          <div>
            <h2 class="card-title">Search Terms</h2>
            <div class="card-subtitle">Enter the active Maps search query.</div>
          </div>
        </div>

        <div class="search-panel-body">
          <div class="search-history">
            <div v-if="savedSearchTerms.length === 0" class="history-empty">
              <p>No searches yet</p>
            </div>
            <div v-else class="history-list">
              <div
                v-for="search in savedSearchTerms"
                :key="search.term"
                class="history-item-wrapper"
              >
                <button
                  class="history-item"
                  :class="{ active: selectedSearchTerm === search.term }"
                  @click="selectSearchTerm(search.term)"
                >
                  <div class="history-query">{{ search.term }}</div>
                  <div class="history-meta">{{ search.count }} results</div>
                </button>
                <button
                  class="history-load-btn"
                  title="Load this search on Google Maps"
                  @click.stop="loadSearchTermOnMaps(search.term)"
                >
                  ↻
                </button>
                <button
                  class="history-delete-btn"
                  title="Delete this search term"
                  @click.stop="confirmDeleteSearchTerm(search.term)"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div
        class="resize-divider"
        @mousedown="startResize"
        title="Drag to resize"
      ></div>

      <section class="card" aria-label="Scraped results panel">
        <div class="card-header">
          <div>
            <h2 class="card-title">Results</h2>
            <div class="card-subtitle">Business details collected from listing panels.</div>
          </div>
          <div class="results-tools">{{ results.length }} results</div>
        </div>

        <div class="results-table-wrapper">
          <div v-if="!results.length" class="empty-state">
            <div>
              <strong>No results yet</strong>
              Start the scraper to collect Google Maps listings.
            </div>
          </div>
          <table v-else class="results-table">
            <thead>
              <tr v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
                <th
                  v-for="header in headerGroup.headers"
                  :key="header.id"
                  :style="{ width: header.getSize() }"
                  :class="['table-header', { sortable: header.column.getCanSort() }]"
                  @click="header.column.getToggleSortingHandler?.()"
                >
                  <div class="header-content">
                    <span>{{ header.column.columnDef.header }}</span>
                    <span v-if="header.column.getCanSort()" class="sort-indicator">
                      {{ header.column.getIsSorted() === 'asc' ? '↑' : header.column.getIsSorted() === 'desc' ? '↓' : '⇅' }}
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="row in table.getRowModel().rows"
                :key="row.id"
                class="result-row"
                :class="{ 'result-row--highlight': highlightedIds.has((row.original as any).id) }"
                @click="selectedListing = row.original"
              >
                <td
                  v-for="cell in row.getVisibleCells()"
                  :key="cell.id"
                  :style="{ width: cell.column.getSize() }"
                  :class="`col-${cell.column.id}`"
                >
                  <template v-if="cell.column.id === 'website'">
                    <a v-if="row.original.websiteUrl" :href="row.original.websiteUrl" target="_blank" rel="noopener" @click.stop>
                      {{ cell.getValue() }}
                    </a>
                    <span v-else>{{ cell.getValue() }}</span>
                  </template>
                  <template v-else>
                    {{ cell.getValue() }}
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>

    <!-- Delete Confirmation Modal -->
    <div v-if="confirmDeleteTerm" class="modal-overlay" @click="confirmDeleteTerm = null">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">Delete Search Term?</h2>
          <button class="modal-close" @click="confirmDeleteTerm = null">✕</button>
        </div>

        <div class="modal-body">
          <p class="confirm-text">
            Are you sure you want to delete <strong>"{{ confirmDeleteTerm }}"</strong> and all its results?
          </p>
          <p class="confirm-warning">This action cannot be undone.</p>
        </div>

        <div class="modal-footer">
          <button class="modal-delete" @click="deleteSearchTermConfirmed">
            Delete
          </button>
          <button class="modal-close-btn" @click="confirmDeleteTerm = null">Cancel</button>
        </div>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="selectedListing" class="modal-overlay" @click="selectedListing = null">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h2 class="modal-title">{{ selectedListing.name }}</h2>
          <button class="modal-close" @click="selectedListing = null">✕</button>
        </div>

        <div class="modal-body">
          <div class="detail-row">
            <span class="detail-label">Address:</span>
            <span class="detail-value">{{ selectedListing.address }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Phone:</span>
            <span class="detail-value">{{ selectedListing.phone }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Website:</span>
            <span v-if="selectedListing.websiteUrl" class="detail-value">
              <a :href="selectedListing.websiteUrl" target="_blank" rel="noopener">{{ selectedListing.website }}</a>
            </span>
            <span v-else class="detail-value">{{ selectedListing.website }}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Place ID:</span>
            <span class="detail-value detail-monospace">{{ selectedListing.id }}</span>
          </div>
        </div>

        <div class="modal-footer">
          <button class="modal-delete" @click.stop="deleteResult(selectedListing.id)">
            Delete Result
          </button>
          <button class="modal-close-btn" @click.stop="selectedListing = null">Close</button>
        </div>
      </div>
    </div>

    <footer class="scraper-footer">
      <div class="footer-left">
        <div class="status-line">{{ statusMessage }}</div>
        <div class="progress">
          <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
        </div>
      </div>

      <div class="footer-actions">
        <label class="scrape-option">
          <input v-model="scrollToLoadAll" type="checkbox" />
          <span>Scroll to load all</span>
        </label>
        <button class="button" type="button" @click="startScrape" :disabled="running">Start Scrape</button>
        <button class="button danger" type="button" @click="stopScrape" :disabled="!running">Stop</button>
        <button class="button secondary" type="button" @click="clearResults">Clear</button>
      </div>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  createColumnHelper,
  getCoreRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { sendRuntimeMessage, sendToActiveTab, onMessage } from '@/utils/messaging'

interface SavedSearchTerm {
  term: string
  count: number
  lastUpdated: number
}

const savedSearchTerms = ref<SavedSearchTerm[]>([])
const selectedSearchTerm = ref('')
const running = ref(false)
const stopped = ref(false)
const searchPanelWidth = ref(25)
const isResizing = ref(false)
const resizeStartX = ref(0)
const highlightedIds = ref<Set<string>>(new Set())
const selectedListing = ref<any>(null)
const confirmDeleteTerm = ref<string | null>(null)
const results = ref([] as any[])
const total = ref(0)
const current = ref(0)
const totalListings = ref(0)
const exportMenuOpen = ref(false)
const statusMessage = ref('Ready. Click Start Scrape to collect Google Maps listings.')
const scrollToLoadAll = ref(true)

const columnHelper = createColumnHelper()

const columns = [
  columnHelper.accessor((row, index) => index + 1, {
    id: 'index',
    header: '#',
    size: 40,
  }),
  columnHelper.accessor('name', {
    header: 'Name',
    size: 180,
  }),
  columnHelper.accessor('address', {
    header: 'Address',
    size: 200,
  }),
  columnHelper.accessor('phone', {
    header: 'Phone',
    size: 120,
  }),
  columnHelper.accessor('website', {
    header: 'Website',
    size: 140,
  }),
  columnHelper.accessor('id', {
    header: 'ID',
    size: 180,
  }),
]

const sorting = ref([])
const currentSearchTerm = ref('')

function loadSearchTermsFromStorage() {
  try {
    const keys = Object.keys(localStorage)
    const terms: SavedSearchTerm[] = keys
      .filter((k) => k.startsWith('maps_results_'))
      .map((k) => {
        const term = k.replace('maps_results_', '')
        const stored = localStorage.getItem(k)
        const parsed = stored ? JSON.parse(stored) : []
        return {
          term: term,
          count: parsed.length,
          lastUpdated: Date.now(),
        }
      })
      .sort((a, b) => b.lastUpdated - a.lastUpdated)

    savedSearchTerms.value = terms
    console.log(`[Papertrail] Loaded ${terms.length} saved search terms`)
  } catch (error) {
    console.error('[Papertrail] Error loading search terms:', error)
  }
}

function loadResultsFromStorage(searchTerm: string) {
  try {
    const stored = localStorage.getItem(`maps_results_${searchTerm}`)
    if (stored) {
      const parsed = JSON.parse(stored)
      results.value = parsed
      selectedSearchTerm.value = searchTerm
      console.log(`[Papertrail] Loaded ${parsed.length} results for "${searchTerm}"`)
    } else {
      results.value = []
    }
  } catch (error) {
    console.error('[Papertrail] Error loading from localStorage:', error)
    results.value = []
  }
}

function selectSearchTerm(searchTerm: string) {
  loadResultsFromStorage(searchTerm)
}

async function loadSearchTermOnMaps(term: string) {
  console.log('[GoogleMaps] Load button clicked for:', term)
  console.log('[GoogleMaps] Chrome available:', !!chrome?.tabs)
  // Send message to content script to load this search term on Google Maps
  await sendToActiveTab({ type: 'SET_SEARCH_TERM', searchTerm: term })
  statusMessage.value = `Loading search: "${term}" on Google Maps...`
  console.log('[GoogleMaps] Message sent to active tab')
}

function updateSearchTermsList(searchTerm: string, count: number) {
  const existingIndex = savedSearchTerms.value.findIndex((t) => t.term === searchTerm)

  if (existingIndex >= 0) {
    savedSearchTerms.value[existingIndex].count = count
    savedSearchTerms.value[existingIndex].lastUpdated = Date.now()
  } else {
    savedSearchTerms.value.unshift({
      term: searchTerm,
      count: count,
      lastUpdated: Date.now(),
    })
  }

  // Keep sorted by most recent first
  savedSearchTerms.value.sort((a, b) => b.lastUpdated - a.lastUpdated)
}

function saveResultsToStorage(searchTerm: string, listings: typeof results.value) {
  try {
    localStorage.setItem(`maps_results_${searchTerm}`, JSON.stringify(listings))
    console.log(`[Papertrail] Saved ${listings.length} results for "${searchTerm}"`)
  } catch (error) {
    console.error('[Papertrail] Error saving to localStorage:', error)
  }
}

// Listen for scrape results from the content script
onMessage((message) => {
  if (message.type === 'MAPS_SCRAPE_STARTING') {
    currentSearchTerm.value = message.searchTerm
    totalListings.value = message.totalListings || 0
    // Add or update search term in the list
    const existingIndex = savedSearchTerms.value.findIndex((t) => t.term === message.searchTerm)
    if (existingIndex === -1) {
      // New search term - add to top of list
      savedSearchTerms.value.unshift({
        term: message.searchTerm,
        count: 0,
        lastUpdated: Date.now(),
      })
    } else {
      // Existing term - move to top and update timestamp
      const [term] = savedSearchTerms.value.splice(existingIndex, 1)
      term.lastUpdated = Date.now()
      savedSearchTerms.value.unshift(term)
    }
    statusMessage.value = `Starting scrape for "${message.searchTerm}"...`
  } else if (message.type === 'MAPS_RESULT') {
    // Check if listing already exists by ID
    const exists = results.value.some((r) => r.id === message.listing.id)
    if (!exists) {
      results.value.push(message.listing)
      // Save immediately after adding
      if (message.searchTerm) {
        saveResultsToStorage(message.searchTerm, results.value)
        // Reload from storage to sync table with persisted data
        loadResultsFromStorage(message.searchTerm)
        // Highlight the new row
        highlightedIds.value.add(message.listing.id)
        // Remove highlight after animation (1.5s)
        setTimeout(() => {
          highlightedIds.value.delete(message.listing.id)
        }, 1500)
      }
    } else {
      console.log(`[Papertrail] Skipped duplicate: ${message.listing.name} (ID: ${message.listing.id})`)
    }
    statusMessage.value = totalListings.value > 0
      ? `Collected ${results.value.length} of ${totalListings.value} results...`
      : `Collected ${results.value.length} results...`
    currentSearchTerm.value = message.searchTerm
  } else if (message.type === 'MAPS_SCRAPE_WAITING') {
    statusMessage.value = `Collected ${message.collectedCount} results... waiting ${message.waitSeconds}s`
  } else if (message.type === 'MAPS_SCRAPE_DONE') {
    running.value = false
    currentSearchTerm.value = message.searchTerm
    statusMessage.value = `Completed! Collected ${message.totalCount} total results.`

    // Save to localStorage
    if (message.searchTerm) {
      saveResultsToStorage(message.searchTerm, results.value)
      updateSearchTermsList(message.searchTerm, results.value.length)
    }
  } else if (message.type === 'CURRENT_SEARCH_TERM') {
    currentSearchTerm.value = message.searchTerm
    loadResultsFromStorage(message.searchTerm)
    statusMessage.value = `Loaded results for "${message.searchTerm}"`
  }
})

// On component mount, load saved search terms and request current search
onMounted(async () => {
  loadSearchTermsFromStorage()
  await sendRuntimeMessage({ type: 'REQUEST_CURRENT_SEARCH_TERM' })
})

const table = computed(() =>
  useVueTable({
    get data() {
      return results.value
    },
    columns,
    state: {
      get sorting() {
        return sorting.value
      },
    },
    onSortingChange: (updater) => {
      sorting.value = typeof updater === 'function' ? updater(sorting.value) : updater
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })
)

const hasResults = computed(() => results.value.length > 0)
const progressPercent = computed(() => {
  return total.value ? Math.round((current.value / total.value) * 100) : 0
})

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

function toggleExportMenu() {
  exportMenuOpen.value = !exportMenuOpen.value
}

function formatTime(date) {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  return `${diffDays}d ago`
}

async function startScrape() {
  if (running.value) return

  running.value = true
  stopped.value = false
  results.value = []
  total.value = 0
  current.value = 0

  statusMessage.value = 'Starting Google Maps scraper...'

  // Send message to content script on the active tab
  await sendToActiveTab({ type: 'START_MAPS_SCRAPE', scrollToLoadAll: scrollToLoadAll.value })
}

function stopScrape() {
  stopped.value = true
  statusMessage.value = 'Stopping after the current step...'

  // Send message to content script to stop scraping
  void sendToActiveTab({ type: 'STOP_MAPS_SCRAPE' })
}

function clearResults() {
  if (currentSearchTerm.value) {
    // Clear from localStorage
    localStorage.removeItem(`maps_results_${currentSearchTerm.value}`)
    // Remove from search terms list
    const index = savedSearchTerms.value.findIndex((t) => t.term === currentSearchTerm.value)
    if (index > -1) {
      savedSearchTerms.value.splice(index, 1)
    }
    console.log(`[Papertrail] Cleared results for "${currentSearchTerm.value}"`)
  }
  running.value = false
  stopped.value = false
  results.value = []
  total.value = 0
  current.value = 0
  currentSearchTerm.value = ''
  statusMessage.value = 'Cleared. Ready to scrape.'
}

function deleteResult(id: string) {
  const index = results.value.findIndex((r) => r.id === id)
  if (index > -1) {
    const deleted = results.value.splice(index, 1)[0]
    console.log(`[Papertrail] Deleted result: ${deleted.name}`)

    // Use selectedSearchTerm if available, fallback to currentSearchTerm
    const term = selectedSearchTerm.value || currentSearchTerm.value
    console.log(`[Papertrail] Deleting from term: "${term}", remaining: ${results.value.length}`)

    if (term) {
      if (results.value.length === 0) {
        // If no results left, remove the search term entirely
        localStorage.removeItem(`maps_results_${term}`)
        const termIndex = savedSearchTerms.value.findIndex((t) => t.term === term)
        if (termIndex > -1) {
          savedSearchTerms.value.splice(termIndex, 1)
        }
        console.log(`[Papertrail] Removed empty search term from storage: "${term}"`)
      } else {
        // Save the updated results directly to localStorage
        const storageKey = `maps_results_${term}`
        localStorage.setItem(storageKey, JSON.stringify(results.value))
        console.log(`[Papertrail] Saved ${results.value.length} results to localStorage: ${storageKey}`)
        updateSearchTermsList(term, results.value.length)
      }
    } else {
      console.warn('[Papertrail] No search term found when deleting result')
    }

    // Close the modal after deletion
    selectedListing.value = null
  }
}

function confirmDeleteSearchTerm(term: string) {
  confirmDeleteTerm.value = term
}

function deleteSearchTermConfirmed() {
  if (confirmDeleteTerm.value) {
    deleteSearchTerm(confirmDeleteTerm.value)
  }
}

function deleteSearchTerm(term: string) {
  // Remove from localStorage
  localStorage.removeItem(`maps_results_${term}`)
  console.log(`[Papertrail] Deleted search term: "${term}"`)

  // Remove from search terms list
  const index = savedSearchTerms.value.findIndex((t) => t.term === term)
  if (index > -1) {
    savedSearchTerms.value.splice(index, 1)
  }

  // If this was the selected term, clear the results and update UI
  if (currentSearchTerm.value === term) {
    results.value = []
    currentSearchTerm.value = ''
    selectedSearchTerm.value = ''
    total.value = 0
    current.value = 0
    statusMessage.value = 'Ready. Click Start Scrape to collect Google Maps listings.'
  }

  confirmDeleteTerm.value = null
}

async function copyJson() {
  const json = JSON.stringify(results.value, null, 2)
  try {
    await navigator.clipboard.writeText(json)
    statusMessage.value = 'JSON copied to clipboard.'
  } catch {
    console.log(json)
    statusMessage.value = 'Clipboard blocked. JSON printed to console.'
  }
}

function downloadFile(filename, content, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function downloadJson() {
  downloadFile(
    `google-maps-results-${Date.now()}.json`,
    JSON.stringify(results.value, null, 2),
    'application/json;charset=utf-8'
  )
  statusMessage.value = 'JSON downloaded.'
}

function downloadCsv() {
  const rows = [
    ['name', 'phone', 'website', 'websiteUrl', 'address', 'id'],
    ...results.value.map(item => [
      item.name,
      item.phone,
      item.website,
      item.websiteUrl,
      item.address,
      item.id
    ])
  ]

  const csv = rows
    .map(row => row.map(value => `"${String(value ?? '').replaceAll('"', '""')}"`).join(','))
    .join('\n')

  downloadFile(`google-maps-results-${Date.now()}.csv`, csv, 'text/csv;charset=utf-8')
  statusMessage.value = 'CSV downloaded.'
}

function startResize(e) {
  isResizing.value = true
  resizeStartX.value = e.clientX
}

function stopResize() {
  isResizing.value = false
}

function handleResize(e) {
  if (!isResizing.value) return

  const container = e.currentTarget
  const containerWidth = container.clientWidth
  const deltaX = e.clientX - resizeStartX.value

  const newWidth = (searchPanelWidth.value * containerWidth + deltaX) / containerWidth
  const clampedWidth = Math.max(15, Math.min(60, newWidth))

  searchPanelWidth.value = clampedWidth
  resizeStartX.value = e.clientX
}
</script>

<style scoped>
    :root {
    --page: #ffffff;
    --panel: #f9f9fc;
    --panel-2: #f0f1f7;
    --panel-3: #e8eaf5;
    --border: rgba(0, 0, 0, .08);
    --border-strong: rgba(0, 0, 0, .12);
    --text: #1f2937;
    --muted: #6b7280;
    --muted-2: #9ca3af;
    --blue: #3b82f6;
    --blue-soft: rgba(59, 130, 246, .1);
    --green: #10b981;
    --danger: #ef4444;
    --warning: #f59e0b;
    --radius: 18px;
    }

    * {
    box-sizing: border-box;
    }

    .scraper-shell {
    width: 100%;
    height: 100%;
    background: #ffffff;
    border: 1px solid var(--border-strong);
    border-radius: 28px;
    overflow: hidden;
    display: grid;
    grid-template-rows: auto 1fr auto;
    }

    .scraper-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 18px;
    border-bottom: 1px solid var(--border);
    background: #f9f9f9;
    }

    .title-group {
    min-width: 0;
    }

    .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--muted);
    font-size: 11px;
    font-weight: 750;
    letter-spacing: .08em;
    text-transform: uppercase;
    margin-bottom: 5px;
    }

    .eyebrow-dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: var(--green);
    box-shadow: 0 0 0 4px rgba(16, 185, 129, .2), 0 0 8px rgba(16, 185, 129, .6);
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }

    @keyframes pulse {
    0%, 100% {
        opacity: 1;
        box-shadow: 0 0 0 4px rgba(16, 185, 129, .2), 0 0 8px rgba(16, 185, 129, .6);
    }
    50% {
        opacity: 0.8;
        box-shadow: 0 0 0 6px rgba(16, 185, 129, .1), 0 0 12px rgba(16, 185, 129, .4);
    }
    }

    h1 {
    margin: 0;
    font-size: clamp(22px, 3vw, 31px);
    letter-spacing: -.04em;
    line-height: 1.05;
    }

    .top-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex: 0 0 auto;
    }

    .export-wrap {
    position: relative;
    }

    .export-button,
    .icon-button,
    .button {
    border: 1px solid var(--border-strong);
    color: var(--text);
    background: #f3f4f6;
    border-radius: 10px;
    height: 44px;
    padding: 0 13px;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    }

    .export-button {
    min-width: 130px;
    background: #ffffff;
    border: 1.5px solid var(--border-strong);
    box-shadow: 0 1px 2px rgba(0, 0, 0, .05);
    font-weight: 600;
    }

    .export-button:hover {
    background: #f9fafb;
    border-color: var(--blue);
    box-shadow: 0 2px 6px rgba(0, 0, 0, .08);
    }

    .icon-button {
    width: 44px;
    padding: 0;
    font-size: 20px;
    line-height: 1;
    background: transparent;
    border: none;
    color: var(--muted);
    }

    .icon-button:hover {
    color: var(--text);
    background: #f3f4f6;
    }

    .export-button {
    min-width: 148px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    }

    .export-menu {
    position: absolute;
    right: 0;
    top: calc(100% + 8px);
    width: 190px;
    background: #ffffff;
    border: 1px solid var(--border-strong);
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, .08);
    padding: 7px;
    display: none;
    z-index: 10;
    }

    .export-menu.open {
    display: block;
    }

    .export-menu button {
    width: 100%;
    border: 0;
    background: transparent;
    color: var(--text);
    text-align: left;
    padding: 10px 11px;
    border-radius: 11px;
    font-size: 13px;
    cursor: pointer;
    }

    .export-menu button:hover {
    background: #f5f5f5;
    }

    .icon-button {
    width: 42px;
    padding: 0;
    font-size: 18px;
    line-height: 1;
    }

    .scraper-main {
    min-height: 0;
    padding: 16px;
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: auto 4px 1fr;
    gap: 0;
    overflow: hidden;
    }

    .search-panel {
    animation: slideIn 0.3s cubic-bezier(0.2, 0, 0, 1) forwards;
    transform-origin: left;
    }

    .resize-divider {
    width: 4px;
    background: transparent;
    cursor: col-resize;
    user-select: none;
    transition: background 0.2s ease;
    }

    .resize-divider:hover {
    background: var(--blue);
    }

    @keyframes slideIn {
    from {
        opacity: 0;
        width: 0;
        min-width: 0;
    }
    to {
        opacity: 1;
        width: auto;
        min-width: 210px;
    }
    }

    .search-panel-body {
    padding: 14px;
    overflow: auto;
    flex: 1;
    min-height: 0;
    }

    .card {
    min-height: 0;
    min-width: 0;
    background: #ffffff;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    }

    .card:last-child {
    flex: 1;
    min-width: 0;
    }

    .card-header {
    padding: 14px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    }

    .card-title {
    margin: 0;
    font-size: 13px;
    font-weight: 850;
    letter-spacing: -.01em;
    }

    .card-subtitle {
    margin-top: 3px;
    color: var(--muted-2);
    font-size: 11px;
    line-height: 1.35;
    }

    .field-label {
    display: block;
    color: var(--muted);
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: .06em;
    margin-bottom: 8px;
    }

    .input,
    .select {
    width: 100%;
    height: 44px;
    border: 1.5px solid var(--border-strong);
    background: #ffffff;
    color: var(--text);
    border-radius: 10px;
    padding: 0 13px;
    font-size: 13px;
    outline: none;
    transition: all 0.2s ease;
    font-weight: 500;
    }

    .input:hover,
    .select:hover {
    border-color: var(--blue);
    background: #f9fbff;
    }

    .input:focus,
    .select:focus {
    border-color: var(--blue);
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, .1);
    }

    .select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%233b82f6' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 10px center;
    padding-right: 32px;
    }

    .field {
    margin-bottom: 13px;
    }

    .search-history {
    display: flex;
    flex-direction: column;
    height: 100%;
    }

    .history-empty {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: var(--muted-2);
    font-size: 13px;
    text-align: center;
    padding: 20px;
    }

    .history-empty p {
    margin: 0;
    }

    .history-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    }

    .history-item-wrapper {
    display: grid;
    grid-template-columns: 1fr auto auto;
    gap: 6px;
    align-items: stretch;
    }

    .history-item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 10px 12px;
    background: #f9f9fc;
    border: 1px solid var(--border);
    border-radius: 10px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-align: left;
    font-size: 13px;
    color: var(--text);
    border: none;
    }

    .history-load-btn {
    padding: 10px 8px;
    background: #f9f9fc;
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    }

    .history-load-btn:hover {
    background: #eff6ff;
    border-color: var(--blue);
    color: var(--blue);
    }

    .history-delete-btn {
    padding: 10px 8px;
    background: #fef2f2;
    border: 1px solid var(--border);
    border-radius: 10px;
    color: var(--text);
    cursor: pointer;
    font-size: 14px;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    }

    .history-delete-btn:hover {
    background: #fee2e2;
    border-color: #ef4444;
    color: #ef4444;
    }

    .history-item:hover {
    background: #f0f1f7;
    border-color: var(--blue);
    }

    .history-item.active {
    background: #eff6ff;
    border: 1.5px solid var(--blue);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, .1);
    }

    .history-query {
    font-weight: 600;
    color: var(--text);
    line-height: 1.3;
    }

    .history-meta {
    font-size: 11px;
    color: var(--muted-2);
    }

    .results-tools {
    display: flex;
    align-items: center;
    gap: 12px;
    color: var(--muted-2);
    font-size: 12px;
    }

    .results-table-wrapper {
    overflow: auto;
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    }

    .results-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    }

    .results-table thead {
    position: sticky;
    top: 0;
    background: #f9f9fc;
    border-bottom: 2px solid var(--border-strong);
    z-index: 10;
    }

    .table-header {
    padding: 10px 12px;
    text-align: left;
    font-weight: 700;
    color: var(--muted);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    white-space: nowrap;
    user-select: none;
    border-bottom: 2px solid var(--border-strong);
    }

    .table-header.sortable {
    cursor: pointer;
    transition: all 0.2s ease;
    }

    .table-header.sortable:hover {
    background: rgba(59, 130, 246, .05);
    color: var(--blue);
    }

    .header-content {
    display: flex;
    align-items: center;
    gap: 6px;
    }

    .sort-indicator {
    font-size: 10px;
    opacity: 0.5;
    transition: opacity 0.2s;
    }

    .table-header.sortable:hover .sort-indicator {
    opacity: 1;
    }

    .results-table tbody tr {
    border-bottom: 1px solid var(--border);
    transition: background-color 0.15s ease;
    }

    .results-table tbody tr:hover {
    background: #f9f9fc;
    }

    .result-row--highlight {
    animation: rowHighlight 1.5s ease-out;
    }

    @keyframes rowHighlight {
    0% {
        background: #fffacd;
        box-shadow: inset 0 0 8px rgba(255, 215, 0, 0.6);
    }
    100% {
        background: transparent;
        box-shadow: none;
    }
    }

    .results-table td {
    padding: 11px 12px;
    color: var(--text);
    vertical-align: middle;
    }

    .col-index {
    width: 40px;
    text-align: center;
    font-weight: 600;
    color: var(--blue);
    }

    .col-name {
    font-weight: 600;
    min-width: 180px;
    }

    .col-address {
    font-size: 12px;
    color: var(--muted);
    min-width: 200px;
    }

    .col-phone {
    font-size: 12px;
    min-width: 120px;
    }

    .col-website {
    min-width: 140px;
    }

    .col-website a {
    color: var(--blue);
    text-decoration: none;
    transition: color 0.2s;
    }

    .col-website a:hover {
    color: #2563eb;
    text-decoration: underline;
    }

    .col-id {
    font-size: 11px;
    color: var(--muted-2);
    font-family: 'Courier New', monospace;
    min-width: 180px;
    }

    .result-row {
    cursor: pointer;
    }

    /* Modal Styles */
    .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    }

    .modal {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    max-width: 500px;
    width: 90%;
    max-height: 80vh;
    overflow-y: auto;
    }

    .modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px;
    border-bottom: 1px solid var(--border);
    }

    .modal-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: var(--text);
    }

    .modal-close {
    background: transparent;
    border: none;
    font-size: 24px;
    color: var(--muted);
    cursor: pointer;
    padding: 0;
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    transition: all 0.2s ease;
    }

    .modal-close:hover {
    background: #f5f5f5;
    color: var(--text);
    }

    .modal-body {
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    }

    .detail-row {
    display: grid;
    grid-template-columns: 100px 1fr;
    gap: 12px;
    }

    .detail-label {
    font-weight: 600;
    color: var(--muted);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    }

    .detail-value {
    color: var(--text);
    font-size: 14px;
    word-break: break-word;
    }

    .detail-value a {
    color: var(--blue);
    text-decoration: none;
    }

    .detail-value a:hover {
    text-decoration: underline;
    }

    .detail-monospace {
    font-family: 'Courier New', monospace;
    font-size: 12px;
    }

    .confirm-text {
    margin: 0 0 8px;
    color: var(--text);
    font-size: 14px;
    line-height: 1.5;
    }

    .confirm-warning {
    margin: 0;
    color: var(--muted-2);
    font-size: 12px;
    }

    .modal-footer {
    display: flex;
    gap: 8px;
    padding: 16px 20px;
    border-top: 1px solid var(--border);
    justify-content: flex-end;
    }

    .modal-delete {
    background: #ef4444;
    color: #ffffff;
    border: none;
    padding: 10px 18px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    box-shadow: 0 2px 4px rgba(239, 68, 68, 0.2);
    }

    .modal-delete:hover {
    background: #dc2626;
    box-shadow: 0 4px 8px rgba(239, 68, 68, 0.3);
    }

    .modal-close-btn {
    background: #f3f4f6;
    color: #1f2937;
    border: 1px solid #e5e7eb;
    padding: 10px 18px;
    border-radius: 6px;
    font-weight: 600;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s ease;
    }

    .modal-close-btn:hover {
    background: #e5e7eb;
    border-color: #3b82f6;
    color: #1f2937;
    }

    .empty-state {
    min-height: 280px;
    display: grid;
    place-items: center;
    text-align: center;
    color: var(--muted);
    padding: 30px;
    border: 1px dashed var(--border-strong);
    border-radius: 18px;
    background: #f9f9f9;
    }

    .empty-state strong {
    display: block;
    color: var(--text);
    font-size: 15px;
    margin-bottom: 5px;
    }

    .scraper-footer {
    border-top: 1px solid var(--border);
    padding: 14px 16px;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 14px;
    align-items: center;
    background: #f9f9f9;
    }

    .footer-left {
    min-width: 0;
    }

    .status-line {
    color: #666666;
    font-size: 12px;
    margin-bottom: 9px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    }

    .progress {
    height: 6px;
    background: #e5e7eb;
    border-radius: 999px;
    overflow: hidden;
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, .05);
    }

    .progress-bar {
    width: 0%;
    height: 100%;
    background: linear-gradient(90deg, #3b82f6, #2563eb);
    transition: width .3s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 0 8px rgba(59, 130, 246, .4);
    }

    .footer-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    }

    .scrape-option {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--muted);
    cursor: pointer;
    user-select: none;
    }

    .scrape-option input[type='checkbox'] {
    cursor: pointer;
    width: 14px;
    height: 14px;
    }

    .button {
    min-width: 100px;
    background: #3b82f6;
    border: none;
    color: #ffffff;
    font-weight: 600;
    font-size: 13px;
    transition: all 0.25s cubic-bezier(0.2, 0, 0, 1);
    box-shadow: 0 2px 8px rgba(59, 130, 246, .3);
    position: relative;
    overflow: hidden;
    }

    .button:hover:not(:disabled) {
    background: #2563eb;
    box-shadow: 0 4px 12px rgba(59, 130, 246, .4);
    transform: translateY(-1px);
    }

    .button:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 1px 3px rgba(59, 130, 246, .2);
    }

    .button.secondary {
    background: #ffffff;
    border-color: var(--border-strong);
    color: var(--text);
    box-shadow: 0 1px 2px rgba(0, 0, 0, .05);
    }

    .button.secondary:hover:not(:disabled) {
    background: #f3f4f6;
    border-color: var(--blue);
    color: var(--blue);
    box-shadow: 0 2px 4px rgba(0, 0, 0, .08);
    }

    .button.secondary:active:not(:disabled) {
    background: #e5e7eb;
    }

    .button.danger {
    background: #ef4444;
    border: none;
    color: #ffffff;
    box-shadow: 0 2px 8px rgba(239, 68, 68, .3);
    }

    .button.danger:hover:not(:disabled) {
    background: #dc2626;
    box-shadow: 0 4px 12px rgba(239, 68, 68, .4);
    transform: translateY(-1px);
    }

    .button.danger:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 1px 3px rgba(239, 68, 68, .2);
    }

    .button:disabled,
    .export-menu button:disabled {
    opacity: .45;
    cursor: not-allowed;
    }

    @media (max-width: 760px) {
    .scraper-topbar,
    .scraper-footer {
        grid-template-columns: 1fr;
    }

    .scraper-topbar {
        align-items: stretch;
        flex-direction: column;
    }

    .top-actions,
    .footer-actions {
        width: 100%;
    }

    .export-wrap,
    .export-button,
    .button {
        flex: 1;
    }

    .export-menu {
        left: 0;
        right: auto;
        width: 100%;
    }

    .scraper-main {
        grid-auto-columns: minmax(210px, 270px) 4px minmax(0, 1fr);
        padding: 14px;
        overflow: hidden;
    }

    .results-list {
        max-height: 420px;
    }

    .result-row {
        grid-template-columns: 36px minmax(0, 1fr);
    }

    .result-badge {
        grid-column: 2;
    }
    }
</style>

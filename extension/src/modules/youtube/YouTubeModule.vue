<template>
  <div class="youtube-module">
    <div class="module-heading">YouTube</div>

    <div v-if="tab" class="site-info">
      <img v-if="tab.favIconUrl" :src="tab.favIconUrl" class="favicon" alt="favicon" />
      <div class="site-details">
        <div class="site-title">{{ tab.title }}</div>
        <a :href="tab.url" class="site-url" target="_blank">{{ tab.url }}</a>
      </div>
    </div>
    <div v-else class="loading">Loading tab info...</div>

    <!-- Extracted Data Display (Primary) -->
    <div v-if="extractedData" class="extracted-data-primary">
      <!-- Channel Data -->
      <div v-if="isChannelData" class="data-section">
        <div class="data-header">
          <h3 class="data-heading">✓ Channel Data Extracted</h3>
          <span class="badge">Live</span>
        </div>
        <div class="data-grid">
          <div v-if="extractedData.channelName" class="data-item">
            <span class="label">Channel:</span>
            <span class="value channel-name">{{ extractedData.channelName }}</span>
          </div>
          <div v-if="extractedData.channelHandle" class="data-item">
            <span class="label">Handle:</span>
            <span class="value">{{ extractedData.channelHandle }}</span>
          </div>
          <div v-if="extractedData.subscriberCount" class="data-item">
            <span class="label">Subscribers:</span>
            <span class="value highlight">{{ extractedData.subscriberCount }}</span>
          </div>
          <div v-if="extractedData.videoCount" class="data-item">
            <span class="label">Videos:</span>
            <span class="value">{{ extractedData.videoCount }}</span>
          </div>
          <div v-if="extractedData.description" class="data-item full-width">
            <span class="label">Description:</span>
            <p class="value description">{{ extractedData.description }}</p>
          </div>
          <div v-if="extractedData.location" class="data-item">
            <span class="label">Location:</span>
            <span class="value">{{ extractedData.location }}</span>
          </div>
          <div v-if="extractedData.joinedDate" class="data-item">
            <span class="label">Joined:</span>
            <span class="value">{{ extractedData.joinedDate }}</span>
          </div>
          <div v-if="extractedData.externalLinks && extractedData.externalLinks.length > 0" class="data-item full-width">
            <span class="label">Links:</span>
            <div class="links-list">
              <a
                v-for="(link, idx) in extractedData.externalLinks"
                :key="idx"
                :href="link.url"
                target="_blank"
                class="external-link"
              >
                {{ link.title || link.url }}
              </a>
            </div>
          </div>
        </div>
      </div>

      <!-- Video Data -->
      <div v-if="isVideoData" class="data-section">
        <div class="data-header">
          <h3 class="data-heading">✓ Video Data Extracted</h3>
          <span class="badge">Live</span>
        </div>
        <div class="data-grid">
          <div v-if="extractedData.videoTitle" class="data-item full-width">
            <span class="label">Title:</span>
            <span class="value video-title">{{ extractedData.videoTitle }}</span>
          </div>
          <div v-if="extractedData.viewCount" class="data-item">
            <span class="label">Views:</span>
            <span class="value highlight">{{ extractedData.viewCount }}</span>
          </div>
          <div v-if="extractedData.uploadDate" class="data-item">
            <span class="label">Uploaded:</span>
            <span class="value">{{ extractedData.uploadDate }}</span>
          </div>
          <div v-if="extractedData.channelName" class="data-item">
            <span class="label">Channel:</span>
            <span class="value">{{ extractedData.channelName }}</span>
          </div>
          <div v-if="extractedData.description" class="data-item full-width">
            <span class="label">Description:</span>
            <p class="value description">{{ extractedData.description }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Capture Controls -->
    <div v-if="isYouTubePage" class="capture-section">
      <div class="capture-heading">Capture</div>
      <div class="button-group">
        <button
          @click="togglePassiveCapture"
          :class="['capture-btn', passiveActive ? 'active' : '']"
        >
          {{ passiveActive ? '⏹ Stop Capture' : '▶ Start Capture' }}
        </button>
        <button @click="refreshData" class="refresh-btn">🔄 Refresh</button>
      </div>
      <div v-if="captureStatus" class="status-text">{{ captureStatus }}</div>
    </div>

    <!-- Sync Section -->
    <div v-if="extractedData && isYouTubePage" class="sync-section">
      <div class="sync-heading">Sync to Papertrail</div>
      <div class="sync-controls">
        <select v-model="selectedProjectId" class="project-select" :disabled="syncState.isSyncing.value">
          <option value="">Select project...</option>
          <option v-for="project in projects" :key="project.id" :value="project.id">
            {{ project.name }}
          </option>
        </select>
        <button
          @click="handleSync"
          class="sync-button"
          :disabled="syncState.isSyncing.value || !extractedData"
        >
          <span v-if="syncState.isSyncing.value" class="spinner">⟳</span>
          {{ syncState.isSyncing.value ? 'Syncing...' : 'Sync Data' }}
        </button>
      </div>
      <div v-if="syncState.syncMessage.value" class="sync-message success">
        {{ syncState.syncMessage.value }}
      </div>
      <div v-if="syncState.syncError.value" class="sync-message error">
        ✗ {{ syncState.syncError.value }}
      </div>
    </div>

    <!-- Coming Soon Features -->
    <div class="coming-soon-section">
      <div class="section-title">Planned Features</div>
      <div v-for="group in featureGroups" :key="group.name" class="feature-group">
        <div class="group-heading">{{ group.name }}</div>
        <div class="features-list">
          <div v-for="(feature, idx) in group.features" :key="idx" class="feature-row">
            <span class="feature-label">{{ feature }}</span>
            <span class="coming-soon-badge">Coming Soon</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useSyncObservations } from '@/composables/useSyncObservations'
import { createChannelObservation, createVideoObservation, isChannelPage, isVideoPage } from '@/modules/youtube/scraper'

const tab = ref<chrome.tabs.Tab | null>(null)
const captureStatus = ref('')
const extractedData = ref<any>(null)
const passiveActive = ref(false)
const selectedProjectId = ref('')
const projects = ref<Array<{ id: string; name: string }>>([])
const syncState = useSyncObservations()
let extractInterval: NodeJS.Timeout | null = null

// localStorage utilities
function getStorageKey(url?: string) {
  const pageUrl = url || tab.value?.url || ''
  return `papertrail_youtube_${pageUrl}`
}

function saveToStorage(data: any) {
  if (data) {
    const key = getStorageKey()
    localStorage.setItem(key, JSON.stringify(data))
    console.log('[Papertrail] Data saved to localStorage:', key)
  }
}

function loadFromStorage() {
  const key = getStorageKey()
  try {
    const stored = localStorage.getItem(key)
    if (stored) {
      const data = JSON.parse(stored)
      extractedData.value = data
      console.log('[Papertrail] Data loaded from localStorage:', key)
      captureStatus.value = 'Loaded from cache'
      return true
    }
  } catch (e) {
    console.warn('[Papertrail] Failed to load from localStorage:', e)
  }
  return false
}

// Determine data type based on extracted properties
const isChannelData = computed(() => {
  return extractedData.value && (extractedData.value.channelHandle || extractedData.value.subscriberCount)
})

const isVideoData = computed(() => {
  return extractedData.value && (extractedData.value.videoTitle || extractedData.value.viewCount)
})

// Check if we're on a YouTube page by URL
const isYouTubePage = computed(() => {
  return tab.value?.url?.includes('youtube.com')
})

const featureGroups = [
  {
    name: 'Channel',
    features: [
      'Channel name, handle & subscriber count',
      'Total video count and view count',
      'Channel description and links',
      'Contact info from the About tab'
    ]
  },
  {
    name: 'Video',
    features: [
      'Title, view count, likes & publish date',
      'Description and hashtags',
      'Comment scraping (top comments)',
      'Video transcript / auto-captions'
    ]
  },
  {
    name: 'Search Results',
    features: [
      'Scrape video results for a keyword',
      'Extract titles, channels, view counts & dates'
    ]
  },
  {
    name: 'Playlists',
    features: [
      'All videos in a playlist with metadata'
    ]
  },
  {
    name: 'Channel Users',
    features: [
      'Scrape top comments across latest videos',
      'Community tab comments and engagement',
      'Channel members list (if available)',
      'Video collaborators and mentioned users',
      'Extract usernames and channel links'
    ]
  }
]

async function fetchExtractedData() {
  // Always query for the active tab to ensure we're fetching from the current page
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
  const activeTab = tabs[0]

  if (!activeTab?.id) {
    console.log('[Papertrail] No active tab found')
    return
  }

  // Update tab reference
  tab.value = activeTab

  try {
    console.log('[Papertrail] Scraping tab', activeTab.id)
    const response = await chrome.tabs.sendMessage(activeTab.id, {
      type: 'GET_YOUTUBE_DATA',
    })
    console.log('[Papertrail] Data received:', response)
    if (response) {
      extractedData.value = response
      saveToStorage(response)

      // Update status with what we found
      const found = []
      if (response.channelName) found.push('channel')
      if (response.location) found.push('location')
      if (response.joinedDate) found.push('joined')

      let linkInfo = ''
      if (response.externalLinks?.length) {
        const linkTitles = response.externalLinks.slice(0, 3).map((l: any) => l.title || l.url).join(', ')
        linkInfo = `links: ${linkTitles}${response.externalLinks.length > 3 ? '...' : ''}`
        found.push(linkInfo)
      }

      if (found.length > 0) {
        captureStatus.value = `Found: ${found.join(', ')}`
      }
    } else {
      console.log('[Papertrail] Empty response from tab', activeTab.id)
    }
  } catch (e) {
    console.error('[Papertrail] Failed to fetch data from tab', activeTab.id, ':', e)
  }
}

function togglePassiveCapture() {
  passiveActive.value = !passiveActive.value
  if (passiveActive.value) {
    captureStatus.value = 'Scraping...'
    chrome.tabs.sendMessage(tab.value?.id!, { type: 'ACTIVATE_PASSIVE', active: true })

    // Poll for data while capturing
    if (extractInterval) clearInterval(extractInterval)
    extractInterval = setInterval(() => {
      fetchExtractedData()
    }, 1000)

    // Get data immediately
    fetchExtractedData()
  } else {
    chrome.tabs.sendMessage(tab.value?.id!, { type: 'ACTIVATE_PASSIVE', active: false })
    if (extractInterval) {
      clearInterval(extractInterval)
      extractInterval = null
    }
  }
}

async function refreshData() {
  console.log('[Papertrail] Manual refresh triggered')
  captureStatus.value = 'Scraping...'
  extractedData.value = null

  // Clear old interval if exists
  if (extractInterval) {
    clearInterval(extractInterval)
    extractInterval = null
  }

  // Fetch immediately
  await fetchExtractedData()

  // Retry for About details
  let retryCount = 0
  const retryInterval = setInterval(async () => {
    retryCount++
    if (retryCount > 5) {
      clearInterval(retryInterval)
      return
    }

    if (extractedData.value && extractedData.value.channelName && !extractedData.value.location) {
      console.log('[Papertrail] Refresh retry', retryCount)
      await fetchExtractedData()
    } else if (!extractedData.value) {
      await fetchExtractedData()
    } else {
      clearInterval(retryInterval)
    }
  }, 800)
}

async function loadProjects() {
  try {
    const response = await fetch('http://localhost/api/projects', {
      headers: { 'Content-Type': 'application/json' },
    })
    if (response.ok) {
      projects.value = await response.json()
      console.log('[Papertrail] Loaded projects:', projects.value)
    }
  } catch (err) {
    console.error('[Papertrail] Failed to load projects:', err)
  }
}

async function handleSync() {
  if (!extractedData.value) return

  console.log('[Papertrail] Creating observation from data:', extractedData.value)
  console.log('[Papertrail] isChannelPage:', isChannelPage())
  console.log('[Papertrail] isVideoPage:', isVideoPage())

  // Create observation from extracted data
  const observation = isChannelPage()
    ? createChannelObservation(extractedData.value)
    : isVideoPage()
      ? createVideoObservation(extractedData.value)
      : null

  console.log('[Papertrail] Created observation:', observation)

  if (!observation) {
    syncState.syncError.value = 'Failed to create observation from data'
    console.error('[Papertrail] Observation creation failed - data:', extractedData.value)
    return
  }

  // Sync with project if selected, otherwise sync without project
  const projectId = selectedProjectId.value || null
  await syncState.handleSync(projectId, [observation as unknown as Record<string, unknown>])
}

onMounted(async () => {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
  tab.value = activeTab ?? null

  // Load projects and cached data
  if (activeTab?.id) {
    console.log('[Papertrail] Component mounted')
    loadFromStorage()
    await loadProjects()
  }

  let lastUrl = tab.value?.url

  // Listen for tab updates (URL changes)
  const onTabUpdated = (_tabId: number, _changeInfo: chrome.tabs.TabChangeInfo, updatedTab: chrome.tabs.Tab) => {
    if (updatedTab.active && updatedTab.url && updatedTab.url !== lastUrl) {
      lastUrl = updatedTab.url
      if (updatedTab.url.includes('youtube.com')) {
        console.log('[Papertrail] YouTube URL changed', updatedTab.url)
        extractedData.value = null
        passiveActive.value = false
        if (extractInterval) {
          clearInterval(extractInterval)
          extractInterval = null
        }
        // Load cached data for new URL
        loadFromStorage()
      }
    }
  }

  // Listen for tab activation (switching between tabs)
  const onTabActivated = (activeInfo: any) => {
    chrome.tabs.get(activeInfo.tabId, (updatedTab) => {
      if (updatedTab.url?.includes('youtube.com') && updatedTab.url !== lastUrl) {
        lastUrl = updatedTab.url
        console.log('[Papertrail] YouTube tab activated', updatedTab.url)
        extractedData.value = null
        passiveActive.value = false
        if (extractInterval) {
          clearInterval(extractInterval)
          extractInterval = null
        }
        // Load cached data for new URL
        loadFromStorage()
      }
    })
  }

  chrome.tabs.onUpdated.addListener(onTabUpdated)
  chrome.tabs.onActivated.addListener(onTabActivated)
})

onUnmounted(() => {
  if (extractInterval) {
    clearInterval(extractInterval)
  }
  // Clean up listeners
  chrome.tabs.onUpdated.removeListener(() => {})
  chrome.tabs.onActivated.removeListener(() => {})
})
</script>

<style scoped>
.youtube-module {
  padding: 8px 16px 16px 16px;
}

.module-heading {
  font-weight: 600;
  font-size: 15px;
  color: #202124;
  margin-bottom: 12px;
}

.site-info {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.favicon {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 4px;
}

.site-details {
  flex: 1;
  min-width: 0;
}

.site-title {
  font-weight: 500;
  font-size: 14px;
  color: #333;
  margin-bottom: 4px;
  word-break: break-word;
}

.site-url {
  font-size: 12px;
  color: #666;
  text-decoration: none;
  word-break: break-all;
}

.site-url:hover {
  text-decoration: underline;
}

.loading {
  padding: 20px;
  text-align: center;
  color: #999;
  font-size: 14px;
}

.capture-section {
  margin-top: 16px;
  padding: 12px;
  background: #f9f9f9;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
}

.capture-heading {
  font-weight: 600;
  font-size: 13px;
  color: #202124;
  margin-bottom: 8px;
}

.button-group {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.capture-btn {
  padding: 6px 12px;
  background: #1f2937;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
  flex: 1;
}

.capture-btn:hover {
  background: #111827;
}

.capture-btn.active {
  background: #dc2626;
}

.refresh-btn {
  padding: 6px 10px;
  background: #0ea5e9;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}

.refresh-btn:hover {
  background: #0284c7;
}

.status-text {
  margin-top: 8px;
  font-size: 12px;
  color: #666;
}

.extracted-data-primary {
  margin-top: 12px;
  margin-bottom: 16px;
  max-height: 500px;
  overflow-y: auto;
}

.data-section {
  background: linear-gradient(135deg, #f0f7ff 0%, #f9f9f9 100%);
  border: 2px solid #3b82f6;
  border-radius: 8px;
  padding: 14px;
  margin-bottom: 12px;
}

.data-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.data-heading {
  font-weight: 700;
  font-size: 14px;
  color: #1f2937;
  margin: 0;
}

.badge {
  display: inline-block;
  background: #10b981;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 3px;
}

.data-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.data-item {
  display: flex;
  gap: 12px;
  font-size: 13px;
  align-items: flex-start;
}

.data-item.full-width {
  flex-direction: column;
  gap: 6px;
}

.label {
  font-weight: 600;
  color: #4b5563;
  flex-shrink: 0;
  min-width: 85px;
}

.value {
  color: #1f2937;
  word-break: break-word;
  flex: 1;
  line-height: 1.4;
}

.value.channel-name {
  font-weight: 600;
  color: #0ea5e9;
}

.value.video-title {
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
}

.value.highlight {
  font-weight: 700;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 2px 4px;
  border-radius: 3px;
}

.value.description {
  padding: 8px 10px;
  background: white;
  border-radius: 4px;
  border-left: 3px solid #3b82f6;
  margin-top: 4px;
  line-height: 1.5;
  max-height: 100px;
  overflow-y: auto;
  font-size: 12px;
  color: #374151;
}

.value.description p {
  margin: 0;
}

.links-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 4px;
}

.external-link {
  font-size: 12px;
  color: #3b82f6;
  text-decoration: none;
  padding: 4px 6px;
  border-radius: 3px;
  background: rgba(59, 130, 246, 0.1);
  display: inline-block;
  width: fit-content;
  transition: background 0.2s;
}

.external-link:hover {
  background: rgba(59, 130, 246, 0.2);
  text-decoration: underline;
}

.coming-soon-section {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 2px solid #e5e7eb;
}

.section-title {
  font-weight: 700;
  font-size: 13px;
  color: #6b7280;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.feature-group {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 10px;
}

.group-heading {
  font-weight: 600;
  font-size: 13px;
  color: #202124;
  margin-bottom: 8px;
}

.features-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.feature-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.feature-label {
  font-size: 12px;
  color: #555;
  flex: 1;
  min-width: 0;
}

.coming-soon-badge {
  font-size: 11px;
  color: #999;
  font-style: italic;
  white-space: nowrap;
  flex-shrink: 0;
}
</style>

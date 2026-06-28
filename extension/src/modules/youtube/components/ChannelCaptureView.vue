<template>
  <div class="channel-view">

    <!-- Header bar -->
    <div class="topbar">
      <span class="breadcrumb">YouTube / Channel</span>
      <button class="back-btn" @click="goToDashboard">← Dashboard</button>
    </div>

    <!-- Loading skeleton -->
    <div v-if="!currentChannel" class="channel-hero skeleton-hero">
      <div class="skeleton handle-skeleton"></div>
      <div class="skeleton subs-skeleton"></div>
    </div>

    <!-- Channel identity block -->
    <div v-else class="channel-hero">
      <div class="hero-left">
        <div class="channel-handle">{{ currentChannel.handle }}</div>
        <div class="channel-meta">
          <span v-if="currentChannel.subs > 0" class="subs">{{ formatSubs(currentChannel.subs) }} subscribers</span>
          <span class="hero-stats">
            <span class="stat-pill">👤 {{ totalLeads }}</span>
            <span class="stat-pill">🔗 {{ totalLinks }}</span>
          </span>
        </div>
      </div>
      <button
        v-if="!isSaved"
        class="save-btn"
        @click="handleSave"
        :disabled="saving"
        :title="saveError ?? undefined"
      >{{ saving ? '…' : saveError ? '!' : 'Save' }}</button>
      <span v-else class="saved-badge">✓ Saved</span>
    </div>

    <!-- Videos -->
    <div class="videos-section">
      <div class="section-label">Captured Videos</div>

      <div v-if="videos.length > 0" class="video-list">
        <a
          v-for="video in videos"
          :key="video.id"
          :href="video.url"
          target="_blank"
          class="video-row"
        >
          <span class="video-title">{{ video.title }}</span>
          <span class="video-stats">
            <span class="stat-pill small">👤 {{ video.commentersCount }}</span>
            <span class="stat-pill small">🔗 {{ video.linksCount }}</span>
          </span>
        </a>
      </div>

      <div v-else class="empty-videos">
        <div class="empty-icon">🎬</div>
        <div class="empty-text">No videos captured yet</div>
        <div class="empty-hint">Visit a video from this channel and capture it</div>
      </div>
    </div>

    <!-- Leads -->
    <div v-if="leads.length > 0" class="leads-section">
      <div class="section-label-row">
        <span class="section-label">Leads ({{ leads.length }})</span>
        <button class="export-btn" @click="handleExport" title="Export leads as CSV">↓ CSV</button>
      </div>

      <div class="lead-list">
        <div v-for="lead in leads" :key="lead.url" class="lead-row">
          <a :href="lead.url" target="_blank" class="lead-handle">{{ lead.handle || lead.name }}</a>
          <span v-if="lead.isVerified" class="verified">✓</span>
          <span class="lead-count">({{ lead.count }}×)</span>
          <select
            class="status-select"
            :value="lead.status"
            @change="updateStatus(lead.url, ($event.target as HTMLSelectElement).value as Commenter['status'])"
          >
            <option value="new">new</option>
            <option value="contacted">contacted</option>
            <option value="interested">interested</option>
            <option value="collaborated">collaborated</option>
            <option value="not_a_fit">not a fit</option>
          </select>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { getChannelData, saveChannelData, getChannels, updateLeadStatus, exportLeads } from '../storage'
import type { ChannelData, Video, Commenter } from '../storage'

const currentChannel = ref<{ handle: string; subs: number } | null>(null)
const currentChannelLinks = ref(0)
const saving = ref(false)
const saveError = ref<string | null>(null)

// Stored as a ref so Vue tracks it reactively when we update it imperatively.
const storedData = ref<ChannelData | null>(null)

function refreshStoredData() {
  storedData.value = currentChannel.value
    ? getChannelData(currentChannel.value.handle)
    : null
}

const videos = computed<Video[]>(() =>
  (storedData.value?.videos ?? []).filter((v) => v.url.startsWith('https://www.youtube.com/watch'))
)
const leads = computed<Commenter[]>(() =>
  [...(storedData.value?.uniqueCommenters ?? [])].sort((a, b) => {
    // verified first, then by count desc
    if (a.isVerified !== b.isVerified) return a.isVerified ? -1 : 1
    return b.count - a.count
  })
)
const totalLeads = computed(() => storedData.value?.uniqueCommenters?.length ?? 0)
const totalLinks = computed(() => {
  const saved = Object.keys(storedData.value?.channel?.links ?? {}).length
  return Math.max(saved, currentChannelLinks.value)
})

const isSaved = computed(() =>
  currentChannel.value ? getChannels().includes(currentChannel.value.handle) : false,
)

function formatSubs(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K'
  return n.toString()
}

function goToDashboard() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) chrome.tabs.update(tabs[0].id, { url: 'https://www.youtube.com/' })
  })
}

function updateStatus(url: string, status: Commenter['status']) {
  if (!currentChannel.value) return
  const data = getChannelData(currentChannel.value.handle)
  if (!data) return
  const lead = data.uniqueCommenters.find((c) => c.url === url)
  if (!lead) return
  updateLeadStatus(currentChannel.value.handle, lead.name, status)
  refreshStoredData()
}

function handleExport() {
  if (!currentChannel.value) return
  const csv = exportLeads(currentChannel.value.handle, 'low')
  if (!csv) return
  const blob = new Blob([csv], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `${currentChannel.value.handle.replace('@', '')}-leads.csv`
  a.click()
  URL.revokeObjectURL(a.href)
}

function handleSave() {
  if (!currentChannel.value) return
  saving.value = true
  saveError.value = null
  try {
    const existing = storedData.value
    saveChannelData({
      channel: {
        handle: currentChannel.value.handle,
        subs: currentChannel.value.subs,
        links: existing?.channel?.links ?? {},
      },
      allLinks: existing?.allLinks ?? [],
      uniqueCommenters: existing?.uniqueCommenters ?? [],
      videos: existing?.videos ?? [],
    })
    refreshStoredData()
    chrome.runtime.sendMessage({ action: 'dataSaved' }).catch(() => {})
  } catch (err) {
    saveError.value = err instanceof Error ? err.message : 'Save failed'
  } finally {
    saving.value = false
  }
}

function setCurrentChannel(handle: string, subs: number, links: Record<string, string>) {
  currentChannel.value = { handle, subs }
  currentChannelLinks.value = Object.keys(links).length
  refreshStoredData()
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function onMessage(request: any, sendResponse: (r: unknown) => void) {
  if (request.action === 'updateData' && request.data?.pageType === 'channel') {
    const profile = request.data.channelProfile
    if (profile) setCurrentChannel(profile.handle, profile.subs, request.data.channelLinks ?? {})
  }
  sendResponse({ success: true })
  return true
}

onMounted(() => {
  chrome.runtime.onMessage.addListener(onMessage as Parameters<typeof chrome.runtime.onMessage.addListener>[0])

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0]
    if (!activeTab?.id) return
    const tabUrl = activeTab.url ?? ''

    // Immediately load stored data from the URL handle — don't wait for the content script.
    const urlMatch = tabUrl.match(/@([\w.-]+)/)
    if (urlMatch) {
      const handle = `@${urlMatch[1]}`
      const stored = getChannelData(handle)
      if (stored) {
        currentChannel.value = { handle: stored.channel.handle, subs: stored.channel.subs }
        refreshStoredData()
      }
    }

    chrome.tabs.sendMessage(activeTab.id, { action: 'extractData' }, (response) => {
      if (chrome.runtime.lastError || !response?.data) return
      if (response.data.pageType === 'channel') {
        const profile = response.data.channelProfile
        const links = response.data.channelLinks ?? {}
        if (profile) {
          setCurrentChannel(profile.handle, profile.subs, links)
        } else {
          const m = tabUrl.match(/@([\w.-]+)/)
          if (m) setCurrentChannel(`@${m[1]}`, 0, links)
        }
      }
    })
  })
})

onUnmounted(() => {
  chrome.runtime.onMessage.removeListener(onMessage as Parameters<typeof chrome.runtime.onMessage.removeListener>[0])
})
</script>

<style scoped>
@import '../design-system.css';

/* ── Layout ─────────────────────────────── */

.channel-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--color-bg-primary);
}

/* ── Topbar ──────────────────────────────── */

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  border-bottom: 1px solid var(--color-border);
  background: var(--color-bg-secondary);
  flex-shrink: 0;
}

.breadcrumb {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--color-text-tertiary);
}

.back-btn {
  background: none;
  border: none;
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  cursor: pointer;
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  transition: background var(--transition-fast), color var(--transition-fast);
}
.back-btn:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

/* ── Channel Hero ────────────────────────── */

.channel-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 14px 12px;
  border-bottom: 1px solid var(--color-border);
  flex-shrink: 0;
  background: var(--color-bg-primary);
}

.hero-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.channel-handle {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-bold);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.channel-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.subs {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

.hero-stats {
  display: flex;
  gap: 4px;
}

.stat-pill {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
  background: var(--color-bg-tertiary);
  border-radius: 20px;
  padding: 1px 7px;
}

.stat-pill.small {
  font-size: var(--font-size-xs);
  padding: 1px 6px;
}

/* Save / Saved */

.save-btn {
  flex-shrink: 0;
  padding: 5px 12px;
  background: var(--yt-red);
  color: #fff;
  border: none;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-semibold);
  cursor: pointer;
  transition: background var(--transition-fast), opacity var(--transition-fast);
}
.save-btn:hover { background: var(--yt-red-dark); }
.save-btn:disabled { opacity: 0.6; cursor: default; }

.saved-badge {
  flex-shrink: 0;
  font-size: var(--font-size-sm);
  color: var(--color-success);
  font-weight: var(--font-weight-semibold);
}

/* Skeleton */
.skeleton-hero {
  padding: 14px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border-bottom: 1px solid var(--color-border);
}
.skeleton {
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  animation: pulse 1.4s ease-in-out infinite;
}
.handle-skeleton { height: 14px; width: 55%; }
.subs-skeleton   { height: 10px; width: 35%; }
@keyframes pulse {
  0%, 100% { opacity: 0.6; }
  50%       { opacity: 0.35; }
}

/* ── Videos Section ──────────────────────── */

.videos-section {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
}

.section-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--color-text-tertiary);
  padding: 0 12px 8px;
}

.video-list {
  display: flex;
  flex-direction: column;
}

.video-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--color-border);
  text-decoration: none;
  transition: background var(--transition-fast);
  cursor: pointer;
}
.video-row:hover {
  background: var(--color-bg-secondary);
}

.video-title {
  flex: 1;
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.video-stats {
  display: flex;
  gap: 4px;
  flex-shrink: 0;
}

/* Empty state */

.empty-videos {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 40px 20px;
  text-align: center;
}
.empty-icon { font-size: 28px; opacity: 0.4; }
.empty-text {
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}
.empty-hint {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

/* ── Leads Section ───────────────────────── */

.leads-section {
  display: flex;
  flex-direction: column;
  border-top: 1px solid var(--color-border);
}

.section-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px 6px;
}

.export-btn {
  background: none;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  padding: 2px 8px;
  cursor: pointer;
  transition: background var(--transition-fast), color var(--transition-fast);
}
.export-btn:hover {
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
}

.lead-list {
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  max-height: 240px;
}

.lead-row {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-size-sm);
}
.lead-row:last-child { border-bottom: none; }

.lead-handle {
  flex: 1;
  color: var(--color-text-primary);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.lead-handle:hover { text-decoration: underline; }

.verified {
  font-size: var(--font-size-xs);
  color: var(--color-success);
  flex-shrink: 0;
}

.lead-count {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  flex-shrink: 0;
}

.status-select {
  flex-shrink: 0;
  font-size: var(--font-size-xs);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-secondary);
  color: var(--color-text-secondary);
  padding: 1px 3px;
  cursor: pointer;
}
.status-select:focus { outline: none; border-color: var(--yt-red); }
</style>

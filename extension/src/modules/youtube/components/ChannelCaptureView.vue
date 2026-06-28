<template>
  <div class="channel-capture">
    <!-- Success Notification -->
    <transition name="toast-fade">
      <div v-if="notification" class="notification notification-success">
        <span>✓</span>
        <div class="notification-content">
          <div class="notification-title">Tracking {{ notification.handle }}</div>
          <div class="notification-text">Go capture their videos to find leads</div>
        </div>
      </div>
    </transition>

    <!-- Channel Header (Always Visible) -->
    <div class="channel-header">
      <div class="header-top">
        <div class="component-label">YouTube / Channel</div>
        <div class="nav-buttons">
          <button class="nav-btn back-btn" @click="goToDashboard" title="Back to Dashboard">
            ← Dashboard
          </button>
        </div>
      </div>

      <div v-if="channelData" class="header-content">
        <div class="channel-info">
          <div class="channel-name">{{ channelData.handle }}</div>
          <div class="channel-subs">{{ formatSubs(channelData.subs) }} subscribers</div>
        </div>
        <a :href="`https://www.youtube.com/${channelData.handle}/videos`" class="view-videos-btn">
          🎬 View Videos
        </a>
      </div>
      <div v-else class="header-content loading">
        <div class="channel-info">
          <div class="skeleton-line channel-name"></div>
          <div class="skeleton-line channel-subs"></div>
        </div>
      </div>
    </div>

    <!-- Videos Section -->
    <div v-if="capturedVideos.length > 0" class="section">
      <div class="section-header">
        <span class="section-title">🎬 Videos</span>
        <span class="count">{{ capturedVideos.length }}</span>
      </div>

      <div class="videos-list">
        <div v-for="video in capturedVideos" :key="video.id" class="video-row">
          <a :href="video.url" target="_blank" class="video-title">{{ video.title }}</a>
          <span class="video-stat">👤 {{ video.commentersCount }}</span>
          <span class="video-stat">🔗 {{ video.linksCount }}</span>
        </div>
      </div>
    </div>

    <!-- Links Section -->
    <div class="section">
      <div class="section-header">
        <span class="section-title">🔗 Links</span>
        <span class="count">{{ linkCount }}</span>
      </div>

      <div v-if="linkCount > 0" class="links-list">
        <div v-for="(url, type) in channelLinks" :key="type" class="link-item">
          <a :href="url" target="_blank" class="link-url">
            • {{ formatUrl(url) }}
          </a>
        </div>
      </div>
      <div v-else class="empty-state">No links found</div>
    </div>

    <!-- Leads Summary Section -->
    <div v-if="capturedLeads.length > 0" class="section">
      <div class="section-header">
        <span class="section-title">👤 Top Leads</span>
        <span class="count">{{ capturedLeads.length }}</span>
      </div>

      <div class="leads-compact">
        <a v-for="lead in capturedLeads.slice(0, 3)" :key="lead.url" :href="lead.url" target="_blank" class="lead-tag">
          {{ lead.handle || lead.name }}
          <span v-if="lead.isVerified">✓</span>
        </a>
        <span v-if="capturedLeads.length > 3" class="lead-tag more">
          +{{ capturedLeads.length - 3 }}
        </span>
      </div>
    </div>

    <!-- Save Button -->
    <button class="save-button" @click="handleSave" :disabled="loading || !channelData">
      <span v-if="!loading">📌 Start Tracking Channel</span>
      <span v-else>Saving...</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { saveChannelData, getChannelData } from '../storage'
import type { Commenter } from '../storage'

interface ChannelData {
  handle: string
  subs: number
}

const channelData = ref<ChannelData | null>(null)
const channelLinks = ref<Record<string, string>>({})
const capturedLeads = ref<Commenter[]>([])
const capturedVideos = ref<any[]>([])
const loading = ref(false)
const notification = ref<{ handle: string } | null>(null)

const linkCount = computed(() => Object.keys(channelLinks.value).length)

function loadCapturedData() {
  console.log('[ChannelCaptureView] loadCapturedData called, handle:', channelData.value?.handle)
  if (!channelData.value?.handle) {
    console.log('[ChannelCaptureView] ❌ No channel handle, skipping load')
    return
  }
  const data = getChannelData(channelData.value.handle)
  console.log('[ChannelCaptureView] ✅ Loaded data from localStorage:', {
    hasLeads: !!data?.uniqueCommenters,
    leadsCount: data?.uniqueCommenters?.length || 0,
    hasVideos: !!data?.videos,
    videosCount: data?.videos?.length || 0,
  })
  if (data) {
    capturedLeads.value = data.uniqueCommenters
    capturedVideos.value = data.videos || []
  }
}

onMounted(() => {
  // Listen for data from content script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[ChannelCaptureView] Received message:', request.action)

    if (request.action === 'updateData' && request.data?.pageType === 'channel') {
      console.log('[ChannelCaptureView] Updating channel data:', request.data)

      if (request.data.channelProfile) {
        channelData.value = {
          handle: request.data.channelProfile.handle,
          subs: request.data.channelProfile.subs,
        }
        console.log('[ChannelCaptureView] ✅ Got channel profile:', channelData.value)
        loadCapturedData()
      } else {
        console.log('[ChannelCaptureView] ❌ No profile, trying URL fallback')
        // Fallback: extract handle from URL if profile extraction failed
        const urlMatch = window.location.href.match(/@([\w.-]+)/)
        console.log('[ChannelCaptureView] URL match result:', urlMatch)
        if (urlMatch) {
          const handle = `@${urlMatch[1]}`
          console.log('[ChannelCaptureView] ✅ Extracted handle from URL:', handle)
          channelData.value = {
            handle,
            subs: 0,
          }
          loadCapturedData()
        } else {
          console.log('[ChannelCaptureView] ❌ Could not extract handle from URL:', window.location.href)
        }
      }

      if (request.data.channelLinks) {
        channelLinks.value = request.data.channelLinks
      }
    }

    sendResponse({ success: true })
  })

  // Request initial data from content script
  console.log('[ChannelCaptureView] 📤 Sending extractData request...')
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0]
    if (!activeTab?.id) {
      console.error('[ChannelCaptureView] ❌ No active tab found')
      return
    }

    const tabUrl = activeTab.url || ''
    console.log('[ChannelCaptureView] ✅ Active tab URL:', tabUrl)

    chrome.tabs.sendMessage(activeTab.id, { action: 'extractData' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[ChannelCaptureView] ❌ Chrome runtime error:', chrome.runtime.lastError)
          return
        }

        console.log('[ChannelCaptureView] 📥 Received response:', {
          success: response?.success,
          pageType: response?.data?.pageType,
          hasProfile: !!response?.data?.channelProfile,
          linksCount: response?.data?.channelLinks ? Object.keys(response.data.channelLinks).length : 0,
        })

        if (response?.data?.pageType === 'channel') {
          console.log('[ChannelCaptureView] ✅ CHANNEL PAGE - Processing data:', response.data)

          if (response.data.channelProfile) {
            channelData.value = {
              handle: response.data.channelProfile.handle,
              subs: response.data.channelProfile.subs,
            }
            console.log('[ChannelCaptureView] ✅ Channel data set from profile:', channelData.value)
            loadCapturedData()
          } else {
            console.error('[ChannelCaptureView] ❌ NO PROFILE DATA - extractChannelProfile() returned null')
            // Fallback: extract handle from tab URL
            const urlMatch = tabUrl.match(/@([\w.-]+)/)
            console.log('[ChannelCaptureView] URL fallback attempt:', { url: tabUrl, match: urlMatch })
            if (urlMatch) {
              const handle = `@${urlMatch[1]}`
              console.log('[ChannelCaptureView] ✅ Using URL fallback handle:', handle)
              channelData.value = {
                handle,
                subs: 0,
              }
              loadCapturedData()
            } else {
              console.log('[ChannelCaptureView] ❌ URL fallback failed, no handle extracted')
            }
            console.log('[ChannelCaptureView] Full response:', response.data)

            // Try to load saved data from previous video captures
            if (channelData.value?.handle) {
              const storageKey = `youtube:channel:${channelData.value.handle}`
              const saved = localStorage.getItem(storageKey)
              console.log('[ChannelCaptureView] Looking for saved data under:', storageKey)
              console.log('[ChannelCaptureView] Found:', !!saved)
              if (saved) {
              try {
                const data = JSON.parse(saved)
                console.log('[ChannelCaptureView] Loaded saved data:', data)
                // Update with saved info if available
                if (data.allLinks) {
                  console.log('[ChannelCaptureView] Setting saved links')
                  // Convert back to the format expected by the component
                  for (const link of data.allLinks) {
                    if (link.url) channelLinks.value[link.url] = link.url
                  }
                }
              } catch (e) {
                console.error('[ChannelCaptureView] Error parsing saved data:', e)
              }
            }
          }

          if (response.data.channelLinks) {
            channelLinks.value = { ...channelLinks.value, ...response.data.channelLinks }
            console.log('[ChannelCaptureView] Merged with scraped links')
          }
        }
      })
  })
})

function formatUrl(url: string): string {
  try {
    const u = new URL(url)
    return u.hostname.replace('www.', '')
  } catch {
    return url
  }
}

function formatSubs(count: number): string {
  if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M'
  if (count >= 1000) return (count / 1000).toFixed(1) + 'K'
  return count.toString()
}

function showNotification(handle: string) {
  notification.value = { handle }
  setTimeout(() => {
    notification.value = null
  }, 4000)
}

function goToDashboard() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.update(tabs[0].id, { url: 'https://www.youtube.com/' })
    }
  })
}

function handleSave() {
  if (!channelData.value) return

  loading.value = true

  try {
    console.log('[YouTube] Saving channel:', {
      handle: channelData.value.handle,
      subs: channelData.value.subs,
      links: channelLinks.value,
    })

    // Save to storage
    saveChannelData({
      channel: {
        handle: channelData.value.handle,
        subs: channelData.value.subs,
        links: channelLinks.value,
      },
      allLinks: Object.values(channelLinks.value).map((url) => ({ url, count: 1 })),
      uniqueCommenters: [],
    })

    console.log('[YouTube] Channel saved successfully')

    // Notify dashboard that data was saved
    chrome.runtime.sendMessage({ action: 'dataSaved' }).catch(() => {
      // Ignore error if no listener
    })

    showNotification(channelData.value.handle)
  } catch (error) {
    console.error('[YouTube] Error saving channel:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import '../design-system.css';

.channel-capture {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding: var(--space-md);
  padding-right: var(--space-sm);
}

.channel-capture::-webkit-scrollbar {
  width: 6px;
}

.channel-capture::-webkit-scrollbar-track {
  background: transparent;
}

.channel-capture::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: var(--radius-sm);
}

.channel-capture::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-tertiary);
}

.channel-header {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--yt-red);
}

.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
}

.nav-buttons {
  display: flex;
  gap: var(--space-sm);
}

.nav-btn {
  padding: var(--space-xs) var(--space-md);
  background: var(--color-bg-tertiary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: background var(--transition-fast), border-color var(--transition-fast);
}

.nav-btn:hover {
  background: var(--color-border);
  border-color: var(--color-text-secondary);
}

.back-btn {
  white-space: nowrap;
}

.component-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  opacity: 0.85;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--space-sm);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-sm);
}

.channel-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
  flex: 1;
}

.channel-name {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
}

.channel-subs {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

.skeleton-line {
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  height: 1em;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.skeleton-line.channel-name {
  width: 60%;
  margin-bottom: var(--space-xs);
}

.skeleton-line.channel-subs {
  width: 40%;
}

@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.4;
  }
}

.view-videos-btn {
  padding: var(--space-xs) var(--space-md);
  background: var(--color-success);
  color: white;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  text-decoration: none;
  white-space: nowrap;
  transition: background var(--transition-fast);
}

.view-videos-btn:hover {
  background: var(--color-success-hover);
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2px;
}

.section-title {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.count {
  font-size: var(--font-size-sm);
  background: var(--color-bg-tertiary);
  color: var(--color-text-secondary);
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
}

.empty-state {
  padding: var(--space-lg) var(--space-md);
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-base);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
}

.links-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.link-item {
  padding: var(--space-sm);
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.link-type {
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  text-transform: capitalize;
}

.link-url {
  font-size: var(--font-size-base);
  color: var(--color-link);
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-url:hover {
  text-decoration: underline;
}

.leads-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.leads-compact {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.lead-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: 12px;
  font-size: var(--font-size-xs);
  color: var(--color-link);
  text-decoration: none;
  white-space: nowrap;
  transition: background-color 0.2s;
}

.lead-tag:hover {
  background: #f0f0f0;
  text-decoration: none;
}

.lead-tag span {
  background: #d4edda;
  color: #155724;
  padding: 0 2px;
  border-radius: 2px;
  font-weight: 600;
}

.lead-tag.more {
  cursor: default;
  color: var(--color-text-secondary);
}

.lead-tag.more:hover {
  background: var(--color-bg-secondary);
}

.videos-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.video-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  font-size: var(--font-size-sm);
  transition: background-color 0.2s;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.video-row:hover {
  background: #f5f5f5;
}

.video-title {
  flex: 0 1 auto;
  min-width: 0;
  color: var(--color-link);
  text-decoration: none;
  font-weight: var(--font-weight-medium);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.video-title:hover {
  text-decoration: underline;
}

.video-stat {
  white-space: nowrap;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
  flex-shrink: 0;
}

.save-button {
  width: 100%;
  padding: var(--space-md) var(--space-lg);
  background: var(--color-success);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
}

.save-button:hover:not(:disabled) {
  background: var(--color-success-hover);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.save-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.save-button:disabled {
  background: var(--color-bg-tertiary);
  cursor: not-allowed;
  color: var(--color-text-secondary);
  box-shadow: none;
}

.notification {
  position: fixed;
  top: 12px;
  right: 12px;
  left: 12px;
  padding: 12px 16px;
  border-radius: 6px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
  font-size: 13px;
  line-height: 1.4;
  z-index: 1000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.08);
}

.notification-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.notification-success span {
  font-size: 16px;
  font-weight: 600;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: 600;
  margin-bottom: 2px;
}

.notification-text {
  font-size: 12px;
  opacity: 0.9;
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all 0.3s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

<template>
  <div class="video-capture">
    <!-- Success Notification -->
    <transition name="toast-fade">
      <div v-if="notification" class="notification notification-success">
        <span>✓</span>
        <div class="notification-content">
          <div class="notification-title">{{ notification.message }}</div>
        </div>
      </div>
    </transition>


    <!-- Video Header (Always Visible) -->
    <div class="channel-header">
      <div class="header-top">
        <div class="component-label">YouTube / Video</div>
        <div class="nav-buttons">
          <button class="nav-btn back-btn" @click="goToChannel" title="Back to Channel">
            ← Back
          </button>
        </div>
      </div>

      <div v-if="channelInfo" class="video-header">
        <div class="header-content">
          <div class="channel-link">
            <span class="youtube-label">Channel</span>
            <a :href="`https://www.youtube.com/${channelInfo.handle}`" class="channel-handle-link">
              {{ channelInfo.handle }}
            </a>
            <span class="subs">{{ formatSubs(channelInfo.subs) }} subscribers</span>
          </div>
        </div>
      </div>
      <div v-else class="video-header loading">
        <div class="header-content">
          <div class="channel-link">
            <span class="skeleton-line channel-name" style="width: 60%;"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- Links Section -->
    <div class="section">
      <div class="section-header">
        <span class="section-title">🔗 Links</span>
        <span class="count">{{ extractedLinks.length }}</span>
      </div>
      <div v-if="extractedLinks.length > 0" class="links-list">
        <div v-for="(link, idx) in extractedLinks" :key="idx" class="link-item">
          <a :href="link" target="_blank" class="link-url">
            {{ formatUrl(link) }}
          </a>
        </div>
      </div>
      <div v-else class="empty-state">
        <span v-if="extractedLeads.length > 0">No external links in description/comments</span>
        <span v-else>Checking for links...</span>
      </div>
    </div>

    <!-- Save Button -->
    <button class="save-button" @click="handleSave" :disabled="loading">
      <span v-if="!loading">💾 Save to Channel</span>
      <span v-else>Saving...</span>
    </button>

    <!-- Leads Section with Accordion -->
    <div class="section leads-section">
      <div class="section-header">
        <span class="section-title">👤 Leads</span>
        <span class="count">{{ sortedLeads.length }}</span>
      </div>
      <div v-if="extractedLeads.length > 0" class="leads-list-scroll">
        <div v-for="lead in sortedLeads" :key="lead.url" class="lead-item">
          <div class="lead-left">
            <a :href="lead.url" target="_blank" class="lead-name">{{ lead.handle || lead.name }}</a>
            <span v-if="lead.isVerified" class="lead-verified-check">✓</span>
          </div>
          <div class="lead-spacer"></div>
          <div class="lead-right">
            <span class="lead-count">({{ lead.count }}×)</span>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">No commenters extracted yet</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Commenter } from '../storage'
import { mergeVideo } from '../storage'

interface ChannelInfo {
  handle: string
  subs: number
}

const channelInfo = ref<ChannelInfo | null>(null)
const extractedLinks = ref<string[]>([])
const extractedLeads = ref<Omit<Commenter, 'tier'>[]>([])
const videoInfo = ref<{ id: string; title: string; url: string } | null>(null)
const loading = ref(false)
const notification = ref<{ message: string } | null>(null)

const sortedLeads = computed(() => {
  const deduped = new Map<string, Omit<Commenter, 'tier'>>()

  // Group by URL and sum counts
  for (const lead of extractedLeads.value) {
    const key = lead.url
    if (deduped.has(key)) {
      const existing = deduped.get(key)!
      existing.count += lead.count
    } else {
      deduped.set(key, { ...lead })
    }
  }

  const unique = Array.from(deduped.values())

  return unique.sort((a, b) => {
    // Verified first
    if (a.isVerified !== b.isVerified) {
      return a.isVerified ? -1 : 1
    }
    // Then by count descending
    return b.count - a.count
  })
})

onMounted(() => {
  // Listen for data from content script
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('[VideoCaptureView] Received message:', request.action)

    if (request.action === 'updateData' && request.data?.pageType === 'video') {
      console.log('[VideoCaptureView] Updating video data:', request.data)

      if (request.data.videoChannelInfo) {
        channelInfo.value = {
          handle: request.data.videoChannelInfo.handle,
          subs: request.data.videoChannelInfo.subs,
        }
      }

      if (request.data.videoLinks) {
        extractedLinks.value = request.data.videoLinks
      }

      if (request.data.videoCommenters) {
        extractedLeads.value = request.data.videoCommenters
      }

      if (request.data.videoInfo) {
        videoInfo.value = request.data.videoInfo
      }
    }

    sendResponse({ success: true })
  })

  // Request initial data from content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      console.log('[VideoCaptureView] ✅ Got tab ID:', tabs[0].id)
      chrome.tabs.sendMessage(tabs[0].id, { action: 'extractData' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[VideoCaptureView] ❌ Chrome runtime error:', chrome.runtime.lastError)
          return
        }

        console.log('[VideoCaptureView] 📥 Received response:', {
          success: response?.success,
          pageType: response?.data?.pageType,
          hasChannelInfo: !!response?.data?.videoChannelInfo,
          commentersCount: response?.data?.videoCommenters?.length || 0,
          linksCount: response?.data?.videoLinks?.length || 0,
        })

        if (response?.data?.pageType === 'video') {
          console.log('[VideoCaptureView] ✅ VIDEO PAGE - Processing data:', response.data)

          if (response.data.videoChannelInfo) {
            channelInfo.value = {
              handle: response.data.videoChannelInfo.handle,
              subs: response.data.videoChannelInfo.subs,
            }
            console.log('[VideoCaptureView] ✅ Channel info set:', channelInfo.value)
          } else {
            console.warn('[VideoCaptureView] ⚠️ No channel info in response')
          }

          if (response.data.videoLinks) {
            extractedLinks.value = response.data.videoLinks
            console.log(`[VideoCaptureView] ✅ Links set: ${response.data.videoLinks.length} links`)
          } else {
            console.log('[VideoCaptureView] ℹ️ No links in response')
          }

          if (response.data.videoCommenters) {
            extractedLeads.value = response.data.videoCommenters
            console.log(`[VideoCaptureView] ✅ Leads set: ${response.data.videoCommenters.length} commenters`)
          } else {
            console.warn('[VideoCaptureView] ⚠️ No commenters in response')
          }

          if (response.data.videoInfo) {
            videoInfo.value = response.data.videoInfo
            console.log('[VideoCaptureView] ✅ Video info set:', videoInfo.value)
          } else {
            console.log('[VideoCaptureView] ℹ️ No video info in response')
          }
        }

        // Fallback: if no channel info, try to extract from page title/URL
        if (!channelInfo.value) {
          console.log('[VideoCaptureView] No channel info from content script, trying fallback')
          // Try to extract from page title or use unknown
          const titleMatch = document.title.match(/^\s*[^-]*-\s*([^-]+)/)
          if (titleMatch) {
            const channelName = titleMatch[1].trim()
            channelInfo.value = { handle: `@${channelName}`, subs: 0 }
            console.log('[VideoCaptureView] Using channel from title:', channelInfo.value)
          } else {
            // Last resort: ask content script again with explicit logging
            chrome.tabs.sendMessage(tabs[0]!.id!, { action: 'extractData' }, (response) => {
              if (response?.data?.videoChannelInfo) {
                console.log('[VideoCaptureView] Got channel info on retry:', response.data.videoChannelInfo)
                channelInfo.value = {
                  handle: response.data.videoChannelInfo.handle,
                  subs: response.data.videoChannelInfo.subs,
                }
              }
            })
          }
        }
      })
    }
  })
})

function goToChannel() {
  let handle = channelInfo.value?.handle

  // Fallback: try to extract handle from leads
  if (!handle && extractedLeads.value.length > 0) {
    const firstLead = extractedLeads.value[0]
    handle = firstLead.handle
  }

  if (!handle) {
    console.warn('[VideoCaptureView] No channel handle found, cannot navigate back')
    return
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.update(tabs[0].id, { url: `https://www.youtube.com/${handle}` })
    }
  })
}

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

function showNotification(message: string) {
  notification.value = { message }
  setTimeout(() => {
    notification.value = null
  }, 4000)
}

function handleSave() {
  if (!channelInfo.value) {
    showNotification('Please navigate from a YouTube page with channel info')
    return
  }

  // Only require leads, links are optional
  if (sortedLeads.value.length === 0) {
    showNotification('No commenters found. Scroll to load comments on the page.')
    return
  }

  loading.value = true

  // If videoInfo wasn't extracted by the content script, build it from the active tab.
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0]
    let resolvedVideoInfo = videoInfo.value

    if (!resolvedVideoInfo && tab?.url) {
      const idMatch = tab.url.match(/[?&]v=([a-zA-Z0-9_-]+)/)
      const id = idMatch?.[1] ?? 'unknown'
      let title = tab.title ?? 'Untitled Video'
      title = title.replace(/^\(\d+\)\s*/, '').replace(/\s*-\s*YouTube\s*$/, '').trim() || 'Untitled Video'
      resolvedVideoInfo = { id, title, url: tab.url }
    }

    try {
      const handle = channelInfo.value!.handle

      const result = mergeVideo(
        handle,
        extractedLinks.value,
        sortedLeads.value,
        { subs: channelInfo.value!.subs, links: {} },
        resolvedVideoInfo ?? undefined,
      )

      chrome.runtime.sendMessage({ action: 'dataSaved' }).catch(() => {})

      const leadsText = sortedLeads.value.length > 0 ? ` Added ${sortedLeads.value.length} leads.` : ''
      showNotification(`Saved to ${handle}${leadsText}`)
      console.log('[YouTube] Video capture saved:', result)
    } catch (error) {
      console.error('[YouTube] Error saving video capture:', error)
      showNotification('Error saving. Check console.')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
@import '../design-system.css';

.video-capture {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding-right: var(--space-xs);
}

.video-capture::-webkit-scrollbar {
  width: 6px;
}

.video-capture::-webkit-scrollbar-track {
  background: transparent;
}

.video-capture::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: var(--radius-sm);
}

.video-capture::-webkit-scrollbar-thumb:hover {
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

.video-header {
  padding: var(--space-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--yt-red);
}

.component-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-tertiary);
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

.channel-link {
  display: flex;
  align-items: baseline;
  gap: var(--space-sm);
  flex-wrap: wrap;
  flex: 1;
}

.youtube-label {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
}

.channel-handle-link {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-md);
  color: var(--color-link);
  text-decoration: none;
}

.channel-handle-link:hover {
  text-decoration: underline;
}

.subs {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
  flex-basis: 100%;
}

.skeleton-line {
  background: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  height: 1em;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  display: inline-block;
}

@keyframes skeleton-pulse {
  0%, 100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.4;
  }
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
  padding: var(--space-xs) 6px;
  border-radius: var(--radius-sm);
}

.empty-state {
  padding: var(--space-md);
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-base);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
}

/* Links List */
.links-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.link-item {
  padding: 8px;
  background: linear-gradient(135deg, #fafafa 0%, #f5f5f5 100%);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.link-url {
  font-size: var(--font-size-base);
  color: var(--color-link);
  text-decoration: none;
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-url:hover {
  text-decoration: underline;
}

/* Leads List */
/* Leads Section Container */
.leads-section {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-height: 400px;
  overflow: hidden;
}

/* Scrollable List Container */
.leads-list-scroll {
  max-height: 350px;
  overflow-y: auto;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg-primary);
}

.leads-list-scroll::-webkit-scrollbar {
  width: 8px;
}

.leads-list-scroll::-webkit-scrollbar-track {
  background: var(--color-bg-primary);
}

.leads-list-scroll::-webkit-scrollbar-thumb {
  background: var(--color-border);
  border-radius: 4px;
  border: 2px solid var(--color-bg-primary);
}

.leads-list-scroll::-webkit-scrollbar-thumb:hover {
  background: var(--color-text-secondary);
}

/* Lead Item - Directory Format */
.lead-item {
  display: flex;
  align-items: center;
  padding: 8px var(--space-md);
  border-bottom: 1px solid var(--color-border);
  font-size: var(--font-size-sm);
  transition: background-color 0.2s;
  white-space: nowrap;
}

.lead-item:hover {
  background: var(--color-bg-secondary);
}

.lead-item:last-child {
  border-bottom: none;
}

.lead-left {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.lead-name {
  font-weight: var(--font-weight-medium);
  color: var(--color-link);
  text-decoration: none;
  transition: opacity 0.2s;
}

.lead-name:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.lead-verified-check {
  background: #d4edda;
  color: #155724;
  font-size: var(--font-size-xs);
  padding: 0 3px;
  border-radius: 2px;
}

.lead-spacer {
  flex: 1;
  margin: 0 8px;
  height: 1em;
  border-bottom: 1px dotted var(--color-border);
}

.lead-right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.lead-count {
  color: var(--color-text-tertiary);
  font-size: var(--font-size-xs);
}

.lead-link {
  color: var(--color-link);
  text-decoration: none;
  padding: 0 4px;
  border-radius: 2px;
  transition: background-color 0.2s;
  font-size: var(--font-size-sm);
}

.lead-link:hover {
  background: rgba(26, 115, 232, 0.1);
  text-decoration: none;
}

/* Save Button */
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
  margin-top: var(--space-md);
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
  top: var(--space-md);
  right: var(--space-md);
  left: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-md);
  display: flex;
  gap: var(--space-md);
  align-items: flex-start;
  font-size: var(--font-size-md);
  line-height: 1.4;
  z-index: 1000;
  box-shadow: var(--shadow-md);
}

.notification-success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.notification-success span {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-semibold);
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-title {
  font-weight: var(--font-weight-semibold);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: all var(--transition-standard);
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>

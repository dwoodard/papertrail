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

    <!-- Video Header -->
    <div v-if="channelInfo" class="video-header">
      <div class="component-label">YouTube / Video</div>
      <div class="header-content">
        <div class="channel-link">
          <span class="youtube-label">Channel</span>
          <a :href="`https://www.youtube.com/${channelInfo.handle}`" class="channel-handle-link">
            {{ channelInfo.handle }}
          </a>
          <span class="subs">{{ formatSubs(channelInfo.subs) }} subscribers</span>
        </div>
        <a :href="`https://www.youtube.com/${channelInfo.handle}`" class="track-channel-btn">
          📌 Track Channel
        </a>
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
      <div v-else class="empty-state">No links found yet</div>
    </div>

    <!-- Leads Section -->
    <div class="section">
      <div class="section-header">
        <span class="section-title">👤 Leads</span>
        <span class="count">{{ extractedLeads.length }}</span>
      </div>
      <div v-if="extractedLeads.length > 0" class="leads-list">
        <div v-for="lead in extractedLeads" :key="lead.url" class="lead-item">
          <div class="lead-header">
            <div class="lead-name">{{ lead.name }}</div>
          </div>
          <div class="lead-details">
            <div v-if="lead.handle" class="lead-handle">{{ lead.handle }}</div>
            <div class="lead-count">appeared {{ lead.count }}× in video</div>
            <div v-if="lead.isVerified" class="lead-badge verified">✓ Verified</div>
            <div v-if="lead.hasChannel" class="lead-badge channel">📺 Has channel</div>
          </div>
          <a :href="lead.url" target="_blank" class="lead-profile">View channel</a>
        </div>
      </div>
      <div v-else class="empty-state">No commenters extracted yet</div>
    </div>

    <!-- Save Button -->
    <button class="save-button" @click="handleSave" :disabled="loading || !channelInfo">
      <span v-if="!loading">💾 Save to Channel</span>
      <span v-else>Saving...</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Commenter } from '../storage'
import { mergeVideo } from '../storage'

interface ChannelInfo {
  handle: string
  subs: number
}

const channelInfo = ref<ChannelInfo | null>(null)
const extractedLinks = ref<string[]>([])
const extractedLeads = ref<Omit<Commenter, 'tier'>[]>([])
const loading = ref(false)
const notification = ref<{ message: string } | null>(null)

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
    }

    sendResponse({ success: true })
  })

  // Request initial data from content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'extractData' }, (response) => {
        if (response?.data?.pageType === 'video') {
          console.log('[VideoCaptureView] Got initial data:', response.data)

          if (response.data.videoChannelInfo) {
            channelInfo.value = {
              handle: response.data.videoChannelInfo.handle,
              subs: response.data.videoChannelInfo.subs,
            }
          }

          if (response.data.videoLinks) {
            extractedLinks.value = response.data.videoLinks
          }

          if (response.data.videoCommenters) {
            extractedLeads.value = response.data.videoCommenters
          }
        }
      })
    }
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

function showNotification(message: string) {
  notification.value = { message }
  setTimeout(() => {
    notification.value = null
  }, 4000)
}

function handleSave() {
  if (!channelInfo.value || (extractedLinks.value.length === 0 && extractedLeads.value.length === 0)) {
    return
  }

  loading.value = true

  try {
    console.log('[YouTube] Saving video capture:', {
      channel: channelInfo.value.handle,
      links: extractedLinks.value,
      leads: extractedLeads.value.length,
    })

    // Save to storage
    mergeVideo(channelInfo.value.handle, extractedLinks.value, extractedLeads.value, {
      subs: channelInfo.value.subs,
      links: {},
    })

    console.log('[YouTube] Video capture saved successfully')
    const leadsText = extractedLeads.value.length > 0 ? ` Added ${extractedLeads.value.length} leads.` : ''
    showNotification(`Saved to ${channelInfo.value.handle}${leadsText}`)
  } catch (error) {
    console.error('[YouTube] Error saving video capture:', error)
    showNotification('Error saving. Check console.')
  } finally {
    loading.value = false
  }
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

.track-channel-btn {
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

.track-channel-btn:hover {
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
  background: var(--color-bg-secondary);
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
.leads-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.lead-item {
  padding: 10px;
  background: var(--color-bg-secondary);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.lead-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: var(--space-sm);
}

.lead-name {
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  flex: 1;
}

.tier-badge {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  padding: var(--space-xs) 6px;
  border-radius: var(--radius-sm);
  text-transform: uppercase;
  white-space: nowrap;
}

.tier-badge.high {
  background: #d4edda;
  color: #155724;
}

.tier-badge.medium {
  background: #fff3cd;
  color: #856404;
}

.tier-badge.low {
  background: #f8d7da;
  color: #721c24;
}

.lead-details {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.lead-handle {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
}

.lead-count {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

.lead-badge {
  font-size: var(--font-size-xs);
  padding: var(--space-xs) 4px;
  background: #e8f4f8;
  color: var(--color-link);
  border-radius: 2px;
  width: fit-content;
}

.lead-badge.verified {
  background: #d4edda;
  color: #155724;
}

.lead-badge.channel {
  background: #e8f4f8;
  color: var(--color-link);
}

.lead-profile {
  font-size: var(--font-size-sm);
  color: var(--color-link);
  text-decoration: none;
  margin-top: 2px;
}

.lead-profile:hover {
  text-decoration: underline;
}

/* Save Button */
.save-button {
  padding: 10px var(--space-lg);
  background: var(--color-success);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-md);
  cursor: pointer;
  transition: background var(--transition-fast);
  margin-top: 4px;
}

.save-button:hover:not(:disabled) {
  background: var(--color-success-hover);
}

.save-button:disabled {
  background: var(--color-bg-tertiary);
  cursor: not-allowed;
  color: var(--color-text-secondary);
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

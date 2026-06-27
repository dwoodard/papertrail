<template>
  <div class="video-capture">
    <!-- Video Header -->
    <div v-if="channelInfo" class="video-header">
      <div class="channel-link">
        <span class="channel-name">{{ channelInfo.handle }}</span>
        <span class="subs">{{ formatSubs(channelInfo.subs) }}</span>
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
    <button class="save-button" @click="handleSave" :disabled="loading || (extractedLinks.length === 0 && extractedLeads.length === 0)">
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
    alert(`✓ Saved! Added ${extractedLeads.value.length} leads to ${channelInfo.value.handle}`)
  } catch (error) {
    console.error('[YouTube] Error saving video capture:', error)
    alert('Error saving video capture. Check console.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.video-capture {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.video-header {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 4px;
  border-left: 3px solid #ff0000;
}

.channel-link {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.channel-name {
  font-weight: 600;
  font-size: 13px;
  color: #202124;
}

.subs {
  font-size: 11px;
  color: #999;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2px;
}

.section-title {
  font-weight: 600;
  font-size: 12px;
  color: #202124;
}

.count {
  font-size: 11px;
  background: #f0f0f0;
  color: #666;
  padding: 2px 6px;
  border-radius: 3px;
}

.empty-state {
  padding: 12px;
  text-align: center;
  color: #999;
  font-size: 12px;
  background: #f9f9f9;
  border-radius: 4px;
}

/* Links List */
.links-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.link-item {
  padding: 8px;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 3px;
  overflow: hidden;
}

.link-url {
  font-size: 12px;
  color: #1a73e8;
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
  gap: 8px;
}

.lead-item {
  padding: 10px;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.lead-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.lead-name {
  font-weight: 500;
  font-size: 13px;
  color: #202124;
  flex: 1;
}

.tier-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 3px;
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
  font-size: 11px;
  color: #666;
}

.lead-count {
  font-size: 11px;
  color: #999;
}

.lead-badge {
  font-size: 10px;
  padding: 2px 4px;
  background: #e8f4f8;
  color: #0366d6;
  border-radius: 2px;
  width: fit-content;
}

.lead-badge.verified {
  background: #d4edda;
  color: #155724;
}

.lead-badge.channel {
  background: #e8f4f8;
  color: #0366d6;
}

.lead-profile {
  font-size: 11px;
  color: #1a73e8;
  text-decoration: none;
  margin-top: 2px;
}

.lead-profile:hover {
  text-decoration: underline;
}

/* Save Button */
.save-button {
  padding: 10px 16px;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 4px;
}

.save-button:hover:not(:disabled) {
  background: #1565c0;
}

.save-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>

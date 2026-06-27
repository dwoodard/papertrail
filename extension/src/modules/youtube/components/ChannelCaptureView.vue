<template>
  <div class="channel-capture">
    <!-- Channel Header -->
    <div v-if="channelData" class="channel-header">
      <div class="channel-info">
        <div class="channel-name">{{ channelData.handle }}</div>
        <div class="channel-subs">{{ formatSubs(channelData.subs) }} subscribers</div>
      </div>
    </div>

    <!-- Links Section -->
    <div class="section">
      <div class="section-header">
        <span class="section-title">🔗 Contact Links</span>
        <span class="count">{{ Object.keys(channelLinks).length }}</span>
      </div>

      <div v-if="Object.keys(channelLinks).length > 0" class="links-grid">
        <div v-for="(url, type) in channelLinks" :key="type" class="link-card">
          <div class="link-type">{{ type }}</div>
          <a :href="url" target="_blank" class="link-value">
            {{ formatUrl(url) }}
          </a>
        </div>
      </div>
      <div v-else class="empty-state">No links found in channel description</div>
    </div>

    <!-- Info Message -->
    <div class="info-box">
      <div class="info-icon">ℹ️</div>
      <div class="info-text">
        Save channel to start tracking commenters from videos.<br />
        Capture videos to find high-value leads.
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
import { ref, onMounted } from 'vue'
import { saveChannelData } from '../storage'

interface ChannelData {
  handle: string
  subs: number
}

const channelData = ref<ChannelData | null>(null)
const channelLinks = ref<Record<string, string>>({})
const loading = ref(false)

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
      }

      if (request.data.channelLinks) {
        channelLinks.value = request.data.channelLinks
      }
    }

    sendResponse({ success: true })
  })

  // Request initial data from content script
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'extractData' }, (response) => {
        if (response?.data?.pageType === 'channel') {
          console.log('[ChannelCaptureView] Got initial data:', response.data)

          if (response.data.channelProfile) {
            channelData.value = {
              handle: response.data.channelProfile.handle,
              subs: response.data.channelProfile.subs,
            }
          }

          if (response.data.channelLinks) {
            channelLinks.value = response.data.channelLinks
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
    alert(`✓ Tracking ${channelData.value.handle}! Go capture their videos.`)
  } catch (error) {
    console.error('[YouTube] Error saving channel:', error)
    alert('Error saving channel. Check console.')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.channel-capture {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.channel-header {
  padding: 16px 12px;
  background: linear-gradient(135deg, #ff0000 0%, #ff0000 100%);
  border-radius: 6px;
  color: white;
}

.channel-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.channel-name {
  font-weight: 600;
  font-size: 16px;
}

.channel-subs {
  font-size: 13px;
  opacity: 0.9;
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
  padding: 16px 12px;
  text-align: center;
  color: #999;
  font-size: 12px;
  background: #f9f9f9;
  border-radius: 4px;
}

.links-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.link-card {
  padding: 10px;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.link-type {
  font-weight: 500;
  font-size: 11px;
  color: #666;
  text-transform: capitalize;
}

.link-value {
  font-size: 12px;
  color: #1a73e8;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.link-value:hover {
  text-decoration: underline;
}

.info-box {
  padding: 10px 12px;
  background: #e8f4f8;
  border-left: 3px solid #0366d6;
  border-radius: 3px;
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #0366d6;
  line-height: 1.4;
}

.info-icon {
  flex-shrink: 0;
}

.info-text {
  flex: 1;
}

.save-button {
  padding: 10px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.save-button:hover:not(:disabled) {
  background: #218838;
}

.save-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>

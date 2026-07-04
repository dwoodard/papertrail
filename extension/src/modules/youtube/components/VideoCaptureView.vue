<template>
  <div class="youtube-module">
    <!-- Notification -->
    <transition name="toast-fade">
      <div v-if="notification" :class="['notification', `notification-${notification.type}`]">
        <span>{{ notification.type === 'error' ? '✕' : '✓' }}</span>
        <div class="notification-content">
          <div class="notification-title">{{ notification.message }}</div>
        </div>
      </div>
    </transition>

    <!-- Module Header -->
    <header class="module-header">

      <div class="module-actions">
        <button class="btn" @click="goToChannel" title="Back to Channel">
          ← Back
        </button>
        <button v-if="hasExtractedData" class="save-button-global" @click="handleSave" :disabled="loading">
          <span v-if="!loading">💾 Save to Channel</span>
          <span v-else>Saving...</span>
        </button>
      </div>
    </header>

    <!-- Channel Summary Card -->
    <section v-if="channelInfo" class="summary-card">
      <div class="summary-top">
        <div>
          <div class="source-label">YouTube / Video</div>

          <div v-if="videoInfo?.title" class="video-title">{{ videoInfo.title }}</div>
          <a :href="channelInfo.url || `https://www.youtube.com/${channelInfo.handle}`" class="channel-name-link">
            <h2 class="channel-name">{{ channelInfo.handle }}</h2>
          </a>
          <div class="channel-meta">{{ formatSubs(channelInfo.subs) }} subscribers</div>
        </div>

        <div class="summary-stats">
          <div class="stat-card">
            <div class="stat-label">🔗 Links</div>
            <div class="stat-value">{{ extractedLinks.length }}</div>
          </div>

          <div class="stat-card">
            <div class="stat-label">👤 Leads</div>
            <div class="stat-value">{{ sortedLeads.length }}</div>
          </div>

          <div v-if="transcriptText" class="stat-card">
            <div class="stat-label">📝</div>
            <div class="stat-value">✓</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Accordion Stack -->
    <section class="accordion-stack">

         <!-- Transcript Accordion -->
      <details class="accordion">
        <summary>
          <div class="accordion-header">
            <div class="accordion-heading">
              <div class="accordion-icon">📄</div>
              <div class="accordion-title-group">
                <div class="accordion-title">Transcript</div>
                <div class="accordion-subtitle">Video transcript with timestamps</div>
              </div>
            </div>


            <div class="accordion-meta">

                <button class="btn" @click="extractTranscript" :disabled="transcriptLoading">
                    <span v-if="transcriptLoading" class="spinner"></span>
                    <span v-if="transcriptLoading">Transcript loading…</span>
                    <span v-else>📝 Transcript</span>
                </button>

              <span v-if="transcriptLoading" class="status-pill">
                <span class="spinner"></span>
                Loading
              </span>
              <span v-else-if="transcriptText" class="status-pill status-ready">✓ Ready</span>
              <span class="chevron">›</span>
            </div>
          </div>
        </summary>

        <div class="accordion-body">
          <div class="transcript-box">
            <div class="transcript-toolbar">
              <div class="transcript-toolbar-title">Transcript</div>
              <div class="transcript-toolbar-actions">
                <label v-if="transcriptText" class="checkbox-label">
                  <input type="checkbox" v-model="showTimestamps" class="checkbox-input">
                  <span class="checkbox-text">Timestamps</span>
                </label>
                <button v-if="transcriptText" class="btn" @click="copyTranscript" title="Copy to clipboard">
                  📋 Copy
                </button>
              </div>
            </div>
            <div class="transcript-content">
              <div v-if="transcriptText" class="transcript-text">{{ displayedTranscript }}</div>
              <div v-else class="transcript-placeholder">Transcript is still loading. Once available, the transcript text can appear here.</div>
            </div>
          </div>
        </div>
      </details>

      <!-- Links Accordion -->
      <details class="accordion">
        <summary>
          <div class="accordion-header">
            <div class="accordion-heading">
              <div class="accordion-icon">🔗</div>
              <div class="accordion-title-group">
                <div class="accordion-title">Links</div>
                <div class="accordion-subtitle">External links found in description/comments</div>
              </div>
            </div>
            <div class="accordion-meta">
              <span class="result-pill">{{ extractedLinks.length }}</span>
              <span class="chevron">›</span>
            </div>
          </div>
        </summary>

        <div class="accordion-body">
          <div v-if="extractedLinks.length > 0" class="links-list">
            <div v-for="(link, idx) in extractedLinks" :key="idx" class="link-row">
              <a :href="link" target="_blank" class="link-url">{{ formatUrl(link) }}</a>
            </div>
          </div>
          <div v-else class="empty-state">
            <p class="empty-title">No external links found</p>
            <p class="empty-copy">No external links were found in the description or comments.</p>
          </div>
        </div>
      </details>

      <!-- Leads Accordion -->
      <details class="accordion">
        <summary>
          <div class="accordion-header">
            <div class="accordion-heading">
              <div class="accordion-icon">👤</div>
              <div class="accordion-title-group">
                <div class="accordion-title">Leads</div>
                <div class="accordion-subtitle">Handles mentioned across comments/results</div>
              </div>
            </div>
            <div class="accordion-meta">
              <button class="btn" @click.stop="extractLeads" :disabled="leadsLoading" title="Extract leads from comments">
                <span v-if="leadsLoading" class="spinner"></span>
                <span v-if="leadsLoading">Extracting…</span>
                <span v-else>👤 Extract</span>
              </button>
              <span class="result-pill">{{ sortedLeads.length }}</span>
              <span class="chevron">›</span>
            </div>
          </div>
        </summary>

        <div class="accordion-body">
          <div v-if="sortedLeads.length > 0" class="lead-list">
            <div v-for="lead in sortedLeads" :key="lead.url" class="lead-row">
              <a :href="lead.url" target="_blank" class="lead-handle">{{ lead.handle || lead.name }}</a>
              <span class="lead-frequency">{{ lead.count }}×</span>
            </div>
          </div>
          <div v-else class="empty-state">
            <p class="empty-title">No commenters extracted yet</p>
            <p class="empty-copy">Scroll to load comments on the YouTube page first, then click the button in the header to extract leads.</p>
          </div>
        </div>
      </details>

    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { Commenter } from '../storage'
import { mergeVideo } from '../storage'

interface ChannelInfo {
  handle: string
  subs: number
  url?: string
}

const channelInfo = ref<ChannelInfo | null>(null)
const extractedLinks = ref<string[]>([])
const extractedLeads = ref<Omit<Commenter, 'tier'>[]>([])
const videoInfo = ref<{ id: string; title: string; url: string } | null>(null)
const loading = ref(false)
const notification = ref<{ message: string; type: 'success' | 'error' } | null>(null)
const transcriptText = ref<string>('')
const transcriptLoading = ref(false)
const leadsLoading = ref(false)
const showTimestamps = ref(true)

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

const hasExtractedData = computed(() => {
  return extractedLinks.value.length > 0 || sortedLeads.value.length > 0 || transcriptText.value.length > 0
})

const displayedTranscript = computed(() => {
  if (!transcriptText.value) return ''
  if (showTimestamps.value) return transcriptText.value
  return transcriptText.value.replace(/^\d{1,2}:\d{2}(?::\d{2})?\s+/gm, '')
})

onMounted(() => {
  // Listen for data from content script
  chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    console.log('[VideoCaptureView] Received message:', request.action)

    if (request.action === 'updateData' && request.data?.pageType === 'video') {
      console.log('[VideoCaptureView] Updating video data:', request.data)

      if (request.data.videoChannelInfo) {
        channelInfo.value = {
          handle: request.data.videoChannelInfo.handle,
          subs: request.data.videoChannelInfo.subs,
          url: request.data.videoChannelInfo.url,
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

  // Request initial data from content script (channel info and links only)
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      console.log('[VideoCaptureView] ✅ Got tab ID:', tabs[0].id)
      chrome.tabs.sendMessage(tabs[0].id, { action: 'extractDataInitial' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('[VideoCaptureView] ❌ Chrome runtime error:', chrome.runtime.lastError)
          return
        }

        console.log('[VideoCaptureView] 📥 Received response:', {
          success: response?.success,
          pageType: response?.data?.pageType,
          videoChannelInfo: response?.data?.videoChannelInfo,
          linksCount: response?.data?.videoLinks?.length || 0,
        })

        if (response?.data?.pageType === 'video') {
          console.log('[VideoCaptureView] ✅ VIDEO PAGE - Processing data:', response.data)

          if (response.data.videoChannelInfo) {
            channelInfo.value = {
              handle: response.data.videoChannelInfo.handle,
              subs: response.data.videoChannelInfo.subs,
              url: response.data.videoChannelInfo.url,
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

          if (response.data.videoInfo) {
            videoInfo.value = response.data.videoInfo
            console.log('[VideoCaptureView] ✅ Video info set:', videoInfo.value)
          } else {
            console.log('[VideoCaptureView] ℹ️ No video info in response')
          }
        }

        // If no channel info from content script, that's a real error
        if (!channelInfo.value) {
          console.warn('[VideoCaptureView] ⚠️ Failed to extract channel info from page')
        }
      })
    }
  })
})

function goToChannel() {
  console.log('[VideoCaptureView] goToChannel() called', { channelInfo: channelInfo.value })
  const channelUrl = channelInfo.value?.url

  if (!channelUrl) {
    console.warn('[VideoCaptureView] No channel URL found, cannot navigate back', { channelInfo: channelInfo.value })
    return
  }

  console.log('[VideoCaptureView] Navigating to:', channelUrl)
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      console.log('[VideoCaptureView] Updating tab', tabs[0].id, 'to URL:', channelUrl)
      chrome.tabs.update(tabs[0].id, { url: channelUrl })
    } else {
      console.error('[VideoCaptureView] No active tab found')
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

function showNotification(message: string, type: 'success' | 'error' = 'success') {
  notification.value = { message, type }
  setTimeout(() => {
    notification.value = null
  }, 4000)
}

function copyTranscript() {
  if (displayedTranscript.value) {
    navigator.clipboard.writeText(displayedTranscript.value).then(() => {
      showNotification('Transcript copied to clipboard')
    }).catch(() => {
      showNotification('Failed to copy transcript', 'error')
    })
  }
}

function extractTranscript() {
  transcriptLoading.value = true
  console.log('[VideoCaptureView] ▶️ START: extractTranscript() called')

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      console.log('[VideoCaptureView] ℹ️ Tab ID:', tabs[0].id)
      console.log('[VideoCaptureView] 📤 Sending extractTranscript message to content script...')

      chrome.tabs.sendMessage(tabs[0].id, { action: 'extractTranscript' }, (response) => {
        console.log('[VideoCaptureView] 📥 Received response from content script:', response)

        if (chrome.runtime.lastError) {
          console.error('[VideoCaptureView] ❌ Chrome runtime error:', chrome.runtime.lastError)
          showNotification('Error extracting transcript. Check console.', 'error')
          transcriptLoading.value = false
          return
        }

        if (response?.success && response?.transcript) {
          console.log('[VideoCaptureView] ✅ Success! Transcript length:', response.transcript.length)
          transcriptText.value = response.transcript
          showNotification('Transcript extracted successfully')
          console.log('[VideoCaptureView] First 200 chars:', response.transcript.substring(0, 200))
        } else {
          console.error('[VideoCaptureView] ❌ Extraction failed. Error:', response?.error)
          showNotification('Failed to extract transcript. Make sure description is expanded.', 'error')
        }

        transcriptLoading.value = false
      })
    } else {
      console.error('[VideoCaptureView] ❌ No tab ID found')
      showNotification('Error: No active tab', 'error')
      transcriptLoading.value = false
    }
  })
}

function extractLeads() {
  leadsLoading.value = true
  console.log('[VideoCaptureView] ▶️ START: extractLeads() called')

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]?.id) {
      console.log('[VideoCaptureView] 📤 Sending extractCommenters message to content script...')

      chrome.tabs.sendMessage(tabs[0].id, { action: 'extractCommenters' }, (response) => {
        console.log('[VideoCaptureView] 📥 Received response from content script:', response)

        if (chrome.runtime.lastError) {
          console.error('[VideoCaptureView] ❌ Chrome runtime error:', chrome.runtime.lastError)
          showNotification('Error extracting leads. Check console.', 'error')
          leadsLoading.value = false
          return
        }

        if (response?.success && response?.commenters) {
          console.log('[VideoCaptureView] ✅ Success! Found', response.commenters.length, 'commenters')
          extractedLeads.value = response.commenters
          showNotification(`Extracted ${response.commenters.length} leads`)
        } else {
          console.error('[VideoCaptureView] ❌ Extraction failed. Error:', response?.error)
          showNotification('Failed to extract leads. Make sure comments are loaded.', 'error')
        }

        leadsLoading.value = false
      })
    } else {
      console.error('[VideoCaptureView] ❌ No tab ID found')
      showNotification('Error: No active tab', 'error')
      leadsLoading.value = false
    }
  })
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
      showNotification('Error saving. Check console.', 'error')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
@import '../youtube-design-system.css';

.youtube-module {
  max-width: 980px;
  margin: 0 auto;
  padding: 28px;
  background: var(--bg);
  color: var(--text);
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  max-height: 100vh;
  overflow-y: auto;
}

.youtube-module::-webkit-scrollbar {
  width: 8px;
}

.youtube-module::-webkit-scrollbar-track {
  background: transparent;
}

.youtube-module::-webkit-scrollbar-thumb {
  background: var(--border);
  border-radius: 4px;
}

.youtube-module::-webkit-scrollbar-thumb:hover {
  background: var(--border-strong);
}

</style>

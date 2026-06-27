<template>
  <div class="youtube-module">
    <div class="module-heading">YouTube</div>

    <!-- Loading state -->
    <div v-if="loading" class="loading">Detecting page type...</div>

    <!-- Dashboard View -->
    <DashboardView v-else-if="view.type === 'dashboard'" />

    <!-- Channel Detail View -->
    <ChannelDetailView
      v-else-if="view.type === 'channel-detail'"
      :channel-handle="view.selectedChannel!"
    />

    <!-- Video Detail View -->
    <VideoDetailView
      v-else-if="view.type === 'video-detail'"
      :channel-handle="view.selectedChannel!"
      :video-id="view.selectedVideo!"
    />

    <!-- Capture Views (when on actual YouTube pages) -->
    <VideoCaptureView v-else-if="pageContext.type === 'video'" />
    <ChannelCaptureView v-else-if="pageContext.type === 'channel'" />

    <!-- Unknown page -->
    <div v-else class="view-container">
      <div class="view-label">❓ NOT A YOUTUBE PAGE</div>
      <p class="view-description">YouTube module only works on youtube.com</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import type { PageContext } from './navigator'
import DashboardView from './components/DashboardView.vue'
import ChannelDetailView from './components/ChannelDetailView.vue'
import VideoDetailView from './components/VideoDetailView.vue'
import VideoCaptureView from './components/VideoCaptureView.vue'
import ChannelCaptureView from './components/ChannelCaptureView.vue'

interface ViewState {
  type: 'dashboard' | 'channel-detail' | 'video-detail' | 'capture'
  selectedChannel?: string
  selectedVideo?: string
}

interface Navigation {
  goToDashboard: () => void
  goToChannel: (channelHandle: string) => void
  goToVideo: (videoId: string) => void
}

const loading = ref(true)
const pageContext = ref<PageContext>({ type: 'unknown' })
const view = ref<ViewState>({ type: 'dashboard' })

const navigation: Navigation = {
  goToDashboard() {
    view.value = { type: 'dashboard' }
  },
  goToChannel(channelHandle: string) {
    view.value = {
      type: 'channel-detail',
      selectedChannel: channelHandle,
    }
  },
  goToVideo(videoId: string) {
    view.value = {
      type: 'video-detail',
      selectedChannel: view.value.selectedChannel,
      selectedVideo: videoId,
    }
  },
}

provide('youtube-navigation', navigation)

onMounted(() => {
  updatePageContext()

  // Listen for tab changes
  chrome.tabs.onActivated.addListener(() => {
    updatePageContext()
  })
  chrome.tabs.onUpdated.addListener(() => {
    updatePageContext()
  })
})

async function updatePageContext() {
  try {
    console.log('[YouTube] updatePageContext called')

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    console.log('[YouTube] chrome.tabs.query result:', tabs)

    const activeTab = tabs[0]
    console.log('[YouTube] Active tab:', activeTab)

    if (!activeTab?.url) {
      console.log('[YouTube] No active tab URL found')
      pageContext.value = { type: 'unknown' }
      return
    }

    const url = new URL(activeTab.url)
    const hostname = url.hostname
    const pathname = url.pathname

    console.log('[YouTube] Parsed URL - hostname:', hostname, 'pathname:', pathname)
    console.log('[YouTube] Full tab URL:', activeTab.url)

    // Must be youtube.com
    if (!hostname.includes('youtube.com')) {
      console.log('[YouTube] Not youtube.com, hostname:', hostname)
      pageContext.value = { type: 'unknown' }
      return
    }

    console.log('[YouTube] Is youtube.com, checking pathname...')

    // Home page: www.youtube.com or www.youtube.com/
    if (pathname === '/' || pathname === '') {
      console.log('[YouTube] Detected HOME page')
      pageContext.value = { type: 'home' }
      return
    }

    // Video page: /watch?v=xxx
    if (pathname === '/watch') {
      const videoId = url.searchParams.get('v')
      console.log('[YouTube] Detected VIDEO page, videoId:', videoId)
      pageContext.value = { type: 'video', videoId: videoId || undefined }
      return
    }

    // Channel page: /@handle or /channel/id or /c/handle
    if (pathname.startsWith('/@')) {
      const handle = pathname.slice(0, pathname.indexOf('/', 1)) || pathname.slice(1)
      console.log('[YouTube] Detected CHANNEL page (@handle), handle:', handle)
      pageContext.value = { type: 'channel', channelHandle: handle }
      return
    }

    if (pathname.startsWith('/channel/')) {
      const handle = pathname.split('/')[2]
      console.log('[YouTube] Detected CHANNEL page (/channel), handle:', handle)
      pageContext.value = { type: 'channel', channelHandle: handle }
      return
    }

    if (pathname.startsWith('/c/')) {
      const handle = pathname.split('/')[2]
      console.log('[YouTube] Detected CHANNEL page (/c), handle:', handle)
      pageContext.value = { type: 'channel', channelHandle: handle }
      return
    }

    console.log('[YouTube] No pathname match, type=unknown, pathname was:', pathname)
    pageContext.value = { type: 'unknown' }
  } catch (error) {
    console.error('[YouTube] Failed to detect page context:', error)
    console.error('[YouTube] Error details:', (error as Error).message)
    pageContext.value = { type: 'unknown' }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.youtube-module {
  padding: 12px 16px 16px;
}

.module-heading {
  font-weight: 600;
  font-size: 14px;
  color: #202124;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.loading {
  padding: 24px 12px;
  text-align: center;
  color: #999;
  font-size: 13px;
}

.view-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.view-label {
  font-weight: 600;
  font-size: 13px;
  color: #202124;
  margin-bottom: 4px;
}

.view-description {
  font-size: 12px;
  color: #666;
  margin: 0;
  line-height: 1.4;
}
</style>

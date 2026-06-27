<template>
  <div class="youtube-module">
    <div class="module-heading">
        YouTube
    </div>
    <div v-if="tab" class="site-info">
      <img v-if="tab.favIconUrl" :src="tab.favIconUrl" class="favicon" alt="favicon" />
      <div class="site-details">
        <div class="site-title">{{ tab.title }}</div>
        <a :href="tab.url" class="site-url" target="_blank">{{ tab.url }}</a>
      </div>
    </div>
    <div v-else class="loading">Loading tab info...</div>

    <div class="coming-soon-section">
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
import { ref, onMounted } from 'vue'

const tab = ref<chrome.tabs.Tab | null>(null)

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

onMounted(async () => {
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true })
  tab.value = activeTab ?? null
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

.coming-soon-section {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.feature-group {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px;
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

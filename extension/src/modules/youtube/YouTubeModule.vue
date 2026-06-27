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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const tab = ref<chrome.tabs.Tab | null>(null)

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
</style>

<template>
  <ModuleLayout :active-module-id="activeModuleId" :current-url="currentUrl" @navigate-home="handleNavigateHome" />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import ModuleLayout from './ModuleLayout.vue'

const currentUrl = ref('')
const forceHomeModule = ref(false)

const activeModuleId = computed(() => {
  if (forceHomeModule.value) {
    return null
  }

  if (currentUrl.value.includes('google.com/maps')) {
    return 'google-maps'
  }

  if (currentUrl.value.includes('youtube.com')) {
    return 'youtube'
  }

  if (currentUrl.value.includes('linkedin.com/in/')) {
    return 'linkedin'
  }

  if (currentUrl.value.startsWith('http')) {
    return 'website'
  }

  return null
})

function handleNavigateHome() {
  forceHomeModule.value = true
}

onMounted(async () => {
  if (!chrome?.tabs) {
return
}

  const tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0]

  if (tab) {
    currentUrl.value = tab.url || ''
  }

  // Listen for tab changes
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId)
    currentUrl.value = tab.url || ''
    forceHomeModule.value = false
  })

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
      currentUrl.value = tab.url || ''
      forceHomeModule.value = false
    }
  })
})
</script>

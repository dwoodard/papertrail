<template>
  <component :is="activeModule" />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import GoogleMapsModule from './modules/google-maps/GoogleMapsModule.vue'
import DefaultModule from './modules/DefaultModule.vue'

const currentUrl = ref('')

const activeModule = computed(() => {
  if (currentUrl.value.includes('google.com/maps')) {
    return GoogleMapsModule
  }
  return DefaultModule
})

onMounted(async () => {
  const tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0]
  if (tab) {
    currentUrl.value = tab.url || ''
  }

  // Listen for tab changes
  chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId)
    currentUrl.value = tab.url || ''
  })

  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.active) {
      currentUrl.value = tab.url || ''
    }
  })
})
</script>

<template>
  <div class="module-layout">
    <header class="module-header">
      <a :href="mainPageUrl" class="header-left" @click="handlePapertrailClick">
        <div class="logo">
          <Paperclip :size="20" />
        </div>
        <span class="title">Papertrail</span>
      </a>
      <div class="nav-separator" v-if="activeModuleId"></div>
      <button
        v-if="activeModuleId"
        class="nav-home-btn"
        @click="$emit('navigate-home')"
        title="Back to home"
      >
        ← Home
      </button>
      <div v-if="activeModuleId" class="nav-breadcrumb">
        <span class="breadcrumb-text">{{ activeModuleLabel }}</span>
      </div>
    </header>
    <div class="module-content">
      <component :is="activeModule" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { Paperclip } from '@lucide/vue'
import GoogleMapsModule from './modules/google-maps/GoogleMapsModule.vue'
import DefaultModule from './modules/DefaultModule.vue'

const props = defineProps({
  activeModuleId: String,
  currentUrl: String
})

defineEmits(['navigate-home'])

const mainPageUrl = ref('')

onMounted(() => {
  mainPageUrl.value = chrome.runtime.getURL('src/pages/main.html')
})

function handlePapertrailClick(e) {
  e.preventDefault()

  // Check if the tab is already open
  chrome.tabs.query({ url: mainPageUrl.value }, (tabs) => {
    if (tabs.length > 0) {
      // Tab exists, focus it
      chrome.tabs.update(tabs[0].id, { active: true })
      chrome.windows.update(tabs[0].windowId, { focused: true })
    } else {
      // Tab doesn't exist, create a new one
      chrome.tabs.create({ url: mainPageUrl.value })
    }
  })
}

const moduleLabels = {
  'google-maps': 'Google Maps'
}

const activeModule = computed(() => {
  if (props.activeModuleId === 'google-maps') {
    return GoogleMapsModule
  }
  return DefaultModule
})

const activeModuleLabel = computed(() => {
  return moduleLabels[props.activeModuleId] || ''
})
</script>

<style scoped>
.module-layout {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
}

.module-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  height: auto;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.2s;
}

.header-left:hover {
  opacity: 0.8;
}

.logo {
  display: flex;
  align-items: center;
  cursor: pointer;
  text-decoration: none;
  color: #1a73e8;
  transition: opacity 0.2s;
}

.logo:hover {
  opacity: 0.8;
}

.title {
  font-weight: 600;
  font-size: 16px;
  color: #1a73e8;
  cursor: pointer;
}

.nav-separator {
  width: 1px;
  height: 24px;
  background: #e0e0e0;
  margin: 0 4px;
}

.nav-home-btn {
  padding: 6px 12px;
  background: transparent;
  border: 1px solid #d0d0d0;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  color: #666;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.nav-home-btn:hover {
  background: #f5f5f5;
  border-color: #999;
  color: #333;
}

.nav-home-btn.active {
  background: #1a73e8;
  border-color: #1a73e8;
  color: white;
}

.nav-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.breadcrumb-text {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.module-content {
  flex: 1;
  overflow: hidden;
}
</style>

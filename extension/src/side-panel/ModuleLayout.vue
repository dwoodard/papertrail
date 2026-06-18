<template>
  <div class="module-layout">
    <nav class="module-nav">
      <a :href="mainPageUrl" target="_blank" class="nav-brand">
        <span class="brand-icon">📎</span>
        <span class="brand-text">Papertrail</span>
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
    </nav>
    <div class="module-content">
      <component :is="activeModule" />
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import GoogleMapsModule from './modules/google-maps/GoogleMapsModule.vue'
import YelpModule from './modules/yelp/YelpModule.vue'
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

const moduleLabels = {
  'google-maps': 'Google Maps',
  'yelp': 'Yelp Business Leads'
}

const activeModule = computed(() => {
  if (props.activeModuleId === 'google-maps') {
    return GoogleMapsModule
  }
  if (props.activeModuleId === 'yelp') {
    return YelpModule
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

.module-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #e0e0e0;
  min-height: 48px;
}

.nav-brand {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  text-decoration: none;
  transition: opacity 0.2s;
}

.nav-brand:hover {
  opacity: 0.8;
}

.brand-icon {
  font-size: 16px;
}

.brand-text {
  font-size: 14px;
  font-weight: 600;
  color: #1a73e8;
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

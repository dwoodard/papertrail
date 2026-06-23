<template>
  <header>
    <div class="header-top">
      <h1>Google Maps Scraper</h1>
      <div class="header-buttons">
        <div class="project-selector">
          <label for="project-select">Project:</label>
          <select
            id="project-select"
            :value="selectedProjectId"
            @change="selectProject"
            title="Select project to sync to"
          >
            <option value="" disabled>Choose a project...</option>
            <option v-for="project in projects" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
        </div>
        <button v-if="!isSidePanel" class="btn-header" @click="openSidePanel" title="Open side panel for persistent view">📍 Side Panel</button>
        <DataManager @clean-done="cleanDone" />
        <ExportDropdown :results="results" :keyword="selectedKeyword" />
      </div>
    </div>
    <div class="toggle-section">
      <label title="Enable to auto-capture listings as you click them on Google Maps">
        <input
          type="checkbox"
          :checked="active"
          @change="toggleActive($event.target.checked)"
        />
        <span :class="['indicator', active ? 'active' : 'inactive']"></span>
        <span id="statusText">{{ active ? 'Auto-Capture On' : 'Auto-Capture Off' }}</span>
      </label>
      <span class="count">{{ total }} total</span>
    </div>
  </header>
</template>

<script setup>
import ExportDropdown from './ExportDropdown.vue'
import DataManager from './DataManager.vue'

defineProps({
  active: Boolean,
  total: Number,
  results: Array,
  isSidePanel: Boolean,
  selectedKeyword: String,
  projects: Array,
  selectedProjectId: String,
})

const emit = defineEmits(['toggle-active', 'clean-done', 'select-project'])

function selectProject(event) {
  emit('select-project', event.target.value)
}

function toggleActive(checked) {
  emit('toggle-active', checked)
}

function cleanDone() {
  emit('clean-done')
}

async function openSidePanel() {
  try {
    const tab = (await chrome.tabs.query({ active: true, currentWindow: true }))[0]
    if (tab) {
      await chrome.sidePanel.open({ tabId: tab.id })
    }
  } catch (err) {
    console.error('[Header] Error opening side panel:', err)
  }
}
</script>

<style scoped>
.header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

h1 {
  margin-bottom: 0;
}

.header-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

.project-selector {
  display: flex;
  gap: 6px;
  align-items: center;
}

.project-selector label {
  font-size: 12px;
  font-weight: 500;
  color: #666;
}

.project-selector select {
  padding: 6px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  font-size: 12px;
  cursor: pointer;
  max-width: 180px;
}

.btn-header {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #1a73e8;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-header:hover {
  background: #f0f7ff;
  border-color: #1a73e8;
  box-shadow: 0 2px 4px rgba(26, 115, 232, 0.15);
}

.btn-header:active {
  background: #e8f0ff;
}
</style>

<template>
  <div class="app-header">
    <div class="header-left">
      <h1>Yelp Business Leads</h1>
      <div class="stats">
        <span class="stat">{{ total }} results</span>
      </div>
    </div>
    <div class="header-right">
      <button
        class="toggle-button"
        :class="{ active }"
        @click="$emit('toggle-active', !active)"
      >
        {{ active ? 'Capturing' : 'Paused' }}
      </button>
      <button class="export-button" @click="handleExport" :disabled="results.length === 0">
        Export
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  active: Boolean,
  total: Number,
  results: Array,
  isSidePanel: Boolean,
  selectedKeyword: String
})

defineEmits(['toggle-active', 'clean-done'])

function handleExport() {
  // TODO: Implement export functionality
  console.log('Export clicked')
}
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: white;
}

.header-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header-left h1 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.stats {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: #6b7280;
}

.header-right {
  display: flex;
  gap: 8px;
}

.toggle-button,
.export-button {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: white;
  color: #374151;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.toggle-button:hover,
.export-button:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.toggle-button.active {
  background: #10b981;
  color: white;
  border-color: #10b981;
}

.export-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>

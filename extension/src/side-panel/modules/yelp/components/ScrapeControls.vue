<template>
  <div class="scrape-controls">
    <button
      class="bulk-scrape-button"
      :disabled="isScraping"
      @click="$emit('bulk-scrape')"
    >
      {{ isScraping ? 'Scraping...' : 'Start Bulk Scrape' }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  isScraping: Boolean
})

defineEmits(['bulk-scrape'])
</script>

<style scoped>
.scrape-controls {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: white;
}

.bulk-scrape-button {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.bulk-scrape-button:hover:not(:disabled) {
  background: #2563eb;
}

.bulk-scrape-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

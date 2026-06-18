<template>
  <div class="progress-bar">
    <div class="progress-content">
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <div class="progress-info">
        <span>{{ done }} / {{ total }}</span>
        <button class="stop-btn" @click="$emit('stop')">Stop</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  done: Number,
  total: Number
})

defineEmits(['stop'])

const progressPercent = computed(() => {
  if (!props.total) return 0
  return Math.round((props.done / props.total) * 100)
})
</script>

<style scoped>
.progress-bar {
  padding: 12px 16px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.progress-content {
  display: flex;
  gap: 12px;
  align-items: center;
}

.progress-track {
  flex: 1;
  height: 4px;
  background: #e5e7eb;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3b82f6, #2563eb);
  transition: width 0.3s ease;
}

.progress-info {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
  color: #6b7280;
  white-space: nowrap;
}

.stop-btn {
  padding: 4px 8px;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 3px;
  font-size: 11px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}

.stop-btn:hover {
  background: #f3f4f6;
  border-color: #9ca3af;
}
</style>

<template>
  <div v-if="showResizeHandle" class="resize-handle">
    <button class="resize-button" @click="handleSaveSize">
      Save Size
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  popupSize: Object,
  onSaveSize: Function
})

const showResizeHandle = ref(true)

function handleSaveSize() {
  // TODO: Implement save size logic
}
</script>

<style scoped>
.resize-handle {
  padding: 8px 16px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  display: flex;
  justify-content: flex-end;
}

.resize-button {
  padding: 6px 12px;
  background: #e5e7eb;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.resize-button:hover {
  background: #d1d5db;
}
</style>

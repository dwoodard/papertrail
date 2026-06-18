<template>
  <teleport v-if="modelValue" to="body">
    <div class="modal-overlay" @click="$emit('cancel')">
      <div class="modal-content" @click.stop>
        <h2 class="modal-title">{{ title }}</h2>
        <p class="modal-message">{{ message }}</p>
        <div class="modal-actions">
          <button class="cancel-btn" @click="$emit('cancel')">Cancel</button>
          <button class="confirm-btn" :class="{ danger }" @click="$emit('confirm')">
            {{ confirmLabel }}
          </button>
        </div>
      </div>
    </div>
  </teleport>
</template>

<script setup>
defineProps({
  modelValue: Boolean,
  title: String,
  message: String,
  confirmLabel: String,
  danger: Boolean
})

defineEmits(['confirm', 'cancel'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 400px;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
}

.modal-title {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
}

.modal-message {
  margin: 0 0 20px 0;
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.cancel-btn,
.confirm-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-btn {
  background: #e5e7eb;
  color: #1f2937;
}

.cancel-btn:hover {
  background: #d1d5db;
}

.confirm-btn {
  background: #3b82f6;
  color: white;
}

.confirm-btn:hover {
  background: #2563eb;
}

.confirm-btn.danger {
  background: #ef4444;
}

.confirm-btn.danger:hover {
  background: #dc2626;
}
</style>

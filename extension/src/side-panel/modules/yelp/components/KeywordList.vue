<template>
  <div class="keyword-list">
    <div class="list-header">
      <h3>Keywords</h3>
      <span class="count">{{ Object.keys(keywordGroups).length }}</span>
    </div>
    <div class="list-content">
      <div
        v-for="(keyword, index) in Object.keys(keywordGroups)"
        :key="index"
        class="keyword-item"
        :class="{ active: keyword === selectedKeyword }"
        @click="$emit('select', keyword)"
      >
        <div class="keyword-name">{{ keyword }}</div>
        <div class="keyword-meta">
          <span class="count-badge">{{ keywordGroups[keyword]?.length || 0 }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  keywordGroups: Object,
  selectedKeyword: String,
  activeKeyword: String
})

defineEmits(['select', 'request-clear'])
</script>

<style scoped>
.keyword-list {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.list-header {
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.list-header h3 {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.list-header .count {
  font-size: 12px;
  color: #9ca3af;
}

.list-content {
  flex: 1;
  overflow-y: auto;
}

.keyword-item {
  padding: 10px 16px;
  border-bottom: 1px solid #f3f4f6;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.15s;
}

.keyword-item:hover {
  background: #f9fafb;
}

.keyword-item.active {
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
  padding-left: 13px;
}

.keyword-name {
  font-size: 13px;
  color: #1f2937;
  font-weight: 500;
}

.keyword-meta {
  display: flex;
  gap: 8px;
  align-items: center;
}

.count-badge {
  display: inline-block;
  padding: 2px 6px;
  background: #e5e7eb;
  border-radius: 3px;
  font-size: 11px;
  color: #6b7280;
}
</style>

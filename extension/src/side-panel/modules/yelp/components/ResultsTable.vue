<template>
  <div class="results-table">
    <div v-if="filteredResults.length === 0" class="empty-state">
      <div class="empty-message">No results yet</div>
      <div class="empty-hint">Start scraping to collect business data</div>
    </div>
    <div v-else class="table-content">
      <table>
        <thead>
          <tr>
            <th>Business Name</th>
            <th>Category</th>
            <th>Rating</th>
            <th>Reviews</th>
            <th>Phone</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in filteredResults" :key="item.businessId || item.name">
            <td class="name">{{ item.name }}</td>
            <td>{{ item.category }}</td>
            <td>{{ item.rating }}</td>
            <td>{{ item.reviewCount }}</td>
            <td>{{ item.phone }}</td>
            <td class="actions">
              <button class="delete-btn" @click="$emit('delete', item)">×</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  selectedKeyword: String,
  keywordGroups: Object
})

defineEmits(['delete'])

const filteredResults = computed(() => {
  if (!props.selectedKeyword || !props.keywordGroups) {
    return []
  }
  return props.keywordGroups[props.selectedKeyword] || []
})
</script>

<style scoped>
.results-table {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  background: white;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  color: #9ca3af;
  gap: 8px;
}

.empty-message {
  font-weight: 500;
  font-size: 14px;
}

.empty-hint {
  font-size: 12px;
  color: #d1d5db;
}

.table-content {
  flex: 1;
  overflow-y: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

thead {
  position: sticky;
  top: 0;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

th {
  padding: 10px 12px;
  text-align: left;
  font-weight: 600;
  color: #6b7280;
  border: none;
}

td {
  padding: 10px 12px;
  border-bottom: 1px solid #f3f4f6;
  color: #1f2937;
}

td.name {
  font-weight: 500;
  max-width: 150px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

td.actions {
  text-align: center;
  padding: 0;
}

.delete-btn {
  width: 24px;
  height: 24px;
  padding: 0;
  border: none;
  background: transparent;
  color: #ef4444;
  font-size: 18px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  transition: all 0.15s;
}

.delete-btn:hover {
  background: #fee2e2;
}
</style>

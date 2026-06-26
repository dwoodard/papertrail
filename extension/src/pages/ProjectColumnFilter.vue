<template>
  <div class="project-filter-container">
    <div class="search-wrapper">
      <span class="search-icon">🔍</span>
      <input
        v-model="filterText"
        type="text"
        class="filter-input"
        placeholder="Search projects..."
        @input="handleInput"
        @focus="showSuggestions = true"
        @blur="delayedCloseSuggestions"
        list="project-suggestions"
      />
      <button
        v-if="filterText"
        class="clear-btn"
        @click="clearFilter"
        title="Clear filter"
      >
        ✕
      </button>
    </div>

    <datalist id="project-suggestions">
      <option
        v-for="project in filteredProjects"
        :key="project"
        :value="project"
      />
    </datalist>

    <div v-if="showSuggestions && filteredProjects.length > 0" class="suggestions-dropdown">
      <div
        v-for="project in filteredProjects"
        :key="project"
        class="suggestion-item"
        @click="selectProject(project)"
      >
        {{ project }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface IFilterParams {
  colDef: any
  data: any[]
  onFilterChanged: () => void
}

const props = defineProps<{
  params: IFilterParams
}>()

const filterText = ref('')
const showSuggestions = ref(false)
const allProjects = ref<string[]>([])

// Extract unique project names from row data
onMounted(() => {
  const projectSet = new Set<string>()
  props.params.data?.forEach((row: any) => {
    if (row.project?.name) {
      projectSet.add(row.project.name)
    }
  })
  allProjects.value = Array.from(projectSet).sort()
})

const filteredProjects = computed(() => {
  if (!filterText.value) {
return allProjects.value
}

  const lowerText = filterText.value.toLowerCase()

  return allProjects.value.filter(project =>
    project.toLowerCase().includes(lowerText)
  )
})

function handleInput() {
  showSuggestions.value = true
  props.params.onFilterChanged()
}

function selectProject(project: string) {
  filterText.value = project
  showSuggestions.value = false
  props.params.onFilterChanged()
}

function clearFilter() {
  filterText.value = ''
  showSuggestions.value = false
  props.params.onFilterChanged()
}

function delayedCloseSuggestions() {
  setTimeout(() => {
    showSuggestions.value = false
  }, 200)
}

// Implement AG-Grid filter interface
function getModel() {
  if (!filterText.value) {
return null
}

  return { filter: filterText.value, filterType: 'text', type: 'contains' }
}

function setModel(model: any) {
  filterText.value = model?.filter || ''
}

// Expose methods to AG-Grid
defineExpose({
  getModel,
  setModel,
})
</script>

<style scoped>
.project-filter-container {
  padding: 8px;
  background: var(--pt-surface, #1a1f2e);
  border-radius: 6px;
  position: relative;
}

.search-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--pt-bg, #0f1419);
  border: 1px solid var(--pt-border, #3a4557);
  border-radius: 4px;
  transition: all 0.2s ease;
}

.search-wrapper:focus-within {
  border-color: var(--pt-accent, #4a90e2);
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.search-icon {
  font-size: 12px;
  opacity: 0.6;
}

.filter-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--pt-text, #e8e9eb);
  font-family: inherit;
  font-size: 12px;
  outline: none;
}

.filter-input::placeholder {
  color: var(--pt-text-muted, #a8adb5);
}

.clear-btn {
  background: transparent;
  border: none;
  color: var(--pt-text-muted, #a8adb5);
  cursor: pointer;
  font-size: 12px;
  padding: 2px 4px;
  transition: color 0.2s ease;
}

.clear-btn:hover {
  color: var(--pt-text, #e8e9eb);
}

.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 8px;
  right: 8px;
  background: var(--pt-surface, #1a1f2e);
  border: 1px solid var(--pt-border, #3a4557);
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.suggestion-item {
  padding: 8px 12px;
  color: var(--pt-text, #e8e9eb);
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s ease;
  border-bottom: 1px solid var(--pt-border, #3a4557);
}

.suggestion-item:last-child {
  border-bottom: none;
}

.suggestion-item:hover {
  background: rgba(74, 144, 226, 0.15);
  color: var(--pt-accent, #4a90e2);
  padding-left: 16px;
}
</style>

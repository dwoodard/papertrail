<template>
  <div class="papertrail">
    <!-- Frame 1: Project Detail -->
    <ProjectDetail v-if="selectedProject" :project="selectedProject" @back="selectedProject = null" />

    <!-- Frame 0: Hub (Default View) -->
    <template v-else>
      <header class="header">
        <div class="header__left">
          <h1 class="header__logo">Papertrail</h1>
          <p class="header__subtitle">Intelligence Research Platform</p>
        </div>
        <div class="header__actions">
          <button class="btn-new" @click="openCreateModal">
            <span class="btn-new__icon">+</span>
            New Project
          </button>
        </div>
      </header>

      <nav class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab"
          :class="['tab', { 'tab--active': activeTab === tab }]"
          @click="activeTab = tab"
        >
          <span class="tab__label">{{ tab }}</span>
          <span v-if="tab === activeTab" class="tab__indicator"></span>
        </button>
      </nav>

      <main class="content">
        <!-- Overview Tab -->
        <div v-show="activeTab === 'Overview'" class="tab-pane">
          <section v-if="projects.length > 0" class="projects-section">
            <h2 class="section-title">Active Projects</h2>
            <div class="projects-grid">
              <article
                v-for="project in projects"
                :key="project.id"
                class="project-card"
                @click="selectedProject = project"
              >
                <div class="project-card__header">
                  <h3 class="project-card__title">{{ project.name }}</h3>
                  <span class="project-card__badge">Active</span>
                </div>

                <p class="project-card__goal">{{ project.goal }}</p>

                <div class="project-card__stats">
                  <div class="stat">
                    <span class="stat__value">{{ project.observations }}</span>
                    <span class="stat__label">observations</span>
                  </div>
                  <div class="stat">
                    <span class="stat__value">{{ project.entities }}</span>
                    <span class="stat__label">entities</span>
                  </div>
                  <div class="stat">
                    <span class="stat__value">{{ project.suggestions }}</span>
                    <span class="stat__label">suggestions</span>
                  </div>
                </div>

                <div class="project-card__footer">
                  <time class="project-card__time">{{ project.lastActivity }}</time>
                  <div class="project-card__actions">
                    <button class="btn-action" title="Open project">
                      <span>→</span>
                    </button>
                  </div>
                </div>
              </article>
            </div>
          </section>

          <section v-else class="empty-state">
            <div class="empty-state__content">
              <h2 class="empty-state__title">No Projects Yet</h2>
              <p class="empty-state__text">Start your first research project to begin collecting intelligence.</p>
              <button class="btn-primary" @click="openCreateModal">Create Project</button>
            </div>
          </section>
        </div>

        <!-- Graph Tab -->
        <div v-show="activeTab === 'Graph'" class="tab-pane graph-tab">
          <div class="graph-header">
            <div class="header-left">
              <div class="search-box">
                <span class="search-icon">🔍</span>
                <input
                  v-model="graphSearch"
                  type="text"
                  placeholder="Search entities..."
                  class="search-input"
                />
                <button v-if="graphSearch" class="search-clear" @click="graphSearch = ''">✕</button>
              </div>
            </div>

            <div class="header-center">
              <div class="filter-group">
                <span class="filter-label">Filter by Project:</span>
                <select v-model="selectedGraphProject" class="filter-select">
                  <option value="">All Projects</option>
                  <option v-for="project in projects" :key="project.id" :value="project.id">
                    {{ project.name }}
                  </option>
                </select>
              </div>
            </div>

            <div class="header-right">
              <button
                v-if="graphSearch || selectedGraphProject"
                class="btn-reset-header"
                @click="resetGraphView"
              >
                Reset
              </button>
            </div>
          </div>

          <div class="graph-container-wrapper">
            <div class="graph-canvas" ref="hubGraphContainer">
              <!-- Hub graph renders here -->
            </div>

            <div :class="['graph-stats', { 'stats-open': selectedGraphNode }]">
              <template v-if="selectedGraphNode">
                <div class="stats-header">
                  <div class="stats-title">
                    <div class="type-badge" :class="`badge-${selectedGraphNode.type}`">
                      {{ selectedGraphNode.type }}
                    </div>
                    <h4>{{ selectedGraphNode.name }}</h4>
                  </div>
                  <button class="stats-close" @click="selectedGraphNode = null">✕</button>
                </div>

                <div class="stats-body">
                  <section class="stats-section">
                    <h5 class="section-title">About</h5>
                    <div v-if="selectedGraphNode.value" class="info-row">
                      <span class="info-label">Connections:</span>
                      <span class="info-value">{{ selectedGraphNode.value }}</span>
                    </div>
                    <div v-if="selectedGraphNode.confidence" class="info-row">
                      <span class="info-label">Confidence:</span>
                      <span class="info-value">{{ Math.round(selectedGraphNode.confidence * 100) }}%</span>
                    </div>
                  </section>

                  <section class="stats-section">
                    <button class="action-btn" @click="navigateToProjectGraph">
                      View in Project →
                    </button>
                  </section>
                </div>
              </template>

              <template v-else>
                <div class="stats-empty">
                  <div class="empty-icon">◯</div>
                  <p>Click an entity to view details</p>
                </div>
              </template>
            </div>
          </div>

          <div class="graph-footer">
            <div class="graph-stats-summary">
              <div class="stat-item">
                <span class="stat-label">Total Entities</span>
                <span class="stat-value">{{ totalEntitiesCount }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total Projects</span>
                <span class="stat-value">{{ projects.length }}</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">Total Relationships</span>
                <span class="stat-value">{{ totalRelationshipsCount }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Entities Tab -->
        <div v-show="activeTab === 'Entities'" class="tab-pane">
          <section class="placeholder-section">
            <div class="placeholder">
              <h2>All Entities</h2>
              <p>Cross-project entity directory and search</p>
            </div>
          </section>
        </div>

        <!-- Timeline Tab -->
        <div v-show="activeTab === 'Timeline'" class="tab-pane">
          <section class="placeholder-section">
            <div class="placeholder">
              <h2>Activity Timeline</h2>
              <p>Master timeline across all projects</p>
            </div>
          </section>
        </div>
      </main>

      <!-- Create Project Modal -->
      <Teleport to="body">
        <div v-if="showCreateModal" class="modal-overlay" @click="closeCreateModal">
          <div class="modal" @click.stop>
            <div class="modal__header">
              <h2 class="modal__title">New Project</h2>
              <button class="modal__close" @click="closeCreateModal">×</button>
            </div>

            <form class="modal__form" @submit.prevent="createProject">
              <div class="form-group">
                <label class="form-label" for="project-name">Project Name *</label>
                <input
                  id="project-name"
                  v-model="form.name"
                  class="form-input"
                  type="text"
                  placeholder="e.g., Davis County Contractors"
                  required
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="project-goal">Research Goal</label>
                <input
                  id="project-goal"
                  v-model="form.goal"
                  class="form-input"
                  type="text"
                  placeholder="What are you trying to discover?"
                />
              </div>

              <div class="form-group">
                <label class="form-label" for="project-target">Starting Target</label>
                <input
                  id="project-target"
                  v-model="form.target"
                  class="form-input"
                  type="text"
                  placeholder="Initial search terms or scope"
                />
              </div>

              <div class="modal__actions">
                <button type="button" class="btn-secondary" @click="closeCreateModal">Cancel</button>
                <button type="submit" class="btn-primary" :disabled="!form.name.trim()">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      </Teleport>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue'
import ProjectDetail from './ProjectDetail.vue'
import { useGraphSimulation, type GraphData, type GraphNode } from '../composables/useGraphSimulation'
import graphExamples from '../data/examples/graphs.json'

const activeTab = ref('Overview')
const tabs = ['Overview', 'Graph', 'Entities', 'Timeline']
const showCreateModal = ref(false)
const selectedProject = ref<any>(null)

// Graph view state
const hubGraphContainer = ref<HTMLElement | null>(null)
const graphSearch = ref('')
const selectedGraphProject = ref('')
const selectedGraphNode = ref<GraphNode | null>(null)
const { initializeGraph } = useGraphSimulation(hubGraphContainer)

const form = reactive({
  name: '',
  goal: '',
  target: '',
})

const projects = ref([
  {
    id: 'davis-county-contractors',
    name: 'Davis County Contractors',
    goal: 'Find decision makers for contractor businesses',
    observations: 48,
    entities: 12,
    suggestions: 6,
    lastActivity: '2 hours ago',
  },
  {
    id: 'tech-research',
    name: 'Tech Sector Analysis',
    goal: 'Map key players and funding connections',
    observations: 124,
    entities: 35,
    suggestions: 8,
    lastActivity: '1 hour ago',
  },
  {
    id: 'nonprofit-network',
    name: 'Nonprofit Network Study',
    goal: 'Understand funding patterns in nonprofit sector',
    observations: 87,
    entities: 28,
    suggestions: 9,
    lastActivity: '45 minutes ago',
  },
  {
    id: 'real-estate-connections',
    name: 'Real Estate Investment Group',
    goal: 'Track commercial property ownership chains',
    observations: 156,
    entities: 42,
    suggestions: 12,
    lastActivity: '30 minutes ago',
  },
])

function openCreateModal(): void {
  showCreateModal.value = true
}

function closeCreateModal(): void {
  showCreateModal.value = false
  form.name = ''
  form.goal = ''
  form.target = ''
}

function createProject(): void {
  if (!form.name.trim()) return

  projects.value.unshift({
    id: Date.now().toString(),
    name: form.name,
    goal: form.goal,
    observations: 0,
    entities: 0,
    suggestions: 0,
    lastActivity: 'just now',
  })

  closeCreateModal()
}

// Graph view functions
const totalEntitiesCount = computed(() => {
  return (graphExamples.examples as any[]).reduce((sum, example) => sum + example.nodes.length, 0)
})

const totalRelationshipsCount = computed(() => {
  return (graphExamples.examples as any[]).reduce((sum, example) => sum + example.links.length, 0)
})

function resetGraphView(): void {
  graphSearch.value = ''
  selectedGraphProject.value = ''
  selectedGraphNode.value = null
}

function navigateToProjectGraph(): void {
  if (!selectedGraphNode.value) return

  // Find which project contains this node
  const project = projects.value.find((p) => {
    const exampleProject = (graphExamples.examples as any[]).find((ex) => ex.id === p.id)
    if (!exampleProject) return false
    return exampleProject.nodes.some((n: any) => n.id === selectedGraphNode.value!.id)
  })

  if (project) {
    selectedProject.value = project
  }
}

function buildHubGraphData(): GraphData {
  // Combine all example graphs into one with project labels, optionally filtered by project
  const allNodes: GraphNode[] = []
  const allLinks: any[] = []
  const nodeMap = new Map<string, GraphNode>()

  ;(graphExamples.examples as any[]).forEach((example) => {
    // Skip this project if a specific project is selected
    if (selectedGraphProject.value && selectedGraphProject.value !== example.id) {
      return
    }

    example.nodes.forEach((node: any) => {
      // Filter by search query (case-insensitive)
      const matchesSearch = !graphSearch.value ||
        node.name.toLowerCase().includes(graphSearch.value.toLowerCase())

      if (!matchesSearch) return

      if (!nodeMap.has(node.id)) {
        const graphNode: GraphNode = {
          ...node,
          name: selectedGraphProject.value
            ? node.name // Don't add project label when filtering to single project
            : `${node.name}\n(${example.id})`, // Add project label when showing all
        }
        allNodes.push(graphNode)
        nodeMap.set(node.id, graphNode)
      }
    })

    example.links.forEach((link: any) => {
      allLinks.push(link)
    })
  })

  // Filter links to only include those between existing nodes
  const validLinks = allLinks.filter((link: any) => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id
    const targetId = typeof link.target === 'string' ? link.target : link.target.id
    return nodeMap.has(sourceId) && nodeMap.has(targetId)
  })

  return { nodes: allNodes, links: validLinks }
}

// Initialize/update hub graph when tab opens or project filter changes
watch(
  [activeTab, selectedGraphProject, graphSearch],
  ([newTab]) => {
    if (newTab === 'Graph' && hubGraphContainer.value) {
      setTimeout(() => {
        const hubData = buildHubGraphData()
        initializeGraph(hubData, (node) => {
          selectedGraphNode.value = node
        }, true)
      }, 100)
    }
  },
  { immediate: false }
)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=Poppins:wght@400;500;600&display=swap');

:root {
  --pt-bg: #0f1419;
  --pt-surface: #1a1f2e;
  --pt-surface-alt: #252d3d;
  --pt-border: #3a4557;
  --pt-text: #e8e9eb;
  --pt-text-muted: #a8adb5;
  --pt-accent: #4a90e2;
  --pt-accent-hover: #5a9fee;

  /* Typography */
  --font-display: 'Playfair Display', serif;
  --font-body: 'Poppins', system-ui, -apple-system, sans-serif;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  width: 100%;
  height: 100%;
}

.papertrail {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  background: var(--pt-bg);
  color: var(--pt-text);
  font-family: var(--font-body);
  font-size: 14px;
  line-height: 1.5;
  letter-spacing: 0.3px;
}

/* Header */
.header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 32px 48px;
  border-bottom: 1px solid var(--pt-border);
  background: linear-gradient(135deg, var(--pt-surface) 0%, var(--pt-bg) 100%);
  animation: slideDown 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header__left {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.header__logo {
  font-family: var(--font-display);
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -1px;
  color: var(--pt-text);
  margin: 0;
}

.header__subtitle {
  font-size: 12px;
  color: var(--pt-text-muted);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin: 0;
  font-weight: 500;
}

.header__actions {
  display: flex;
  gap: 12px;
}

/* Buttons */
.btn-new,
.btn-primary,
.btn-secondary,
.btn-action {
  font-family: var(--font-body);
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: 500;
  font-size: 13px;
}

.btn-new {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: var(--pt-accent);
  color: white;
  border: 1px solid var(--pt-accent);
}

.btn-new:hover {
  background: var(--pt-accent-hover);
  border-color: var(--pt-accent-hover);
  transform: translateY(-2px);
}

.btn-new__icon {
  font-size: 16px;
  font-weight: 600;
}

.btn-primary {
  padding: 11px 24px;
  background: var(--pt-accent);
  color: white;
  border: 1px solid var(--pt-accent);
}

.btn-primary:hover:not(:disabled) {
  background: var(--pt-accent-hover);
  transform: translateY(-1px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-secondary {
  padding: 10px 20px;
  background: transparent;
  color: var(--pt-text-muted);
  border: 1px solid var(--pt-border);
}

.btn-secondary:hover {
  border-color: var(--pt-text-muted);
  color: var(--pt-text);
}

.btn-action {
  padding: 6px 10px;
  background: transparent;
  color: var(--pt-text-muted);
  border: 1px solid var(--pt-border);
  font-size: 14px;
}

.btn-action:hover {
  color: var(--pt-accent);
  border-color: var(--pt-accent);
}

/* Tabs */
.tabs {
  display: flex;
  gap: 2px;
  padding: 0 48px;
  border-bottom: 1px solid var(--pt-border);
  background: var(--pt-surface);
  animation: fadeIn 0.6s ease 0.1s both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.tab {
  position: relative;
  padding: 14px 20px;
  background: transparent;
  border: none;
  color: var(--pt-text-muted);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  text-transform: capitalize;
  transition: color 0.2s ease;
  letter-spacing: 0.5px;
}

.tab:hover {
  color: var(--pt-text);
}

.tab--active {
  color: var(--pt-accent);
}

.tab__indicator {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--pt-accent);
  animation: slideInRight 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideInRight {
  from {
    width: 0;
    left: 50%;
  }
  to {
    width: 100%;
    left: 0;
  }
}

/* Content */
.content {
  flex: 1;
  overflow-y: auto;
  padding: 40px 48px;
  animation: fadeIn 0.6s ease 0.2s both;
}

.tab-pane {
  animation: fadeIn 0.3s ease;
}

/* Projects Section */
.projects-section {
  max-width: 1400px;
}

.section-title {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 28px;
  color: var(--pt-text);
  letter-spacing: -0.5px;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
}

.project-card {
  display: flex;
  flex-direction: column;
  padding: 24px;
  background: var(--pt-surface);
  border: 1px solid var(--pt-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  position: relative;
  overflow: hidden;
}

.project-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, var(--pt-accent), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.project-card:hover {
  border-color: var(--pt-accent);
  background: var(--pt-surface-alt);
  transform: translateY(-4px);
}

.project-card:hover::before {
  opacity: 1;
}

.project-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.project-card__title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--pt-text);
  flex: 1;
}

.project-card__badge {
  flex-shrink: 0;
  padding: 4px 10px;
  background: rgba(74, 144, 226, 0.15);
  color: var(--pt-accent);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.project-card__goal {
  font-size: 13px;
  color: var(--pt-text-muted);
  margin: 0 0 16px;
  line-height: 1.6;
}

.project-card__stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 16px 0;
  border-top: 1px solid var(--pt-border);
  border-bottom: 1px solid var(--pt-border);
  margin-bottom: 16px;
}

.stat {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat__value {
  font-size: 18px;
  font-weight: 600;
  color: var(--pt-accent);
  font-family: 'Courier New', monospace;
}

.stat__label {
  font-size: 11px;
  color: var(--pt-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.project-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.project-card__time {
  font-size: 12px;
  color: var(--pt-text-muted);
}

.project-card__actions {
  display: flex;
  gap: 6px;
}

/* Empty State */
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.empty-state__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 400px;
  text-align: center;
}

.empty-state__title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 600;
  color: var(--pt-text);
  margin: 0;
}

.empty-state__text {
  font-size: 14px;
  color: var(--pt-text-muted);
  margin: 0;
  line-height: 1.6;
}

/* Placeholder */
.placeholder-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
}

.placeholder {
  text-align: center;
  padding: 60px 40px;
  border: 1px dashed var(--pt-border);
  border-radius: 8px;
  background: rgba(74, 144, 226, 0.05);
}

.placeholder h2 {
  font-family: var(--font-display);
  font-size: 22px;
  margin: 0 0 8px;
  color: var(--pt-text);
}

.placeholder p {
  margin: 0;
  color: var(--pt-text-muted);
  font-size: 13px;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease;
  backdrop-filter: blur(4px);
}

.modal {
  background: var(--pt-surface);
  border: 1px solid var(--pt-border);
  border-radius: 8px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  border-bottom: 1px solid var(--pt-border);
}

.modal__title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  color: var(--pt-text);
}

.modal__close {
  background: transparent;
  border: none;
  color: var(--pt-text-muted);
  font-size: 28px;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.modal__close:hover {
  color: var(--pt-text);
}

.modal__form {
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 12px;
  color: var(--pt-text);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.form-input {
  padding: 11px 12px;
  background: var(--pt-bg);
  border: 1px solid var(--pt-border);
  border-radius: 6px;
  color: var(--pt-text);
  font-family: var(--font-body);
  font-size: 13px;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--pt-accent);
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.modal__actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 8px;
}

/* Scrollbar */
.content::-webkit-scrollbar {
  width: 8px;
}

.content::-webkit-scrollbar-track {
  background: transparent;
}

.content::-webkit-scrollbar-thumb {
  background: var(--pt-border);
  border-radius: 4px;
}

.content::-webkit-scrollbar-thumb:hover {
  background: var(--pt-text-muted);
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    padding: 24px;
    flex-direction: column;
    gap: 16px;
  }

  .header__logo {
    font-size: 28px;
  }

  .tabs {
    padding: 0 24px;
    overflow-x: auto;
  }

  .content {
    padding: 24px;
  }

  .projects-grid {
    grid-template-columns: 1fr;
  }

  .modal {
    margin: 20px;
  }
}

/* Graph Tab Styles */
.graph-tab {
  display: flex;
  flex-direction: column;
  gap: 0;
  height: 100%;
  min-height: 700px;
  overflow: hidden;
}

.graph-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px 24px;
  border-bottom: 1px solid var(--pt-border);
  background: linear-gradient(135deg, var(--pt-surface) 0%, var(--pt-bg) 100%);
  animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.header-left {
  flex: 1;
  min-width: 300px;
}

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  background: var(--pt-bg);
  border: 1.5px solid var(--pt-border);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.search-box:focus-within {
  border-color: var(--pt-accent);
  background: var(--pt-surface-alt);
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
}

.search-icon {
  font-size: 14px;
  opacity: 0.6;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--pt-text);
  font-family: var(--font-body);
  font-size: 13px;
  outline: none;
}

.search-input::placeholder {
  color: var(--pt-text-muted);
}

.search-clear {
  background: transparent;
  border: none;
  color: var(--pt-text-muted);
  cursor: pointer;
  font-size: 12px;
  padding: 4px;
  transition: color 0.2s ease;
}

.search-clear:hover {
  color: var(--pt-text);
}

.header-center {
  display: flex;
  align-items: center;
  gap: 20px;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.filter-label {
  font-size: 11px;
  color: var(--pt-text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.filter-select {
  padding: 8px 12px;
  background: var(--pt-bg);
  border: 1px solid var(--pt-border);
  color: var(--pt-text);
  border-radius: 6px;
  font-family: var(--font-body);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-select:hover,
.filter-select:focus {
  border-color: var(--pt-accent);
  background: var(--pt-surface-alt);
  outline: none;
}

.header-right {
  display: flex;
  gap: 12px;
}

.btn-reset-header {
  padding: 8px 14px;
  background: transparent;
  border: 1px solid var(--pt-border);
  color: var(--pt-text-muted);
  border-radius: 6px;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-reset-header:hover {
  border-color: var(--pt-accent);
  color: var(--pt-accent);
  background: rgba(74, 144, 226, 0.05);
}

/* Graph Container Layout */
.graph-container-wrapper {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
  padding: 20px 24px;
  flex: 1;
  overflow: hidden;
  animation: fadeIn 0.4s ease 0.1s both;
  min-height: 600px;
  height: 100%;
}

.graph-canvas {
  background: radial-gradient(circle at 50% 40%, rgba(74, 144, 226, 0.05) 0%, transparent 70%),
    linear-gradient(135deg, var(--pt-surface) 0%, var(--pt-bg) 100%);
  border: 1px solid var(--pt-border);
  border-radius: 12px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  min-height: 600px;
  width: 100%;
  height: 100%;
  aspect-ratio: 1206 / 599;
}

/* Graph Stats Panel */
.graph-stats {
  background: linear-gradient(135deg, var(--pt-surface) 0%, var(--pt-surface-alt) 100%);
  border: 1px solid var(--pt-border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  opacity: 0;
  pointer-events: none;
  transform: translateX(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}

.graph-stats.stats-open {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0);
}

.stats-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--pt-border);
  background: linear-gradient(135deg, var(--pt-surface-alt) 0%, var(--pt-bg) 100%);
}

.stats-title {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
}

.stats-title h4 {
  font-size: 13px;
  font-weight: 700;
  color: var(--pt-text);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.type-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 6px 10px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: white;
  flex-shrink: 0;
}

.badge-business {
  background: #2563eb;
}

.badge-person {
  background: #9333ea;
}

.badge-website {
  background: #0891b2;
}

.badge-location {
  background: #16a34a;
}

.badge-contact {
  background: #d97706;
}

.stats-close {
  background: transparent;
  border: none;
  color: var(--pt-text-muted);
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.stats-close:hover {
  background: rgba(74, 144, 226, 0.1);
  color: var(--pt-accent);
}

.stats-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.stats-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 40px 20px;
  text-align: center;
  color: var(--pt-text-muted);
}

.empty-icon {
  font-size: 36px;
  margin-bottom: 12px;
  opacity: 0.3;
}

.stats-section {
  padding: 16px;
  border-bottom: 1px solid var(--pt-border);
}

.stats-section:last-child {
  border-bottom: none;
  margin-top: auto;
}

.stats-section .section-title {
  font-size: 11px;
  color: var(--pt-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px;
  font-weight: 700;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  margin-bottom: 8px;
}

.info-label {
  color: var(--pt-text-muted);
  font-weight: 500;
  flex-shrink: 0;
}

.info-value {
  color: var(--pt-text);
  font-weight: 600;
  flex: 1;
}

.action-btn {
  width: 100%;
  padding: 10px;
  background: rgba(74, 144, 226, 0.1);
  border: 1px solid var(--pt-accent);
  color: var(--pt-accent);
  border-radius: 6px;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.action-btn:hover {
  background: rgba(74, 144, 226, 0.2);
  transform: translateY(-1px);
}

/* Graph Footer */
.graph-footer {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  padding: 16px 24px;
  border-top: 1px solid var(--pt-border);
  background: var(--pt-surface);
}

.graph-stats-summary {
  display: flex;
  gap: 32px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  text-align: center;
}

.stat-label {
  font-size: 10px;
  color: var(--pt-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.stat-value {
  font-size: 16px;
  color: var(--pt-accent);
  font-weight: 700;
  font-family: 'Courier New', monospace;
}
</style>

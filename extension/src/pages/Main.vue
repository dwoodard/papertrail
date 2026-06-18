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
          <button class="btn-workspace" @click="openWorkspace">
            <span class="btn-workspace__icon">🔧</span>
            Open Workspace
          </button>
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
                  id="graph-entity-search"
                  v-model="graphSearch"
                  type="text"
                  placeholder="Search entities..."
                  class="search-input"
                  name="entity-search"
                />
                <button v-if="graphSearch" class="search-clear" @click="graphSearch = ''">✕</button>
              </div>
            </div>

            <div class="header-center">
              <div class="view-dropdown-wrapper" style="position: relative; display: inline-block; margin-right: 20px;">
                <button id="view-by-btn" :style="{ padding: '8px 16px', fontSize: '13px', fontWeight: '600', color: showViewByDropdown ? 'var(--pt-accent)' : 'var(--pt-text-muted)', background: 'transparent', border: showViewByDropdown ? '1px solid var(--pt-accent)' : '1px solid var(--pt-border)', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: '0.2s' }" @click.stop="showViewByDropdown = !showViewByDropdown">
                  View By: {{ currentViewMode }}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"></path></svg>
                </button>
                <div id="view-by-dropdown" v-if="showViewByDropdown" :style="{ display: 'block', position: 'absolute', top: 'calc(100% + 5px)', left: '0px', background: 'var(--pt-surface)', border: '1px solid var(--pt-border)', borderRadius: '8px', boxShadow: '0 10px 15px rgba(0, 0, 0, 0.3)', minWidth: '220px', zIndex: '10000', padding: '4px' }" @click.stop>
                  <div v-for="mode in ['Project', 'Type', 'Cluster']" :key="mode" class="dropdown-item" :style="{ padding: '10px 12px', fontSize: '13px', color: currentViewMode === mode ? 'var(--pt-accent)' : 'var(--pt-text-muted)', cursor: 'pointer', borderRadius: '4px', background: currentViewMode === mode ? 'rgba(74, 144, 226, 0.1)' : 'transparent', transition: '0.2s' }" @click="handleViewModeChange(mode as any)">{{ mode }}</div>
                  <div style="height: 1px; background: var(--pt-border); margin: 4px 0;"></div>
                  <div style="padding: 4px 12px; font-size: 11px; font-weight: 700; color: var(--pt-text-muted); text-transform: uppercase; opacity: 0.6;">Sort By</div>
                  <div class="dropdown-item" data-sort="Name" :style="{ padding: '10px 12px', fontSize: '13px', color: graphSortBy === 'Name' ? 'var(--pt-accent)' : 'var(--pt-text-muted)', cursor: 'pointer', borderRadius: '4px', background: graphSortBy === 'Name' ? 'rgba(74, 144, 226, 0.1)' : 'transparent', transition: '0.2s' }" @click="handleSort('Name')">Alphabetical</div>
                  <div class="dropdown-item" data-sort="Size" :style="{ padding: '10px 12px', fontSize: '13px', color: graphSortBy === 'Size' ? 'var(--pt-accent)' : 'var(--pt-text-muted)', cursor: 'pointer', borderRadius: '4px', background: graphSortBy === 'Size' ? 'rgba(74, 144, 226, 0.1)' : 'transparent', transition: '0.2s' }" @click="handleSort('Size')">Node Weight</div>
                </div>
              </div>

              <div class="filter-group">
                <label for="graph-project-filter" class="filter-label">Filter by Project:</label>
                <select id="graph-project-filter" v-model="selectedGraphProject" class="filter-select" name="graph-project">
                  <option value="">All Projects</option>
                  <option v-for="projectId in availableProjects" :key="projectId" :value="projectId">
                    {{ projectId }}
                  </option>
                </select>
              </div>
            </div>

            <div class="header-right">
              <div class="dropdown-wrapper">
                <button
                  class="btn-controls"
                  @click.stop="showGraphControls = !showGraphControls"
                  :class="{ 'controls-active': showGraphControls || graphMinConfidence > 0 || graphRepulsion !== -600 || !graphShowSuggested || graphNodesPerRow !== 4 || graphHorizontalGap !== 600 || graphVerticalGap !== 600 || graphGridForceStrength !== 0.25 || graphVisibleTypes.size < 5 }"
                >
                  <span class="controls-icon">⚙</span>
                  <span>Controls</span>
                </button>

                <div
                  v-if="showGraphControls"
                  class="dropdown-menu"
                  @click.stop
                >
                  <div class="control-group">
                    <label class="control-label">
                      <input
                        v-model="graphShowSuggested"
                        type="checkbox"
                        class="control-checkbox"
                      />
                      <span>Suggested Links</span>
                    </label>
                  </div>

                  <div style="height: 1px; background: var(--pt-border); margin: 8px 0;"></div>

                  <div class="control-group">
                    <label class="control-label" style="margin-bottom: 8px;">Entity Types</label>
                    <div style="display: flex; flex-direction: column; gap: 6px;">
                      <label class="control-label" style="margin: 0; font-size: 12px;">
                        <input
                          :checked="graphVisibleTypes.has('business')"
                          type="checkbox"
                          class="control-checkbox"
                          @change="toggleTypeFilter('business')"
                        />
                        <span :style="{ color: getEntityTypeColor('business') }">Business</span>
                      </label>
                      <label class="control-label" style="margin: 0; font-size: 12px;">
                        <input
                          :checked="graphVisibleTypes.has('person')"
                          type="checkbox"
                          class="control-checkbox"
                          @change="toggleTypeFilter('person')"
                        />
                        <span :style="{ color: getEntityTypeColor('person') }">Person</span>
                      </label>
                      <label class="control-label" style="margin: 0; font-size: 12px;">
                        <input
                          :checked="graphVisibleTypes.has('location')"
                          type="checkbox"
                          class="control-checkbox"
                          @change="toggleTypeFilter('location')"
                        />
                        <span :style="{ color: getEntityTypeColor('location') }">Location</span>
                      </label>
                      <label class="control-label" style="margin: 0; font-size: 12px;">
                        <input
                          :checked="graphVisibleTypes.has('website')"
                          type="checkbox"
                          class="control-checkbox"
                          @change="toggleTypeFilter('website')"
                        />
                        <span :style="{ color: getEntityTypeColor('website') }">Website</span>
                      </label>
                      <label class="control-label" style="margin: 0; font-size: 12px;">
                        <input
                          :checked="graphVisibleTypes.has('contact')"
                          type="checkbox"
                          class="control-checkbox"
                          @change="toggleTypeFilter('contact')"
                        />
                        <span :style="{ color: getEntityTypeColor('contact') }">Contact</span>
                      </label>
                    </div>
                  </div>

                  <div class="control-group">
                    <label class="control-label">Confidence</label>
                    <div class="slider-container">
                      <input
                        v-model.number="graphMinConfidence"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        class="control-slider"
                        title="Filter nodes by confidence level"
                      />
                      <span class="control-value">{{ Math.round(graphMinConfidence * 100) }}%</span>
                    </div>
                  </div>

                  <div class="control-group">
                    <label class="control-label">Spacing</label>
                    <div class="slider-container">
                      <input
                        v-model.number="graphRepulsion"
                        type="range"
                        min="-2000"
                        max="-100"
                        step="100"
                        class="control-slider"
                        title="Adjust node spacing (repulsion)"
                      />
                      <span class="control-value">{{ Math.abs(graphRepulsion) }}</span>
                    </div>
                  </div>


                  <div class="control-group">
                    <label class="control-label">Grid: Nodes Per Row</label>
                    <div class="slider-container">
                      <input
                        v-model.number="graphNodesPerRow"
                        type="range"
                        min="1"
                        max="20"
                        step="1"
                        class="control-slider"
                        title="Adjust nodes per row in Project view"
                      />
                      <span class="control-value">{{ graphNodesPerRow }}</span>
                    </div>
                  </div>

                  <div class="control-group">
                    <label class="control-label">Grid: Horizontal Gap</label>
                    <div class="slider-container">
                      <input
                        v-model.number="graphHorizontalGap"
                        type="range"
                        min="200"
                        max="1000"
                        step="50"
                        class="control-slider"
                        title="Adjust horizontal spacing between columns"
                      />
                      <span class="control-value">{{ graphHorizontalGap }}</span>
                    </div>
                  </div>

                  <div class="control-group">
                    <label class="control-label">Grid: Vertical Gap</label>
                    <div class="slider-container">
                      <input
                        v-model.number="graphVerticalGap"
                        type="range"
                        min="200"
                        max="1000"
                        step="50"
                        class="control-slider"
                        title="Adjust vertical spacing between rows"
                      />
                      <span class="control-value">{{ graphVerticalGap }}</span>
                    </div>
                  </div>

                  <div class="control-group">
                    <label class="control-label">Grid: Force Strength</label>
                    <div class="slider-container">
                      <input
                        v-model.number="graphGridForceStrength"
                        type="range"
                        min="0.05"
                        max="0.5"
                        step="0.05"
                        class="control-slider"
                        title="Adjust force strength for grid positioning"
                      />
                      <span class="control-value">{{ graphGridForceStrength.toFixed(2) }}</span>
                    </div>
                  </div>

                  <div v-if="lockedNodes.size > 0" class="control-group">
                    <button
                      class="btn-reset-dropdown"
                      @click="resetLockedNodes"
                    >
                      Unlock Dragged Nodes ({{ lockedNodes.size }})
                    </button>
                  </div>

                  <div v-if="graphSearch || selectedGraphProject || graphMinConfidence > 0 || graphRepulsion !== -600 || !graphShowSuggested || graphNodesPerRow !== 4 || graphHorizontalGap !== 600 || graphVerticalGap !== 600 || graphGridForceStrength !== 0.25 || graphVisibleTypes.size < 5" class="control-group">
                    <button
                      class="btn-reset-dropdown"
                      @click="resetGraphFilters"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="graph-container-wrapper">

            <div class="graph-canvas" ref="hubGraphContainer">

                <!-- Hub graph renders here -->
                <div>
                    <button v-if="lockedNodes.size > 0" class="btn-unlock-nodes" @click="resetLockedNodes" :title="`Unlock ${lockedNodes.size} dragged node${lockedNodes.size !== 1 ? 's' : ''}`">
                        <component :is="LockOpen"   />
                    </button>

                    <button class="btn-fit-to-view" @click="fitToView" title="Fit all nodes in view">
                        <component :is="FlipHorizontal"   />
                    </button>
                </div>
            </div>

            <div :class="['graph-stats', { 'stats-open': selectedGraphNode }]">
              <template v-if="selectedGraphNode">
                <div class="stats-header" @click="centerStatsPanel">
                  <div class="stats-header-top">
                    <button class="stats-close" @click.stop="selectNodeInGraph(null)">✕</button>
                  </div>
                  <div class="stats-header-bottom">
                    <div class="type-badge" :class="`badge-${selectedGraphNode.type}`">
                      {{ selectedGraphNode.type }}
                    </div>
                    <h4 class="stats-node-title">{{ selectedGraphNode.name }}</h4>
                  </div>
                </div>

                <div class="stats-body">

                    <!-- add a what project this node belongs to -->
                  <div v-if="selectedGraphNode.project" class="info-row">
                    <span class="info-label">Project:</span>
                    <span class="info-value">{{ selectedGraphNode.project.name }}</span>
                  </div>

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

                  <section v-if="selectedNodeRelations.length > 0" class="stats-section">
                    <h5 class="section-title">Relations</h5>
                    <div class="relations-list">
                      <div
                        v-for="(relation, index) in selectedNodeRelations"
                        :key="index"
                        class="relation-item"
                        @click="(event) => {
                            console.log(relation.nodeId);

                          selectNodeInGraph(relation.nodeId)
                        }"
                        @mouseenter="highlightNodeInGraph(relation.nodeId)"
                        @mouseleave="clearGraphHighlight"
                      >
                        <div class="relation-header">
                          <div class="relation-type-badge" :class="`badge-${relation.nodeType}`">
                            {{ relation.nodeType }}
                          </div>
                          <span class="relation-arrow">→</span>
                          <span class="relation-name">{{ relation.nodeName }}</span>
                          <span class="relation-count">({{ relation.connectionCount }})</span>
                        </div>
                        <div class="relation-subtext">{{ relation.relationType }}</div>
                      </div>
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
                <div class="view-switcher-section">
                  <h5 class="section-title">Interface View</h5>
                  <div class="view-switcher-group">
                    <button
                      v-for="mode in ['Project', 'Type', 'Cluster']"
                      :key="mode"
                      :class="['btn-view', { 'btn-view--active': currentViewMode === mode }]"
                      @click="handleViewModeChange(mode as any)"
                    >
                      {{ mode }}
                    </button>
                  </div>
                </div>

                <div class="stats-empty">
                  <div class="empty-icon">◯</div>
                  <p>Click an entity to view details</p>
                </div>
              </template>
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
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { FlipHorizontal, LockOpen } from '@lucide/vue'
import ProjectDetail from './ProjectDetail.vue'
import { useGraphSimulation, type GraphData, type GraphNode, type ViewModeId } from '../composables/useGraphSimulation'
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
const graphSortBy = ref<'Name' | 'Size'>('Name')
const graphMinConfidence = ref(0)
const graphRepulsion = ref(-600)
const graphShowSuggested = ref(true)
const graphNodesPerRow = ref(4)
const graphVisibleTypes = ref<Set<string>>(new Set(['business', 'person', 'location', 'website', 'contact']))
const graphHorizontalGap = ref(600)
const graphVerticalGap = ref(600)
const graphGridForceStrength = ref(0.25)
const showGraphControls = ref(false)
const showViewByDropdown = ref(false)
const currentViewMode = ref<ViewModeId>('Cluster')

const graphConfig = {
  minConfidence: graphMinConfidence,
  repulsion: graphRepulsion,
  showSuggested: graphShowSuggested,
  visibleTypes: graphVisibleTypes,
}

const { initializeGraph, centerNode, setViewMode, updateForces, setGridConfig, resetLockedNodes, lockedNodes, selectNodeById, fitToView } = useGraphSimulation(hubGraphContainer, graphConfig)

const availableProjects = computed(() => {
  const projectSet = new Set<string>()

  // Add example IDs
  ;(graphExamples.examples as any[]).forEach((example) => {
    projectSet.add(example.id)
    // Also add node-level projects
    example.nodes.forEach((node: any) => {
      if (node.project) {
        projectSet.add(node.project)
      }
    })
  })

  return Array.from(projectSet).sort()
})

function closeGraphControls() {
  showGraphControls.value = false
}

function closeViewByDropdown() {
  showViewByDropdown.value = false
}

function handleViewModeChange(mode: 'Project' | 'Type' | 'Cluster') {
  currentViewMode.value = mode
  setViewMode(mode)
  showViewByDropdown.value = false
}

function handleSort(sortBy: 'Name' | 'Size') {
  graphSortBy.value = sortBy
  showViewByDropdown.value = false
}

function getEntityTypeColor(type: string): string {
  const colors: Record<string, string> = {
    business: '#3b82f6',
    person: '#a855f7',
    website: '#06b6d4',
    location: '#10b981',
    contact: '#f59e0b',
  }
  return colors[type] || '#6b7280'
}

function toggleTypeFilter(type: string) {
  const newTypes = new Set(graphVisibleTypes.value)
  if (newTypes.has(type)) {
    newTypes.delete(type)
  } else {
    newTypes.add(type)
  }
  graphVisibleTypes.value = newTypes
}

function toggleAllTypes(show: boolean) {
  if (show) {
    graphVisibleTypes.value = new Set(['business', 'person', 'location', 'website', 'contact'])
  } else {
    graphVisibleTypes.value = new Set()
  }
}

onMounted(() => {
  // Save projects to storage on mount
  saveProjectsToStorage()

  // Set first project as active by default
  if (projects.value.length > 0) {
    console.log('[Main.vue] Setting active project to:', projects.value[0].id)
    chrome.storage.local.set({ 'pt.activeProjectId': projects.value[0].id }, () => {
      console.log('[Main.vue] Active project saved:', projects.value[0].id)
      debugStorage()
    })
  }

  document.addEventListener('click', closeGraphControls)
  document.addEventListener('click', closeViewByDropdown)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeGraphControls)
  document.removeEventListener('click', closeViewByDropdown)
})

// Save active project when selected
watch(selectedProject, (newProject) => {
  if (newProject) {
    chrome.storage.local.set({ 'pt.activeProjectId': newProject.id })
  }
})

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

function openWorkspace(): void {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.sidePanel.open({ tabId: tabs[0].id })
    }
  })
}

function openCreateModal(): void {
  showCreateModal.value = true
}

function closeCreateModal(): void {
  showCreateModal.value = false
  form.name = ''
  form.goal = ''
  form.target = ''
}

function saveProjectsToStorage(): void {
  const projectsArray = JSON.parse(JSON.stringify(projects.value))
  console.log('[Main.vue] Saving projects to storage:', projectsArray)
  chrome.storage.local.set({ 'pt.projects': projectsArray }, () => {
    console.log('[Main.vue] Projects saved successfully')
  })
}

function debugStorage(): void {
  chrome.storage.local.get(null, (allData) => {
    console.log('[DEBUG] All Chrome Storage:', allData)
    console.log('[DEBUG] pt.activeProjectId:', allData['pt.activeProjectId'])
    console.log('[DEBUG] pt.projects:', allData['pt.projects'])
    console.log('[DEBUG] results count:', allData['results']?.length || 0)
  })
}

function createProject(): void {
  if (!form.name.trim()) return

  const newProject = {
    id: Date.now().toString(),
    name: form.name,
    goal: form.goal,
    observations: 0,
    entities: 0,
    suggestions: 0,
    lastActivity: 'just now',
  }

  projects.value.unshift(newProject)
  saveProjectsToStorage()

  closeCreateModal()
}

// Graph view functions
const totalEntitiesCount = computed(() => {
  return (graphExamples.examples as any[]).reduce((sum, example) => sum + example.nodes.length, 0)
})

const totalRelationshipsCount = computed(() => {
  return (graphExamples.examples as any[]).reduce((sum, example) => sum + example.links.length, 0)
})

const selectedNodeRelations = computed(() => {
  if (!selectedGraphNode.value) return []

  const relations: Array<{ nodeId: string; nodeName: string; nodeType: string; relationType: string; connectionCount: number }> = []
  const nodeId = selectedGraphNode.value.id
  const connectionCounts = new Map<string, number>()

  ;(graphExamples.examples as any[]).forEach((example) => {
    // Count connections for each node
    example.links.forEach((link: any) => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id
      const targetId = typeof link.target === 'string' ? link.target : link.target.id
      connectionCounts.set(sourceId, (connectionCounts.get(sourceId) || 0) + 1)
      connectionCounts.set(targetId, (connectionCounts.get(targetId) || 0) + 1)
    })

    // Build relations list
    example.links.forEach((link: any) => {
      const sourceId = typeof link.source === 'string' ? link.source : link.source.id
      const targetId = typeof link.target === 'string' ? link.target : link.target.id

      if (sourceId === nodeId) {
        const targetNode = example.nodes.find((n: any) => n.id === targetId)
        if (targetNode) {
          relations.push({
            nodeId: targetId,
            nodeName: targetNode.name,
            nodeType: targetNode.type,
            relationType: link.type,
            connectionCount: connectionCounts.get(targetId) || 0,
          })
        }
      } else if (targetId === nodeId) {
        const sourceNode = example.nodes.find((n: any) => n.id === sourceId)
        if (sourceNode) {
          relations.push({
            nodeId: sourceId,
            nodeName: sourceNode.name,
            nodeType: sourceNode.type,
            relationType: link.type,
            connectionCount: connectionCounts.get(sourceId) || 0,
          })
        }
      }
    })
  })

  return relations
})

function resetGraphFilters(): void {
  graphSearch.value = ''
  selectedGraphProject.value = ''
  selectNodeInGraph(null)
  graphMinConfidence.value = 0
  graphRepulsion.value = -600
  graphShowSuggested.value = true
  graphNodesPerRow.value = 4
  graphHorizontalGap.value = 600
  graphVerticalGap.value = 600
  graphGridForceStrength.value = 0.25
  graphVisibleTypes.value = new Set(['business', 'person', 'location', 'website', 'contact'])
  showGraphControls.value = false
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

function selectNodeInGraph(nodeId: string | null): void {
  console.log(`[selectNodeInGraph] Called with nodeId: ${nodeId}`)

  if (!nodeId) {
    console.log('[selectNodeInGraph] Clearing selection')
    selectedGraphNode.value = null
    // Reset all node styles to default
    const container = hubGraphContainer.value
    if (container) {
      const svg = container.querySelector('svg')
      if (svg) {
        const d3 = (window as any).d3
        if (d3) {
          d3.select(svg).selectAll('.node')
            .classed('is-selected', false)
            .classed('is-connected', false)
            .style('opacity', (d: any) => d.confidence || 1)
            .attr('stroke-width', '2')
            .attr('stroke', '#3a4557')
            .attr('filter', 'none')
        }
      }
    }
    return
  }

  const hubData = buildHubGraphData()
  const nodeToSelect = hubData.nodes.find((n) => n.id === nodeId)

  if (!nodeToSelect) {
    console.log(`[selectNodeInGraph] Node not found: ${nodeId}`)
    return
  }

  console.log(`[selectNodeInGraph] Selecting node: ${nodeToSelect.id} ${nodeToSelect.name}`)
  selectedGraphNode.value = nodeToSelect

  // Update all styles in the graph
  selectNodeById(nodeId, hubData)

  // Center the node with a small delay to ensure DOM is updated
  setTimeout(() => {
    console.log(`[selectNodeInGraph] Centering node: ${nodeId}`)
    centerNode(nodeToSelect.id, hubData)
  }, 50)
}

function highlightNodeInGraph(nodeId: string): void {
  const container = hubGraphContainer.value
  if (!container) return

  const svg = container.querySelector('svg')
  if (!svg) return

  // Use D3 to select and highlight the node
  const d3 = (window as any).d3
  if (!d3) return

  d3.select(svg).selectAll('.node').style('opacity', (d: any) => {
    if (d.id === nodeId) {
      return '1'
    }
    return (d.confidence || 1) * 0.4
  }).attr('stroke-width', (d: any) => {
    if (d.id === nodeId) return '6'
    return selectedGraphNode.value?.id === d.id ? '8' : '2'
  }).attr('fill', (d: any) => {
     return d.id === nodeId ? '#fbbf24' : selectedGraphNode.value?.id === d.id ? '#06b6d4' : '#3a4557'
  })
  .attr('stroke', (d: any) => {
    if (d.id === nodeId) return '#fbbf24'
    return selectedGraphNode.value?.id === d.id ? '#06b6d4' : '#3a4557'
  }).attr('filter', (d: any) => {
    if (d.id === nodeId) return 'drop-shadow(0 0 12px rgba(251, 191, 36, 0.8))'
    return selectedGraphNode.value?.id === d.id ? 'drop-shadow(0 0 12px rgba(6, 182, 212, 0.9)) drop-shadow(0 0 20px rgba(6, 182, 212, 0.4))' : 'none'
  })
}

function clearGraphHighlight(): void {
  const container = hubGraphContainer.value
  if (!container) return

  const svg = container.querySelector('svg')
  if (!svg) return

  const d3 = (window as any).d3
  if (!d3) return

  const hubData = buildHubGraphData()
  const selectedNodeId = selectedGraphNode.value?.id
  const connectedNodeIds = new Set<string>()

  if (selectedNodeId) {
    hubData.links.forEach((link) => {
      const sourceId = typeof link.source === 'string' ? link.source : (link.source as any).id
      const targetId = typeof link.target === 'string' ? link.target : (link.target as any).id

      if (sourceId === selectedNodeId) {
        connectedNodeIds.add(targetId)
      }
      if (targetId === selectedNodeId) {
        connectedNodeIds.add(sourceId)
      }
    })
  }

  d3.select(svg).selectAll('.node')
    .style('opacity', (d: any) => {
      if (d.id === selectedNodeId) return '1'
      if (connectedNodeIds.has(d.id)) return (d.confidence || 1) * 0.95
      return (d.confidence || 1) * 0.5
    })
    .attr('stroke-width', (d: any) => {
      if (d.id === selectedNodeId) return '8'
      if (connectedNodeIds.has(d.id)) return '5'
      return '2'
    })
    .attr('stroke', (d: any) => {
      if (d.id === selectedNodeId) return '#06b6d4'
      if (connectedNodeIds.has(d.id)) return '#fbbf24'
      return '#3a4557'
    })
    .attr('filter', (d: any) => {
      if (d.id === selectedNodeId) return 'drop-shadow(0 0 12px rgba(6, 182, 212, 0.9)) drop-shadow(0 0 20px rgba(6, 182, 212, 0.4))'
      if (connectedNodeIds.has(d.id)) return 'drop-shadow(0 0 8px rgba(251, 191, 36, 0.7))'
      return 'none'
    })
}

function centerStatsPanel(): void {
  const header = document.querySelector('.stats-header')
  if (header) {
    header.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'center',
    })
  }
}

function buildHubGraphData(): GraphData {
  // Combine all example graphs into one with project labels, optionally filtered by project
  const allNodes: GraphNode[] = []
  const allLinks: any[] = []
  const nodeMap = new Map<string, GraphNode>()
  const connectionCounts = new Map<string, number>()

  ;(graphExamples.examples as any[]).forEach((example) => {
    example.nodes.forEach((node: any) => {
      // Determine the project for this node (node-level or example-level)
      const nodeProject = node.project || example.id

      // Filter by selected project (can be example ID or node-level project)
      if (selectedGraphProject.value && selectedGraphProject.value !== example.id && selectedGraphProject.value !== nodeProject) {
        return
      }

      // Filter by search query (case-insensitive)
      const matchesSearch = !graphSearch.value ||
        node.name.toLowerCase().includes(graphSearch.value.toLowerCase())

      if (!matchesSearch) return

      if (!nodeMap.has(node.id)) {
        // Find the project object matching this node's project ID
        const projectObj = projects.value.find(p => p.id === nodeProject) || {
          id: nodeProject,
          name: nodeProject,
        }

        const graphNode: GraphNode = {
          ...node,
          project: projectObj,
          name: node.name,
        }
        allNodes.push(graphNode)
        nodeMap.set(node.id, graphNode)
        connectionCounts.set(node.id, 0)
      }
    })

    example.links.forEach((link: any) => {
      allLinks.push(link)
    })
  })

  // Count connections for each node
  allLinks.forEach((link: any) => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id
    const targetId = typeof link.target === 'string' ? link.target : link.target.id
    if (connectionCounts.has(sourceId)) {
      connectionCounts.set(sourceId, (connectionCounts.get(sourceId) || 0) + 1)
    }
    if (connectionCounts.has(targetId)) {
      connectionCounts.set(targetId, (connectionCounts.get(targetId) || 0) + 1)
    }
  })

  // Update node values based on connection count
  allNodes.forEach((node) => {
    node.value = connectionCounts.get(node.id) || 0
  })

  // Filter links to only include those between existing nodes
  const validLinks = allLinks.filter((link: any) => {
    const sourceId = typeof link.source === 'string' ? link.source : link.source.id
    const targetId = typeof link.target === 'string' ? link.target : link.target.id
    return nodeMap.has(sourceId) && nodeMap.has(targetId)
  })

  // Sort nodes based on current sort mode
  const sortedNodes = [...allNodes]
  if (graphSortBy.value === 'Name') {
    sortedNodes.sort((a, b) => a.name.localeCompare(b.name))
  } else if (graphSortBy.value === 'Size') {
    sortedNodes.sort((a, b) => (b.value || 0) - (a.value || 0))
  }

  return { nodes: sortedNodes, links: validLinks }
}

// Initialize/update hub graph when tab opens or filters change
watch(
  [activeTab, selectedGraphProject, graphSearch, graphMinConfidence, graphRepulsion, graphShowSuggested, graphSortBy, graphVisibleTypes],
  ([newTab]) => {
    if (newTab === 'Graph' && hubGraphContainer.value) {
      setTimeout(() => {
        const hubData = buildHubGraphData()
        initializeGraph(hubData, (node) => {
          console.log('[graph-click-callback] Node selected:', node?.id, node?.name)
          selectNodeInGraph(node ? node.id : null)
        }, true)
        setViewMode(currentViewMode.value)
      }, 100)
    }
  },
  { immediate: false }
)

// Update forces when repulsion changes
watch(
  () => graphRepulsion.value,
  () => {
    updateForces()
  }
)

// Update grid config when grid settings change
watch(
  [graphNodesPerRow, graphHorizontalGap, graphVerticalGap, graphGridForceStrength],
  () => {
    setGridConfig({
      nodesPerRow: graphNodesPerRow.value,
      horizontalGap: graphHorizontalGap.value,
      verticalGap: graphVerticalGap.value,
      forceStrength: graphGridForceStrength.value,
    })
    // Reapply the current view mode to update the grid
    setViewMode(currentViewMode.value)
  }
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
.btn-workspace,
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

.btn-workspace {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: transparent;
  color: var(--pt-text-muted);
  border: 1px solid var(--pt-border);
}

.btn-workspace:hover {
  background: rgba(74, 144, 226, 0.1);
  border-color: var(--pt-accent);
  color: var(--pt-accent);
  transform: translateY(-2px);
}

.btn-workspace__icon {
  font-size: 14px;
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
  overflow: visible;
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
  overflow: visible;
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
  display: flex;
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
  flex: 1;
  min-width: 0;
  height: 100%;
}

.btn-unlock-nodes {
  position: absolute;
  bottom: 16px;
  left: 64px;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(239, 68, 68, 0.2);
  border: 1px solid rgba(239, 68, 68, 0.5);
  color: #ef4444;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s ease;
  backdrop-filter: blur(8px);
  z-index: 100;
  animation: slideUp 0.3s ease;
}

.btn-unlock-nodes:hover {
  background: rgba(239, 68, 68, 0.3);
  border-color: #ef4444;
  transform: scale(1.05);
}

.btn-unlock-nodes:active {
  transform: scale(0.95);
}

.btn-fit-to-view {
  position: absolute;
  bottom: 16px;
  left: 16px;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid rgba(74, 144, 226, 0.3);
  color: var(--pt-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 100;
}

.btn-fit-to-view svg {
  stroke: currentColor;
  fill: none;
}

.btn-fit-to-view:hover {
  background: rgba(74, 144, 226, 0.2);
  border-color: var(--pt-accent);
  color: var(--pt-accent);
  transform: scale(1.05);
}

.btn-fit-to-view:active {
  transform: scale(0.95);
}

/* Graph Stats Panel */
.graph-stats {
  background: linear-gradient(135deg, var(--pt-surface) 0%, var(--pt-surface-alt) 100%);
  border: 1px solid var(--pt-border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  width: 340px;
  height: 100%;
  flex-shrink: 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  transition: margin-right 0.3s ease, opacity 0.3s ease;
  margin-right: -360px;
  opacity: 0;
  pointer-events: none;
}

.graph-stats.stats-open {
  margin-right: 0;
  opacity: 1;
  pointer-events: auto;
}

.stats-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border-bottom: 1px solid var(--pt-border);
  background: linear-gradient(135deg, var(--pt-surface-alt) 0%, var(--pt-bg) 100%);
  cursor: pointer;
}

.stats-header-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stats-header-bottom {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stats-node-title {
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
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.stats-close:hover {
  background: rgba(74, 144, 226, 0.1);
  color: var(--pt-accent);
}


.stats-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
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
  padding: 12px 0;
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

/* Relations List */
.relations-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 200px;
  overflow-y: auto;
}

.relation-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px;
  background: rgba(74, 144, 226, 0.05);
  border: 1px solid rgba(74, 144, 226, 0.2);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.relation-item:hover {
  background: rgba(74, 144, 226, 0.15);
  border-color: var(--pt-accent);
  transform: translateX(4px);
}

.relation-header {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.relation-type-badge {
  flex-shrink: 0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: white;
  min-width: fit-content;
}

.relation-type-badge.badge-business {
  background: #2563eb;
}

.relation-type-badge.badge-person {
  background: #9333ea;
}

.relation-type-badge.badge-website {
  background: #0891b2;
}

.relation-type-badge.badge-location {
  background: #16a34a;
}

.relation-type-badge.badge-contact {
  background: #d97706;
}

.relation-arrow {
  color: var(--pt-text-muted);
  font-weight: 600;
  flex-shrink: 0;
}

.relation-name {
  font-size: 12px;
  font-weight: 600;
  color: var(--pt-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
  min-width: 0;
}

.relation-count {
  font-size: 11px;
  color: var(--pt-text-muted);
  flex-shrink: 0;
}

.relation-subtext {
  font-size: 11px;
  color: var(--pt-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.3px;
  font-weight: 500;
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

/* Controls Dropdown */
.dropdown-wrapper {
  position: relative;
  display: inline-block;
}

.btn-controls {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: transparent;
  border: 1px solid var(--pt-border);
  color: var(--pt-text-muted);
  border-radius: 6px;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  position: relative;
  z-index: 9998;
}

.btn-controls:hover {
  border-color: var(--pt-accent);
  color: var(--pt-text);
}

.btn-controls.controls-active {
  background: rgba(74, 144, 226, 0.1);
  border-color: var(--pt-accent);
  color: var(--pt-accent);
}

.controls-icon {
  font-size: 14px;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  background: var(--pt-surface);
  border: 2px solid var(--pt-accent);
  border-radius: 8px;
  padding: 16px;
  min-width: 280px;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  gap: 16px;
  z-index: 9999;
  animation: slideDown 0.2s ease;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-label {
  font-size: 11px;
  color: var(--pt-text-muted);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.control-checkbox {
  width: 16px;
  height: 16px;
  cursor: pointer;
  accent-color: var(--pt-accent);
}

.slider-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.control-slider {
  flex: 1;
  height: 4px;
  cursor: pointer;
  accent-color: var(--pt-accent);
}

.control-value {
  font-size: 12px;
  color: var(--pt-text);
  font-weight: 600;
  min-width: 40px;
  text-align: right;
}

.btn-reset-dropdown {
  width: 100%;
  padding: 10px;
  margin-top: 4px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  color: #ef4444;
  border-radius: 6px;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-reset-dropdown:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-1px);
}

/* View By Dropdown */
.view-dropdown-wrapper #view-by-btn:hover {
  background: rgba(74, 144, 226, 0.1);
  border-color: var(--pt-accent);
}

.view-dropdown-wrapper .dropdown-item:hover {
  background: rgba(74, 144, 226, 0.15);
  color: var(--pt-accent);
}

/* View Switcher */
.view-switcher-section {
  padding: 16px;
  border-bottom: 1px solid var(--pt-border);
}

.view-switcher-group {
  display: flex;
  gap: 6px;
}

.btn-view {
  flex: 1;
  padding: 8px 10px;
  background: rgba(74, 144, 226, 0.05);
  border: 1px solid var(--pt-border);
  color: var(--pt-text-muted);
  border-radius: 6px;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  transition: all 0.2s ease;
}

.btn-view:hover {
  border-color: var(--pt-accent);
  color: var(--pt-text);
  background: rgba(74, 144, 226, 0.1);
}

.btn-view--active {
  background: rgba(74, 144, 226, 0.15);
  border-color: var(--pt-accent);
  color: var(--pt-accent);
}

@keyframes edgeHover {
  0% {
    filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.5));
  }
  50% {
    filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.8));
  }
  100% {
    filter: drop-shadow(0 0 4px rgba(251, 191, 36, 0.5));
  }
}

/* Graph Edge Hover Highlighting */
.graph-svg .link.link-active {
  stroke: #fbbf24;
  stroke-width: 4px;
  transition: stroke-width 0.15s, stroke 0.15s;
  filter: drop-shadow(0 0 6px rgba(251, 191, 36, 0.8));
}

.graph-svg .node-connected {
  stroke: #fbbf24;
  stroke-width: 5px;
  transition: stroke 0.15s, stroke-width 0.15s;
  filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.7));
  animation: edgeHover 1.2s ease-in-out infinite;
  paint-order: stroke;
}

@keyframes nodePulse {
  0% {
    filter: drop-shadow(0 0 12px rgba(6, 182, 212, 0.9)) drop-shadow(0 0 20px rgba(6, 182, 212, 0.4));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(6, 182, 212, 1)) drop-shadow(0 0 28px rgba(6, 182, 212, 0.6));
  }
  100% {
    filter: drop-shadow(0 0 12px rgba(6, 182, 212, 0.9)) drop-shadow(0 0 20px rgba(6, 182, 212, 0.4));
  }
}

@keyframes connectedPulse {
  0% {
    filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.7));
  }
  50% {
    filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.9));
  }
  100% {
    filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.7));
  }
}

/* Node Selection State */
.graph-svg circle.node.is-selected {
  /* fill: #0891b2;
  stroke: #06b6d4; */
  stroke-width: 8px;
  opacity: 1;
  filter: drop-shadow(0 0 16px rgba(6, 182, 212, 1)) drop-shadow(0 0 32px rgba(6, 182, 212, 0.6));
  animation: nodePulse 2s ease-in-out infinite;
  transition: stroke 0.2s ease, stroke-width 0.2s ease, opacity 0.2s ease;
  paint-order: stroke;
}

/* Connected Nodes Highlighting */
.graph-svg circle.node.is-connected {
  stroke: #fbbf24;
  stroke-width: 5px;
  opacity: 0.95;
  filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.7));
  animation: connectedPulse 1.5s ease-in-out infinite;
  transition: stroke 0.2s ease, stroke-width 0.2s ease, opacity 0.2s ease;
  paint-order: stroke;
}
</style>

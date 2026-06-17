<template>
  <div class="project-detail">
    <!-- Header -->
    <header class="detail-header">
      <div class="detail-header__left">
        <button class="btn-back" @click="$emit('back')">← Back to Hub</button>
        <div class="detail-header__info">
          <h1 class="detail-header__title">{{ project.name }}</h1>
          <p class="detail-header__goal">{{ project.goal }}</p>
        </div>
      </div>
    </header>

    <!-- Navigation Tabs -->
    <nav class="detail-tabs">
      <button
        v-for="tab in projectTabs"
        :key="tab"
        :class="['tab', { 'tab--active': activeTab === tab }]"
        @click="activeTab = tab"
      >
        <span class="tab__label">{{ tab }}</span>
        <span v-if="tab === activeTab" class="tab__indicator"></span>
      </button>
    </nav>

    <!-- Content -->
    <main class="detail-content">
      <!-- Overview Tab -->
      <div v-show="activeTab === 'Overview'" class="tab-pane">
        <section class="status-section">
          <h2 class="section-title">Project Status</h2>
          <div class="status-grid">
            <div class="status-card">
              <span class="status-value">{{ project.observations }}</span>
              <span class="status-label">Observations</span>
            </div>
            <div class="status-card">
              <span class="status-value">{{ project.entities }}</span>
              <span class="status-label">Entities</span>
            </div>
            <div class="status-card">
              <span class="status-value">{{ project.suggestions }}</span>
              <span class="status-label">Suggestions</span>
            </div>
            <div class="status-card">
              <span class="status-value">0</span>
              <span class="status-label">Relationships</span>
            </div>
          </div>
        </section>

        <section class="suggestions-section">
          <h2 class="section-title">Suggested Next Steps</h2>
          <div class="suggestion-list">
            <div v-if="project.suggestions > 0" class="suggestion-item">
              <span class="suggestion-icon">⚡</span>
              <span>{{ project.suggestions }} pending AI suggestions</span>
              <button class="btn-link">Review Now →</button>
            </div>
            <div class="suggestion-item">
              <span class="suggestion-icon">⚡</span>
              <span>Search Google Maps for more observations</span>
              <button class="btn-link">Open Google Maps →</button>
            </div>
            <div class="suggestion-item">
              <span class="suggestion-icon">⚡</span>
              <span>Import or paste evidence data</span>
              <button class="btn-link">Paste Evidence →</button>
            </div>
          </div>
        </section>

        <section class="activity-section">
          <h2 class="section-title">Recent Activity</h2>
          <div class="activity-log">
            <div v-for="(activity, i) in recentActivity" :key="i" class="activity-item">
              <span class="activity-time">{{ activity.time }}</span>
              <span class="activity-text">{{ activity.text }}</span>
            </div>
          </div>
        </section>
      </div>

      <!-- Graph Tab -->
      <div v-show="activeTab === 'Graph'" class="tab-pane graph-tab">
        <div class="graph-controls">
          <div class="control-group">
            <button
              :class="['control-btn', { 'control-btn--active': showSuggestions }]"
              @click="showSuggestions = !showSuggestions"
            >
              Show Suggestions
            </button>
            <button
              :class="['control-btn', { 'control-btn--active': !showSuggestions }]"
              @click="showSuggestions = false"
            >
              Confirmed Only
            </button>
          </div>

          <div class="control-group">
            <label class="filter-label">Filter by type:</label>
            <select v-model="selectedRelationType" class="filter-select">
              <option value="">All Relationships</option>
              <option value="WEBSITE">Website</option>
              <option value="WORKS_AT">Works At</option>
              <option value="PHONE">Phone</option>
              <option value="ADDRESS">Address</option>
              <option value="SOCIAL_PROFILE">Social Profile</option>
            </select>
          </div>

          <div class="control-spacer"></div>
          <button class="btn-reset" @click="resetGraphView">Reset View</button>
        </div>

        <div class="graph-container">
          <div class="graph-canvas" id="graph-canvas" ref="graphContainer">
            <!-- D3 Force-Directed Graph with Information Density -->
            <!-- Rendered by D3 -->
          </div>

          <!-- Entity Inspector Panel -->
          <div :class="['entity-inspector', { 'entity-inspector--open': selectedNode }]">
            <template v-if="selectedNode">
              <div class="inspector-header">
                <h3 class="inspector-title">{{ selectedNode.name }}</h3>
                <button class="inspector-close" @click="selectedNode = null">×</button>
              </div>

              <div class="inspector-body">
                <!-- Entity Info -->
                <section class="inspector-section">
                  <h4 class="section-label">Type</h4>
                  <p class="entity-type">{{ selectedNode.type }}</p>
                </section>

                <section class="inspector-section">
                  <h4 class="section-label">Details</h4>
                  <div class="properties-list">
                    <div class="property-item">
                      <span class="prop-key">ID:</span>
                      <span class="prop-value">{{ selectedNode.id }}</span>
                    </div>
                    <div v-if="selectedNode.value" class="property-item">
                      <span class="prop-key">Connectivity:</span>
                      <span class="prop-value">{{ selectedNode.value }}</span>
                    </div>
                    <div v-if="selectedNode.confidence" class="property-item">
                      <span class="prop-key">Confidence:</span>
                      <span class="prop-value">{{ Math.round(selectedNode.confidence * 100) }}%</span>
                    </div>
                  </div>
                </section>

                <!-- Actions -->
                <section class="inspector-section">
                  <button class="path-btn">View Evidence</button>
                  <button class="path-btn">Show Connected</button>
                  <button class="path-btn">Expand Related</button>
                </section>
              </div>
            </template>

            <template v-else>
              <div class="inspector-empty">
                <p>Click a node to inspect</p>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Entities Tab -->
      <div v-show="activeTab === 'Entities'" class="tab-pane">
        <section class="placeholder-section">
          <div class="placeholder">
            <h2>Entities</h2>
            <p>Searchable table of all captured entities</p>
          </div>
        </section>
      </div>

      <!-- Suggestions Tab -->
      <div v-show="activeTab === 'Suggestions'" class="tab-pane">
        <section class="placeholder-section">
          <div class="placeholder">
            <h2>AI Suggestions</h2>
            <p>Pending relationships and recommended next paths</p>
          </div>
        </section>
      </div>

      <!-- Timeline Tab -->
      <div v-show="activeTab === 'Timeline'" class="tab-pane">
        <section class="placeholder-section">
          <div class="placeholder">
            <h2>Research Timeline</h2>
            <p>Chronological view of your research journey</p>
          </div>
        </section>
      </div>

      <!-- Evidence Tab -->
      <div v-show="activeTab === 'Evidence'" class="tab-pane">
        <section class="placeholder-section">
          <div class="placeholder">
            <h2>Evidence Library</h2>
            <p>Screenshots, captured data, and manual notes</p>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useGraphSimulation, type GraphData, type GraphNode } from '../composables/useGraphSimulation'

interface ProjectDetailProps {
  project: {
    id: string
    name: string
    goal: string
    observations: number
    entities: number
    suggestions: number
    lastActivity: string
  }
}

defineProps<ProjectDetailProps>()
defineEmits(['back'])

const activeTab = ref('Overview')
const projectTabs = ['Overview', 'Graph', 'Entities', 'Suggestions', 'Timeline', 'Evidence']
const showSuggestions = ref(true)
const selectedRelationType = ref('')
const graphContainer = ref<HTMLElement | null>(null)
const { selectedNode, initializeGraph } = useGraphSimulation(graphContainer)

const recentActivity = [
  { time: '2h ago', text: 'Captured Barlow Masonry from Google Maps' },
  { time: '1h 50m ago', text: 'Visited barlowmasonry.com' },
  { time: '1h 30m ago', text: 'Found LinkedIn profile' },
  { time: '1h 15m ago', text: 'Screenshot evidence added' },
]

// Mock graph data for D3
const mockGraphData: GraphData = {
  nodes: [
    { id: 'biz_123', name: 'Barlow Masonry', type: 'business', value: 3, confidence: 1 },
    { id: 'web_456', name: 'barlowmasonry.com', type: 'website', value: 1, confidence: 1 },
    { id: 'contact_789', name: '(801) 555-0123', type: 'contact', value: 1, confidence: 1 },
    { id: 'loc_321', name: '123 Main St, Davis County', type: 'location', value: 1, confidence: 1 },
    { id: 'person_654', name: 'Mark Barlow', type: 'person', value: 2, confidence: 0.7 },
    { id: 'maps_111', name: 'Google Maps', type: 'location', value: 1, confidence: 1 },
  ],
  links: [
    { source: 'maps_111', target: 'biz_123', type: 'ORIGIN', status: 'confirmed' },
    { source: 'biz_123', target: 'web_456', type: 'WEBSITE', status: 'confirmed' },
    { source: 'biz_123', target: 'contact_789', type: 'PHONE', status: 'confirmed' },
    { source: 'biz_123', target: 'loc_321', type: 'ADDRESS', status: 'confirmed' },
    { source: 'biz_123', target: 'person_654', type: 'WORKS_AT', status: 'suggested' },
  ],
}

function resetGraphView(): void {
  selectedNode.value = null
  selectedRelationType.value = ''
  showSuggestions.value = true
}

onMounted(() => {
  // Initialize graph when tab becomes active
  if (activeTab.value === 'Graph' && graphContainer.value) {
    setTimeout(() => {
      initializeGraph(mockGraphData, (node) => {
        selectedNode.value = node
      })
    }, 100)
  }
})
</script>

<style scoped>
.project-detail {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 100vh;
  background: var(--pt-bg);
  color: var(--pt-text);
}

/* Header */
.detail-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 48px;
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

.detail-header__left {
  display: flex;
  align-items: center;
  gap: 24px;
}

.btn-back {
  background: transparent;
  border: 1px solid var(--pt-border);
  color: var(--pt-text-muted);
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-family: var(--font-body);
  transition: all 0.2s ease;
}

.btn-back:hover {
  border-color: var(--pt-accent);
  color: var(--pt-accent);
}

.detail-header__info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-header__title {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 600;
  margin: 0;
  color: var(--pt-text);
}

.detail-header__goal {
  font-size: 13px;
  color: var(--pt-text-muted);
  margin: 0;
}

/* Tabs */
.detail-tabs {
  display: flex;
  gap: 2px;
  padding: 0 48px;
  border-bottom: 1px solid var(--pt-border);
  background: var(--pt-surface);
  overflow-x: auto;
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
  white-space: nowrap;
  flex-shrink: 0;
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
.detail-content {
  flex: 1;
  overflow-y: auto;
  padding: 40px 48px;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.tab-pane {
  max-width: 1200px;
  animation: fadeIn 0.3s ease;
}

/* Status Section */
.status-section {
  margin-bottom: 40px;
}

.section-title {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 20px;
  color: var(--pt-text);
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  gap: 16px;
}

.status-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  background: var(--pt-surface);
  border: 1px solid var(--pt-border);
  border-radius: 8px;
  transition: all 0.2s ease;
}

.status-card:hover {
  border-color: var(--pt-accent);
  background: var(--pt-surface-alt);
}

.status-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--pt-accent);
  font-family: 'Courier New', monospace;
}

.status-label {
  font-size: 11px;
  color: var(--pt-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Suggestions Section */
.suggestions-section {
  margin-bottom: 40px;
}

.suggestion-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--pt-surface);
  border: 1px solid var(--pt-border);
  border-radius: 6px;
  font-size: 13px;
}

.suggestion-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.btn-link {
  margin-left: auto;
  background: transparent;
  border: none;
  color: var(--pt-accent);
  cursor: pointer;
  font-size: 12px;
  font-family: var(--font-body);
  text-decoration: none;
  transition: color 0.2s ease;
}

.btn-link:hover {
  color: var(--pt-accent-hover);
}

/* Activity Section */
.activity-section {
  margin-bottom: 40px;
}

.activity-log {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--pt-border);
  font-size: 13px;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-time {
  color: var(--pt-text-muted);
  min-width: 80px;
  font-size: 12px;
}

.activity-text {
  color: var(--pt-text);
  flex: 1;
}

/* Placeholder */
.placeholder-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
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
  font-size: 20px;
  margin: 0 0 8px;
  color: var(--pt-text);
}

.placeholder p {
  margin: 0;
  color: var(--pt-text-muted);
  font-size: 13px;
}

/* Graph Tab */
.graph-tab {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.graph-controls {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid var(--pt-border);
}

.control-group {
  display: flex;
  gap: 8px;
}

.control-btn {
  padding: 8px 16px;
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

.control-btn:hover {
  border-color: var(--pt-text-muted);
  color: var(--pt-text);
}

.control-btn--active {
  background: var(--pt-accent);
  border-color: var(--pt-accent);
  color: white;
}

.control-spacer {
  flex: 1;
}

.filter-label {
  font-size: 12px;
  color: var(--pt-text-muted);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-right: 8px;
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
  outline: none;
}

.btn-reset {
  padding: 8px 16px;
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

.btn-reset:hover {
  border-color: var(--pt-accent);
  color: var(--pt-accent);
}

.graph-container {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
  min-height: 500px;
  flex: 1;
}

.graph-canvas {
  background: var(--pt-surface);
  border: 1px solid var(--pt-border);
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.graph-svg {
  width: 100%;
  height: 100%;
  min-height: 800px;
  background: var(--pt-surface);
}

.graph-background {
  cursor: pointer;
}

.graph-zoom-group {
  cursor: grab;
}

.graph-zoom-group.dragging {
  cursor: grabbing;
}

/* Nodes styling for D3 */
.node {
  cursor: pointer;
  transition: filter 0.2s ease;
}

.node circle {
  stroke-width: 2;
  transition: stroke-width 0.2s ease, r 0.2s ease;
}

.node:hover circle {
  stroke-width: 3;
  filter: url(#node-hover);
}

.node.selected circle {
  stroke-width: 4;
  filter: url(#node-glow);
}

.node text {
  pointer-events: none;
  font-weight: 600;
}

/* Links/Edges styling */
.links-layer line {
  stroke: var(--pt-border);
  transition: stroke-width 0.2s ease, opacity 0.2s ease;
}

.links-layer line.link-confirmed {
  stroke: #3b82f6;
  stroke-width: 2.5;
}

.links-layer line.link-suggested {
  stroke: #fbbf24;
  stroke-width: 2;
  stroke-dasharray: 5, 3;
  opacity: 0.7;
}

.links-layer line.highlighted {
  stroke-width: 4;
  opacity: 1;
}

.links-layer line.dimmed {
  opacity: 0.2;
}

/* Labels - appear/disappear on zoom -->
.labels-layer text {
  font-size: 10px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.labels-layer text.visible {
  opacity: 1;
}

.edge-labels-layer text {
  pointer-events: none;
  opacity: 0.6;
}

/* UI Layer (fixed, doesn't zoom) */
.ui-layer {
  pointer-events: none;
}

.ui-layer rect {
  pointer-events: auto;
}

.stats-box,
.legend-box {
  animation: slideInLeft 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.hints-box {
  animation: fadeIn 0.3s ease 0.2s both;
}

.graph-details {
  background: var(--pt-surface);
  border: 1px solid var(--pt-border);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: slideInRight 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.details-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--pt-border);
}

.details-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--pt-text);
  margin: 0;
}

.details-close {
  background: transparent;
  border: none;
  color: var(--pt-text-muted);
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.details-close:hover {
  color: var(--pt-text);
}

.details-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.edge-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.edge-label {
  font-size: 12px;
  color: var(--pt-text);
  margin: 0;
  line-height: 1.4;
  word-break: break-word;
}

.edge-status,
.edge-confidence {
  font-size: 11px;
  color: var(--pt-text-muted);
  margin: 0;
}

.status-badge {
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
}

.status-confirmed {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.status-suggested {
  background: rgba(255, 193, 7, 0.2);
  color: #ffc107;
}

.confidence-value {
  font-weight: 600;
  color: var(--pt-accent);
}

.edge-evidence {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 12px;
  background: var(--pt-bg);
  border-radius: 6px;
}

.evidence-label {
  font-size: 11px;
  color: var(--pt-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
  font-weight: 600;
}

.evidence-text {
  font-size: 12px;
  color: var(--pt-text);
  margin: 0;
  line-height: 1.4;
}

/* Entity Inspector Panel */
.entity-inspector {
  background: var(--pt-surface);
  border: 1px solid var(--pt-border);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
  opacity: 0;
  pointer-events: none;
}

.entity-inspector--open {
  opacity: 1;
  pointer-events: auto;
}

.inspector-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--pt-border);
  background: var(--pt-surface-alt);
}

.inspector-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--pt-text);
  margin: 0;
  flex: 1;
}

.inspector-close {
  background: transparent;
  border: none;
  color: var(--pt-text-muted);
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s ease;
}

.inspector-close:hover {
  color: var(--pt-text);
}

.inspector-body {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.inspector-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: var(--pt-text-muted);
  font-size: 13px;
  text-align: center;
}

.inspector-section {
  padding: 16px;
  border-bottom: 1px solid var(--pt-border);
}

.inspector-section:last-child {
  border-bottom: none;
}

.section-label {
  font-size: 11px;
  color: var(--pt-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 10px;
  font-weight: 600;
}

.entity-type {
  font-size: 12px;
  color: var(--pt-text);
  margin: 0;
  padding: 6px 10px;
  background: var(--pt-bg);
  border-radius: 4px;
  display: inline-block;
}

.relationships-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.relationship-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: var(--pt-bg);
  border-radius: 4px;
  border-left: 2px solid var(--pt-border);
  font-size: 11px;
}

.relationship-item.rel-confirmed {
  border-left-color: var(--pt-accent);
}

.relationship-item.rel-suggested {
  border-left-color: rgba(255, 193, 7, 0.6);
  background: rgba(255, 193, 7, 0.05);
}

.rel-type {
  font-weight: 600;
  color: var(--pt-accent);
  flex-shrink: 0;
}

.rel-arrow {
  color: var(--pt-text-muted);
  font-size: 9px;
}

.rel-target {
  color: var(--pt-text);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rel-confidence {
  font-size: 10px;
  color: rgba(255, 193, 7, 0.8);
  flex-shrink: 0;
}

.properties-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.property-item {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
  padding: 4px 0;
}

.prop-key {
  color: var(--pt-text-muted);
  font-weight: 500;
}

.prop-value {
  color: var(--pt-text);
  flex: 1;
  text-align: right;
  overflow: hidden;
  text-overflow: ellipsis;
}

.explore-paths {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.path-btn {
  padding: 6px 10px;
  background: transparent;
  border: 1px solid var(--pt-border);
  color: var(--pt-text-muted);
  border-radius: 4px;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 11px;
  transition: all 0.2s ease;
  text-align: left;
}

.path-btn:hover {
  border-color: var(--pt-accent);
  color: var(--pt-accent);
  background: rgba(74, 144, 226, 0.05);
}

/* Responsive */
@media (max-width: 1024px) {
  .graph-container {
    grid-template-columns: 1fr;
  }

  .graph-details {
    max-height: 300px;
  }
}

@media (max-width: 768px) {
  .detail-header {
    padding: 20px;
    flex-direction: column;
    gap: 16px;
  }

  .detail-header__left {
    width: 100%;
    flex-direction: column;
    gap: 12px;
  }

  .detail-header__title {
    font-size: 20px;
  }

  .detail-tabs {
    padding: 0 20px;
  }

  .detail-content {
    padding: 24px;
  }

  .status-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .graph-container {
    grid-template-columns: 1fr;
  }

  .graph-controls {
    flex-wrap: wrap;
  }
}
</style>

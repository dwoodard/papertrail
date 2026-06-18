<template>
  <div class="project-detail">
    <!-- Breadcrumb Navigation -->
    <nav class="breadcrumb-nav">
      <button class="breadcrumb-item" @click="$emit('back')">Papertrail</button>
      <span class="breadcrumb-separator">›</span>
      <button class="breadcrumb-item" @click="$emit('back')">Graph</button>
      <span class="breadcrumb-separator">›</span>
      <span class="breadcrumb-item breadcrumb-item--current">{{ project.name }}</span>
      <span class="breadcrumb-separator">›</span>
      <span class="breadcrumb-item breadcrumb-item--current">Project Graph</span>
    </nav>

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
import { ref } from 'vue'

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
const projectTabs = ['Overview', 'Entities', 'Suggestions', 'Timeline', 'Evidence']


const recentActivity = [
  { time: '2h ago', text: 'Captured Barlow Masonry from Google Maps' },
  { time: '1h 50m ago', text: 'Visited barlowmasonry.com' },
  { time: '1h 30m ago', text: 'Found LinkedIn profile' },
  { time: '1h 15m ago', text: 'Screenshot evidence added' },
]

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

/* Graph Tab - Premium Redesign */
.graph-tab {
  display: flex;
  flex-direction: column;
  gap: 0;
  height: 100%;
  min-height: 700px;
  overflow: hidden;
}

/* Graph Header - Premium Search & Filters */
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

.status-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 12px;
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

.status-btn:hover {
  border-color: var(--pt-text-muted);
  color: var(--pt-text);
}

.status-btn--active {
  background: rgba(74, 144, 226, 0.1);
  border-color: var(--pt-accent);
  color: var(--pt-accent);
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
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
}

/* Constellation Graph SVG */
.constellation-graph {
  width: 100%;
  height: 100%;
  cursor: grab;
}

.constellation-graph:active {
  cursor: grabbing;
}

/* Grid background */
.grid-background circle {
  stroke: var(--pt-accent);
  opacity: 0.05;
}

/* Connections layer */
.connections-layer line {
  stroke-linecap: round;
  transition: stroke-width 0.3s ease, opacity 0.3s ease;
}

.connection-line.status-confirmed {
  stroke: #4a90e2;
  stroke-width: 2.5;
  opacity: 0.8;
}

.connection-line.status-suggested {
  stroke: #fbbf24;
  stroke-width: 2;
  opacity: 0.5;
}

.connection-line:hover {
  stroke-width: 4;
  opacity: 1;
}

/* Central node */
.central-node {
  cursor: pointer;
}

.central-node .node-circle {
  filter: drop-shadow(0 8px 16px rgba(74, 144, 226, 0.3));
  transition: filter 0.3s ease;
}

.central-node:hover .node-circle {
  filter: drop-shadow(0 12px 24px rgba(74, 144, 226, 0.5));
}

.central-node .node-ring {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.2;
    r: 45px;
  }
  50% {
    opacity: 0.4;
    r: 50px;
  }
}

/* Entity nodes */
.entity-node {
  cursor: pointer;
  transition: filter 0.2s ease;
}

.entity-node .node-circle {
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
  transition: filter 0.3s ease, r 0.3s ease;
}

.entity-node:hover .node-circle {
  filter: drop-shadow(0 8px 20px rgba(74, 144, 226, 0.4));
}

.entity-node.node-selected .node-circle {
  filter: drop-shadow(0 0 20px rgba(74, 144, 226, 0.8));
  stroke-width: 3;
}

.entity-node .node-ring {
  transition: stroke 0.2s ease;
}

.entity-node:hover .node-ring {
  stroke: rgba(255, 255, 255, 0.4);
}

.confidence-ring {
  animation: confidence-pulse 1.5s ease-in-out infinite;
}

@keyframes confidence-pulse {
  0%,
  100% {
    opacity: 0.5;
  }
  50% {
    opacity: 1;
  }
}

/* Node labels */
.node-label {
  font-size: 12px;
  font-weight: 600;
  fill: white;
  text-anchor: middle;
  pointer-events: none;
  dominant-baseline: central;
}

.node-label.central-label {
  font-size: 13px;
  font-weight: 700;
}

/* Relationship labels */
.relationship-label {
  font-size: 10px;
  font-weight: 600;
  text-anchor: middle;
  pointer-events: none;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.relationship-label.rel-confirmed {
  fill: #4a90e2;
}

.relationship-label.rel-suggested {
  fill: #fbbf24;
}

/* Graph info stats */
.graph-info {
  position: absolute;
  bottom: 20px;
  right: 20px;
  background: rgba(10, 15, 25, 0.9);
  border: 1px solid var(--pt-border);
  border-radius: 8px;
  padding: 12px 16px;
  backdrop-filter: blur(10px);
}

.info-stats {
  display: flex;
  gap: 20px;
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

/* Inspector Panel - Premium Design */
.inspector-panel {
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

.inspector-panel.panel-open {
  opacity: 1;
  pointer-events: auto;
  transform: translateX(0);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  border-bottom: 1px solid var(--pt-border);
  background: linear-gradient(135deg, var(--pt-surface-alt) 0%, var(--pt-bg) 100%);
}

.panel-title-group {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
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

.panel-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--pt-text);
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.panel-close {
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

.panel-close:hover {
  background: rgba(74, 144, 226, 0.1);
  color: var(--pt-accent);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.panel-empty {
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

.panel-section {
  padding: 16px;
  border-bottom: 1px solid var(--pt-border);
}

.panel-section:last-child {
  border-bottom: none;
  margin-top: auto;
}

.section-title {
  font-size: 11px;
  color: var(--pt-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px;
  font-weight: 700;
}

.section-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.info-label {
  color: var(--pt-text-muted);
  font-weight: 500;
  flex-shrink: 0;
}

.info-value {
  color: var(--pt-text);
  font-weight: 600;
}

.confidence-bar {
  flex: 1;
  height: 4px;
  background: var(--pt-bg);
  border-radius: 2px;
  overflow: hidden;
}

.confidence-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--pt-accent), #4a90e2);
  transition: width 0.3s ease;
}

.connections-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.connection-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  background: var(--pt-bg);
  border-radius: 6px;
  border-left: 3px solid transparent;
  font-size: 11px;
  transition: all 0.2s ease;
}

.connection-item.status-confirmed {
  border-left-color: #2563eb;
  background: rgba(37, 99, 235, 0.05);
}

.connection-item.status-suggested {
  border-left-color: #fbbf24;
  background: rgba(251, 191, 36, 0.05);
}

.connection-item:hover {
  background: var(--pt-surface-alt);
}

.conn-type {
  font-weight: 700;
  color: var(--pt-accent);
  flex-shrink: 0;
  min-width: 60px;
}

.conn-target {
  color: var(--pt-text);
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.conn-badge {
  font-size: 9px;
  color: #fbbf24;
  text-transform: uppercase;
  font-weight: 700;
  padding: 2px 6px;
  background: rgba(251, 191, 36, 0.2);
  border-radius: 3px;
  flex-shrink: 0;
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

.action-btn + .action-btn {
  margin-top: 6px;
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

/* Breadcrumb Navigation */
.breadcrumb-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 48px;
  border-bottom: 1px solid var(--pt-border);
  background: var(--pt-bg);
  font-size: 12px;
  animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.breadcrumb-item {
  background: none;
  border: none;
  color: var(--pt-text-muted);
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
  font-family: var(--font-body);
  font-size: 12px;
}

.breadcrumb-item:hover:not(.breadcrumb-item--current) {
  color: var(--pt-accent);
  background: rgba(74, 144, 226, 0.1);
}

.breadcrumb-item--current {
  color: var(--pt-text);
  cursor: default;
  font-weight: 500;
}

.breadcrumb-item--current:hover {
  background: transparent;
}

.breadcrumb-separator {
  color: var(--pt-text-muted);
  opacity: 0.5;
}

@media (max-width: 768px) {
  .breadcrumb-nav {
    padding: 12px 24px;
    font-size: 11px;
  }

  .breadcrumb-item {
    padding: 2px 6px;
  }
}
</style>

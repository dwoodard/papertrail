<template>
  <div class="papertrail">
    <!-- Header -->
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

    <!-- Navigation Tabs -->
    <nav class="tabs">
      <button
        v-for="tab in availableTabs"
        :key="tab"
        :class="['tab', { 'tab--active': activeTab === tab }]"
        @click="activeTab = tab"
      >
        <span class="tab__label">{{ tab }}</span>
        <span v-if="tab === activeTab" class="tab__indicator"></span>
      </button>
    </nav>

    <!-- Content -->
    <main class="content">
      <!-- Overview Tab -->
      <div v-show="activeTab === 'Overview'" class="tab-pane">
        <section v-if="projects.length > 0" class="projects-section">
          <h2 class="section-title">Active Projects</h2>
          <div class="projects-grid">
            <article v-for="project in projects" :key="project.id" class="project-card" @click="selectProject(project)">
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
      <div v-show="activeTab === 'Graph'" class="tab-pane">
        <section class="placeholder-section">
          <div class="placeholder">
            <h2>Knowledge Graph</h2>
            <p>Multi-project entity relationships visualization</p>
          </div>
        </section>
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

const activeTab = ref('Overview')
const availableTabs = ['Overview', 'Graph', 'Entities', 'Timeline']
const showCreateModal = ref(false)

const form = reactive({
  name: '',
  goal: '',
  target: '',
})

const projects = ref([
  {
    id: '1',
    name: 'Davis County Contractors',
    goal: 'Find decision makers for contractor businesses',
    observations: 48,
    entities: 12,
    suggestions: 6,
    lastActivity: '2 hours ago',
  },
  {
    id: '2',
    name: 'Tech Sector Analysis',
    goal: 'Map key players and funding connections',
    observations: 124,
    entities: 35,
    suggestions: 8,
    lastActivity: '1 hour ago',
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

function selectProject(project: any): void {
  console.log('Opening project:', project.name)
}
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
  --pt-danger: #ef4444;
  --pt-success: #10b981;

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
  text-align: center;
}

.empty-state__content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 400px;
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
</style>

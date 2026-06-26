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
          <section v-if="allGraphProjects.length > 0" class="projects-section">
            <h2 class="section-title">Active Projects</h2>
            <div class="projects-grid">
              <article
                v-for="project in allGraphProjects"
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
                    <span class="stat__value">{{ project.placeCount }}</span>
                    <span class="stat__label">places</span>
                  </div>
                  <div class="stat">
                    <span class="stat__value">{{ project.nodeCount }}</span>
                    <span class="stat__label">nodes</span>
                  </div>
                  <div class="stat">
                    <span class="stat__value">{{ project.edgeCount }}</span>
                    <span class="stat__label">edges</span>
                  </div>
                </div>

                <div class="project-card__footer">
                  <time class="project-card__time">{{ new Date().toLocaleDateString() }}</time>
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
                  <div v-for="mode in ['Project', 'Type', 'Location', 'Cluster']" :key="mode" class="dropdown-item" :style="{ padding: '10px 12px', fontSize: '13px', color: currentViewMode === mode ? 'var(--pt-accent)' : 'var(--pt-text-muted)', cursor: 'pointer', borderRadius: '4px', background: currentViewMode === mode ? 'rgba(74, 144, 226, 0.1)' : 'transparent', transition: '0.2s' }" @click="handleViewModeChange(mode as any)">{{ mode }}</div>
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
                  <option v-for="project in allGraphProjects" :key="project.id" :value="project.id">
                    {{ project.name }} ({{ project.nodeCount }} nodes)
                  </option>
                </select>
              </div>
            </div>

            <div class="header-right">
              <div class="dropdown-wrapper">
                <button
                  class="btn-controls"
                  @click.stop="showGraphControls = !showGraphControls"
                  :class="{ 'controls-active': showGraphControls || graphMinConfidence > 0 || graphRepulsion !== -600 || graphNodesPerRow !== 4 || graphHorizontalGap !== 2000 || graphVerticalGap !== 2000 || graphGridForceStrength !== 0.25 || graphVisibleTypes.size < 5 }"
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
                        max="2000"
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
                        max="2000"
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

                  <div v-if="graphSearch || selectedGraphProject || graphMinConfidence > 0 || graphRepulsion !== -600 || graphNodesPerRow !== 4 || graphHorizontalGap !== 2000 || graphVerticalGap !== 2000 || graphGridForceStrength !== 0.25 || graphVisibleTypes.size < 5" class="control-group">
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
                        @click.stop="selectRelationNode(relation)"
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
                      v-for="mode in ['Project', 'Type', 'Location', 'Cluster']"
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

        <!-- Table Tab -->
        <div v-show="activeTab === 'Table'" class="tab-pane table-tab">
          <!-- Search & Filter Header -->
          <div class="search-header">
            <div class="search-box">
              <span class="search-icon">🔍</span>
              <input
                id="table-entity-search"
                v-model="tableSearch"
                type="text"
                placeholder="Search entities..."
                class="search-input"
                name="entity-search"
              />
              <button v-if="tableSearch" class="search-clear" @click="tableSearch = ''">✕</button>
            </div>

            <button
              class="btn-toggle-filters"
              @click.stop="showTableFilters = !showTableFilters"
            >
              Filters {{ showTableFilters ? '▼' : '▶' }}
            </button>
          </div>

          <div v-show="showTableFilters" class="table-filter-bar" @click.stop>
            <div class="filter-group-compact">
              <span class="filter-label-compact">Project:</span>
              <select v-model="selectedTableProject" class="filter-select-compact">
                <option value="">All</option>
                <option v-for="project in allGraphProjects" :key="project.id" :value="project.id">
                  {{ project.name }}
                </option>
              </select>
            </div>

            <div class="filter-group-compact">
              <span class="filter-label-compact">Types:</span>
              <label class="checkbox-compact">
                <input :checked="tableVisibleTypes.business" type="checkbox" @change="toggleTableType('business')" />
                <span :style="{ color: getEntityTypeColor('business') }">Business</span>
              </label>
              <label class="checkbox-compact">
                <input :checked="tableVisibleTypes.person" type="checkbox" @change="toggleTableType('person')" />
                <span :style="{ color: getEntityTypeColor('person') }">Person</span>
              </label>
              <label class="checkbox-compact">
                <input :checked="tableVisibleTypes.location" type="checkbox" @change="toggleTableType('location')" />
                <span :style="{ color: getEntityTypeColor('location') }">Location</span>
              </label>
              <label class="checkbox-compact">
                <input :checked="tableVisibleTypes.website" type="checkbox" @change="toggleTableType('website')" />
                <span :style="{ color: getEntityTypeColor('website') }">Website</span>
              </label>
              <label class="checkbox-compact">
                <input :checked="tableVisibleTypes.contact" type="checkbox" @change="toggleTableType('contact')" />
                <span :style="{ color: getEntityTypeColor('contact') }">Contact</span>
              </label>
            </div>

            <div class="filter-group-compact">
              <span class="filter-label-compact">Connections:</span>
              <input v-model.number="tableMinConnections" type="number" min="0" class="number-input-compact" placeholder="Min" />
              <span class="filter-separator">-</span>
              <input v-model.number="tableMaxConnections" type="number" min="0" class="number-input-compact" placeholder="Max" />
            </div>

            <button class="btn-reset-filters-compact" @click="resetTableFilters" v-if="selectedTableProject || tableMinConnections > 0 || tableMaxConnections < Infinity || !Object.values(tableVisibleTypes).every(v => v)">
              Reset
            </button>
          </div>

          <!-- Grouping Panel -->
          <div class="grouping-panel">
            <label class="grouping-label">Group By:</label>
            <div class="grouping-chips">
              <div
                v-for="(groupCol, idx) in tableGrouping"
                :key="groupCol"
                class="group-chip"
              >
                {{ columns.find(c => c.id === groupCol || (c as any).columnDef?.header === groupCol)?.header || groupCol }}
                <button
                  class="remove-group-btn"
                  @click="tableGrouping = tableGrouping.filter((_, i) => i !== idx)"
                  title="Remove from grouping"
                >
                  ✕
                </button>
              </div>
            </div>
            <div
              class="grouping-drop-zone"
              :class="{ 'drag-over': dragOverGrouping }"
              @dragover.prevent="dragOverGrouping = true"
              @dragleave="dragOverGrouping = false"
              @drop.prevent="handleGroupDrop"
            >
              <span v-if="tableGrouping.length === 0" class="drop-hint">Drag column headers here to group</span>
            </div>
          </div>

          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th v-for="header in table.getHeaderGroups()[0]?.headers" :key="header.id" class="table-header" :style="{ width: header.getSize() }">
                    <div
                      :draggable="!header.isPlaceholder"
                      class="header-content"
                      :class="{ 'draggable': !header.isPlaceholder }"
                      @dragstart="handleHeaderDragStart(header, $event)"
                    >
                      <button
                        v-if="header.column.getCanSort()"
                        @click="header.column.toggleSorting()"
                        class="sort-button"
                        :class="{ 'sorted': header.column.getIsSorted() }"
                      >
                        {{ header.isPlaceholder ? null : header.column.columnDef.header }}
                        <span class="sort-icon" v-if="header.column.getIsSorted()">
                          {{ header.column.getIsSorted() === 'desc' ? '▼' : '▲' }}
                        </span>
                      </button>
                      <div v-else class="table-header-text">
                        {{ header.isPlaceholder ? null : header.column.columnDef.header }}
                      </div>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                <template v-for="(row, rowIndex) in table.getRowModel().rows" :key="row.id">
                  <tr
                    class="table-row"
                    :class="{ 'row-selected': rowSelection[rowIndex], 'group-row': row.getIsGrouped() }"
                    :style="{ paddingLeft: `${row.depth * 20}px` }"
                  >
                    <td v-for="cell in row.getVisibleCells()" :key="cell.id" class="table-cell" :style="{ width: cell.column.getSize() }">
                      <!-- Group header with expand/collapse -->
                      <template v-if="row.getIsGrouped() && cell.column.id === row.groupingColumnId">
                        <div class="group-header">
                          <button
                            class="expand-btn"
                            @click="row.toggleExpanded()"
                          >
                            {{ row.getIsExpanded() ? '▼' : '▶' }}
                          </button>
                          <span class="group-value">
                            {{ row.groupingColumnId === 'project' ? row.original.project?.name : row.original[row.groupingColumnId as keyof typeof row.original] }} ({{ row.subRows.length }})
                          </span>
                        </div>
                      </template>
                      <!-- Empty cell for grouped rows (non-grouped column) -->
                      <template v-else-if="row.getIsGrouped()">
                      </template>
                      <!-- Regular cell -->
                      <template v-else-if="!cell.getIsAggregated()">
                        <template v-if="cell.column.columnDef.header === 'Type'">
                          <span :style="{ color: getEntityTypeColor(cell.getValue() as string), fontWeight: '600', textTransform: 'capitalize' }">
                            {{ cell.getValue() }}
                          </span>
                        </template>
                        <template v-else>
                          {{ cell.getValue() }}
                        </template>
                      </template>
                      <!-- Aggregated cell (count) -->
                      <template v-else-if="cell.getIsAggregated()">
                        {{ cell.getValue() }}
                      </template>
                    </td>
                  </tr>
                </template>
              </tbody>
            </table>
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
import {
  useVueTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getExpandedRowModel,
  createColumnHelper,
  type SortingState,
  type GroupingState,
  type ExpandedState,
} from '@tanstack/vue-table'
import ProjectDetail from './ProjectDetail.vue'
import { useGraphSimulation, type GraphData, type GraphNode, type ViewModeId } from '../composables/useGraphSimulation'
import { graphApiClient } from '../services/graphApiClient'

const activeTab = ref('Overview')
const tabs = ['Overview', 'Graph', 'Table', 'Entities', 'Timeline']
const showCreateModal = ref(false)
const selectedProject = ref<any>(null)

// Log tab changes
watch(activeTab, (newTab, oldTab) => {
  console.log(`[Papertrail] Tab changed: "${oldTab || 'initial'}" → "${newTab}"`)
})

// Sync Table filters to Graph when switching to Graph tab
watch(activeTab, (newTab, oldTab) => {
  if (newTab === 'Graph' && oldTab === 'Table') {
    // Sync entity types: convert tableVisibleTypes object to graphVisibleTypes Set
    const visibleTypes = Object.keys(tableVisibleTypes.value).filter(
      type => tableVisibleTypes.value[type as keyof typeof tableVisibleTypes.value]
    )
    graphVisibleTypes.value = new Set(visibleTypes)

    // Sync project filter
    selectedGraphProject.value = selectedTableProject.value

    console.log('[Papertrail] Synced Table filters to Graph view')
  }
})

// Graph API state
const allGraphProjects = ref<any[]>([])
const graphProjectsLoading = ref(false)
const graphDataCache = new Map<string, any>()

// Graph view state
const hubGraphContainer = ref<HTMLElement | null>(null)
const graphSearch = ref('')
const selectedGraphProject = ref('')
const selectedGraphNode = ref<GraphNode | null>(null)
const graphSortBy = ref<'Name' | 'Size'>('Name')
const graphMinConfidence = ref(0)
const graphRepulsion = ref(-600)
const graphNodesPerRow = ref(4)
const graphVisibleTypes = ref<Set<string>>(new Set(['business', 'person', 'location', 'website', 'contact']))
const graphHorizontalGap = ref(2000)
const graphVerticalGap = ref(2000)
const graphGridForceStrength = ref(0.25)
const showGraphControls = ref(false)
const showViewByDropdown = ref(false)
const currentViewMode = ref<ViewModeId>('Cluster')

// Table view state
const tableSearch = ref('')
const tableVisibleTypes = ref({
  business: true,
  person: true,
  location: true,
  website: true,
  contact: true,
})
const tableSortBy = ref<'name' | 'type' | 'connections' | 'project'>('name')
const tableSortAsc = ref(true)
const showTableFilters = ref(false)
const selectedTableProject = ref('')
const tableMinConnections = ref(0)
const tableMaxConnections = ref(Infinity)
const tableRequestId = ref(0)

const graphConfig = {
  minConfidence: graphMinConfidence,
  repulsion: graphRepulsion,
  visibleTypes: graphVisibleTypes,
}

const { initializeGraph, centerNode, setViewMode, updateForces, setGridConfig, resetLockedNodes, lockedNodes, selectNodeById, selectNodeReactively, fitToView } = useGraphSimulation(hubGraphContainer, graphConfig)

function closeGraphControls() {
  showGraphControls.value = false
}

function closeViewByDropdown() {
  showViewByDropdown.value = false
}

function closeTableFilters() {
  showTableFilters.value = false
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

function handleViewModeChange(mode: ViewModeId) {
  currentViewMode.value = mode
  setViewMode(mode)
}

function handleSort(sortBy: 'Name' | 'Size') {
  graphSortBy.value = sortBy
}

function toggleTableSort(column: 'name' | 'type' | 'connections' | 'project') {
  if (tableSortBy.value === column) {
    tableSortAsc.value = !tableSortAsc.value
  } else {
    tableSortBy.value = column
    tableSortAsc.value = true
  }
}

function toggleTableType(type: 'business' | 'person' | 'location' | 'website' | 'contact') {
  tableVisibleTypes.value[type] = !tableVisibleTypes.value[type]
}

function resetTableFilters() {
  tableSearch.value = ''
  selectedTableProject.value = ''
  tableMinConnections.value = 0
  tableMaxConnections.value = Infinity
  tableVisibleTypes.value = {
    business: true,
    person: true,
    location: true,
    website: true,
    contact: true,
  }
}

function highlightSearchMatch(text: string): string {
  if (!tableSearch.value) return text
  const regex = new RegExp(`(${tableSearch.value})`, 'gi')
  return text.replace(regex, '<strong style="background: rgba(251, 191, 36, 0.3); font-weight: 600;">$1</strong>')
}

function getNodeConnectionTypes(nodeId: string): Record<string, boolean> {
  const types: Record<string, boolean> = {
    business: false,
    person: false,
    location: false,
    website: false,
    contact: false,
  }

  const node = sortedTableNodes.value.find(n => n.id === nodeId)
  if (!node || !selectedNodeRelations.value) return types

  // Check the selected node's relations (if this node is selected)
  if (selectedGraphNode.value?.id === nodeId) {
    selectedNodeRelations.value.forEach(rel => {
      if (types.hasOwnProperty(rel.nodeType)) {
        types[rel.nodeType] = true
      }
    })
  }

  return types
}


onMounted(async () => {
  console.log('[Papertrail] Extension mounted, initializing...')

  // Fetch projects from API
  try {
    console.log('[Papertrail] Fetching projects from http://papertrail.test/api/projects')
    const startTime = performance.now()
    const response = await fetch('http://papertrail.test/api/projects')
    const duration = performance.now() - startTime
    console.log(`[Papertrail] API response received (${duration.toFixed(2)}ms) - Status: ${response.status}`)

    const apiProjects = await response.json()
    console.log(`[Papertrail] Parsed API projects: ${apiProjects.length} projects`)

    // Map API projects to include slug as id for chrome storage compatibility
    projects.value = apiProjects.map(p => ({
      ...p,
      slug: p.slug || p.id, // Fallback to id if slug missing
      observations: 0,
      entities: 0,
      suggestions: 0,
      lastActivity: 'just now',
    }))

    console.log('[Papertrail] Projects mapped successfully:', projects.value.length, 'total')
  } catch (err) {
    console.error('[Papertrail] Failed to load projects from API:', err)
  }

  // Fetch graph projects from new API
  try {
    console.log('[Papertrail] Starting graph projects fetch...')
    graphProjectsLoading.value = true
    const startTime = performance.now()
    const projects = await graphApiClient.getProjects()
    const duration = performance.now() - startTime
    console.log(`[Papertrail] Graph projects fetched (${duration.toFixed(2)}ms): ${projects.length} projects`)

    allGraphProjects.value = projects

    if (projects.length > 0) {
      console.log('[Papertrail] First project sample:', {
        id: projects[0].id,
        name: projects[0].name,
        nodeCount: projects[0].nodeCount,
        placeCount: projects[0].placeCount,
        edgeCount: projects[0].edgeCount,
      })
    }
  } catch (err: unknown) {
    console.error('[Papertrail] Failed to load graph projects:', err)
    if (err instanceof Error) {
      console.error('[Papertrail] Error details:', err.message, err.stack)
    }
  } finally {
    graphProjectsLoading.value = false
  }

  // Save projects to storage on mount
  saveProjectsToStorage()

  // Set first project as active by default
  if (projects.value.length > 0) {
    console.log('[Papertrail] Setting active project to:', projects.value[0].slug)
    chrome.storage.local.set({ 'pt.activeProjectId': projects.value[0].slug }, () => {
      console.log('[Papertrail] Active project saved:', projects.value[0].slug)
      debugStorage()
    })
  }

  document.addEventListener('click', closeGraphControls)
  document.addEventListener('click', closeViewByDropdown)
  document.addEventListener('click', closeTableFilters)
  console.log('[Papertrail] Mount complete, event listeners attached')
})

onBeforeUnmount(() => {
  document.removeEventListener('click', closeGraphControls)
  document.removeEventListener('click', closeViewByDropdown)
  document.removeEventListener('click', closeTableFilters)
})

// Save active project when selected
watch(selectedProject, (newProject) => {
  if (newProject) {
    console.log(`[Papertrail] Project selected: "${newProject.name}" (ID: ${newProject.id})`)
    chrome.storage.local.set({ 'pt.activeProjectId': newProject.id })
  }
})

// Debug: Log when projects load
watch(allGraphProjects, (newProjects) => {
  console.log(`[Papertrail] Graph projects updated: ${newProjects.length} projects`)
  if (newProjects.length > 0) {
    console.log('[Papertrail] First project:', {
      name: newProjects[0].name,
      nodes: newProjects[0].nodeCount,
      edges: newProjects[0].edgeCount,
      places: newProjects[0].placeCount,
    })
  }
})

// Load node relations when node is selected
watch(selectedGraphNode, () => {
  loadNodeRelations()
})

const form = reactive({
  name: '',
  goal: '',
  target: '',
})

const projects = ref([])

function openWorkspace(): void {
  console.log('[Papertrail] Clicked: Open Workspace')
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      console.log(`[Papertrail] Opening side panel for tab: ${tabs[0].id}`)
      chrome.sidePanel.open({ tabId: tabs[0].id })
    }
  })
}

function openCreateModal(): void {
  console.log('[Papertrail] Clicked: Open Create Project Modal')
  showCreateModal.value = true
}

function closeCreateModal(): void {
  console.log('[Papertrail] Closed: Create Project Modal')
  showCreateModal.value = false
  form.name = ''
  form.goal = ''
  form.target = ''
}

function saveProjectsToStorage(): void {
  const projectsArray = JSON.parse(JSON.stringify(projects.value))
  // console.log('[Main.vue] Saving projects to storage:', projectsArray)
  chrome.storage.local.set({ 'pt.projects': projectsArray }, () => {
    // console.log('[Main.vue] Projects saved successfully')
  })
}

function debugStorage(): void {
  chrome.storage.local.get(null, (allData) => {
    // console.log('[DEBUG] All Chrome Storage:', allData)
    // console.log('[DEBUG] pt.activeProjectId:', allData['pt.activeProjectId'])
    // console.log('[DEBUG] pt.projects:', allData['pt.projects'])
    // console.log('[DEBUG] results count:', allData['results']?.length || 0)
  })
}

async function createProject(): Promise<void> {
  if (!form.name.trim()) return

  console.log(`[Papertrail] Creating project: "${form.name}"`)
  try {
    // Generate UUID for project (same format as backend)
    const projectId = crypto.randomUUID()
    console.log(`[Papertrail] Generated project ID: ${projectId}`)

    // Create project on backend first
    const startTime = performance.now()
    await graphApiClient.createProject(projectId, form.name, form.goal)
    const duration = performance.now() - startTime
    console.log(`[Papertrail] Project created on backend (${duration.toFixed(2)}ms)`)

    // Then add to local list
    const newProject = {
      id: projectId,
      name: form.name,
      goal: form.goal || undefined,
      observations: 0,
      entities: 0,
      suggestions: 0,
      lastActivity: 'just now',
    }

    projects.value.unshift(newProject)
    console.log(`[Papertrail] Project added to local list`)
    saveProjectsToStorage()

    // Refresh graph projects list
    console.log(`[Papertrail] Refreshing graph projects list...`)
    allGraphProjects.value = await graphApiClient.getProjects()
    console.log(`[Papertrail] Graph projects refreshed: ${allGraphProjects.value.length} total`)

    closeCreateModal()
  } catch (error) {
    console.error('[Papertrail] Failed to create project:', error)
    alert('Failed to create project. Please try again.')
  }
}

// Graph view functions
const totalEntitiesCount = computed(() => {
  return allGraphProjects.value.reduce((sum, project) => sum + (project.nodeCount || 0), 0)
})

const totalRelationshipsCount = computed(() => {
  return allGraphProjects.value.reduce((sum, project) => sum + (project.edgeCount || 0), 0)
})

const selectedNodeRelations = ref<any[]>([])
const sortedTableNodes = ref<GraphNode[]>([])

// TanStack Table setup
const columnHelper = createColumnHelper<GraphNode>()
const tableSorting = ref<SortingState>([])
const rowSelection = ref<Record<string, boolean>>({})
const tableGrouping = ref<GroupingState>([])
const tableExpanded = ref<ExpandedState>({})
const dragOverGrouping = ref(false)

function handleHeaderDragStart(header: any, event: DragEvent) {
  const columnId = header.column.id
  event.dataTransfer!.effectAllowed = 'move'
  event.dataTransfer!.setData('columnId', columnId)
}

function handleGroupDrop(event: DragEvent) {
  event.preventDefault()
  dragOverGrouping.value = false
  const columnId = event.dataTransfer!.getData('columnId')

  // Add to grouping if not already there
  if (!tableGrouping.value.includes(columnId)) {
    tableGrouping.value = [...tableGrouping.value, columnId]
  }
}

const columns = [
  columnHelper.accessor('name', {
    header: 'Name',
  }),
  columnHelper.accessor('type', {
    header: 'Type',
  }),
  columnHelper.accessor('value', {
    header: 'Connections',
  }),
  columnHelper.accessor((row: GraphNode) => row.project?.name || '—', {
    id: 'project',
    header: 'Project',
  }),
]

const table = computed(() =>
  useVueTable({
    get data() {
      return sortedTableNodes.value
    },
    columns,
    state: {
      get sorting() {
        return tableSorting.value
      },
      get rowSelection() {
        return rowSelection.value
      },
      get grouping() {
        return tableGrouping.value
      },
      get expanded() {
        return tableExpanded.value
      },
    },
    onSortingChange: (updater: any) => {
      tableSorting.value = typeof updater === 'function' ? updater(tableSorting.value) : updater
    },
    onRowSelectionChange: (updater: any) => {
      const newSelection = typeof updater === 'function' ? updater(rowSelection.value) : updater
      rowSelection.value = newSelection

      const rowIndex = Object.keys(newSelection).find(key => newSelection[key] === true)
      if (rowIndex !== undefined) {
        const selectedNode = sortedTableNodes.value[parseInt(rowIndex)]
        if (selectedNode) {
          selectNodeInGraph(selectedNode.id).catch(err => console.error('Error selecting node:', err))
        }
      }
    },
    onGroupingChange: (updater: any) => {
      tableGrouping.value = typeof updater === 'function' ? updater(tableGrouping.value) : updater
    },
    onExpandedChange: (updater: any) => {
      tableExpanded.value = typeof updater === 'function' ? updater(tableExpanded.value) : updater
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })
)

function normalizeNodeType(dbType: string): string {
  const typeMap: Record<string, string> = {
    'phone': 'contact',
    'domain': 'website',
    'address': 'location',
    'city': 'location',
    'category': 'business',
  }
  return typeMap[dbType] || dbType
}

const loadNodeRelations = async () => {
  if (!selectedGraphNode.value) {
    selectedNodeRelations.value = []
    return
  }

  try {
    const relations = await graphApiClient.getNodeRelations(selectedGraphNode.value.id)
    selectedNodeRelations.value = relations.map(r => ({
      nodeId: r.nodeId,
      nodeName: r.nodeName,
      nodeType: normalizeNodeType(r.nodeType),
      relationType: r.relationType,
      connectionCount: r.connectionCount,
    }))
  } catch (error) {
    console.error('Failed to load node relations:', error)
    selectedNodeRelations.value = []
  }
}

async function resetGraphFilters(): Promise<void> {
  graphSearch.value = ''
  selectedGraphProject.value = ''
  await selectNodeInGraph(null)
  graphMinConfidence.value = 0
  graphRepulsion.value = -600
  graphNodesPerRow.value = 4
  graphHorizontalGap.value = 2000
  graphVerticalGap.value = 2000
  graphGridForceStrength.value = 0.25
  graphVisibleTypes.value = new Set(['business', 'person', 'location', 'website', 'contact'])
  showGraphControls.value = false
}

function navigateToProjectGraph(): void {
  if (!selectedGraphNode.value) return

  // Set selected graph project and switch to graph tab
  selectedGraphProject.value = selectedGraphNode.value.project?.id || ''
  activeTab.value = 'Graph'
}

async function selectRelationNode(relation: any): Promise<void> {
  // Ensure the node type is visible
  if (!graphVisibleTypes.value.has(relation.nodeType)) {
    const newTypes = new Set(graphVisibleTypes.value)
    newTypes.add(relation.nodeType)
    graphVisibleTypes.value = newTypes
  }

  // Select the node
  await selectNodeInGraph(relation.nodeId)
}

async function selectNodeInGraph(nodeId: string | null): Promise<void> {
  if (!nodeId) {
    selectedGraphNode.value = null
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

  let hubData = await buildHubGraphData()
  let nodeToSelect = hubData.nodes.find((n) => String(n.id) === String(nodeId))

  if (!nodeToSelect) {
    // Node might be from a different project. Load all projects without filters
    const allNodes: GraphNode[] = []
    for (const project of allGraphProjects.value) {
      try {
        const projectData = await graphApiClient.getProjectGraph(project.id, { types: [] })
        projectData.nodes.forEach((node: any) => {
          if (!allNodes.find(n => String(n.id) === String(node.id))) {
            allNodes.push({
              ...node,
              project: { id: project.id, name: project.name },
              name: node.label,
            } as GraphNode)
          }
        })
      } catch (error) {
        console.error(`Failed to load project ${project.id}:`, error)
      }
    }
    nodeToSelect = allNodes.find((n) => String(n.id) === String(nodeId))
  }

  if (!nodeToSelect) {
    return
  }

  selectedGraphNode.value = nodeToSelect
  selectNodeReactively(nodeToSelect)

  // Center the node with a small delay
  setTimeout(() => {
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

async function clearGraphHighlight(): Promise<void> {
  const container = hubGraphContainer.value
  if (!container) return

  const svg = container.querySelector('svg')
  if (!svg) return

  const d3 = (window as any).d3
  if (!d3) return

  const hubData = await buildHubGraphData()
  const selectedNodeId = selectedGraphNode.value?.id
  const connectedNodeIds = new Set<string>()

  if (selectedNodeId) {
    hubData.links.forEach((link: any) => {
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

async function buildHubGraphData(): Promise<GraphData> {
  try {
    // If no project selected, combine data from all projects
    if (!selectedGraphProject.value) {
      const allNodes: GraphNode[] = []
      const allLinks: any[] = []
      const nodeMap = new Map<string, GraphNode>()

      for (const project of allGraphProjects.value) {
        const typesKey = Array.from(graphVisibleTypes.value).sort().join(',')
        const cacheKey = `${project.id}:${graphSearch.value}:${typesKey}`
        let projectData = graphDataCache.get(cacheKey)

        if (!projectData) {
          projectData = await graphApiClient.getProjectGraph(project.id, {
            search: graphSearch.value || undefined,
            types: Array.from(graphVisibleTypes.value),
          })
          graphDataCache.set(cacheKey, projectData)
        }

        // Add project info to nodes
        projectData.nodes.forEach((node: any) => {
          if (!nodeMap.has(node.id)) {
            const graphNode: GraphNode = {
              ...node,
              project: { id: project.id, name: project.name },
              name: node.label,
            }
            allNodes.push(graphNode)
            nodeMap.set(node.id, graphNode)
          }
        })

        projectData.links.forEach((link: any) => {
          allLinks.push(link)
        })
      }

      // Sort nodes
      const sortedNodes = [...allNodes]
      if (graphSortBy.value === 'Name') {
        sortedNodes.sort((a, b) => a.name.localeCompare(b.name))
      } else if (graphSortBy.value === 'Size') {
        sortedNodes.sort((a, b) => (b.value || 0) - (a.value || 0))
      }

      return { nodes: sortedNodes, links: allLinks }
    } else {
      // Single project selected
      const typesKey = Array.from(graphVisibleTypes.value).sort().join(',')
      const cacheKey = `${selectedGraphProject.value}:${graphSearch.value}:${typesKey}`
      let projectData = graphDataCache.get(cacheKey)

      if (!projectData) {
        projectData = await graphApiClient.getProjectGraph(selectedGraphProject.value, {
          search: graphSearch.value || undefined,
          types: Array.from(graphVisibleTypes.value),
        })
        graphDataCache.set(cacheKey, projectData)
      }

      const graphNode = allGraphProjects.value.find(p => p.id === selectedGraphProject.value)
      const project = graphNode || { id: selectedGraphProject.value, name: selectedGraphProject.value }

      const nodes = projectData.nodes.map((node: any) => ({
        ...node,
        project,
        name: node.label,
      }))

      // Sort nodes
      if (graphSortBy.value === 'Name') {
        nodes.sort((a, b) => a.name.localeCompare(b.name))
      } else if (graphSortBy.value === 'Size') {
        nodes.sort((a, b) => (b.value || 0) - (a.value || 0))
      }

      return { nodes, links: projectData.links }
    }
  } catch (error) {
    console.error('Failed to build hub graph data:', error)
    return { nodes: [], links: [] }
  }
}

// Initialize/update hub graph when tab opens or filters change
watch(
  [activeTab, selectedGraphProject, graphSearch, graphMinConfidence, graphRepulsion, graphSortBy, graphVisibleTypes],
  async () => {
    if (activeTab.value === 'Graph' && hubGraphContainer.value) {
      setTimeout(async () => {
        const hubData = await buildHubGraphData()
        // Always initialize graph (even with empty data) to properly clean up D3 state
        // console.log('[watch] Reinitializing graph with', hubData.nodes.length, 'nodes')

        // Create a non-async click handler wrapper
        const clickHandler = (node: any) => {
          selectNodeInGraph(node ? node.id : null).catch(err => console.error('Error selecting node:', err))
        }

        try {
          initializeGraph(hubData, clickHandler, true)
          if (hubData.nodes.length > 0) {
            setViewMode(currentViewMode.value)
          }
        } catch (error) {
          console.error('[watch] Error initializing graph:', error)
        }
      }, 100)
    }
  },
  { immediate: false }
)

// Update table data when filters or sort settings change
watch(
  [activeTab, tableSearch, tableSortBy, tableSortAsc, selectedTableProject, tableMinConnections, tableMaxConnections, tableVisibleTypes],
  async () => {
    if (activeTab.value === 'Table') {
      const requestId = ++tableRequestId.value
      console.log(`[Table] Loading data... Request #${requestId}. Projects:`, allGraphProjects.value.length)
      try {
        const allNodes: GraphNode[] = []
        const nodeMap = new Map<string, GraphNode>()

        // Get nodes from selected project or all projects
        const projectsToLoad = selectedTableProject.value
          ? allGraphProjects.value.filter(p => p.id === selectedTableProject.value)
          : allGraphProjects.value

        // Get visible types list
        const visibleTypesList = Object.keys(tableVisibleTypes.value).filter(type => tableVisibleTypes.value[type as keyof typeof tableVisibleTypes.value])

        // If no types are selected, show nothing
        if (visibleTypesList.length === 0) {
          sortedTableNodes.value = []
          return
        }

        for (const project of projectsToLoad) {
          const typesKey = visibleTypesList.sort().join(',')
          const cacheKey = `${project.id}:${tableSearch.value}:${typesKey}`
          let projectData = graphDataCache.get(cacheKey)

          if (!projectData) {
            projectData = await graphApiClient.getProjectGraph(project.id, {
              search: tableSearch.value || undefined,
              types: visibleTypesList,
            })
            graphDataCache.set(cacheKey, projectData)
          }

          projectData.nodes.forEach((node: any) => {
            if (!nodeMap.has(node.id)) {
              const graphNode: GraphNode = {
                ...node,
                project: { id: project.id, name: project.name },
                name: node.label,
              }

              // Apply connection count filter
              const connections = graphNode.value || 0
              if (connections >= tableMinConnections.value && connections <= tableMaxConnections.value) {
                allNodes.push(graphNode)
                nodeMap.set(node.id, graphNode)
              }
            }
          })
        }

        if (requestId !== tableRequestId.value) return

        // Sort nodes
        const sorted = [...allNodes]
        sorted.sort((a, b) => {
          let comparison = 0

          switch (tableSortBy.value) {
            case 'name':
              comparison = a.name.localeCompare(b.name)
              break
            case 'type':
              comparison = a.type.localeCompare(b.type)
              break
            case 'connections':
              comparison = (a.value || 0) - (b.value || 0)
              break
            case 'project':
              comparison = (a.project?.name || '').localeCompare(b.project?.name || '')
              break
          }

          return tableSortAsc.value ? comparison : -comparison
        })

        sortedTableNodes.value = sorted
        console.log(`[Table] Request #${requestId} completed. Loaded nodes:`, sorted.length)
      } catch (error) {
        console.error('Failed to build table data:', error)
        sortedTableNodes.value = []
      }
    }
  },
  { deep: true }
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

// Force table recompute when grouping changes
watch(
  () => tableGrouping.value,
  () => {
    tableExpanded.value = {}
  },
  { deep: true }
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

/* Table Tab Styles */
.table-tab {
  display: flex;
  flex-direction: column;
  gap: 0;
  overflow: hidden !important;
  height: calc(100vh - 200px);
  padding: 0;
}

/* Search & Filter Header */
.search-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--pt-border);
  background: linear-gradient(135deg, var(--pt-surface) 0%, var(--pt-bg) 100%);
  animation: slideDown 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  flex-shrink: 0;
  margin-bottom: 16px;
}

/* Table Column Header */
.table-header {
  padding: 12px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--pt-text-muted);
  border-right: 1px solid var(--pt-border);
  display: table-cell;
  flex: 1;
}

.table-container-wrapper {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  padding: 20px 24px;
}

.entities-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--pt-surface);
  border: 1px solid var(--pt-border);
  border-radius: 8px;
  overflow: hidden;
}

.entities-table thead {
  background: linear-gradient(135deg, var(--pt-surface-alt) 0%, var(--pt-bg) 100%);
  border-bottom: 2px solid var(--pt-accent);
  position: sticky;
  top: 0;
  z-index: 10;
}

.entities-table th {
  padding: 16px 12px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--pt-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  position: relative;
}

.entities-table th:hover {
  background: rgba(74, 144, 226, 0.1);
  color: var(--pt-accent);
}

.entities-table th.sort-active {
  color: var(--pt-accent);
  background: rgba(74, 144, 226, 0.1);
}

.sort-indicator {
  margin-left: 6px;
  font-size: 10px;
  opacity: 0.8;
}

.entities-table tbody {
  display: table-row-group;
}

.table-row {
  display: table-row;
  border-bottom: 1px solid var(--pt-border);
  transition: all 0.2s ease;
  cursor: pointer;
}

.table-row {
  background: linear-gradient(90deg, rgba(74, 144, 226, calc(var(--connection-intensity) * 0.08)) 0%, transparent 100%);
}

.table-row.row-hub {
  background: linear-gradient(90deg, rgba(34, 197, 94, 0.1) 0%, transparent 100%);
}

.table-row.row-isolated {
  background: linear-gradient(90deg, rgba(107, 114, 128, 0.05) 0%, transparent 100%);
}

.table-row.row-connected {
  background: linear-gradient(90deg, rgba(59, 130, 246, 0.08) 0%, transparent 100%);
}

.table-row:hover {
  background: rgba(74, 144, 226, 0.1) !important;
}

.table-row.row-selected {
  background: rgba(74, 144, 226, 0.2) !important;
  border-bottom-color: var(--pt-accent);
}

.entities-table td {
  padding: 14px 12px;
  font-size: 13px;
  color: var(--pt-text);
}

.cell-name {
  font-weight: 500;
  color: var(--pt-text);
}

.name-with-badge {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hub-badge {
  font-size: 14px;
  flex-shrink: 0;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.cell-type {
  text-align: center;
}

.cell-connections {
  text-align: center;
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: var(--pt-accent);
}

.connections-with-types {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.connection-count {
  min-width: 30px;
}

.connection-type-dots {
  display: flex;
  gap: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.dot-business {
  background: #2563eb;
}

.dot-person {
  background: #9333ea;
}

.dot-location {
  background: #16a34a;
}

.dot-website {
  background: #0891b2;
}

.dot-contact {
  background: #d97706;
}

.cell-project {
  font-size: 12px;
  color: var(--pt-text-muted);
}

.table-container {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--pt-surface);
  border: 1px solid var(--pt-border);
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  font-size: 13px;
  font-family: var(--font-body);
  table-layout: fixed;
  display: flex;
  flex-direction: column;
}

.data-table thead {
  background: linear-gradient(135deg, var(--pt-surface-alt) 0%, var(--pt-bg) 100%);
  border-bottom: 1px solid var(--pt-border);
  position: sticky;
  top: 0;
  z-index: 10;
  display: table;
  width: 100%;
  table-layout: fixed;
}

.data-table thead tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

.table-header {
  padding: 12px;
  text-align: left;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--pt-text-muted);
  border-right: 1px solid var(--pt-border);
  display: table-cell;
  flex: 1;
}

.table-header:last-child {
  border-right: none;
}

.sort-button {
  background: transparent;
  border: none;
  color: var(--pt-text-muted);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0;
  transition: color 0.2s ease;
}

.sort-button:hover {
  color: var(--pt-text);
}

.sort-button.sorted {
  color: var(--pt-accent);
}

.sort-icon {
  font-size: 9px;
  display: inline-block;
}

.table-header-text {
  color: var(--pt-text-muted);
}

.data-table tbody {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.data-table tbody tr {
  display: table;
  width: 100%;
  table-layout: fixed;
}

.table-row {
  border-bottom: 1px solid var(--pt-border);
  cursor: pointer;
  transition: background 0.15s ease;
  display: table;
  width: 100%;
  table-layout: fixed;
}

.table-row:hover {
  background: rgba(74, 144, 226, 0.08);
}

.table-row.row-selected {
  background: rgba(74, 144, 226, 0.15);
}

.table-cell {
  padding: 12px;
  border-right: 1px solid var(--pt-border);
  color: var(--pt-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: table-cell;
  flex: 1;
}

.table-cell:last-child {
  border-right: none;
}

/* Grouping Panel */
.grouping-panel {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: rgba(74, 144, 226, 0.05);
  border-bottom: 1px solid var(--pt-border);
  flex-wrap: wrap;
  margin: 0;
  flex-shrink: 0;
}

.grouping-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--pt-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  flex-shrink: 0;
}

.grouping-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
}

.group-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgba(74, 144, 226, 0.2);
  border: 1px solid var(--pt-accent);
  border-radius: 20px;
  color: var(--pt-text);
  font-size: 12px;
  font-weight: 500;
}

.remove-group-btn {
  background: transparent;
  border: none;
  color: var(--pt-text-muted);
  cursor: pointer;
  font-size: 12px;
  padding: 0;
  transition: color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
}

.remove-group-btn:hover {
  color: var(--pt-accent);
}

.grouping-drop-zone {
  flex: 1;
  min-width: 200px;
  padding: 12px 16px;
  background: var(--pt-surface);
  border: 2px dashed var(--pt-border);
  border-radius: 8px;
  text-align: center;
  transition: all 0.2s ease;
}

.grouping-drop-zone.drag-over {
  border-color: var(--pt-accent);
  background: rgba(74, 144, 226, 0.1);
}

.drop-hint {
  font-size: 12px;
  color: var(--pt-text-muted);
}

/* Draggable Headers */
.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-content.draggable {
  cursor: grab;
  user-select: none;
}

.header-content.draggable:active {
  cursor: grabbing;
}

/* Grouped Rows */
.table-row.group-row {
  background: rgba(74, 144, 226, 0.03);
  font-weight: 500;
  border-bottom: none;
}

.table-row.group-row:hover {
  background: rgba(74, 144, 226, 0.08);
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.expand-btn {
  background: transparent;
  border: none;
  color: var(--pt-text-muted);
  cursor: pointer;
  padding: 0;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  transition: color 0.2s ease;
}

.expand-btn:hover {
  color: var(--pt-text);
}

.group-value {
  font-weight: 600;
  color: var(--pt-accent);
}

.header-left {
  flex: 1;
  min-width: 300px;
}

.header-right {
  display: flex;
  gap: 12px;
}

.btn-toggle-filters {
  padding: 8px 12px;
  background: transparent;
  border: 1px solid var(--pt-border);
  color: var(--pt-text-muted);
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-toggle-filters:hover {
  border-color: var(--pt-accent);
  color: var(--pt-text);
}

.table-filter-bar {
  padding: 12px 24px;
  background: rgba(74, 144, 226, 0.03);
  border-bottom: 1px solid var(--pt-border);
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 10px;
  animation: slideDown 0.2s ease;
}

.filter-group-compact {
  display: flex;
  align-items: center;
  gap: 6px;
}

.filter-label-compact {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--pt-text-muted);
  letter-spacing: 0.5px;
}

.checkbox-compact {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  font-size: 10px;
  color: var(--pt-text);
  font-weight: 500;
  white-space: nowrap;
}

.checkbox-compact input {
  cursor: pointer;
  accent-color: var(--pt-accent);
  width: 13px;
  height: 13px;
}

.checkbox-compact:hover {
  opacity: 0.75;
}

.number-input-compact {
  width: 50px;
  padding: 4px 6px;
  background: var(--pt-bg);
  border: 1px solid var(--pt-border);
  color: var(--pt-text);
  border-radius: 3px;
  font-family: var(--font-body);
  font-size: 11px;
}

.number-input-compact:focus {
  outline: none;
  border-color: var(--pt-accent);
}

.filter-separator {
  color: var(--pt-text-muted);
  font-size: 11px;
  margin: 0 2px;
}

.filter-select-compact {
  padding: 4px 6px;
  background: var(--pt-bg);
  border: 1px solid var(--pt-border);
  color: var(--pt-text);
  border-radius: 3px;
  font-family: var(--font-body);
  font-size: 11px;
  cursor: pointer;
}

.filter-select-compact:focus {
  outline: none;
  border-color: var(--pt-accent);
}

.btn-reset-filters-compact {
  padding: 4px 10px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #ef4444;
  color: #ef4444;
  border-radius: 3px;
  cursor: pointer;
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 600;
  transition: all 0.2s ease;
}

.btn-reset-filters-compact:hover {
  background: rgba(239, 68, 68, 0.2);
}
</style>

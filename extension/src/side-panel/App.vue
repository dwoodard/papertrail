<template>
    <div class="workspace">
        <header class="workspace__header">
            <span class="workspace__logo">📎 Papertrail</span>
            <span class="workspace__module" :class="{ 'workspace__module--live': isModuleActive }">
                {{ moduleLabel }}
            </span>
        </header>

        <section class="project">
            <template v-if="activeProject">
                <div class="project__name">{{ activeProject.name }}</div>
                <div v-if="activeProject.goal" class="project__goal">Goal: {{ activeProject.goal }}</div>
            </template>
            <div v-else class="project__none">
                No active project. Open the Papertrail popup to create or select one.
            </div>
        </section>

        <main class="workspace__body">
            <div class="page-context">
                <span class="page-context__label">Current page</span>
                <span class="page-context__url">{{ currentUrl || '—' }}</span>
            </div>

            <div class="observations">
                <h2 class="observations__title">Captured observations</h2>
                <p class="observations__empty">Collection wiring comes online next…</p>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

import { useActiveModule } from '@/composables/useActiveModule'
import { useProject } from '@/composables/useProject'

const { activeProject } = useProject()
const { context } = useActiveModule()

const moduleLabel = computed(() => context.value?.label ?? 'No module active')
const isModuleActive = computed(() => !!context.value && context.value.moduleId !== 'unknown')
const currentUrl = computed(() => context.value?.url ?? null)
</script>

<style scoped>
.workspace {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.workspace__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 14px;
    border-bottom: 1px solid var(--pt-border);
}

.workspace__logo {
    font-weight: 600;
}

.workspace__module {
    font-size: 12px;
    color: var(--pt-muted);
    border: 1px solid var(--pt-border);
    border-radius: 999px;
    padding: 2px 8px;
}

.workspace__module--live {
    color: var(--pt-accent);
    border-color: var(--pt-accent);
}

.project {
    padding: 12px 14px;
    border-bottom: 1px solid var(--pt-border);
}

.project__name {
    font-weight: 600;
    font-size: 15px;
}

.project__goal {
    font-size: 12px;
    color: var(--pt-muted);
    margin-top: 2px;
}

.project__none {
    font-size: 13px;
    color: var(--pt-muted);
}

.workspace__body {
    flex: 1;
    padding: 14px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.page-context {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.page-context__label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--pt-muted);
}

.page-context__url {
    font-size: 12px;
    word-break: break-all;
    color: var(--pt-text);
}

.observations__title {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--pt-muted);
    margin: 0 0 8px;
}

.observations__empty {
    font-size: 13px;
    color: var(--pt-muted);
    margin: 0;
}
</style>

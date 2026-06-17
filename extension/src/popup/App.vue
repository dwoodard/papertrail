<template>
    <div class="popup">
        <header class="popup__header">
            <span class="popup__logo">📎 Papertrail</span>
            <button class="popup__workspace" type="button" @click="openWorkspace">Open workspace ↗</button>
        </header>

        <main class="popup__body">
            <section class="projects">
                <h2 class="projects__title">Projects</h2>
                <p v-if="projects.length === 0" class="projects__empty">
                    No projects yet. Create one to start collecting.
                </p>
                <ul v-else class="projects__list">
                    <li
                        v-for="project in projects"
                        :key="project.id"
                        class="project"
                        :class="{ 'project--active': project.id === activeProjectId }"
                        @click="selectProject(project.id)"
                    >
                        <div class="project__main">
                            <span class="project__name">{{ project.name }}</span>
                            <span v-if="project.goal" class="project__goal">{{ project.goal }}</span>
                        </div>
                        <span v-if="project.id === activeProjectId" class="project__badge">active</span>
                    </li>
                </ul>
            </section>

            <form class="new-project" @submit.prevent="submit">
                <input
                    v-model="form.name"
                    class="new-project__input"
                    type="text"
                    placeholder="Project name"
                    required
                />
                <input
                    v-model="form.goal"
                    class="new-project__input"
                    type="text"
                    placeholder="Goal (optional)"
                />
                <input
                    v-model="form.startingTarget"
                    class="new-project__input"
                    type="text"
                    placeholder="Starting target (optional)"
                />
                <button class="new-project__submit" type="submit" :disabled="!form.name.trim()">
                    Create project
                </button>
            </form>
        </main>
    </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'

import { useProject } from '@/composables/useProject'

const { projects, activeProjectId, createProject, selectProject } = useProject()

const form = reactive({
    name: '',
    goal: '',
    startingTarget: '',
})

function submit(): void {
    if (!form.name.trim()) {
        return
    }
    createProject({ name: form.name, goal: form.goal, startingTarget: form.startingTarget })
    form.name = ''
    form.goal = ''
    form.startingTarget = ''
}

async function openWorkspace(): Promise<void> {
    const window = await chrome.windows.getCurrent()
    if (window.id != null) {
        await chrome.sidePanel.open({ windowId: window.id })
    }
}
</script>

<style scoped>
.popup {
    display: flex;
    flex-direction: column;
    width: 360px;
    padding: 12px 14px 16px;
}

.popup__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--pt-border);
}

.popup__logo {
    font-weight: 600;
}

.popup__workspace {
    background: transparent;
    border: 1px solid var(--pt-border);
    color: var(--pt-text);
    border-radius: 6px;
    padding: 4px 8px;
    font-size: 12px;
    cursor: pointer;
}

.popup__workspace:hover {
    border-color: var(--pt-accent);
}

.popup__body {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding-top: 12px;
}

.projects__title {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--pt-muted);
    margin: 0 0 8px;
}

.projects__empty {
    color: var(--pt-muted);
    font-size: 13px;
    margin: 0;
}

.projects__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.project {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 8px 10px;
    border: 1px solid var(--pt-border);
    border-radius: 8px;
    background: var(--pt-surface);
    cursor: pointer;
}

.project:hover {
    border-color: var(--pt-accent);
}

.project--active {
    border-color: var(--pt-accent);
}

.project__main {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
}

.project__name {
    font-weight: 500;
    font-size: 14px;
}

.project__goal {
    font-size: 12px;
    color: var(--pt-muted);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.project__badge {
    font-size: 11px;
    color: var(--pt-accent);
    flex-shrink: 0;
}

.new-project {
    display: flex;
    flex-direction: column;
    gap: 8px;
    border-top: 1px solid var(--pt-border);
    padding-top: 12px;
}

.new-project__input {
    background: var(--pt-surface);
    border: 1px solid var(--pt-border);
    border-radius: 6px;
    padding: 8px 10px;
    color: var(--pt-text);
    font-size: 13px;
}

.new-project__input:focus {
    outline: none;
    border-color: var(--pt-accent);
}

.new-project__submit {
    background: var(--pt-accent);
    color: #fff;
    border: none;
    border-radius: 6px;
    padding: 9px 10px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
}

.new-project__submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
</style>

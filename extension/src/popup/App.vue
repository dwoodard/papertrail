<template>
    <div class="popup">
        <header class="popup__header">
            <h1 class="popup__logo">Papertrail</h1>
            <div class="popup__actions">
                <button class="popup__action-btn" type="button" @click="openMain">Main</button>
                <button class="popup__action-btn" type="button" @click="openWorkspace">Workspace</button>
            </div>
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
                    id="project-name"
                    v-model="form.name"
                    class="new-project__input"
                    type="text"
                    placeholder="Project name"
                    name="project-name"
                    required
                />
                <input
                    id="project-goal"
                    v-model="form.goal"
                    class="new-project__input"
                    type="text"
                    placeholder="Goal (optional)"
                    name="project-goal"
                />
                <input
                    id="project-target"
                    v-model="form.startingTarget"
                    class="new-project__input"
                    type="text"
                    placeholder="Starting target (optional)"
                    name="project-target"
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

async function openMain(): Promise<void> {
    if (!chrome?.runtime) return
    const mainUrl = chrome.runtime.getURL('src/pages/main.html')
    const window = await chrome.windows.getCurrent()
    if (window.id != null) {
        chrome.tabs.create({ url: mainUrl })
    }
}

async function openWorkspace(): Promise<void> {
    if (!chrome?.windows) return
    const currentWindow = await chrome.windows.getCurrent()
    if (currentWindow.id != null) {
        await chrome.sidePanel.open({ windowId: currentWindow.id })
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
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.5px;
    color: var(--pt-text);
    margin: 0;
}

.popup__actions {
    display: flex;
    gap: 8px;
}

.popup__action-btn {
    background: transparent;
    border: 1px solid var(--pt-border);
    color: var(--pt-text);
    border-radius: 6px;
    padding: 6px 12px;
    font-size: 12px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.popup__action-btn:hover {
    border-color: var(--pt-accent);
    color: var(--pt-accent);
    background: rgba(74, 144, 226, 0.05);
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

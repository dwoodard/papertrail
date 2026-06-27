<template>
  <div class="channel-detail">
    <!-- Back Navigation -->
    <div class="breadcrumb">
      <button class="back-btn" @click="navigation.goToDashboard">← Dashboard</button>
    </div>

    <!-- Channel Header -->
    <div class="channel-header">
      <div class="component-label">YouTube / Channel Detail</div>
      <div class="channel-info">
        <div class="channel-name">{{ channelHandle }}</div>
        <div class="videos-label">Videos</div>
      </div>
    </div>

    <!-- Videos Section -->
    <div class="section">
      <div class="section-header">
        <span class="section-title">📺 Videos</span>
      </div>
      <div class="videos-list">
        <div class="empty-state">Videos from this channel will appear here when captured</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue'

interface Navigation {
  goToDashboard: () => void
  goToChannel: (channelHandle: string) => void
  goToVideo: (videoId: string) => void
}

const navigation = inject<Navigation>('youtube-navigation')!

defineProps<{
  channelHandle: string
}>()
</script>

<style scoped>
@import '../design-system.css';

.channel-detail {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  padding-right: var(--space-xs);
}

.breadcrumb {
  display: flex;
  gap: var(--space-sm);
}

.back-btn {
  padding: var(--space-xs) var(--space-md);
  background: var(--color-bg-secondary);
  color: var(--color-link);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.back-btn:hover {
  background: var(--color-border);
}

.channel-header {
  padding: var(--space-md);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--yt-red);
}

.component-label {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: var(--space-sm);
}

.channel-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.channel-name {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
}

.videos-label {
  font-size: var(--font-size-sm);
  color: var(--color-text-tertiary);
}

.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2px;
}

.section-title {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-base);
  color: var(--color-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.videos-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.empty-state {
  padding: var(--space-lg) var(--space-md);
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: var(--font-size-base);
  background: var(--color-bg-secondary);
  border-radius: var(--radius-sm);
}
</style>

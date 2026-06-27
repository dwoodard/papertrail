<template>
  <div class="video-detail">
    <!-- Back Navigation -->
    <div class="breadcrumb">
      <button class="back-btn" @click="navigation.goToChannel(channelHandle)">← Back</button>
    </div>

    <!-- Video Header -->
    <div class="video-header">
      <div class="component-label">YouTube / Video Detail</div>
      <div class="video-info">
        <div class="video-id">{{ videoId }}</div>
        <div class="video-label">Leads</div>
      </div>
    </div>

    <!-- Leads Section -->
    <div class="section">
      <div class="section-header">
        <span class="section-title">👤 Leads</span>
      </div>
      <div class="leads-list">
        <div class="empty-state">Leads from this video will appear here when captured</div>
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
  videoId: string
}>()
</script>

<style scoped>
@import '../design-system.css';

.video-detail {
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

.video-header {
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

.video-info {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.video-id {
  font-weight: var(--font-weight-semibold);
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  word-break: break-all;
}

.video-label {
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

.leads-list {
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

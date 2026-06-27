<template>
  <div class="dashboard">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="component-label">YouTube / Dashboard</div>
      <div class="header-stat">
        <div class="stat-value">{{ channels.length }}</div>
        <div class="stat-label">Channels</div>
      </div>
      <div class="header-stat">
        <div class="stat-value">{{ totalLeads }}</div>
        <div class="stat-label">Leads</div>
      </div>
      <div class="header-stat">
        <div class="stat-value">{{ highTierLeads }}</div>
        <div class="stat-label">High Tier</div>
      </div>
    </div>

    <!-- Channels List -->
    <div v-if="channels.length > 0" class="channels-section">
      <div class="section-title">Your Channels</div>
      <div class="channels-list">
        <div v-for="channel in channels" :key="channel.handle" class="channel-row">
          <a :href="`https://www.youtube.com/${channel.handle}`" class="channel-col">
            <div class="channel-name">{{ channel.handle }}</div>
            <div class="channel-meta">{{ channel.subs }} subs</div>
          </a>

          <div class="leads-col">
            <div class="lead-count">{{ channel.totalLeads }}</div>
            <div class="lead-label">leads</div>
          </div>

          <div class="tier-col">
            <div class="tier-badges">
              <span v-if="channel.highTier > 0" class="tier-badge high">
                {{ channel.highTier }} ⭐
              </span>
              <span v-if="channel.mediumTier > 0" class="tier-badge medium">
                {{ channel.mediumTier }} ◆
              </span>
            </div>
          </div>

          <div class="action-col">
            <button class="action-btn delete" title="Delete channel">
              ✕
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-icon">🎬</div>
      <div class="empty-title">No channels yet</div>
      <div class="empty-description">
        Go to a YouTube channel or video to start capturing leads
      </div>
    </div>

    <!-- Quick Tips -->
    <div v-if="channels.length === 0" class="tips-box">
      <div class="tips-title">💡 Getting Started</div>
      <ul class="tips-list">
        <li>1. Visit a YouTube channel to start tracking</li>
        <li>2. Capture videos to find commenters</li>
        <li>3. View leads ranked by tier</li>
        <li>4. Export for outreach campaigns</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getChannels, getChannelData } from '../storage'

interface ChannelDisplay {
  handle: string
  subs: number
  totalLeads: number
  highTier: number
  mediumTier: number
}

const channels = ref<ChannelDisplay[]>([])
const totalLeads = ref(0)
const highTierLeads = ref(0)

onMounted(() => {
  loadChannels()
})

function loadChannels() {
  try {
    const channelHandles = getChannels()
    console.log('[YouTube] Loading channels:', channelHandles)

    const channelData: ChannelDisplay[] = []
    let totalLeadsCount = 0
    let highTierCount = 0

    for (const handle of channelHandles) {
      const data = getChannelData(handle)
      if (data) {
        const highTier = data.uniqueCommenters.filter((c) => c.tier === 'high').length
        const mediumTier = data.uniqueCommenters.filter((c) => c.tier === 'medium').length

        channelData.push({
          handle: data.channel.handle,
          subs: data.channel.subs,
          totalLeads: data.uniqueCommenters.length,
          highTier,
          mediumTier,
        })

        totalLeadsCount += data.uniqueCommenters.length
        highTierCount += highTier
      }
    }

    channels.value = channelData
    totalLeads.value = totalLeadsCount
    highTierLeads.value = highTierCount

    console.log('[YouTube] Loaded', channels.value.length, 'channels')
  } catch (error) {
    console.error('[YouTube] Error loading channels:', error)
  }
}
</script>

<style scoped>
@import '../design-system.css';

.dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

/* Header Stats */
.dashboard-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  grid-template-rows: auto auto;
}

.dashboard-header .component-label {
  grid-column: 1 / -1;
  font-size: 10px;
  font-weight: 600;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.header-stat {
  padding: 12px;
  background: linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%);
  border-radius: 6px;
  text-align: center;
}

.stat-value {
  font-weight: 700;
  font-size: 20px;
  color: #202124;
}

.stat-label {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
  text-transform: uppercase;
}

/* Channels Section */
.channels-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-weight: 600;
  font-size: 12px;
  color: #202124;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 2px;
}

.channels-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.channel-row {
  display: grid;
  grid-template-columns: 1fr 60px 80px 70px;
  gap: 8px;
  align-items: center;
  padding: 10px;
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 4px;
  font-size: 12px;
}

.channel-col {
  min-width: 0;
}

.channel-name {
  font-weight: 500;
  color: #202124;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.channel-meta {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}

.leads-col {
  text-align: center;
  padding: 0 4px;
}

.lead-count {
  font-weight: 600;
  color: #202124;
}

.lead-label {
  font-size: 10px;
  color: #999;
}

.tier-col {
  display: flex;
  justify-content: center;
}

.tier-badges {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.tier-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 4px;
  border-radius: 2px;
  white-space: nowrap;
}

.tier-badge.high {
  background: #d4edda;
  color: #155724;
}

.tier-badge.medium {
  background: #fff3cd;
  color: #856404;
}

.action-col {
  display: flex;
  gap: 4px;
  justify-content: flex-end;
}

.action-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 3px;
  cursor: pointer;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.action-btn:hover {
  background: #f5f5f5;
  border-color: #999;
}

.action-btn.delete:hover {
  background: #ffebee;
  border-color: #f44336;
  color: #f44336;
}

/* Empty State */
.empty-state {
  padding: 32px 16px;
  text-align: center;
  background: #f9f9f9;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.empty-icon {
  font-size: 32px;
}

.empty-title {
  font-weight: 600;
  font-size: 14px;
  color: #202124;
}

.empty-description {
  font-size: 12px;
  color: #999;
  max-width: 200px;
}

/* Tips Box */
.tips-box {
  padding: 12px;
  background: #f0f7ff;
  border-left: 3px solid #1a73e8;
  border-radius: 3px;
}

.tips-title {
  font-weight: 600;
  font-size: 12px;
  color: #1a73e8;
  margin-bottom: 8px;
}

.tips-list {
  margin: 0;
  padding-left: 16px;
  font-size: 11px;
  color: #1a73e8;
  line-height: 1.6;
}

.tips-list li {
  margin-bottom: 4px;
}
</style>

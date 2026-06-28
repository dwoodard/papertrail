export interface Commenter {
  name: string
  handle?: string
  url: string
  count: number
  isVerified?: boolean
  hasChannel?: boolean
  channelSubs?: number
  status: 'new' | 'contacted' | 'interested' | 'collaborated' | 'not_a_fit'
  tier: 'high' | 'medium' | 'low'
  contactedDate?: string
  notes?: string
}

export interface Link {
  url: string
  count: number
}

export interface Video {
  id: string
  title: string
  url: string
  savedAt: string
}

export interface Channel {
  handle: string
  subs: number
  links: Record<string, string>
}

export interface ChannelData {
  channel: Channel
  allLinks: Link[]
  uniqueCommenters: Commenter[]
  videos: Video[]
}

const CHANNELS_KEY = 'youtube:channels'

function channelDataKey(handle: string): string {
  return `youtube:channel:${handle}`
}

export function getChannels(): string[] {
  const stored = localStorage.getItem(CHANNELS_KEY)
  return stored ? JSON.parse(stored) : []
}

export function getChannelData(handle: string): ChannelData | null {
  const stored = localStorage.getItem(channelDataKey(handle))
  return stored ? JSON.parse(stored) : null
}

export function saveChannelData(data: ChannelData): void {
  const handle = data.channel.handle
  const channels = getChannels()

  if (!channels.includes(handle)) {
    channels.push(handle)
    localStorage.setItem(CHANNELS_KEY, JSON.stringify(channels))
  }

  localStorage.setItem(channelDataKey(handle), JSON.stringify(data))
}

export function calculateTier(commenter: Omit<Commenter, 'tier'>): 'high' | 'medium' | 'low' {
  let score = 0

  if (commenter.isVerified) score += 3
  if (commenter.hasChannel) score += 2
  if (commenter.count >= 3) score += 2
  if (commenter.channelSubs && commenter.channelSubs > 10000) score += 1

  if (score >= 6) return 'high'
  if (score >= 3) return 'medium'
  return 'low'
}

export function dedupeCommenters(commenters: Omit<Commenter, 'tier'>[]): Commenter[] {
  const seen = new Map<string, Commenter>()

  for (const commenter of commenters) {
    const key = `${commenter.name}__${commenter.count}`

    if (seen.has(key)) {
      const existing = seen.get(key)!
      existing.count += commenter.count
      existing.isVerified = existing.isVerified || commenter.isVerified
      existing.hasChannel = existing.hasChannel || commenter.hasChannel
      existing.channelSubs = Math.max(existing.channelSubs || 0, commenter.channelSubs || 0)
    } else {
      const tier = calculateTier(commenter)
      seen.set(key, { ...commenter, status: 'new', tier })
    }
  }

  return Array.from(seen.values())
}

export function mergeVideo(
  handle: string,
  videoLinks: string[],
  commenters: Omit<Commenter, 'tier'>[],
  channelInfo: { subs: number; links: Record<string, string> },
  videoInfo?: { id: string; title: string; url: string },
): ChannelData {
  const existing = getChannelData(handle)

  // Merge links
  const allLinksMap = new Map<string, number>()
  if (existing) {
    for (const link of existing.allLinks) {
      allLinksMap.set(link.url, link.count)
    }
  }
  for (const link of videoLinks) {
    allLinksMap.set(link, (allLinksMap.get(link) || 0) + 1)
  }

  // Merge commenters
  const existingCommenters = existing?.uniqueCommenters || []
  const allCommenters = [...existingCommenters, ...commenters]

  // Dedupe and retier
  const dedupedCommenters = dedupeCommenters(
    allCommenters.map((c) => {
      const { tier, ...rest } = c
      return rest
    }),
  )

  // Merge videos
  const existingVideos = existing?.videos || []
  const videos = [...existingVideos]
  if (videoInfo) {
    // Add video if not already saved
    const videoExists = videos.some((v) => v.id === videoInfo.id)
    if (!videoExists) {
      videos.push({
        id: videoInfo.id,
        title: videoInfo.title,
        url: videoInfo.url,
        savedAt: new Date().toISOString(),
      })
    }
  }

  const channelData: ChannelData = {
    channel: {
      handle,
      subs: channelInfo.subs,
      links: channelInfo.links,
    },
    allLinks: Array.from(allLinksMap.entries()).map(([url, count]) => ({ url, count })),
    uniqueCommenters: dedupedCommenters,
    videos,
  }

  saveChannelData(channelData)
  return channelData
}

export function updateLeadStatus(
  handle: string,
  commenterName: string,
  status: Commenter['status'],
  notes?: string,
): void {
  const data = getChannelData(handle)
  if (!data) return

  const commenter = data.uniqueCommenters.find((c) => c.name === commenterName)
  if (!commenter) return

  commenter.status = status
  if (notes !== undefined) {
    commenter.notes = notes
  }
  if (status !== 'new' && !commenter.contactedDate) {
    commenter.contactedDate = new Date().toISOString()
  }

  saveChannelData(data)
}

export function deleteChannel(handle: string): void {
  const channels = getChannels()
  const filtered = channels.filter((h) => h !== handle)
  localStorage.setItem(CHANNELS_KEY, JSON.stringify(filtered))
  localStorage.removeItem(channelDataKey(handle))
}

export function exportLeads(handle: string, minTier: 'high' | 'medium'): string {
  const data = getChannelData(handle)
  if (!data) return ''

  const tierOrder: Record<string, number> = { high: 0, medium: 1, low: 2 }
  const filtered = data.uniqueCommenters.filter((c) => tierOrder[c.tier] <= tierOrder[minTier])

  const headers = ['Name', 'Handle', 'Channel URL', 'Tier', 'Status', 'Notes']
  const rows = filtered.map((c) => [c.name, c.handle || '', c.url, c.tier, c.status, c.notes || ''])

  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')

  return csv
}

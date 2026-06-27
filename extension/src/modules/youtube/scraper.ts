import type { Observation } from '@contracts'

export interface ChannelMetadata {
  channelName?: string
  channelHandle?: string
  subscriberCount?: string
  videoCount?: string
  description?: string
}

export interface VideoMetadata {
  videoTitle?: string
  description?: string
  viewCount?: string
  uploadDate?: string
  channelName?: string
  channelUrl?: string
}

export function extractChannelMetadata(): ChannelMetadata {
  const metadata: ChannelMetadata = {}

  let nameEl = document.querySelector('yt-page-header-view-model h1')
  if (!nameEl) {
    nameEl = document.querySelector('ytd-channel-name #text')
  }
  if (nameEl?.textContent) {
    metadata.channelName = nameEl.textContent.trim()
  }

  const allSpans = document.querySelectorAll('span')
  for (const span of allSpans) {
    const text = span.textContent?.trim()
    if (text?.toLowerCase().includes('subscriber')) {
      const match = text.match(/([\d.]+[KMB]?)\s+subscriber/)
      if (match) {
        metadata.subscriberCount = match[1]
        break
      }
    }
  }

  for (const span of allSpans) {
    const text = span.textContent?.trim()
    if (text?.toLowerCase().includes('video') && !text.toLowerCase().includes('subscriber')) {
      const match = text.match(/([\d.]+[KMB]?)\s+video/)
      if (match) {
        metadata.videoCount = match[1]
        break
      }
    }
  }

  for (const span of allSpans) {
    const text = span.textContent?.trim()
    if (text?.startsWith('@') && text.length < 50) {
      metadata.channelHandle = text
      break
    }
  }

  let descEl = document.querySelector('yt-description-preview-view-model')
  if (!descEl) {
    descEl = document.querySelector('yt-attributed-string#description')
  }
  if (descEl?.textContent) {
    metadata.description = descEl.textContent.trim().slice(0, 200)
  }

  return metadata
}

export function extractVideoMetadata(): VideoMetadata {
  const metadata: VideoMetadata = {}

  let titleEl = document.querySelector('h1.ytd-watch-metadata yt-formatted-string')
  if (!titleEl) {
    titleEl = document.querySelector('ytd-watch-metadata h1 yt-formatted-string')
  }
  if (titleEl?.textContent) {
    metadata.videoTitle = titleEl.textContent.trim()
  }

  const allSpans = document.querySelectorAll('span')
  for (const span of allSpans) {
    const text = span.textContent?.trim()
    if (text?.toLowerCase().includes('view') && text.match(/[\d.]+[KMB]?/)) {
      const match = text.match(/([\d.]+[KMB]?)\s+view/)
      if (match) {
        metadata.viewCount = match[1]
        break
      }
    }
  }

  for (const span of allSpans) {
    const text = span.textContent?.trim()
    if (text && /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{1,2})/.test(text)) {
      metadata.uploadDate = text
      break
    }
  }

  let descEl = document.querySelector('#description-inner span.yt-core-attributed-string')
  if (!descEl) {
    descEl = document.querySelector('#description-inner')
  }
  if (descEl?.textContent) {
    metadata.description = descEl.textContent.trim().slice(0, 200)
  }

  const channelEl = document.querySelector('ytd-video-owner-renderer #channel-name a') as HTMLAnchorElement | null
  if (channelEl?.textContent) {
    metadata.channelName = channelEl.textContent.trim()
  }
  if (channelEl?.href) {
    metadata.channelUrl = channelEl.href
  }

  return metadata
}

export function createChannelObservation(metadata: ChannelMetadata): Observation | null {
  if (!metadata.channelName) {
    return null
  }

  return {
    id: crypto.randomUUID(),
    projectId: null,
    moduleId: 'youtube',
    kind: 'social_profile',
    data: {
      ...metadata,
      profileType: 'channel',
    },
    source: {
      type: 'live_page',
      url: window.location.href,
      capturedAt: new Date().toISOString(),
    },
    status: 'confirmed',
    dedupeKey: `youtube-channel-${metadata.channelHandle || metadata.channelName}`,
  }
}

export function createVideoObservation(metadata: VideoMetadata): Observation | null {
  if (!metadata.videoTitle) {
    return null
  }

  return {
    id: crypto.randomUUID(),
    projectId: null,
    moduleId: 'youtube',
    kind: 'page',
    data: {
      ...metadata,
      contentType: 'video',
    },
    source: {
      type: 'live_page',
      url: window.location.href,
      capturedAt: new Date().toISOString(),
    },
    status: 'confirmed',
    dedupeKey: `youtube-video-${metadata.videoTitle}`,
  }
}

export function isChannelPage(): boolean {
  const pathname = window.location.pathname
  return /^\/@[\w-]+|^\/channel\/[\w-]+/.test(pathname)
}

export function isVideoPage(): boolean {
  return window.location.pathname === '/watch'
}

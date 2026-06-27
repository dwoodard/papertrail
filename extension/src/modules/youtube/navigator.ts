export type PageType = 'home' | 'video' | 'channel' | 'unknown'

export interface PageContext {
  type: PageType
  channelHandle?: string
  videoId?: string
}

export function detectPageType(): PageContext {
  const { pathname, hostname } = window.location

  // Must be youtube.com
  if (!hostname.includes('youtube.com')) {
    return { type: 'unknown' }
  }

  // Home page: www.youtube.com or www.youtube.com/
  if (pathname === '/' || pathname === '') {
    return { type: 'home' }
  }

  // Video page: /watch?v=xxx
  if (pathname === '/watch') {
    const videoId = new URLSearchParams(window.location.search).get('v')
    return { type: 'video', videoId: videoId || undefined }
  }

  // Channel page: /@handle or /channel/id or /c/handle
  if (pathname.startsWith('/@')) {
    const handle = pathname.slice(0, pathname.indexOf('/', 1)) || pathname.slice(1)
    return { type: 'channel', channelHandle: handle }
  }

  if (pathname.startsWith('/channel/')) {
    const handle = pathname.split('/')[2]
    return { type: 'channel', channelHandle: handle }
  }

  if (pathname.startsWith('/c/')) {
    const handle = pathname.split('/')[2]
    return { type: 'channel', channelHandle: handle }
  }

  // Shorts, playlists, posts are part of channel context
  const channelMatch = pathname.match(/^\/([@c][\w-]+)/)
  if (channelMatch) {
    return { type: 'channel', channelHandle: channelMatch[1] }
  }

  return { type: 'unknown' }
}

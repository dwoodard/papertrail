import type { Observation } from '@contracts'

export interface ChannelMetadata {
  channelName?: string
  channelHandle?: string
  subscriberCount?: string
  videoCount?: string
  description?: string
  avatarUrl?: string
  location?: string
  joinedDate?: string
  externalLinks?: Array<{ title?: string; url?: string }>
}

export interface VideoMetadata {
  videoTitle?: string
  description?: string
  viewCount?: string
  likeCount?: string
  uploadDate?: string
  channelName?: string
  channelUrl?: string
  hashtags?: string[]
}

/**
 * Extract ytInitialData from page source - more reliable than DOM for YouTube
 */
function getYtInitialData(): any {
  try {
    // YouTube embeds ytInitialData in the page source
    if ((window as any).ytInitialData) {
      return (window as any).ytInitialData
    }

    // Fallback: parse from script tag
    const scripts = document.querySelectorAll('script')
    for (const script of scripts) {
      if (script.textContent?.includes('var ytInitialData = ')) {
        const match = script.textContent.match(/var ytInitialData = ({.*?});/)
        if (match?.[1]) {
          return JSON.parse(match[1])
        }
      }
    }
  } catch (e) {
    console.warn('[Papertrail] Failed to extract ytInitialData:', e)
  }
  return null
}

/**
 * Extract channel "About" details including links, location, and joined date
 */
export async function extractChannelAboutDetails(): Promise<Partial<ChannelMetadata>> {
  const aboutData: Partial<ChannelMetadata> = {}

  try {
    console.log('[Papertrail] Attempting to extract About details...')

    // Try to find and click the "more" button to expand description if needed
    const expandButtons = Array.from(document.querySelectorAll('button')).filter(
      (btn) =>
        btn.getAttribute('aria-label')?.toLowerCase().includes('more') ||
        btn.textContent?.toLowerCase().includes('more'),
    )

    console.log('[Papertrail] Found', expandButtons.length, 'expand buttons')

    for (const btn of expandButtons) {
      console.log('[Papertrail] Clicking expand button:', btn.textContent)
      ;(btn as HTMLButtonElement).click()
      await new Promise((r) => setTimeout(r, 400))
    }

    // Find the About dialog/section - try multiple selectors
    let aboutDialog =
      document.querySelector('ytd-about-channel-renderer') ||
      document.querySelector('[class*="about"]') ||
      document.querySelector('ytd-structured-description-content-renderer')

    console.log('[Papertrail] About dialog found:', !!aboutDialog)

    if (aboutDialog) {
      // Extract external links with flexible selectors
      const linkViewModels = Array.from(
        aboutDialog.querySelectorAll('yt-channel-external-link-view-model, [class*="external-link"]'),
      )
      console.log('[Papertrail] Found', linkViewModels.length, 'external links')

      if (linkViewModels.length > 0) {
        aboutData.externalLinks = linkViewModels
          .map((vm) => {
            const titleEl = vm.querySelector('[class*="title"], span')
            const urlEl = vm.querySelector('a')
            let url = urlEl?.getAttribute('href') || ''

            // Extract actual URL from YouTube redirect links
            if (url.includes('youtube.com/redirect')) {
              const match = url.match(/[?&]q=([^&]+)/)
              if (match) {
                url = decodeURIComponent(match[1])
              }
            }

            return {
              title: titleEl?.textContent?.trim(),
              url: url || undefined,
            }
          })
          .filter((link) => link.title || link.url)
      }

      // Extract metadata - try multiple container selectors
      const infoContainers = Array.from(
        aboutDialog.querySelectorAll('#additional-info-container, [class*="info-container"], table'),
      )

      console.log('[Papertrail] Found', infoContainers.length, 'info containers')

      for (const infoContainer of infoContainers) {
        const rows = Array.from(infoContainer.querySelectorAll('tr, [role="row"], .metadata-row'))
        console.log('[Papertrail] Processing', rows.length, 'rows')

        for (const row of rows) {
          const cells = row.querySelectorAll('td, [role="gridcell"], .cell')
          if (cells.length >= 1) {
            const cellText = cells[cells.length - 1].textContent?.trim() || ''

            console.log('[Papertrail] Metadata value:', cellText)

            // Parse metadata from the value text
            if (cellText.toLowerCase().includes('joined')) {
              const match = cellText.match(/joined\s+(.+)/i)
              if (match) {
                aboutData.joinedDate = match[1].trim()
              }
            } else if (cellText.toLowerCase().includes('united states') || /^[A-Z][a-z\s]+$/.test(cellText)) {
              // Likely a location
              if (!cellText.includes('subscribers') && !cellText.includes('videos') && !cellText.includes('views')) {
                aboutData.location = cellText
              }
            }
          }
        }
      }
    }

    console.log('[Papertrail] Extracted About data:', aboutData)
  } catch (e) {
    console.error('[Papertrail] Error extracting About details:', e)
  }

  return aboutData
}

/**
 * Extract channel metadata using DOM (primary) + ytInitialData fallback
 */
export function extractChannelMetadata(): ChannelMetadata {
  const metadata: ChannelMetadata = {}

  // Primary: Use DOM selectors (more reliable on channels)
  // Channel name - try multiple selectors
  let nameEl = document.querySelector('yt-page-header-view-model h1')
  if (!nameEl) {
    nameEl = document.querySelector('ytd-channel-name #text')
  }
  if (nameEl?.textContent) {
    metadata.channelName = nameEl.textContent.trim()
  }

  // Subscriber count - look for text containing "subscribers"
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

  // Video count - look for text containing "video"
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

  // Channel handle - look for @ format
  for (const span of allSpans) {
    const text = span.textContent?.trim()
    if (text?.startsWith('@') && text.length < 50) {
      metadata.channelHandle = text
      break
    }
  }

  // Description - try to find description element
  let descEl = document.querySelector('yt-description-preview-view-model')
  if (!descEl) {
    descEl = document.querySelector('yt-attributed-string#description')
  }
  if (descEl?.textContent) {
    metadata.description = descEl.textContent.trim().slice(0, 200) // Limit to 200 chars
  }

  // Avatar from DOM
  const avatarEl = document.querySelector('yt-img-shadow#avatar img') as HTMLImageElement
  if (avatarEl?.src) {
    metadata.avatarUrl = avatarEl.src
  }

  // Fallback: Try ytInitialData if DOM didn't yield results
  if (!metadata.channelName) {
    const initialData = getYtInitialData()
    if (initialData) {
      try {
        // Try to find channel name in ytInitialData
        const header = initialData?.header?.pageHeaderRenderer || initialData?.metadata?.pageMetadataRenderer
        if (header?.title?.runs?.[0]?.text) {
          metadata.channelName = header.title.runs[0].text
        }
      } catch (e) {
        console.warn('[Papertrail] Error parsing ytInitialData fallback:', e)
      }
    }
  }

  console.log('[Papertrail] Extracted channel metadata:', metadata)
  return metadata
}

/**
 * Extract video metadata using DOM (primary) + ytInitialData fallback
 */
export function extractVideoMetadata(): VideoMetadata {
  const metadata: VideoMetadata = {}

  // Primary: Use DOM selectors
  // Video title
  let titleEl = document.querySelector('h1.ytd-watch-metadata yt-formatted-string')
  if (!titleEl) {
    titleEl = document.querySelector('ytd-watch-metadata h1 yt-formatted-string')
  }
  if (titleEl?.textContent) {
    metadata.videoTitle = titleEl.textContent.trim()
  }

  // View count - look for text with "view"
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

  // Upload date - look for date patterns
  for (const span of allSpans) {
    const text = span.textContent?.trim()
    if (text && /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{1,2})/.test(text)) {
      metadata.uploadDate = text
      break
    }
  }

  // Description
  let descEl = document.querySelector('#description-inner span.yt-core-attributed-string')
  if (!descEl) {
    descEl = document.querySelector('#description-inner')
  }
  if (descEl?.textContent) {
    metadata.description = descEl.textContent.trim().slice(0, 200)
  }

  // Channel name - look for channel name anchor
  const channelEl = document.querySelector('ytd-video-owner-renderer #channel-name a') as HTMLAnchorElement | null
  if (channelEl?.textContent) {
    metadata.channelName = channelEl.textContent.trim()
  }
  if (channelEl?.href) {
    metadata.channelUrl = channelEl.href
  }

  // Fallback: Try ytInitialData if DOM didn't yield results
  if (!metadata.videoTitle) {
    const initialData = getYtInitialData()
    if (initialData) {
      try {
        if (initialData?.videoDetails?.title) {
          metadata.videoTitle = initialData.videoDetails.title
        }
        if (initialData?.videoDetails?.shortDescription) {
          metadata.description = initialData.videoDetails.shortDescription.slice(0, 200)
        }
      } catch (e) {
        console.warn('[Papertrail] Error parsing ytInitialData fallback for video:', e)
      }
    }
  }

  console.log('[Papertrail] Extracted video metadata:', metadata)
  return metadata
}

/**
 * Converts channel metadata to an observation for emission
 */
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

/**
 * Converts video metadata to an observation for emission
 */
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

/**
 * Detects if current page is a YouTube channel
 */
export function isChannelPage(): boolean {
  const pathname = window.location.pathname
  return /^\/@[\w-]+|^\/channel\/[\w-]+/.test(pathname)
}

/**
 * Detects if current page is a YouTube video
 */
export function isVideoPage(): boolean {
  return window.location.pathname === '/watch'
}

/**
 * Detects if current page is YouTube search results
 */
export function isSearchPage(): boolean {
  return window.location.pathname === '/results'
}

/**
 * Detects if current page is YouTube shorts
 */
export function isShortsPage(): boolean {
  return /^\/shorts\//.test(window.location.pathname)
}

/**
 * Passive capture for YouTube channels
 */
export function startChannelPassiveCapture(emit: (observations: Observation[]) => void): void {
  console.log('[Papertrail] YouTube channel passive capture started')

  // Initial extraction (synchronous)
  const metadata = extractChannelMetadata()
  const observation = createChannelObservation(metadata)
  if (observation) {
    emit([observation])
  }

  // Extract About details asynchronously
  extractChannelAboutDetails().then((aboutData) => {
    const enrichedMetadata = { ...metadata, ...aboutData }
    const enrichedObservation = createChannelObservation(enrichedMetadata)
    if (enrichedObservation) {
      emit([enrichedObservation])
    }
  })

  // Watch for DOM changes
  const observer = new MutationObserver(() => {
    const updatedMetadata = extractChannelMetadata()
    const updatedObservation = createChannelObservation(updatedMetadata)
    if (updatedObservation) {
      emit([updatedObservation])
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: false,
  })

  ;(window as any).__youtubeChannelObserver = observer
}

export function stopChannelPassiveCapture(): void {
  console.log('[Papertrail] YouTube channel passive capture stopped')
  const observer = (window as any).__youtubeChannelObserver
  if (observer) {
    observer.disconnect()
    delete (window as any).__youtubeChannelObserver
  }
}

/**
 * Passive capture for YouTube videos
 */
export function startVideoPassiveCapture(emit: (observations: Observation[]) => void): void {
  console.log('[Papertrail] YouTube video passive capture started')

  // Initial extraction
  const metadata = extractVideoMetadata()
  const observation = createVideoObservation(metadata)
  if (observation) {
    emit([observation])
  }

  // Watch for DOM changes
  const observer = new MutationObserver(() => {
    const updatedMetadata = extractVideoMetadata()
    const updatedObservation = createVideoObservation(updatedMetadata)
    if (updatedObservation) {
      emit([updatedObservation])
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: false,
  })

  ;(window as any).__youtubeVideoObserver = observer
}

export function stopVideoPassiveCapture(): void {
  console.log('[Papertrail] YouTube video passive capture stopped')
  const observer = (window as any).__youtubeVideoObserver
  if (observer) {
    observer.disconnect()
    delete (window as any).__youtubeVideoObserver
  }
}

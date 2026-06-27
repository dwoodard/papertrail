import type { CollectorModule } from '@contracts'
import {
  isChannelPage,
  isVideoPage,
  startChannelPassiveCapture,
  stopChannelPassiveCapture,
  startVideoPassiveCapture,
  stopVideoPassiveCapture,
} from './scraper'

export const youtubeModule: CollectorModule = {
  descriptor: {
    id: 'youtube',
    label: 'YouTube',
    supportsPassiveCapture: true,
  },
  matches: (url: string): boolean => {
    return /^https:\/\/(www\.)?youtube\.com/.test(url)
  },
  createRuntime: (emit) => {
    let passiveCaptureActive = false
    let captureType: 'channel' | 'video' | null = null

    return {
      startPassiveCapture: () => {
        if (isChannelPage()) {
          passiveCaptureActive = true
          captureType = 'channel'
          startChannelPassiveCapture(emit)
        } else if (isVideoPage()) {
          passiveCaptureActive = true
          captureType = 'video'
          startVideoPassiveCapture(emit)
        } else {
          console.log('[Papertrail] YouTube page type not recognized for capture')
        }
      },
      stopPassiveCapture: () => {
        passiveCaptureActive = false
        if (captureType === 'channel') {
          stopChannelPassiveCapture()
        } else if (captureType === 'video') {
          stopVideoPassiveCapture()
        }
        captureType = null
      },
    }
  },
}

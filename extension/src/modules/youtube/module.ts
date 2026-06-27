import type { CollectorModule } from '@contracts'
import { detectPageType } from './navigator'

export const youtubeModule: CollectorModule = {
  descriptor: {
    id: 'youtube',
    label: 'YouTube',
    supportsPassiveCapture: false,
  },
  matches: (url: string): boolean => {
    return /^https:\/\/(www\.)?youtube\.com/.test(url)
  },
  createRuntime: () => {
    return {
      startPassiveCapture: () => {
        const context = detectPageType()
        console.log('[YouTube] Passive capture for page type:', context.type, context)

        switch (context.type) {
          case 'home':
            console.log('[YouTube] Dashboard view - showing channel list')
            break
          case 'video':
            console.log('[YouTube] Video capture view - ready to extract links & commenters')
            break
          case 'channel':
            console.log('[YouTube] Channel capture view - ready to extract profile & links')
            break
          default:
            console.log('[YouTube] Unknown page type, capture unavailable')
        }
      },
      stopPassiveCapture: () => {
        console.log('[YouTube] Stopped passive capture')
      },
    }
  },
}

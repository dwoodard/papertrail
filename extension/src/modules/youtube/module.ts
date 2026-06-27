import type { CollectorModule } from '@contracts'

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
        console.log('[Papertrail] YouTube passive capture not yet implemented')
      },
      stopPassiveCapture: () => {
        console.log('[Papertrail] YouTube passive capture not yet implemented')
      },
    }
  },
}

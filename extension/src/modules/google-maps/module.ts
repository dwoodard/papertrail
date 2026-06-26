import type { CollectorModule } from '@contracts'
import { scrapeAllMaps, stopMapsScrape } from './scraper'

export const googleMapsModule: CollectorModule = {
  descriptor: {
    id: 'google-maps',
    label: 'Google Maps',
  },
  matches: (url: string): boolean => /^https:\/\/www\.google\.com\/maps/.test(url),
  createRuntime: (emit) => ({
    scrapeAllMaps,
    stopMapsScrape,
  }),
}

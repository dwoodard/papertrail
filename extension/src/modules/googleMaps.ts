import type { CollectorModule } from './types'

/**
 * Google Maps collector module descriptor + URL matcher. The content-side
 * runtime (passive capture + bulk collect) is attached in a later milestone.
 */
export const googleMapsModule: CollectorModule = {
    descriptor: {
        id: 'google-maps',
        label: 'Google Maps',
        supportsPassiveCapture: true,
        supportsBulkCollect: true,
    },
    matches: (url: string): boolean => /^https:\/\/www\.google\.com\/maps/.test(url),
}

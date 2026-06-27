/**
 * Module configuration (registry).
 * Kept separate from ids.ts to avoid circular dependencies.
 */

import { googleMapsModule } from './google-maps'
import { youtubeModule } from './youtube'

export const moduleRegistry = {
  googleMaps: googleMapsModule,
  youtube: youtubeModule,
} as const

/**
 * Module configuration (registry).
 * Kept separate from ids.ts to avoid circular dependencies.
 */

import { googleMapsModule } from './google-maps'

export const moduleRegistry = {
  googleMaps: googleMapsModule,
} as const

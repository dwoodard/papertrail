/**
 * Module IDs derived from the registry.
 * This is the single source of truth for all module identifiers.
 */

import type { moduleRegistry } from './config'

/** All dynamically registered module IDs. */
export type DynamicModuleId = keyof typeof moduleRegistry

/** All module IDs including static fallbacks. */
export type ModuleId = DynamicModuleId | 'generic-website' | 'unknown'

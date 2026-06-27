import type { Commenter } from './storage'

export interface ChannelInfo {
  handle: string
  subs: number
  links: Record<string, string>
}

export interface VideoData {
  channelHandle: string
  links: string[]
  commenters: Omit<Commenter, 'tier'>[]
}

export interface ChannelData {
  handle: string
  subs: number
  links: Record<string, string>
}

/**
 * Extract commenter data from video page (YouTube /watch)
 * @returns Array of commenters with name, handle, channel URL
 *
 * TODO: Fill in DOM selectors using Chrome DOM AI
 * Need to extract from comments section:
 * - Commenter name (display name)
 * - Commenter handle (@handle if available)
 * - Link to commenter's channel (channel URL)
 * - Verification badge (if visible)
 * - Subscriber count of their channel (if visible in profile)
 */
export function extractVideoCommenters(): Omit<Commenter, 'tier'>[] {
  // TODO: Implement with Chrome DOM AI
  // Extract from ytd-comment-renderer elements in #comments section
  // For each commenter: name, handle, channel link, verification status
  console.warn('[YouTube] extractVideoCommenters not yet implemented')
  return []
}

/**
 * Extract links from video description and comments
 * @returns Array of URLs found in video description and top comments
 *
 * TODO: Fill in DOM selectors using Chrome DOM AI
 */
export function extractVideoLinks(): string[] {
  // TODO: Implement with Chrome DOM AI
  // Extract from:
  // 1. Video description (#description-inner)
  // 2. Top comments (ytd-comment-renderer)
  // Parse URLs using URL pattern matching
  console.warn('[YouTube] extractVideoLinks not yet implemented')
  return []
}

/**
 * Extract channel creator info from video page
 * @returns Channel handle and subscriber count
 *
 * TODO: Fill in DOM selectors using Chrome DOM AI
 */
export function extractVideoChannelInfo(): ChannelInfo | null {
  // TODO: Implement with Chrome DOM AI
  // Extract from ytd-video-owner-renderer:
  // - Channel handle (@QuintBUILDs format)
  // - Subscriber count ("649K subscribers")
  console.warn('[YouTube] extractVideoChannelInfo not yet implemented')
  return null
}

/**
 * Extract channel profile data from channel page (/@handle)
 * @returns Channel handle, subscriber count, and links from description
 *
 * TODO: Fill in DOM selectors using Chrome DOM AI
 */
export function extractChannelProfile(): ChannelData | null {
  // TODO: Implement with Chrome DOM AI
  // Extract from channel header and about tab:
  // - Channel handle (from URL or header)
  // - Subscriber count (header)
  // - Links (website, twitter, patreon, etc. from about tab or description)
  console.warn('[YouTube] extractChannelProfile not yet implemented')
  return null
}

/**
 * Extract links from channel description
 * Organized by type (website, twitter, patreon, etc.)
 *
 * TODO: Fill in DOM selectors using Chrome DOM AI
 */
export function extractChannelLinks(): Record<string, string> {
  // TODO: Implement with Chrome DOM AI
  // Parse from channel description or about tab
  // Detect link type: website (quintbuilds.com), twitter, patreon, instagram, etc.
  // Return as { website: 'url', twitter: 'url', ... }
  console.warn('[YouTube] extractChannelLinks not yet implemented')
  return {}
}

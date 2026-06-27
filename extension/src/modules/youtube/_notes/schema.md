# YouTube Schema

## LocalStorage

```typescript
"youtube:channels": string[]  
// List of @handles you've captured data from
// Used by: Dashboard to show channel list
// Example: ["@QuintBUILDs", "@JaneMakes"]

"youtube:channel:@handle": {
  
  channel: {
    handle: string              // @QuintBUILDs
    subs: number                // 649000 (subscriber count, for display/ranking)
    links: { [key: string]: string }  // {website, patreon, twitter, etc.}
                                      // Used by: Contact info in drill-down
  }
  
  allLinks: Array<{
    url: string                 // https://patreon.com/QuintBUILDs
    count: number               // How many videos/comments had this link
  }>
  // Used by: Show channel's main contact/business points
  // Not critical for lead hunting, can drop in v2
  
  uniqueCommenters: Array<{
    name: string                // "Jane Doe" (commenter name)
    handle?: string             // @JaneMakes (their YouTube handle)
    url: string                 // Link to their channel
    count: number               // Appeared in N of your captured videos (engagement signal)
    
    // LEAD QUALIFICATION FIELDS
    isVerified?: boolean        // Has YouTube verification badge (credibility)
    hasChannel?: boolean        // Has their own channel (more valuable lead)
    channelSubs?: number        // Their subscriber count (influence level)
    
    // LEAD TRACKING FIELDS
    status: 'new'|'contacted'|'interested'|'collaborated'|'not_a_fit'
                                // Track relationship state
                                // Used by: Filter/sort leads, outreach tracking
    tier: 'high'|'medium'|'low' // Auto-computed from verified + hasChannel + count
                                // high = verified + has channel + multi-video engagement
                                // Used by: Visual ranking in drill-down, export priority
    
    contactedDate?: string      // ISO date when you reached out
    notes?: string              // "Waiting on response", "Not interested", etc.
  }>[]
  // Primary value: qualified leads already engaged in your niche
  // Used by: Find influencers/clients for outreach
}
```

## Operations

```typescript
// Dashboard
getChannels() → string[]
// Returns list of @handles for dashboard display

// Drill-down  
getChannelData(handle) → full channel object
// Returns everything: channel profile + all leads with tiers + status

// Capture
saveVideo(handle, links[], commenters[]) → merge & dedupe & retier
// Adds new video's links/commenters to channel
// Recalculates lead tiers (based on new engagement count)

// Lead Management
updateLeadStatus(handle, commenterHandle, status, notes) → save
// Update where you are in outreach with a lead

// Export
exportLeads(handle, minTier: 'high'|'medium') → CSV
// Export qualified leads: name, handle, channel url, status, notes
// For: Email campaigns, outreach lists

// Delete
deleteChannel(handle)
// Remove entire channel + all its leads
```

## Tier Calculation

```typescript
// Computed when leads are aggregated
function calculateTier(commenter): 'high'|'medium'|'low' {
  let score = 0
  if (commenter.isVerified) score += 3      // Big signal of credibility
  if (commenter.hasChannel) score += 2      // Own platform = more valuable
  if (commenter.count >= 3) score += 2      // High engagement across your videos
  if (commenter.channelSubs > 10000) score += 1  // Influence
  
  if (score >= 6) return 'high'
  if (score >= 3) return 'medium'
  return 'low'
}

// Used by: Visual hierarchy in drill-down, export ordering, outreach priority
```

## Flow

Capture (VIDEO on YouTube) 
  → [Save] 
    → Extract links + commenters 
      → Aggregate + dedupe 
        → Tier leads (high/medium/low)
          → Store in localStorage
            ↓
Dashboard (youtube.com home)
  → Read youtube:channels
    → Show @handles + subs
      ↓
Drill-down (full page)
  → Read youtube:channel:@handle
    → Show leads ranked by tier
      → [Update status] → Track outreach
      → [Export CSV] → Bulk outreach

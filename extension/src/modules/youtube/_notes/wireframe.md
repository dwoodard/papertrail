# YouTube Side Panel Wireframe

## CAPTURE LAYER

### 1️⃣ VIDEO VIEW (watch?v=xxxx)

**Purpose:** Extract links and commenters from a video page

```
┌─────────────────────────────────────────┐
│ ▶ YouTube Video         [×]             │
├─────────────────────────────────────────┤
│ 🔗 LINKS                                │
│  • patreon.com/QuintBUILDs             │
│  • quintbuilds.com                      │
│  • twitter.com/QuintBUILDs             │
│                                         │
│ 👤 LEADS                                │
│  Jane Doe @JaneMakes → janedoe.com     │
│  John Smith @JohnBuilds → shop         │
│                                         │
├─────────────────────────────────────────┤
│              [Save]                     │
└─────────────────────────────────────────┘
```

**What happens on [Save]:**
- Extract all links (description + comments)
- Extract all commenters (those mentioning links or replying)
- Add/merge to youtube:channel:@handle
- Auto-calculate lead tiers

### 2️⃣ CHANNEL VIEW (@handle, /shorts, /playlists, /posts)

**Purpose:** Capture channel profile links and confirm you're tracking a channel

```
┌─────────────────────────────────────────┐
│ ▶ YouTube Channel       [×]             │
├─────────────────────────────────────────┤
│ @QuintBUILDs • 649K subs                │
│                                         │
│ 🔗 LINKS                                │
│  • quintbuilds.com                      │
│  • patreon.com/QuintBUILDs             │
│  • twitter.com/QuintBUILDs             │
│  • instagram.com/quint_builds          │
│                                         │
├─────────────────────────────────────────┤
│              [Save]                     │
└─────────────────────────────────────────┘
```

**What happens on [Save]:**
- Create/update channel profile
- Store contact links
- Initialize in youtube:channels list

---

## DASHBOARD LAYER

### 0️⃣ Channel List (youtube.com home, no specific page)

**Purpose:** Quick reference of all channels you're tracking. Entry point to drill-down.

```
┌─────────────────────────────────────────┐
│ ▶ YouTube                   [×]         │
├─────────────────────────────────────────┤
│ @QuintBUILDs • 649K subs                │
│ [View]  [×]                             │
│                                         │
│ @JaneMakes • 156K subs                  │
│ [View]  [×]                             │
│                                         │
│ @JohnBuilds • 42K subs                  │
│ [View]  [×]                             │
│                                         │
└─────────────────────────────────────────┘
```

**Interactions:**
- [View] → Navigate to drill-down (full channel page outside side panel)
- [×] → Delete all data for this channel

---

## DRILL-DOWN LAYER

### Channel Lead Hunter (Full Page)

**Purpose:** Manage all leads from this channel. Tier them. Track outreach. Export for campaigns.

```
┌──────────────────────────────────────────────┐
│ @QuintBUILDs • 649K subs            [×]     │
├──────────────────────────────────────────────┤
│                                              │
│ 🔗 CHANNEL LINKS                             │
│  quintbuilds.com | patreon | twitter        │
│                                              │
│ 👤 LEADS (12 total)                          │
│                                              │
│ ⭐ HIGH TIER (5)  [collapse]                 │
│  ✓ Jane Doe @JaneMakes (verified)           │
│    → janedoe.com | In 3 videos              │
│    Status: [new ▼] | Notes: [edit]         │
│                                              │
│  ✓ Sarah Wong @SarahMakes (verified)        │
│    → sarahwong.com | In 2 videos            │
│    Status: [contacted ▼] | Last: 2/15      │
│                                              │
│  🔵 John Smith @JohnBuilds (has channel)    │
│    → johnsmith.shop | In 4 videos           │
│    Status: [interested ▼] | Notes: [edit]   │
│                                              │
│ 🟡 MEDIUM TIER (4)  [collapse]              │
│  Mike Chen @MikeBuilds (1 video)            │
│  Rachel Lee @RachelMakes (2 videos)         │
│  [+2 more]                                  │
│                                              │
│ 🔵 LOW TIER (3)  [collapse]                 │
│  Random users (1 video each)                │
│  [+3 more]                                  │
│                                              │
├──────────────────────────────────────────────┤
│ [← Back] [Export CSV] [Filter by status]    │
└──────────────────────────────────────────────┘
```

**Lead Tier Explanation:**
- **⭐ HIGH:** Verified badge + has channel + engaged in 3+ videos = prime prospect
- **🟡 MEDIUM:** Has channel OR verified + 2-3 video engagement = good prospect  
- **🔵 LOW:** Just appeared once = exploratory, future contact

**Status Field Usage:**
- `new` → Initial discovery, not contacted yet
- `contacted` → Sent DM/email on [date]
- `interested` → They responded positively
- `collaborated` → Partnership/feature happened
- `not_a_fit` → Not relevant for your goals

**What you can do:**
- Click lead name → Open their channel in new tab
- [status ▼] → Change status, auto-saves
- [edit] → Add notes (responses, deal terms, anything)
- [Export CSV] → Download HIGH tier leads for email campaign
- [Filter by status] → Show only "contacted" or "interested" to track pipeline

---

## View Logic

| URL | Side Panel Shows | Purpose |
|-----|---|---|
| youtube.com/watch?v=xxx | VIDEO view | Capture links + leads from this video |
| youtube.com/@handle | CHANNEL view | Capture channel profile |
| youtube.com (home) | DASHBOARD view | List channels you're tracking |

**Then:** Click [View] → Drill-down page (outside side panel) → Manage leads, track outreach, export

---

## Data Flow

Capture (VIDEO on YouTube)
  → [Save] 
    → Extract links + commenters 
      → Tier leads (high/medium/low based on verified + hasChannel + engagement)
        → Store in localStorage
          ↓
Dashboard (youtube.com home)
  → Read youtube:channels
    → Show @handles
      ↓
Drill-down (full page)
  → Read youtube:channel:@handle
    → Show leads ranked by tier
      → [Update status] → Track which leads you've contacted
      → [Export CSV] → Bulk outreach file
      → [Add notes] → Track responses/deal status

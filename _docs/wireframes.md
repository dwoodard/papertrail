Use case: Davis County Contractors

Goal: find decision makers for local contractor businesses.

The user launches Papertrail, creates a project, activates Google Maps module, captures businesses automatically, reviews discoveries in the timeline and graph, then explores entities and AI suggestions.

---

# Extension Architecture

Full-page extension with unified tabbed workspace. No popups or side panels — everything is tabs.

---

Frame 0 — Main Papertrail Hub (Overview Tab)

Main entry point. Shows all projects and their status. Bird's eye view of everything.

┌──────────────────────────────────────────────────────────────┐
│ 🔗 Papertrail                              [+ New Project] ⚙️ │
├──────────────────────────────────────────────────────────────┤
│ [Overview] [Graph] [Entities] [Timeline]                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ My Active Projects                                           │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Davis County Contractors                                 │ │
│ │ Goal: Find decision makers for contractor businesses      │ │
│ │ 48 observations  │  12 entities  │  6 pending suggestions │ │
│ │ Last activity: 2h ago                                    │ │
│ │ [Open] [Graph] [Settings]                                │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ [Another Active Project]                                 │ │
│ │ Goal...                                                  │ │
│ │ Stats...                                                 │ │
│ │ [Open] [Graph] [Settings]                                │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ ─────────────────────────────────────────────────────────── │
│                                                              │
│ Archived Projects (3)                                        │
│ [View Archive]                                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Hub shows all projects with key stats. Click [Open] to dive into a project's workspace (Frame 1+).

---

Frame 0b — Hub Graph Tab

All projects visualized as a network. See cross-project entity connections.

┌──────────────────────────────────────────────────────────────┐
│ 🔗 Papertrail                                               │
├──────────────────────────────────────────────────────────────┤
│ [Overview] [Graph] [Entities] [Timeline]                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Multi-Project Knowledge Graph                                │
│                                                              │
│ Project Layer: [Show All] [By Project]                       │
│                                                              │
│                  Davis County          Tech Research         │
│                  Contractors           Project               │
│                      ●─────────────────●                    │
│                     /│\               /│\                   │
│                    / │ \             / │ \                  │
│                   ●  ●  ●    ...    ●  ●  ●                │
│             Barlow Rock Interstate StartUp Tech Co...       │
│                   │                   │                    │
│                   └───────── DUPLICATE ────────┘            │
│                   Possible Match: same founders             │
│                   [Merge] [Keep Separate]                   │
│                                                              │
│ Cross-project matches highlighted. Shows research overlap.  │
│                                                              │
└──────────────────────────────────────────────────────────────┘

---

Frame 0c — Hub Entities Tab

All entities across all projects in one searchable table.

┌──────────────────────────────────────────────────────────────┐
│ 🔗 Papertrail                                               │
├──────────────────────────────────────────────────────────────┤
│ [Overview] [Graph] [Entities] [Timeline]                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ [Businesses] [People] [Locations] [All]                      │
│ [Search across projects...]                                  │
│                                                              │
│ Entity                    Project              Type   Status │
│ ────────────────────────────────────────────────────────── │
│ Barlow Masonry            Davis County...      Biz    ✓      │
│ Rock Solid Concrete       Davis County...      Biz    ✓      │
│ Mark Barlow               Davis County...      Person ◊      │
│ Interstate Brick          Davis County...      Biz    ⚠      │
│                                                              │
│ (48 entities across 2 projects)                              │
│                                                              │
└──────────────────────────────────────────────────────────────┘

---

Frame 0d — Hub Timeline Tab

Master timeline of all research activity across all projects.

┌──────────────────────────────────────────────────────────────┐
│ 🔗 Papertrail                                               │
├──────────────────────────────────────────────────────────────┤
│ [Overview] [Graph] [Entities] [Timeline]                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ All Projects Activity Timeline                               │
│                                                              │
│ [Filter by Project] [Last 24h] [This Week] [All]             │
│                                                              │
│ 2h ago    🗺️  Davis County / Google Maps                     │
│           Captured: Barlow Masonry                           │
│           [View]                                             │
│                                                              │
│ 1h 50m ago  🌐 Davis County / Website                        │
│           Visited: barlowmasonry.com                         │
│           [View]                                             │
│                                                              │
│ 1h 30m ago  👥 Davis County / LinkedIn                       │
│           Found: Mark Barlow profile                         │
│           [View]                                             │
│                                                              │
│ 1h 15m ago  📸 Davis County / Screenshot                     │
│           LinkedIn evidence added                            │
│           [View]                                             │
│                                                              │
│ 45m ago   🔗 Davis County / Relationship Suggested           │
│           Mark Barlow WORKS_AT Barlow Masonry (high)         │
│           [Confirm] [Reject]                                │
│                                                              │
│ [Earlier Activity...]                                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Unified activity log across all research. See what you've discovered when.

---

# Frame 1 — Project Workspace

Drill into a project from Frame 0. Full workspace with research tools, data views, and module activation.

**Project Header**: Name + Goal + [← Back to Hub]
**Tabs**: Overview | Graph | Entities | Suggestions | Timeline | Evidence [+ Module tabs]

---

Frame 1a — Overview Tab (Default)
Project landing. Shows status, stats, next actions, recent activity.

┌──────────────────────────────────────────────────────────────┐
│ ← Papertrail / Davis County Contractors                      │
│    Goal: Find decision makers for contractor businesses       │
├──────────────────────────────────────────────────────────────┤
│ [Overview] [Graph] [Entities] [Suggestions] [Timeline]       │
│ [Evidence]                                                    │
├──────────────────────────────────────────────────────────────┤
│ Project Status                                               │
│                                                              │
│ Observations: 48       Entities: 12                           │
│ Relationships: 6       AI Suggestions: 2                      │
│ Cross-Project Matches: 0                                      │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Suggested Next Steps                                         │
│                                                              │
│ ⚡ 6 pending AI suggestions                                   │
│ ⚡ 9 businesses without websites                              │
│ ⚡ 4 entities ready for review                                │
│                                                              │
│ [Review Suggestions] [Open Google Maps] [Paste Evidence]     │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Recent Activity                                              │
│ 2h ago: Captured Barlow Masonry from Google Maps             │
│ 1h 50m ago: Visited barlowmasonry.com                        │
│ 1h 30m ago: Found LinkedIn profile                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘

---

Frame 1b — Graph Tab
Knowledge graph of this project's entities and relationships. Zoomed into one project (cf. Frame 0b for multi-project graph).

┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ Papertrail / Davis County Contractors                                                    │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ [Overview] [Graph] [Entities] [Timeline] [Evidence]                                      │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│ [🔍 Search entities...] [View By: Type ▾] [FILTER BY PROJECT: All Projects ▾] [Controls]│
│                                                                                          │
│ ┌────────────────────────────────────────────────────────────────────┬───────────────────┤
│ │                                                                    │                   │
│ │     ●  ●  ●     (force-directed graph visualization)             │ [CONTACT]         │
│ │    ● ◉ ●  ●     ● = entity nodes (tan/brown circles)             │ angela.brooks@... │
│ │   ●  ●  ●  ●    ◉ = selected node (purple)                       │ X                 │
│ │  ●  ●  ●  ●     lines = relationships                            │                   │
│ │     ●  ●  ●     labels = entity types (EMAIL, PHONE, etc.)       │ ABOUT             │
│ │                                                                    │ Connections: 1    │
│ │  [node selection updates sidebar →]                              │ Confidence: 87%   │
│ │                                                                    │                   │
│ │                                                                    │ RELATIONS         │
│ │  [pan & zoom enabled]                                            │ [PERSON]          │
│ │                                                                    │ Angela Brooks     │
│ │                                                                    │ → (10)            │
│ │                                                                    │                   │
│ │                                                                    │ [View in Project] │
│ │                                                                    │                   │
│ └────────────────────────────────────────────────────────────────────┴───────────────────┘
│                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘

Click any node to populate sidebar with details. Sidebar shows entity metadata, relationships, and actions.

---

Frame 1c — Entities Tab
Table view of all captured entities. Filterable by type. Click to see details.

┌──────────────────────────────────────────────────────────────┐
│ ← Papertrail / Davis County Contractors                      │
├──────────────────────────────────────────────────────────────┤
│ [Overview] [Graph] [Entities] [Suggestions] [Timeline]       │
│ [Evidence]                                                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ [Businesses] [People] [Locations] [All]                      │
│ [Search] [Filter by confidence]                              │
│                                                              │
│ Business Name           Phone      Address    Confidence    │
│ ────────────────────────────────────────────────────────── │
│ Barlow Masonry         801-555...  123 Main   ✓ High        │
│ Rock Solid Concrete    801-555...  456 Oak    ✓ High        │
│ Interstate Brick       —           789 Pine   ◊ Medium      │
│                                                              │
│ People                                                       │
│ ────────────────────────────────────────────────────────── │
│ Mark Barlow           Barlow Mason WORKS_AT  ◊ Medium      │
│                                                              │
│ Total: 12 entities                                           │
│                                                              │
└──────────────────────────────────────────────────────────────┘

---

Frame 1d — Suggestions Tab
AI-generated suggestions pending review. Relationships, duplicates, next paths, etc.

┌──────────────────────────────────────────────────────────────┐
│ ← Papertrail / Davis County Contractors                      │
├──────────────────────────────────────────────────────────────┤
│ [Overview] [Graph] [Entities] [Suggestions] [Timeline]       │
│ [Evidence]                                                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ Pending AI Suggestions (2)                                   │
│                                                              │
│ 1. Possible Person Connection                                │
│    Mark Barlow → WORKS_AT → Barlow Masonry                   │
│    Confidence: medium                                        │
│    Evidence: LinkedIn page text (screenshot captured)        │
│    [Confirm] [Reject] [View Evidence]                        │
│                                                              │
│ 2. Best Next Path Suggestion                                 │
│    Explore: Utah business registry                           │
│    Reason: May confirm legal owner/agent                     │
│    [Explore] [Dismiss]                                       │
│                                                              │
│ Reviewed (6)                                                 │
│ ✓ Barlow Masonry has LinkedIn (confirmed)                    │
│ ✓ Rock Solid Concrete has Facebook (confirmed)               │
│ ...                                                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘

---

Frame 1e — Timeline Tab
Chronological research journal. What was discovered, when, from where.

┌──────────────────────────────────────────────────────────────────────┐
│ ← Papertrail / Davis County Contractors                              │
├──────────────────────────────────────────────────────────────────────┤
│ [Overview] [Graph] [Entities] [Suggestions] [Timeline] [Evidence]    │
├──────────────────────────────────────────────────────────────────────┤
│                                                                      │
│ Research Journey                                                     │
│                                                                      │
│ ◄──────────────────────────────────────────────────────────────────►│
│                                                                      │
│  ┌────────┐    ┌────────┐    ┌────────┐    ┌────────┐              │
│  │  🗺️    │    │  🌐    │    │  👥    │    │  📸    │              │
│  │Barlow  │    │Visit   │    │LinkedIn│    │Screenshot             │
│  │Masonry │    │Website │    │Profile │    │Evidence               │
│  │2h ago  │    │1h50m   │    │1h30m   │    │1h15m ago               │
│  └────────┘    └────────┘    └────────┘    └────────┘              │
│       │              │             │              │                │
│       └──────────────┴─────────────┴──────────────┘                │
│                      │                                             │
│               ┌──────▼──────┐                                      │
│               │ 🔗 Mark Barlow                                     │
│               │ WORKS_AT     │                                     │
│               │ Barlow Masonry│                                    │
│               │ (Suggested)   │                                    │
│               └───────────────┘                                    │
│                                                                      │
│ Scroll for more ────────────────────────────────────────────────► │
│                                                                      │
└──────────────────────────────────────────────────────────────────────┘

---

Frame 1f — Evidence Tab
Raw observations, screenshots, notes. Searchable. Links to timeline.

┌──────────────────────────────────────────────────────────────┐
│ ← Papertrail / Davis County Contractors                      │
├──────────────────────────────────────────────────────────────┤
│ [Overview] [Graph] [Entities] [Suggestions] [Timeline]       │
│ [Evidence]                                                    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ [All] [Screenshots] [Captured Data] [Manual Notes]           │
│ [Search evidence...]                                         │
│                                                              │
│ Screenshot — 2h 15m ago                                      │
│ LinkedIn profile for Mark Barlow (Barlow Masonry)            │
│ [View Full] [Edit Note]                                      │
│                                                              │
│ Captured Data — 2h 10m ago                                   │
│ Google Maps: Barlow Masonry                                  │
│   • Phone: (801) 555-0123                                    │
│   • Address: 123 Main St, Davis County, UT                   │
│   • Rating: 4.8/5 (28 reviews)                               │
│ [View Raw] [Copy to Clipboard]                               │
│                                                              │
│ Captured Data — 2h ago                                       │
│ Website: barlowmasonry.com                                   │
│   • Phone: (801) 555-0123                                    │
│   • LinkedIn: linkedin.com/company/barlow-masonry            │
│   • Facebook: facebook.com/barlowmasonry                     │
│ [View Raw] [Copy to Clipboard]                               │
│                                                              │
└──────────────────────────────────────────────────────────────┘

---

Frame 2 — Google Maps Module Tab
User navigates to Google Maps, sees [Google Maps] tab appear. Clicks it to view the module.

┌────────────────────────────────────────────┐
│ PaperTrail / Davis County Contractors      │
├────────────────────────────────────────────┤
│ [Overview] [Graph] [Timeline] [Google Maps]│
├────────────────────────────────────────────┤
│ Keywords                                   │
│                                            │
│ > concrete contractors      0 observed     │
│   brick companies           0 observed     │
│   masonry contractors       0 observed     │
│   general contractors       0 observed     │
│   landscapers               0 observed     │
│                                            │
│ [Add Keyword] [Import Keywords]            │
├────────────────────────────────────────────┤
│ Current Search                             │
│ concrete contractors near Davis County UT  │
│                                            │
│ [Capture Visible Results]                  │
│ [Scroll & Collect]                         │
│ [Pause Module]                             │
├────────────────────────────────────────────┤
│ Status: Ready                              │
└────────────────────────────────────────────┘

---

Frame 3 — Timeline Tab (Horizontal Canvas)

Chronological view of research journey. Shows what was discovered, when, and from where.

┌──────────────────────────────────────────────────────────────────────────┐
│ PaperTrail / Davis County Contractors                                    │
├──────────────────────────────────────────────────────────────────────────┤
│ [Overview] [Graph] [Entities] [Suggestions] [Timeline] [Evidence]        │
├──────────────────────────────────────────────────────────────────────────┤
│ Research Journey                                                         │
│                                                                          │
│ ◄─────────────────────────────────────────────────────────────────────► │
│                                                                          │
│      ┌─────────┐        ┌─────────┐      ┌─────────┐      ┌─────────┐ │
│      │         │        │         │      │         │      │         │ │
│      │  🗺️     │        │  🌐     │      │  👥     │      │  📸     │ │
│      │         │        │         │      │         │      │         │ │
│      │Barlow   │        │Visit    │      │LinkedIn │      │Screenshot│
│      │Masonry  │        │Website  │      │Profile  │      │Evidence  │
│      │         │        │         │      │         │      │         │ │
│      │2h ago   │        │1h50m ago│      │1h30m ago│      │1h15m ago│ │
│      └─────────┘        └─────────┘      └─────────┘      └─────────┘ │
│           │                   │                │                 │      │
│           └───────────────────┴────────────────┴─────────────────┘      │
│                                 │                                       │
│                          ┌──────▼───────┐                               │
│                          │ 🔗 Mark Barlow                               │
│                          │ WORKS_AT      │                               │
│                          │ Barlow Masonry│                               │
│                          │ (Suggested)   │                               │
│                          │ [Confirm]     │                               │
│                          └───────────────┘                               │
│                                                                          │
│ Scroll for more ──────────────────────────────────────────────────────► │
│                                                                          │
└──────────────────────────────────────────────────────────────────────────┘

Events cascade down showing relationships. Each event is clickable for full details. Shows causality and research flow.

---

Frame 4 — Graph Tab

Click [Graph] tab to see knowledge graph visualization of the project's entities and relationships.

┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ ← Papertrail / Davis County Contractors                                                  │
│    Goal: Find decision makers for contractor businesses                                  │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ [Overview] [Graph] [Entities] [Suggestions] [Timeline] [Evidence]                        │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│ [🔍 Search entities...] [View By: Type ▾] [FILTER BY PROJECT: All Projects ▾] [Controls]│
│                                                                                          │
│ ┌────────────────────────────────────────────────────────────────────┬───────────────────┤
│ │                                                                    │                   │
│ │     ●  ●  ●     (force-directed graph visualization)             │ [CONTACT]         │
│ │    ● ◉ ●  ●     ● = entity nodes (tan/brown circles)             │ angela.brooks@... │
│ │   ●  ●  ●  ●    ◉ = selected node (purple)                       │ X                 │
│ │  ●  ●  ●  ●     lines = relationships                            │                   │
│ │     ●  ●  ●     labels = entity types (EMAIL, PHONE, etc.)       │ ABOUT             │
│ │                                                                    │ Connections: 1    │
│ │  [click node → sidebar updates]                                  │ Confidence: 87%   │
│ │                                                                    │                   │
│ │                                                                    │ RELATIONS         │
│ │  [click edge → show relationship evidence]                        │ [PERSON]          │
│ │                                                                    │ Angela Brooks     │
│ │  [pan & zoom enabled]                                            │ WORKS_AT (10)     │
│ │                                                                    │                   │
│ │                                                                    │ [View in Project] │
│ │                                                                    │                   │
│ └────────────────────────────────────────────────────────────────────┴───────────────────┘
│                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘

Graph + sidebar layout: nodes clickable for details, edges clickable for relationship evidence.

---

Frame 5 — Entities Tab

Click [Entities] tab to see extracted entities as a structured table.

┌──────────────────────────────────────────────────────┐
│ PaperTrail / Davis County Contractors               │
├──────────────────────────────────────────────────────┤
│ [Overview] [Graph] [Entities] [Suggestions]          │
│ [Timeline] [Evidence]                                │
├──────────────────────────────────────────────────────┤
│                                                      │
│ [Businesses] [People] [Locations] [All]              │
│ [Search] [Filter by confidence]                      │
│                                                      │
│ Business Name           Phone      Address    Status │
│ ────────────────────────────────────────────────── │
│ Barlow Masonry         801-555...  123 Main   ✓      │
│ Rock Solid Concrete    801-555...  456 Oak    ✓      │
│ Interstate Brick       —           789 Pine   ◊      │
│                                                      │
│ People                                               │
│ ────────────────────────────────────────────────── │
│ Mark Barlow           Barlow Mason. WORKS_AT ◊      │
│                                                      │
│ Locations (8), Websites (6)                          │
│                                                      │
└──────────────────────────────────────────────────────┘

---

Frame 6 — Google Maps Results Captured

After Scroll & Collect runs in the [Google Maps] tab.

┌────────────────────────────────────────────┐
│ PaperTrail                                 │
│ Project: Davis County Contractors          │
├────────────────────────────────────────────┤
│ Active Module                              │
│ Google Maps Collector                      │
│ Search: concrete contractors               │
│ Status: Capturing                          │
├────────────────────────────────────────────┤
│ Keywords                                   │
│                                            │
│ > concrete contractors      48 observed    │
│   brick companies           0 observed     │
│   masonry contractors       0 observed     │
│   general contractors       0 observed     │
│                                            │
├────────────────────────────────────────────┤
│ Useful Right Now                           │
│                                            │
│ ⚡ 9 businesses have no website             │
│ ⚡ 6 have low review count                  │
│ ⚡ 3 already exist in other projects        │
│ ⚡ 4 have websites worth exploring          │
│                                            │
│ [Review Signals]                           │
├────────────────────────────────────────────┤
│ Observed Entities                          │
│                                            │
│ Rock Solid Concrete                        │
│ Captured • phone • address • no website    │
│ Signal: possible lead                      │
│ [Open] [Pin] [Ignore]                      │
│                                            │
│ Barlow Masonry                             │
│ Captured • website • phone • 8 reviews     │
│ Signal: explore website                    │
│ [Open Website] [Pin] [Ignore]              │
│                                            │
│ Interstate Brick                           │
│ Captured • website • phone • address       │
│ Signal: possible existing match            │
│ [Open Website] [Graph]                     │
└────────────────────────────────────────────┘

No “Save” action. The system already captured observations. User actions are now Open, Pin, Ignore, Graph, Review.

Frame 5 — User Opens a Business Website

User clicks Open Website for Barlow Masonry. New tab opens. Website Module activates.

┌────────────────────────────────────────────┐
│ PaperTrail                                 │
│ Project: Davis County Contractors          │
├────────────────────────────────────────────┤
│ Active Module                              │
│ Website Collector                          │
│ Site: barlowmasonry.com                    │
│ Page: Home                                 │
│ Status: Scanning useful paths              │
├────────────────────────────────────────────┤
│ Current Page                               │
│                                            │
│ Captured                                  │
│ ✓ Business name                            │
│ ✓ Phone                                    │
│ ✓ Address                                  │
│ ✓ Facebook link                            │
│ ✓ LinkedIn link                            │
│ ○ Email not found                          │
│                                            │
├────────────────────────────────────────────┤
│ Best Next Paths                            │
│                                            │
│ 1. About / Company                         │
│    likely owner, founder, company history  │
│    [Explore]                               │
│                                            │
│ 2. Contact Page                            │
│    likely email, form, direct contact      │
│    [Explore]                               │
│                                            │
│ 3. LinkedIn Company Page                   │
│    likely people/company connection        │
│    [Explore]                               │
│                                            │
│ 4. Facebook Page                           │
│    likely activity/contact/social proof    │
│    [Explore]                               │
├────────────────────────────────────────────┤
│ Add Evidence                               │
│ [Paste Screenshot] [Paste Text] [Note]     │
└────────────────────────────────────────────┘

This is not a raw link list. AI helps turn many links into Best Next Paths.

Frame 6 — Website Path Tree

User wants a more visual view of what this page exposes.

┌────────────────────────────────────────────┐
│ PaperTrail                                 │
│ Project: Davis County Contractors          │
├────────────────────────────────────────────┤
│ Active Module                              │
│ Website Collector                          │
│ Site: barlowmasonry.com                    │
├────────────────────────────────────────────┤
│ Site Map / Useful Paths                    │
│                                            │
│ barlowmasonry.com                          │
│ ├── Current Page             ✓ scanned     │
│ │   ├── Phone                ✓ found       │
│ │   ├── Address              ✓ found       │
│ │   ├── Facebook             ✓ found       │
│ │   └── LinkedIn             ✓ found       │
│ │                                          │
│ ├── About / Company          ○ available   │
│ ├── Contact Page             ○ available   │
│ ├── Project Gallery          ○ available   │
│ ├── LinkedIn Company Page    ○ available   │
│ └── Facebook Page            ○ available   │
│                                            │
│ Hidden noise: privacy, terms, images,      │
│ duplicate nav links, tracking links        │
├────────────────────────────────────────────┤
│ Best Next Path                             │
│                                            │
│ About / Company                            │
│ Reason: likely to reveal owner/founder     │
│                                            │
│ [Explore in New Tab]                       │
└────────────────────────────────────────────┘

The Website Module starts at the current site, not at Google Maps. The Google Maps source trail is stored in the background.

Frame 7 — User Explores LinkedIn

User clicks LinkedIn. New tab opens. LinkedIn Module activates.

┌────────────────────────────────────────────┐
│ PaperTrail                                 │
│ Project: Davis County Contractors          │
├────────────────────────────────────────────┤
│ Active Module                              │
│ LinkedIn Collector                         │
│ Page: Barlow Masonry Company Profile       │
│ Status: Reading visible company info       │
├────────────────────────────────────────────┤
│ Captured Facts                             │
│                                            │
│ ✓ Company profile URL                      │
│ ✓ Company name                             │
│ ✓ Website link                             │
│ ✓ Industry                                 │
│ ✓ Location                                 │
│                                            │
├────────────────────────────────────────────┤
│ AI Suggestions                             │
│                                            │
│ Suggested Relationship                     │
│ Barlow Masonry → HAS_LINKEDIN_PROFILE      │
│ Confidence: high                           │
│ Evidence: LinkedIn URL from company site   │
│ [Confirm] [Reject]                         │
│                                            │
│ Possible People Path                       │
│ LinkedIn may reveal employees/owner info   │
│ Status: suggestion                         │
│ [Explore People] [Dismiss]                 │
├────────────────────────────────────────────┤
│ Trail                                      │
│ Website → LinkedIn Company Page            │
└────────────────────────────────────────────┘

Direct facts are captured. AI-created meaning is a suggestion.

Frame 8 — Evidence Paste

User sees something on the page that the module did not cleanly capture. They paste a screenshot.

┌────────────────────────────────────────────┐
│ PaperTrail                                 │
│ Project: Davis County Contractors          │
├────────────────────────────────────────────┤
│ Add Evidence                               │
│                                            │
│ Paste Screenshot                           │
│ ┌────────────────────────────────────────┐ │
│ │ [screenshot preview]                    │ │
│ └────────────────────────────────────────┘ │
│                                            │
│ Source Context                             │
│ LinkedIn Company Page                      │
│                                            │
│ [Analyze Evidence]                         │
├────────────────────────────────────────────┤
│ AI Extracted Suggestions                   │
│                                            │
│ Possible Person                            │
│ Name: Mark Barlow                          │
│ Context: visible profile/sidebar text      │
│ Confidence: medium                         │
│                                            │
│ Suggested Relationship                     │
│ Mark Barlow → POSSIBLY_CONNECTED_TO        │
│ Barlow Masonry                             │
│                                            │
│ [Add as Suggestion] [Discard]              │
└────────────────────────────────────────────┘

The screenshot itself becomes evidence. The extracted meaning stays reviewable.

Frame 9 — Main Workspace: Project Overview

User clicks Workspace.

┌──────────────────────────────────────────────────────────────┐
│ PaperTrail / Davis County Contractors                        │
├──────────────────────────────────────────────────────────────┤
│ Goal: Find decision makers                                   │
│                                                              │
│ [Overview] [Graph] [Entities] [Suggestions] [Evidence]       │
│ [Report / Export]                                            │
├──────────────────────────────────────────────────────────────┤
│ Useful Right Now                                             │
│                                                              │
│ ⚡ 9 businesses have no website                               │
│ ⚡ 14 businesses have weak review profiles                    │
│ ⚡ 6 websites expose LinkedIn/Facebook paths                  │
│ ⚡ 3 possible decision-maker suggestions                      │
│ ⚡ 2 cross-project matches found                              │
├──────────────────────────────────────────────────────────────┤
│ Pinned / Important                                           │
│                                                              │
│ Barlow Masonry                                               │
│ Business → Website → LinkedIn → Possible Person              │
│ Suggestions: 2 pending                                       │
│ [Open Graph] [Review Suggestions]                            │
│                                                              │
│ Rock Solid Concrete                                          │
│ Business → Phone → Address                                   │
│ Signal: no website                                           │
│ [Open Graph]                                                 │
├──────────────────────────────────────────────────────────────┤
│ Recent Trail Activity                                        │
│                                                              │
│ Google Maps → Barlow Masonry                                 │
│ Barlow Masonry → barlowmasonry.com                           │
│ barlowmasonry.com → LinkedIn Company Page                    │
│ LinkedIn screenshot → possible person suggestion             │
└──────────────────────────────────────────────────────────────┘

This is the bridge between live collection and serious review.

Frame 10 — Graph View

┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ ← Papertrail / Davis County Contractors                                                  │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ [Overview] [Graph] [Entities] [Suggestions] [Timeline] [Evidence]                        │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                          │
│ [🔍 Search entities...] [View By: Type ▾] [FILTER BY PROJECT: All Projects ▾] [Controls]│
│                                                                                          │
│ ┌────────────────────────────────────────────────────────────────────┬───────────────────┤
│ │                                                                    │                   │
│ │    ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  (dense force-directed   │ [CONTACT]         │
│ │   ● ●● ● ●● ● ●● ●●● ●  ●  ●  ●  ●  ●   graph with 20+ nodes │ angela.brooks@... │
│ │  ● ● ◉ ● ● ● ● ● ● ● ● ● ● ● ● ● ● ●   ◉ = selected entity     │ X                 │
│ │   ●● ●●●●●●●●●●●●●●●●●●●●●●●●●●●●●●     colored by type        │                   │
│ │    ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●  ●                           │ ABOUT             │
│ │                                            confirmed + suggested │ Connections: 14   │
│ │                                            relationships shown   │ Confidence: 87%   │
│ │                                                                    │                   │
│ │                                                                    │ RELATIONS         │
│ │  [pan, zoom, drag enabled]                                       │ PERSON             │
│ │                                                                    │ Angela Brooks     │
│ │                                                                    │ WORKS_AT (10)     │
│ │                                                                    │                   │
│ │                                                                    │ EMAIL             │
│ │                                                                    │ angela@tech.co    │
│ │                                                                    │ → (5)             │
│ │                                                                    │                   │
│ │                                                                    │ [View in Project] │
│ │                                                                    │                   │
│ └────────────────────────────────────────────────────────────────────┴───────────────────┘
│                                                                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘

Graph supports 10-20+ nodes per row. Click nodes for sidebar details. Confirmed and suggested relationships shown with visual distinction.

Frame 11 — Suggestions Review
┌──────────────────────────────────────────────────────────────┐
│ PaperTrail / Suggestions                                     │
├──────────────────────────────────────────────────────────────┤
│ Pending AI Suggestions                                       │
│                                                              │
│ 1. Possible person connection                                │
│    Mark Barlow → Barlow Masonry                              │
│    Confidence: medium                                        │
│    Evidence: LinkedIn screenshot                             │
│    [Confirm] [Reject] [Open Evidence]                        │
│                                                              │
│ 2. Possible duplicate business                               │
│    Barlow Masonry may match Barlow Masonry LLC               │
│    Confidence: high                                          │
│    Evidence: same website + same phone                       │
│    [Merge] [Keep Separate] [Review]                          │
│                                                              │
│ 3. Best Next Path                                            │
│    Explore Utah business registry                            │
│    Reason: may confirm legal owner/agent                     │
│    [Explore] [Dismiss]                                       │
└──────────────────────────────────────────────────────────────┘

This protects trust. AI helps, but does not silently decide.

Frame 12 — Report / Export View
┌──────────────────────────────────────────────────────────────┐
│ PaperTrail / Report & Export                                 │
├──────────────────────────────────────────────────────────────┤
│ Export From Project                                          │
│ Davis County Contractors                                     │
├──────────────────────────────────────────────────────────────┤
│ Lead / Research List                                         │
│                                                              │
│ Filters                                                      │
│ [Pinned only] [Has website] [No website] [Suggestions reviewed]│
│ [Has contact path] [Has decision-maker path]                 │
├──────────────────────────────────────────────────────────────┤
│ Preview                                                      │
│                                                              │
│ Business              Website              Contact Path      │
│ ------------------------------------------------------------ │
│ Barlow Masonry        barlowmasonry.com     LinkedIn found   │
│ Rock Solid Concrete   none                 phone/address     │
│ Interstate Brick      interstatebrick.com   existing match   │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Export Options                                               │
│                                                              │
│ [CSV] [Research Summary] [Evidence Report] [Graph Snapshot]  │
└──────────────────────────────────────────────────────────────┘

This is where “mostly E but really F” lands: report/export matters, but it is powered by graph + query + review.

The Flow In One Line
Create Project
→ Google Maps Module
→ Auto-observe businesses
→ Open website
→ Website Module finds Best Next Paths
→ Explore LinkedIn/Facebook/About
→ AI suggests relationships
→ User confirms important ones
→ Graph preserves the trail
→ Workspace turns it into output

The strongest UI pattern is:

Side Panel = live module + Best Next Paths
Main Workspace = query + graph + review + output
Graph = evidence-backed relationship trails

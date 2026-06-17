Use case: Davis County Contractors

Goal: find decision makers for local contractor businesses.

The user starts in PaperTrail, creates a project, searches Google Maps, captures businesses automatically, opens a business website, follows Best Next Paths, then reviews the graph/workspace.

Frame 1 — Create Project
┌──────────────────────────────────────────────────────────────┐
│ PaperTrail                                                   │
├──────────────────────────────────────────────────────────────┤
│ New Project                                                  │
│                                                              │
│ Project Name                                                 │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Davis County Contractors                                  │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ Goal                                                         │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ Find decision makers for contractor businesses             │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ Starting Target                                              │
│ ┌──────────────────────────────────────────────────────────┐ │
│ │ concrete contractors in Davis County Utah                  │ │
│ └──────────────────────────────────────────────────────────┘ │
│                                                              │
│ [Create Project]                                             │
└──────────────────────────────────────────────────────────────┘

This keeps setup light: name + goal + optional starting target.

Frame 2 — Project Workspace Opens
┌──────────────────────────────────────────────────────────────┐
│ PaperTrail / Davis County Contractors                        │
├──────────────────────────────────────────────────────────────┤
│ Goal: Find decision makers for contractor businesses          │
│ Starting Target: concrete contractors in Davis County Utah    │
│                                                              │
│ [Open Chrome Side Panel] [Graph] [Entities] [Suggestions]    │
├──────────────────────────────────────────────────────────────┤
│ Project Status                                               │
│                                                              │
│ Observations: 0                                              │
│ Entities: 0                                                  │
│ Relationships: 0                                             │
│ AI Suggestions: 0                                            │
│ Cross-Project Matches: 0                                     │
├──────────────────────────────────────────────────────────────┤
│ Start Collecting                                             │
│                                                              │
│ Suggested starting paths:                                    │
│                                                              │
│ 1. Search Google Maps for contractor categories              │
│ 2. Search Google for company websites                        │
│ 3. Paste a list, screenshot, or copied table                  │
│                                                              │
│ [Open Google Maps Search] [Paste Evidence]                   │
└──────────────────────────────────────────────────────────────┘

The workspace is not graph-only. It is the project home base.

Frame 3 — Google Maps Module Activates

User opens Google Maps in another tab. Side panel stays open.

┌────────────────────────────────────────────┐
│ PaperTrail                                 │
│ Project: Davis County Contractors          │
│ Goal: Find decision makers                 │
├────────────────────────────────────────────┤
│ Active Module                              │
│ Google Maps Collector                      │
│ Status: Ready                              │
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
│ Useful Right Now                           │
│ Nothing captured yet                       │
└────────────────────────────────────────────┘

This keeps your existing Google Maps pattern: keywords on the side, selected keyword drives the results.

Frame 4 — Google Maps Results Captured

After Scroll & Collect runs.

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
┌──────────────────────────────────────────────────────────────┐
│ PaperTrail / Graph View                                      │
├──────────────────────────────────────────────────────────────┤
│ Project Layer: Davis County Contractors                      │
│ View: Confirmed + Suggested                                  │
│                                                              │
│ [Confirmed Only] [Show Suggestions] [Cross-Project Links]    │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│        Google Maps Listing                                   │
│                │                                             │
│                ▼                                             │
│        Barlow Masonry                                        │
│          │       │       │                                   │
│          │       │       └──── Phone                         │
│          │       │                                           │
│          │       └──────────── Address                       │
│          │                                                   │
│          └──────── Website: barlowmasonry.com                │
│                         │                                    │
│                         ├── About Page                       │
│                         ├── Contact Page                     │
│                         └── LinkedIn Company Profile         │
│                                      │                       │
│                                      ▼                       │
│                         Suggested Person: Mark Barlow        │
│                         Status: AI suggestion                │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ Selected Edge                                                │
│                                                              │
│ Mark Barlow → POSSIBLY_CONNECTED_TO → Barlow Masonry         │
│ Status: suggested                                            │
│ Evidence: LinkedIn screenshot + visible page text            │
│ Confidence: medium                                           │
│                                                              │
│ [Confirm] [Reject] [Open Evidence]                           │
└──────────────────────────────────────────────────────────────┘

The graph shows both confirmed relationships and suggested ones, but visually separates them.

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

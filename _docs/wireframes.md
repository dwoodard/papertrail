# Papertrail Wireframes & Text-Based Layouts

> Text-based UI layouts for Papertrail screens  
> Stack: Vue 3 + Inertia.js + Tailwind CSS v4  
> Status: Reference layouts

---

## Projects Dashboard

```
┌──────────────────────────────────────────────────────────────────────────────────────────────
│  Papertrail  🔍                                                  [User ▼] [⚙️]
├──────────────────────────────────────────────────────────────────────────────────────────────
│
│  📁 Projects                                                      [+ New Project]
│
│  ┌────────────────────────────────────────────────────────────────────────────────────────
│  │ All (5)       ●●●●●●●●●●●●●●●●●        Filter: [All ▼]    Sort: [Name ▼]
│  │ Active (3)
│  │ Archived (2)   Project Name              Category      Status         Last Run  Res...
│  │                ═════════════════════════════════════════════════════════════════════
│  │ Filter by:
│  │ [Type ▼]       ✓ Client Discovery       Potential    Ready          Jul 15    8
│  │                  Find companies needing services            [View] [⋯]
│  │ Sort by:
│  │ [Name ▼]       ✓ Partnership Prospects   Strategic    Completed      Jul 10   12
│  │                  Identify opportunities                      [View] [⋯]
│  │ Clear All
│  │                ● Vendor Research        Solutions    Researching    Jul 8    23
│  │                  Find vendors for stack                       [View] [⋯]
│  │
│  │                ○ Speaker Opportunities  Speaking     Defining       Jun 30    0
│  │                  Find conferences                              [View] [⋯]
│  │
│  │                ○ Investor Prospects     Funding      Draft          -         0
│  │                  Early-stage investors                         [View] [⋯]
│  │
│  └────────────────────────────────────────────────────────────────────────────────────────
│
│  Quick Actions:  [+ New Project]  [Import CSV]  [Manage Organization]
│
└──────────────────────────────────────────────────────────────────────────────────────────────
```

---

## Create Project

```
┌──────────────────────────────────────────────────────────────────────────────────────────────
│  Papertrail > Projects > Create New Project
├──────────────────────────────────────────────────────────────────────────────────────────────
│
│                                    CREATE NEW PROJECT
│                                    ══════════════════════════════════════════
│
│  ┌─────────────────────────────────────────────┐  ┌────────────────────────────────────
│  │  📋 Project Details                         │  │  📚 Inherit Organization Context
│  │                                             │  │
│  │  Organization:                              │  │  Choose which settings to inherit:
│  │  ┌─────────────────────────────────────┐   │  │
│  │  │  Studio Creative         [Select ▼] │   │  │  ☑ Services & Expertise
│  │  └─────────────────────────────────────┘   │  │    ✓ Brand Strategy
│  │                                             │  │    ✓ Digital Experience Design
│  │  Project Name: *                            │  │    ✓ Creative Direction
│  │  ┌─────────────────────────────────────┐   │  │
│  │  │  Q3 Client Prospecting      [Clear] │   │  │  ☑ Target Markets
│  │  └─────────────────────────────────────┘   │  │    ✓ Growth-Stage Startups
│  │  Help: e.g. "Find partnership opps"        │  │    ✓ Tech & Digital Companies
│  │                                             │  │
│  │  Description:                               │  │  ☑ Geographic Preferences
│  │  ┌─────────────────────────────────────┐   │  │    ✓ North America (US, Canada)
│  │  │  Identify mid-market B2B SaaS       │   │  │    ✓ Western Europe
│  │  │  companies actively planning their   │   │  │
│  │  │  first brand redesign. Focus on     │   │  │  ☑ Exclusions
│  │  │  companies that recently raised     │   │  │    ✓ Agencies (competitors)
│  │  │  Series A or B.                     │   │  │    ✓ Companies > 2,000 employees
│  │  │                                     │   │  │
│  │  └─────────────────────────────────────┘   │  │  [Customize Context]
│  │                                             │  │
│  └─────────────────────────────────────────────┘  └────────────────────────────────────
│
│                                   [← Cancel]    [Create Project]
│
└──────────────────────────────────────────────────────────────────────────────────────────────
```

---

## Objective Conversation + Checklist

```
┌────────────────────────────────────────────────────────┬─────────────────────────────────
│ 📋 Client Discovery > Objective Conversation           │ 📌 OBJECTIVE CHECKLIST
├────────────────────────────────────────────────────────┼─────────────────────────────────
│                                                        │
│  CONVERSATION                                          │  Progress: 5/8 Complete (62%)
│  ════════════════════════════════════════════════════  │  ██████████░░░░░░░░░░░░
│                                                        │
│  Papertrail:                                           │  ✓ Outcome
│  What are you trying to accomplish?                    │    Find organizations needing
│                                                        │    brand services
│  📝 You:                                               │
│  Find companies needing brand strategy & design.       │  ✓ Opportunity Type
│  We're looking for growth-stage startups planning      │    Potential Client
│  major updates to their brand and positioning.         │
│                                                        │  ✓ Target Description
│  Papertrail:                                           │    Growth-stage companies with
│  What characteristics show a company is ready for      │    active rebranding plans
│  brand redesign? Any specific signals we look for?     │
│                                                        │  ✓ Qualification Signals
│  📝 You:                                               │    Funding raised, team growth,
│  Usually when they've raised funding and plan to       │    website updates
│  scale. When they hire a CMO or Chief Brand Officer.   │
│  Also when they announce a rebrand or change website.  │  ○ Exclusions
│                                                        │    Not yet specified
│  Papertrail:                                           │
│  Great signals! About geographic focus and size?       │  ○ Time Horizon
│  Any regions you want to target?                       │    Not yet specified
│                                                        │
│  📝 You: [Type your response...                        │  ○ Evidence Requirements
│  ┌──────────────────────────────────────────────┐      │    Not yet specified
│  │  Strongest in North America & Western Europe.│      │
│  │  Prefer US market.                           │      │  ○ Success Definition
│  │                      [       ] [Submit ✓]    │      │    Not yet specified
│  └──────────────────────────────────────────────┘      │
│                                                        │  [Ready to Approve]
│                                                        │  Still gathering more info...
│                                                        │
│                                                        │  💡 Next: Define exclusions
│                                                        │  and success metrics
│                                                        │
└────────────────────────────────────────────────────────┴─────────────────────────────────
```

---

## Objective Brief Review

```
┌──────────────────────────────────────────────────────────────────────────────────────────────
│ 📋 Client Discovery > Objective Brief Review
├──────────────────────────────────────────────────────────────────────────────────────────────
│
│                                 PROJECT OBJECTIVE BRIEF
│                                 ══════════════════════════════════════════════════════════
│
│  ┌────────────────────────────────────────────────────────────────────────────────────────
│  │
│  │  📊 OUTCOME
│  │  ─────────────────────────────────────────────────────────────────────────────────
│  │  Find organizations that may become valuable clients for our brand strategy and
│  │  design services
│  │
│  │  🏷️  SYSTEM CATEGORY
│  │  ─────────────────────────────────────────────────────────────────────────────────
│  │  Potential Client
│  │
│  │  🎯 SPECIFIC OPPORTUNITY TYPE
│  │  ─────────────────────────────────────────────────────────────────────────────────
│  │  Growth-stage companies actively planning brand updates or positioning changes
│  │
│  │  👥 TARGET ENTITIES
│  │  ─────────────────────────────────────────────────────────────────────────────────
│  │  Small to mid-sized organizations (10-500 employees) with active brand
│  │  initiatives in North America & Western Europe
│  │
│  │  📍 RELEVANT SIGNALS (What we'll search for)
│  │  ─────────────────────────────────────────────────────────────────────────────────
│  │  • Series A/B Funding Announcements    • New CMO or Chief Brand Officer Hire
│  │  • Announced Rebranding Initiative     • Website Redesign/Announcement
│  │  • Market Expansion Announcements      • IPO or Growth Investment Round
│  │  • Acquisition that signals repositioning  • New Product Category Launch
│  │
│  │  ❌ EXCLUSIONS (What to filter out)
│  │  ─────────────────────────────────────────────────────────────────────────────────
│  │  • Design/branding agencies (competitors) • Companies > 500 employees
│  │  • Pre-seed/bootstrapped startups        • Outside North America & Western Europe
│  │  • Non-profits or government entities    • Companies in financial distress
│  │
│  │  🎲 TARGET RESULT QUANTITY
│  │  ─────────────────────────────────────────────────────────────────────────────────
│  │  20 qualified opportunities
│  │
│  │  ✨ SUCCESS DEFINITION
│  │  ─────────────────────────────────────────────────────────────────────────────────
│  │  At least 8 results are worth pursuing (conversation or proposal)
│  │
│  └────────────────────────────────────────────────────────────────────────────────────────
│
│                                [Back]  [← Needs Revision]  [✓ Approve & Continue]
│
└──────────────────────────────────────────────────────────────────────────────────────────────
```

---

## Rubric Review

```
┌──────────────────────────────────────────────────────────────────────────────────────────────
│ 📋 Client Discovery > Qualification Rubric Review
├──────────────────────────────────────────────────────────────────────────────────────────────
│
│                                 QUALIFICATION RUBRIC
│                                 ══════════════════════════════════════════════════════════
│
│  ┌────────────────────────────────────────────────────────────────────────────────────────
│  │  🔴 REQUIRED CRITERIA (All must pass for qualification)
│  │  ════════════════════════════════════════════════════════════════════════════════
│  │
│  │  ✓ Identifiable Entity & Decision Maker
│  │    Can we identify the organization and find a relevant person (CMO, Head of
│  │    Marketing, CEO)?
│  │
│  │  ✓ Current Factual Signal (within 90 days)
│  │    Must have dated evidence of brand/positioning activity (funding, hires,
│  │    announcements, website)
│  │
│  │  ✓ Relevant Service Fit
│  │    Organization's stated needs align with our core brand strategy and design
│  │    services
│  │
│  │  ✓ Supporting Evidence Quality
│  │    At least 2 independent sources confirming signal (not hearsay)
│  │
│  │
│  │  🟡 PREFERRED CRITERIA (Score is higher with these)
│  │  ════════════════════════════════════════════════════════════════════════════════
│  │
│  │  ○ Multiple Relevant Signals
│  │    3+ different signals about brand/positioning efforts increases confidence
│  │
│  │  ○ Public Contact Information
│  │    Email, phone, or verified LinkedIn available for outreach
│  │
│  │  ○ Recent Activity (< 30 days)
│  │    Very recent announcements suggest active project underway
│  │
│  │  ○ Confirmed Budget/Funding
│  │    Evidence they have funds for external agencies (funding raise, hiring)
│  │
│  │  ○ Team Expansion in Brand/Marketing
│  │    New hires signal major initiatives underway
│  │
│  └────────────────────────────────────────────────────────────────────────────────────────
│
│                               [Back]  [← Edit Criteria]  [✓ Approve & Continue]
│
└──────────────────────────────────────────────────────────────────────────────────────────────
```

---

## Research Strategy Review

```
┌──────────────────────────────────────────────────────────────────────────────────────────────
│ 📋 Client Discovery > Research Strategy Review
├──────────────────────────────────────────────────────────────────────────────────────────────
│
│  ┌──────────────────────────────────────────┐  ┌─────────────────────────────────────────
│  │  🔍 SEARCH CONCEPTS & KEYWORDS           │  │  📊 STRATEGY SUMMARY
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │  │  ───────────────────────────────────
│  │                                          │  │
│  │  • Series A/B funding raised            │  │  Target: Growth-stage B2B SaaS
│  │  • Announces $X million funding round   │  │  Companies (10-500 employees)
│  │  • New VP of Marketing hire             │  │
│  │  • CMO appointed                        │  │  Signals: Funding, hires, rebrand
│  │  • Rebranding initiative                │  │  announcements, website updates
│  │  • Website redesign                     │  │
│  │  • Repositioning announcement           │  │  Target Volume: 20 opportunities
│  │  • Identity refresh                     │  │
│  │  • New market expansion                 │  │  Success: 40%+ are worth pursuing
│  │  • Product launch announcement          │  │
│  │  • Strategic acquisition                │  │  Timeline: 90 days
│  │                                          │  │
│  └──────────────────────────────────────────┘  └─────────────────────────────────────────
│
│  ┌────────────────────────────────────────────────────────────────────────────────────────
│  │ 🌐 SOURCE FAMILIES (Ranked by priority)
│  │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│  │
│  │  1. Web Search + News    2. Company Websites  3. LinkedIn Content  4. Press Rel.
│  │  5. Industry Pubs         6. Job Boards        7. Directory Listings  8. Social
│  │
│  └────────────────────────────────────────────────────────────────────────────────────────
│
│  ┌────────────────────────────────────────┐  ┌──────────────────────────────────────────
│  │ 📍 TARGET DEMOGRAPHICS                 │  │ ⏹️  STOP CONDITIONS
│  │ ─────────────────────────────────────  │  │ ───────────────────────────────────
│  │                                        │  │
│  │ Location: North America, W. Europe    │  │ Stop when ANY of these are met:
│  │ Company Size: 10-500 employees        │  │ • 20 qualified opportunities found
│  │ Industries: B2B SaaS, Fintech, EdTech │  │ • 250 candidates researched
│  │ Stage: Series A/B funded (last 2 yrs) │  │ • 90 days elapsed
│  │ Growth Rate: 50%+ YoY                 │  │ • $500 estimated cost reached
│  │                                        │  │
│  └────────────────────────────────────────┘  └──────────────────────────────────────────
│
│  ⚠️  KNOWN LIMITATIONS
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
│  • Authenticated LinkedIn profiles not available   • Employee directory scraping limited
│  • Company info may be outdated (6+ months)        • Very new companies may not appear
│
│                           [Back]  [Edit Settings]  [← Request Revision]  [✓ Approve]
│
└──────────────────────────────────────────────────────────────────────────────────────────────
```

---

## Research Progress / Real-Time Status

```
┌──────────────────────────────────────────────────────────────────────────────────────────────
│ 📋 Client Discovery > Research Run #1 — In Progress    Started: Jul 15, 10:23 AM
├──────────────────────────────────────────────────────────────────────────────────────────────
│
│                          RESEARCH PROGRESS
│                          ══════════════════════════════════════════════════════════════════
│
│  ┌──────────────────────────────────────────────────────────────────────────────────────
│  │
│  │  ✓ Objective Approved                    10:23 AM  [2 min]
│  │  ✓ Rubric Approved                       10:25 AM  [2 min]
│  │  ✓ Research Strategy Approved            10:28 AM  [3 min]
│  │  ✓ Search Concepts & Queries Generated   10:30 AM  [12 sec]
│  │  ✓ Initial Findings Discovered           10:45 AM  [15 min]   Found: 127 cand.
│  │                                                    ████████████████████░░░░░░░░ 100%
│  │  ● Currently: Resolving 43 Organizations ~10:50 AM [→]  Progress: Matching entities
│  │                                                    ██████████░░░░░░░░░░░░░░░░░░░ 48%
│  │                                                    Est. Time Remaining: 4 minutes
│  │  ○ Next: Gathering Evidence              Waiting   [→]  Will fetch URLs and data
│  │                                                    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0%
│  │  ○ Next: Evaluating Against Rubric       Waiting   [→]  AI scoring of candidates
│  │                                                    ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ 0%
│  │
│  └──────────────────────────────────────────────────────────────────────────────────────
│
│  ┌──────────────────────────────────────────────────────────────────────────────────────
│  │  🔄 Processing: TechStart Inc
│  │     From: LinkedIn search for "Series A funded" + "marketing hire"
│  │     Status: Verifying company size and location... [●●●●●●]
│  │
│  │  📊 STATS
│  │     Discovered: 127        Researching: 43        Qualified: 0        Rejected: 0
│  │
│  │  💰 COST TRACKING
│  │     Estimated: $12.50 of $500.00  [████░░░░░░░░░░░░░░░░░░░░░░░░░░ 2.5%]
│  │
│  └──────────────────────────────────────────────────────────────────────────────────────
│
│                            [⏸ Pause]  [⏹ Cancel]  [👁 View Findings]  [Notifications ▼]
│
└──────────────────────────────────────────────────────────────────────────────────────────────
```

---

## Opportunity Results List

```
┌──────────────────────────────────────────────────────────────────────────────────────────────
│ 📋 Client Discovery > Results (Research Run #1 Completed)
├──────────────────────────────────────────────────────────────────────────────────────────────
│
│  Filter: [All ▼]  Status: [All ▼]  Confidence: [All ▼]  Sort: [Relevance ▼]  18 of 20
│
│  ┌────────────────────────────────────────────────────────────────────────────────────────
│  │ ✓ TechStart Inc                          Confidence: 89%  [👁 View Details]
│  │   Potential Client — Brand Strategy & Digital Experience        Discovered: Jul 15
│  │   Why: Series A funding ($5M), VP Marketing hire, new website, EU expansion
│  │                                                           [Keep] [✗ Reject]
│  ├────────────────────────────────────────────────────────────────────────────────────────
│  │ ✓ Bright Designs LLC                     Confidence: 82%  [👁 View Details]
│  │   Potential Client — Brand Identity                           Discovered: Jul 14
│  │   Why: Website redesign announced, team growth (hired 8), new positioning
│  │                                                           [Keep] [✗ Reject]
│  ├────────────────────────────────────────────────────────────────────────────────────────
│  │ ✓ Global Consulting Group               Confidence: 76%  [👁 View Details]
│  │   Potential Client — Strategic Brand Positioning              Discovered: Jul 13
│  │   Why: New market expansion to Asia-Pacific, CMO hire, speaking about "reinvention"
│  │                                                           [Keep] [✗ Reject]
│  ├────────────────────────────────────────────────────────────────────────────────────────
│  │ ✓ CloudMetrics Inc                      Confidence: 71%  [👁 View Details]
│  │   Potential Client — Product Rebranding                       Discovered: Jul 12
│  │   Why: Released new product line, updated brand colors, new case study online
│  │                                                           [Keep] [✗ Reject]
│  ├────────────────────────────────────────────────────────────────────────────────────────
│  │ ✗ Acme Corp (Enterprise)                 Confidence: 65%  [👁 View Details]
│  │   Filtered: Company size > 500 employees (exclusion criteria)    Discovered: Jul 11
│  │   Reason: Too large — slow decision-making, doesn't fit target  [Restore] [Delete]
│  ├────────────────────────────────────────────────────────────────────────────────────────
│  │
│  │  [← Previous]  [Load More Results...]  [Next →]
│  │
│  └────────────────────────────────────────────────────────────────────────────────────────
│
│  Bulk Actions:  [☑ Select All]  [✗ Reject All]  [Export]  [Import to CRM]  [Share]
│
└──────────────────────────────────────────────────────────────────────────────────────────────
```

---

## Opportunity Detail — Full View

```
┌──────────────────────────────────────────────────────────────────────────────────────────────
│ 📋 Client Discovery > Result #1: TechStart Inc
├──────────────────────────────────────────────────────────────────────────────────────────────
│
│  ┌────────────────────────────────┐  TechStart Inc              Confidence Score: 89%
│  │  TechStart Inc                 │  Potential Client • Founded 2021 • San Francisco, CA
│  │  ═════════════════════════════ │  42 employees
│  │                                 │  Website: techstart.io    LinkedIn: linkedin.com/...
│  └────────────────────────────────┘  ═══════════════════════════════════════════════════
│                                        │
│                                        🎯 WHY THIS MATCHES
│                                        ──────────────────────────────────────────────────
│                                        TechStart is a Series A startup in growth phase
│                                        with aggressive expansion. Recent funding and new
│                                        marketing leadership signal they're ready to
│                                        invest in professional brand strategy and design.
│
│                                        ⏰ WHY NOW
│                                        ──────────────────────────────────────────────────
│                                        Series A funding announced July 12 ($5M). VP
│                                        Marketing hired July 8. New website launched
│                                        July 1. New team of 12 people. Prime window for
│                                        brand services — 60-90 days post-funding.
│
│  ┌───────────────────────────┬───────────────────────────────────────────────────────────
│  │  📊 FACTUAL SIGNALS        │  💼 DECISION MAKER
│  │  ────────────────────────  │  ──────────────────────────────────────────────────
│  │                            │
│  │ ✓ Series A Funding         │  Sarah Chen, VP of Marketing
│  │   $5M announced Jul 12      │  linkedin.com/in/sarahchen
│  │   Source: TechCrunch        │  Email: sarah@techstart.io
│  │   Confidence: 100%          │  Phone: (415) 555-0147
│  │                            │  Background: 10 years SaaS, ex-Stripe, HubSpot
│  │ ✓ VP Marketing Hire        │  Likely to lead brand initiatives
│  │   Sarah Chen started Jul 8  │
│  │   Source: LinkedIn profile  │  📞 CONTACT PATH
│  │   Confidence: 95%           │  ──────────────────────────────────────────────────
│  │                            │
│  │ ✓ New Website              │  Primary: info@techstart.io
│  │   Launched Jul 1            │  Direct: sarah@techstart.io
│  │   Redesigned messaging      │  LinkedIn: Send message to Sarah Chen
│  │   Source: Wayback Machine   │  Website: techstart.io/contact/
│  │   Confidence: 85%           │
│  │                            │  💡 RECOMMENDED NEXT ACTION
│  │ ✓ EU Market Expansion      │  ──────────────────────────────────────────────────
│  │   UK & Germany expansion    │
│  │   Source: Press release     │  1. Reach out with post-Series-A brand case study
│  │   Confidence: 92%           │  2. Mention Stripe/HubSpot brand experience
│  │                            │  3. Reference European market positioning
│  │ ✓ Team Growth              │  4. Suggest brand audit for US+EU alignment
│  │   8 new hires announced     │  5. Schedule 15-min exploratory call
│  │   Source: LinkedIn          │  Timing: Reach out this week (within 7 days)
│  │   Confidence: 90%           │
│  │                            │
│  └───────────────────────────┴───────────────────────────────────────────────────────
│
│  ┌────────────────────────────────────────────────────────────────────────────────────────
│  │ 📋 SUPPORTING EVIDENCE (4 sources, all confirmed)
│  ├────────────────────────────────────────────────────────────────────────────────────────
│  │
│  │ 1. 📰 TechCrunch: "TechStart Closes $5M Series A Led by Founders Fund"
│  │    Published: Jul 12, 2024   Source: techcrunch.com/news/techstart-series-a
│  │    Quote: "...funding will accelerate product development and strategy..."
│  │    Confidence: 100%             [View Article ↗]  [Archive Link]
│  │
│  │ 2. 👤 LinkedIn: Sarah Chen, VP of Marketing at TechStart
│  │    Posted: 5 days ago    "Excited to join TechStart as VP of Marketing!"
│  │    Source: linkedin.com/in/sarahchen
│  │    Confidence: 95%         [View Profile ↗]
│  │
│  │ 3. 🌐 Company Website: New Brand & Design
│  │    Published: Jul 1, 2024       New color palette, tagline, messaging hierarchy
│  │    Source: techstart.io
│  │    Confidence: 85%         [View Site ↗]  [Design Details]
│  │
│  │ 4. 📢 Press Release: "TechStart Expands International Operations"
│  │    Date: Jun 28, 2024    Expanding to UK and Germany markets in H2 2024
│  │    Source: prweb.com/releases/techstart-international-expansion
│  │    Confidence: 90%         [View Release ↗]
│  │
│  └────────────────────────────────────────────────────────────────────────────────────────
│
│         [⬅ Previous]  [Rubric Evaluation]  [✓ Keep]  [✗ Reject]  [Export]  [Next ➜]
│
└──────────────────────────────────────────────────────────────────────────────────────────────
```

---

## Rubric Evaluation Detail

```
┌──────────────────────────────────────────────────────────────────────────────────────────────
│ 📋 TechStart Inc > Rubric Evaluation (How it qualified)
├──────────────────────────────────────────────────────────────────────────────────────────────
│
│                               QUALIFICATION EVALUATION
│                               ══════════════════════════════════════════════════════════════
│
│  🔴 REQUIRED CRITERIA (All must pass)
│  ──────────────────────────────────────────────────────────────────────────────────────────
│
│  ✓ PASSED — Identifiable Entity & Decision Maker              Confidence: 95%
│    ├─ Company: TechStart Inc, San Francisco, 2021, 42 employees
│    ├─ Person: Sarah Chen, VP Marketing (10+ yrs SaaS, LinkedIn verified)
│    └─ Contact: sarah@techstart.io, (415) 555-0147, LinkedIn DM available
│
│  ✓ PASSED — Current Factual Signal (within 90 days)                              Confidence: 100%
│    ├─ Jul 12: Series A funding announcement ($5M) — CONFIRMED via TechCrunch
│    ├─ Jul 08: VP Marketing hire — CONFIRMED via LinkedIn profile
│    ├─ Jul 01: New website with brand refresh — CONFIRMED via Wayback Machine
│    └─ Jun 28: EU market expansion — CONFIRMED via official press release
│        Most recent signal: 3 days ago (within window)
│
│  ✓ PASSED — Relevant Service Fit                                               Confidence: 88%
│    ├─ Company needs: Brand positioning, EU market entry, team identity
│    ├─ Our services: Brand strategy, digital experience, positioning
│    ├─ Alignment: Excellent — new VP will lead brand initiatives
│    └─ Note: Sarah's Stripe/HubSpot background suggests premium agency comfort
│
│  ✓ PASSED — Supporting Evidence Quality (2+ sources)                          Confidence: 92%
│    ├─ TechCrunch article (independent tech news)
│    ├─ LinkedIn profile (primary source)
│    ├─ Company website (primary company source)
│    └─ Press release (official communication)  |  4 sources, all independent
│
│  🟡 PREFERRED CRITERIA (Increases score)
│  ──────────────────────────────────────────────────────────────────────────────────────────
│
│  ✓ MATCHED — Multiple Relevant Signals                                    Confidence: 94%
│    └─ 4 distinct signals: Funding + Hire + Website + Expansion (brand/positioning focused)
│
│  ✓ MATCHED — Public Contact Information                                  Confidence: 92%
│    ├─ Email: sarah@techstart.io (company pattern verified)
│    ├─ Phone: Listed on website
│    └─ LinkedIn: Direct message available
│
│  ✓ MATCHED — Very Recent Activity                                       Confidence: 100%
│    └─ Most recent signal 3 days old (far better than 90-day requirement)
│
│  ✓ MATCHED — Confirmed Budget/Funding                                   Confidence: 99%
│    └─ Just raised $5M Series A, very likely to allocate budget in first 6 months
│
│  ✓ MATCHED — Team Expansion in Brand/Marketing                          Confidence: 95%
│    └─ Hired VP Marketing + 8 hires suggest major initiatives underway
│
│  ═══════════════════════════════════════════════════════════════════════════════════════════
│
│  🎯 FINAL RESULT
│  ───────────────────────────────────────────────────────────────────────────────────────────
│
│     ✓ ✓ ✓  QUALIFIED FOR OUTREACH
│
│     Score: 89/100
│     All required criteria passed. 5/5 preferred criteria matched.
│     Recommendation: High priority — reach out within 7 days.
│
└──────────────────────────────────────────────────────────────────────────────────────────────
```

---

## Export Dialog

```
┌────────────────────────────────────────────────────────────────────────────────────────────
│ 📊 Export Opportunities                                                            [×]
├────────────────────────────────────────────────────────────────────────────────────────────
│
│  Format Selection:
│  ◉ CSV Export (Excel-compatible)    ○ JSON Export    ○ PDF Report
│
│  Date Range:
│  ◉ All results (18 opportunities)
│  ○ Last 7 days      ○ Last 30 days     ○ Custom: [Jul 01, 2024] to [Jul 15, 2024]
│
│  Filter by Status:
│  ☑ Accepted (18)    ☐ Rejected (2)    ☐ New/Unreviewed (0)
│
│  ┌────────────────────────────────────────────────────────────────────────────────────
│  │ Fields to Export (Click & Drag to Reorder)
│  ├────────────────────────────────────────────────────────────────────────────────────
│  │ ☑ 1. Organization Name         ☑ 11. Company Size      ☑ 17. Confidence Score
│  │ ☑ 2. Contact Name              ☑ 12. Company Stage     ☑ 18. Signals Found
│  │ ☑ 3. Contact Title             ☑ 13. Funding Amount    ☑ 19. Evidence URLs
│  │ ☑ 4. Company Website           ☑ 14. Hiring Activity   ☑ 20. Next Action
│  │ ☑ 5. Location                  ☑ 15. Opportunity Type  ☑ 21. Date Discovered
│  │ ☑ 6. Industry                  ☑ 16. Why Relevant      ☐ 22. Raw Signal Data
│  │ ☑ 7. Company Email             ☑ 8. Contact Email      ☑ 9. Contact Phone
│  │ ☑ 10. LinkedIn URL
│  │
│  │  [↑ Move Up]  [↓ Move Down]  [Remove Selected]
│  │
│  └────────────────────────────────────────────────────────────────────────────────────
│
│  Preview of Export Format:
│  ┌────────────────────────────────────────────────────────────────────────────────────
│  │  Organization | Contact | Email | Website | Confidence | Signals | Evidence...
│  │  TechStart Inc | Sarah Chen | sarah@... | techstart.io | 89% | 4 | http://...
│  │  Bright Design | Janet Smith | janet@... | brightdes... | 82% | 3 | http://...
│  │
│  └────────────────────────────────────────────────────────────────────────────────────
│
│  Options:
│  ☑ Include headers  ☑ Include confidence scores  ☑ Include all evidence URLs
│  ☐ Remove duplicates  ☑ Sort by confidence (highest first)
│
│                                     [Cancel]  [Preview PDF]  [⬇ Download CSV]
│
└────────────────────────────────────────────────────────────────────────────────────────────
```

---

## Organization Profile & Context

```
┌──────────────────────────────────────────────────────────────────────────────────────────────
│ ⚙️ Organization Settings > Profile
├──────────────────────────────────────────────────────────────────────────────────────────────
│
│  ┌────────────────────────────────────────────┐  ┌──────────────────────────────────────
│  │  ORGANIZATION PROFILE                      │  │  CONTEXT QUICK VIEW
│  │  ══════════════════════════════════════════ │  │  ═════════════════════════════════
│  │                                             │  │
│  │  Organization Name: *                       │  │  Services:
│  │  ┌────────────────────────────────────┐    │  │  • Brand Strategy
│  │  │  Studio Creative      [Edit] [✓]   │    │  │  • Digital Experience Design
│  │  └────────────────────────────────────┘    │  │  • Creative Direction
│  │                                             │  │
│  │  Description:                               │  │  Markets:
│  │  ┌────────────────────────────────────┐    │  │  • Growth-Stage Startups
│  │  │  Award-winning brand strategy and  │    │  │  • Tech & SaaS Companies
│  │  │  design studio specializing in     │    │  │  • Fintech
│  │  │  identity systems and digital      │    │  │
│  │  │  experiences for growth-stage      │    │  │  Regions:
│  │  │  startups.                         │    │  │  • North America (US, Canada)
│  │  └────────────────────────────────────┘    │  │  • Western Europe (UK, EU)
│  │                                             │  │
│  │  Website:                                   │  │  Exclusions:
│  │  ┌────────────────────────────────────┐    │  │  • Enterprises > 500 employees
│  │  │  www.studiocreative.com  [Verify ↗]│    │  │  • Non-tech companies
│  │  └────────────────────────────────────┘    │  │
│  │                                             │  │  [Manage All Context ↗]
│  │  Industry:                                  │  │
│  │  ┌────────────────────────────────────┐    │  │
│  │  │  Creative Services       [Change ▼] │    │  │
│  │  └────────────────────────────────────┘    │  │
│  │                                             │  │
│  │  Primary Location:                          │  │
│  │  ┌────────────────────────────────────┐    │  │
│  │  │  Los Angeles, CA         [Edit]    │    │  │
│  │  └────────────────────────────────────┘    │  │
│  │                                             │  │
│  │  Default Research Region:                   │  │
│  │  ┌────────────────────────────────────┐    │  │
│  │  │  North America (US, Canada, Mexico)│    │  │
│  │  │  [Edit]                            │    │  │
│  │  └────────────────────────────────────┘    │  │
│  │                                             │  │
│  │  Brand Positioning:                         │  │
│  │  ┌────────────────────────────────────┐    │  │
│  │  │  Premium brand design for           │    │  │
│  │  │  ambitious startups seeking to      │    │  │
│  │  │  stand out and scale globally       │    │  │
│  │  └────────────────────────────────────┘    │  │
│  │                                             │  │
│  └────────────────────────────────────────────┘  └──────────────────────────────────────
│
│                                [← Back]  [Save Changes]  [Export]  [Delete Organization]
│
└──────────────────────────────────────────────────────────────────────────────────────────────
```

---

## Layout Principles & Grid System

```
DESKTOP LAYOUT (1200px+)
┌────────────────────────────────────────────────────────────────────────────────────────
│                      HEADER & NAVIGATION (64px)
├──────────────────────┬────────────────────────────────────────────────────────────────
│                      │
│   SIDEBAR            │              MAIN CONTENT AREA (flexible)
│   (240px)            │              ┌──────────────────────────────────────
│                      │              │ Content Grid (12 columns × n rows)
│   • Projects         │              │ 16px gutter spacing
│   • Navigation       │              │ Cards: max-width 800px
│   • Filters          │              │ Tables: full width with h-scroll
│   • Settings         │              │
│                      │              └──────────────────────────────────────
│                      │
└──────────────────────┴────────────────────────────────────────────────────────────────

TABLET LAYOUT (768-1023px)
┌────────────────────────────────────────────────────────────────────────
│                    HEADER (64px)                      [☰ MENU]
├────────────────────────────────────────────────────────────────────────
│
│              MAIN CONTENT AREA (full width)
│              ┌────────────────────────────────────────
│              │ Cards: 100% width
│              │ Stack vertically
│              │ Touch-optimized buttons
│              │
│              └────────────────────────────────────────
│
└────────────────────────────────────────────────────────────────────────

MOBILE LAYOUT (< 768px)
┌──────────────────────────────────────
│  HEADER (56px)         [☰ MENU]
├──────────────────────────────────────
│
│ CONTENT (100% width)
│ ┌────────────────────────────────
│ │ Single column
│ │ 16px margins
│ │ Large touch targets (48px min)
│ └────────────────────────────────
│
└──────────────────────────────────
```

---

## Color & Status System

```
CONFIDENCE LEVELS
┌─────────────────────────────────────────────────────────
│ ████████░░░░░░░░░░░░  40% — Low confidence             Red (#EF4444)
│ ████████████████░░░░  65% — Medium confidence          Orange (#F97316)
│ ████████████████████  89% — High confidence            Green (#22C55E)
│ ████████████████████  95% — Very High confidence       Teal (#14B8A6)
└─────────────────────────────────────────────────────────

STATUS INDICATORS
✓ PASSED / QUALIFIED              Green (#22C55E)
○ PENDING / OPTIONAL              Gray (#9CA3AF)
● IN PROGRESS                     Blue (#3B82F6)
✗ FAILED / REJECTED               Red (#EF4444)
? UNKNOWN / NEEDS REVIEW          Yellow (#FBBF24)

BUTTON HIERARCHY
[Primary Action]          Blue background, white text
[Secondary Action]        Gray background, dark text
[Danger Action]           Red background, white text
[Ghost Action]            Transparent, dark text, border
```

---

## Component Spacing & Sizing

```
SPACING SCALE (8px base)
xs: 4px    (fine details)
sm: 8px    (tight spacing)
md: 16px   (default spacing)
lg: 24px   (sections)
xl: 32px   (major divisions)
2xl: 48px  (full sections)

INPUT & FORM SIZING
Label: 12px, medium weight, gray
Input: 40px height, 12px padding
Error: 12px, red text
Button: 40px height (mobile 48px), 16px padding horizontal

TABLE & LIST SIZING
Row height: 48px (mobile 56px)
Cell padding: 12px
Icon size: 24px
Avatar: 40px
```

This wireframe set provides developers with a complete visual reference
for building Papertrail's UI!

# Papertrail TLDR

**What is Papertrail?**
An AI-guided research platform that converts user objectives into structured, evidence-backed opportunity collections. Users describe what they're looking for (e.g., "find potential clients"), Papertrail helps refine the objective, discovers candidates, evaluates them against an approval rubric, and returns qualified results.

**Not:**
- A web scraper or contact database
- A generic lead generator
- Conference research-specific
- LinkedIn automation tool

**Core Flow:**
```
User describes objective → AI clarifies → User approves brief → 
AI proposes rubric → User approves → AI proposes research strategy → 
User approves → Research executes → AI qualifies candidates → 
User reviews opportunities → Exports results
```

## MVP Scope

**Input:** One approved project objective, rubric, and research strategy

**Output:** 20 qualified opportunities with:
- Factual signals supporting relevance
- Evidence sources and URLs
- Why the opportunity matters now
- Relevant decision-maker contact info
- Confidence score
- Recommended next action

**Quality test:** A meaningful % of opportunities should be worth pursuing

**Business result:** At least one legitimate conversation or relationship from real-world test

## Key Architecture

**Organizational Model:**
- User → belongs to Organization(s)
- Organization → has Members, Profile, Context, Projects
- Project → has Objective Versions, Rubrics, Research Runs, Opportunities
- Research Run → Findings → Evidence + Signals → Qualified Opportunities

**Research Pipeline:**
```
Web Search → URL Fetching → Evidence Extraction → Entity Resolution → 
Signal Detection → Rubric Evaluation → Opportunity Creation
```

**Technology Stack:**
- Backend: Laravel 13, Laravel AI SDK
- Frontend: Vue 3 + Inertia.js + Tailwind CSS v4
- Queue: Laravel Jobs for async execution
- AI: Structured agents with defined inputs/outputs

## Key Design Principles

1. **Start with objective, not data** — Research is objective-driven
2. **Evidence before conclusion** — Only factual signals support qualification
3. **Streamlined setup** — One opening question, dynamic follow-ups, suggested answers
4. **User approves before research** — Research cannot begin without explicit approval
5. **Keep AI within boundaries** — Map unsupported objectives to similar supported ones
6. **Small, focused agents** — One agent per responsibility (Objective Discovery, Rubric, Strategy, Qualification, etc.)
7. **Flexible data model** — Supports multiple objective categories and opportunity types
8. **Reject, don't delete** — Preserve feedback for learning; allow reversal of mistakes

## UI Screens

- Projects Dashboard (list with filters/sort)
- Create Project (organization context inheritance)
- Objective Conversation (chat + completion checklist)
- Objective Brief Review (structured summary)
- Rubric Review (required/preferred criteria)
- Research Strategy Review (search concepts, sources, limits)
- Research Progress (live status updates)
- Opportunity Results (list, filtering, bulk actions)
- Opportunity Detail (evidence, signals, rubric evaluation, contact path)
- Export Dialog (CSV with customizable fields)
- Organization Profile (reusable context for projects)

## 8 Development Phases

1. **Organization & Project Foundation** — Auth, orgs, memberships, context, policies
2. **Objective Conversation** — AI discovery agent, checklist, suggested answers
3. **Rubric & Strategy** — Rubric & strategy agents, approval UI, capability checking
4. **Research Engine** — Run orchestration, queues, steps, progress tracking
5. **Public Web Research** — Web search, URL fetching, evidence extraction
6. **Signals & Qualification** — Entity resolution, signal analysis, rubric evaluation
7. **Opportunity Review & Export** — List, detail, evidence viewer, reject, CSV export
8. **Hardening** — Tests, cost controls, logging, failover, performance, auth review

## MVP Non-Goals

- Autonomous browser automation (public sources only)
- Authenticated LinkedIn/Facebook access
- Automated email or contact form submission
- CRM pipeline management
- Recurring scheduled research
- Chrome extension
- Large-scale scraping infrastructure

## Key Open Decisions

- Supported objective categories (just Potential Client or also Partnership/Affiliate?)
- Required evidence count per opportunity
- Research limits (max candidates, max cost, max duration)
- Evidence retention (screenshots and full snapshots required?)
- Export field selection
- Rejection feedback mechanism

---

**Status:** Architecture planning complete. Ready for Phase 1 (Foundation) implementation.

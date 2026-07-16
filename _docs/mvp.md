The Laravel AI SDK section below is aligned with the current Laravel 13 documentation: agents, persistent conversations, structured outputs, application tools, queued execution, provider web tools, failover, events, and test fakes.

# Papertrail

## Objective-Driven Opportunity Intelligence

> Living MVP specification  
> Stack: Laravel 13, Vue, Inertia.js  
> Status: Product discovery and architecture planning

---

## Project Summary

Papertrail is an AI-guided research platform that converts a user's objective into a structured, evidence-backed collection of opportunities.

A user begins by describing what they are trying to accomplish in natural language.

Examples:

- Find potential clients for a service.
- Find organizations preparing to launch a product.
- Find possible affiliate partners.
- Find companies showing signs of growth.
- Find people or organizations worth starting a relationship with.
- Find opportunities connected to an industry, event, market, or public activity.

Papertrail helps the user clarify the objective, identify what would make a result valuable, determine where relevant evidence may exist, propose a research strategy, search multiple public sources, and qualify the resulting people or organizations.

The primary output is not a large contact database.

The primary output is a smaller set of qualified opportunities that explain:

- Who or what was discovered.
- Why the result matches the objective.
- Why the result may matter now.
- Which factual signals support the result.
- Where the evidence came from.
- What information remains uncertain.
- What the user may want to do next.

Papertrail should prioritize quality over quantity.

---

## Core Product Definition

Papertrail is not primarily:

- A web scraper.
- A contact database.
- A generic lead generator.
- A conference research tool.
- A LinkedIn automation tool.
- A fully autonomous outreach bot.

Papertrail is:

> An objective-driven opportunity intelligence system that uses AI, structured workflows, research capabilities, and evidence to determine who or what may be worth pursuing.

The system must remain broader than any one example.

Conference exhibitors are one possible research strategy.

Product launches, hiring activity, funding announcements, partnerships, public social activity, industry directories, company websites, and other public signals may support different objectives.

The application's models and workflows must not be designed specifically around conferences.

---

## Core Product Flow

```text
User describes an objective
        ↓
AI helps clarify and improve the objective
        ↓
Papertrail tracks whether required criteria are present
        ↓
AI proposes an Objective Brief
        ↓
User approves the Objective Brief
        ↓
AI proposes a qualification rubric
        ↓
User approves the rubric
        ↓
AI proposes a research strategy
        ↓
User approves the strategy
        ↓
Papertrail creates a Research Run
        ↓
Research capabilities search multiple sources
        ↓
Papertrail stores findings and evidence
        ↓
AI interprets factual signals
        ↓
Candidates are evaluated against the rubric
        ↓
Qualified opportunities are created
        ↓
User reviews, rejects, keeps, or exports opportunities
```

## Product Principles

### 1. Start With an Objective

Every project begins with an objective.

The objective controls:

- What the system searches for.
- Which entities matter.
- Which sources may be useful.
- Which signals are relevant.
- What qualifies a result.
- What disqualifies a result.
- How much evidence is needed.
- When the research should stop.
- What details should appear on an opportunity card.

The system must not begin by scraping data and then ask the user what to do with it.

### 2. Help the User Plan

Users may not initially know:

- Exactly what they are looking for.
- Which opportunity category fits.
- Which signals matter.
- Which demographics to target.
- Which sources should be searched.
- Which search phrases will work.
- What should qualify or disqualify a result.

Papertrail should help the user answer those questions.

It should:

- Suggest possible answers.
- Explain why a detail matters.
- Offer selectable recommendations.
- Ask focused follow-up questions.
- Identify missing criteria.
- Help turn vague intentions into researchable objectives.

The experience should feel like guided planning, not form completion.

### 3. Keep the Setup Streamlined

The objective interview is important, but it must not become an endless questionnaire.

The system should:

- Ask one broad opening question.
- Extract as much information as possible from the response.
- Pre-fill likely answers and criteria.
- Offer selectable suggestions.
- Ask only questions that block meaningful research.
- Use dynamic follow-up questions only when necessary.
- Show the user what information is still missing.
- Allow the user to decide when to proceed.

The AI should not repeatedly ask for information that can be inferred or selected from suggestions.

### 4. Keep AI Within Supported Boundaries

The conversational interface may accept any objective, but Papertrail must not pretend that it can successfully execute every objective.

The system should map the user's request to a supported objective category and available research capabilities.

```
User describes an objective
        ↓
AI interprets the objective
        ↓
Papertrail maps it to a supported category
        ↓
Papertrail checks available capabilities
        ↓
Supported:
    propose a research strategy

Not supported:
    explain the limitation
    suggest the closest supported approach
    allow the user to revise the objective
```

Papertrail should never claim that it can research an objective when the required capabilities do not exist.

### 5. Evidence Before Conclusion

Papertrail should distinguish between:

- Confirmed facts.
- Strong inferences.
- Weak inferences.
- Missing information.
- Conflicting information.

The MVP should prioritize objective factual signals.

Examples:

- A company appears in an official directory.
- A dated company post announces a product launch.
- A public job listing shows that the company is hiring.
- A team page identifies a decision-maker.
- A public announcement confirms attendance at an event.
- A press release confirms expansion.
- A company website confirms a new service or initiative.

Subjective observations such as "their branding looks weak" should not be a core qualification signal in the first MVP unless supported by a defined and approved rubric.

### 6. The User Gives the Final Go-Ahead

Papertrail may indicate that an objective is complete.

It may display:

- ✓ Desired outcome
- ✓ Opportunity category
- ✓ Target description
- ✓ Qualification criteria
- ✓ Exclusions
- ✓ Evidence requirements
- ✓ Research strategy

However, the user decides when the project is ready.

Research does not begin until the user explicitly approves the Objective Brief, rubric, and strategy.

## MVP Scope

### MVP Goal

The MVP should prove that Papertrail can:

- Accept a broad objective through a conversational interface.
- Help the user make the objective specific and researchable.
- Build a structured Objective Brief.
- Suggest an objective-specific qualification rubric.
- Suggest an objective-specific research strategy.
- Search multiple public sources.
- Collect structured findings and evidence.
- Evaluate candidates against the approved rubric.
- Produce useful opportunity cards.
- Allow the user to remove irrelevant cards.
- Export qualified opportunities.

### MVP Business Test

**Input:**
One approved project objective, rubric, and research strategy.

**Output:**
A target number of qualified opportunities with factual evidence,
an explanation of relevance, and enough context for the user to
decide whether the opportunity is worth pursuing.

**Quality test:**
A meaningful percentage of returned opportunities should be worth
further investigation or contact.

**Business result:**
At least one legitimate conversation or useful relationship should
result from an initial real-world test.

### MVP Endpoint

The MVP ends when qualified opportunities are:

- Created.
- Displayed.
- Reviewed.
- Rejected or retained.
- Exportable.

The MVP does not need to automatically contact anyone.

## Beyond MVP

Later phases may include:

- AI-generated outreach drafts.
- Contact form preparation.
- Email integration.
- CRM-style opportunity stages.
- Assignment to team members.
- Follow-up reminders.
- Reply tracking.
- Conversation tracking.
- Meeting outcomes.
- Conversion reporting.
- Recurring research schedules.
- Authenticated source access.
- Chrome extension support.
- Learning from accepted and rejected opportunities.

## Initial Users and Tenancy

### Initial Deployment

Papertrail will be used internally first.

However, the application should be architected so that multiple organizations and teams can use it later.

The application should not assume that:

- A user owns all data directly.
- Every project belongs only to one user.
- Organization context is private to one user.
- Only one person may work on a project.

### Ownership Structure

```
User
  └── belongs to many Organizations

Organization
  ├── has many Members
  ├── has one Profile
  ├── has many Context Items
  ├── has many Projects
  └── owns shared research data

Project
  ├── belongs to an Organization
  ├── is created by a User
  ├── has many Objective Versions
  ├── has many Research Strategy Versions
  ├── has many Research Runs
  └── has many Opportunities
```

### Suggested Organization Roles

- owner
- admin
- member
- viewer

Full role management is not required for the first internal release, but the membership model should exist.

### Organization Context

#### Purpose

An organization should be able to store reusable context so users do not have to explain the same business repeatedly.

Examples:

- Organization description.
- Website.
- Services.
- Products.
- Industries served.
- Target markets.
- Geographic preferences.
- General exclusions.
- Past clients.
- Case studies.
- Brand positioning.
- Existing offers.
- Team expertise.

#### Organization Profile

Suggested core fields:

```
organization_profiles

id
organization_id
name
description
website
industry
primary_location
positioning
default_geography
created_at
updated_at
```

#### Organization Context Items

Flexible context should use individual records rather than one large unstructured JSON document.

```
organization_context_items

id
organization_id
type
name
value
metadata
is_active
created_by_user_id
created_at
updated_at
```

Possible types:

- service
- product
- target_market
- case_study
- past_client
- geographic_preference
- exclusion
- competitor
- positioning
- team_expertise
- offer
- other

Example:

```
type: service
name: Brand Identity
value: Brand strategy, visual identity, and brand systems.

type: case_study
name: Regional HR Association
value: Website and identity redesign for a professional association.

type: exclusion
name: Large Enterprise
value: Do not prioritize organizations with more than 5,000 employees.
```

### Project Context Inheritance

When creating a project, Papertrail should offer relevant organization context.

Example:

```
Papertrail found the following information in your organization profile:

Services
- Brand identity
- Website design
- Event graphics

Target markets
- Professional associations
- Small and mid-sized organizations

Would you like to use this context?

[ Use All ]
[ Select Items ]
[ Do Not Use ]
```

### Snapshot Inherited Context

Projects must snapshot inherited context.

A research run should not silently change because the organization profile was edited later.

```
Organization Context
        ↓
User selects relevant context
        ↓
Papertrail creates Project Context Items
        ↓
Objective and research runs use the project snapshot
```

Suggested model:

```
project_context_items

id
project_id
source_context_item_id nullable
type
name
value
metadata
source
created_at
updated_at
```

Possible sources:

- organization
- user
- ai_suggested
- project_specific

## Project Definition

A Project is a persistent research definition.

A Project is not one individual execution.

```
Project
  ├── Objective
  ├── Project Context
  ├── Qualification Rubric
  ├── Research Strategy
  ├── Research Run: July
  ├── Research Run: August
  └── Research Run: September
```

The same project may be run multiple times.

Each research run is dated and preserves the versions of the objective, rubric, and strategy that were used.

### Suggested Project Fields

```
projects

id
organization_id
created_by_user_id
name
description
status
visibility
current_objective_version_id nullable
current_strategy_version_id nullable
created_at
updated_at
archived_at nullable
```

Suggested statuses:

- draft
- defining_objective
- objective_ready
- defining_strategy
- ready
- researching
- completed
- archived

## Objective Discovery

### Starting Experience

The MVP begins with an open conversation.

```
Papertrail:
What are you trying to accomplish?

User:
I want to find opportunities to grow my agency.
```

Papertrail then helps the user make the objective actionable.

The initial implementation should use the open conversational experience.

A future hybrid experience may map the conversation to a predefined supported workflow.

### Objective Completion Checklist

The interface should display a visible checklist alongside the conversation.

Possible checklist items:

- Desired outcome
- Opportunity category
- Specific opportunity description
- Target entity description
- Relevant context
- Time horizon
- Qualification criteria
- Exclusions
- Evidence requirements
- Result quantity
- Success definition
- Available offer or value exchange

Not every project must require every possible field.

Checklist requirements should depend on:

- The objective category.
- The selected research strategy.
- The capabilities required.
- The evidence needed to qualify a result.

### Objective Interview Rules

The Objective Discovery Agent should:

- Ask a broad first question.
- Extract multiple details from each answer.
- Avoid asking one question per database field.
- Suggest reasonable answers when information is missing.
- Prefer selectable suggestions where possible.
- Ask dynamic follow-up questions when the objective requires them.
- Explain why a blocking detail is needed.
- Show progress through the checklist.
- Tell the user when enough information is available.
- Wait for the user to approve the result.

### Unknown Answers

For the MVP, when the user does not know an answer, Papertrail should recommend possible options.

Example:

```
Papertrail:
Which signals might show that an organization needs your service?

User:
I do not know.

Papertrail:
Here are some possible signals:

[ Recently launched a product ]
[ Hiring marketing employees ]
[ Announced an expansion ]
[ Participating in an industry event ]
[ Publicly requesting recommendations ]
[ Let Papertrail recommend a combination ]
```

Future versions may perform preliminary research to determine which signals are most predictive.

## Objective Categories

### Category Structure

Papertrail should use both:

- A supported system category.
- A specific user-defined description.

Example:

```
System category:
Partnership

Specific opportunity type:
Affiliate partners with an audience interested in personal development.
```

This provides system boundaries without losing the user's intent.

### Candidate Supported Categories

Possible initial categories:

- Potential Client
- Partnership
- Affiliate
- Vendor
- Recruiting
- Investor
- Media or Speaking
- Community or Strategic Connection

The final MVP category list remains to be decided.

A conservative MVP may support:

- Potential Client
- Partnership
- Affiliate

All three share a related research pattern:

```
Find a person or organization
        ↓
Find current factual signals
        ↓
Confirm relevance
        ↓
Identify a useful contact path
```

### Custom Objectives

A custom objective should not automatically bypass system limits.

```
Custom objective submitted
        ↓
AI interprets the request
        ↓
Papertrail maps it to a supported category
        ↓
Papertrail checks available capabilities
        ↓
If supported:
    map it to a category

If partially supported:
    propose a narrower supported version

If unsupported:
    explain what is missing
```

## Objective Brief

After the interview, Papertrail produces a structured Objective Brief.

Example:

```
PROJECT OBJECTIVE

Outcome:
Find organizations that may become valuable agency clients.

System category:
Potential Client

Specific opportunity type:
Organizations showing a current need for launch or growth support.

Target entities:
Small and mid-sized organizations with active marketing initiatives.

Relevant signals:
- Product launch
- New marketing hire
- Expansion
- Funding
- Event participation
- Public request for help

Qualification criteria:
- Identifiable organization
- Current factual signal
- Relevant service fit
- Supporting evidence

Exclusions:
- Other agencies
- Very large enterprises
- Organizations outside selected regions

Output target:
20 qualified opportunities

Success definition:
At least five results are worth pursuing.
```

The user must approve the Objective Brief before Papertrail creates a research strategy.

### Objective Versioning

Objectives should be versioned.

```
project_objective_versions

id
project_id
version
status
summary
outcome
system_category
specific_opportunity_type
target_description
time_horizon
desired_result_count nullable
success_definition
structured_data
approved_by_user_id nullable
approved_at nullable
created_at
updated_at
```

The structured_data field may hold category-specific details that do not yet justify dedicated columns.

Important objective information should still use explicit columns or related records where practical.

## Qualification Rubric

### Purpose

Each project requires a rubric that explains what makes a candidate a qualified opportunity.

The rubric is project-specific.

The AI should propose the initial rubric based on:

- The objective.
- Organization context.
- Opportunity category.
- Available capabilities.
- User answers.
- Evidence requirements.

The user reviews and approves the rubric.

### MVP Rubric Format

Keep the first implementation simple.

Criteria may be:

- required
- preferred

Example:

**Required**

- ✓ Must be an identifiable entity
- ✓ Must match the target opportunity type
- ✓ Must have at least one current factual signal
- ✓ Must have supporting evidence

**Preferred**

- ○ Has an identifiable decision-maker
- ○ Has a public contact path
- ○ Has multiple relevant signals
- ○ Activity occurred within the preferred time period

### Future Rubric Features

Later versions may add:

- Numeric weights.
- Minimum scores.
- Criterion-specific evidence requirements.
- Mandatory conditions.
- Negative criteria.
- Different scoring scales.
- Criterion-specific freshness windows.
- User-created rubric templates.
- Organization-wide default rubrics.

### Suggested Rubric Model

```
project_rubric_criteria

id
project_id
objective_version_id
name
description
criterion_type
evaluation_method
is_required
sort_order
configuration
created_by
approved_at nullable
created_at
updated_at
```

Possible criterion_type values:

- boolean
- preferred
- score
- exclusion

For the MVP, use:

- boolean
- preferred
- exclusion

## Research Strategy

### Purpose

The research strategy explains how Papertrail proposes to accomplish the objective.

The strategy should be visible to the user before execution.

It should include:

- What Papertrail will search for.
- Which entities are being targeted.
- Suggested demographics.
- Suggested search concepts.
- Suggested search terms.
- Relevant platforms and websites.
- Source priority.
- Time period.
- Geography.
- Result quantity.
- Evidence requirements.
- Stop conditions.
- Known limitations.

### Example Research Strategy

**Objective:**
Find organizations that may need product-launch support.

**Target:**
Small and mid-sized companies preparing to release a product.

**Search concepts:**
- New product announcement
- Launching soon
- Coming this fall
- Introducing our new product
- Now accepting preorders
- Product launch
- New collection announcement

**Potential sources:**
- General web search
- Company websites
- Public LinkedIn content
- Public Facebook content
- Industry websites
- News and press releases
- Public directories
- Event websites

**Process:**
1. Discover organizations showing relevant public activity.
2. Confirm the activity using a dated source.
3. Resolve the organization and its primary website.
4. Gather supporting information.
5. Identify a relevant person when possible.
6. Evaluate the candidate against the approved rubric.
7. Create an opportunity when required criteria pass.

### Source Selection

Papertrail should not search the same sites for every objective.

The AI should recommend where relevant information is likely to exist.

Possible standard source families:

- General search engines
- Company websites
- Public LinkedIn pages and posts
- Public Facebook pages and posts
- Public X posts
- Industry publications
- Press releases
- Job boards
- Event directories
- Association directories
- Public government data
- YouTube
- Maps and business listings
- Public community websites

The source mix must remain objective-specific.

### Strategy Approval

The user should be able to:

- [ Approve Strategy ]
- [ Ask AI to Revise ]
- [ Edit Basic Settings ]

Basic editable settings may include:

- Search terms.
- Target demographics.
- Geography.
- Time period.
- Result quantity.
- Included sources.
- Excluded sources.

The MVP does not need to expose every low-level query generated during execution.

### Strategy Versioning

```
research_strategy_versions

id
project_id
objective_version_id
version
status
summary
target_result_count nullable
time_range_start nullable
time_range_end nullable
geography
source_configuration
search_concepts
stop_conditions
approved_by_user_id nullable
approved_at nullable
created_at
updated_at
```

## Research Runs

### Definition

A Research Run is one dated execution of an approved project definition.

```
Project
  ├── Research Run 1
  ├── Research Run 2
  └── Research Run 3
```

Each run records:

- Objective version.
- Rubric version.
- Research strategy version.
- User who initiated it.
- Start and completion time.
- Status.
- Results.
- Cost.
- Errors.
- Capabilities used.
- Evidence collected.

### Suggested Research Run Model

```
research_runs

id
project_id
initiated_by_user_id
objective_version_id
strategy_version_id
status
started_at nullable
completed_at nullable
target_result_count nullable
qualified_result_count
finding_count
estimated_cost nullable
actual_cost nullable
error_message nullable
metadata
created_at
updated_at
```

Suggested statuses:

- pending
- planning
- queued
- running
- paused
- completed
- partially_completed
- failed
- cancelled

### Research Execution Behavior

After the user approves the strategy:

```
Create Research Run
        ↓
Create Research Run Steps
        ↓
Queue executable steps
        ↓
Collect findings
        ↓
Store evidence
        ↓
Resolve entities
        ↓
Detect signals
        ↓
Evaluate rubric
        ↓
Create or update opportunities
        ↓
Complete run
```

The process should normally run automatically.

The system should stop only when:

- A required detail is missing.
- No supported capability can continue.
- A source requires authentication.
- A configured cost or request limit is reached.
- The run encounters a non-recoverable failure.
- Human approval is specifically required.

## Findings, Evidence, Signals, and Opportunities

These concepts should remain separate.

### Research Finding

A finding is raw or intermediate information discovered during a run.

Examples:

- A search result.
- A company name.
- A public profile.
- A directory entry.
- A possible relationship.
- A page containing a useful statement.

A finding is not automatically an opportunity.

```
research_findings

id
research_run_id
capability_run_id nullable
finding_type
subject_type nullable
subject_id nullable
title
summary
data
status
created_at
updated_at
```

### Evidence

Evidence supports a factual conclusion.

Suggested fields:

```
evidence

id
research_run_id
finding_id nullable
entity_id nullable
source_type
source_url
source_title
published_at nullable
collected_at
relevant_text
content_snapshot nullable
screenshot_path nullable
content_hash nullable
interpretation
confidence
metadata
created_at
updated_at
```

Minimum MVP evidence:

- Source URL.
- Page title.
- Relevant extracted text.
- Collection date.
- AI interpretation.
- Confidence.

Whether screenshots and full page snapshots are required remains an open decision.

### Signal

A signal is a factual event, behavior, relationship, or change supported by evidence.

```
signals

id
research_run_id
entity_id
signal_type
name
description
observed_at nullable
expires_at nullable
confidence
metadata
created_at
updated_at
```

A signal may have many pieces of evidence.

```
evidence_signal

evidence_id
signal_id
```

Signal types must not be hard-coded only for sales or conference research.

Examples:

- event_participation
- product_launch
- hiring
- funding
- expansion
- leadership_change
- new_partnership
- public_request
- content_activity
- directory_membership
- speaking_appearance
- sponsorship
- new_location
- other

### Entity

An entity is a person, organization, event, product, publication, or other identifiable subject.

```
entities

id
organization_id
entity_type
canonical_name
description nullable
primary_url nullable
location nullable
metadata
created_at
updated_at
```

Possible entity types:

- person
- organization
- event
- product
- publication
- community
- other

### Entity Identity

The same entity may have multiple public identities.

```
entity_identities

id
entity_id
identity_type
value
url nullable
confidence
metadata
created_at
updated_at
```

Examples:

- Website domain.
- LinkedIn URL.
- X handle.
- Facebook page.
- Email address.
- Directory identifier.
- Company registration identifier.

### Opportunity

An opportunity is a qualified result worth showing the user.

It may represent:

- A potential client.
- A partner.
- An affiliate.
- A vendor.
- A hire.
- An investor.
- A media contact.
- A strategic relationship.

The schema must remain flexible.

```
opportunities

id
organization_id
project_id
primary_entity_id
first_seen_research_run_id
opportunity_type
title
summary
status
confidence
current_score nullable
why_relevant
why_now nullable
possible_value
recommended_next_action nullable
details
created_at
updated_at
rejected_at nullable
```

Suggested statuses:

- new
- reviewing
- accepted
- rejected
- exported
- archived

### Opportunity and Research Runs

The same opportunity may appear in multiple research runs.

Do not create a duplicate card every time.

```
opportunity_research_run

id
opportunity_id
research_run_id
score nullable
evaluation
observed_at
created_at
updated_at
```

This allows Papertrail to show:

```
First discovered:
July 1

Seen again:
August 1

New signal:
The organization announced a product launch.

Previous evaluation:
72

Current evaluation:
89
```

### Rubric Evaluation

```
opportunity_criterion_evaluations

id
opportunity_id
research_run_id
rubric_criterion_id
result
score nullable
reason
confidence
evidence_summary
created_at
updated_at
```

Possible MVP results:

- passed
- failed
- preferred_match
- unknown
- not_evaluated

### Opportunity Card Contents

The final card should be generated from available structured data.

Possible fields:

- Opportunity title
- Opportunity type
- Primary person or organization
- Why the result matches
- Why the timing matters
- Observed factual signals
- Supporting evidence
- Relevant relationships
- Possible need or value exchange
- Relevant person or decision-maker
- Available contact path
- Confidence
- Rubric evaluation
- Recommended next action
- Additional structured details

Not every objective will use every field.

The interface should render common fields while allowing category-specific details from the details structure.

## Opportunity Review

### Default Behavior

The system should perform the research and return completed opportunity cards.

The user reviews the resulting cards afterward.

The MVP should not require the user to approve each candidate before deeper research.

### Reject Instead of Permanently Delete

When a user removes a card, Papertrail should normally reject it instead of permanently deleting the record.

Benefits:

- Prevent the same result from being returned repeatedly.
- Preserve feedback.
- Improve future research.
- Keep an audit trail.
- Allow accidental rejection to be reversed.

Suggested rejection reasons:

- Not relevant
- Wrong organization
- Wrong person
- Weak signal
- Insufficient evidence
- Duplicate
- Bad timing
- Already known
- Do not contact
- Other

Suggested model:

```
opportunity_reviews

id
opportunity_id
user_id
decision
reason
notes nullable
created_at
updated_at
```

## Export

Export is part of the MVP.

Recommended first format:

**CSV**

Possible exported fields:

- Project
- Research run date
- Opportunity type
- Opportunity title
- Person
- Organization
- Website
- Why relevant
- Why now
- Signals
- Evidence URLs
- Confidence
- Decision-maker
- Contact path
- Recommended next action
- Status

JSON may be available internally for debugging and future integrations.

Excel and PDF exports may come later.

## Application Architecture

### High-Level Architecture

```
Vue + Inertia.js Interface
        ↓
Laravel Controllers / Actions
        ↓
Domain Services
        ↓
Laravel AI SDK Agents
        ↓
Workflow and Queue Jobs
        ↓
Research Capabilities and Tools
        ↓
External Sources / Browser Service / APIs
        ↓
Findings, Evidence, Signals, Opportunities
```

### Frontend

**Technology:**

- Vue
- Inertia.js
- Laravel routes and controllers

**Primary screens:**

- Projects
- Create Project
- Objective Conversation
- Objective Brief Review
- Rubric Review
- Research Strategy Review
- Research Run Progress
- Opportunity List
- Opportunity Detail
- Evidence Viewer
- Organization Profile
- Export

The earlier wireframes will need to be revised to reflect:

- Generic objectives rather than conference-specific flows.
- The objective checklist.
- Objective category support.
- Rubric approval.
- Research strategy approval.
- Organization context inheritance.
- Multiple research runs.
- Flexible opportunity cards.

### Laravel Domain Services

Suggested services:

- ObjectiveContextBuilder
- ObjectiveReadinessEvaluator
- ObjectiveBriefBuilder
- SupportedObjectiveResolver
- RubricBuilder
- ResearchStrategyBuilder
- ResearchRunManager
- CapabilityRegistry
- CapabilityRouter
- FindingRecorder
- EvidenceCollector
- EntityResolver
- SignalDetector
- OpportunityQualifier
- OpportunityDeduplicator
- OpportunityPresenter
- ExportManager

These services should contain application and domain logic.

AI agents should not replace normal domain services.

### Laravel AI SDK Integration

**Reference:**

https://laravel.com/docs/13.x/ai-sdk#main-content

**Package:**

```
composer require laravel/ai
```

**Publish the SDK configuration and migrations:**

```
php artisan vendor:publish --provider="Laravel\Ai\AiServiceProvider"
php artisan migrate
```

The SDK migrations create conversation storage used by conversational agents.

Papertrail should use the Laravel AI SDK as the AI integration layer rather than building provider-specific requests directly throughout the application.

### AI SDK Responsibilities

**Use the SDK for:**

- Specialized AI agents.
- Persistent objective conversations.
- Structured agent output.
- Application-defined tools.
- Queued AI work.
- Streaming or broadcasting conversation progress.
- Provider-specific web tools when appropriate.
- Provider failover.
- AI events and usage logging.
- Test fakes and assertions.

**Do not use the SDK as a replacement for:**

- Project models.
- Objective versioning.
- Rubric models.
- Research run orchestration.
- Evidence storage.
- Opportunity storage.
- Authorization.
- Business rules.
- Deduplication.
- Cost policies.

### Conversation Storage

The AI SDK conversation tables may store the message history for the Objective Discovery Agent.

Papertrail should still store domain-specific output in its own models.

AI SDK conversation
    = What the user and agent said

Project Objective Version
    = Approved structured business definition

Project Checklist Items
    = What required information is complete

Research Strategy Version
    = Approved execution plan

The project should store the SDK conversation identifier.

project_ai_conversations

id
project_id
agent_type
agent_conversation_id
created_at
updated_at

Possible agent types:

objective_discovery
strategy
research_review
### Proposed AI Agents

Avoid one giant agent responsible for the entire application.

Use focused agents with explicit inputs and structured outputs.

#### 1. Objective Discovery Agent

**Purpose:**

- Conduct the initial conversation.
- Help the user plan.
- Extract known information.
- Suggest missing criteria.
- Recommend supported objective categories.
- Determine checklist completion.
- Produce a draft Objective Brief.

**Characteristics:**

- Conversational
- Persistent conversation
- Structured output
- May read organization and project context
- Does not start research
- Does not approve the objective

**Suggested location:**

`app/Ai/Agents/ObjectiveDiscoveryAgent.php`

**Possible structured output:**

```json
{
  "assistant_message": "Here is what I understand...",
  "supported": true,
  "system_category": "potential_client",
  "specific_opportunity_type": "Organizations preparing to launch products",
  "objective_draft": {},
  "checklist": [],
  "missing_items": [],
  "suggested_answers": [],
  "ready_for_user_approval": false
}
```

#### 2. Objective Brief Agent

**Purpose:**

- Convert the completed conversation into a clean structured Objective Brief.
- Identify contradictions.
- Avoid silently inventing missing requirements.
- Return a version suitable for user approval.

**Suggested location:**

`app/Ai/Agents/ObjectiveBriefAgent.php`

This may be combined with the Objective Discovery Agent during the MVP if the responsibilities remain manageable.

#### 3. Rubric Agent

**Purpose:**

- Propose project-specific required and preferred criteria.
- Explain why each criterion matters.
- Identify criteria that cannot currently be evaluated.
- Return structured rubric data.

**Suggested location:**

`app/Ai/Agents/RubricAgent.php`

**Possible output:**

```json
{
  "criteria": [
    {
      "name": "Current factual signal",
      "description": "The entity must have a dated public activity relevant to the objective.",
      "type": "required",
      "evaluation_method": "evidence"
    }
  ],
  "warnings": []
}
```

#### 4. Research Strategy Agent

**Purpose:**

- Recommend what to search.
- Suggest demographics.
- Suggest search concepts and phrases.
- Suggest sources.
- Match required capabilities to the objective.
- Explain known limitations.
- Propose stop conditions.

**Suggested location:**

`app/Ai/Agents/ResearchStrategyAgent.php`

**Possible output:**

```json
{
  "summary": "Search for organizations with recent product launch activity.",
  "target_description": "...",
  "search_concepts": [],
  "suggested_queries": [],
  "source_families": [],
  "required_capabilities": [],
  "stop_conditions": {},
  "limitations": []
}
```

#### 5. Evidence Extraction Agent

**Purpose:**

- Convert source content into structured findings.
- Identify people, organizations, events, dates, and relationships.
- Extract relevant factual statements.
- Avoid qualifying the final opportunity by itself.

**Suggested location:**

`app/Ai/Agents/EvidenceExtractionAgent.php`

#### 6. Signal Analysis Agent

**Purpose:**

- Review stored evidence.
- Determine whether evidence supports a defined signal.
- Return signal type, date, confidence, and explanation.
- Mark uncertain conclusions as uncertain.

**Suggested location:**

`app/Ai/Agents/SignalAnalysisAgent.php`

#### 7. Opportunity Qualification Agent

**Purpose:**

- Evaluate one candidate against the approved rubric.
- Return one evaluation per criterion.
- Identify missing evidence.
- Recommend qualification or rejection.
- Explain confidence.

**Suggested location:**

`app/Ai/Agents/OpportunityQualificationAgent.php`

#### 8. Opportunity Presentation Agent

**Purpose:**

- Create the user-facing card summary from structured records.
- Explain why the result is relevant.
- Explain why it may matter now.
- Recommend a next action.
- Never introduce unsupported facts.

**Suggested location:**

`app/Ai/Agents/OpportunityPresentationAgent.php`

### Structured Output

All agents that update application state should return structured output.

Do not parse informal prose to create critical records.

Use the Laravel AI SDK structured output interfaces and schemas for:

- Objective drafts.
- Checklist updates.
- Rubric proposals.
- Research strategies.
- Extracted entities.
- Extracted evidence.
- Signal evaluations.
- Opportunity evaluations.

All structured output should still pass Laravel validation before persistence.

```
Agent response
        ↓
Laravel DTO or validated array
        ↓
Application service
        ↓
Database transaction
```

The AI agent should not directly write arbitrary database records.

### AI Tools

Laravel AI SDK tools should expose controlled application capabilities to agents.

**Suggested tools:**

- GetOrganizationContext
- GetProjectContext
- GetCurrentObjectiveDraft
- GetSupportedObjectiveCategories
- GetAvailableCapabilities
- GetApprovedRubric
- GetResearchStrategy
- SearchStoredEvidence
- GetEntityHistory

**Possible future execution tools:**

- SearchWeb
- FetchWebPage
- RunBrowserExtraction
- SearchPublicSocialContent
- ResolveWebsite
- InspectPublicProfile

Tool access should follow least privilege.

For example:

- The Objective Discovery Agent may read organization context.
- It should not launch a full research run.
- The Research Strategy Agent may inspect the capability registry.
- The Qualification Agent may read evidence.
- It should not alter the source evidence.
- The Presentation Agent may read approved opportunity data.
- It should not perform new untracked research.

## Research Capability System

### Capability Definition

A capability is a controlled action Papertrail knows how to perform.

Examples:

search_web
fetch_web_page
extract_entities
find_company_website
search_public_social_activity
find_public_decision_maker
detect_product_launch
detect_hiring_activity
detect_event_participation
resolve_entity
evaluate_rubric

Each capability should define:

Name
Description
Input schema
Output schema
Supported objective categories
Supported source families
Execution mechanism
Cost classification
Authentication requirement
Retry policy
Failure conditions
Evidence produced
Capability Registry

Suggested classes:

app/Research/Capabilities/Capability.php
app/Research/Capabilities/CapabilityRegistry.php
app/Research/Capabilities/CapabilityRouter.php

Possible database model:

capabilities

id
key
name
description
is_enabled
configuration
created_at
updated_at

Code should remain the source of truth for executable behavior.

The database may control enablement and configuration.

Research Execution Mechanisms

Papertrail should support multiple mechanisms.

Capability requested
        ↓
Capability Router
        ↓
Best available execution mechanism

Possible mechanisms:

Direct Laravel HTTP request
Search provider API
Laravel AI provider WebSearch tool
Laravel AI provider WebFetch tool
External platform API
Server-side Playwright browser
Chrome extension
Human-assisted action
Initial MVP Mechanisms

Recommended MVP order:

1. Public web search
2. Direct HTTP page fetching
3. AI-assisted structured extraction
4. Laravel queued jobs
5. Evidence persistence
6. Optional server-side browser automation

Authenticated social access should not be required for the first functioning version unless public-only research proves insufficient.

Chrome Extension

The Chrome extension should not be the center of Papertrail.

It may be added later as a specialized bridge for:

Authenticated websites.
User browser sessions.
Human-assisted research.
Current-page extraction.
User-approved browser actions.
Sources that block remote browsers.

The extension should be one execution mechanism behind the capability system.

Queueing and Workflow Execution

Research should not execute inside a normal web request.

Use Laravel queues for:

AI prompts.
Search jobs.
URL fetching.
Browser tasks.
Evidence extraction.
Entity resolution.
Signal analysis.
Qualification.
Opportunity generation.
Export generation.

**Suggested jobs:**

- InitializeResearchRun
- BuildResearchRunSteps
- ExecuteResearchStep
- ExecuteCapability
- RecordResearchFinding
- ExtractEvidence
- ResolveEntities
- AnalyzeSignals
- EvaluateOpportunityCandidate
- CreateOrUpdateOpportunity
- CompleteResearchRun
- GenerateOpportunityExport

### Research Run Steps

```
research_run_steps

id
research_run_id
parent_step_id nullable
capability_key
name
status
input
output
attempts
started_at nullable
completed_at nullable
error_message nullable
created_at
updated_at
```

Suggested statuses:

- pending
- queued
- running
- completed
- skipped
- failed
- cancelled

### Capability Runs

```
capability_runs

id
research_run_id
research_run_step_id
capability_key
execution_mechanism
status
input
output
provider nullable
model nullable
request_count
token_input nullable
token_output nullable
estimated_cost nullable
actual_cost nullable
started_at nullable
completed_at nullable
error_message nullable
created_at
updated_at
```

This record provides auditability for every AI or research action.

### Progress Updates

The Vue and Inertia interface should show research progress.

Possible approaches:

- Polling for the initial MVP.
- Laravel broadcasting for richer live updates.
- Streaming AI conversation responses during objective setup.
- Broadcasting research run status changes.

Example:

```
✓ Objective approved
✓ Rubric approved
✓ Research strategy approved
✓ Search concepts generated
✓ 84 initial findings discovered
● Resolving 26 organizations
○ Gathering evidence
○ Evaluating opportunities
```

Polling is acceptable for the first MVP if it reduces implementation complexity.

## AI Reliability and Safety

### Validation

Every structured AI response must be:

- Schema constrained.
- Validated by Laravel.
- Checked for required keys.
- Rejected when invalid.
- Retried only under controlled conditions.

### Evidence Grounding

Qualification agents must receive:

- Approved Objective Brief.
- Approved rubric.
- Candidate entity.
- Stored evidence.
- Relevant signals.

They should not freely browse during qualification unless the workflow explicitly creates an additional research step.

### Cost Controls

Each Research Run should support:

- Maximum AI requests
- Maximum web searches
- Maximum fetched pages
- Maximum browser actions
- Maximum candidates researched
- Maximum estimated cost
- Target qualified result count
- Maximum run duration

When a limit is reached:

- Complete with partial results, or
- Pause and request user approval.

The exact MVP behavior remains to be decided.

### Provider Failover

The Laravel AI SDK may use configured provider failover for provider outages, overload, rate limits, or insufficient credits.

Provider failover does not replace application-level retry and error handling.

Papertrail should record:

- Which provider was attempted.
- Which model was used.
- Whether failover occurred.
- Why the primary provider failed.
- Final request outcome.

### AI Usage Events

Listen to relevant Laravel AI SDK events to record:

- Agent prompts.
- Tool invocations.
- Streaming.
- Embedding work if later used.
- Provider activity.
- Failure information.

Usage event handling should feed Papertrail's internal logging and cost reporting.

## Testing Strategy

### Agent Tests

Use Laravel AI SDK agent fakes to test:

- Objective checklist extraction.
- Supported category mapping.
- Structured Objective Brief creation.
- Rubric proposals.
- Research strategy output.
- Signal analysis.
- Opportunity qualification.
- Opportunity presentation.

Tests should assert:

- The correct agent was prompted.
- Queued prompts were queued.
- Structured output was validated.
- Invalid output was rejected.
- No unsupported category started a run.
- No research began without approval.

### Domain Tests

Test normal Laravel services independently of AI providers.

Examples:

- A project belongs to an organization.
- A user must be an organization member to access a project.
- A project can have many research runs.
- A run preserves its objective and strategy versions.
- A rejected opportunity remains recorded.
- An opportunity may appear in multiple research runs.
- Duplicate opportunities are merged.
- Evidence is connected to signals.
- Required rubric failures prevent qualification.

### Workflow Tests

End-to-end workflow test:

```
Create organization
        ↓
Create project
        ↓
Complete objective conversation
        ↓
Approve Objective Brief
        ↓
Approve rubric
        ↓
Approve research strategy
        ↓
Start research run
        ↓
Fake search and AI responses
        ↓
Create findings and evidence
        ↓
Evaluate candidates
        ↓
Create opportunities
        ↓
Export CSV
```

## Authorization

**Suggested policies:**

- OrganizationPolicy
- ProjectPolicy
- ResearchRunPolicy
- OpportunityPolicy
- ExportPolicy

Authorization should check organization membership.

The first internal version may make projects shared across an organization by default.

A future visibility field may support:

- private
- selected_members
- organization

## Initial Laravel Model List

**Likely MVP models:**

- User
- Organization
- OrganizationMembership
- OrganizationProfile
- OrganizationContextItem

- Project
- ProjectContextItem
- ProjectObjectiveVersion
- ProjectChecklistItem
- ProjectRubricCriterion
- ResearchStrategyVersion
- ProjectAiConversation

- ResearchRun
- ResearchRunStep
- CapabilityRun
- ResearchFinding

- Entity
- EntityIdentity
- Evidence
- Signal

- Opportunity
- OpportunityResearchRun
- OpportunityCriterionEvaluation
- OpportunityReview

- Export

This list may be reduced during implementation if some records are initially stored as structured JSON.

## Suggested Laravel Directory Structure
```bash
app/
├── Actions/
│   ├── Organizations/
│   ├── Projects/
│   ├── Objectives/
│   ├── Research/
│   └── Opportunities/
│
├── Ai/
│   ├── Agents/
│   │   ├── ObjectiveDiscoveryAgent.php
│   │   ├── ObjectiveBriefAgent.php
│   │   ├── RubricAgent.php
│   │   ├── ResearchStrategyAgent.php
│   │   ├── EvidenceExtractionAgent.php
│   │   ├── SignalAnalysisAgent.php
│   │   ├── OpportunityQualificationAgent.php
│   │   └── OpportunityPresentationAgent.php
│   │
│   ├── Tools/
│   │   ├── GetOrganizationContext.php
│   │   ├── GetProjectContext.php
│   │   ├── GetSupportedObjectiveCategories.php
│   │   ├── GetAvailableCapabilities.php
│   │   ├── SearchStoredEvidence.php
│   │   └── GetEntityHistory.php
│   │
│   └── Data/
│       ├── ObjectiveDraftData.php
│       ├── RubricData.php
│       ├── ResearchStrategyData.php
│       └── OpportunityEvaluationData.php
│
├── Domain/
│   ├── Objectives/
│   ├── Research/
│   ├── Evidence/
│   └── Opportunities/
│
├── Jobs/
│   ├── Research/
│   └── Ai/
│
├── Models/
│
├── Policies/
│
├── Research/
│   ├── Capabilities/
│   ├── Sources/
│   ├── Execution/
│   └── Support/
│
└── Services/
```

## Suggested Inertia Pages

```bash
resources/js/Pages/

Organizations/
├── Profile.vue
└── Context.vue

Projects/
├── Index.vue
├── Create.vue
├── Show.vue
├── Objective.vue
├── ObjectiveReview.vue
├── Rubric.vue
├── Strategy.vue
└── Runs/
    └── Show.vue

Opportunities/
├── Index.vue
└── Show.vue
```

## Suggested Vue Components

- ObjectiveConversation
- ObjectiveChecklist
- ObjectiveBrief
- RubricEditor
- ResearchStrategyEditor
- ResearchProgress
- ResearchRunTimeline
- OpportunityCard
- OpportunityEvidenceDrawer
- SignalList
- CriterionEvaluationList
- RejectOpportunityDialog
- ExportDialog

## Revised MVP Screen Flow

```
Projects
    ↓
Create Project
    ↓
Open Objective Conversation
    ↓
Conversation + Completion Checklist
    ↓
Objective Brief Review
    ↓
Rubric Review
    ↓
Research Strategy Review
    ↓
Approve and Start Research Run
    ↓
Research Progress
    ↓
Opportunity Results
    ↓
Opportunity Detail and Evidence
    ↓
Reject, Retain, or Export
```

## Development Phases

### Phase 1 — Organization and Project Foundation

**Build:**

- Authentication.
- Organizations.
- Memberships.
- Organization profile.
- Organization context.
- Projects.
- Authorization policies.
- Basic Inertia project screens.

**Acceptance:**

- A user belongs to an organization.
- A project belongs to an organization.
- Organization context can be selected for a project.
- Selected context is snapshotted.

### Phase 2 — Objective Conversation

**Build:**

- Laravel AI SDK installation.
- Objective Discovery Agent.
- Persistent project conversation.
- Objective checklist.
- Suggested answers.
- Supported objective mapping.
- Objective Brief generation.
- User approval.
- Objective versioning.

**Acceptance:**

- A user can describe an objective naturally.
- Papertrail extracts known details.
- Missing criteria are visible.
- AI suggests answers where appropriate.
- Research cannot begin without approval.

### Phase 3 — Rubric and Research Strategy

**Build:**

- Rubric Agent.
- Rubric review interface.
- Research Strategy Agent.
- Strategy review interface.
- Capability availability checking.
- Strategy approval and versioning.

**Acceptance:**

- The user receives a project-specific rubric.
- The user can approve or revise the rubric.
- The strategy includes search concepts, source families, and limits.
- Unsupported strategies cannot begin.

### Phase 4 — Research Run Engine

**Build:**

- Research Runs.
- Run steps.
- Capability registry.
- Capability runs.
- Queue orchestration.
- Progress interface.
- Retry and failure handling.
- Basic cost and request tracking.

**Acceptance:**

- An approved strategy creates a Research Run.
- Steps execute through queues.
- Status is visible.
- Failures are recorded.
- Runs may complete partially.

### Phase 5 — Public Web Research

**Build:**

- Web search capability.
- Direct URL fetching.
- Page text extraction.
- Evidence Extraction Agent.
- Findings and evidence storage.
- Initial entity extraction.

**Acceptance:**

- Papertrail can search public sources.
- It can fetch relevant pages.
- It can preserve the URL and extracted evidence.
- It can create structured findings.

### Phase 6 — Signals and Qualification

**Build:**

- Entity resolution.
- Signal Analysis Agent.
- Opportunity Qualification Agent.
- Rubric evaluations.
- Opportunity creation.
- Opportunity deduplication.

**Acceptance:**

- Candidates are evaluated against approved criteria.
- Every opportunity has supporting evidence.
- Required criterion failures are visible.
- Duplicate opportunities are not repeatedly created.

### Phase 7 — Opportunity Review and Export

**Build:**

- Opportunity list.
- Opportunity detail.
- Evidence viewer.
- Reject and retain actions.
- Rejection reasons.
- CSV export.

**Acceptance:**

- Users can inspect why an opportunity was created.
- Users can reject incorrect opportunities.
- Rejected opportunities remain recorded.
- Qualified opportunities can be exported.

### Phase 8 — Hardening

**Build:**

- Agent fakes and automated tests.
- Cost controls.
- Logging.
- Provider failover.
- Retry policies.
- Authorization review.
- Performance improvements.
- Error and partial-result handling.

## MVP Non-Goals

The first MVP will not require:

- Fully autonomous browsing of any website.
- Authenticated LinkedIn automation.
- Authenticated Facebook automation.
- Automated email sending.
- Automated contact form submissions.
- CRM pipeline management.
- Recurring scheduled research.
- Complex machine-learned scoring.
- Universal support for every objective.
- A Chrome extension.
- Large-scale scraping infrastructure.
- A fully autonomous planner that invents arbitrary capabilities.

## Open Decisions

The following decisions still require discussion.

### Organization

- Should registration automatically create an organization?
- Are organization projects shared by default?
- What organization profile fields are required for MVP?
- Which organization roles need actual behavior in MVP?

### Supported Objective Categories

- Should MVP support only Potential Client?
- Should it support Potential Client, Partnership, and Affiliate?
- What objective should be used for the first real-world test?
- Should every objective require a target result count?

### Strategy Editing

- Can users directly edit search terms?
- Can users edit source selection?
- Can users edit demographics?
- Should users only approve or request an AI revision?

### Research Sources

- Is public-only research sufficient for MVP?
- Which search provider should be used?
- Should provider WebSearch be used, a dedicated API, or both?
- Is server-side Playwright required in the first test?
- Should public LinkedIn and Facebook results be included when discoverable through search?

### Evidence

- Must every opportunity have more than one source?
- Are screenshots required?
- Are full page snapshots required?
- How long should evidence be retained?
- What confidence levels should be supported?

### Research Limits

- What is the default target number of opportunities?
- What is the maximum number of candidates researched per run?
- What is the maximum run cost?
- Should a run pause or complete partially when limits are reached?

### Opportunity Review

- Should rejected opportunities affect future runs automatically?
- May users permanently delete an opportunity?
- Which rejection reasons are required?
- Should opportunity cards include outreach angles in MVP?

### Export

- Is CSV the required initial export?
- Which fields must appear in the export?
- Should the export include every evidence URL?

## Current Confirmed Decisions

- ✓ Internal first, architected for multiple organizations later.
- ✓ Projects belong to organizations, not directly to only one user.
- ✓ A project may have many dated Research Runs.
- ✓ A project begins with an open AI conversation.
- ✓ Papertrail helps the user plan and answer the objective questions.
- ✓ The interface includes a visible objective completion checklist.
- ✓ The user gives final approval before research begins.
- ✓ The setup must be streamlined and avoid excessive questioning.
- ✓ Core questions may be followed by objective-specific AI questions.
- ✓ AI should suggest possible answers when the user does not know.
- ✓ User objectives should map to supported system categories.
- ✓ Papertrail must not imply support for an objective it cannot execute.
- ✓ The application must not be overfitted to conferences.
- ✓ Qualification criteria are project-specific.
- ✓ AI proposes a rubric and the user approves it.
- ✓ MVP rubric rules should remain simple.
- ✓ AI proposes a visible research strategy before execution.
- ✓ Research strategy may include search terms, demographics, and sources.
- ✓ Search sources depend on the objective.
- ✓ Results may come from many different public websites and platforms.
- ✓ The research process should normally execute automatically.
- ✓ The user reviews completed opportunity cards.
- ✓ Users may reject or remove irrelevant cards.
- ✓ Rejection should normally preserve the record and feedback.
- ✓ Signals should initially be objective and evidence-backed.
- ✓ Opportunity storage must support flexible details.
- ✓ Opportunities should not duplicate across Research Runs.
- ✓ MVP includes export.
- ✓ Automated outreach is beyond the initial MVP.
- ✓ Organization context should be reusable by projects.
- ✓ Projects should snapshot inherited organization context.
- ✓ Laravel AI SDK should provide the primary AI integration layer.

## Core Architectural Statement

- AI helps think and interpret.
- Laravel owns application state and business rules.
- Research Runs coordinate the work.
- Capabilities define what Papertrail can actually do.
- Tools and services perform controlled actions.
- Evidence proves what was found.
- Rubrics determine whether a finding becomes an opportunity.
- Users approve the objective and strategy.
- Users make the final judgment on the opportunities.


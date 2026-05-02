# agents.md — ScoutLoop Build Instructions for Codex

You are Codex, acting as the implementation agent for ScoutLoop.

Your mission is to build a complete, deployable, hackathon-ready product from a fork of the official Vercel Chatbot template:

https://github.com/vercel/chatbot

You must follow this pack exactly unless a dependency or API has changed. When docs conflict with this pack, prefer the latest official docs, but keep the product scope intact.

## Product

ScoutLoop is a Vercel-native, durable, self-improving due diligence agent for:

- Startup judges
- Hackathon judges
- Accelerators
- Early-stage VC-style screening

The app evaluates a startup/project from a URL, pitch text, or text-based uploaded file and returns a professional dashboard with evidence, scoring, market analysis, competitors, risks, and founder questions.

## Non-negotiable constraints

1. The app must be deployable to Vercel from the first working iteration.
2. Use the Vercel Chatbot template as the base project.
3. Use v0 Model API as the primary inference provider through the AI SDK provider `@ai-sdk/vercel`.
4. Use WDK / Vercel Workflow for durable multi-step evaluation runs.
5. Use Bright Data MCP/tools for external web search/scraping/evidence gathering.
6. Use Mubit for operational memory and evaluator-feedback learning.
7. Keep the UX dashboard-first. Do not make the product just a generic chat window.
8. Add exactly two evaluator modes:
   - Startup Judge
   - Hackathon Judge
9. File upload must be text-based only for the hackathon MVP.
10. Deploy after major build milestones.

## Build philosophy

Working deployed demo beats an ambitious broken palace.

Implement the smallest version that visibly demonstrates:

- Vercel-native build
- v0 / AI SDK inference
- Durable WDK workflow
- MCP-powered external evidence
- Mubit-powered learning loop
- Polished dashboard output

## Deployment discipline

After every major milestone:

1. Run typecheck/lint/build.
2. Fix blocking errors.
3. Commit changes.
4. Push to GitHub.
5. Deploy or verify Vercel preview deployment.
6. Do not continue deep feature work if deployment is broken.

Add or preserve scripts:

```json
{
  "lint": "next lint || eslint .",
  "typecheck": "tsc --noEmit",
  "build": "next build"
}
```

If the inherited template uses different scripts, preserve template scripts and add missing ones only if safe.

## Required repository base

Fork or clone:

```bash
git clone https://github.com/vercel/chatbot scoutloop
cd scoutloop
```

Then add this pack into the repo root.

## Required docs to inspect during implementation

Read:

- `docs/tech-references.md`
- `docs/ai-sdk-v0.md`
- `docs/wdk-workflow.md`
- `docs/brightdata-mcp.md`
- `docs/mubit-memory.md`
- `docs/env-vars.md`

Also inspect live official docs where possible:

- AI SDK docs: https://ai-sdk.dev/docs
- AI SDK llms file: https://ai-sdk.dev/llms.txt
- v0 API docs: https://v0.dev/docs/api
- Vercel v0 Model API docs: https://vercel.com/docs/v0/api
- Vercel Workflow docs: https://vercel.com/docs/workflow
- Bright Data MCP docs: https://docs.brightdata.com/mcp-server
- Mubit docs: https://docs.mubit.ai/introduction
- Mubit getting started: https://docs.mubit.ai/getting-started
- Vercel Chatbot template: https://github.com/vercel/chatbot

## Agent implementation priorities

### Priority 0 — Keep app bootable and deployable

Before adding ScoutLoop features, run the template locally and build once.

### Priority 1 — ScoutLoop UI shell

Create a dashboard-first flow:

- Landing/input area
- Startup URL input
- Pitch text textarea
- Text-based file upload
- Mode selector: Startup Judge / Hackathon Judge
- Evaluation progress timeline
- Dashboard result
- Feedback panel
- Mubit memory/lesson panel

### Priority 2 — v0 inference through AI SDK

Implement structured object generation using v0 model API via `@ai-sdk/vercel`.

Use a single provider wrapper in `lib/ai/scoutloop-model.ts`.

Do not scatter model config across the codebase.

### Priority 3 — Bright Data evidence tools

Implement web research tools behind a clean interface:

- `searchWeb(query)`
- `scrapeMarkdown(url)`
- `researchStartup(input)`

If MCP transport setup is too slow, implement a temporary direct Bright Data API wrapper, but keep the interface named and documented as the Bright Data/MCP evidence layer.

### Priority 4 — WDK durable workflow

Wrap evaluation in a durable workflow:

- Start run
- Normalize input
- Gather evidence
- Extract claims
- Score
- Generate questions
- Persist result
- Wait/accept feedback
- Store Mubit lesson
- Re-run/improve

Use `"use workflow"` and `"use step"` according to the latest WDK docs.

### Priority 5 — Mubit learning loop

Evaluator feedback must visibly improve future output.

Implement:

- Feedback buttons
- Custom feedback text
- Store feedback as Mubit run outcome/lesson
- Retrieve relevant lessons before next evaluation
- Display "Lessons applied" in dashboard

### Priority 6 — Demo polish

Add:

- Seed examples
- Loading states
- Evidence confidence labels
- Graceful fallback mode
- README
- Demo script
- Global/local submission copy

## Do not build

Do not build these unless all core features are complete:

- Full auth flows
- Billing
- Team workspaces
- Real VC financial modelling
- Complex PDF parsing
- Non-text file upload
- Real-time collaborative editing
- Huge database schema
- Slack/Discord/Teams integrations
- Full CRM
- Browser automation unless Bright Data MCP setup already works

## Preferred data persistence for hackathon

Use the simplest reliable option.

Acceptable:

- In-memory during dev plus localStorage/client state for demo
- Template DB if already configured and working
- Minimal Postgres table if template requires it

Do not spend hours fighting persistence. The live demo needs one run and one feedback loop.

## Error-handling rules

Every external dependency must have a graceful fallback:

- If Bright Data fails, use mocked evidence from pasted pitch text and show a warning.
- If Mubit fails, store lessons locally and show a warning.
- If WDK fails locally, keep a direct non-durable evaluation route for demo fallback but preserve WDK files and docs.
- If v0 API fails, show a clear error and do not crash the UI.

## Output quality rules

All generated analysis must include:

- Confidence level
- Evidence source when available
- Unknown/insufficient data fields
- No fake precision
- No hallucinated revenue, users, funding, or customers

Use phrasing like:

- "Based on available public evidence..."
- "Confidence: low/medium/high"
- "No public evidence found for..."
- "This is a rough hypothesis, not an investment-grade market model."

## Final demo success criteria

The judge can see:

1. URL/pitch input.
2. Durable workflow progress.
3. Evidence-backed dashboard.
4. VC/hackathon scoring.
5. Founder questions.
6. Feedback entered.
7. Mubit lesson stored.
8. Re-run produces sharper questions.

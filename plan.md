# plan.md — ScoutLoop Build Plan

This is the ordered implementation plan. Codex must work through this in sequence.

Use the checkboxes as the build log.

## Phase 0 — Bootstrap from Vercel Chatbot Template

- [ ] Fork or clone `https://github.com/vercel/chatbot`.
- [ ] Install dependencies with the package manager used by the template.
- [ ] Start the dev server.
- [ ] Run the existing test/build commands.
- [ ] Confirm the app can build locally.
- [ ] Create `.env.local` from `.env.example.scoutloop`.
- [ ] Add this Codex pack to the repo root.
- [ ] Commit baseline.

Deployment checkpoint:

- [ ] Link project to Vercel.
- [ ] Add required env vars in Vercel dashboard.
- [ ] Deploy first working template to Vercel.
- [ ] Confirm preview URL works.

## Phase 1 — ScoutLoop Product Shell

- [ ] Add `lib/scoutloop/types.ts` with shared types.
- [ ] Add `lib/scoutloop/constants.ts` with modes and scoring categories.
- [ ] Add input UI:
  - [ ] Startup URL input
  - [ ] Pitch text textarea
  - [ ] Text-based file upload
  - [ ] Mode selector: Startup Judge / Hackathon Judge
- [ ] Add progress timeline UI.
- [ ] Add dashboard shell:
  - [ ] Summary
  - [ ] Evidence
  - [ ] Market sizing
  - [ ] Competitors
  - [ ] Moat
  - [ ] Risks
  - [ ] Scorecard
  - [ ] Founder questions
  - [ ] Mubit lessons
- [ ] Add feedback panel:
  - [ ] Quick feedback buttons
  - [ ] Free text feedback
  - [ ] Re-run with learning button

Deployment checkpoint:

- [ ] Run lint/typecheck/build.
- [ ] Commit.
- [ ] Push.
- [ ] Verify Vercel preview.

## Phase 2 — v0 Model API via AI SDK

- [ ] Install provider if missing:

```bash
pnpm add ai @ai-sdk/vercel zod
```

- [ ] Create `lib/ai/scoutloop-model.ts`.
- [ ] Use `V0_API_KEY`.
- [ ] Default model: `v0-1.5-md`.
- [ ] Optional advanced model env: `SCOUTLOOP_MODEL=v0-1.5-lg`.
- [ ] Create structured schema for evaluation output using Zod.
- [ ] Implement a local route `/api/scoutloop/evaluate-direct`.
- [ ] Generate a structured evaluation from pitch text only.
- [ ] Render structured result in dashboard.

Deployment checkpoint:

- [ ] Run lint/typecheck/build.
- [ ] Commit.
- [ ] Push.
- [ ] Verify Vercel preview.

## Phase 3 — Text-Based File Upload

- [ ] Add client-side file parsing for:
  - `.txt`
  - `.md`
  - `.csv`
  - `.json`
- [ ] Reject PDFs/images/binary files.
- [ ] Limit size to 100 KB initially.
- [ ] Merge file text into pitch/context.
- [ ] Display uploaded file names.
- [ ] Add graceful error messages.

Deployment checkpoint:

- [ ] Run lint/typecheck/build.
- [ ] Commit.
- [ ] Push.
- [ ] Verify Vercel preview.

## Phase 4 — Bright Data MCP / Evidence Layer

- [ ] Read `docs/brightdata-mcp.md`.
- [ ] Implement `lib/scoutloop/evidence/brightdata.ts`.
- [ ] Expose normalized functions:
  - [ ] `searchWeb(query)`
  - [ ] `scrapeMarkdown(url)`
  - [ ] `gatherStartupEvidence(input)`
- [ ] Use startup URL to scrape homepage.
- [ ] Use startup/company name to search competitors.
- [ ] Use market/category terms to gather public signals.
- [ ] Return evidence cards with URL, title/snippet, type, confidence.
- [ ] Add fallback evidence generation from pitch text if Bright Data fails.
- [ ] Display evidence cards in UI.

Deployment checkpoint:

- [ ] Run lint/typecheck/build.
- [ ] Commit.
- [ ] Push.
- [ ] Verify Vercel preview.

## Phase 5 — WDK / Vercel Workflow

- [ ] Install Workflow SDK according to current docs.
- [ ] Wrap Next config according to current WDK docs.
- [ ] Create `workflows/scoutloop-evaluation.ts`.
- [ ] Add workflow steps:
  - [ ] Normalize input
  - [ ] Recall Mubit lessons
  - [ ] Gather evidence
  - [ ] Extract claims
  - [ ] Generate scorecard
  - [ ] Generate questions
  - [ ] Persist/store result
- [ ] Add route/server action to start workflow.
- [ ] Add run status/progress endpoint or simple polling.
- [ ] Show durable workflow progress in UI.
- [ ] Preserve direct route fallback if WDK setup blocks demo.

Deployment checkpoint:

- [ ] Run lint/typecheck/build.
- [ ] Commit.
- [ ] Push.
- [ ] Verify Vercel preview.

## Phase 6 — Mubit Learning Loop

- [ ] Read `docs/mubit-memory.md`.
- [ ] Install Mubit SDK according to current docs.
- [ ] Add `lib/scoutloop/memory/mubit.ts`.
- [ ] Implement:
  - [ ] `recallLessons(context)`
  - [ ] `recordRunOutcome(run)`
  - [ ] `recordEvaluatorFeedback(feedback)`
  - [ ] `reflectIntoLesson(feedback)`
- [ ] Add `/api/scoutloop/feedback`.
- [ ] On feedback submit:
  - [ ] Store feedback in Mubit.
  - [ ] Generate or retrieve lesson.
  - [ ] Display lesson in UI.
- [ ] On rerun:
  - [ ] Inject relevant lessons into evaluation prompt.
  - [ ] Show "Lessons applied" card.
  - [ ] Produce sharper founder questions.

Deployment checkpoint:

- [ ] Run lint/typecheck/build.
- [ ] Commit.
- [ ] Push.
- [ ] Verify Vercel preview.

## Phase 7 — Demo Polish

- [ ] Add seed demo buttons:
  - [ ] "Evaluate an AI agent startup"
  - [ ] "Evaluate a hackathon project"
  - [ ] "Evaluate from pasted pitch"
- [ ] Add skeleton/loading UI.
- [ ] Add badges:
  - [ ] v0 inference
  - [ ] WDK durable run
  - [ ] Bright Data evidence
  - [ ] Mubit learning
  - [ ] Vercel deployed
- [ ] Add README with setup and demo.
- [ ] Add `docs/demo-script.md`.
- [ ] Add submission copy in README.
- [ ] Take screenshots.
- [ ] Final deploy.

## Phase 8 — Submission

- [ ] Public GitHub repo.
- [ ] Vercel production deployment.
- [ ] Confirm `.env` secrets are not committed.
- [ ] Submit local form.
- [ ] Submit global Vercel Community form.
- [ ] Prepare 60-90 second demo.

# Architecture

## High-level system

```txt
Vercel Chatbot Template / Next.js App Router
│
├── ScoutLoop UI
│   ├── Input form
│   ├── Text upload
│   ├── Workflow progress timeline
│   ├── Evaluation dashboard
│   ├── Feedback panel
│   └── Mubit lessons panel
│
├── API Routes / Server Actions
│   ├── /api/scoutloop/evaluate
│   ├── /api/scoutloop/evaluate-direct
│   ├── /api/scoutloop/feedback
│   └── /api/scoutloop/rerun
│
├── Vercel AI SDK
│   ├── v0 Model API provider
│   ├── structured output schemas
│   └── optional tool calling
│
├── WDK / Vercel Workflow
│   └── Durable evaluation workflow
│
├── Bright Data MCP / Evidence Layer
│   ├── searchWeb()
│   ├── scrapeMarkdown()
│   └── gatherStartupEvidence()
│
├── Mubit Memory Layer
│   ├── recallLessons()
│   ├── recordRunOutcome()
│   ├── recordEvaluatorFeedback()
│   └── reflectIntoLesson()
│
└── Deployment
    └── Vercel
```

## Recommended directories

```txt
app/
  (chat template routes...)
  scoutloop/
    page.tsx
  api/
    scoutloop/
      evaluate/route.ts
      evaluate-direct/route.ts
      feedback/route.ts
      rerun/route.ts

components/
  scoutloop/
    scoutloop-input.tsx
    mode-selector.tsx
    text-file-upload.tsx
    workflow-timeline.tsx
    evaluation-dashboard.tsx
    evidence-card.tsx
    scorecard.tsx
    market-sizing-card.tsx
    competitor-grid.tsx
    founder-questions.tsx
    feedback-panel.tsx
    mubit-lessons-panel.tsx

lib/
  ai/
    scoutloop-model.ts
    scoutloop-prompts.ts
    scoutloop-schemas.ts
  scoutloop/
    types.ts
    constants.ts
    evaluate.ts
    scoring.ts
    confidence.ts
    evidence/
      brightdata.ts
      fallback.ts
    memory/
      mubit.ts
      local-fallback.ts
    workflow/
      client.ts

workflows/
  scoutloop-evaluation.ts
```

## Data flow

```txt
User input
  ↓
Normalize text + URL + uploaded file text
  ↓
Recall relevant Mubit lessons
  ↓
Gather evidence via Bright Data
  ↓
Generate structured evaluation using v0 Model API
  ↓
Render dashboard
  ↓
Evaluator feedback
  ↓
Mubit stores lesson
  ↓
Rerun with lesson injected
```

## Durable workflow responsibilities

WDK should manage the evaluation process, not UI rendering.

Workflow steps:

1. `normalizeInputStep`
2. `recallLessonsStep`
3. `gatherEvidenceStep`
4. `extractClaimsStep`
5. `generateEvaluationStep`
6. `persistResultStep`
7. `recordOutcomeStep`

Feedback may be a separate workflow or route:

1. `recordFeedbackStep`
2. `reflectLessonStep`
3. `rerunWithLessonStep`

## Direct fallback

Maintain `/api/scoutloop/evaluate-direct` as a non-durable fallback for the demo.

If WDK breaks due to beta API/tooling issues, the demo must still work using the direct route while preserving WDK code and UI messaging.

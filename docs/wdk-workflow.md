# WDK / Vercel Workflow Plan

## Goal

Use WDK / Vercel Workflow to make ScoutLoop's evaluation process durable, resumable, and observable.

## Docs

- https://vercel.com/docs/workflow
- https://github.com/vercel/workflow

Vercel Workflow is built on the open-source Workflow Development Kit and supports durable TypeScript workflows that can pause, resume, maintain state, survive deploys/crashes, and run through `"use workflow"` and `"use step"` directives.

## Why WDK matters for ScoutLoop

Due diligence is a multi-step process:

1. Gather data.
2. Scrape evidence.
3. Extract claims.
4. Score.
5. Generate questions.
6. Wait for feedback.
7. Learn.
8. Rerun.

This is not a one-shot chatbot response. WDK makes this process production-style and resilient.

## Desired workflow file

`workflows/scoutloop-evaluation.ts`

## Pseudocode

```ts
export async function scoutLoopEvaluationWorkflow(input: ScoutLoopInput) {
  "use workflow";

  const normalized = await normalizeInputStep(input);
  const lessons = await recallLessonsStep(normalized);
  const evidence = await gatherEvidenceStep(normalized);
  const evaluation = await generateEvaluationStep({
    input: normalized,
    lessons,
    evidence,
  });
  const stored = await persistEvaluationStep(evaluation);
  await recordRunOutcomeStep(stored);

  return stored;
}

export async function gatherEvidenceStep(input: NormalizedInput) {
  "use step";
  return gatherStartupEvidence(input);
}
```

## Required workflow steps

### `normalizeInputStep`

Input:

- URL
- pitch text
- uploaded text contents
- mode

Output:

- normalized company/project name
- normalized URL
- merged context text
- evaluation mode

### `recallLessonsStep`

Calls Mubit to retrieve relevant lessons.

Output:

- list of lessons
- applied lesson summaries

### `gatherEvidenceStep`

Calls Bright Data evidence layer.

Output:

- homepage content
- search results
- competitor search results
- market/category search results
- evidence cards

### `generateEvaluationStep`

Calls v0 Model API through AI SDK with structured schema.

Output:

- complete dashboard data

### `persistEvaluationStep`

For hackathon MVP, acceptable persistence:

- in-memory map
- template DB if already available
- simple JSON-like server cache during local run

### `recordRunOutcomeStep`

Calls Mubit or local fallback to record run outcome.

## Feedback workflow

Feedback can be a separate API route, but ideally WDK can handle:

```txt
feedback submitted
  ↓
record feedback
  ↓
reflect into lesson
  ↓
apply lesson to rerun
```

If WDK human-in-the-loop waiting is too slow to implement, implement feedback as route plus Mubit memory. Do not block demo.

## UI requirement

The dashboard must show workflow progress:

- Input normalized
- Lessons recalled
- Evidence gathered
- Claims extracted
- Scorecard generated
- Founder questions generated
- Feedback stored
- Lessons applied

Even if polling is simulated, the user must see WDK-style step progression.

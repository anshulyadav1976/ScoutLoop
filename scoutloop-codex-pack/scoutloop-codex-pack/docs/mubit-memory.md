# Mubit Memory Layer

## Goal

Use Mubit to make ScoutLoop visibly self-improving across evaluations.

## Docs

- https://mubit.ai
- https://docs.mubit.ai/introduction
- https://docs.mubit.ai/getting-started

Mubit is operational memory for agents. It captures what agents did, what failed, what worked, and injects lessons into future runs.

## Environment

```bash
MUBIT_API_KEY=
MUBIT_AGENT_ID=scoutloop
```

## ScoutLoop memory model

Memory is not user preference memory.

Do not store trivial facts like:

- user likes dark mode
- user likes short answers
- user prefers apples

Store evaluator-quality lessons like:

- When evaluating AI startups, prioritize technical defensibility and workflow lock-in.
- When evaluating hackathon projects, score sponsor integration only if it is essential to the product.
- If public evidence is sparse, ask founders for traction proof and customer pain evidence.
- Avoid over-scoring generic wrappers without distribution or data advantage.

## Internal interface

Create:

`lib/scoutloop/memory/mubit.ts`

Export:

```ts
export async function recallLessons(context: MemoryRecallContext): Promise<MemoryLesson[]>;
export async function recordRunOutcome(outcome: RunOutcome): Promise<void>;
export async function recordEvaluatorFeedback(feedback: EvaluatorFeedback): Promise<MemoryLesson[]>;
export async function reflectFeedbackIntoLessons(feedback: EvaluatorFeedback): Promise<MemoryLesson[]>;
```

## UI flow

After initial evaluation, user submits feedback:

Quick buttons:

- Too generic
- Missed competitors
- Over-scored
- Under-scored
- Questions too soft
- Needs more technical scrutiny
- Needs more market scrutiny
- Good evaluation

Free text box:

```txt
Focus more on defensibility, distribution, and data advantage.
```

Mubit stores/refines lesson.

UI shows:

```txt
New lesson stored:
When evaluating early-stage AI startups, prioritize technical defensibility, distribution, workflow lock-in, and proprietary data advantage in founder questions.
```

On rerun, dashboard shows:

```txt
Lessons applied:
- Prioritized technical defensibility
- Added distribution-risk questions
- Added data-advantage scrutiny
```

## Demo before/after

Before feedback:

```txt
Who are your competitors?
What is your business model?
How will you acquire users?
```

After feedback:

```txt
If OpenAI or Anthropic ships this as a feature, what survives?

What proprietary execution data does the product collect that improves recommendations over time?

Which part of the workflow becomes painful for customers to leave after 30 days?

What distribution channel gives you access to decision-makers before incumbents copy the core feature?
```

## Fallback

If Mubit fails:

- Store lessons in local in-memory fallback.
- Show warning:

```txt
Mubit unavailable; using local demo memory fallback.
```

The demo must still show before/after improvement.

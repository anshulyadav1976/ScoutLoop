# v0 Model API + Vercel AI SDK

## Goal

Use v0 as the primary LLM inference provider for ScoutLoop.

## Docs

- https://v0.dev/docs/api
- https://vercel.com/docs/v0/api
- https://ai-sdk.dev/docs
- https://ai-sdk.dev/llms.txt

## Install

```bash
pnpm add ai @ai-sdk/vercel zod
```

## Environment

```bash
V0_API_KEY=
SCOUTLOOP_MODEL=v0-1.0-md
```

## Provider wrapper

Create `lib/ai/scoutloop-model.ts`.

Example pattern:

```ts
import { vercel } from "@ai-sdk/vercel";

export function getScoutLoopModel() {
  const modelName = process.env.SCOUTLOOP_MODEL || "v0-1.0-md";
  return vercel(modelName);
}
```

## Structured output

Use Zod schemas to keep the dashboard reliable.

Recommended file:

`lib/ai/scoutloop-schemas.ts`

Required schema sections:

- summary
- product
- targetCustomer
- marketSizing
- competitors
- differentiation
- moat
- risks
- tractionSignals
- scorecard
- founderQuestions
- evidenceUsed
- confidence

## Prompting rules

The model must never invent precise facts.

System instruction principles:

```txt
You are ScoutLoop, a due diligence evaluation agent.

Use only provided evidence, pasted pitch text, and clearly marked web evidence.
If a claim is not supported, mark it as unknown or low confidence.
Do not invent revenue, customers, funding, founders, market numbers, or traction.
Produce concise, structured, evaluator-ready output.
```

## Two modes

### Startup Judge

Ask for output optimized for:

- VC/accelerator evaluation
- business viability
- market opportunity
- moat
- distribution
- founder-market fit
- traction
- risk

### Hackathon Judge

Ask for output optimized for:

- usefulness
- technical execution
- creativity/originality
- sponsor integration
- demo clarity
- completeness
- post-hackathon potential

## Fallback model

If v0 inference fails and `AI_GATEWAY_API_KEY` is present, it is acceptable to fallback to AI Gateway for demo continuity. But the UI and README must state that ScoutLoop's intended primary provider is v0 Model API.

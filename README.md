# ScoutLoop

ScoutLoop is a Vercel-native, durable, self-improving due diligence agent for startup judges, hackathon judges, accelerators, and early-stage VC-style screening.

It is built from the official Vercel Chatbot template and adds a dedicated dashboard route at `/scoutloop`.

## Stack

- Next.js App Router and TypeScript
- Vercel Chatbot template
- Vercel AI SDK v6
- v0 Model API via `@ai-sdk/vercel`
- Workflow DevKit / Vercel Workflow
- Bright Data evidence adapter with graceful fallback
- Mubit memory adapter with Neon/local fallback
- Neon Postgres with Drizzle migrations
- shadcn/ui-style components and Tailwind

## Local Setup

Install dependencies:

```bash
pnpm install
```

Create local env from the provided secret source:

```bash
cp env.txt .env.local
```

In this repo, `.env.local` is generated locally from `env.txt` and is ignored by Git. Do not commit secrets.

Required variables:

```bash
V0_API_KEY=
SCOUTLOOP_MODEL=v0-1.0-md
DATABASE_URL=
POSTGRES_URL=
MUBIT_API_KEY=
MUBIT_AGENT_ID=
BRIGHT_DATA_API_KEY=
BRIGHT_DATA_MCP_URL=
SCOUTLOOP_USE_WDK=true
SCOUTLOOP_ENABLE_DIRECT_FALLBACK=true
```

Run locally:

```bash
pnpm dev
```

Open:

```txt
http://localhost:3000/scoutloop
```

The terminal running `pnpm dev` prints ScoutLoop integration logs, for example:

```txt
[ScoutLoop][WDK] started
[ScoutLoop][BrightData] scrape:start
[ScoutLoop][BrightData] search:success
[ScoutLoop] v0:generate:success
[ScoutLoop][Neon] run:save:success
[ScoutLoop][Mubit] feedback:lesson-stored
```

If Bright Data or Mubit are not actually configured, the same terminal will show a `skipped`, `failed`, or `fallback` log instead of silently pretending the integration worked.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm build
```

The build runs Drizzle migrations first:

```bash
tsx lib/db/migrate && next build
```

## Demo Flow

1. Open `/scoutloop`.
2. Pick `Startup Judge` or `Hackathon Judge`.
3. Paste your own real URL, pitch text, or upload `.txt`, `.md`, `.csv`, or `.json`.
4. Start evaluation.
5. Watch the WDK-style workflow timeline.
6. Review the dashboard: score, summary, market hypotheses, competitors, moat, risks, evidence cards, and founder questions.
7. Submit feedback such as:

```txt
The questions are too generic. Focus more on technical defensibility, distribution, and data advantage.
```

8. Re-run with learned context and compare sharper questions.

## Fallback Behavior

- If Bright Data MCP is unavailable, ScoutLoop evaluates the provided URL/pitch/uploaded text and shows a warning.
- If v0 inference fails, ScoutLoop returns a conservative structured fallback instead of crashing.
- If WDK cannot start locally, `/api/scoutloop/evaluate` falls back to direct evaluation.
- If Mubit SDK/API behavior is unavailable, feedback lessons are stored in Neon/local fallback memory.

## Sponsor Tech Visibility

The ScoutLoop dashboard includes visible badges for:

- v0 inference
- WDK durable workflow
- Bright Data evidence
- Mubit learning
- Neon Postgres
- Vercel-ready

## Deployment

This repo is Vercel-ready but intentionally not deployed by this agent run. Before deploying, add the required env vars in Vercel and run:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

Then deploy only when explicitly requested.

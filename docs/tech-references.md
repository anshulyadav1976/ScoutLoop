# Tech References

Codex must use current official documentation where possible.

## Vercel Chatbot Template

Repo:

https://github.com/vercel/chatbot

Use this as the base. It provides:

- Next.js App Router
- AI SDK patterns
- shadcn/ui
- Tailwind
- model provider routing
- auth/persistence patterns

Do not rewrite the app from scratch unless the template blocks implementation.

## v0 API

Docs:

- https://v0.dev/docs/api
- https://vercel.com/docs/v0/api

v0 has two APIs:

1. Model API — OpenAI-compatible model access.
2. Platform API — development/project infrastructure.

ScoutLoop uses **Model API** for inference.

Environment variable:

```bash
V0_API_KEY=
```

Provider package:

```bash
pnpm add ai @ai-sdk/vercel
```

Example pattern:

```ts
import { generateObject } from "ai";
import { vercel } from "@ai-sdk/vercel";

const result = await generateObject({
  model: vercel(process.env.SCOUTLOOP_MODEL ?? "v0-1.0-md"),
  schema,
  prompt,
});
```

## AI SDK

Docs:

- https://ai-sdk.dev/docs
- https://ai-sdk.dev/llms.txt

Use the AI SDK for:

- structured object generation
- streaming where useful
- tool calls if needed
- provider abstraction

Install the AI SDK skill for coding agents if supported:

```bash
npx skills add vercel/ai --skill ai-sdk
```

## Vercel Workflow / WDK

Docs:

- https://vercel.com/docs/workflow
- https://github.com/vercel/workflow

Use WDK/Workflow for durable, resumable, observable evaluation runs.

If supported by the local toolchain, install workflow skill:

```bash
npx skills add https://github.com/vercel/workflow --skill workflow
```

After installing workflow package, inspect bundled docs if present:

```bash
find node_modules -path "*workflow*docs*" -type f | head
```

## Bright Data MCP

Docs:

- https://docs.brightdata.com/mcp-server
- https://docs.brightdata.com/mcp-server/faqs

Use Bright Data for:

- search
- scrape as markdown
- public evidence gathering
- competitor lookup
- market/category context

Minimum required tool capabilities:

- `search_engine`
- `scrape_as_markdown`

## Mubit

Docs:

- https://mubit.ai
- https://docs.mubit.ai/introduction
- https://docs.mubit.ai/getting-started

Use Mubit as operational memory.

ScoutLoop should:

- recall lessons before evaluation
- record run outcomes
- store evaluator feedback
- reflect feedback into reusable lessons
- apply lessons to future evaluations

Environment variable:

```bash
MUBIT_API_KEY=
MUBIT_AGENT_ID=scoutloop
```

## Vercel Deployment

Docs:

- https://vercel.com/docs
- https://vercel.com/docs/cli
- https://vercel.com/docs/ai-gateway

For local non-interactive deployment, these may be useful:

```bash
VERCEL_TOKEN=
VERCEL_ORG_ID=
VERCEL_PROJECT_ID=
```

If using Vercel AI Gateway fallback:

```bash
AI_GATEWAY_API_KEY=
```

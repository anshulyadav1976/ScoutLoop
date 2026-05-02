# ScoutLoop Codex Pack

ScoutLoop is a Vercel-native, durable, self-improving due diligence agent for startup judges, hackathon judges, accelerators, and early-stage VC-style evaluation.

This pack is designed to be dropped into a fork of the official Vercel Chatbot template:

https://github.com/vercel/chatbot

The goal is to let Codex or another coding agent build the project from start to end with minimal architectural improvisation.

## What ScoutLoop does

A user enters:

- Startup URL
- Optional pitch text
- Optional pasted text document content
- Optional uploaded text-based files, such as `.txt`, `.md`, `.csv`, or `.json`

ScoutLoop then runs a durable evaluation workflow that:

1. Gathers public evidence using Bright Data MCP/tools.
2. Extracts claims from the startup website and pitch text.
3. Identifies market, competitors, risks, differentiation, and traction signals.
4. Produces a structured dashboard.
5. Scores the company in either **Startup Judge** or **Hackathon Judge** mode.
6. Generates sharp questions an evaluator should ask founders.
7. Accepts evaluator feedback.
8. Uses Mubit to turn that feedback into operational memory.
9. Re-runs or improves future evaluations using learned lessons.

## Primary stack

- Vercel Chatbot Template
- Next.js App Router
- TypeScript
- Vercel AI SDK
- v0 Model API through `@ai-sdk/vercel`
- Vercel Workflow / WDK
- Bright Data MCP
- Mubit operational memory
- shadcn/ui + Tailwind
- Vercel deployment from day zero

## Required reading for Codex

Read these files before implementation:

1. `agents.md`
2. `plan.md`
3. `docs/product-brief.md`
4. `docs/architecture.md`
5. `docs/env-vars.md`
6. `docs/deployment.md`
7. `docs/tech-references.md`

Do not begin coding before understanding `agents.md` and `plan.md`.

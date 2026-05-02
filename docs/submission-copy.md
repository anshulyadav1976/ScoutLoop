# Submission Copy

## Short description

ScoutLoop is a self-improving due diligence agent for startup judges, hackathon judges, accelerators, and early-stage VC-style evaluation.

Paste a startup URL or pitch, and ScoutLoop runs a durable Vercel Workflow that gathers public evidence through Bright Data, generates a structured evaluation using v0 and the Vercel AI SDK, scores the opportunity, and produces sharp questions evaluators should ask founders. With Mubit, evaluator feedback becomes operational memory, so future evaluations get sharper instead of repeating generic analysis.

## What it does

- Accepts startup URL, pitch text, and text-based uploaded files.
- Supports Startup Judge and Hackathon Judge modes.
- Gathers evidence from public web data.
- Produces scorecards, market sizing hypotheses, competitor analysis, risks, and founder questions.
- Uses Mubit to learn from feedback and improve future evaluations.

## Built with

- Vercel Chatbot template
- Next.js App Router
- v0 Model API
- Vercel AI SDK
- Vercel Workflow / WDK
- Bright Data MCP
- Mubit
- shadcn/ui
- Deployed on Vercel

## Why it matters

Judging startups and hackathon projects is rushed, inconsistent, and often based on incomplete information. ScoutLoop gives evaluators an evidence-backed second brain that learns how to evaluate better over time.

# Repo Bootstrap Instructions

## Start from Vercel Chatbot

```bash
git clone https://github.com/vercel/chatbot scoutloop
cd scoutloop
```

Or fork it on GitHub and clone your fork.

## Copy pack

Copy these files into the repo root:

```txt
agents.md
plan.md
README.md
.env.example.scoutloop
docs/
prompts/
```

## Install

Use the template's package manager.

Examples:

```bash
pnpm install
```

or

```bash
npm install
```

## Add packages

After confirming the template builds, install ScoutLoop-specific packages:

```bash
pnpm add @ai-sdk/vercel zod
```

Install WDK/Workflow according to current docs.

Install Mubit SDK according to current docs.

Install Bright Data MCP tooling according to current docs.

## Create env

```bash
cp .env.example.scoutloop .env.local
```

Fill in:

```bash
V0_API_KEY=
MUBIT_API_KEY=
BRIGHT_DATA_API_KEY=
```

## Run

```bash
pnpm dev
```

## Build

```bash
pnpm build
```

## Deploy

```bash
vercel deploy
```

# Deployment Rules

## Principle

ScoutLoop must be deployable to Vercel from the first working iteration.

Do not leave deployment until the end.

## Initial deployment

After cloning the Vercel Chatbot template:

```bash
pnpm install
pnpm build
vercel link
vercel deploy
```

If using `npm` or `bun` depending on the template, follow the existing lockfile.

## Vercel env vars

Set env vars in the Vercel dashboard or with CLI:

```bash
vercel env add V0_API_KEY
vercel env add MUBIT_API_KEY
vercel env add MUBIT_AGENT_ID
vercel env add BRIGHT_DATA_API_KEY
```

Optional:

```bash
vercel env add AI_GATEWAY_API_KEY
vercel env add VERCEL_TOKEN
vercel env add VERCEL_ORG_ID
vercel env add VERCEL_PROJECT_ID
```

## Deployment checkpoints

Deploy or verify preview after:

1. Template baseline.
2. UI shell.
3. v0 structured output.
4. Text upload.
5. Bright Data evidence.
6. WDK workflow.
7. Mubit feedback loop.
8. Final polish.

## Codex deployment checklist

Before each deploy:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

If `pnpm lint` is not available, use the template's existing lint command.

If build fails:

1. Fix the build.
2. Do not continue adding features.
3. Commit only after build passes.

## Public GitHub

Hackathon submission requires public repo.

Before making public:

- Ensure `.env.local` is ignored.
- Search for accidental secrets.
- Remove debug logs that print env vars.

## README

README must include:

- Product summary
- Stack
- How to run locally
- Env var list
- Demo flow
- Sponsor tech usage
- Deployment link placeholder

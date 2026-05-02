# Environment Variables and Credentials

Create `.env.local` using `.env.example.scoutloop`.

## Required for core ScoutLoop

### v0 Model API

```bash
V0_API_KEY=
SCOUTLOOP_MODEL=v0-1.5-md
```

Use `v0-1.5-md` for normal runs. Use `v0-1.5-lg` only if available and latency/cost are acceptable.

### Mubit

```bash
MUBIT_API_KEY=
MUBIT_AGENT_ID=scoutloop
```

Use one stable agent id for the demo so lessons persist across runs.

### Bright Data

The exact variable name may depend on the MCP/server integration selected. Use this standard naming internally:

```bash
BRIGHT_DATA_API_KEY=
BRIGHTDATA_API_KEY=
BRIGHT_DATA_MCP_URL=
BRIGHT_DATA_ZONE=
```

Implementation rule:

- Prefer `BRIGHT_DATA_API_KEY`.
- Support `BRIGHTDATA_API_KEY` as an alias.
- Only require `BRIGHT_DATA_MCP_URL` if using a remote MCP server.
- Do not require zone/proxy variables unless the Bright Data docs/tooling require them.

## Required if using Vercel deployment automation

For local Codex/CLI deployment:

```bash
VERCEL_TOKEN=
VERCEL_ORG_ID=
VERCEL_PROJECT_ID=
```

If the developer has already run `vercel login` and `vercel link`, these may not be needed locally. They are useful for CI/non-interactive deployment.

## Optional AI Gateway fallback

The Vercel Chatbot template may use AI Gateway by default.

```bash
AI_GATEWAY_API_KEY=
```

For ScoutLoop primary inference, prefer v0 Model API via `V0_API_KEY`. Keep `AI_GATEWAY_API_KEY` only as fallback or for existing template routes.

## Optional template variables

The Vercel Chatbot template may include Auth.js, Postgres, and Blob storage. If you keep those features, you may need:

```bash
AUTH_SECRET=
NEXTAUTH_SECRET=
POSTGRES_URL=
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
```

Hackathon rule:

If these variables slow down development, disable or bypass auth/persistence for ScoutLoop demo routes. Do not spend the hackathon fighting template infrastructure unless it is already working.

## Recommended ScoutLoop-specific config

```bash
SCOUTLOOP_DEMO_MODE=false
SCOUTLOOP_USE_WDK=true
SCOUTLOOP_USE_MUBIT=true
SCOUTLOOP_USE_BRIGHT_DATA=true
SCOUTLOOP_MAX_TEXT_FILE_BYTES=100000
SCOUTLOOP_ENABLE_DIRECT_FALLBACK=true
```

## `.env.example.scoutloop`

Use this file as the template for local development. Do not commit `.env.local`.

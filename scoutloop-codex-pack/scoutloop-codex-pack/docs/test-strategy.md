# Test Strategy

## Goal

Keep tests light but catch demo-breaking issues.

## Required checks

Before deploy:

```bash
pnpm lint
pnpm typecheck
pnpm build
```

If the template does not have `typecheck`, add:

```json
"typecheck": "tsc --noEmit"
```

## Manual test cases

### Case 1 — Pitch only

Input:

- no URL
- pasted pitch text
- Startup Judge mode

Expected:

- dashboard generated
- warning that public evidence is limited
- scorecard has confidence labels

### Case 2 — URL + pitch

Input:

- startup URL
- pitch text
- Startup Judge mode

Expected:

- Bright Data evidence cards appear
- competitors appear
- market sizing appears

### Case 3 — Hackathon Judge mode

Input:

- hackathon project pitch

Expected:

- scores usefulness, technical execution, creativity, demo clarity, sponsor integration
- questions are hackathon-specific

### Case 4 — Text upload

Upload `.md` or `.txt`.

Expected:

- file content merged into context
- file listed in UI
- no binary upload accepted

### Case 5 — Mubit feedback

Submit feedback:

```txt
Questions are too generic. Focus on defensibility and distribution.
```

Expected:

- lesson stored
- lesson shown in UI
- rerun includes sharper questions

### Case 6 — Dependency failure

Temporarily remove Bright Data key.

Expected:

- app does not crash
- fallback evidence used
- warning shown

## Do not over-test

Avoid building a large test suite during hackathon unless ahead. Manual demo reliability matters most.

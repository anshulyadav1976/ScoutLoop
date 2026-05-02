# Dashboard UI Specification

## Design goals

- Premium but fast to build.
- Dashboard-first, not chat-first.
- Judges should understand value within 10 seconds.
- Make sponsor/tech usage visible without turning UI into a NASCAR jacket.

## Main route

Recommended route:

`/scoutloop`

If easier, use the chatbot home route and add ScoutLoop as the primary mode.

## Page structure

### Header

- Product name: ScoutLoop
- Subtitle: Self-improving due diligence agent
- Badges:
  - v0 inference
  - WDK durable workflow
  - Bright Data evidence
  - Mubit learning
  - Vercel deployed

### Input panel

Fields:

- Startup/project URL
- Pitch text
- Text upload
- Mode selector:
  - Startup Judge
  - Hackathon Judge

CTA:

- Start Evaluation

### Progress timeline

Show steps:

1. Normalizing input
2. Recalling Mubit lessons
3. Gathering public evidence
4. Extracting claims
5. Identifying competitors
6. Estimating market
7. Generating scorecard
8. Generating evaluator questions
9. Ready for feedback

### Dashboard

Cards:

1. Overall score
2. Summary
3. Problem and target customer
4. Market sizing
5. Competitors
6. Differentiation / moat
7. Business model / distribution
8. Risks
9. Evidence quality
10. Founder questions
11. Lessons applied

### Feedback panel

Quick buttons:

- Too generic
- Missed competitors
- Questions too soft
- Over-scored
- Under-scored
- Needs more technical scrutiny
- Needs more market scrutiny
- Good evaluation

Custom feedback textarea.

Buttons:

- Teach ScoutLoop
- Re-run with learned context

### Mubit lesson panel

Show:

- Latest lesson stored
- Lessons applied to this run
- Before/after question improvement

## Text upload UX

Accept:

- `.txt`
- `.md`
- `.csv`
- `.json`

Reject:

- `.pdf`
- `.docx`
- images
- binary files

Max size:

- use `SCOUTLOOP_MAX_TEXT_FILE_BYTES`, default 100 KB.

## Visual style

Use:

- shadcn/ui cards
- Tailwind grid layouts
- rounded-2xl
- soft shadows
- clean white or dark template-compatible mode
- compact score badges
- simple progress states

Avoid:

- too many charts
- huge paragraphs
- noisy gradients
- generic chatbot-only interface

## Demo seed examples

Add seed buttons:

1. "AI Agent Startup"
2. "Hackathon Project"
3. "Sustainability SaaS"
4. "Procurement AI Tool"

Seed data should work without external dependencies for emergency demo fallback.

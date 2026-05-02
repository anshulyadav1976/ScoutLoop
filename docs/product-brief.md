# Product Brief — ScoutLoop

## One-liner

ScoutLoop is a durable, self-improving due diligence agent that turns a startup URL, pitch text, or text document into an evidence-backed evaluation dashboard for startup judges, hackathon judges, accelerators, and early-stage VCs.

## Problem

Evaluators often judge startups/projects quickly with incomplete information. They need to understand:

- What does this project do?
- Is the problem real?
- Is the market meaningful?
- Who are the competitors?
- Is the moat real or fake?
- What questions should we ask the founders?
- Is this useful, impressive, and credible?

Current LLM tools can produce generic summaries, but they often:

- hallucinate facts
- lack evidence
- do not track confidence
- do not learn from evaluator feedback
- do not provide structured judging dashboards

## Solution

ScoutLoop runs a durable evaluation workflow that gathers evidence, extracts claims, scores the opportunity, generates tough founder questions, and learns from judge/VC feedback using Mubit.

## Target users

Primary:

- Hackathon judges
- Startup competition judges
- Accelerator screeners
- Early-stage VC analysts
- Angel investors

Secondary:

- Founders preparing for pitch review
- Startup advisors
- University entrepreneurship teams

## Core user flow

1. User selects mode:
   - Startup Judge
   - Hackathon Judge
2. User enters startup/project URL.
3. User optionally pastes pitch text.
4. User optionally uploads a text-based document.
5. ScoutLoop runs a durable workflow.
6. Dashboard appears.
7. User gives feedback.
8. Mubit stores a learning.
9. User re-runs evaluation and sees sharper output.

## Two modes

### Startup Judge

For VCs, accelerators, and startup competitions.

Focus:

- market size
- problem pain
- customer
- business model
- competition
- moat
- founder-market fit
- traction
- investment risks
- founder questions

### Hackathon Judge

For hackathons and technical demos.

Focus:

- usefulness
- technical execution
- creativity/originality
- demo clarity
- sponsor integration
- shipping completeness
- post-hackathon potential
- risks and next steps
- questions judges should ask

## Hackathon-winning demo moment

Run 1 generates a decent but slightly generic evaluation.

The user gives feedback:

> The founder questions are too generic. Focus more on technical defensibility, distribution, and data advantage.

Mubit stores this as a lesson.

Run 2 generates sharper questions:

- If OpenAI or Anthropic shipped this as a feature, what survives?
- What proprietary execution data improves the product after every run?
- What workflow lock-in appears after 30 days of use?
- Which acquisition channel reaches decision-makers before incumbents copy this?

The evaluator sees that ScoutLoop does not merely remember facts. It learns how to evaluate better.

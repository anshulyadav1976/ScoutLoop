# Scoring Rubric

ScoutLoop has two scoring modes.

## Shared output rules

Every score must include:

- score out of 10
- short explanation
- confidence: low / medium / high
- evidence references where available

Do not fake precision.

## Startup Judge Mode

Use this for VC, accelerator, and startup competition evaluation.

### Categories

| Category | Weight | Notes |
|---|---:|---|
| Problem severity | 15% | Is the pain urgent and real? |
| Market opportunity | 15% | TAM/SAM/SOM hypothesis and reachability |
| Product clarity | 10% | Does the product make sense quickly? |
| Customer / ICP clarity | 10% | Is the buyer/user clear? |
| Competitive differentiation | 15% | Why this over alternatives? |
| Technical/business moat | 15% | What gets harder to copy over time? |
| Distribution strategy | 10% | How will users/customers be acquired? |
| Evidence quality / traction | 10% | Public proof, customers, usage, GitHub, testimonials |

### Output

```txt
Overall score: 7.2 / 10
Confidence: Medium
Main reason: Strong problem clarity but uncertain distribution and limited public traction.
```

## Hackathon Judge Mode

Use this for hackathon project evaluation.

### Categories

| Category | Weight | Notes |
|---|---:|---|
| Usefulness | 25% | Would anyone actually use it? |
| Technical execution | 25% | Is it working, deployed, technically credible? |
| Creativity / originality | 20% | Is it surprising or differentiated? |
| Demo clarity | 10% | Can judges understand it quickly? |
| Sponsor/stack integration | 10% | Are Vercel/Mubit/Bright Data used meaningfully? |
| Post-hackathon potential | 10% | Could it become a real product? |

These align with the hackathon judging rubric: usefulness, technical execution, and creativity/originality.

## TAM / SAM / SOM output

Do not fabricate exact market sizes.

Use:

```txt
TAM hypothesis:
SAM hypothesis:
SOM hypothesis:
Confidence:
Evidence:
Missing data:
```

Example:

```txt
TAM hypothesis:
Global tools for AI-powered startup evaluation, diligence, and accelerator screening.

SAM hypothesis:
Accelerators, university competitions, angel networks, and early-stage VC teams that screen high volumes of startups.

SOM hypothesis:
Hackathon organizers and startup programs that need lightweight judging support.

Confidence:
Medium-low. Public evidence supports the workflow pain, but market size was not validated with paid research.
```

## Founder questions

Each question should be tagged:

- Problem
- Market
- Moat
- Competition
- Distribution
- Technical
- Traction
- Founder quality
- Risk

Questions must be sharp, specific, and non-generic.

import { z } from "zod";

const confidenceSchema = z.enum(["low", "medium", "high"]);

const evidenceCardSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  snippet: z.string(),
  sourceType: z.enum([
    "homepage",
    "search",
    "competitor",
    "market",
    "pitch",
    "uploaded_text",
  ]),
  confidence: confidenceSchema,
});

export const scoutLoopEvaluationSchema = z.object({
  startupName: z.string(),
  summary: z.string(),
  problem: z.string(),
  targetCustomer: z.string(),
  marketSizing: z.object({
    tamHypothesis: z.string(),
    samHypothesis: z.string(),
    somHypothesis: z.string(),
    confidence: confidenceSchema,
    missingData: z.array(z.string()),
  }),
  competitors: z.array(
    z.object({
      name: z.string(),
      type: z.enum(["direct", "indirect", "alternative", "do_nothing"]),
      description: z.string(),
      evidenceIds: z.array(z.string()),
    })
  ),
  differentiation: z.array(z.string()),
  moat: z.array(z.string()),
  businessModel: z.string(),
  distribution: z.string(),
  tractionSignals: z.array(z.string()),
  risks: z.array(
    z.object({
      risk: z.string(),
      severity: z.enum(["low", "medium", "high"]),
      mitigation: z.string(),
    })
  ),
  scorecard: z.array(
    z.object({
      category: z.string(),
      score: z.number().min(0).max(10),
      weight: z.number(),
      explanation: z.string(),
      confidence: confidenceSchema,
      evidenceIds: z.array(z.string()),
    })
  ),
  overallScore: z.number().min(0).max(10),
  overallConfidence: confidenceSchema,
  founderQuestions: z.array(
    z.object({
      question: z.string(),
      category: z.enum([
        "problem",
        "market",
        "moat",
        "competition",
        "distribution",
        "technical",
        "traction",
        "founder_quality",
        "risk",
      ]),
      whyAsk: z.string(),
      severity: z.enum(["low", "medium", "high"]),
    })
  ),
  evidenceCards: z.array(evidenceCardSchema),
  warnings: z.array(z.string()),
});

export type ScoutLoopEvaluationOutput = z.infer<
  typeof scoutLoopEvaluationSchema
>;

# Data Model

Use TypeScript types first. Database persistence is optional for hackathon MVP.

## Core input

```ts
export type EvaluationMode = "startup_judge" | "hackathon_judge";

export type ScoutLoopInput = {
  url?: string;
  pitchText?: string;
  uploadedTexts?: UploadedTextDocument[];
  mode: EvaluationMode;
};
```

## Uploaded text document

```ts
export type UploadedTextDocument = {
  fileName: string;
  mimeType?: string;
  sizeBytes: number;
  text: string;
};
```

## Evidence

```ts
export type EvidenceCard = {
  id: string;
  title: string;
  url?: string;
  snippet: string;
  sourceType:
    | "homepage"
    | "search"
    | "competitor"
    | "market"
    | "pitch"
    | "uploaded_text";
  confidence: "low" | "medium" | "high";
};
```

## Score

```ts
export type ScoreItem = {
  category: string;
  score: number;
  weight?: number;
  explanation: string;
  confidence: "low" | "medium" | "high";
  evidenceIds?: string[];
};
```

## Founder question

```ts
export type FounderQuestion = {
  question: string;
  category:
    | "problem"
    | "market"
    | "moat"
    | "competition"
    | "distribution"
    | "technical"
    | "traction"
    | "founder_quality"
    | "risk";
  whyAsk: string;
  severity: "low" | "medium" | "high";
};
```

## Evaluation result

```ts
export type ScoutLoopEvaluation = {
  id: string;
  mode: EvaluationMode;
  createdAt: string;
  startupName?: string;
  url?: string;
  summary: string;
  problem: string;
  targetCustomer: string;
  marketSizing: {
    tamHypothesis: string;
    samHypothesis: string;
    somHypothesis: string;
    confidence: "low" | "medium" | "high";
    missingData: string[];
  };
  competitors: {
    name: string;
    type: "direct" | "indirect" | "alternative" | "do_nothing";
    description: string;
    evidenceIds?: string[];
  }[];
  differentiation: string[];
  moat: string[];
  businessModel: string;
  distribution: string;
  tractionSignals: string[];
  risks: {
    risk: string;
    severity: "low" | "medium" | "high";
    mitigation?: string;
  }[];
  scorecard: ScoreItem[];
  overallScore: number;
  overallConfidence: "low" | "medium" | "high";
  founderQuestions: FounderQuestion[];
  evidenceCards: EvidenceCard[];
  lessonsApplied: MemoryLesson[];
  warnings: string[];
};
```

## Memory lesson

```ts
export type MemoryLesson = {
  id: string;
  lesson: string;
  source: "mubit" | "local_fallback";
  createdAt?: string;
  relevance?: number;
};
```

## Feedback

```ts
export type EvaluatorFeedback = {
  evaluationId: string;
  quickFeedback: string[];
  customFeedback?: string;
  mode: EvaluationMode;
  createdAt: string;
};
```

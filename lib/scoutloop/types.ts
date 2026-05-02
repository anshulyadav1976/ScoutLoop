export type EvaluationMode = "startup_judge" | "hackathon_judge";

export type Confidence = "low" | "medium" | "high";

export type UploadedTextDocument = {
  fileName: string;
  mimeType?: string;
  sizeBytes: number;
  text: string;
};

export type ScoutLoopInput = {
  url?: string;
  pitchText?: string;
  uploadedTexts?: UploadedTextDocument[];
  mode: EvaluationMode;
  rerunOf?: string;
};

export type NormalizedScoutLoopInput = {
  url?: string;
  pitchText: string;
  uploadedTexts: UploadedTextDocument[];
  mode: EvaluationMode;
  mergedContext: string;
  projectName: string;
};

export type EvidenceSourceType =
  | "homepage"
  | "search"
  | "competitor"
  | "market"
  | "pitch"
  | "uploaded_text";

export type EvidenceCard = {
  id: string;
  title: string;
  url?: string;
  snippet: string;
  sourceType: EvidenceSourceType;
  confidence: Confidence;
};

export type SearchResult = {
  title: string;
  url?: string;
  snippet: string;
};

export type ScrapedPage = {
  url: string;
  title?: string;
  markdown: string;
};

export type EvidenceBundle = {
  homepage?: ScrapedPage;
  searchResults: SearchResult[];
  competitorResults: SearchResult[];
  marketResults: SearchResult[];
  evidenceCards: EvidenceCard[];
  warnings: string[];
};

export type ScoreItem = {
  category: string;
  score: number;
  weight?: number;
  explanation: string;
  confidence: Confidence;
  evidenceIds?: string[];
};

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

export type Competitor = {
  name: string;
  type: "direct" | "indirect" | "alternative" | "do_nothing";
  description: string;
  evidenceIds?: string[];
};

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
    confidence: Confidence;
    missingData: string[];
  };
  competitors: Competitor[];
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
  overallConfidence: Confidence;
  founderQuestions: FounderQuestion[];
  evidenceCards: EvidenceCard[];
  lessonsApplied: MemoryLesson[];
  warnings: string[];
  workflowEvents?: WorkflowEvent[];
};

export type MemoryLesson = {
  id: string;
  lesson: string;
  source: "mubit" | "local_fallback";
  createdAt?: string;
  relevance?: number;
};

export type EvaluatorFeedback = {
  evaluationId: string;
  quickFeedback: string[];
  customFeedback?: string;
  mode: EvaluationMode;
  createdAt: string;
};

export type MemoryRecallContext = {
  mode: EvaluationMode;
  projectName?: string;
  pitchText?: string;
};

export type RunOutcome = {
  evaluationId: string;
  mode: EvaluationMode;
  overallScore: number;
  warnings: string[];
};

export type WorkflowEvent = {
  id: string;
  label: string;
  status: "pending" | "active" | "complete" | "warning";
  detail?: string;
  at?: string;
};

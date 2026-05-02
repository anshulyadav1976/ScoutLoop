import type {
  EvaluationMode,
  ScoutLoopInput,
  WorkflowEvent,
} from "@/lib/scoutloop/types";

export const SCOUTLOOP_MAX_TEXT_FILE_BYTES = 100_000;

export const evaluationModes: {
  id: EvaluationMode;
  label: string;
  description: string;
}[] = [
  {
    id: "startup_judge",
    label: "Startup Judge",
    description: "VC, accelerator, and startup competition diligence.",
  },
  {
    id: "hackathon_judge",
    label: "Hackathon Judge",
    description:
      "Usefulness, technical execution, creativity, and demo polish.",
  },
];

export const techBadges = [
  "v0 inference",
  "WDK durable workflow",
  "Bright Data evidence",
  "Mubit learning",
  "Neon Postgres",
  "Vercel-ready",
];

export const workflowTimeline: WorkflowEvent[] = [
  { id: "normalize", label: "Normalizing input", status: "pending" },
  { id: "lessons", label: "Recalling Mubit lessons", status: "pending" },
  { id: "evidence", label: "Gathering public evidence", status: "pending" },
  { id: "claims", label: "Extracting claims", status: "pending" },
  { id: "competitors", label: "Identifying competitors", status: "pending" },
  { id: "market", label: "Estimating market hypotheses", status: "pending" },
  { id: "scorecard", label: "Generating scorecard", status: "pending" },
  {
    id: "questions",
    label: "Generating evaluator questions",
    status: "pending",
  },
  { id: "feedback", label: "Ready for feedback", status: "pending" },
];

export const startupScoreCategories = [
  "Problem severity",
  "Market opportunity",
  "Product clarity",
  "Customer / ICP clarity",
  "Competitive differentiation",
  "Technical/business moat",
  "Distribution strategy",
  "Evidence quality / traction",
];

export const hackathonScoreCategories = [
  "Usefulness",
  "Technical execution",
  "Creativity / originality",
  "Demo clarity",
  "Sponsor/stack integration",
  "Post-hackathon potential",
];

export const quickFeedbackOptions = [
  "Too generic",
  "Missed competitors",
  "Questions too soft",
  "Over-scored",
  "Under-scored",
  "Needs more technical scrutiny",
  "Needs more market scrutiny",
  "Good evaluation",
];

export const sharperQuestionExamples = [
  "If OpenAI or Anthropic ships this as a feature, what survives?",
  "What proprietary execution data improves the product over time?",
  "What workflow lock-in appears after 30 days?",
  "Which distribution channel reaches decision-makers before incumbents copy the feature?",
];

export const seedInputs: {
  label: string;
  input: ScoutLoopInput;
}[] = [
  {
    label: "AI Agent Startup",
    input: {
      mode: "startup_judge",
      url: "https://example.com",
      pitchText:
        "ScoutLoop is a due diligence agent for startup and hackathon judges. It gathers public evidence, scores companies, and learns from evaluator feedback to generate sharper founder questions over time.",
      uploadedTexts: [],
    },
  },
  {
    label: "Hackathon Project",
    input: {
      mode: "hackathon_judge",
      url: "https://example.com/demo",
      pitchText:
        "A Vercel-native judging assistant that uses v0, WDK, Bright Data, Mubit, and Neon to evaluate submissions, show progress, and improve after judge feedback.",
      uploadedTexts: [],
    },
  },
  {
    label: "Sustainability SaaS",
    input: {
      mode: "startup_judge",
      pitchText:
        "A lightweight SaaS for mid-market manufacturers to track supplier emissions from uploaded procurement records and produce audit-ready summaries.",
      uploadedTexts: [],
    },
  },
  {
    label: "Procurement AI Tool",
    input: {
      mode: "startup_judge",
      pitchText:
        "An AI copilot for procurement teams that reviews vendor contracts, flags renewal risk, and suggests negotiation questions using customer-specific spend history.",
      uploadedTexts: [],
    },
  },
];

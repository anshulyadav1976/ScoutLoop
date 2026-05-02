import { sharperQuestionExamples } from "@/lib/scoutloop/constants";
import type {
  EvidenceCard,
  MemoryLesson,
  NormalizedScoutLoopInput,
  ScoutLoopEvaluation,
} from "@/lib/scoutloop/types";

export function createDemoEvidence(input: NormalizedScoutLoopInput) {
  const cards: EvidenceCard[] = [];

  if (input.url) {
    cards.push({
      id: "ev-homepage",
      title: "Provided project URL",
      url: input.url,
      snippet:
        "The URL was provided by the evaluator. Live public evidence may be enriched when Bright Data is configured.",
      sourceType: "homepage",
      confidence: "medium",
    });
  }

  if (input.pitchText.trim()) {
    cards.push({
      id: "ev-pitch",
      title: "Provided pitch text",
      snippet: input.pitchText.trim().slice(0, 260),
      sourceType: "pitch",
      confidence: "high",
    });
  }

  for (const document of input.uploadedTexts) {
    cards.push({
      id: `ev-upload-${document.fileName}`,
      title: document.fileName,
      snippet: document.text.trim().slice(0, 260),
      sourceType: "uploaded_text",
      confidence: "high",
    });
  }

  return cards;
}

export function createFallbackEvaluation({
  input,
  evidenceCards,
  lessons,
  warnings = [],
}: {
  input: NormalizedScoutLoopInput;
  evidenceCards?: EvidenceCard[];
  lessons?: MemoryLesson[];
  warnings?: string[];
}): ScoutLoopEvaluation {
  const cards = evidenceCards?.length
    ? evidenceCards
    : createDemoEvidence(input);
  const lessonText = lessons
    ?.map((lesson) => lesson.lesson.toLowerCase())
    .join(" ");
  const useSharperQuestions =
    lessonText?.includes("defensibility") ||
    lessonText?.includes("distribution") ||
    lessonText?.includes("data advantage");

  const defaultQuestions =
    input.mode === "hackathon_judge"
      ? [
          "Which part of the demo proves the product is working end-to-end?",
          "What would break if the project had 100 real users tomorrow?",
          "Which sponsor integration is essential to the user value, not decorative?",
        ]
      : [
          "Who is the exact buyer and what urgent pain forces a purchase?",
          "Which competitors or manual workflows do customers use today?",
          "What evidence shows users will repeat this workflow?",
        ];

  const questions = useSharperQuestions
    ? sharperQuestionExamples
    : defaultQuestions;

  return {
    id: crypto.randomUUID(),
    mode: input.mode,
    createdAt: new Date().toISOString(),
    startupName: input.projectName,
    url: input.url,
    summary:
      "ScoutLoop produced a conservative fallback evaluation from provided text and available evidence. Treat public-market and traction claims as hypotheses until verified.",
    problem:
      "The provided context suggests a workflow pain around evaluating early-stage products quickly with better evidence, scoring discipline, and reusable evaluator judgment.",
    targetCustomer:
      input.mode === "hackathon_judge"
        ? "Hackathon judges, sponsor reviewers, and organizers who need fast project triage."
        : "Startup judges, accelerators, angel investors, and early-stage VC-style screeners.",
    marketSizing: {
      tamHypothesis:
        "Tools and services for startup diligence, judging, accelerator screening, and AI-assisted research.",
      samHypothesis:
        "Programs and investment teams that screen many early-stage companies with limited analyst time.",
      somHypothesis:
        "Hackathon and accelerator teams willing to adopt lightweight evaluation support before broader VC workflows.",
      confidence: "low",
      missingData: [
        "Paid market research",
        "Customer willingness-to-pay evidence",
        "Observed usage or retention data",
      ],
    },
    competitors: [
      {
        name: "Manual judging spreadsheets",
        type: "alternative",
        description:
          "Common default workflow; flexible but weak at evidence capture and learning from feedback.",
      },
      {
        name: "Generic LLM research workflows",
        type: "indirect",
        description:
          "Can summarize a pitch but often lacks durable progress, confidence labels, and learning loops.",
      },
      {
        name: "Do nothing",
        type: "do_nothing",
        description:
          "Judges rely on pitch decks, quick searches, and intuition under time pressure.",
      },
    ],
    differentiation: [
      "Dashboard-first output instead of a generic chat transcript.",
      "Explicit confidence and missing evidence labels.",
      "Evaluator feedback becomes reusable operational memory.",
    ],
    moat: [
      "Potential workflow lock-in if teams standardize rubrics, feedback, and evidence trails.",
      "Potential data advantage from repeated evaluation outcomes and judge corrections.",
    ],
    businessModel:
      "Likely SaaS or usage-based pricing for accelerators, competitions, and screening teams. Pricing evidence is not available in the provided context.",
    distribution:
      "Most plausible early channels are hackathon organizers, accelerator operators, university entrepreneurship programs, and VC analyst communities.",
    tractionSignals: [
      "No verified public traction was found in fallback mode.",
      "Demo completeness and sponsor integration can be assessed during judging.",
    ],
    risks: [
      {
        risk: "Evaluation quality may become generic without strong evidence and feedback loops.",
        severity: "high",
        mitigation:
          "Use Bright Data evidence, confidence labels, and Mubit lessons to sharpen repeated runs.",
      },
      {
        risk: "Market size and traction claims are under-supported.",
        severity: "medium",
        mitigation:
          "Ask founders for usage, willingness-to-pay, and buyer proof.",
      },
    ],
    scorecard:
      input.mode === "hackathon_judge"
        ? [
            {
              category: "Usefulness",
              score: 7,
              weight: 25,
              explanation:
                "The workflow is useful for judges if the evidence and feedback loop work reliably.",
              confidence: "medium",
            },
            {
              category: "Technical execution",
              score: 7,
              weight: 25,
              explanation:
                "The architecture is credible, but live integrations should be demonstrated.",
              confidence: "medium",
            },
            {
              category: "Creativity / originality",
              score: 7,
              weight: 20,
              explanation:
                "The self-improving evaluation loop is more distinctive than a one-shot report.",
              confidence: "medium",
            },
          ]
        : [
            {
              category: "Problem severity",
              score: 7,
              weight: 15,
              explanation:
                "High-volume early-stage screening is a real workflow pain, but urgency varies by evaluator.",
              confidence: "medium",
            },
            {
              category: "Competitive differentiation",
              score: 6,
              weight: 15,
              explanation:
                "Differentiation depends on durable workflow, evidence quality, and memory actually improving outputs.",
              confidence: "medium",
            },
            {
              category: "Evidence quality / traction",
              score: 4,
              weight: 10,
              explanation:
                "Fallback mode has limited public verification and should not infer traction.",
              confidence: "low",
            },
          ],
    overallScore: input.mode === "hackathon_judge" ? 7.1 : 6.4,
    overallConfidence: "medium",
    founderQuestions: questions.map((question, index) => ({
      question,
      category:
        useSharperQuestions && index < 2
          ? index === 0
            ? "moat"
            : "technical"
          : "risk",
      whyAsk:
        "This tests whether the project has evidence-backed substance beyond a polished pitch.",
      severity: index === 0 ? "high" : "medium",
    })),
    evidenceCards: cards,
    lessonsApplied: lessons ?? [],
    warnings: [
      ...warnings,
      "Fallback evaluation used conservative assumptions and did not invent revenue, users, funding, or customers.",
    ],
  };
}

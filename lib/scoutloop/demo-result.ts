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
        "The URL was provided by the evaluator. ScoutLoop could not verify page content unless Bright Data scraping succeeds.",
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
      "ScoutLoop could not complete live structured research for this run. This fallback is limited to provided text and explicitly marks missing public evidence.",
    problem: input.pitchText
      ? "Problem statement inferred only from the provided pitch text. Public validation was not verified in this fallback."
      : "Insufficient evidence. Add pitch text, uploaded notes, or configure Bright Data scraping to evaluate the problem.",
    targetCustomer:
      "Unknown from verified evidence. Treat any target customer claim as unvalidated unless it appears in the provided pitch or live evidence.",
    marketSizing: {
      tamHypothesis:
        "Unknown. ScoutLoop did not fabricate a market category without verified evidence.",
      samHypothesis:
        "Unknown. Provide pitch context or enable Bright Data evidence to form a defensible SAM hypothesis.",
      somHypothesis:
        "Unknown. No credible SOM estimate can be made from missing evidence.",
      confidence: "low",
      missingData: [
        "Paid market research",
        "Customer willingness-to-pay evidence",
        "Observed usage or retention data",
      ],
    },
    competitors: [
      {
        name: "No verified competitor evidence",
        type: "direct",
        description:
          "Bright Data/live evidence did not return usable competitor data for this fallback run.",
      },
    ],
    differentiation: [
      "Unknown from verified evidence.",
      "Provide stronger source material or enable Bright Data to assess differentiation.",
    ],
    moat: [
      "Unknown from verified evidence.",
      "Ask founders for proof of technical defensibility, proprietary data, switching costs, or distribution advantage.",
    ],
    businessModel:
      "Unknown from verified evidence. ScoutLoop did not infer pricing or revenue model.",
    distribution:
      "Unknown from verified evidence. Ask founders for acquisition channel proof.",
    tractionSignals: [
      "No verified traction signals were available in fallback mode.",
      "Do not infer users, revenue, customers, funding, retention, or usage.",
    ],
    risks: [
      {
        risk: "Evaluation quality may become generic without strong evidence and feedback loops.",
        severity: "high",
        mitigation:
          "Configure Bright Data evidence and provide concrete source material before trusting the score.",
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
                "Insufficient verified evidence. Score is intentionally conservative until live research succeeds.",
              confidence: "low",
            },
            {
              category: "Technical execution",
              score: 7,
              weight: 25,
              explanation:
                "Cannot verify technical execution from fallback evidence.",
              confidence: "low",
            },
            {
              category: "Creativity / originality",
              score: 7,
              weight: 20,
              explanation:
                "Originality cannot be assessed without competitor and product evidence.",
              confidence: "low",
            },
          ]
        : [
            {
              category: "Problem severity",
              score: 7,
              weight: 15,
              explanation:
                "Problem severity cannot be verified from fallback evidence alone.",
              confidence: "low",
            },
            {
              category: "Competitive differentiation",
              score: 6,
              weight: 15,
              explanation: "No verified competitor evidence was available.",
              confidence: "low",
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
    overallScore: 4,
    overallConfidence: "low",
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
      "Fallback mode: no fake companies, customers, revenue, funding, traction, or market numbers were generated.",
    ],
  };
}

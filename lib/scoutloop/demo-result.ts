import { sharperQuestionExamples } from "@/lib/scoutloop/constants";
import type {
  EvidenceCard,
  FounderQuestion,
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
  const hasPublicEvidence = cards.some((card) =>
    ["homepage", "search", "competitor", "market"].includes(card.sourceType)
  );
  const publicEvidenceCount = cards.filter((card) =>
    ["homepage", "search", "competitor", "market"].includes(card.sourceType)
  ).length;
  const competitorCards = cards.filter(
    (card) => card.sourceType === "competitor"
  );
  const marketCards = cards.filter((card) => card.sourceType === "market");
  const pitchCards = cards.filter((card) =>
    ["pitch", "uploaded_text"].includes(card.sourceType)
  );
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
  const evidenceIds = cards.map((card) => card.id);
  const primaryEvidence = cards
    .slice(0, 4)
    .map((card) => `${card.title}: ${card.snippet}`)
    .join(" ");
  const sourceSummary = hasPublicEvidence
    ? `Bright Data returned ${publicEvidenceCount} public evidence card${
        publicEvidenceCount === 1 ? "" : "s"
      }.`
    : "Only evaluator-provided text was available.";
  const deterministicWarning =
    "Deterministic fallback: model generation was unavailable, so ScoutLoop summarized real evidence without inventing unsupported claims.";
  const publicEvidenceConfidence = publicEvidenceCount >= 4 ? "medium" : "low";
  const overallScore = hasPublicEvidence
    ? Math.min(7, 4 + Math.floor(publicEvidenceCount / 3))
    : 4;
  const competitorList = competitorCards.length
    ? competitorCards.slice(0, 3).map((card) => ({
        name: card.title,
        type: "alternative" as const,
        description: card.snippet,
        evidenceIds: [card.id],
      }))
    : [
        {
          name: "No verified competitor evidence",
          type: "direct" as const,
          description:
            "No competitor evidence was available from Bright Data or provided source material.",
        },
      ];
  const founderQuestions = questions.map((question, index) => ({
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
  })) satisfies FounderQuestion[];

  return {
    id: crypto.randomUUID(),
    mode: input.mode,
    createdAt: new Date().toISOString(),
    startupName: input.projectName,
    url: input.url,
    summary: `${sourceSummary} ScoutLoop produced a conservative evidence-backed evaluation because live structured generation was unavailable.`,
    problem: input.pitchText
      ? `Problem statement inferred from provided pitch/context and checked against collected evidence. ${primaryEvidence.slice(
          0,
          260
        )}`
      : hasPublicEvidence
        ? `Problem statement requires founder clarification. Public evidence found: ${primaryEvidence.slice(
            0,
            260
          )}`
        : "Insufficient evidence. Add pitch text, uploaded notes, or configure Bright Data scraping to evaluate the problem.",
    targetCustomer:
      pitchCards.length > 0
        ? "Target customer should be validated from the submitted pitch/uploaded text; ScoutLoop will not infer a buyer persona that is not explicitly evidenced."
        : "Unknown from verified evidence. Treat any target customer claim as unvalidated unless it appears in the pitch or public evidence.",
    marketSizing: {
      tamHypothesis:
        marketCards[0]?.snippet ??
        "Unknown. ScoutLoop did not fabricate a market category without verified evidence.",
      samHypothesis:
        marketCards[1]?.snippet ??
        "Unknown. Provide pitch context or stronger market evidence to form a defensible SAM hypothesis.",
      somHypothesis:
        "Unknown. No credible SOM estimate can be made from missing evidence.",
      confidence: marketCards.length ? "medium" : "low",
      missingData: [
        "Paid market research",
        "Customer willingness-to-pay evidence",
        "Observed usage or retention data",
      ],
    },
    competitors: competitorList,
    differentiation: hasPublicEvidence
      ? [
          "Differentiation is not proven by public search evidence alone.",
          "Use the evidence cards to ask founders what is proprietary, hard to copy, or materially better than alternatives.",
        ]
      : [
          "Unknown from verified evidence.",
          "Provide stronger source material or enable Bright Data to assess differentiation.",
        ],
    moat: [
      hasPublicEvidence
        ? "No durable moat was proven by the collected public evidence."
        : "Unknown from verified evidence.",
      "Ask founders for proof of technical defensibility, proprietary data, switching costs, or distribution advantage.",
    ],
    businessModel:
      "Unknown unless explicitly stated in submitted or public evidence. ScoutLoop did not infer pricing or revenue model.",
    distribution:
      "Unknown unless explicitly stated in submitted or public evidence. Ask founders for acquisition channel proof.",
    tractionSignals: hasPublicEvidence
      ? [
          "Public evidence was found, but it does not by itself verify users, revenue, customers, funding, retention, or usage.",
          "Ask for concrete traction artifacts before increasing confidence.",
        ]
      : [
          "No verified traction signals were available.",
          "Do not infer users, revenue, customers, funding, retention, or usage.",
        ],
    risks: [
      {
        risk: "LLM provider unavailable, so this run used deterministic evidence synthesis instead of v0 structured generation.",
        severity: "high",
        mitigation:
          "Enable v0 Model API access or add another AI SDK provider key for richer structured analysis.",
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
              score: hasPublicEvidence ? 6 : 4,
              weight: 25,
              explanation:
                "Score is conservative and tied only to available submitted/public evidence.",
              confidence: publicEvidenceConfidence,
              evidenceIds,
            },
            {
              category: "Technical execution",
              score: 4,
              weight: 25,
              explanation:
                "Cannot verify technical execution from public/search evidence alone.",
              confidence: "low",
            },
            {
              category: "Creativity / originality",
              score: hasPublicEvidence ? 5 : 4,
              weight: 20,
              explanation:
                "Originality requires competitor comparison and working-demo proof.",
              confidence: publicEvidenceConfidence,
              evidenceIds: competitorCards.map((card) => card.id),
            },
          ]
        : [
            {
              category: "Problem severity",
              score: hasPublicEvidence ? 6 : 4,
              weight: 15,
              explanation:
                "Problem severity is partially supported only when the pitch/public evidence states a clear pain.",
              confidence: publicEvidenceConfidence,
              evidenceIds,
            },
            {
              category: "Competitive differentiation",
              score: competitorCards.length ? 5 : 4,
              weight: 15,
              explanation:
                "Competitor evidence exists, but differentiation is not proven without founder/customer proof.",
              confidence: competitorCards.length ? "medium" : "low",
              evidenceIds: competitorCards.map((card) => card.id),
            },
            {
              category: "Evidence quality / traction",
              score: hasPublicEvidence ? 5 : 4,
              weight: 10,
              explanation:
                "Bright Data evidence improves public verification, but traction remains unverified.",
              confidence: publicEvidenceConfidence,
              evidenceIds,
            },
          ],
    overallScore,
    overallConfidence: publicEvidenceConfidence,
    founderQuestions,
    evidenceCards: cards,
    lessonsApplied: lessons ?? [],
    warnings: [
      ...warnings,
      deterministicWarning,
      "No fake companies, customers, revenue, funding, traction, or market numbers were generated.",
    ],
  };
}

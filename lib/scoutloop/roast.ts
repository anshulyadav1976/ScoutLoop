/**
 * Client-side roast report generator.
 * Derives sharp, evidence-backed roast copy deterministically from an
 * existing ScoutLoopEvaluation. No new API calls, no hallucinated facts.
 *
 * Style note: Sharp startup-Twitter / VC roast energy, not childish memes.
 * Useful first, funny second. Roast the strategy and evidence gaps — never
 * personal identity, protected traits, or invented facts.
 */

import type { Confidence, ScoutLoopEvaluation } from "@/lib/scoutloop/types";

export type RoastSection = {
  id: string;
  title: string;
  badge: string;
  score: number;
  roast: string;
  usefulTruth: string;
  improve: string;
  insight: string;
  confidence: Confidence;
};

export type RoastReport = {
  threatLabel: string;
  threatIntensity: "critical" | "high" | "medium" | "low" | "safe";
  overallRoast: string;
  seriousSummary: string;
  sections: RoastSection[];
  finalVerdict: {
    punchline: string;
    bestThing: string;
    biggestConcern: string;
    fastestWayToImprove: string;
  };
};

export function scoreToThreatLabel(score: number): string {
  if (score < 3) {
    return "Slide Deck in Witness Protection";
  }
  if (score < 5) {
    return "Interesting, But Held Together With Duct Tape";
  }
  if (score < 7) {
    return "Potentially Dangerous If They Learn Distribution";
  }
  if (score < 8.5) {
    return "Actually Cooking";
  }
  return "Investor Group Chat Emergency";
}

export function scoreToThreatIntensity(
  score: number
): RoastReport["threatIntensity"] {
  if (score < 3) {
    return "critical";
  }
  if (score < 5) {
    return "high";
  }
  if (score < 7) {
    return "medium";
  }
  if (score < 8.5) {
    return "low";
  }
  return "safe";
}

function findScorecardScore(
  evaluation: ScoutLoopEvaluation,
  keywords: string[]
): number | undefined {
  const item = evaluation.scorecard.find((s) =>
    keywords.some((kw) => s.category.toLowerCase().includes(kw.toLowerCase()))
  );
  return item?.score;
}

function bestThing(evaluation: ScoutLoopEvaluation): string {
  const topItem = [...evaluation.scorecard].sort(
    (a, b) => b.score - a.score
  )[0];
  if (topItem && topItem.score >= 7) {
    return `${topItem.category}: ${topItem.explanation}`;
  }
  if (evaluation.tractionSignals.length > 0) {
    return evaluation.tractionSignals[0];
  }
  if (evaluation.differentiation.length > 0) {
    return evaluation.differentiation[0];
  }
  return evaluation.summary.slice(0, 120);
}

function biggestConcern(evaluation: ScoutLoopEvaluation): string {
  const highRisk = evaluation.risks.find((r) => r.severity === "high");
  if (highRisk) {
    return highRisk.risk;
  }

  const bottomItem = [...evaluation.scorecard].sort(
    (a, b) => a.score - b.score
  )[0];
  if (bottomItem && bottomItem.score < 6) {
    return `${bottomItem.category}: ${bottomItem.explanation}`;
  }

  return "Lack of public evidence makes confidence-weighted scoring difficult. More proof points needed.";
}

function fastestWayToImprove(evaluation: ScoutLoopEvaluation): string {
  const bottomItem = [...evaluation.scorecard].sort(
    (a, b) => a.score - b.score
  )[0];
  if (!bottomItem) {
    return "Add more customer evidence, distribution channels, and traction signals.";
  }

  const cat = bottomItem.category.toLowerCase();
  if (cat.includes("traction") || cat.includes("revenue")) {
    return "Get one paying customer or measurable usage metric. That single proof point improves every other section score.";
  }
  if (cat.includes("moat") || cat.includes("defensib")) {
    return "Define the proprietary data, workflow lock-in, or distribution advantage. One specific moat beats five vague claims.";
  }
  if (cat.includes("distribution") || cat.includes("go-to-market")) {
    return "Identify the first 10 customers by name or job title. A specific distribution path beats a general theory.";
  }
  if (cat.includes("market") || cat.includes("tam")) {
    return "Ground the TAM/SAM/SOM in a specific customer segment with a verifiable spend number.";
  }
  return `Improve ${bottomItem.category}: ${bottomItem.explanation}`;
}

type RoastCopy = {
  roast: string;
  usefulTruth: string;
  improve: string;
};

const bannedRoastPhrases = [
  "early innings",
  "real signal",
  "strong potential",
  "compelling opportunity",
  "important market",
  "robust",
  "leverage",
  "unlock",
  "delve",
  "landscape",
  "not fully cooked",
  "appears to be",
  "it is worth noting",
  "this suggests",
  "could potentially",
  "the story is",
  "genuine wound",
  "thought-leader hallucination",
  "fake moustache",
];

const questionRewrites: Record<string, string> = {
  moat: "If OpenAI, LangChain, or a cloud provider copies your top 3 features, what is still hard to replicate?",
  distribution:
    "If your first 100 users love this but zero enterprises buy it, what broke: product, trust, pricing, or distribution?",
  competition:
    "Which competitor scares you most, and what do you know that they are too big, slow, or distracted to notice?",
  traction:
    "What proof do you have that users are not just curious, but actually dependent?",
  technical:
    "Which technical claim survives contact with production traffic, angry users, and a security review?",
  problem:
    "What painful workflow makes buyers say 'fine, take the budget' instead of 'interesting, let's circle back'?",
  market:
    "Which tiny beachhead is real enough to sell into before the TAM spreadsheet starts doing circus tricks?",
  risk: "What is the one risk that kills this company if you pretend it is just a roadmap item?",
  founder_quality:
    "What have you learned that a better-funded competitor will only discover after wasting six months?",
};

function cleanBannedPhrases(text: string) {
  return bannedRoastPhrases.reduce(
    (current, phrase) =>
      current.replace(new RegExp(phrase, "gi"), "specific proof"),
    text
  );
}

export function sharpenRoastCopy(text: string) {
  return cleanBannedPhrases(text)
    .replace(/\bpromising\b/gi, "credible if the evidence holds")
    .replace(/\bsolution\b/gi, "product")
    .replace(/\busers may\b/gi, "users might")
    .replace(/\bthere is an opportunity\b/gi, "there is a shot")
    .trim();
}

function hasEvidence(evaluation: ScoutLoopEvaluation, words: string[]) {
  const haystack = [
    evaluation.summary,
    evaluation.problem,
    evaluation.targetCustomer,
    evaluation.businessModel,
    evaluation.distribution,
    evaluation.marketSizing.tamHypothesis,
    evaluation.marketSizing.samHypothesis,
    evaluation.marketSizing.somHypothesis,
    ...evaluation.evidenceCards.map((card) => card.snippet),
    ...evaluation.tractionSignals,
    ...evaluation.differentiation,
    ...evaluation.moat,
  ]
    .join(" ")
    .toLowerCase();

  return words.some((word) => haystack.includes(word));
}

function topCompetitorNames(evaluation: ScoutLoopEvaluation) {
  return evaluation.competitors
    .slice(0, 4)
    .map((competitor) => competitor.name)
    .filter(Boolean)
    .join(", ");
}

export function generateBrutalOverallThreat(evaluation: ScoutLoopEvaluation): {
  label: string;
  roast: string;
} {
  const score = evaluation.overallScore;
  const hasAi = hasEvidence(evaluation, ["ai", "agent", "model", "llm"]);
  const weakDistribution =
    evaluation.distribution.length < 90 ||
    /unclear|tbd|eventually|organic|community/i.test(evaluation.distribution);
  const weakMoat = evaluation.moat.length < 2;

  if (score >= 8.5) {
    return {
      label: "Investor Group Chat Emergency",
      roast:
        "This is not vaporware. Annoying, because I wanted to bully it properly. The company-shaped object is visible, and the score is high enough to make lazy competitors sweat.",
    };
  }
  if (score >= 7) {
    return {
      label: "Actually Cooking",
      roast: weakDistribution
        ? "The idea has teeth. The go-to-market plan is still chewing crayons, but the product logic is not embarrassing."
        : "This is cooking, and for once the kitchen is not just a Notion doc with a pricing page. Still needs harder proof before anyone gets cocky.",
    };
  }
  if (score >= 5) {
    return {
      label: "Company-Shaped Object Detected",
      roast: weakMoat
        ? "Not a guaranteed winner, but definitely not a Notion doc in a trench coat. The moat needs to stop whispering and start punching."
        : "There is an actual company-shaped object here. The pitch still needs a shower and a tighter argument.",
    };
  }
  if (score >= 3) {
    return {
      label: "Duct Tape With a Domain Name",
      roast:
        "The concept is alive, technically. Right now it is being held together by optimism, screenshots, and the founder's ability to explain around missing proof.",
    };
  }
  return {
    label: hasAi
      ? "AI Wrapper Court Appearance"
      : "Slide Deck in Witness Protection",
    roast:
      "This needs more than confidence and a URL. The evidence is too thin to roast the startup properly, so the evidence gap gets dragged instead.",
  };
}

export function generateProblemRoast(
  evaluation: ScoutLoopEvaluation
): RoastCopy {
  const isRegulated = hasEvidence(evaluation, [
    "regulated",
    "compliance",
    "legal",
    "audit",
    "security",
  ]);
  const isHackathon = evaluation.mode === "hackathon_judge";

  return {
    roast: isRegulated
      ? "Enterprises absolutely do hate unpredictable AI agents. Legal, compliance, and security teams see autonomous agents and immediately start hearing boss music."
      : isHackathon
        ? "The problem is understandable, which already puts it ahead of half the demo table. The danger is solving a judge-friendly inconvenience instead of a user-punching-the-wall problem."
        : "This problem exists. Customers are probably annoyed. The question is whether they are annoyed enough to pay, not just nod aggressively on a sales call.",
    usefulTruth: `The pain claim is: ${evaluation.problem} Target customer: ${evaluation.targetCustomer}`,
    improve:
      "Show named workflows, who owns the budget, and what breaks today without this product.",
  };
}

export function generateMarketRoast(
  evaluation: ScoutLoopEvaluation
): RoastCopy {
  const lowConfidence = evaluation.marketSizing.confidence === "low";
  const bigCategory = /billion|trillion|\$|enterprise|platform|ai/i.test(
    evaluation.marketSizing.tamHypothesis
  );

  return {
    roast: lowConfidence
      ? "The market is large, but TAM is currently doing influencer math. Big category, real demand, and still too much fog machine attached to the spreadsheet."
      : bigCategory
        ? "TAM is wearing sunglasses indoors. SAM is slightly more sober. SOM is where the adults should focus."
        : "The market exists, but the sizing needs a smaller knife. Stop trying to hug the whole category and pick the buyer who bleeds first.",
    usefulTruth: `TAM: ${evaluation.marketSizing.tamHypothesis} SAM: ${evaluation.marketSizing.samHypothesis} SOM: ${evaluation.marketSizing.somHypothesis}`,
    improve:
      "Narrow the first beachhead to one buyer, one painful workflow, and one believable spend line.",
  };
}

export function generateCompetitorRoast(
  evaluation: ScoutLoopEvaluation
): RoastCopy {
  const names = topCompetitorNames(evaluation);
  const count = evaluation.competitors.length;
  const direct = evaluation.competitors.filter(
    (competitor) => competitor.type === "direct"
  ).length;

  return {
    roast:
      count === 0
        ? "No competitors found is not a victory lap. It either means the category is weird, the research is thin, or the do-nothing competitor is quietly eating lunch."
        : direct >= 3
          ? "The category is crowded. There are enough agent frameworks here to form a small government, and some of them have money, distribution, and employees who sleep under their desks."
          : "Competitors exist, and the scary part is not that they exist. The scary part is customers can ignore all of you until a VP gets embarrassed.",
    usefulTruth: names
      ? `Relevant competitors and alternatives identified: ${names}. ScoutLoop found ${count} competitive entries, including ${direct} direct competitor(s).`
      : "ScoutLoop did not find strong competitor coverage, so this section needs more evidence before claiming a clean lane.",
    improve:
      "Make the comparison table brutal: reliability, auditability, deployment speed, buyer trust, and why users switch now.",
  };
}

export function generateMoatRoast(evaluation: ScoutLoopEvaluation): RoastCopy {
  const moatText = [...evaluation.moat, ...evaluation.differentiation].join(
    " "
  );
  const hasOpenSource = /open.source|github|sdk|developer/i.test(moatText);
  const hasControl = /control|approval|audit|workflow|runtime|compliance/i.test(
    moatText
  );

  return {
    roast: hasOpenSource
      ? "Open-source SDK plus cloud platform can be a moat, but only if adoption turns into distribution, not just GitHub stars and dopamine."
      : hasControl
        ? "The moat is not fake, but it is currently wearing a high-vis jacket and asking to be inspected. Control, workflow lock-in, and trust can compound, but only if customers actually build around them."
        : "If OpenAI ships this next Tuesday, what survives? That question should be tattooed on the roadmap.",
    usefulTruth:
      moatText ||
      "ScoutLoop did not find enough concrete moat evidence. That is not fatal, but it does mean the defensibility claim is currently doing unpaid theater.",
    improve:
      "Show retention, integrations, hosted usage, proprietary data, production workloads, or anything painful to rip out.",
  };
}

export function generateDistributionRoast(
  evaluation: ScoutLoopEvaluation
): RoastCopy {
  const developerLed = hasEvidence(evaluation, [
    "developer",
    "sdk",
    "github",
    "open-source",
    "api",
  ]);
  const enterprise = hasEvidence(evaluation, [
    "enterprise",
    "regulated",
    "compliance",
    "procurement",
  ]);

  return {
    roast: enterprise
      ? "Enterprise sales into regulated industries means long cycles, procurement goblins, and security questionnaires from hell. The product can be right and still spend six months getting hugged to death by process."
      : developerLed
        ? "Developer-first distribution can work. It can also turn into 2,000 GitHub stars and a bank account making dial-up noises."
        : "The product makes sense. The distribution plan is where the floorboards start creaking.",
    usefulTruth: `Business model: ${evaluation.businessModel} Distribution: ${evaluation.distribution}`,
    improve:
      "Define whether the motion is open-source-led, enterprise-led, partner-led, or founder-sales-led. Pick the first channel and name the buyer.",
  };
}

export function generateTractionRoast(
  evaluation: ScoutLoopEvaluation
): RoastCopy {
  const hasFunding = hasEvidence(evaluation, ["funding", "raised", "seed"]);
  const hasUsage = hasEvidence(evaluation, [
    "customer",
    "users",
    "revenue",
    "pilot",
    "production",
    "retention",
  ]);

  return {
    roast:
      hasFunding && !hasUsage
        ? "Funding is proof that investors picked up the phone. It is not proof that customers picked up the credit card."
        : hasUsage
          ? "There is proof of life, but the next question is appetite. Curiosity is cute. Dependency is the invoice-shaped version."
          : "Public traction is thin. Right now the evidence is whispering when it needs to start yelling.",
    usefulTruth:
      evaluation.tractionSignals.length > 0
        ? evaluation.tractionSignals.join(" ")
        : "ScoutLoop did not find concrete public proof of usage, revenue, retention, production deployments, or paid pilots.",
    improve:
      "Show design partners, active developers, paid pilots, production workloads, retention, or before-and-after customer pain.",
  };
}

export function generateRiskRoast(evaluation: ScoutLoopEvaluation): RoastCopy {
  const highRisks = evaluation.risks.filter((risk) => risk.severity === "high");
  const topRisk = highRisks[0] ?? evaluation.risks[0];
  const infraRisk = hasEvidence(evaluation, [
    "infrastructure",
    "platform",
    "agent",
    "framework",
    "cloud",
  ]);

  return {
    roast: infraRisk
      ? "This could become infrastructure. It could also become a feature in someone else's platform. That gap is where the blood pressure lives."
      : "The biggest risk is that the category moves faster than the company can explain why it matters.",
    usefulTruth: topRisk
      ? `${topRisk.severity.toUpperCase()} risk: ${topRisk.risk}${topRisk.mitigation ? ` Mitigation: ${topRisk.mitigation}` : ""}`
      : "ScoutLoop did not identify a sharp risk list, which usually means the evidence is too thin, not that the startup is magically safe.",
    improve:
      "Show measurable reliability gains, switching costs, compliance outcomes, or proof that a larger platform cannot flatten the wedge.",
  };
}

export function generateFinalVerdictRoast(
  evaluation: ScoutLoopEvaluation
): RoastReport["finalVerdict"] {
  const score = evaluation.overallScore;
  const hasAi = hasEvidence(evaluation, ["ai", "agent", "model", "llm"]);
  const best = bestThing(evaluation);
  const concern = biggestConcern(evaluation);

  let punchline: string;
  if (score >= 8) {
    punchline =
      "Fundable, but the next raise needs harder proof than 'the category is scary and large.'";
  } else if (score >= 6.5) {
    punchline = hasAi
      ? "This is not a clown car. It is a serious startup. But the moat and distribution story need to hit harder."
      : "The product has a reason to exist. Now it needs a reason to win.";
  } else if (score >= 5) {
    punchline =
      "Promising is banned, so let's say this instead: the idea has a pulse, but the proof needs to start paying rent.";
  } else {
    punchline =
      "The pitch is not dead, but it is on a folding chair outside the investor meeting. Bring stronger evidence.";
  }

  return {
    punchline: sharpenRoastCopy(punchline),
    bestThing: sharpenRoastCopy(best),
    biggestConcern: sharpenRoastCopy(concern),
    fastestWayToImprove: sharpenRoastCopy(fastestWayToImprove(evaluation)),
  };
}

export function sharpenFounderQuestion(
  question: ScoutLoopEvaluation["founderQuestions"][number]
) {
  return questionRewrites[question.category] ?? question.question;
}

export function generateRoastReport(
  evaluation: ScoutLoopEvaluation
): RoastReport {
  const overallScore = evaluation.overallScore;

  const problemScore =
    findScorecardScore(evaluation, ["problem", "pain", "severity"]) ?? 5;
  const marketScore =
    findScorecardScore(evaluation, [
      "market",
      "tam",
      "opportunity",
      "sizing",
    ]) ?? 5;
  const competitorScore =
    findScorecardScore(evaluation, [
      "competitive",
      "competitor",
      "moat",
      "defensib",
    ]) ?? 5;
  const moatScore =
    findScorecardScore(evaluation, ["moat", "defensib", "differentiat"]) ?? 5;
  const distributionScore =
    findScorecardScore(evaluation, [
      "distribution",
      "go-to-market",
      "gtm",
      "acquisition",
      "sales",
    ]) ?? 5;
  const tractionScore =
    findScorecardScore(evaluation, [
      "traction",
      "revenue",
      "growth",
      "users",
    ]) ?? 5;
  const riskScore =
    10 - (findScorecardScore(evaluation, ["risk", "execution"]) ?? 5);
  const overallThreat = generateBrutalOverallThreat(evaluation);
  const problemCopy = generateProblemRoast(evaluation);
  const marketCopy = generateMarketRoast(evaluation);
  const competitorCopy = generateCompetitorRoast(evaluation);
  const moatCopy = generateMoatRoast(evaluation);
  const distributionCopy = generateDistributionRoast(evaluation);
  const tractionCopy = generateTractionRoast(evaluation);
  const riskCopy = generateRiskRoast(evaluation);

  const sections: RoastSection[] = [
    {
      id: "problem",
      title: "Problem Pain Score",
      badge: "Pain Point Audit",
      score: problemScore,
      confidence: evaluation.marketSizing.confidence,
      roast: problemCopy.roast,
      usefulTruth: problemCopy.usefulTruth,
      improve: problemCopy.improve,
      insight: `${evaluation.problem}\n\nTarget customer: ${evaluation.targetCustomer}`,
    },
    {
      id: "market",
      title: "Market Delusion Index",
      badge: "TAM Acrobatics",
      score: marketScore,
      confidence: evaluation.marketSizing.confidence,
      roast: marketCopy.roast,
      usefulTruth: marketCopy.usefulTruth,
      improve: marketCopy.improve,
      insight: `TAM: ${evaluation.marketSizing.tamHypothesis}\nSAM: ${evaluation.marketSizing.samHypothesis}\nSOM: ${evaluation.marketSizing.somHypothesis}`,
    },
    {
      id: "competitors",
      title: "Competitor Bloodbath",
      badge: "Bloodbath Analysis",
      score: competitorScore,
      confidence: evaluation.overallConfidence,
      roast: competitorCopy.roast,
      usefulTruth: competitorCopy.usefulTruth,
      improve: competitorCopy.improve,
      insight:
        evaluation.competitors
          .map((c) => `${c.name} (${c.type}): ${c.description}`)
          .join("\n") || "No competitors identified in evidence.",
    },
    {
      id: "moat",
      title: "Moat or Mirage",
      badge: "Defensibility Check",
      score: moatScore,
      confidence: evaluation.overallConfidence,
      roast: moatCopy.roast,
      usefulTruth: moatCopy.usefulTruth,
      improve: moatCopy.improve,
      insight:
        [
          ...evaluation.differentiation.map((d) => `Differentiation: ${d}`),
          ...evaluation.moat.map((m) => `Moat: ${m}`),
        ].join("\n") || "No moat or differentiation claims identified.",
    },
    {
      id: "distribution",
      title: "Distribution Survival Odds",
      badge: "GTM Reality Check",
      score: distributionScore,
      confidence: evaluation.overallConfidence,
      roast: distributionCopy.roast,
      usefulTruth: distributionCopy.usefulTruth,
      improve: distributionCopy.improve,
      insight: `Business model: ${evaluation.businessModel}\n\nDistribution: ${evaluation.distribution}`,
    },
    {
      id: "traction",
      title: "Traction Reality Check",
      badge: "Proof of Life",
      score: tractionScore,
      confidence: evaluation.overallConfidence,
      roast: tractionCopy.roast,
      usefulTruth: tractionCopy.usefulTruth,
      improve: tractionCopy.improve,
      insight:
        evaluation.tractionSignals.length > 0
          ? evaluation.tractionSignals.map((s) => `• ${s}`).join("\n")
          : "No traction signals identified in available evidence.",
    },
    {
      id: "risks",
      title: "Risk Blood Pressure",
      badge: "Risk Audit",
      score: Math.max(0, 10 - riskScore),
      confidence: evaluation.overallConfidence,
      roast: riskCopy.roast,
      usefulTruth: riskCopy.usefulTruth,
      improve: riskCopy.improve,
      insight:
        evaluation.risks
          .map(
            (r) =>
              `[${r.severity.toUpperCase()}] ${r.risk}${r.mitigation ? ` → ${r.mitigation}` : ""}`
          )
          .join("\n") || "No specific risks identified.",
    },
  ];

  let overallRoast: string;
  if (overallScore >= 8.5) {
    overallRoast =
      "This one is actually dangerous. Investor group chats will be activated.";
  } else if (overallScore >= 7) {
    overallRoast =
      "This is cooking. Not fully cooked — but something real is on the stove.";
  } else if (overallScore >= 5) {
    overallRoast =
      "There is a real idea here wrapped in variable levels of pitch deck optimism.";
  } else if (overallScore >= 3) {
    overallRoast =
      "Held together with duct tape and conviction. The conviction is appreciated.";
  } else {
    overallRoast =
      "Currently in the pre-problem-market-fit phase. That is a polite way to say: early.";
  }

  return {
    threatLabel: overallThreat.label,
    threatIntensity: scoreToThreatIntensity(overallScore),
    overallRoast: sharpenRoastCopy(overallThreat.roast || overallRoast),
    seriousSummary: evaluation.summary,
    sections,
    finalVerdict: generateFinalVerdictRoast(evaluation),
  };
}

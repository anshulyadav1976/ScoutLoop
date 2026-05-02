/**
 * Client-side roast report generator.
 * Derives blunt, evidence-backed roast copy deterministically from an
 * existing ScoutLoopEvaluation. No new API calls, no invented facts.
 */

import type { Confidence, ScoutLoopEvaluation } from "@/lib/scoutloop/types";

export type RoastSection = {
  id: string;
  title: string;
  badge: string;
  score: number;
  roast: string;
  evidenceNote: string;
  fix: string;
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

type RoastCopy = {
  roast: string;
  evidenceNote: string;
  fix: string;
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
  "company-shaped object",
  "proof of life",
  "credible if the evidence holds",
];

const questionRewrites: Record<string, string> = {
  moat: "If OpenAI, LangChain, or a cloud provider clones your three best features, what is still painfully expensive to copy?",
  distribution:
    "If developers star the repo and enterprises still refuse to buy, what broke: trust, procurement, pricing, or the product pretending those are the same problem?",
  competition:
    "Which competitor can kill you by making this a checkbox, and what do you know that they are too bloated to notice?",
  traction:
    "What proof says users depend on this, not just poked it once because AI agents are the current industry group project?",
  technical:
    "Which technical claim survives production traffic, security review, and one angry enterprise architect with a spreadsheet?",
  problem:
    "What exact workflow is painful enough that a buyer stops nodding politely and actually opens the budget drawer?",
  market:
    "Which tiny beachhead is real enough to sell into before the TAM spreadsheet starts doing circus tricks?",
  risk: "What is the one risk that kills this company if the team keeps treating it like a roadmap bullet?",
  founder_quality:
    "What have you learned that a better-funded competitor will only discover after lighting six months on fire?",
};

export function scoreToThreatLabel(score: number): string {
  if (score < 3) {
    return "DECK NEEDS WITNESS PROTECTION";
  }
  if (score < 5) {
    return "DUCT TAPE WITH A LANDING PAGE";
  }
  if (score < 7) {
    return "REAL STARTUP, FAKE CERTAINTY";
  }
  if (score < 8.5) {
    return "ANNOYINGLY VIABLE";
  }
  return "INVESTOR GROUP CHAT EMERGENCY";
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

function cleanBannedPhrases(text: string) {
  return bannedRoastPhrases.reduce(
    (current, phrase) => current.replace(new RegExp(phrase, "gi"), "receipts"),
    text
  );
}

export function sharpenRoastCopy(text: string) {
  return cleanBannedPhrases(text)
    .replace(/\bpromising\b/gi, "not dead yet")
    .replace(/\bsolution\b/gi, "product")
    .replace(/\busers may\b/gi, "users might")
    .replace(/\bthere is an opportunity\b/gi, "there is a shot")
    .replace(/\bappears\b/gi, "looks")
    .trim();
}

function findScorecardScore(
  evaluation: ScoutLoopEvaluation,
  keywords: string[]
): number | undefined {
  const item = evaluation.scorecard.find((score) =>
    keywords.some((keyword) =>
      score.category.toLowerCase().includes(keyword.toLowerCase())
    )
  );
  return item?.score;
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
    ...evaluation.evidenceCards.map((card) => `${card.title} ${card.snippet}`),
    ...evaluation.tractionSignals,
    ...evaluation.differentiation,
    ...evaluation.moat,
    ...evaluation.competitors.map(
      (competitor) => `${competitor.name} ${competitor.description}`
    ),
  ]
    .join(" ")
    .toLowerCase();

  return words.some((word) => haystack.includes(word.toLowerCase()));
}

function hasMissingEvidenceLanguage(
  evaluation: ScoutLoopEvaluation,
  words: string[]
) {
  const haystack = [
    evaluation.summary,
    ...evaluation.warnings,
    ...evaluation.tractionSignals,
    ...evaluation.evidenceCards.map((card) => card.snippet),
  ]
    .join(" ")
    .toLowerCase();

  return words.some((word) =>
    new RegExp(
      `no (direct |public |clear |concrete |specific )?.{0,35}${word}`,
      "i"
    ).test(haystack)
  );
}

function compact(text: string, maxLength = 170) {
  const cleaned = text.replace(/\s+/g, " ").trim();
  return cleaned.length > maxLength
    ? `${cleaned.slice(0, maxLength - 1)}…`
    : cleaned;
}

function topCompetitorNames(evaluation: ScoutLoopEvaluation) {
  return evaluation.competitors
    .slice(0, 4)
    .map((competitor) => competitor.name)
    .filter(Boolean)
    .join(", ");
}

function topScore(evaluation: ScoutLoopEvaluation) {
  return [...evaluation.scorecard].sort((a, b) => b.score - a.score)[0];
}

function bottomScore(evaluation: ScoutLoopEvaluation) {
  return [...evaluation.scorecard].sort((a, b) => a.score - b.score)[0];
}

function bestThing(evaluation: ScoutLoopEvaluation): string {
  const best = topScore(evaluation);
  if (best && best.score >= 7) {
    return `${best.category}: ${best.explanation}`;
  }
  if (evaluation.tractionSignals.length > 0) {
    return evaluation.tractionSignals[0];
  }
  if (evaluation.differentiation.length > 0) {
    return evaluation.differentiation[0];
  }
  return compact(evaluation.summary, 140);
}

function biggestConcern(evaluation: ScoutLoopEvaluation): string {
  const highRisk = evaluation.risks.find((risk) => risk.severity === "high");
  if (highRisk) {
    return highRisk.risk;
  }
  const worst = bottomScore(evaluation);
  if (worst && worst.score < 6) {
    return `${worst.category}: ${worst.explanation}`;
  }
  return "Public evidence is too thin. The company is asking the judge to do interpretive dance with missing data.";
}

function fastestWayToImprove(evaluation: ScoutLoopEvaluation): string {
  const worst = bottomScore(evaluation);
  if (!worst) {
    return "Add customer evidence, distribution receipts, and one metric that cannot be hand-waved away.";
  }

  const category = worst.category.toLowerCase();
  if (category.includes("traction") || category.includes("revenue")) {
    return "Get one paying customer or measurable usage metric. One real usage graph beats 40 slides of founder cardio.";
  }
  if (category.includes("moat") || category.includes("defensib")) {
    return "Define the proprietary data, workflow lock-in, or distribution advantage. One specific moat beats five adjectives in a hoodie.";
  }
  if (category.includes("distribution") || category.includes("go-to-market")) {
    return "Name the first 10 buyers by job title and pain. 'Developers' is not a GTM strategy; it is a population census.";
  }
  if (category.includes("market") || category.includes("tam")) {
    return "Tie TAM/SAM/SOM to one buyer and one budget line before the spreadsheet joins Cirque du Soleil.";
  }
  return `Fix ${worst.category}: ${worst.explanation}`;
}

export function generateBrutalOverallThreat(evaluation: ScoutLoopEvaluation): {
  label: string;
  roast: string;
} {
  const score = evaluation.overallScore;
  const hasAi = hasEvidence(evaluation, ["ai", "agent", "model", "llm"]);
  const weakMoat = evaluation.moat.length < 2;
  const weakTraction = evaluation.tractionSignals.length < 2;
  const weakDistribution =
    evaluation.distribution.length < 90 ||
    /unclear|tbd|eventually|organic|community|likely/i.test(
      evaluation.distribution
    );

  if (score >= 8.5) {
    return {
      label: "INVESTOR GROUP CHAT EMERGENCY",
      roast:
        "This is not vaporware. Annoying, because I wanted to bully it properly. The company is good enough that the roast has to aim at execution instead of existence.",
    };
  }
  if (score >= 7) {
    return {
      label: weakDistribution
        ? "GREAT PRODUCT, GTM IN A COMA"
        : "ANNOYINGLY VIABLE",
      roast: weakDistribution
        ? "The product has teeth. The go-to-market plan is still chewing crayons in the corner, but at least there is an actual business trying to escape."
        : "This is cooking hard enough to be irritating. Still not inevitable; the startup gods love turning 'obvious winner' into 'remember them?' by Q3.",
    };
  }
  if (score >= 5) {
    return {
      label: weakMoat
        ? "REAL STARTUP, FAKE CERTAINTY"
        : "NOT DEAD, STILL NEEDS RECEIPTS",
      roast: hasAi
        ? "This is not just a Notion doc wearing an AI hoodie. Unfortunately, the proof still has the muscle tone of a wet napkin."
        : "There is a startup in here somewhere. Right now it is buried under assumptions, missing numbers, and a pitch that wants trust before it has earned eye contact.",
    };
  }
  if (score >= 3) {
    return {
      label: "DUCT TAPE WITH A LANDING PAGE",
      roast: weakTraction
        ? "The idea is alive in the way a smoke alarm with low battery is alive: technically functioning, mostly annoying, and begging for attention."
        : "There are traces of a business here, but they are scattered like someone dropped the pitch deck down a staircase.",
    };
  }
  return {
    label: hasAi
      ? "AI WRAPPER COURT APPEARANCE"
      : "DECK NEEDS WITNESS PROTECTION",
    roast:
      "There is not enough evidence to roast the company, so the missing evidence gets dragged into the parking lot instead. Bring proof or bring snacks.",
  };
}

export function generateProblemRoast(
  evaluation: ScoutLoopEvaluation
): RoastCopy {
  const score =
    findScorecardScore(evaluation, ["problem", "pain", "severity"]) ?? 5;
  const regulated = hasEvidence(evaluation, [
    "regulated",
    "compliance",
    "legal",
    "audit",
    "security",
  ]);
  const hackathon = evaluation.mode === "hackathon_judge";

  return {
    roast: regulated
      ? "The pain is real. Enterprises see unpredictable AI agents and legal immediately starts hearing boss music. The problem is not fake; the danger is acting like 'safer agents' alone is a sales motion."
      : hackathon
        ? "The problem is clear enough for judges to understand before the coffee wears off. The risk is that it solves a demo-day inconvenience, not a user-punching-the-wall problem."
        : score >= 7
          ? "The pain point has a pulse. Now prove buyers feel it in their budget, not just in a polite discovery call where everyone says 'interesting' and vanishes."
          : "The problem statement is doing push-ups in the mirror. It might be real, but the evidence has not shown urgency, frequency, or a buyer with a bleeding calendar.",
    evidenceNote: compact(
      `Problem: ${evaluation.problem} Target customer: ${evaluation.targetCustomer}`,
      230
    ),
    fix: "Show the workflow, the buyer, the current workaround, and the cost of doing nothing.",
  };
}

export function generateMarketRoast(
  evaluation: ScoutLoopEvaluation
): RoastCopy {
  const score =
    findScorecardScore(evaluation, [
      "market",
      "tam",
      "opportunity",
      "sizing",
    ]) ?? 5;
  const lowConfidence = evaluation.marketSizing.confidence === "low";
  const broad = /enterprise|platform|infrastructure|developer|ai|agent/i.test(
    evaluation.marketSizing.tamHypothesis
  );

  return {
    roast: lowConfidence
      ? "The market is big because the definition is doing Olympic gymnastics. TAM is wearing sunglasses indoors; SOM is the only number here that should be allowed near adults."
      : broad
        ? "Big category, sure. But 'everyone building AI' is not a customer segment; it is a LinkedIn search result with delusions of grandeur."
        : score >= 7
          ? "The market framing is less embarrassing than usual. Still, the first wedge needs to be a spear, not a scented candle labeled 'platform opportunity'."
          : "The market slide is basically pointing at a rich neighborhood and declaring home ownership. Nice dream. Now identify the first house you can actually buy.",
    evidenceNote: compact(
      `TAM: ${evaluation.marketSizing.tamHypothesis} SAM: ${evaluation.marketSizing.samHypothesis} SOM: ${evaluation.marketSizing.somHypothesis}`,
      260
    ),
    fix: "Pick one buyer, one use case, one budget line. Make the beachhead small enough to attack and painful enough to matter.",
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
  const hasAi = hasEvidence(evaluation, ["ai", "agent", "framework", "llm"]);

  return {
    roast:
      count === 0
        ? "No competitors found is not a flex. It usually means the research is wearing a blindfold or the customer is solving this with apathy and spreadsheets."
        : hasAi
          ? "There are enough agent frameworks in this market to start a small, dysfunctional government. 'We use AI' now has the nutritional value of cardboard."
          : direct > 0
            ? "Competitors exist, and some of them have distribution, money, and employees whose job is to copy your cute little feature before lunch."
            : "The scariest competitor is still doing nothing. Customers love ignoring problems until a VP gets publicly embarrassed.",
    evidenceNote: names
      ? `ScoutLoop found ${count} competitive entries (${direct} direct): ${names}.`
      : "ScoutLoop did not find strong competitor coverage, which means no one gets to claim an empty lane yet.",
    fix: "Write the comparison table like you hate yourself: switching cost, trust, workflow fit, deployment speed, and what incumbents cannot copy fast.",
  };
}

export function generateMoatRoast(evaluation: ScoutLoopEvaluation): RoastCopy {
  const moatText = [...evaluation.moat, ...evaluation.differentiation].join(
    " "
  );
  const openSource = /open.source|github|sdk|developer/i.test(moatText);
  const control =
    /control|approval|audit|workflow|runtime|compliance|trust/i.test(moatText);

  return {
    roast: openSource
      ? "Open-source SDK plus cloud can become a moat. It can also become 2,000 GitHub stars, 14 Discord lurkers, and a bank account making dial-up noises."
      : control
        ? "The moat is not fake, but it currently needs more crocodiles. Control and workflow trust can compound; vibes and feature lists do not."
        : "If OpenAI, a cloud provider, or one bored LangChain intern ships this next Tuesday, what survives? Tattoo that question on the roadmap.",
    evidenceNote: moatText
      ? compact(moatText, 230)
      : "ScoutLoop did not find concrete moat evidence. That is not 'stealth'; that is a defensibility hole wearing sunglasses.",
    fix: "Show retention, integrations, hosted usage, proprietary data, production workloads, or something painful to rip out.",
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
  const vague =
    /likely|organic|content|community|developer-led|word.of.mouth/i.test(
      evaluation.distribution
    );

  return {
    roast: enterprise
      ? "Enterprise sales into regulated industries means procurement hell, security questionnaires, and six people named Compliance asking for a PDF no one will read. The product can be right and still die in process."
      : developerLed || vague
        ? "Developer-first distribution can work. It can also become 'developers will find us,' which is not a strategy; it is a scented candle."
        : "The product makes sense. The distribution plan is where the floorboards start making horror-movie noises.",
    evidenceNote: compact(
      `Business model: ${evaluation.businessModel} Distribution: ${evaluation.distribution}`,
      250
    ),
    fix: "Choose the motion: open-source-led, enterprise-led, partner-led, or founder-sales. Then name the buyer and the first channel.",
  };
}

export function generateTractionRoast(
  evaluation: ScoutLoopEvaluation
): RoastCopy {
  const hasFunding = hasEvidence(evaluation, ["funding", "raised", "seed"]);
  const hasUsage =
    hasEvidence(evaluation, [
      "customer",
      "users",
      "revenue",
      "pilot",
      "production",
      "retention",
      "deployment",
    ]) &&
    !hasMissingEvidenceLanguage(evaluation, [
      "customer",
      "user",
      "revenue",
      "deployment",
      "retention",
      "usage",
    ]);

  return {
    roast:
      hasFunding && !hasUsage
        ? "Funding means investors picked up the phone. It does not mean customers picked up the credit card. Congrats on the appetizer; where is dinner?"
        : hasUsage
          ? "There is usage smoke, but the question is fire. Curiosity is cute. Dependency is the invoice-shaped version."
          : "Public traction is thinner than airport toilet paper. Right now the evidence is whispering when it needs to kick the door open.",
    evidenceNote:
      evaluation.tractionSignals.length > 0
        ? compact(evaluation.tractionSignals.join(" "), 230)
        : "No public proof of users, revenue, retention, production deployments, or paid pilots was found.",
    fix: "Show active users, design partners, paid pilots, production workloads, retention, or one customer saying they would be screwed without it.",
  };
}

export function generateRiskRoast(evaluation: ScoutLoopEvaluation): RoastCopy {
  const highRisks = evaluation.risks.filter((risk) => risk.severity === "high");
  const topRisk = highRisks[0] ?? evaluation.risks[0];
  const platformRisk = hasEvidence(evaluation, [
    "platform",
    "infrastructure",
    "agent",
    "framework",
    "cloud",
  ]);

  return {
    roast: platformRisk
      ? "The main risk is getting pancaked between hyperscalers above, open-source chaos below, and enterprise procurement slowly chewing everyone's ankles. Fun little sandwich."
      : "The biggest risk is that the category moves faster than the company can explain why it deserves to exist.",
    evidenceNote: topRisk
      ? `${topRisk.severity.toUpperCase()} risk: ${topRisk.risk}${topRisk.mitigation ? ` Mitigation: ${topRisk.mitigation}` : ""}`
      : "ScoutLoop did not identify a sharp risk list, which usually means the evidence is thin, not that the startup is blessed by physics.",
    fix: "Show measurable de-risking: reliability gains, compliance outcomes, switching costs, or proof a bigger platform cannot flatten the wedge.",
  };
}

export function generateFinalVerdictRoast(
  evaluation: ScoutLoopEvaluation
): RoastReport["finalVerdict"] {
  const score = evaluation.overallScore;
  const hasAi = hasEvidence(evaluation, ["ai", "agent", "model", "llm"]);
  let punchline: string;

  if (score >= 8) {
    punchline =
      "Fundable, annoyingly. Now prove the next raise deserves numbers, not interpretive fear about the category.";
  } else if (score >= 6.5) {
    punchline = hasAi
      ? "This is not a clown car. It is a serious startup. The problem is that serious startups still get flattened when the moat is wearing flip-flops."
      : "The product has a reason to exist. Now it needs a reason to win before a better-distributed competitor eats its lunch.";
  } else if (score >= 5) {
    punchline =
      "The idea has a pulse. Unfortunately, the proof is still lying on the couch asking if traction can be delivered by DoorDash.";
  } else {
    punchline =
      "The pitch is not dead, but it is sitting outside the investor meeting on a folding chair with a warm bottle of water.";
  }

  return {
    punchline: sharpenRoastCopy(punchline),
    bestThing: sharpenRoastCopy(bestThing(evaluation)),
    biggestConcern: sharpenRoastCopy(biggestConcern(evaluation)),
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
      "competition",
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
  const riskSafetyScore = Math.max(
    0,
    10 - (findScorecardScore(evaluation, ["risk", "execution"]) ?? 5)
  );

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
      title: "PROBLEM PAIN",
      badge: "Is the wound real?",
      score: problemScore,
      confidence: evaluation.overallConfidence,
      ...problemCopy,
    },
    {
      id: "market",
      title: "MARKET DELUSION",
      badge: "TAM circus audit",
      score: marketScore,
      confidence: evaluation.marketSizing.confidence,
      ...marketCopy,
    },
    {
      id: "competitors",
      title: "COMPETITOR BLOODBATH",
      badge: "Who can ruin the picnic?",
      score: competitorScore,
      confidence: evaluation.overallConfidence,
      ...competitorCopy,
    },
    {
      id: "moat",
      title: "MOAT OR MIRAGE",
      badge: "Crocodile inspection",
      score: moatScore,
      confidence: evaluation.overallConfidence,
      ...moatCopy,
    },
    {
      id: "distribution",
      title: "DISTRIBUTION SURVIVAL",
      badge: "Can anyone find this thing?",
      score: distributionScore,
      confidence: evaluation.overallConfidence,
      ...distributionCopy,
    },
    {
      id: "traction",
      title: "TRACTION REALITY",
      badge: "Curiosity vs budget",
      score: tractionScore,
      confidence: evaluation.overallConfidence,
      ...tractionCopy,
    },
    {
      id: "risks",
      title: "RISK BLOOD PRESSURE",
      badge: "What kills it?",
      score: riskSafetyScore,
      confidence: evaluation.overallConfidence,
      ...riskCopy,
    },
  ].map((section) => ({
    ...section,
    roast: sharpenRoastCopy(section.roast),
    evidenceNote: sharpenRoastCopy(section.evidenceNote),
    fix: sharpenRoastCopy(section.fix),
  }));

  return {
    threatLabel: overallThreat.label,
    threatIntensity: scoreToThreatIntensity(evaluation.overallScore),
    overallRoast: sharpenRoastCopy(overallThreat.roast),
    seriousSummary: evaluation.summary,
    sections,
    finalVerdict: generateFinalVerdictRoast(evaluation),
  };
}

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
  if (score < 3) { return "Slide Deck in Witness Protection"; }
  if (score < 5) { return "Interesting, But Held Together With Duct Tape"; }
  if (score < 7) { return "Potentially Dangerous If They Learn Distribution"; }
  if (score < 8.5) { return "Actually Cooking"; }
  return "Investor Group Chat Emergency";
}

export function scoreToThreatIntensity(
  score: number
): RoastReport["threatIntensity"] {
  if (score < 3) { return "critical"; }
  if (score < 5) { return "high"; }
  if (score < 7) { return "medium"; }
  if (score < 8.5) { return "low"; }
  return "safe";
}

function findScorecardScore(
  evaluation: ScoutLoopEvaluation,
  keywords: string[]
): number | undefined {
  const item = evaluation.scorecard.find((s) =>
    keywords.some((kw) =>
      s.category.toLowerCase().includes(kw.toLowerCase())
    )
  );
  return item?.score;
}

function problemRoast(
  score: number,
  confidence: Confidence,
  mode: ScoutLoopEvaluation["mode"]
): string {
  if (confidence === "low") {
    return "The problem description has strong TED Talk energy but thin proof. Without evidence of frequency, cost, or urgency, this is a hypothesis wearing a pitch deck.";
  }
  if (score >= 8) {
    return mode === "hackathon_judge"
      ? "The pain is real and the build addresses it. Judges will nod aggressively."
      : "This is a genuine wound, not a LinkedIn thought-leader hallucination. Rare.";
  }
  if (score >= 6) {
    return "The problem is real but the pitch is describing it like a documentary narrated over a fog machine. The pain needs sharper proof.";
  }
  if (score >= 4) {
    return "This problem is either a bleeding wound or an inconvenience depending on who you ask. The evidence isn't sure yet either.";
  }
  return "The problem statement is doing its best. Unfortunately, without urgency, frequency, or a paying customer quote, it's more of a medium-priority to-do list item.";
}

function marketRoast(
  confidence: Confidence,
  tamHypothesis: string
): string {
  const bigNumbers = /\$[\d]+[BbMm]|\d+[BbMm]\s*market|billion|trillion/i.test(
    tamHypothesis
  );

  if (confidence === "low") {
    return "The TAM is doing that thing where it puts on sunglasses indoors. The market exists — the sizing evidence is giving 'we Googled it five minutes before the pitch.'";
  }
  if (confidence === "high" && bigNumbers) {
    return "Market sizing is actually grounded. This is unusual. The SOM is the adult in the room. TAM is the motivational speaker. SAM is doing its best.";
  }
  if (bigNumbers) {
    return "There is a large market. Whether this team captures even a rounding error of it is the real question. SOM needs to be the conversation, not TAM.";
  }
  return "The market hypothesis is here. It's trying. Medium confidence means 'we have a thesis but the evidence is still getting dressed.'";
}

function competitorRoast(
  competitors: ScoutLoopEvaluation["competitors"],
  moat: string[]
): string {
  const direct = competitors.filter((c) => c.type === "direct").length;
  const hasWeak = moat.length < 2;

  if (direct === 0) {
    return "Either there are no direct competitors, or they haven't been found yet. Either way, the 'do nothing' competitor is currently winning by default.";
  }
  if (direct >= 3 && hasWeak) {
    return `${direct} direct competitors and the moat is not yet a castle. It's more of a decorative puddle with a 'private property' sign. Distribution or data advantage is urgently needed.`;
  }
  if (direct >= 3) {
    return `${direct} direct competitors. The field is crowded. 'We use AI' is not a moat unless the strategy is spiritual warfare. The differentiation better be real.`;
  }
  return "There are competitors. Several of them have been doing this longer. The moat cannot just be 'better UX' unless the UX is genuinely three standard deviations above average.";
}

function moatRoast(
  moat: string[],
  differentiation: string[],
  score: number,
  confidence: Confidence
): string {
  if (confidence === "low") {
    return "The moat is currently theoretical. If OpenAI ships this as a feature next Tuesday, the question is: what survives? That answer needs to be in the pitch, not the imagination.";
  }
  const total = moat.length + differentiation.length;
  if (total >= 5 && score >= 7) {
    return "There is an actual moat here. Data advantage, workflow lock-in, or genuine technical differentiation — at least one of these is doing real work.";
  }
  if (total >= 3) {
    return "There is a possible moat forming. It needs time, data, or distribution to harden into something that makes a competitor sweat. Right now it's a promising trench.";
  }
  return "The moat is more of a decorative puddle. Defensibility needs one of: proprietary data, workflow lock-in, brand/community, or distribution advantage. Pick one and go hard.";
}

function distributionRoast(
  distribution: string,
  score: number,
  confidence: Confidence
): string {
  const vibes =
    /post|content|seo|organic|word.of.mouth|community|linkedin|twitter|x\.com/i.test(
      distribution
    );

  if (confidence === "low") {
    return "Distribution plan currently has 'post on LinkedIn and pray' energy. The product might be great. Getting people who care before the runway evaporates is the actual game.";
  }
  if (score >= 7) {
    return "The distribution thinking is sharper than average. There is a real acquisition theory here, not just vibes and hope.";
  }
  if (vibes) {
    return "The distribution plan is heavy on organic and community. That can work. It just needs a specific ICP, a repeatable channel, and a timeline that isn't 'eventually.'";
  }
  return "Product is not the problem. Finding people who care about it before the runway evaporates is the entire game. The distribution theory needs more than one channel.";
}

function tractionRoast(
  signals: string[],
  score: number,
  confidence: Confidence,
  mode: ScoutLoopEvaluation["mode"]
): string {
  if (mode === "hackathon_judge") {
    if (signals.length === 0) {
      return "For a hackathon build, traction = demo that works and a real problem solved. The jury is still out on whether this clears that bar.";
    }
    return "There are signals that this works and people care. That's what hackathon judges want to see. Show the demo, not the roadmap.";
  }
  if (confidence === "low" || signals.length === 0) {
    return "Traction signals are not screaming 'shut up and take my money.' Public proof is thin. The vibes are doing cardio while the data is still asleep.";
  }
  if (score >= 7) {
    return "There is actual proof of life here. Customers exist, usage is happening, or revenue is real. This is the section that makes the rest of the pitch credible.";
  }
  if (signals.length >= 2) {
    return "Traction exists in the early innings. Present but not yet compelling. The story is 'we have signal' not 'we have momentum.' That's a gap to close fast.";
  }
  return "Traction signals are technically present. They are doing their best. Judges will want specifics: numbers, retention, usage frequency, or someone paying actual money.";
}

function riskRoast(
  risks: ScoutLoopEvaluation["risks"],
  score: number
): string {
  const highRisks = risks.filter((r) => r.severity === "high");
  const names = highRisks
    .slice(0, 2)
    .map((r) => r.risk.split(" ").slice(0, 4).join(" "))
    .join(" and ");

  if (highRisks.length === 0 && score >= 7) {
    return "Risk profile is manageable. No single goblin is large enough to end the game. The main risk at this stage is execution, which is always the main risk.";
  }
  if (highRisks.length >= 2) {
    return `The main risk goblins are hiding in ${names || "distribution and defensibility"}. They are wearing fake moustaches and hoping no one asks about them in the Q&A.`;
  }
  return `There are risks. ${highRisks.length ? `The high-severity one around ${names} needs mitigation before it graduates from 'concern' to 'crisis.'` : "They are being managed but not fully mitigated. Every startup has goblins — the question is which ones eat the company."}`;
}

function finalVerdictPunchline(
  score: number,
  moat: string[],
  distribution: string,
  tractionSignals: string[],
  mode: ScoutLoopEvaluation["mode"]
): string {
  if (mode === "hackathon_judge") {
    if (score >= 7.5) { return "Strong hackathon build. Real problem, working demo, post-hackathon potential is visible."; }
    if (score >= 5) { return "Good demo. Needs sharper problem framing and a clearer 'what next' to win judges over."; }
    return "Interesting direction. The build needs more evidence the problem is real and the solution works end-to-end.";
  }

  const weakMoat = moat.length < 2;
  const weakDistrib =
    distribution.length < 80 ||
    /vague|unclear|tbd|later|eventually/i.test(distribution);
  const weakTraction = tractionSignals.length < 2;

  if (score >= 8.5) { return "Fundable. Rare enough to say out loud."; }
  if (score >= 7 && !weakMoat) { return "Fundable but needs sharper distribution proof before the next raise."; }
  if (score >= 7 && weakDistrib) { return "Strong product, weak distribution plan. Fix the go-to-market and this is a different conversation."; }
  if (score >= 5 && weakTraction && weakMoat) { return "Interesting thesis, both moat and traction need to catch up. The idea is not the problem."; }
  if (score >= 5) { return "Interesting idea in a real market. Dangerous if the founder can figure out distribution before competitors do."; }
  return "Not yet a business. Could become one. Needs proof-of-pain, a real customer, and a distribution theory that isn't 'build it and they will come.'";
}

function bestThing(evaluation: ScoutLoopEvaluation): string {
  const topItem = [...evaluation.scorecard].sort((a, b) => b.score - a.score)[0];
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
  if (highRisk) { return highRisk.risk; }

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
  if (!bottomItem) { return "Add more customer evidence, distribution channels, and traction signals."; }

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

export function generateRoastReport(
  evaluation: ScoutLoopEvaluation
): RoastReport {
  const mode = evaluation.mode;
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
    findScorecardScore(evaluation, [
      "moat",
      "defensib",
      "differentiat",
    ]) ?? 5;
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
    10 -
    (findScorecardScore(evaluation, ["risk", "execution"]) ?? 5);

  const sections: RoastSection[] = [
    {
      id: "problem",
      title: "Problem Pain Score",
      badge: "Pain Point Audit",
      score: problemScore,
      confidence: evaluation.marketSizing.confidence,
      roast: problemRoast(problemScore, evaluation.overallConfidence, mode),
      insight: `${evaluation.problem}\n\nTarget customer: ${evaluation.targetCustomer}`,
    },
    {
      id: "market",
      title: "Market Delusion Index",
      badge: "TAM Acrobatics",
      score: marketScore,
      confidence: evaluation.marketSizing.confidence,
      roast: marketRoast(
        evaluation.marketSizing.confidence,
        evaluation.marketSizing.tamHypothesis
      ),
      insight: `TAM: ${evaluation.marketSizing.tamHypothesis}\nSAM: ${evaluation.marketSizing.samHypothesis}\nSOM: ${evaluation.marketSizing.somHypothesis}`,
    },
    {
      id: "competitors",
      title: "Competitor Bloodbath",
      badge: "Bloodbath Analysis",
      score: competitorScore,
      confidence: evaluation.overallConfidence,
      roast: competitorRoast(evaluation.competitors, evaluation.moat),
      insight: evaluation.competitors
        .map(
          (c) =>
            `${c.name} (${c.type}): ${c.description}`
        )
        .join("\n") || "No competitors identified in evidence.",
    },
    {
      id: "moat",
      title: "Moat or Mirage",
      badge: "Defensibility Check",
      score: moatScore,
      confidence: evaluation.overallConfidence,
      roast: moatRoast(
        evaluation.moat,
        evaluation.differentiation,
        moatScore,
        evaluation.overallConfidence
      ),
      insight: [
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
      roast: distributionRoast(
        evaluation.distribution,
        distributionScore,
        evaluation.overallConfidence
      ),
      insight: `Business model: ${evaluation.businessModel}\n\nDistribution: ${evaluation.distribution}`,
    },
    {
      id: "traction",
      title: "Traction Reality Check",
      badge: "Proof of Life",
      score: tractionScore,
      confidence: evaluation.overallConfidence,
      roast: tractionRoast(
        evaluation.tractionSignals,
        tractionScore,
        evaluation.overallConfidence,
        mode
      ),
      insight:
        evaluation.tractionSignals.length > 0
          ? evaluation.tractionSignals.map((s) => `• ${s}`).join("\n")
          : "No traction signals identified in available evidence.",
    },
    {
      id: "risks",
      title: "Risk Goblins",
      badge: "Goblin Inventory",
      score: Math.max(0, 10 - riskScore),
      confidence: evaluation.overallConfidence,
      roast: riskRoast(evaluation.risks, 10 - riskScore),
      insight: evaluation.risks
        .map((r) => `[${r.severity.toUpperCase()}] ${r.risk}${r.mitigation ? ` → ${r.mitigation}` : ""}`)
        .join("\n") || "No specific risks identified.",
    },
  ];

  const verdict = finalVerdictPunchline(
    overallScore,
    evaluation.moat,
    evaluation.distribution,
    evaluation.tractionSignals,
    mode
  );

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
    threatLabel: scoreToThreatLabel(overallScore),
    threatIntensity: scoreToThreatIntensity(overallScore),
    overallRoast,
    seriousSummary: evaluation.summary,
    sections,
    finalVerdict: {
      punchline: verdict,
      bestThing: bestThing(evaluation),
      biggestConcern: biggestConcern(evaluation),
      fastestWayToImprove: fastestWayToImprove(evaluation),
    },
  };
}

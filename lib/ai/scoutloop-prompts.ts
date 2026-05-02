import { readFileSync } from "node:fs";
import { join } from "node:path";
import type {
  EvidenceBundle,
  MemoryLesson,
  NormalizedScoutLoopInput,
} from "@/lib/scoutloop/types";

function readPrompt(fileName: string) {
  try {
    return readFileSync(join(process.cwd(), "prompts", fileName), "utf8");
  } catch {
    return "";
  }
}

export function getScoutLoopSystemPrompt() {
  return (
    readPrompt("scoutloop-system-prompt.md") ||
    "You are ScoutLoop, a conservative due diligence evaluation agent. Use only supplied evidence and mark uncertainty."
  );
}

export function getFeedbackToLessonPrompt() {
  return (
    readPrompt("evaluator-feedback-to-lesson.md") ||
    "Convert evaluator feedback into 1-3 reusable operational lessons."
  );
}

export function buildEvaluationPrompt({
  input,
  evidence,
  lessons,
}: {
  input: NormalizedScoutLoopInput;
  evidence: EvidenceBundle;
  lessons: MemoryLesson[];
}) {
  const modeDescription =
    input.mode === "startup_judge"
      ? "Startup Judge mode: emphasize problem severity, market, ICP, differentiation, moat, distribution, traction, and investment risks."
      : "Hackathon Judge mode: emphasize usefulness, technical execution, creativity, demo clarity, sponsor integration, completeness, and post-hackathon potential.";

  return [
    getScoutLoopSystemPrompt(),
    "",
    modeDescription,
    "",
    `Project name: ${input.projectName}`,
    `URL: ${input.url || "No URL provided"}`,
    "",
    "Prior evaluator lessons to apply explicitly:",
    lessons.length
      ? lessons.map((lesson) => `- ${lesson.lesson}`).join("\n")
      : "- No prior lessons recalled.",
    "",
    "Evidence cards:",
    evidence.evidenceCards.length
      ? evidence.evidenceCards
          .map(
            (card) =>
              `- ${card.id} | ${card.sourceType} | ${card.confidence} | ${card.title}: ${card.snippet}${
                card.url ? ` (${card.url})` : ""
              }`
          )
          .join("\n")
      : "- No evidence cards available.",
    "",
    "Merged pitch and uploaded context:",
    input.mergedContext || "No pitch or uploaded text provided.",
    "",
    "Output requirements:",
    "- Do not invent revenue, customers, funding, users, founders, market numbers, or traction.",
    "- TAM/SAM/SOM must be hypotheses, not precise facts.",
    "- Every uncertain area must carry low/medium/high confidence.",
    "- Include missing evidence in warnings or missingData.",
    "- Founder questions must be specific and non-generic.",
    "- Include all schema fields. Use empty strings for unavailable URL/startupName/mitigation fields, and empty arrays for unavailable evidenceIds.",
    "",
    "Roast voice guidance:",
    "- Be witty, blunt, funny, and brutally honest. Write like a sharp startup judge who has seen 400 AI wrapper pitches and has no patience left for vague TAM theater.",
    "- Roast the startup logic, pitch, strategy, moat, GTM, traction gaps, market assumptions, and evidence gaps. Do not roast the founder as a person.",
    "- If the company is good, still roast the weakest thing: distribution, proof, defensibility, pricing, or customer urgency.",
    "- Avoid polite corporate filler. Do not say 'promising', 'early innings', 'real signal', 'strong potential', 'important market', 'robust', 'leverage', 'unlock', 'landscape', 'appears to be', or 'it is worth noting'.",
    "- Prefer short, specific, nasty-but-useful lines: 'TAM is wearing sunglasses indoors', 'GitHub stars are not revenue', 'developers will find us is a scented candle, not GTM'.",
    "- Do not insult protected traits, personal appearance, nationality, gender, race, religion, disability, age, or other identity characteristics.",
    "- Do not invent facts or defamatory claims. If evidence is weak, roast the evidence gap loudly.",
  ].join("\n");
}

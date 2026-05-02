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
    "- You are allowed to be witty, blunt, and brutally honest. Write like a sharp startup judge who has seen 400 AI wrapper pitches and has limited patience.",
    "- Keep the analysis useful and evidence-backed. Roast the business logic, not the person.",
    "- Do not use corporate filler. Do not say 'promising' unless you explain why.",
    "- Do not use vague phrases like 'early innings', 'real signal', 'strong potential', or 'important market' without concrete evidence.",
    "- Do not insult protected traits, personal appearance, nationality, gender, race, religion, disability, age, or other identity characteristics.",
    "- Do not invent facts. If evidence is weak, roast the evidence gap.",
  ].join("\n");
}

import { generateText, Output } from "ai";
import { getScoutLoopModel } from "@/lib/ai/scoutloop-model";
import { buildEvaluationPrompt } from "@/lib/ai/scoutloop-prompts";
import { scoutLoopEvaluationSchema } from "@/lib/ai/scoutloop-schemas";
import { createFallbackEvaluation } from "@/lib/scoutloop/demo-result";
import { gatherStartupEvidence } from "@/lib/scoutloop/evidence/brightdata";
import { recallLessons, recordRunOutcome } from "@/lib/scoutloop/memory/mubit";
import type {
  EvidenceBundle,
  NormalizedScoutLoopInput,
  ScoutLoopEvaluation,
  ScoutLoopInput,
  WorkflowEvent,
} from "@/lib/scoutloop/types";

function guessProjectName(input: ScoutLoopInput) {
  if (input.url) {
    try {
      const hostname = new URL(input.url).hostname.replace(/^www\./, "");
      return hostname.split(".")[0] || "Untitled project";
    } catch {
      return "Untitled project";
    }
  }

  const firstLine = input.pitchText?.split(/\r?\n/).find(Boolean);
  return firstLine?.slice(0, 50) || "Untitled project";
}

export function normalizeScoutLoopInput(
  input: ScoutLoopInput
): NormalizedScoutLoopInput {
  const uploadedTexts = input.uploadedTexts ?? [];
  const pitchText = input.pitchText?.trim() ?? "";
  const mergedContext = [
    pitchText,
    ...uploadedTexts.map(
      (document) => `# Uploaded file: ${document.fileName}\n${document.text}`
    ),
  ]
    .filter(Boolean)
    .join("\n\n");

  return {
    url: input.url?.trim() || undefined,
    pitchText,
    uploadedTexts,
    mode: input.mode,
    mergedContext,
    projectName: guessProjectName(input),
  };
}

function completeWorkflowEvents(warnings: string[]): WorkflowEvent[] {
  return [
    {
      id: "normalize",
      label: "Normalizing input",
      status: "complete",
      detail: "URL, pitch, mode, and uploaded text merged.",
    },
    {
      id: "lessons",
      label: "Recalling Mubit lessons",
      status: "complete",
      detail: "Relevant evaluator lessons loaded through the memory adapter.",
    },
    {
      id: "evidence",
      label: "Gathering public evidence",
      status: warnings.some((warning) => warning.includes("Bright Data"))
        ? "warning"
        : "complete",
      detail: warnings.some((warning) => warning.includes("Bright Data"))
        ? "Bright Data fallback used."
        : "Bright Data evidence adapter completed.",
    },
    {
      id: "claims",
      label: "Extracting claims",
      status: "complete",
      detail: "Claims constrained to provided evidence.",
    },
    {
      id: "competitors",
      label: "Identifying competitors",
      status: "complete",
    },
    {
      id: "market",
      label: "Estimating market hypotheses",
      status: "complete",
    },
    {
      id: "scorecard",
      label: "Generating scorecard",
      status: "complete",
    },
    {
      id: "questions",
      label: "Generating evaluator questions",
      status: "complete",
    },
    {
      id: "feedback",
      label: "Ready for feedback",
      status: "complete",
    },
  ];
}

async function generateWithModel({
  input,
  evidence,
}: {
  input: NormalizedScoutLoopInput;
  evidence: EvidenceBundle;
}) {
  const lessons = await recallLessons({
    mode: input.mode,
    projectName: input.projectName,
    pitchText: input.pitchText,
  });
  const prompt = buildEvaluationPrompt({ input, evidence, lessons });

  const { output } = await generateText({
    model: getScoutLoopModel(),
    output: Output.object({
      schema: scoutLoopEvaluationSchema,
    }),
    prompt,
  });

  return { output, lessons };
}

export async function runScoutLoopEvaluation(
  rawInput: ScoutLoopInput
): Promise<ScoutLoopEvaluation> {
  const input = normalizeScoutLoopInput(rawInput);
  const evidence = await gatherStartupEvidence(input);

  try {
    const { output, lessons } = await generateWithModel({ input, evidence });
    const evaluation: ScoutLoopEvaluation = {
      ...output,
      id: crypto.randomUUID(),
      mode: input.mode,
      createdAt: new Date().toISOString(),
      startupName: output.startupName || input.projectName,
      url: input.url,
      evidenceCards: output.evidenceCards.length
        ? output.evidenceCards
        : evidence.evidenceCards,
      lessonsApplied: lessons,
      warnings: [...evidence.warnings, ...output.warnings],
    };

    evaluation.workflowEvents = completeWorkflowEvents(evaluation.warnings);

    await recordRunOutcome({
      evaluationId: evaluation.id,
      mode: evaluation.mode,
      overallScore: evaluation.overallScore,
      warnings: evaluation.warnings,
    });

    return evaluation;
  } catch (error) {
    const message = error instanceof Error ? error.message : "unknown error";
    const lessons = await recallLessons({
      mode: input.mode,
      projectName: input.projectName,
      pitchText: input.pitchText,
    });
    const evaluation = createFallbackEvaluation({
      input,
      evidenceCards: evidence.evidenceCards,
      lessons,
      warnings: [
        ...evidence.warnings,
        `v0 structured generation unavailable; direct fallback used. ${message}`,
      ],
    });
    evaluation.workflowEvents = completeWorkflowEvents(evaluation.warnings);
    return evaluation;
  }
}

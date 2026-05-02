import { getWritable } from "workflow";
import { runScoutLoopEvaluation } from "@/lib/scoutloop/evaluate";
import type {
  ScoutLoopEvaluation,
  ScoutLoopInput,
  WorkflowEvent,
} from "@/lib/scoutloop/types";

export type ScoutLoopWorkflowStreamEvent =
  | { type: "workflow_event"; event: WorkflowEvent }
  | { type: "done"; evaluation: ScoutLoopEvaluation };

export async function scoutLoopEvaluationWorkflow(
  input: ScoutLoopInput
): Promise<ScoutLoopEvaluation> {
  "use workflow";

  await emitWorkflowEvent({
    id: "normalize",
    label: "Normalizing input",
    status: "active",
  });

  const evaluation = await runEvaluationStep(input);
  await emitDoneEvent(evaluation);

  return evaluation;
}

async function emitWorkflowEvent(event: WorkflowEvent): Promise<void> {
  "use step";

  const writer = getWritable<ScoutLoopWorkflowStreamEvent>().getWriter();
  try {
    await writer.write({ type: "workflow_event", event });
  } finally {
    writer.releaseLock();
  }
}

async function emitDoneEvent(evaluation: ScoutLoopEvaluation): Promise<void> {
  "use step";

  const writer = getWritable<ScoutLoopWorkflowStreamEvent>().getWriter();
  try {
    for (const event of evaluation.workflowEvents ?? []) {
      await writer.write({ type: "workflow_event", event });
    }
    await writer.write({ type: "done", evaluation });
  } finally {
    writer.releaseLock();
  }
}

async function runEvaluationStep(
  input: ScoutLoopInput
): Promise<ScoutLoopEvaluation> {
  "use step";

  console.log("[scoutloopEvaluation] START");
  const evaluation = await runScoutLoopEvaluation(input);
  console.log("[scoutloopEvaluation] DONE", evaluation.id);
  return evaluation;
}

import { NextResponse } from "next/server";
import { start } from "workflow/api";
import { runScoutLoopEvaluation } from "@/lib/scoutloop/evaluate";
import type { ScoutLoopInput } from "@/lib/scoutloop/types";
import { scoutLoopEvaluationWorkflow } from "@/workflows/scoutloop-evaluation";

export async function POST(request: Request) {
  const input = (await request.json()) as ScoutLoopInput;
  console.log("[ScoutLoop][API] evaluate", {
    useWdk: process.env.SCOUTLOOP_USE_WDK,
  });

  if (process.env.SCOUTLOOP_USE_WDK === "false") {
    const evaluation = await runScoutLoopEvaluation(input);
    return NextResponse.json({
      evaluation,
      fallback: true,
      warning: "WDK disabled; direct evaluation fallback used.",
    });
  }

  try {
    console.log("[ScoutLoop][WDK] start");
    const run = await start(scoutLoopEvaluationWorkflow, [input]);
    console.log("[ScoutLoop][WDK] started", { runId: run.runId });
    return NextResponse.json({ runId: run.runId });
  } catch (error) {
    const evaluation = await runScoutLoopEvaluation(input);
    const message = error instanceof Error ? error.message : "unknown error";
    return NextResponse.json({
      evaluation,
      fallback: true,
      warning: `WDK start failed; direct evaluation fallback used. ${message}`,
    });
  }
}

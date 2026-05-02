import { NextResponse } from "next/server";
import { runScoutLoopEvaluation } from "@/lib/scoutloop/evaluate";
import type { ScoutLoopInput } from "@/lib/scoutloop/types";

export async function POST(request: Request) {
  const input = (await request.json()) as ScoutLoopInput;
  const evaluation = await runScoutLoopEvaluation(input);

  return NextResponse.json({ evaluation });
}

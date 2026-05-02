import { NextResponse } from "next/server";
import { recordEvaluatorFeedback } from "@/lib/scoutloop/memory/mubit";
import type { EvaluatorFeedback } from "@/lib/scoutloop/types";

export async function POST(request: Request) {
  const feedback = (await request.json()) as EvaluatorFeedback;
  const lessons = await recordEvaluatorFeedback(feedback);

  return NextResponse.json({
    lessons,
    warning: process.env.MUBIT_API_KEY
      ? "Mubit SDK boundary is isolated; using local fallback memory for demo reliability."
      : "Mubit unavailable; using local demo memory fallback.",
  });
}

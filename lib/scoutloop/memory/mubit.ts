import {
  loadMemoryLessons,
  saveEvaluatorFeedback,
  saveMemoryLessons,
} from "@/lib/scoutloop/persistence";
import type {
  EvaluatorFeedback,
  MemoryLesson,
  MemoryRecallContext,
  RunOutcome,
} from "@/lib/scoutloop/types";

const localLessons: MemoryLesson[] = [];

function createLesson(text: string): MemoryLesson {
  return {
    id: crypto.randomUUID(),
    lesson: text,
    source: "local_fallback",
    createdAt: new Date().toISOString(),
    relevance: 1,
  };
}

export async function recallLessons(
  context: MemoryRecallContext
): Promise<MemoryLesson[]> {
  console.log("[ScoutLoop][Mubit] recall:start", {
    mode: context.mode,
    hasApiKey: Boolean(process.env.MUBIT_API_KEY),
    agentId: process.env.MUBIT_AGENT_ID || null,
    adapter: "neon/local-fallback",
  });
  const persistedLessons = await loadMemoryLessons(context.mode).catch(
    () => []
  );
  if (persistedLessons.length) {
    console.log("[ScoutLoop][Mubit] recall:persisted", {
      count: persistedLessons.length,
    });
    return persistedLessons;
  }

  const scoped = localLessons.filter((lesson) => {
    const text = lesson.lesson.toLowerCase();
    return (
      text.includes("startup") ||
      text.includes("hackathon") ||
      text.includes(context.mode === "startup_judge" ? "defensibility" : "demo")
    );
  });

  const recalled = scoped.slice(-3);
  console.log("[ScoutLoop][Mubit] recall:local", { count: recalled.length });
  return recalled;
}

export function recordRunOutcome(_outcome: RunOutcome): void {
  console.log("[ScoutLoop][Mubit] outcome:recorded-local", {
    evaluationId: _outcome.evaluationId,
    overallScore: _outcome.overallScore,
  });
  return;
}

export async function recordEvaluatorFeedback(
  feedback: EvaluatorFeedback
): Promise<MemoryLesson[]> {
  console.log("[ScoutLoop][Mubit] feedback:start", {
    evaluationId: feedback.evaluationId,
    quickFeedback: feedback.quickFeedback,
    hasCustomFeedback: Boolean(feedback.customFeedback),
    hasApiKey: Boolean(process.env.MUBIT_API_KEY),
  });
  await saveEvaluatorFeedback(feedback).catch(() => undefined);
  const lessons = reflectFeedbackIntoLessons(feedback);
  localLessons.push(...lessons);
  await saveMemoryLessons(lessons, feedback.mode).catch(() => undefined);
  console.log("[ScoutLoop][Mubit] feedback:lesson-stored", {
    count: lessons.length,
    source: lessons[0]?.source,
  });
  return lessons;
}

export function reflectFeedbackIntoLessons(
  feedback: EvaluatorFeedback
): MemoryLesson[] {
  const combined = [...feedback.quickFeedback, feedback.customFeedback ?? ""]
    .join(" ")
    .toLowerCase();

  if (
    combined.includes("generic") ||
    combined.includes("defensibility") ||
    combined.includes("distribution") ||
    combined.includes("data advantage") ||
    combined.includes("technical")
  ) {
    return [
      createLesson(
        "When evaluating early-stage AI startups, prioritize technical defensibility, distribution, workflow lock-in, and proprietary data advantage in founder questions."
      ),
    ];
  }

  if (combined.includes("competitor")) {
    return [
      createLesson(
        "When evaluating startups, pressure-test direct competitors, indirect alternatives, and the customer's do-nothing workflow before scoring differentiation."
      ),
    ];
  }

  if (combined.includes("over-scored") || combined.includes("under-scored")) {
    return [
      createLesson(
        "When evaluator feedback challenges scoring, explain evidence quality and missing proof before assigning high-confidence scores."
      ),
    ];
  }

  if (feedback.mode === "hackathon_judge") {
    return [
      createLesson(
        "In hackathon mode, reward sponsor integration only when it is essential to the product workflow and visible in the demo."
      ),
    ];
  }

  return [
    createLesson(
      "If public evidence is sparse, ask founders for traction proof, repeat usage, willingness to pay, and customer pain evidence."
    ),
  ];
}

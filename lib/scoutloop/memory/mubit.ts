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
  const persistedLessons = await loadMemoryLessons(context.mode).catch(
    () => []
  );
  if (persistedLessons.length) {
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

  return scoped.slice(-3);
}

export function recordRunOutcome(_outcome: RunOutcome): void {
  return;
}

export async function recordEvaluatorFeedback(
  feedback: EvaluatorFeedback
): Promise<MemoryLesson[]> {
  await saveEvaluatorFeedback(feedback).catch(() => undefined);
  const lessons = reflectFeedbackIntoLessons(feedback);
  localLessons.push(...lessons);
  await saveMemoryLessons(lessons, feedback.mode).catch(() => undefined);
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

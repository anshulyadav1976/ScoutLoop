import postgres from "postgres";
import type {
  EvaluatorFeedback,
  MemoryLesson,
  ScoutLoopEvaluation,
} from "@/lib/scoutloop/types";

let client: postgres.Sql | null = null;

function getSqlClient() {
  const url = process.env.POSTGRES_URL || process.env.DATABASE_URL;

  if (!url) {
    return null;
  }

  client ??= postgres(url, { max: 1 });
  return client;
}

export async function saveEvaluationRun(evaluation: ScoutLoopEvaluation) {
  const sql = getSqlClient();

  if (!sql) {
    return;
  }

  await sql`
    INSERT INTO "ScoutLoopRun" (
      "id",
      "mode",
      "url",
      "startupName",
      "evaluation"
    )
    VALUES (
      ${evaluation.id},
      ${evaluation.mode},
      ${evaluation.url ?? null},
      ${evaluation.startupName ?? null},
      ${sql.json(evaluation)}
    )
    ON CONFLICT ("id")
    DO UPDATE SET "evaluation" = EXCLUDED."evaluation"
  `;
}

export async function saveEvaluatorFeedback(feedback: EvaluatorFeedback) {
  const sql = getSqlClient();

  if (!sql) {
    return;
  }

  await sql`
    INSERT INTO "ScoutLoopFeedback" (
      "evaluationId",
      "mode",
      "feedback"
    )
    VALUES (
      ${feedback.evaluationId},
      ${feedback.mode},
      ${sql.json(feedback)}
    )
  `;
}

export async function saveMemoryLessons(
  lessons: MemoryLesson[],
  mode?: EvaluatorFeedback["mode"]
) {
  const sql = getSqlClient();

  if (!(sql && lessons.length)) {
    return;
  }

  for (const lesson of lessons) {
    await sql`
      INSERT INTO "ScoutLoopLesson" (
        "id",
        "lesson",
        "source",
        "mode",
        "createdAt"
      )
      VALUES (
        ${lesson.id},
        ${lesson.lesson},
        ${lesson.source},
        ${mode ?? null},
        ${lesson.createdAt ? new Date(lesson.createdAt) : new Date()}
      )
      ON CONFLICT ("id")
      DO NOTHING
    `;
  }
}

export async function loadMemoryLessons(
  mode?: EvaluatorFeedback["mode"]
): Promise<MemoryLesson[]> {
  const sql = getSqlClient();

  if (!sql) {
    return [];
  }

  const rows = await sql<
    {
      id: string;
      lesson: string;
      source: "mubit" | "local_fallback";
      createdAt: Date;
    }[]
  >`
    SELECT "id", "lesson", "source", "createdAt"
    FROM "ScoutLoopLesson"
    WHERE "mode" IS NULL OR "mode" = ${mode ?? null}
    ORDER BY "createdAt" DESC
    LIMIT 5
  `;

  return rows.map((row) => ({
    id: row.id,
    lesson: row.lesson,
    source: row.source,
    createdAt: row.createdAt.toISOString(),
    relevance: 0.9,
  }));
}

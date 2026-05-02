CREATE TABLE IF NOT EXISTS "ScoutLoopRun" (
  "id" uuid PRIMARY KEY NOT NULL,
  "mode" varchar NOT NULL,
  "url" text,
  "startupName" text,
  "evaluation" json NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "ScoutLoopFeedback" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "evaluationId" uuid NOT NULL,
  "mode" varchar NOT NULL,
  "feedback" json NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "ScoutLoopLesson" (
  "id" uuid PRIMARY KEY NOT NULL,
  "lesson" text NOT NULL,
  "source" varchar NOT NULL,
  "mode" varchar,
  "createdAt" timestamp DEFAULT now() NOT NULL
);

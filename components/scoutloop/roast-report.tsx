"use client";

import { AlertTriangle, MessageSquare, Search } from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import type { RoastReport, RoastSection } from "@/lib/scoutloop/roast";
import {
  generateRoastReport,
  sharpenFounderQuestion,
} from "@/lib/scoutloop/roast";
import type { ScoutLoopEvaluation } from "@/lib/scoutloop/types";

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

const accentByIntensity: Record<
  RoastReport["threatIntensity"],
  { text: string; bar: string; soft: string }
> = {
  critical: {
    text: "text-red-600",
    bar: "bg-red-600",
    soft: "bg-red-50 text-red-700",
  },
  high: {
    text: "text-red-600",
    bar: "bg-red-600",
    soft: "bg-red-50 text-red-700",
  },
  medium: {
    text: "text-red-500",
    bar: "bg-red-500",
    soft: "bg-red-50 text-red-700",
  },
  low: {
    text: "text-orange-500",
    bar: "bg-orange-500",
    soft: "bg-orange-50 text-orange-700",
  },
  safe: {
    text: "text-emerald-600",
    bar: "bg-emerald-600",
    soft: "bg-emerald-50 text-emerald-700",
  },
};

function ScoreBar({ score, color }: { score: number; color: string }) {
  const width = Math.max(0, Math.min(100, score * 10));
  return (
    <div className="mt-3 h-2 w-full bg-zinc-200">
      <div
        className={classNames("h-full", color)}
        style={{ width: `${width}%` }}
      />
    </div>
  );
}

function RoastHero({
  evaluation,
  report,
}: {
  evaluation: ScoutLoopEvaluation;
  report: RoastReport;
}) {
  const accent = accentByIntensity[report.threatIntensity];
  return (
    <section className="border-b border-zinc-200 px-5 pb-8 pt-8 text-center sm:px-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.55em] text-zinc-500">
        Startup Threat Level
      </p>
      <div
        className={classNames(
          "mt-7 font-black text-7xl tracking-tight sm:text-8xl",
          accent.text
        )}
      >
        {evaluation.overallScore.toFixed(1)}
      </div>
      <p className="mt-1 font-mono text-lg text-zinc-700">/ 10</p>
      <div className="mx-auto mt-5 max-w-xs">
        <ScoreBar color={accent.bar} score={evaluation.overallScore} />
      </div>
      <h2
        className={classNames(
          "mt-7 font-mono font-bold text-base uppercase tracking-[0.35em]",
          accent.text
        )}
      >
        {report.threatLabel}
      </h2>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        <Badge
          className="border-zinc-300 bg-white text-zinc-700"
          variant="outline"
        >
          {evaluation.mode === "startup_judge"
            ? "Startup Judge"
            : "Hackathon Judge"}
        </Badge>
        <Badge
          className="border-zinc-300 bg-white text-zinc-700"
          variant="outline"
        >
          {evaluation.overallConfidence} confidence
        </Badge>
        {evaluation.startupName ? (
          <Badge className={accent.soft} variant="secondary">
            {evaluation.startupName}
          </Badge>
        ) : null}
      </div>
      <p className="mx-auto mt-10 max-w-3xl text-left font-serif text-2xl leading-relaxed text-black sm:text-3xl">
        {report.overallRoast}
      </p>
      <p className="mx-auto mt-5 max-w-3xl text-left text-sm leading-relaxed text-zinc-500">
        Serious read: {report.seriousSummary}
      </p>
    </section>
  );
}

function RoastMarker({
  section,
  color,
}: {
  section: RoastSection;
  color: string;
}) {
  return (
    <section className="border-b border-zinc-200 px-5 py-8 sm:px-10">
      <div className="flex items-end justify-between gap-5">
        <div>
          <p className="font-mono text-[11px] font-bold uppercase tracking-[0.35em] text-black">
            {section.title}
          </p>
          <p className="mt-1 text-xs text-zinc-500">{section.badge}</p>
        </div>
        <div className="shrink-0 font-mono font-bold text-red-600 text-sm">
          {section.score.toFixed(1)}/10
        </div>
      </div>
      <ScoreBar color={color} score={section.score} />
      <p className="mt-5 font-serif text-xl leading-relaxed text-black sm:text-2xl">
        {section.roast}
      </p>
      <div className="mt-4 grid gap-3 text-sm leading-relaxed sm:grid-cols-[1fr_0.8fr]">
        <p className="text-zinc-600">{section.evidenceNote}</p>
        <p className="border-l-2 border-red-500 pl-3 font-medium text-zinc-800">
          Fix: {section.fix}
        </p>
      </div>
      <div className="mt-4 flex gap-2">
        <span className="rounded-full bg-zinc-100 px-2 py-1 text-[11px] text-zinc-600">
          Confidence: {section.confidence}
        </span>
      </div>
    </section>
  );
}

function FounderSweatQuestions({
  evaluation,
}: {
  evaluation: ScoutLoopEvaluation;
}) {
  const questions = evaluation.founderQuestions.slice(0, 6);
  if (questions.length === 0) {
    return null;
  }

  return (
    <section className="border-b border-zinc-200 px-5 py-8 sm:px-10">
      <div className="flex items-center gap-2">
        <MessageSquare className="size-4 text-red-600" />
        <h2 className="font-mono font-bold text-[11px] uppercase tracking-[0.35em] text-black">
          Questions That Make Founders Sweat
        </h2>
      </div>
      <div className="mt-5 space-y-5">
        {questions.map((question) => (
          <div key={`${question.category}-${question.question}`}>
            <p className="font-serif text-xl leading-snug text-black">
              {sharpenFounderQuestion(question)}
            </p>
            <p className="mt-1 text-sm text-zinc-500">{question.whyAsk}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function EvidenceStrip({ evaluation }: { evaluation: ScoutLoopEvaluation }) {
  if (evaluation.evidenceCards.length === 0) {
    return null;
  }

  return (
    <details className="border-b border-zinc-200 px-5 py-6 sm:px-10">
      <summary className="flex cursor-pointer items-center gap-2 font-mono font-bold text-[11px] uppercase tracking-[0.35em] text-black">
        <Search className="size-4 text-red-600" />
        Evidence Receipts
      </summary>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {evaluation.evidenceCards.slice(0, 6).map((card) => (
          <div className="border border-zinc-200 p-3" key={card.id}>
            <div className="flex items-start justify-between gap-3">
              <p className="font-medium text-sm text-black">{card.title}</p>
              <span className="font-mono text-[10px] uppercase text-zinc-500">
                {card.confidence}
              </span>
            </div>
            <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-zinc-600">
              {card.snippet}
            </p>
            {card.url ? (
              <a
                className="mt-2 block truncate text-red-600 text-xs hover:underline"
                href={card.url}
                rel="noopener noreferrer"
                target="_blank"
              >
                {card.url}
              </a>
            ) : null}
          </div>
        ))}
      </div>
    </details>
  );
}

function FinalVerdict({ report }: { report: RoastReport }) {
  return (
    <section className="px-5 py-8 sm:px-10">
      <p className="font-mono font-bold text-[11px] uppercase tracking-[0.35em] text-black">
        Final Verdict
      </p>
      <p className="mt-5 font-serif text-2xl leading-relaxed text-black sm:text-3xl">
        {report.finalVerdict.punchline}
      </p>
      <div className="mt-7 grid gap-5 text-sm leading-relaxed sm:grid-cols-3">
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-red-600">
            Best Thing
          </p>
          <p className="mt-2 text-zinc-700">{report.finalVerdict.bestThing}</p>
        </div>
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-red-600">
            Biggest Problem
          </p>
          <p className="mt-2 text-zinc-700">
            {report.finalVerdict.biggestConcern}
          </p>
        </div>
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-red-600">
            Fastest Fix
          </p>
          <p className="mt-2 text-zinc-700">
            {report.finalVerdict.fastestWayToImprove}
          </p>
        </div>
      </div>
    </section>
  );
}

export function RoastDashboard({
  evaluation,
}: {
  evaluation: ScoutLoopEvaluation;
}) {
  const report = useMemo(() => generateRoastReport(evaluation), [evaluation]);
  const accent = accentByIntensity[report.threatIntensity];

  return (
    <div className="overflow-hidden border border-zinc-300 bg-white text-black shadow-[0_18px_60px_rgba(0,0,0,0.08)]">
      <RoastHero evaluation={evaluation} report={report} />

      {evaluation.warnings.length > 0 ? (
        <section className="border-b border-zinc-200 bg-amber-50 px-5 py-4 text-amber-900 text-sm sm:px-10">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="size-4" />
            Evidence Warnings
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {evaluation.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {report.sections.map((section) => (
        <RoastMarker color={accent.bar} key={section.id} section={section} />
      ))}

      <FounderSweatQuestions evaluation={evaluation} />
      <EvidenceStrip evaluation={evaluation} />
      <FinalVerdict report={report} />
    </div>
  );
}

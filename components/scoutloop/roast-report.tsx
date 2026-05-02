"use client";

import {
  AlertTriangle,
  ArrowRight,
  Flame,
  MessageSquare,
  Shield,
  Skull,
  Swords,
  TrendingUp,
  Trophy,
  Zap,
} from "lucide-react";
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

const sectionIcons: Record<string, React.ElementType> = {
  problem: Flame,
  market: TrendingUp,
  competitors: Swords,
  moat: Shield,
  distribution: Zap,
  traction: Trophy,
  risks: Skull,
};

const threatConfig: Record<
  RoastReport["threatIntensity"],
  { bg: string; text: string; border: string; bar: string }
> = {
  safe: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
    border: "border-emerald-500/30",
    bar: "bg-emerald-500",
  },
  low: {
    bg: "bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
    border: "border-blue-500/30",
    bar: "bg-blue-500",
  },
  medium: {
    bg: "bg-amber-500/10",
    text: "text-amber-600 dark:text-amber-400",
    border: "border-amber-500/30",
    bar: "bg-amber-500",
  },
  high: {
    bg: "bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
    border: "border-orange-500/30",
    bar: "bg-orange-500",
  },
  critical: {
    bg: "bg-red-500/10",
    text: "text-red-600 dark:text-red-400",
    border: "border-red-500/30",
    bar: "bg-red-500",
  },
};

const confidenceBadge: Record<string, string> = {
  high: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  low: "bg-red-500/10 text-red-700 dark:text-red-400",
};

function ScoreBar({
  score,
  intensity,
}: {
  score: number;
  intensity: RoastReport["threatIntensity"];
}) {
  const config = threatConfig[intensity];
  const pct = Math.min(100, Math.max(0, (score / 10) * 100));
  return (
    <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
      <div
        className={classNames("h-full rounded-full transition-all", config.bar)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function ThreatLevelCard({
  report,
  evaluation,
}: {
  report: RoastReport;
  evaluation: ScoutLoopEvaluation;
}) {
  const config = threatConfig[report.threatIntensity];
  return (
    <section
      className={classNames(
        "rounded-lg border p-5 shadow-[var(--shadow-card)]",
        config.bg,
        config.border
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Overall Threat Level
          </p>
          <h2
            className={classNames(
              "mt-1 font-bold text-2xl leading-tight sm:text-3xl",
              config.text
            )}
          >
            {report.threatLabel}
          </h2>
          <p className="mt-2 max-w-xl text-sm">{report.overallRoast}</p>
          <p className="mt-1 text-muted-foreground text-xs">
            {report.seriousSummary.slice(0, 160)}
            {report.seriousSummary.length > 160 ? "…" : ""}
          </p>
        </div>
        <div className="text-right">
          <div className={classNames("font-bold text-5xl", config.text)}>
            {evaluation.overallScore.toFixed(1)}
          </div>
          <div className="text-muted-foreground text-sm">/ 10</div>
          <Badge
            className={classNames(
              "mt-2",
              confidenceBadge[evaluation.overallConfidence]
            )}
            variant="outline"
          >
            {evaluation.overallConfidence} confidence
          </Badge>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="secondary">
          {evaluation.mode === "startup_judge"
            ? "Startup Judge"
            : "Hackathon Judge"}
        </Badge>
        {evaluation.startupName ? (
          <Badge variant="outline">{evaluation.startupName}</Badge>
        ) : null}
      </div>
    </section>
  );
}

function RoastSectionCard({ section }: { section: RoastSection }) {
  const Icon = sectionIcons[section.id] ?? Flame;
  const scoreIntensity =
    section.score >= 7
      ? "safe"
      : section.score >= 5
        ? "medium"
        : section.id === "risks"
          ? "safe"
          : "high";

  return (
    <div className="flex flex-col rounded-lg border bg-card shadow-[var(--shadow-card)]">
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex size-7 items-center justify-center rounded-md bg-muted">
              <Icon className="size-4 text-muted-foreground" />
            </span>
            <h3 className="font-semibold text-sm">{section.title}</h3>
          </div>
          <div className="text-right shrink-0">
            <span className="font-bold text-lg">
              {section.score.toFixed(1)}
            </span>
            <span className="text-muted-foreground text-xs"> / 10</span>
          </div>
        </div>

        <ScoreBar intensity={scoreIntensity} score={section.score} />

        <div className="mt-1 flex items-center justify-between">
          <span
            className={classNames(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              confidenceBadge[section.confidence]
            )}
          >
            {section.badge}
          </span>
        </div>
      </div>

      <div className="border-t px-4 py-4">
        <p className="font-semibold text-[10px] text-red-600 uppercase tracking-wider dark:text-red-400">
          Roast
        </p>
        <p className="mt-1 font-semibold text-base leading-relaxed">
          {section.roast}
        </p>
      </div>

      <div className="border-t bg-muted/20 px-4 py-3">
        <p className="font-semibold text-[10px] text-muted-foreground uppercase tracking-wider">
          Useful truth
        </p>
        <p className="mt-1 text-muted-foreground text-xs leading-relaxed">
          {section.usefulTruth}
        </p>
      </div>

      <div className="border-t px-4 py-3">
        <p className="font-semibold text-[10px] text-blue-600 uppercase tracking-wider dark:text-blue-400">
          Fix this fastest
        </p>
        <p className="mt-1 text-sm leading-relaxed">{section.improve}</p>
      </div>

      <details className="group border-t">
        <summary className="flex cursor-pointer select-none items-center gap-2 px-4 py-2.5 text-muted-foreground text-xs hover:text-foreground">
          <ArrowRight className="size-3 transition-transform group-open:rotate-90" />
          Source detail
        </summary>
        <div className="border-t bg-muted/30 px-4 py-3 text-muted-foreground text-xs leading-relaxed whitespace-pre-line">
          {section.insight}
        </div>
      </details>
    </div>
  );
}

function FounderSweatQuestions({
  evaluation,
}: {
  evaluation: ScoutLoopEvaluation;
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, typeof evaluation.founderQuestions>();
    for (const q of evaluation.founderQuestions) {
      const existing = map.get(q.category) ?? [];
      map.set(q.category, [...existing, q]);
    }
    return map;
  }, [evaluation.founderQuestions]);

  const categoryLabels: Record<string, string> = {
    moat: "Moat",
    distribution: "Distribution",
    problem: "Customer Pain",
    technical: "Technical Defensibility",
    traction: "Traction",
    competition: "Competition",
    market: "Market",
    founder_quality: "Founder Quality",
    risk: "Risk",
  };

  const severityColors: Record<string, string> = {
    high: "text-red-600 dark:text-red-400",
    medium: "text-amber-600 dark:text-amber-400",
    low: "text-muted-foreground",
  };

  return (
    <section className="rounded-lg border bg-card shadow-[var(--shadow-card)]">
      <div className="border-b px-5 py-4">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4 text-muted-foreground" />
          <h2 className="font-bold text-base">
            Questions That Make Founders Sweat
          </h2>
        </div>
        <p className="mt-1 text-muted-foreground text-xs">
          Evidence-backed. Aim carefully.
        </p>
      </div>
      <div className="divide-y">
        {Array.from(grouped.entries()).map(([category, questions]) => (
          <div className="px-5 py-4" key={category}>
            <p className="mb-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">
              {categoryLabels[category] ?? category}
            </p>
            <div className="space-y-3">
              {questions.map((q) => (
                <div key={q.question}>
                  <p
                    className={classNames(
                      "font-medium text-sm",
                      severityColors[q.severity]
                    )}
                  >
                    {sharpenFounderQuestion(q)}
                  </p>
                  <p className="mt-1 text-muted-foreground text-xs">
                    {q.whyAsk}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function FinalVerdictCard({ report }: { report: RoastReport }) {
  const config = threatConfig[report.threatIntensity];
  return (
    <section
      className={classNames(
        "rounded-lg border p-5 shadow-[var(--shadow-card)]",
        config.bg,
        config.border
      )}
    >
      <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
        Final Verdict
      </p>
      <p
        className={classNames(
          "mt-1 font-bold text-xl leading-snug",
          config.text
        )}
      >
        {report.finalVerdict.punchline}
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div>
          <p className="font-semibold text-emerald-600 text-xs uppercase tracking-wider dark:text-emerald-400">
            Best Thing
          </p>
          <p className="mt-1 text-sm">{report.finalVerdict.bestThing}</p>
        </div>
        <div>
          <p className="font-semibold text-red-600 text-xs uppercase tracking-wider dark:text-red-400">
            Biggest Concern
          </p>
          <p className="mt-1 text-sm">{report.finalVerdict.biggestConcern}</p>
        </div>
        <div>
          <p className="font-semibold text-blue-600 text-xs uppercase tracking-wider dark:text-blue-400">
            Fastest Way to Improve
          </p>
          <p className="mt-1 text-sm">
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

  return (
    <div className="space-y-4">
      <ThreatLevelCard evaluation={evaluation} report={report} />

      {evaluation.warnings.length > 0 ? (
        <section className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2 font-medium text-sm">
            <AlertTriangle className="size-4" />
            Evidence Warnings
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {evaluation.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {report.sections.map((section) => (
          <RoastSectionCard key={section.id} section={section} />
        ))}
      </div>

      {evaluation.founderQuestions.length > 0 ? (
        <FounderSweatQuestions evaluation={evaluation} />
      ) : null}

      {evaluation.evidenceCards.length > 0 ? (
        <section className="rounded-lg border bg-card shadow-[var(--shadow-card)]">
          <div className="border-b px-5 py-4">
            <h2 className="font-bold text-base">Evidence Cards</h2>
            <p className="mt-0.5 text-muted-foreground text-xs">
              What ScoutLoop actually found on the internet.
            </p>
          </div>
          <div className="grid gap-3 p-4 md:grid-cols-2">
            {evaluation.evidenceCards.map((card) => (
              <div
                className="rounded-md border bg-background p-3 text-sm"
                key={card.id}
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium leading-snug">{card.title}</p>
                  <Badge
                    className={classNames(
                      "shrink-0",
                      confidenceBadge[card.confidence]
                    )}
                    variant="outline"
                  >
                    {card.confidence}
                  </Badge>
                </div>
                <p className="mt-2 text-muted-foreground text-xs leading-relaxed">
                  {card.snippet}
                </p>
                {card.url ? (
                  <a
                    className="mt-2 block truncate text-muted-foreground text-xs hover:underline"
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
        </section>
      ) : null}

      <FinalVerdictCard report={report} />
    </div>
  );
}

"use client";

import {
  AlertTriangle,
  ArrowRight,
  Check,
  FileText,
  Gauge,
  GraduationCap,
  Loader2,
  RefreshCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Upload,
} from "lucide-react";
import { useMemo, useState } from "react";
import { MessageResponse } from "@/components/ai-elements/message";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  evaluationModes,
  quickFeedbackOptions,
  SCOUTLOOP_MAX_TEXT_FILE_BYTES,
  sharperQuestionExamples,
  techBadges,
  workflowTimeline,
} from "@/lib/scoutloop/constants";
import { createFallbackEvaluation } from "@/lib/scoutloop/demo-result";
import type {
  EvaluationMode,
  EvaluatorFeedback,
  ScoutLoopEvaluation,
  UploadedTextDocument,
  WorkflowEvent,
} from "@/lib/scoutloop/types";

const acceptedExtensions = [".txt", ".md", ".csv", ".json"];

function classNames(...classes: Array<string | false | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function modeIcon(mode: EvaluationMode) {
  return mode === "startup_judge" ? Target : GraduationCap;
}

function timelineForStatus(
  status: "idle" | "running" | "complete" | "error",
  events?: WorkflowEvent[]
) {
  if (events?.length) {
    return events;
  }

  if (status === "idle") {
    return workflowTimeline;
  }

  if (status === "complete") {
    return workflowTimeline.map((step) => ({
      ...step,
      status: "complete" as const,
    }));
  }

  if (status === "error") {
    return workflowTimeline.map((step, index) => ({
      ...step,
      status:
        index < 2
          ? ("complete" as const)
          : index === 2
            ? ("warning" as const)
            : ("pending" as const),
    }));
  }

  return workflowTimeline.map((step, index) => ({
    ...step,
    status:
      index < 3
        ? ("complete" as const)
        : index === 3
          ? ("active" as const)
          : ("pending" as const),
  }));
}

export function ScoutLoopApp() {
  const [mode, setMode] = useState<EvaluationMode>("startup_judge");
  const [url, setUrl] = useState("");
  const [pitchText, setPitchText] = useState("");
  const [uploadedTexts, setUploadedTexts] = useState<UploadedTextDocument[]>(
    []
  );
  const [fileError, setFileError] = useState("");
  const [status, setStatus] = useState<
    "idle" | "running" | "complete" | "error"
  >("idle");
  const [evaluation, setEvaluation] = useState<ScoutLoopEvaluation | null>(
    null
  );
  const [workflowEvents, setWorkflowEvents] = useState<WorkflowEvent[]>([]);
  const [error, setError] = useState("");
  const [selectedFeedback, setSelectedFeedback] = useState<string[]>([]);
  const [customFeedback, setCustomFeedback] = useState("");
  const [storedLesson, setStoredLesson] = useState("");

  const timeline = useMemo(
    () =>
      timelineForStatus(
        status,
        evaluation?.workflowEvents ??
          (workflowEvents.length ? workflowEvents : undefined)
      ),
    [status, evaluation?.workflowEvents, workflowEvents]
  );

  async function handleFiles(files: FileList | null) {
    if (!files?.length) {
      return;
    }

    setFileError("");
    const parsed: UploadedTextDocument[] = [];

    for (const file of Array.from(files)) {
      const extension = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
      if (!acceptedExtensions.includes(extension)) {
        setFileError("Only .txt, .md, .csv, and .json files are supported.");
        continue;
      }

      if (file.size > SCOUTLOOP_MAX_TEXT_FILE_BYTES) {
        setFileError(
          `Files must be ${Math.round(
            SCOUTLOOP_MAX_TEXT_FILE_BYTES / 1000
          )} KB or smaller.`
        );
        continue;
      }

      const text = await file.text();
      parsed.push({
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        text,
      });
    }

    if (parsed.length) {
      setUploadedTexts((current) => [...current, ...parsed]);
    }
  }

  async function startEvaluation(useLearnedContext = false) {
    setError("");
    setStatus("running");
    setWorkflowEvents([]);

    const body = {
      url,
      pitchText,
      uploadedTexts,
      mode,
      rerunOf: useLearnedContext ? evaluation?.id : undefined,
    };

    try {
      const response = await fetch("/api/scoutloop/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("ScoutLoop evaluation failed.");
      }

      const data = (await response.json()) as {
        evaluation: ScoutLoopEvaluation;
        runId?: string;
      };
      if (data.evaluation) {
        setEvaluation(data.evaluation);
        setStatus("complete");
        return;
      }

      if (data.runId) {
        await watchWorkflowRun(data.runId);
        return;
      }

      throw new Error("ScoutLoop evaluation did not return a run.");
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : "ScoutLoop evaluation failed.";
      setError(message);
      setStatus("error");

      const fallback = createFallbackEvaluation({
        input: {
          mode,
          url,
          pitchText,
          uploadedTexts,
          mergedContext: [pitchText, ...uploadedTexts.map((file) => file.text)]
            .filter(Boolean)
            .join("\n\n"),
          projectName: url || "Provided evaluation",
        },
        lessons: storedLesson
          ? [
              {
                id: "local-ui-lesson",
                lesson: storedLesson,
                source: "local_fallback",
                createdAt: new Date().toISOString(),
              },
            ]
          : [],
        warnings: [message],
      });
      setEvaluation(fallback);
    }
  }

  async function watchWorkflowRun(runId: string) {
    await new Promise<void>((resolve, reject) => {
      const source = new EventSource(
        `/api/scoutloop/workflow/readable/${runId}`
      );

      const fallbackTimer = window.setTimeout(() => {
        source.close();
        reject(new Error("WDK stream timed out; direct fallback can be used."));
      }, 90_000);

      source.onmessage = (event) => {
        const payload = JSON.parse(event.data) as
          | { type: "workflow_event"; event: WorkflowEvent }
          | { type: "done"; evaluation: ScoutLoopEvaluation };

        if (payload.type === "workflow_event") {
          setWorkflowEvents((current) => {
            const withoutExisting = current.filter(
              (item) => item.id !== payload.event.id
            );
            return [...withoutExisting, payload.event];
          });
        }

        if (payload.type === "done") {
          window.clearTimeout(fallbackTimer);
          source.close();
          setEvaluation(payload.evaluation);
          setStatus("complete");
          resolve();
        }
      };

      source.onerror = () => {
        window.clearTimeout(fallbackTimer);
        source.close();
        reject(new Error("WDK stream failed; direct fallback can be used."));
      };
    });
  }

  async function submitFeedback() {
    if (!evaluation) {
      return;
    }

    const feedback: EvaluatorFeedback = {
      evaluationId: evaluation.id,
      quickFeedback: selectedFeedback,
      customFeedback,
      mode,
      createdAt: new Date().toISOString(),
    };

    try {
      const response = await fetch("/api/scoutloop/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(feedback),
      });

      if (!response.ok) {
        throw new Error("Feedback route unavailable.");
      }

      const data = (await response.json()) as {
        lessons: { lesson: string }[];
      };
      const lesson = data.lessons[0]?.lesson;
      setStoredLesson(
        lesson ??
          "When evaluating early-stage AI startups, prioritize technical defensibility, distribution, workflow lock-in, and proprietary data advantage in founder questions."
      );
    } catch {
      setStoredLesson(
        "When evaluating early-stage AI startups, prioritize technical defensibility, distribution, workflow lock-in, and proprietary data advantage in founder questions."
      );
    }
  }

  const currentMode = evaluationModes.find((item) => item.id === mode);
  const ModeIcon = modeIcon(mode);

  return (
    <main className="min-h-dvh bg-background text-foreground">
      <section className="border-border border-b bg-sidebar/50">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Sparkles className="size-4" />
                Vercel-native due diligence agent
              </div>
              <h1 className="mt-2 text-4xl tracking-normal sm:text-5xl">
                ScoutLoop
              </h1>
              <p className="mt-3 max-w-2xl text-muted-foreground">
                Dashboard-first startup and hackathon evaluation with durable
                workflow progress, evidence cards, scoring, and evaluator
                feedback memory.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 lg:max-w-md lg:justify-end">
              {techBadges.map((badge) => (
                <Badge key={badge} variant="outline">
                  {badge}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[390px_1fr] lg:px-8">
        <aside className="space-y-4">
          <section className="rounded-lg border bg-card p-4 shadow-[var(--shadow-card)]">
            <div className="flex items-center gap-2">
              <ModeIcon className="size-4 text-muted-foreground" />
              <h2 className="font-medium text-base">Evaluation setup</h2>
            </div>

            <div className="mt-4 grid gap-2">
              {evaluationModes.map((option) => {
                const Icon = modeIcon(option.id);
                return (
                  <button
                    className={classNames(
                      "rounded-lg border p-3 text-left transition-colors",
                      mode === option.id
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-background hover:bg-muted"
                    )}
                    key={option.id}
                    onClick={() => setMode(option.id)}
                    type="button"
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="size-4" />
                      <span className="font-medium text-sm">
                        {option.label}
                      </span>
                    </div>
                    <p
                      className={classNames(
                        "mt-1 text-xs",
                        mode === option.id
                          ? "text-background/75"
                          : "text-muted-foreground"
                      )}
                    >
                      {option.description}
                    </p>
                  </button>
                );
              })}
            </div>

            <label className="mt-4 block" htmlFor="scoutloop-url">
              <span className="font-medium text-sm">Startup/project URL</span>
              <Input
                className="mt-2"
                id="scoutloop-url"
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://startup.example"
                value={url}
              />
            </label>

            <label className="mt-4 block" htmlFor="scoutloop-pitch">
              <span className="font-medium text-sm">Pitch text</span>
              <Textarea
                className="mt-2 min-h-36 resize-none"
                id="scoutloop-pitch"
                onChange={(event) => setPitchText(event.target.value)}
                placeholder="Paste the startup pitch, hackathon submission, or project notes."
                value={pitchText}
              />
            </label>

            <div className="mt-4 rounded-lg border border-dashed bg-muted/30 p-3">
              <label
                className="flex cursor-pointer items-center justify-between gap-3"
                htmlFor="scoutloop-upload"
              >
                <span>
                  <span className="flex items-center gap-2 font-medium text-sm">
                    <Upload className="size-4" />
                    Upload text files
                  </span>
                  <span className="mt-1 block text-muted-foreground text-xs">
                    .txt, .md, .csv, .json up to 100 KB
                  </span>
                </span>
                <Input
                  accept={acceptedExtensions.join(",")}
                  className="hidden"
                  id="scoutloop-upload"
                  multiple
                  onChange={(event) => handleFiles(event.target.files)}
                  type="file"
                />
                <Badge variant="outline">Browse</Badge>
              </label>
              {fileError ? (
                <p className="mt-2 text-destructive text-xs">{fileError}</p>
              ) : null}
              {uploadedTexts.length ? (
                <div className="mt-3 space-y-2">
                  {uploadedTexts.map((file) => (
                    <div
                      className="flex items-center justify-between rounded-md bg-background px-2 py-1 text-xs"
                      key={`${file.fileName}-${file.sizeBytes}`}
                    >
                      <span className="flex items-center gap-2 truncate">
                        <FileText className="size-3 text-muted-foreground" />
                        {file.fileName}
                      </span>
                      <span className="text-muted-foreground">
                        {Math.max(1, Math.round(file.sizeBytes / 1000))} KB
                      </span>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>

            <Button
              className="mt-4 w-full"
              disabled={
                status === "running" ||
                !(url || pitchText || uploadedTexts.length)
              }
              onClick={() => startEvaluation(false)}
              type="button"
            >
              {status === "running" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
              Start evaluation
            </Button>
          </section>

          <WorkflowTimeline events={timeline} />
        </aside>

        <section className="space-y-4">
          {error ? (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm">
              <AlertTriangle className="mt-0.5 size-4 text-destructive" />
              <span>{error}</span>
            </div>
          ) : null}

          {evaluation ? (
            <>
              <EvaluationDashboard evaluation={evaluation} />
              <FeedbackPanel
                customFeedback={customFeedback}
                evaluation={evaluation}
                onCustomFeedbackChange={setCustomFeedback}
                onRerun={() => startEvaluation(true)}
                onSubmitFeedback={submitFeedback}
                onToggleFeedback={(feedback) =>
                  setSelectedFeedback((current) =>
                    current.includes(feedback)
                      ? current.filter((item) => item !== feedback)
                      : [...current, feedback]
                  )
                }
                selectedFeedback={selectedFeedback}
                storedLesson={storedLesson}
              />
            </>
          ) : (
            <EmptyDashboard modeLabel={currentMode?.label ?? "Startup Judge"} />
          )}
        </section>
      </div>

      <footer className="mx-auto max-w-7xl px-4 pb-8 text-muted-foreground text-xs sm:px-6 lg:px-8">
        ScoutLoop provides evidence-backed evaluation support, not financial
        advice or final investment decisions.
      </footer>
    </main>
  );
}

function WorkflowTimeline({ events }: { events: WorkflowEvent[] }) {
  return (
    <section className="rounded-lg border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="flex items-center gap-2">
        <ShieldCheck className="size-4 text-muted-foreground" />
        <h2 className="font-medium text-base">Workflow progress</h2>
      </div>
      <div className="mt-4 space-y-3">
        {events.map((event) => (
          <div className="flex gap-3" key={event.id}>
            <span
              className={classNames(
                "mt-0.5 flex size-5 items-center justify-center rounded-full border",
                event.status === "complete" &&
                  "border-foreground bg-foreground text-background",
                event.status === "active" &&
                  "border-foreground bg-background text-foreground",
                event.status === "warning" &&
                  "border-destructive bg-destructive/10 text-destructive",
                event.status === "pending" &&
                  "border-border bg-muted text-muted-foreground"
              )}
            >
              {event.status === "complete" ? (
                <Check className="size-3" />
              ) : event.status === "active" ? (
                <Loader2 className="size-3 animate-spin" />
              ) : event.status === "warning" ? (
                <AlertTriangle className="size-3" />
              ) : (
                <span className="size-1.5 rounded-full bg-current" />
              )}
            </span>
            <div>
              <p className="font-medium text-sm">{event.label}</p>
              {event.detail ? (
                <p className="text-muted-foreground text-xs">{event.detail}</p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EmptyDashboard({ modeLabel }: { modeLabel: string }) {
  return (
    <div className="rounded-lg border bg-card p-8 text-center shadow-[var(--shadow-card)]">
      <Gauge className="mx-auto size-10 text-muted-foreground" />
      <h2 className="mt-4 font-medium text-xl">Ready for {modeLabel}</h2>
      <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
        Enter a URL, paste a pitch, or upload a text submission. ScoutLoop will
        return scorecards, market hypotheses, risks, evidence cards, and founder
        questions.
      </p>
    </div>
  );
}

function EvaluationDashboard({
  evaluation,
}: {
  evaluation: ScoutLoopEvaluation;
}) {
  return (
    <div className="space-y-4">
      <section className="grid gap-4 lg:grid-cols-[220px_1fr]">
        <div className="rounded-lg border bg-card p-4 shadow-[var(--shadow-card)]">
          <p className="text-muted-foreground text-sm">Overall score</p>
          <div className="mt-3 flex items-end gap-2">
            <span className="font-semibold text-5xl tracking-normal">
              {evaluation.overallScore.toFixed(1)}
            </span>
            <span className="pb-1 text-muted-foreground">/ 10</span>
          </div>
          <Badge className="mt-4" variant="outline">
            Confidence: {evaluation.overallConfidence}
          </Badge>
        </div>
        <div className="rounded-lg border bg-card p-4 shadow-[var(--shadow-card)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-muted-foreground text-sm">
                Evaluation summary
              </p>
              <h2 className="font-medium text-xl">
                {evaluation.startupName ?? "Untitled evaluation"}
              </h2>
            </div>
            <Badge variant="secondary">
              {evaluation.mode === "startup_judge"
                ? "Startup Judge"
                : "Hackathon Judge"}
            </Badge>
          </div>
          <div className="mt-3 text-sm">
            <MessageResponse>{evaluation.summary}</MessageResponse>
          </div>
        </div>
      </section>

      {evaluation.warnings.length ? (
        <section className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2 font-medium text-sm">
            <AlertTriangle className="size-4" />
            Warnings
          </div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
            {evaluation.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-2">
        <InsightPanel title="Problem and customer">
          <p>{evaluation.problem}</p>
          <p className="mt-3 text-muted-foreground">
            {evaluation.targetCustomer}
          </p>
        </InsightPanel>
        <InsightPanel title="TAM / SAM / SOM hypothesis">
          <p>
            <strong>TAM:</strong> {evaluation.marketSizing.tamHypothesis}
          </p>
          <p>
            <strong>SAM:</strong> {evaluation.marketSizing.samHypothesis}
          </p>
          <p>
            <strong>SOM:</strong> {evaluation.marketSizing.somHypothesis}
          </p>
          <Badge className="mt-3" variant="outline">
            Confidence: {evaluation.marketSizing.confidence}
          </Badge>
        </InsightPanel>
        <InsightPanel title="Competitors">
          <div className="grid gap-2">
            {evaluation.competitors.map((competitor) => (
              <div
                className="rounded-md border bg-background p-3"
                key={competitor.name}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{competitor.name}</p>
                  <Badge variant="outline">{competitor.type}</Badge>
                </div>
                <p className="mt-1 text-muted-foreground">
                  {competitor.description}
                </p>
              </div>
            ))}
          </div>
        </InsightPanel>
        <InsightPanel title="Differentiation / moat">
          <BulletList
            items={[...evaluation.differentiation, ...evaluation.moat]}
          />
        </InsightPanel>
        <InsightPanel title="Business model / distribution">
          <p>{evaluation.businessModel}</p>
          <p className="mt-3 text-muted-foreground">
            {evaluation.distribution}
          </p>
        </InsightPanel>
        <InsightPanel title="Traction signals">
          <BulletList items={evaluation.tractionSignals} />
        </InsightPanel>
      </section>

      <section className="rounded-lg border bg-card p-4 shadow-[var(--shadow-card)]">
        <h2 className="font-medium text-base">Scorecard</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {evaluation.scorecard.map((item) => (
            <div
              className="rounded-md border bg-background p-3"
              key={item.category}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-sm">{item.category}</p>
                <Badge variant="secondary">{item.score.toFixed(1)} / 10</Badge>
              </div>
              <p className="mt-2 text-muted-foreground text-sm">
                {item.explanation}
              </p>
              <Badge className="mt-3" variant="outline">
                {item.confidence}
              </Badge>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <InsightPanel title="Risks">
          <div className="space-y-2">
            {evaluation.risks.map((risk) => (
              <div
                className="rounded-md border bg-background p-3"
                key={risk.risk}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{risk.risk}</p>
                  <Badge variant="outline">{risk.severity}</Badge>
                </div>
                {risk.mitigation ? (
                  <p className="mt-1 text-muted-foreground">
                    {risk.mitigation}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        </InsightPanel>
        <InsightPanel title="Founder / judge questions">
          <div className="space-y-2">
            {evaluation.founderQuestions.map((question) => (
              <div
                className="rounded-md border bg-background p-3"
                key={question.question}
              >
                <div className="flex items-center gap-2">
                  <ArrowRight className="size-4 text-muted-foreground" />
                  <p className="font-medium">{question.question}</p>
                </div>
                <p className="mt-2 text-muted-foreground">{question.whyAsk}</p>
                <div className="mt-3 flex gap-2">
                  <Badge variant="outline">{question.category}</Badge>
                  <Badge variant="secondary">{question.severity}</Badge>
                </div>
              </div>
            ))}
          </div>
        </InsightPanel>
      </section>

      <section className="rounded-lg border bg-card p-4 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2">
          <Search className="size-4 text-muted-foreground" />
          <h2 className="font-medium text-base">Evidence cards</h2>
        </div>
        <div className="mt-3 grid gap-2 md:grid-cols-2">
          {evaluation.evidenceCards.map((card) => (
            <div className="rounded-md border bg-background p-3" key={card.id}>
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium text-sm">{card.title}</p>
                <Badge variant="outline">{card.confidence}</Badge>
              </div>
              <p className="mt-2 text-muted-foreground text-sm">
                {card.snippet}
              </p>
              {card.url ? (
                <p className="mt-2 truncate text-muted-foreground text-xs">
                  {card.url}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function InsightPanel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border bg-card p-4 text-sm shadow-[var(--shadow-card)]">
      <h2 className="mb-3 font-medium text-base">{title}</h2>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function FeedbackPanel({
  evaluation,
  selectedFeedback,
  customFeedback,
  storedLesson,
  onToggleFeedback,
  onCustomFeedbackChange,
  onSubmitFeedback,
  onRerun,
}: {
  evaluation: ScoutLoopEvaluation;
  selectedFeedback: string[];
  customFeedback: string;
  storedLesson: string;
  onToggleFeedback: (feedback: string) => void;
  onCustomFeedbackChange: (value: string) => void;
  onSubmitFeedback: () => void;
  onRerun: () => void;
}) {
  return (
    <section className="rounded-lg border bg-card p-4 shadow-[var(--shadow-card)]">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h2 className="font-medium text-base">Teach ScoutLoop</h2>
          <p className="text-muted-foreground text-sm">
            Convert evaluator feedback into reusable Mubit lessons.
          </p>
        </div>
        <Badge variant="outline">Run {evaluation.id.slice(0, 8)}</Badge>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {quickFeedbackOptions.map((option) => (
          <Button
            key={option}
            onClick={() => onToggleFeedback(option)}
            size="sm"
            type="button"
            variant={selectedFeedback.includes(option) ? "default" : "outline"}
          >
            {option}
          </Button>
        ))}
      </div>

      <Textarea
        className="mt-4 min-h-24 resize-none"
        onChange={(event) => onCustomFeedbackChange(event.target.value)}
        placeholder="The questions are too generic. Focus more on technical defensibility, distribution, and data advantage."
        value={customFeedback}
      />

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button onClick={onSubmitFeedback} type="button">
          <Sparkles className="size-4" />
          Teach ScoutLoop
        </Button>
        <Button onClick={onRerun} type="button" variant="outline">
          <RefreshCcw className="size-4" />
          Re-run with learned context
        </Button>
      </div>

      {storedLesson ? (
        <div className="mt-4 rounded-lg border bg-background p-3">
          <p className="font-medium text-sm">New lesson stored</p>
          <p className="mt-1 text-muted-foreground text-sm">{storedLesson}</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {sharperQuestionExamples.map((question) => (
              <div className="rounded-md bg-muted p-2 text-sm" key={question}>
                {question}
              </div>
            ))}
          </div>
        </div>
      ) : evaluation.lessonsApplied.length ? (
        <div className="mt-4 rounded-lg border bg-background p-3">
          <p className="font-medium text-sm">Lessons applied</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground text-sm">
            {evaluation.lessonsApplied.map((lesson) => (
              <li key={lesson.id}>{lesson.lesson}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

"use client";

import { Flame, LayoutDashboard } from "lucide-react";

export type ReportMode = "roast" | "clean";

export function ReportModeToggle({
  mode,
  onChange,
}: {
  mode: ReportMode;
  onChange: (mode: ReportMode) => void;
}) {
  return (
    <div className="inline-flex rounded-lg border bg-muted p-1 text-sm">
      <button
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all ${
          mode === "roast"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={() => onChange("roast")}
        type="button"
      >
        <Flame className="size-3.5" />
        Roast Report
      </button>
      <button
        className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 transition-all ${
          mode === "clean"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground"
        }`}
        onClick={() => onChange("clean")}
        type="button"
      >
        <LayoutDashboard className="size-3.5" />
        Clean Report
      </button>
    </div>
  );
}

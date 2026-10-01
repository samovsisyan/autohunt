import { Check, MapPin } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatDate } from "@/i18n/format";
import { cn } from "@/lib/cn";

export interface TimelineEvent {
  stage: keyof Dictionary["enums"]["stage"];
  status: "DONE" | "CURRENT" | "PENDING";
  date: Date | null;
  location: string | null;
  note: string | null;
}

/** Package-tracking style timeline, purpose-built for vehicles. */
export function ImportTimeline({ events, locale, t, orientation = "vertical" }: { events: TimelineEvent[]; locale: Locale; t: Dictionary; orientation?: "vertical" | "horizontal" }) {
  if (orientation === "horizontal") {
    const currentIdx = Math.max(0, events.findIndex((e) => e.status === "CURRENT"));
    const doneCount = events.filter((e) => e.status === "DONE").length;
    const progress = events.every((e) => e.status === "DONE") ? 100 : ((Math.max(doneCount, currentIdx) + 0.5) / events.length) * 100;
    return (
      <div>
        <div className="relative h-1.5 overflow-hidden rounded-full bg-fg/5">
          <div className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-positive to-accent transition-[width] duration-1000" style={{ width: `${progress}%` }} />
        </div>
        <ol className="mt-3 grid text-[10px] text-subtle" style={{ gridTemplateColumns: `repeat(${events.length}, minmax(0, 1fr))` }}>
          {events.map((e) => (
            <li key={e.stage} className={cn("truncate pr-1 text-center first:text-left last:text-right", e.status === "CURRENT" && "font-medium text-accent", e.status === "DONE" && "text-muted")}>
              <span className="hidden sm:inline">{t.enums.stage[e.stage]}</span>
              <span className="sm:hidden" aria-hidden>
                {e.status === "DONE" ? "✓" : e.status === "CURRENT" ? "●" : "○"}
              </span>
            </li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <ol className="relative">
      {events.map((e, i) => {
        const last = i === events.length - 1;
        return (
          <li key={e.stage} className="relative flex gap-5 pb-8 last:pb-0">
            {!last && (
              <span
                className={cn("absolute top-9 bottom-1 left-[1.05rem] w-px", e.status === "DONE" ? "bg-gradient-to-b from-positive/70 to-positive/30" : "bg-line-strong [mask-image:linear-gradient(to_bottom,black_50%,transparent)]")}
                aria-hidden
              />
            )}
            <span
              className={cn(
                "relative z-10 grid size-[2.1rem] shrink-0 place-items-center rounded-full border transition-all duration-500",
                e.status === "DONE" && "border-positive/40 bg-positive-soft text-positive",
                e.status === "CURRENT" && "animate-pulse-ring border-accent bg-accent text-bg",
                e.status === "PENDING" && "border-line-strong bg-surface text-subtle",
              )}
            >
              {e.status === "DONE" ? <Check className="size-4" /> : e.status === "CURRENT" ? <span className="size-2 rounded-full bg-bg" /> : <span className="size-1.5 rounded-full bg-current" />}
            </span>
            <div className={cn("min-w-0 flex-1 pt-1", e.status === "PENDING" && "opacity-55")}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className={cn("font-medium", e.status === "CURRENT" && "text-accent")}>{t.enums.stage[e.stage]}</p>
                {e.date && <time className="text-xs text-subtle tabular">{formatDate(e.date, locale, { day: "numeric", month: "short", year: "numeric" })}</time>}
              </div>
              {e.location && (
                <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-muted">
                  <MapPin className="size-3.5 shrink-0" /> {e.location}
                </p>
              )}
              {e.note && <p className={cn("mt-2 rounded-xl px-3 py-2 text-sm", e.status === "CURRENT" ? "border border-accent/20 bg-accent-soft text-fg" : "bg-fg/[0.03] text-muted")}>{e.note}</p>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

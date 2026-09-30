import type { Dictionary } from "@/i18n/dictionaries";
import type { EstimateLine, LineKey } from "@/server/calculator/engine";
import { cn } from "@/lib/cn";

/** Color per cost group: the car itself vs. logistics vs. state charges vs. our fee. */
export const lineColors: Record<LineKey, string> = {
  carPrice: "#e8ebef",
  auctionFees: "#5fd4f4",
  inlandTransport: "#3fb3d9",
  shipping: "#2a8fbf",
  customs: "#f5b84a",
  documentation: "#a78bfa",
  registration: "#8b7cf6",
  service: "#3ddc97",
};

export function CostBreakdown({
  lines,
  total,
  t,
  format,
  className,
  showStack = true,
  compact = false,
}: {
  lines: EstimateLine[];
  total: number;
  t: Dictionary["calculator"];
  format: (n: number) => string;
  className?: string;
  showStack?: boolean;
  compact?: boolean;
}) {
  const max = Math.max(...lines.map((l) => l.amount), 1);
  return (
    <div className={className}>
      {showStack && (
        <div className="mb-6 flex h-2.5 w-full overflow-hidden rounded-full bg-white/5" role="img" aria-label={t.breakdownTitle}>
          {lines.map((l) => (
            <span
              key={l.key}
              className="h-full transition-[width] duration-700 ease-out first:rounded-l-full last:rounded-r-full"
              style={{ width: `${(l.amount / Math.max(total, 1)) * 100}%`, background: lineColors[l.key] }}
            />
          ))}
        </div>
      )}
      <ul className={cn("divide-y divide-line", compact && "text-sm")}>
        {lines.map((l, i) => (
          <li key={l.key} className={cn("group", compact ? "py-2.5" : "py-3")}>
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-2.5 text-muted">
                <span className="size-2 shrink-0 rounded-full" style={{ background: lineColors[l.key] }} aria-hidden />
                {i > 0 && <span className="text-subtle" aria-hidden>+</span>}
                {t.lines[l.key]}
              </span>
              <span className="tabular font-medium text-fg">{format(l.amount)}</span>
            </div>
            {!compact && (
              <div className="mt-2 ml-4.5 h-1 overflow-hidden rounded-full bg-white/[0.04]">
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{ width: `${(l.amount / max) * 100}%`, background: lineColors[l.key], opacity: 0.55 }}
                />
              </div>
            )}
            {l.detail && l.detail.length > 0 && !compact && (
              <ul className="mt-2 ml-4.5 flex flex-wrap gap-x-4 gap-y-1 text-xs text-subtle">
                {l.detail.map((d) => (
                  <li key={d.key} className="tabular">
                    {t.customsDetail[d.key as keyof Dictionary["calculator"]["customsDetail"]] ?? d.key}: {format(d.amount)}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-2 flex items-center justify-between border-t-2 border-dashed border-line-strong pt-4">
        <span className="font-medium">{t.total}</span>
        <span className="tabular font-display text-xl font-semibold text-positive">{format(total)}</span>
      </div>
    </div>
  );
}

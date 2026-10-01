"use client";

import { Heart, GitCompareArrows } from "lucide-react";
import { compareStore, favoritesStore } from "@/lib/saved-store";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";

export function FavoriteButton({
  id,
  labels,
  className,
  withText,
}: {
  id: string;
  labels: { save: string; saved: string };
  className?: string;
  withText?: boolean;
}) {
  const list = favoritesStore.use();
  const active = list.includes(id);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        favoritesStore.toggle(id);
      }}
      aria-pressed={active}
      aria-label={active ? labels.saved : labels.save}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full transition-all active:scale-90",
        withText
          ? "h-11 border border-line-strong px-4 text-sm hover:bg-fg/5"
          : "size-9 bg-black/45 backdrop-blur-md hover:bg-black/65",
        className,
      )}
    >
      <Heart className={cn("size-4 transition-colors", active ? "fill-danger text-danger" : withText ? "text-fg" : "text-white")} />
      {withText && (active ? labels.saved : labels.save)}
    </button>
  );
}

export function CompareToggle({
  id,
  labels,
  className,
}: {
  id: string;
  labels: { compare: string; limit: string };
  className?: string;
}) {
  const list = compareStore.use();
  const active = list.includes(id);
  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 text-xs transition-colors select-none",
        active ? "text-accent" : "text-subtle hover:text-muted",
        className,
      )}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={active}
        onChange={() => {
          if (!compareStore.toggle(id)) toast(labels.limit, "info");
        }}
      />
      <span
        className={cn(
          "grid size-4 place-items-center rounded border transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-accent",
          active ? "border-accent bg-accent text-bg" : "border-line-strong",
        )}
        aria-hidden
      >
        {active && <GitCompareArrows className="size-2.5" />}
      </span>
      {labels.compare}
    </label>
  );
}

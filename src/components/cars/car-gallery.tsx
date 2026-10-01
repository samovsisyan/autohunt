"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

export function CarGallery({ images, title, photosLabel }: { images: { url: string; alt: string | null }[]; title: string; photosLabel: string }) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  const count = images.length;

  const go = useCallback(
    (i: number) => {
      const next = (i + count) % count;
      setIndex(next);
      const el = track.current;
      if (el) el.scrollTo({ left: next * el.clientWidth, behavior: "smooth" });
    },
    [count],
  );

  // Sync index when the user swipes the scroll-snap track (mobile).
  const onScroll = () => {
    const el = track.current;
    if (!el) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    if (i !== index) setIndex(i);
  };

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % count);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + count) % count);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, count]);

  if (!count) return <div className="aspect-[16/10] rounded-3xl border border-line bg-elevated" />;

  return (
    <div>
      <div className="group relative overflow-hidden rounded-3xl border border-line bg-elevated">
        <div ref={track} onScroll={onScroll} className="no-scrollbar flex aspect-[16/10] snap-x snap-mandatory overflow-x-auto">
          {images.map((img, i) => (
            <button key={img.url + i} type="button" onClick={() => setLightbox(true)} className="relative h-full w-full shrink-0 snap-center cursor-zoom-in" aria-label={`${title} — ${i + 1}/${count}`}>
              <Image src={img.url} alt={img.alt ?? title} fill priority={i === 0} sizes="(min-width: 1024px) 60vw, 100vw" className="object-cover" />
            </button>
          ))}
        </div>
        {count > 1 && (
          <>
            <button onClick={() => go(index - 1)} className="glass absolute top-1/2 left-3 hidden size-10 -translate-y-1/2 place-items-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 sm:grid" aria-label="Previous photo">
              <ChevronLeft className="size-5" />
            </button>
            <button onClick={() => go(index + 1)} className="glass absolute top-1/2 right-3 hidden size-10 -translate-y-1/2 place-items-center rounded-full opacity-0 transition-opacity group-hover:opacity-100 sm:grid" aria-label="Next photo">
              <ChevronRight className="size-5" />
            </button>
          </>
        )}
        <div className="pointer-events-none absolute right-3 bottom-3 flex items-center gap-2">
          <span className="glass rounded-full px-3 py-1 text-xs tabular">
            {index + 1} / {count}
          </span>
          <span className="glass grid size-8 place-items-center rounded-full">
            <Expand className="size-3.5" />
          </span>
        </div>
      </div>

      {count > 1 && (
        <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto" role="tablist" aria-label={photosLabel}>
          {images.map((img, i) => (
            <button
              key={img.url + i}
              role="tab"
              aria-selected={i === index}
              onClick={() => go(i)}
              className={cn("relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all", i === index ? "border-accent" : "border-transparent opacity-60 hover:opacity-100")}
            >
              <Image src={img.url} alt="" fill sizes="96px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightbox &&
        createPortal(
          <div className="fixed inset-0 z-[90] flex animate-fade-in items-center justify-center bg-black/95" data-theme="dark" role="dialog" aria-modal="true" aria-label={title}>
            <button onClick={() => setLightbox(false)} className="absolute top-4 right-4 z-10 grid size-11 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Close">
              <X className="size-5" />
            </button>
            <div className="relative h-[80dvh] w-full max-w-6xl">
              <Image src={images[index].url} alt={images[index].alt ?? title} fill sizes="100vw" className="object-contain" />
            </div>
            {count > 1 && (
              <>
                <button onClick={() => setIndex((i) => (i - 1 + count) % count)} className="absolute left-4 grid size-12 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Previous photo">
                  <ChevronLeft className="size-6" />
                </button>
                <button onClick={() => setIndex((i) => (i + 1) % count)} className="absolute right-4 grid size-12 place-items-center rounded-full bg-white/10 hover:bg-white/20" aria-label="Next photo">
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
            <p className="absolute bottom-6 text-sm text-muted tabular">
              {index + 1} / {count}
            </p>
          </div>,
          document.body,
        )}
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";

/** Smoothly tweens between numeric values (used for calculator totals). */
export function AnimatedNumber({
  value,
  format,
  duration = 600,
  className,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const from = useRef(value);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const origin = from.current;
    if (origin === value) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tick = (now: number) => {
      const p = reduce ? 1 : Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const current = origin + (value - origin) * eased;
      setDisplay(current);
      from.current = current;
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [value, duration]);

  return <span className={className}>{format(display)}</span>;
}

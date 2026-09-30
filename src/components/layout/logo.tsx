import { cn } from "@/lib/cn";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-8", className)} aria-hidden>
      <defs>
        <linearGradient id="ah-g" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#8BE6FF" />
          <stop offset="1" stopColor="#3DDC97" />
        </linearGradient>
      </defs>
      <rect x="0.5" y="0.5" width="31" height="31" rx="9" fill="#0d0f12" stroke="url(#ah-g)" strokeOpacity="0.7" />
      <path d="M9 23 L16 8 L23 23" fill="none" stroke="#F5F6F7" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11.8 17.5 H20.2" stroke="url(#ah-g)" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      <span className="font-display text-[1.15rem] font-semibold tracking-tight">
        Auto<span className="text-accent">Hunt</span>
      </span>
    </span>
  );
}

import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line">
      <table className={cn("w-full min-w-[640px] text-left text-sm", className)} {...props} />
    </div>
  );
}
export function THead(props: ComponentProps<"thead">) {
  return <thead className="border-b border-line bg-white/[0.02] text-xs tracking-wide text-subtle uppercase" {...props} />;
}
export function Th({ className, ...props }: ComponentProps<"th">) {
  return <th className={cn("px-4 py-3 font-medium", className)} {...props} />;
}
export function Td({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-4 py-3.5 align-middle", className)} {...props} />;
}
export function Tr({ className, ...props }: ComponentProps<"tr">) {
  return <tr className={cn("border-b border-line last:border-0 hover:bg-white/[0.02]", className)} {...props} />;
}

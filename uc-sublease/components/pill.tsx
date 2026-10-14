import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground/80",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Freshness({ label, tone }: { label: string; tone: "good" | "ok" | "stale" }) {
  const dot = { good: "bg-emerald-500", ok: "bg-amber-500", stale: "bg-neutral-400" }[tone];
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
      <span className={cn("size-1.5 rounded-full", dot)} aria-hidden />
      {label}
    </span>
  );
}

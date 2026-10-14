"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

// Best fits first by default; "Show all" also reveals poor roommate fits. Without preferences it offers to set them.
export function FitToggle({ hidden, className }: { hidden: number; className?: string }) {
  const { prefs, showAll, setShowAll } = useStore();

  if (!prefs) {
    return (
      <Link href="/preferences" className={cn("inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-brand", className)}>
        <Sparkles className="size-3.5" /> Rank by roommate fit
      </Link>
    );
  }
  return (
    <button
      type="button"
      aria-pressed={showAll}
      onClick={() => setShowAll(!showAll)}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
        showAll ? "border-border bg-card text-muted-foreground" : "border-primary/30 bg-primary/10 text-brand",
        className,
      )}
    >
      <Sparkles className="size-3.5" />
      {showAll ? "Showing all" : hidden > 0 ? `Best fits first · ${hidden} hidden` : "Best fits first"}
      <span className="text-muted-foreground">·</span>
      <span className="underline underline-offset-2">{showAll ? "Best fits only" : "Show all"}</span>
    </button>
  );
}

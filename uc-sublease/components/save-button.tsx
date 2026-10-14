"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import { useStore } from "@/lib/store";
import { cn, haptic } from "@/lib/utils";

export function SaveButton({ id, className }: { id: string; className?: string }) {
  const { shortlist, toggleSave } = useStore();
  const [pop, setPop] = useState(false);
  const saved = shortlist.includes(id);
  return (
    <button
      type="button"
      aria-label={saved ? "Remove from shortlist" : "Save to shortlist"}
      aria-pressed={saved}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSave(id);
        haptic();
        setPop(true);
        setTimeout(() => setPop(false), 400);
      }}
      className={cn(
        "grid size-9 place-items-center rounded-full bg-white/90 text-neutral-900 shadow-sm backdrop-blur transition-transform active:scale-90",
        className,
      )}
    >
      <Bookmark className={cn("size-[18px]", saved && "fill-primary text-primary", pop && "animate-[pop_0.4s_ease-out]")} />
    </button>
  );
}

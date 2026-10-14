import { matchTone } from "@/lib/roommates";
import { cn } from "@/lib/utils";

export function MatchBadge({ score, className }: { score: number; className?: string }) {
  const tone = matchTone(score);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "great" && "bg-emerald-500 text-white",
        tone === "good" && "bg-amber-400 text-amber-950",
        tone === "low" && "bg-neutral-500 text-white",
        className,
      )}
    >
      {score}% match
    </span>
  );
}

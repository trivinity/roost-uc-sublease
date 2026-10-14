import { BAND_STYLE, distanceBand, fmtMiles } from "@/lib/format";
import { cn } from "@/lib/utils";

// Area name plus distance from UC, colored by how far it is (walkable, short ride, bus or bike, car).
export function AreaPill({ area, miles, className }: { area: string; miles: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", BAND_STYLE[distanceBand(miles)], className)}>
      {fmtMiles(miles)} <span className="opacity-60">·</span> {area}
    </span>
  );
}

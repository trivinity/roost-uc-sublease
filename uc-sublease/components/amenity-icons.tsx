"use client";

import { useState } from "react";
import { Bike, ChefHat, CircleParking, Dumbbell, MoveVertical, PawPrint, ShieldCheck, Snowflake, Sunrise, TreePine, Utensils, WashingMachine, Wifi, Zap, BedDouble, type LucideIcon } from "lucide-react";
import { AMENITY_LABEL } from "@/lib/amenities";
import type { AmenityId } from "@/lib/types";
import { cn } from "@/lib/utils";

export const AMENITY_ICONS: Record<AmenityId, LucideIcon> = {
  laundry: WashingMachine,
  wifi: Wifi,
  bed: BedDouble,
  parking: CircleParking,
  utilities: Zap,
  elevator: MoveVertical,
  security: ShieldCheck,
  gym: Dumbbell,
  dishwasher: Utensils,
  ac: Snowflake,
  bike: Bike,
  rooftop: Sunrise,
  outdoor: TreePine,
  pets: PawPrint,
  kitchen: ChefHat,
};

// Amenities as small round icons. The name shows on hover or keyboard focus, and on tap for phones.
// Inside a link (like a list row) pass interactive={false} so tapping still opens the listing.
export function AmenityIcons({ ids, max, size = "md", interactive = true, className }: { ids: AmenityId[]; max?: number; size?: "sm" | "md"; interactive?: boolean; className?: string }) {
  const [open, setOpen] = useState<AmenityId | null>(null);
  const shown = max ? ids.slice(0, max) : ids;
  const extra = max ? ids.length - shown.length : 0;
  const box = size === "sm" ? "size-8" : "size-10";
  const icon = size === "sm" ? "size-4" : "size-[18px]";

  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)} aria-label="Amenities">
      {shown.map((id) => {
        const Icon = AMENITY_ICONS[id];
        const label = AMENITY_LABEL[id];
        const tip = (
          <span
            role="tooltip"
            className={cn(
              "pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-xs font-medium text-background shadow-lg transition-opacity duration-150",
              open === id ? "opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-within:opacity-100",
            )}
          >
            {label}
          </span>
        );
        const face = cn("grid place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors", box);
        return (
          <li key={id} className="group relative">
            {interactive ? (
              <button
                type="button"
                aria-label={label}
                onClick={() => setOpen(open === id ? null : id)}
                onBlur={() => setOpen((o) => (o === id ? null : o))}
                className={cn(face, "hover:border-primary/40 hover:text-brand focus-visible:text-brand")}
              >
                <Icon className={icon} />
              </button>
            ) : (
              <span role="img" aria-label={label} className={face}>
                <Icon className={icon} />
              </span>
            )}
            {tip}
          </li>
        );
      })}
      {extra > 0 && <li className={cn("grid place-items-center rounded-full bg-muted text-xs font-medium text-muted-foreground", box)}>+{extra}</li>}
    </ul>
  );
}

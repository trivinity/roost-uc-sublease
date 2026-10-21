"use client";

import { useState } from "react";
import { Tooltip } from "@base-ui/react/tooltip";
import { Bike, ChefHat, CircleParking, Dumbbell, MoveVertical, PawPrint, ShieldCheck, Snowflake, Sofa, Sunrise, TreePine, Utensils, WashingMachine, Wifi, Zap, BedDouble, type LucideIcon } from "lucide-react";
import { AMENITY_LABEL, FURNISHED_LABEL } from "@/lib/amenities";
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

interface Entry {
  key: string;
  label: string;
  Icon: LucideIcon;
}

// Furnished is shown as the first icon, so the "furnished bedroom" amenity would only repeat it.
function entries(ids: AmenityId[], furnished: boolean): Entry[] {
  const list: Entry[] = ids.filter((id) => !(furnished && id === "bed")).map((id) => ({ key: id, label: AMENITY_LABEL[id], Icon: AMENITY_ICONS[id] }));
  return furnished ? [{ key: "furnished", label: FURNISHED_LABEL, Icon: Sofa }, ...list] : list;
}

// Amenities (and "furnished") as small round icons, no words. The name appears on hover, keyboard focus, or tap.
// The tooltip is portaled and repositions itself, so it never gets cut off at the edge of a card or panel.
// Inside a link (like a list row) pass interactive={false} so tapping still opens the listing.
export function AmenityIcons({
  ids,
  furnished = false,
  max,
  size = "md",
  interactive = true,
  className,
}: {
  ids: AmenityId[];
  furnished?: boolean;
  max?: number;
  size?: "sm" | "md";
  interactive?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState<string | null>(null);
  const all = entries(ids, furnished);
  const shown = max ? all.slice(0, max) : all;
  const extra = max ? all.length - shown.length : 0;
  const box = size === "sm" ? "size-8" : "size-10";
  const icon = size === "sm" ? "size-4" : "size-[18px]";
  const face = cn("grid place-items-center rounded-full border border-border bg-card text-muted-foreground transition-colors", box);

  return (
    <Tooltip.Provider delay={80} closeDelay={0}>
      <ul className={cn("flex flex-wrap items-center gap-2", className)} aria-label="Amenities">
        {shown.map(({ key, label, Icon }) => (
          <li key={key}>
            <Tooltip.Root open={open === key} onOpenChange={(o) => setOpen(o ? key : null)} disableHoverablePopup>
              <Tooltip.Trigger
                render={
                  interactive ? (
                    <button
                      type="button"
                      aria-label={label}
                      onClick={() => setOpen(open === key ? null : key)}
                      className={cn(face, "hover:border-primary/40 hover:text-brand focus-visible:text-brand")}
                    />
                  ) : (
                    <span role="img" aria-label={label} className={cn(face, "hover:border-primary/40 hover:text-brand")} />
                  )
                }
              >
                <Icon className={icon} />
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Positioner side="top" sideOffset={8} collisionPadding={8} className="z-[70]">
                  <Tooltip.Popup className="pointer-events-none whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-xs font-medium text-background shadow-lg transition-opacity duration-150 data-[starting-style]:opacity-0 data-[ending-style]:opacity-0">
                    {label}
                  </Tooltip.Popup>
                </Tooltip.Positioner>
              </Tooltip.Portal>
            </Tooltip.Root>
          </li>
        ))}
        {extra > 0 && <li className={cn("grid place-items-center rounded-full bg-muted text-xs font-medium text-muted-foreground", box)}>+{extra}</li>}
      </ul>
    </Tooltip.Provider>
  );
}

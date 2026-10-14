import { Bus, TramFront } from "lucide-react";
import { walkMinutes } from "@/lib/geo";
import { BUS_STOPS, NEARBY_MAX_MILES, nearestStop, SHUTTLE_STOPS, type NearestStop } from "@/lib/transit";
import type { Listing } from "@/lib/types";

function Row({ icon: Icon, kind, near }: { icon: typeof Bus; kind: string; near: NearestStop | null }) {
  return (
    <div className="flex items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground">
        <Icon className="size-[18px]" />
      </span>
      <div className="min-w-0 text-sm">
        <p className="text-xs text-muted-foreground">{kind}</p>
        {near ? (
          <p className="font-medium">
            {near.stop.name}
            <span className="font-normal text-muted-foreground">
              {" "}
              · {near.miles.toFixed(1)} mi
              {near.miles <= NEARBY_MAX_MILES ? ` · ${walkMinutes(near.miles)} min walk` : ""}
            </span>
          </p>
        ) : (
          <p className="text-muted-foreground">No stop on file</p>
        )}
      </div>
    </div>
  );
}

// Nearest UC shuttle stop and Metro bus stop. The stop lists live in lib/transit.ts.
export function GettingAround({ listing }: { listing: Pick<Listing, "lat" | "lng"> }) {
  return (
    <div className="space-y-3 rounded-3xl border border-border bg-card p-4">
      <p className="text-sm font-semibold">Getting around</p>
      <Row icon={TramFront} kind="Nearest UC shuttle stop" near={nearestStop(SHUTTLE_STOPS, listing)} />
      <Row icon={Bus} kind="Nearest Metro bus stop" near={nearestStop(BUS_STOPS, listing)} />
    </div>
  );
}

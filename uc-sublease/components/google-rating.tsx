"use client";

import { useEffect, useState } from "react";
import { fetchRating, type GoogleRating } from "@/lib/places";

// Live star rating for the property management company, straight from Google (never stored on our side).
// Google's terms: show "Google Maps" attribution and let people open the listing on Google Maps.
export function GoogleRatingCard({ placeId }: { placeId: string }) {
  const [state, setState] = useState<{
    id: string;
    data: GoogleRating | null;
  } | null>(null);

  useEffect(() => {
    let alive = true;
    fetchRating(placeId)
      .then((data) => alive && setState({ id: placeId, data }))
      .catch(() => alive && setState({ id: placeId, data: null }));
    return () => {
      alive = false;
    };
  }, [placeId]);

  const loading = state?.id !== placeId;
  const data = loading ? null : state?.data;
  const name = data?.name || "Property management company";

  return (
    <div className="flex flex-col gap-2 rounded-3xl border border-border bg-card p-4 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <div className="min-w-0">
        <p className="font-semibold">{name}</p>
        <p className="text-xs text-muted-foreground">
          Property management company
        </p>
      </div>
      {loading ? (
        <span
          className="h-5 w-28 animate-pulse rounded-full bg-muted"
          aria-label="Loading rating"
        />
      ) : data && data.rating != null ? (
        <div className="shrink-0 sm:text-right">
          <p className="font-medium">
            ★ {data.rating.toFixed(1)}{" "}
            <span className="font-normal text-muted-foreground">
              ({data.count.toLocaleString()} Google reviews)
            </span>
          </p>
          {data.url && (
            <a
              href={data.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-muted-foreground underline underline-offset-2"
            >
              Google Maps
            </a>
          )}
        </div>
      ) : (
        <div className="shrink-0 text-xs text-muted-foreground sm:text-right">
          <p>Rating unavailable</p>
          {data?.url && (
            <a
              href={data.url}
              target="_blank"
              rel="noreferrer"
              className="underline underline-offset-2"
            >
              Google Maps
            </a>
          )}
        </div>
      )}
    </div>
  );
}

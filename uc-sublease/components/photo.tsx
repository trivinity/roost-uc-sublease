"use client";

import { useState } from "react";
import Image from "next/image";
import type { Listing } from "@/lib/types";
import { cn } from "@/lib/utils";

// Listing photo that fills its box. Shows a soft shimmer until the image has loaded, then fades it in.
export function Photo({ listing, index = 0, className, priority, vtName, thumb }: { listing: Listing; index?: number; className?: string; priority?: boolean; vtName?: string; thumb?: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const src = (thumb ? listing.thumbs?.[index] : undefined) ?? listing.photos[index] ?? listing.photos[0];
  return (
    <div className={cn("relative overflow-hidden bg-muted", !loaded && "animate-pulse", className)} style={vtName ? { viewTransitionName: vtName } : undefined} data-vt={vtName}>
      <Image
        // cached images can finish loading before React attaches onLoad, so check .complete too
        ref={(el) => {
          if (el?.complete) setLoaded(true);
        }}
        src={src}
        alt={`${listing.title}, photo ${index + 1}`}
        fill
        sizes="(min-width: 768px) 448px, 100vw"
        priority={priority}
        // uploaded photos are already compressed in the browser, so they skip the image optimizer
        unoptimized={src.startsWith("http")}
        draggable={false}
        onLoad={() => setLoaded(true)}
        className={cn("select-none object-cover transition-opacity duration-500 dark:brightness-90", loaded ? "opacity-100" : "opacity-0")}
      />
    </div>
  );
}

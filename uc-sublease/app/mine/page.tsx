"use client";

import Link from "next/link";
import { CheckCircle2, Trash2 } from "lucide-react";
import { ListingRow } from "@/components/listing-row";
import { Button } from "@/components/ui/button";
import { freshness } from "@/lib/format";
import { useStore } from "@/lib/store";
import { COPY } from "@/lib/copy";

// Where a sublessor keeps their listing "fresh": re-confirming resets the freshness label buyers see.
export default function MyListingsPage() {
  const { listings, confirmListing, removeListing } = useStore();
  const mine = listings.filter((l) => l.sublessor.id === "me");

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-6 md:px-6">
      <div className="flex items-end justify-between pb-5">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">My listings</h1>
          <p className="text-sm text-muted-foreground">
            Keep them fresh so students know they&apos;re still available.
          </p>
        </div>
        <Button render={<Link href="/post" />} nativeButton={false}>
          New listing
        </Button>
      </div>

      {mine.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border py-16 text-center">
          <p className="font-medium">{COPY.empty.mine.title}</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            {COPY.empty.mine.body}
          </p>
          <Button render={<Link href="/post" />} nativeButton={false}>
            Post a listing
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {mine.map((l) => {
            const fresh = freshness(l.confirmedDaysAgo).tone === "good";
            return (
              <div key={l.id} className="space-y-2">
                <ListingRow listing={l} mine />
                <div className="flex gap-2 px-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => confirmListing(l.id)}
                    disabled={l.confirmedDaysAgo === 0}
                  >
                    <CheckCircle2 className="size-4" />{" "}
                    {fresh ? "Confirmed today" : "Still available"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground"
                    onClick={() => removeListing(l.id)}
                  >
                    <Trash2 className="size-4" /> Mark as rented
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

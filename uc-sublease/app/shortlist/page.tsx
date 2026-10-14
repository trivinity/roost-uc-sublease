"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { Credits } from "@/components/app-shell";
import { CompareTable } from "@/components/compare-table";
import { ListingRow } from "@/components/listing-row";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { COPY } from "@/lib/copy";

const MAX_COMPARE = 3;

export default function ShortlistPage() {
  const { shortlist, listings, getListing, showToast } = useStore();
  const [selected, setSelected] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);

  const saved = shortlist.flatMap((id) => getListing(id) ?? []);
  // ignore selections whose listing was un-saved since
  const chosen = saved.filter((l) => selected.includes(l.id));

  const toggle = (id: string) => {
    if (selected.includes(id))
      return setSelected(selected.filter((x) => x !== id));
    if (selected.length >= MAX_COMPARE)
      return showToast(COPY.toast.compareLimit(MAX_COMPARE));
    setSelected([...selected, id]);
  };

  if (comparing && chosen.length >= 2) {
    return (
      <div className="mx-auto w-full max-w-5xl px-4 pt-6 md:px-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setComparing(false)}
          className="-ml-3 mb-3"
        >
          <ArrowLeft className="size-4" /> Back to saved
        </Button>
        <h1 className="pb-5 text-2xl font-semibold tracking-tight">Compare</h1>
        <CompareTable listings={chosen} />
        <Credits />
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 pt-6 md:px-6">
      <div className="pb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Saved</h1>
        <p className="text-sm text-muted-foreground">
          {saved.length === 0
            ? "Places you save will show up here."
            : "Tick 2 or 3 places to compare them side by side."}
        </p>
      </div>

      {saved.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-dashed border-border py-16 text-center">
          <p className="font-medium">{COPY.empty.saved.title}</p>
          <p className="max-w-xs text-sm text-muted-foreground">{COPY.empty.saved.body}</p>
          <Button render={<Link href="/" />} nativeButton={false}>
            Start discovering
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {saved.map((l) => {
            const on = selected.includes(l.id);
            return (
              <div key={l.id} className="relative">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={on}
                  aria-label={`Compare ${l.title}`}
                  onClick={() => toggle(l.id)}
                  className={cn(
                    "absolute left-5 top-5 z-10 grid size-7 place-items-center rounded-full border-2 shadow-sm backdrop-blur transition-colors",
                    on
                      ? "border-primary bg-primary text-white"
                      : "border-white bg-black/20 hover:bg-black/35",
                  )}
                >
                  {on && <Check className="size-4" strokeWidth={3} />}
                </button>
                <ListingRow listing={l} mine={l.sublessor.id === "me"} />
              </div>
            );
          })}
        </div>
      )}

      {saved.length > 0 && (
        <section className="pt-10">
          <h2 className="pb-3 text-lg font-semibold">More to explore</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {listings
              .filter(
                (l) => !shortlist.includes(l.id) && l.sublessor.id !== "me",
              )
              .slice(0, 4)
              .map((l) => (
                <ListingRow key={l.id} listing={l} />
              ))}
          </div>
        </section>
      )}

      {chosen.length >= 2 && (
        <div className="sticky bottom-20 z-20 mt-6 flex justify-center md:bottom-6">
          <Button
            size="lg"
            className="shadow-lg"
            onClick={() => setComparing(true)}
          >
            Compare {chosen.length} places
          </Button>
        </div>
      )}
      <Credits />
    </div>
  );
}

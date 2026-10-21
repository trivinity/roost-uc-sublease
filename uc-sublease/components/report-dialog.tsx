"use client";

import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { Sheet } from "./sheet";
import { COPY } from "@/lib/copy";

const REASONS = [
  "Looks like a scam or fake listing",
  "No longer available",
  "Details don't match the listing",
  "Landlord doesn't allow subletting",
  "Something else",
];

export function ReportButton({ listingId }: { listingId: string }) {
  const { reported, report } = useStore();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const done = reported.includes(listingId);

  return (
    <>
      <Button variant="ghost" size="sm" disabled={done} onClick={() => setOpen(true)} className="text-muted-foreground">
        <Flag className="size-3.5" /> {done ? "Reported" : "Report listing"}
      </Button>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        title="Report this listing"
        footer={
          <Button
            size="lg"
            className="w-full"
            disabled={!reason}
            onClick={() => {
              void report(listingId, reason);
              setOpen(false);
              setReason("");
            }}
          >
            Submit report
          </Button>
        }
      >
        <fieldset className="space-y-1">
          <legend className="pb-2 text-sm text-muted-foreground">{COPY.report.prompt}</legend>
          {REASONS.map((r) => (
            <label key={r} className="flex cursor-pointer items-center gap-3 rounded-xl px-2 py-2.5 text-sm hover:bg-muted">
              <input
                type="radio"
                name="reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
                className="size-4 accent-primary"
              />
              {r}
            </label>
          ))}
        </fieldset>
      </Sheet>
    </>
  );
}

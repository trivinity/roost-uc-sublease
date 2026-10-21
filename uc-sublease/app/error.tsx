"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { COPY } from "@/lib/copy";

// Shown if a page crashes while rendering, so students see a friendly screen instead of a blank one.
export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <p className="font-medium">{COPY.empty.crashed.title}</p>
      <p className="pt-1 text-sm text-muted-foreground">{COPY.empty.crashed.body}</p>
      <div className="mt-4 flex justify-center gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" render={<Link href="/list" />} nativeButton={false}>
          Back to browse
        </Button>
      </div>
    </div>
  );
}

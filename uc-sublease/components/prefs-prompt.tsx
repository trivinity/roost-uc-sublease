"use client";

import { Button } from "@/components/ui/button";
import { PreferencesForm } from "./preferences-form";
import { useStore } from "@/lib/store";

// Shown once after the welcome slides: a minute of rating scales so places can be ranked by fit.
export function PrefsPrompt() {
  const { skipPrefs } = useStore();
  return (
    <div role="dialog" aria-modal="true" aria-label="Roommate preferences" className="fixed inset-0 z-[60] animate-in overflow-y-auto bg-background duration-300 fade-in">
      <div className="mx-auto w-full max-w-xl px-6 pb-16 pt-5">
        <div className="flex h-10 items-center justify-between">
          <p className="flex items-center gap-2 text-lg font-semibold tracking-tight">
            <span className="size-3 rounded-full bg-primary" aria-hidden /> Roost
          </p>
          <Button variant="ghost" size="sm" onClick={skipPrefs} className="text-muted-foreground">
            Skip for now
          </Button>
        </div>
        <div className="space-y-2 pb-8 pt-6">
          <h1 className="text-3xl font-semibold tracking-tight">Find roommates you&apos;ll click with</h1>
          <p className="text-muted-foreground">About a minute, all taps and sliders. We&apos;ll show the best fits first, and you can tap Show all any time.</p>
        </div>
        <PreferencesForm submitLabel="Save and start browsing" />
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DEFAULT_PREFS, TRAITS } from "@/lib/roommates";
import { useStore } from "@/lib/store";
import type { Prefs, Traits } from "@/lib/types";
import { CheckRow, RatingScale } from "./rating-scale";

function Group({ title, hint, children }: { title: string; hint: string; children: React.ReactNode }) {
  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="text-sm text-muted-foreground">{hint}</p>
      </div>
      {children}
    </section>
  );
}

// Rating scales and checkboxes only (no free text). Used in first-run onboarding and on the Preferences page.
export function PreferencesForm({ onDone, submitLabel = "Save preferences" }: { onDone?: () => void; submitLabel?: string }) {
  const { prefs, savePrefs } = useStore();
  const [draft, setDraft] = useState<Prefs>(prefs ?? DEFAULT_PREFS);
  const set = (side: "want" | "me", id: keyof Traits, v: number) => setDraft((d) => ({ ...d, [side]: { ...d[side], [id]: v } }));

  return (
    <form
      className="space-y-10"
      onSubmit={(e) => {
        e.preventDefault();
        savePrefs(draft);
        onDone?.();
      }}
    >
      <Group title="What I'm looking for" hint="Pick the home you'd like to live in. We use this to rank places by fit.">
        <div className="space-y-6">
          {TRAITS.map((t) => (
            <RatingScale key={t.id} def={t} value={draft.want[t.id]} onChange={(v) => set("want", t.id, v)} />
          ))}
        </div>
        <div className="space-y-2">
          <CheckRow checked={draft.wantSmokeFree} onChange={(v) => setDraft((d) => ({ ...d, wantSmokeFree: v }))}>
            Smoke-free home only
          </CheckRow>
          <CheckRow checked={draft.okCats} onChange={(v) => setDraft((d) => ({ ...d, okCats: v }))}>
            Fine with cats in the home
          </CheckRow>
          <CheckRow checked={draft.okDogs} onChange={(v) => setDraft((d) => ({ ...d, okDogs: v }))}>
            Fine with dogs in the home
          </CheckRow>
        </div>
      </Group>

      <Group title="About me" hint="Rate yourself honestly. Hosts can see this when you message them.">
        <div className="space-y-6">
          {TRAITS.map((t) => (
            <RatingScale key={t.id} def={t} value={draft.me[t.id]} onChange={(v) => set("me", t.id, v)} label={`${t.label} (me)`} />
          ))}
        </div>
        <div className="space-y-2">
          <CheckRow checked={draft.hasCat} onChange={(v) => setDraft((d) => ({ ...d, hasCat: v }))}>
            I have a cat
          </CheckRow>
          <CheckRow checked={draft.hasDog} onChange={(v) => setDraft((d) => ({ ...d, hasDog: v }))}>
            I have a dog
          </CheckRow>
        </div>
      </Group>

      <Button type="submit" size="lg" className="w-full">
        {submitLabel}
      </Button>
    </form>
  );
}

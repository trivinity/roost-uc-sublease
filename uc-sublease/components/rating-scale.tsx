"use client";

import type { TraitDef } from "@/lib/roommates";
import { cn } from "@/lib/utils";

// A row of steps from low to high (1..N). Shows the name of the chosen step underneath.
export function RatingScale({ def, value, onChange, label }: { def: TraitDef; value: number; onChange: (v: number) => void; label?: string }) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium">{label ?? def.label}</p>
        <p className="text-sm text-brand">{def.levels[value - 1]}</p>
      </div>
      <div role="radiogroup" aria-label={label ?? def.label} className="flex items-center gap-1.5">
        {def.levels.map((name, i) => {
          const step = i + 1;
          const on = step <= value;
          return (
            <button
              key={name}
              type="button"
              role="radio"
              aria-checked={step === value}
              aria-label={name}
              onClick={() => onChange(step)}
              className={cn("h-3 flex-1 rounded-full transition-all", on ? "bg-primary" : "bg-muted hover:bg-border", step === value && "scale-y-125")}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{def.levels[0]}</span>
        <span>{def.levels[def.levels.length - 1]}</span>
      </div>
    </div>
  );
}

export function CheckRow({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-5 shrink-0 accent-primary" />
      {children}
    </label>
  );
}

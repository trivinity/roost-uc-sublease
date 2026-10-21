"use client";

import type { TraitDef } from "@/lib/roommates";
import { cn } from "@/lib/utils";

// A row of steps from low to high (1..N). Shows the name of the chosen step underneath.
export function RatingScale({
  def,
  value,
  onChange,
  label,
}: {
  def: TraitDef;
  value: number;
  onChange: (v: number) => void;
  label?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-sm font-medium">{label ?? def.label}</p>
        <p className="text-sm text-brand">{def.levels[value - 1]}</p>
      </div>
      <div
        role="radiogroup"
        aria-label={label ?? def.label}
        className="-my-2 flex items-center gap-1.5"
      >
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
              // one tab stop for the whole scale; arrow keys move between steps
              tabIndex={step === value ? 0 : -1}
              onClick={() => onChange(step)}
              onKeyDown={(e) => {
                const dir =
                  e.key === "ArrowRight" || e.key === "ArrowUp"
                    ? 1
                    : e.key === "ArrowLeft" || e.key === "ArrowDown"
                      ? -1
                      : 0;
                if (!dir) return;
                e.preventDefault();
                const next = Math.min(
                  def.levels.length,
                  Math.max(1, step + dir),
                );
                onChange(next);
                (
                  e.currentTarget.parentElement?.children[next - 1] as
                    HTMLElement | undefined
                )?.focus();
              }}
              // tall invisible hit area (easy to tap), thin visible bar
              className="group flex h-8 flex-1 items-center outline-none"
            >
              <span
                className={cn(
                  "h-3 w-full rounded-full transition-all group-focus-visible:ring-2 group-focus-visible:ring-primary/50 group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-background",
                  on ? "bg-primary" : "bg-muted group-hover:bg-border",
                  step === value && "scale-y-125",
                )}
              />
            </button>
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

export function CheckRow({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border bg-card px-4 py-3 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-5 shrink-0 accent-primary"
      />
      {children}
    </label>
  );
}

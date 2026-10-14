"use client";

import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

export type Theme = "light" | "dark" | "system";
const KEY = "roost-theme";

const prefersDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches;

function apply(theme: Theme) {
  const dark = theme === "dark" || (theme === "system" && prefersDark());
  document.documentElement.classList.toggle("dark", dark);
}

// The tiny inline script in app/layout.tsx sets the class before first paint; this hook keeps it in sync after that.
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("system");
  const [dark, setDark] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect -- one-time read from localStorage */
  useEffect(() => {
    let stored: Theme = "system";
    try {
      stored = (localStorage.getItem(KEY) as Theme | null) ?? "system";
    } catch {}
    setThemeState(stored);
    setDark(document.documentElement.classList.contains("dark"));

    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      let t: Theme = "system";
      try {
        t = (localStorage.getItem(KEY) as Theme | null) ?? "system";
      } catch {}
      if (t === "system") {
        apply("system");
        setDark(mq.matches);
      }
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try {
      localStorage.setItem(KEY, t);
    } catch {}
    apply(t);
    setDark(document.documentElement.classList.contains("dark"));
  };

  return { theme, dark, setTheme };
}

// Header button: flips between light and dark.
export function ThemeToggle({ className }: { className?: string }) {
  const { dark, setTheme } = useTheme();
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn("grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground", className)}
    >
      {dark ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
    </button>
  );
}

// Light / Dark / System picker, used in the account menu.
export function ThemeSegment() {
  const { theme, setTheme } = useTheme();
  const opts: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "Auto", icon: Monitor },
  ];
  return (
    <div role="radiogroup" aria-label="Appearance" className="grid grid-cols-3 gap-1 rounded-xl bg-muted p-1">
      {opts.map(({ value, label, icon: Icon }) => (
        <button
          key={value}
          type="button"
          role="radio"
          aria-checked={theme === value}
          onClick={() => setTheme(value)}
          className={cn(
            "flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition-colors",
            theme === value ? "bg-background text-foreground shadow-sm" : "text-muted-foreground",
          )}
        >
          <Icon className="size-3.5" /> {label}
        </button>
      ))}
    </div>
  );
}

import { useColorScheme } from "react-native";

// Same palette as the web app: warm off-white in light mode, warm charcoal (not pure black) in dark mode.
export const LIGHT = {
  bg: "#fdfbf7",
  card: "#ffffff",
  popover: "#ffffff",
  ink: "#2a1f1d",
  muted: "#7a6d68",
  border: "#ece3db",
  soft: "#f6efe9",
  brand: "#d0312d", // fills (buttons)
  brandText: "#d0312d", // red used as text
  onBrand: "#ffffff",
  good: "#059669",
  overlay: "rgba(0,0,0,0.35)",
};

export const DARK: typeof LIGHT = {
  bg: "#161312",
  card: "#211d1c",
  popover: "#282321",
  ink: "#ece7e1",
  muted: "#aaa39d",
  border: "rgba(255,255,255,0.09)",
  soft: "#2d2826",
  brand: "#d0312d",
  brandText: "#ef8a85",
  onBrand: "#ffffff",
  good: "#6ee7b7",
  overlay: "rgba(0,0,0,0.6)",
};

export type Colors = typeof LIGHT;

export function useColors(): Colors & { dark: boolean } {
  const dark = useColorScheme() === "dark";
  return { ...(dark ? DARK : LIGHT), dark };
}

// Distance bands from UC: [background, text]. Same colors as the web app.
export const BAND_COLORS: Record<"light" | "dark", Record<"walk" | "near" | "ride" | "drive", [string, string]>> = {
  light: {
    walk: ["#d1fae5", "#065f46"],
    near: ["#e0f2fe", "#075985"],
    ride: ["#fef3c7", "#78350f"],
    drive: ["#ede9fe", "#5b21b6"],
  },
  dark: {
    walk: ["rgba(52,211,153,0.15)", "#6ee7b7"],
    near: ["rgba(56,189,248,0.15)", "#7dd3fc"],
    ride: ["rgba(251,191,36,0.15)", "#fcd34d"],
    drive: ["rgba(167,139,250,0.15)", "#c4b5fd"],
  },
};

export const radius = { card: 28, sheet: 28, pill: 999, input: 16 };

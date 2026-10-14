import { loadFont } from "@remotion/google-fonts/Geist";
import { Easing } from "remotion";

export const { fontFamily } = loadFont("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });

export type Mode = "light" | "dark";

export const RED = "#d0312d";
export const RED_DEEP = "#7d1a18";

export const THEME = {
  light: { bg: "#fdfbf7", card: "#ffffff", ink: "#2a1f1d", muted: "#7a6d68", border: "#ece3db", soft: "#f6efe9", brand: "#d0312d", shadow: "0 30px 60px -20px rgba(60,30,20,.25), 0 2px 4px rgba(0,0,0,.04)" },
  dark: { bg: "#161312", card: "#211d1c", ink: "#ece7e1", muted: "#aaa39d", border: "rgba(255,255,255,.09)", soft: "#2d2826", brand: "#ef8a85", shadow: "0 30px 60px -20px rgba(0,0,0,.7), 0 0 0 1px rgba(255,255,255,.06)" },
} as const;

export const HOOD = {
  light: { Uptown: ["#e0f2fe", "#075985"], Clifton: ["#d1fae5", "#065f46"], Corryville: ["#fef3c7", "#78350f"], OTR: ["#ede9fe", "#5b21b6"] },
  dark: { Uptown: ["rgba(56,189,248,.15)", "#7dd3fc"], Clifton: ["rgba(52,211,153,.15)", "#6ee7b7"], Corryville: ["rgba(251,191,36,.15)", "#fcd34d"], OTR: ["rgba(167,139,250,.15)", "#c4b5fd"] },
} as const;

export const ease = Easing.bezier(0.2, 0.8, 0.2, 1);
export const easeIn = Easing.bezier(0.5, 0, 0.9, 0.4);
export const easeInOut = Easing.bezier(0.65, 0, 0.35, 1);

export const LISTINGS = [
  { photo: "photos/bedroom-4.jpg", price: "$575", dates: "Jan 1 – Apr 30", title: "Sunny private room off Clifton Ave", hood: "Clifton", dist: "0.6 mi", furnished: true },
  { photo: "photos/living-3.jpg", price: "$895", dates: "Jan 1 – Aug 14", title: "Furnished studio steps from McMicken", hood: "Uptown", dist: "0.2 mi", furnished: true },
  { photo: "photos/living-4.jpg", price: "$1,350", dates: "May 1 – Aug 15", title: "Two-bedroom, whole unit in Corryville", hood: "Corryville", dist: "0.7 mi", furnished: false },
  { photo: "photos/living-5.jpg", price: "$1,425", dates: "Jan 3 – Aug 31", title: "Brick loft one-bedroom in OTR", hood: "OTR", dist: "2.1 mi", furnished: true },
] as const;

// Energy helpers. The soundtrack is 120 BPM = one beat every 15 frames, and every scene starts on a beat.
export const pop = Easing.bezier(0.34, 1.56, 0.64, 1); // overshoots a little, then settles
export const snap = Easing.bezier(0.16, 1, 0.3, 1);
export const beat = (f: number) => Math.exp(-(f % 15) / 3.5); // 1 on the beat, decays to ~0

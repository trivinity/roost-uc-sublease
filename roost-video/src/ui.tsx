import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { beat, fontFamily, HOOD, THEME, type Mode } from "./theme";

export const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
export const prog = (f: number, start: number, dur: number) => clamp01((f - start) / dur);

// ---------- phone shell ----------
export function Phone({ children, mode = "light", scale = 1, style }: { children: ReactNode; mode?: Mode; scale?: number; style?: CSSProperties }) {
  const t = THEME[mode];
  return (
    <div
      style={{
        width: 430,
        height: 884,
        borderRadius: 68,
        background: "#0d0d0d",
        padding: 20,
        boxShadow: "0 60px 100px -30px rgba(40,20,10,.45), 0 0 0 2px #2a2a2a inset",
        transform: `scale(${scale})`,
        transformOrigin: "center",
        flexShrink: 0,
        ...style,
      }}
    >
      <div style={{ width: 390, height: 844, borderRadius: 48, overflow: "hidden", background: t.bg, position: "relative", fontFamily, color: t.ink }}>
        {children}
        <div style={{ position: "absolute", top: 12, left: "50%", marginLeft: -56, width: 112, height: 32, borderRadius: 20, background: "#0d0d0d", zIndex: 50 }} />
      </div>
    </div>
  );
}

export function AppHeader({ mode = "light" }: { mode?: Mode }) {
  const t = THEME[mode];
  return (
    <div style={{ height: 112, paddingTop: 52, paddingInline: 20, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: `1px solid ${t.border}`, background: t.bg }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 22, fontWeight: 600, letterSpacing: -0.4 }}>
        <span style={{ width: 11, height: 11, borderRadius: 99, background: t.brand }} /> Roost
      </div>
      <div style={{ width: 32, height: 32, borderRadius: 99, background: "#d0312d", color: "#fff", display: "grid", placeItems: "center", fontSize: 14, fontWeight: 500 }}>A</div>
    </div>
  );
}

export function TabBar({ active, mode = "light" }: { active: number; mode?: Mode }) {
  const t = THEME[mode];
  const tabs = ["Discover", "Browse", "Saved", "Messages", "Post"];
  return (
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 78, borderTop: `1px solid ${t.border}`, background: t.bg, display: "flex" }}>
      {tabs.map((label, i) => (
        <div key={label} style={{ flex: 1, display: "grid", placeItems: "center", fontSize: 11, color: i === active ? t.brand : t.muted, position: "relative", paddingTop: 6 }}>
          {i === active && <span style={{ position: "absolute", top: 0, left: 18, right: 18, height: 2, borderRadius: 2, background: "#d0312d" }} />}
          <span style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${i === active ? t.brand : t.muted}`, opacity: 0.8 }} />
          <span style={{ marginTop: -8 }}>{label}</span>
        </div>
      ))}
    </div>
  );
}

export function Pill({ children, bg, color, style }: { children: ReactNode; bg: string; color: string; style?: CSSProperties }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: bg, color, padding: "5px 12px", borderRadius: 99, fontSize: 13, fontWeight: 500, whiteSpace: "nowrap", ...style }}>{children}</span>
  );
}

// ---------- deck card face ----------
export function CardFace({ l, mode = "light", w = 350, h = 560 }: { l: { photo: string; price: string; dates: string; title: string; hood: string; dist: string; furnished: boolean }; mode?: Mode; w?: number; h?: number }) {
  const t = THEME[mode];
  const [hbg, hfg] = (HOOD[mode] as Record<string, readonly [string, string]>)[l.hood];
  return (
    <div style={{ width: w, height: h, borderRadius: 30, overflow: "hidden", background: t.card, boxShadow: t.shadow, border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", fontFamily }}>
      <div style={{ position: "relative", flex: 1 }}>
        <Img src={staticFile(l.photo)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: "0 0 auto 0", height: 70, background: "linear-gradient(rgba(0,0,0,.28), transparent)" }} />
        <div style={{ position: "absolute", top: 14, left: 14, right: 14, display: "flex", gap: 5 }}>
          {[0, 1, 2].map((i) => <span key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i === 0 ? "#fff" : "rgba(255,255,255,.45)" }} />)}
        </div>
        {l.furnished && <span style={{ position: "absolute", top: 34, left: 14, background: "#fcd34d", color: "#451a03", fontSize: 13, fontWeight: 500, padding: "5px 12px", borderRadius: 99 }}>Furnished</span>}
        <span style={{ position: "absolute", top: 32, right: 14, width: 38, height: 38, borderRadius: 99, background: "rgba(255,255,255,.92)", display: "grid", placeItems: "center" }}>
          <span style={{ width: 13, height: 17, border: "2px solid #222", borderRadius: "2px 2px 1px 1px" }} />
        </span>
      </div>
      <div style={{ padding: "18px 20px 20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.8, color: t.brand }}>{l.price}<span style={{ fontSize: 17, fontWeight: 400, color: t.muted }}>/mo</span></span>
          <span style={{ fontSize: 14, color: t.muted }}>{l.dates}</span>
        </div>
        <div style={{ fontSize: 17, fontWeight: 500, marginTop: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{l.title}</div>
        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 8, fontSize: 14, color: t.muted }}>
          <Pill bg={hbg} color={hfg} style={{ fontSize: 12, padding: "3px 10px" }}>{l.hood === "OTR" ? "Over-the-Rhine" : l.hood}</Pill> {l.dist} to campus
        </div>
      </div>
    </div>
  );
}

// ---------- scene plumbing ----------
export function Fade({ children, dur, inFrames = 10, outFrames = 10 }: { children: ReactNode; dur: number; inFrames?: number; outFrames?: number }) {
  const f = useCurrentFrame();
  const opacity = interpolate(f, [0, inFrames, dur - outFrames, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
}

export function Backdrop({ mode = "light" }: { mode?: Mode }) {
  const f = useCurrentFrame();
  const t = THEME[mode];
  return (
    <AbsoluteFill style={{ background: t.bg }}>
      <div style={{ position: "absolute", width: 900, height: 900, borderRadius: 999, background: mode === "light" ? "rgba(208,49,45,.10)" : "rgba(208,49,45,.14)", filter: "blur(140px)", left: -200 + Math.sin(f / 60) * 80, top: -300 + Math.cos(f / 70) * 60, transform: `scale(${1 + beat(f) * 0.07})` }} />
      <div style={{ position: "absolute", width: 800, height: 800, borderRadius: 999, background: mode === "light" ? "rgba(251,191,36,.12)" : "rgba(251,191,36,.05)", filter: "blur(140px)", right: -150 + Math.cos(f / 65) * 80, bottom: -300 + Math.sin(f / 80) * 60, transform: `scale(${1 + beat(f + 7) * 0.06})` }} />
    </AbsoluteFill>
  );
}

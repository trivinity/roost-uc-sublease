import type { CSSProperties, ReactNode } from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { beat, easeIn, fontFamily, LISTINGS, pop, RED, snap, THEME } from "./theme";
import { AppHeader, Backdrop, CardFace, Fade, Phone, Pill, prog, TabBar } from "./ui";

const L = THEME.light;

// A line of big text that slams up out of a mask, with a little overshoot.
export function Rise({ children, start = 0, size = 120, weight = 600, color = L.ink, style }: { children: ReactNode; start?: number; size?: number; weight?: number; color?: string; style?: CSSProperties }) {
  const f = useCurrentFrame();
  const p = pop(prog(f, start, 14));
  return (
    <div style={{ overflow: "hidden", paddingBottom: size * 0.12, ...style }}>
      <div style={{ fontSize: size, fontWeight: weight, color, letterSpacing: -size * 0.03, lineHeight: 1.05, transform: `translateY(${(1 - p) * 115}%)`, opacity: Math.min(1, p * 2), fontFamily }}>{children}</div>
    </div>
  );
}

export function FadeUp({ children, start, style }: { children: ReactNode; start: number; style?: CSSProperties }) {
  const f = useCurrentFrame();
  const p = snap(prog(f, start, 14));
  return <div style={{ opacity: p, transform: `translateY(${(1 - p) * 28}px)`, fontFamily, ...style }}>{children}</div>;
}

// ---------------- 1. Logo ----------------
export function SceneLogo({ dur }: { dur: number }) {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const dot = spring({ frame: f, fps, config: { damping: 9, stiffness: 180 } });
  const ring = prog(f, 3, 22);
  const word = "Roost".split("");
  const sparks = Array.from({ length: 12 }, (_, i) => i);
  return (
    <Fade dur={dur} inFrames={2} outFrames={3}>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily }}>
        <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
          <div style={{ position: "relative", width: 110, height: 110, transform: `scale(${1 + beat(f) * 0.08})` }}>
            <div style={{ position: "absolute", inset: 0, borderRadius: 999, background: RED, transform: `scale(${dot})` }} />
            <div style={{ position: "absolute", inset: 0, borderRadius: 999, border: `5px solid ${RED}`, transform: `scale(${1 + ring * 2.4})`, opacity: (1 - ring) * 0.6 }} />
            {sparks.map((i) => {
              const a = (i / sparks.length) * Math.PI * 2;
              const p = snap(prog(f, 3, 20));
              const d = 70 + p * (110 + (i % 3) * 40);
              return <span key={i} style={{ position: "absolute", left: 55 + Math.cos(a) * d - 7, top: 55 + Math.sin(a) * d - 7, width: 14, height: 14, borderRadius: 99, background: i % 2 ? "#f59e0b" : RED, opacity: (1 - p) * (p > 0 ? 1 : 0), transform: `scale(${1 - p * 0.6})` }} />;
            })}
          </div>
          <div style={{ display: "flex", fontSize: 210, fontWeight: 600, letterSpacing: -9, color: L.ink }}>
            {word.map((ch, i) => {
              const p = pop(prog(f, 6 + i * 2, 12));
              return <span key={i} style={{ display: "inline-block", opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 90}px) scale(${0.8 + 0.2 * p})` }}>{ch}</span>;
            })}
          </div>
        </div>
        <FadeUp start={26} style={{ marginTop: 20, fontSize: 42, color: L.muted, letterSpacing: -0.5 }}>Verified student subleases near UC</FadeUp>
      </AbsoluteFill>
    </Fade>
  );
}

// ---------------- 2. Problem ----------------
export function SceneProblem({ dur }: { dur: number }) {
  const f = useCurrentFrame();
  const terms = [
    { name: "Spring", range: "Jan – Apr", c: "#0ea5e9" },
    { name: "Summer", range: "May – Aug", c: "#f59e0b" },
    { name: "Fall", range: "Aug – Dec", c: RED },
  ];
  const underline = snap(prog(f, 24, 16));
  return (
    <Fade dur={dur} inFrames={2} outFrames={3}>
      <Backdrop />
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", padding: "0 160px", gap: 100 }}>
        <div style={{ flex: 1 }}>
          <Rise start={0} size={92}>Co-op terms are short.</Rise>
          <Rise start={8} size={92} color={RED}>Finding a sublease</Rise>
          <div style={{ position: "relative" }}>
            <Rise start={14} size={92} color={RED}>shouldn&apos;t be hard.</Rise>
            <div style={{ position: "absolute", left: 0, bottom: 4, height: 10, borderRadius: 10, background: "#f59e0b", width: `${underline * 100}%`, opacity: 0.9, zIndex: -1 }} />
          </div>
        </div>
        <div style={{ width: 560, display: "grid", gap: 28 }}>
          {terms.map((t, i) => {
            const p = pop(prog(f, 4 + i * 6, 14));
            const bob = Math.sin((f + i * 20) / 10) * 6;
            return (
              <div key={t.name} style={{ opacity: Math.min(1, p * 2), transform: `translateX(${(1 - p) * 220}px) translateY(${bob}px) scale(${1 + beat(f + i * 5) * 0.025})`, background: "#fff", borderRadius: 36, padding: "30px 40px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: L.shadow, border: `1px solid ${L.border}`, fontFamily }}>
                <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
                  <span style={{ width: 22, height: 22, borderRadius: 99, background: t.c }} />
                  <span style={{ fontSize: 46, fontWeight: 600, letterSpacing: -1.2 }}>{t.name}</span>
                </div>
                <span style={{ fontSize: 34, color: L.muted }}>{t.range}</span>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </Fade>
  );
}

// ---------------- 3. Swipe deck ----------------
// dir 1 = right (message), -1 = left (pass). Every swipe lands on a beat.
const SWIPES = [
  { at: 30, dir: 1 },
  { at: 75, dir: -1 },
  { at: 120, dir: 1 },
];
const SWIPE_DUR = 12;
const CARD_W = 350;
const CARD_H = 500;

export function SceneSwipe({ dur }: { dur: number }) {
  const f = useCurrentFrame();
  const intro = pop(prog(f, 0, 16));
  const started = SWIPES.filter((s) => f >= s.at).length;
  const swipeP = (k: number) => (SWIPES[k] ? prog(f, SWIPES[k].at, SWIPE_DUR) : 0);

  // button presses just before swipes 1 and 2
  const press = (at: number) => prog(f, at - 8, 6) * (1 - prog(f, at - 2, 6));
  const passPress = press(75);
  const msgPress = Math.max(press(30), press(120));

  return (
    <Fade dur={dur} inFrames={2} outFrames={3}>
      <Backdrop />
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 130 }}>
        <div style={{ transform: `translateY(${(1 - intro) * 160}px) rotate(${(1 - intro) * -6 + Math.sin(f / 22) * 0.6}deg) scale(${1 + beat(f) * 0.006})`, opacity: Math.min(1, intro * 2) }}>
          <Phone scale={1.06}>
            <AppHeader />
            <div style={{ position: "absolute", top: 112, left: 0, right: 0, bottom: 78, background: "linear-gradient(#fde8e6, transparent 40%)" }}>
              <div style={{ position: "absolute", left: 20, top: 14, fontSize: 14, color: L.muted, fontFamily }}>{Math.max(15 - started, 0)} places to go</div>
              <div style={{ position: "absolute", left: 20, top: 40, width: CARD_W, height: CARD_H }}>
                {LISTINGS.map((l, k) => {
                  if (k > started + 1 || (SWIPES[k] && f >= SWIPES[k].at + SWIPE_DUR)) return null;
                  const sp = swipeP(k);
                  const behind = k > started;
                  const dir = SWIPES[k]?.dir ?? 1;
                  const x = dir * 660 * easeIn(sp);
                  const rot = dir * 18 * easeIn(sp);
                  const nextGrow = k === started + 1 ? 0 : 1; // card right behind the top card
                  void nextGrow;
                  const prevP = k > 0 ? swipeP(k - 1) : 1;
                  const scale = behind ? 0.94 + 0.06 * prevP : 1;
                  const dragging = k === started && sp > 0;
                  return (
                    <div key={k} style={{ position: "absolute", inset: 0, zIndex: 10 - k, transform: `translateX(${x}px) translateY(${behind ? (1 - prevP) * 14 : 0}px) rotate(${rot}deg) scale(${scale})` }}>
                      <CardFace l={l} w={CARD_W} h={CARD_H} />
                      {dragging && (
                        <div style={{ position: "absolute", top: 110, [dir === 1 ? "left" : "right"]: 22, transform: `rotate(${dir === 1 ? -8 : 8}deg)`, opacity: snap(prog(f, SWIPES[k].at, 5)), border: `3px solid ${dir === 1 ? "#10b981" : "#9ca3af"}`, color: dir === 1 ? "#059669" : "#6b7280", background: "rgba(255,255,255,.88)", padding: "6px 16px", borderRadius: 14, fontSize: 28, fontWeight: 700, letterSpacing: 1, fontFamily }}>
                          {dir === 1 ? "MESSAGE" : "PASS"}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* buttons sit below the card with room to spare */}
              <div style={{ position: "absolute", left: 20, right: 20, bottom: 12, display: "flex", gap: 12, fontFamily }}>
                <div style={{ width: 48, height: 48, borderRadius: 99, border: `1px solid ${L.border}`, background: "#fff", display: "grid", placeItems: "center", color: L.muted, fontSize: 20 }}>↶</div>
                <div style={{ flex: 1, height: 48, borderRadius: 99, border: `1px solid ${L.border}`, background: "#fff", display: "grid", placeItems: "center", fontSize: 16, fontWeight: 500, transform: `scale(${1 - passPress * 0.1})`, boxShadow: passPress ? "0 0 0 6px rgba(208,49,45,.18)" : "none" }}>✕&nbsp; Pass</div>
                <div style={{ flex: 1, height: 48, borderRadius: 99, background: RED, color: "#fff", display: "grid", placeItems: "center", fontSize: 16, fontWeight: 500, transform: `scale(${1 - msgPress * 0.1})`, boxShadow: msgPress ? "0 0 0 6px rgba(208,49,45,.25)" : "none" }}>Message</div>
              </div>
            </div>
            <TabBar active={0} />
          </Phone>
        </div>
        <div style={{ width: 620 }}>
          <Rise start={4} size={92}>Swipe to find</Rise>
          <Rise start={9} size={92}>your place.</Rise>
          <FadeUp start={18} style={{ fontSize: 34, color: L.muted, lineHeight: 1.4, marginTop: 20 }}>
            Right to message the sublessor.<br />Left to pass. Real photos, real prices.
          </FadeUp>
          <FadeUp start={34} style={{ marginTop: 34, display: "flex", gap: 12 }}>
            <Pill bg="#d1fae5" color="#065f46" style={{ fontSize: 22, padding: "10px 22px" }}>Clifton</Pill>
            <Pill bg="#e0f2fe" color="#075985" style={{ fontSize: 22, padding: "10px 22px" }}>Uptown</Pill>
            <Pill bg="#fef3c7" color="#78350f" style={{ fontSize: 22, padding: "10px 22px" }}>Corryville</Pill>
            <Pill bg="#ede9fe" color="#5b21b6" style={{ fontSize: 22, padding: "10px 22px" }}>OTR</Pill>
          </FadeUp>
        </div>
      </AbsoluteFill>
    </Fade>
  );
}

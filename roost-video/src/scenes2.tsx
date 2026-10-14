import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { Rise, FadeUp } from "./scenes1";
import { beat, easeInOut, fontFamily, LISTINGS, pop, RED, snap, THEME, type Mode } from "./theme";
import { AppHeader, Backdrop, Fade, Phone, Pill, prog, TabBar } from "./ui";

const L = THEME.light;

// ---------------- 4. Filters ----------------
function Chip({ label, on, at, f }: { label: string; on?: boolean; at?: number; f: number }) {
  const sel = on || (at !== undefined && f >= at);
  const pop = at !== undefined ? 1 + 0.12 * Math.sin(Math.PI * prog(f, at, 8)) : 1;
  return (
    <span style={{ transform: `scale(${pop})`, display: "inline-block", padding: "9px 16px", borderRadius: 99, fontSize: 15, border: `1px solid ${sel ? RED : L.border}`, background: sel ? RED : "#fff", color: sel ? "#fff" : L.ink, fontFamily }}>{label}</span>
  );
}

export function SceneFilters({ dur }: { dur: number }) {
  const f = useCurrentFrame();
  const intro = pop(prog(f, 0, 16));
  const sheet = snap(prog(f, 2, 14));
  const slide = snap(prog(f, 10, 22));
  const lo = interpolate(slide, [0, 1], [0, 12]);
  const hi = interpolate(slide, [0, 1], [100, 56]);
  const label = slide < 0.02 ? "$300 – $2,000+" : `$${Math.round((300 + lo * 17) / 25) * 25} – $${Math.round((300 + hi * 17) / 25) * 25}`;
  const counts = [15, 7, 4, 3, 2];
  const n = counts[(f >= 22 ? 1 : 0) + (f >= 40 ? 1 : 0) + (f >= 50 ? 1 : 0) + (f >= 62 ? 1 : 0)];
  const furn = f >= 62;
  const sw = snap(prog(f, 62, 6));

  return (
    <Fade dur={dur} inFrames={2} outFrames={3}>
      <Backdrop />
      <AbsoluteFill style={{ flexDirection: "row-reverse", alignItems: "center", justifyContent: "center", gap: 140 }}>
        <div style={{ transform: `translateY(${(1 - intro) * 120}px)`, opacity: intro }}>
          <Phone scale={1.08}>
            <AppHeader />
            <div style={{ position: "absolute", inset: "112px 0 78px 0", background: "linear-gradient(#fde8e6, transparent 40%)" }} />
            <TabBar active={0} />
            <div style={{ position: "absolute", inset: 0, background: `rgba(0,0,0,${0.3 * sheet})` }} />
            <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 700, background: "#fff", borderRadius: "30px 30px 0 0", transform: `translateY(${(1 - sheet) * 700}px)`, fontFamily, padding: "14px 22px 0" }}>
              <div style={{ width: 40, height: 4, borderRadius: 4, background: L.border, margin: "0 auto 14px" }} />
              <div style={{ fontSize: 22, fontWeight: 600, letterSpacing: -0.4, marginBottom: 14 }}>Filters</div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 600 }}>Monthly rent<span style={{ fontWeight: 400, color: L.muted }}>{label}</span></div>
              <div style={{ position: "relative", height: 28, margin: "14px 0 18px" }}>
                <div style={{ position: "absolute", left: 0, right: 0, top: 12, height: 4, borderRadius: 4, background: L.soft }} />
                <div style={{ position: "absolute", left: `${lo}%`, right: `${100 - hi}%`, top: 12, height: 4, borderRadius: 4, background: RED }} />
                {[lo, hi].map((p, i) => <div key={i} style={{ position: "absolute", left: `calc(${p}% - ${p * 0.26}px)`, top: 2, width: 24, height: 24, borderRadius: 99, background: "#fff", boxShadow: "0 2px 8px rgba(0,0,0,.25)", border: "1px solid rgba(0,0,0,.1)" }} />)}
              </div>

              <div style={{ fontSize: 15, fontWeight: 600, margin: "6px 0 10px" }}>Available dates <span style={{ fontWeight: 400, color: L.muted, float: "right" }}>Covers your whole stay</span></div>
              <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
                <Chip label="Spring" f={f} />
                <Chip label="Summer" f={f} at={22} />
                <Chip label="Fall" f={f} />
              </div>

              <div style={{ fontSize: 15, fontWeight: 600, margin: "6px 0 10px" }}>Neighborhood</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
                <Chip label="Uptown" f={f} at={50} />
                <Chip label="Clifton" f={f} at={40} />
                <Chip label="Corryville" f={f} />
                <Chip label="Over-the-Rhine" f={f} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 15, fontWeight: 600, margin: "6px 0 18px" }}>
                Furnished only
                <span style={{ width: 52, height: 30, borderRadius: 99, background: furn ? RED : "#d4d4d4", position: "relative", display: "inline-block" }}>
                  <span style={{ position: "absolute", top: 3, left: 3 + sw * 22, width: 24, height: 24, borderRadius: 99, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,.3)" }} />
                </span>
              </div>

              <div style={{ position: "absolute", left: 22, right: 22, bottom: 24, display: "flex", gap: 12 }}>
                <div style={{ padding: "0 18px", height: 52, display: "grid", placeItems: "center", color: L.muted, fontSize: 16 }}>Reset</div>
                <div style={{ flex: 1, height: 52, borderRadius: 99, background: RED, color: "#fff", display: "grid", placeItems: "center", fontSize: 17, fontWeight: 500 }}>Show {n} {n === 1 ? "place" : "places"}</div>
              </div>
            </div>
          </Phone>
        </div>
        <div style={{ width: 640 }}>
          <Rise start={4} size={92}>Filter by your</Rise>
          <Rise start={9} size={92}>co-op term.</Rise>
          <FadeUp start={20} style={{ fontSize: 34, color: L.muted, lineHeight: 1.4, marginTop: 20 }}>
            One tap for Spring, Summer or Fall.<br />Price, neighborhood, bedrooms, furnished and distance too.
          </FadeUp>
          <FadeUp start={44} style={{ marginTop: 34, fontSize: 30, fontWeight: 500, color: RED }}>
            Same filters in the deck and the list.
          </FadeUp>
        </div>
      </AbsoluteFill>
    </Fade>
  );
}

// ---------------- 5. Trust ----------------
function Icon({ kind }: { kind: "badge" | "shield" | "clock" }) {
  const common = { fill: "none", stroke: "#fff", strokeWidth: 5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      {kind === "badge" && (<><circle cx="32" cy="32" r="22" {...common} /><path d="M22 33l7 7 14-15" {...common} /></>)}
      {kind === "shield" && (<><path d="M32 8l20 7v16c0 12-8 20-20 25C20 51 12 43 12 31V15z" {...common} /><path d="M23 32l6 6 12-13" {...common} /></>)}
      {kind === "clock" && (<><circle cx="32" cy="32" r="22" {...common} /><path d="M32 18v15l9 6" {...common} /></>)}
    </svg>
  );
}

export function SceneTrust({ dur }: { dur: number }) {
  const f = useCurrentFrame();
  const cards = [
    { icon: "badge" as const, title: "UC verified", body: "Everyone signs in with a @mail.uc.edu email.", c: "#10b981" },
    { icon: "shield" as const, title: "Landlord consent", body: "Every listing confirms the lease allows subletting.", c: RED },
    { icon: "clock" as const, title: "Always fresh", body: "See when a place was last confirmed available.", c: "#f59e0b" },
  ];
  const bar = snap(prog(f, 50, 26));
  return (
    <Fade dur={dur} inFrames={2} outFrames={3}>
      <Backdrop />
      <AbsoluteFill style={{ padding: "110px 150px", fontFamily }}>
        <Rise start={0} size={100}>Trust, built in.</Rise>
        <div style={{ display: "flex", gap: 40, marginTop: 56 }}>
          {cards.map((c, i) => {
            const p = pop(prog(f, 4 + i * 5, 16));
            return (
              <div key={c.title} style={{ flex: 1, opacity: Math.min(1, p * 2), transform: `translateY(${(1 - p) * 70}px) scale(${0.94 + 0.06 * p})`, background: "#fff", borderRadius: 40, padding: 44, boxShadow: L.shadow, border: `1px solid ${L.border}` }}>
                <div style={{ width: 104, height: 104, borderRadius: 30, background: c.c, display: "grid", placeItems: "center", boxShadow: `0 18px 30px -10px ${c.c}88` }}><Icon kind={c.icon} /></div>
                <div style={{ fontSize: 46, fontWeight: 600, letterSpacing: -1.2, marginTop: 36 }}>{c.title}</div>
                <div style={{ fontSize: 28, color: L.muted, marginTop: 12, lineHeight: 1.35 }}>{c.body}</div>
              </div>
            );
          })}
        </div>
        <FadeUp start={38} style={{ marginTop: 44, background: "#fff", borderRadius: 36, padding: "30px 44px", display: "flex", alignItems: "center", gap: 36, boxShadow: L.shadow, border: `1px solid ${L.border}` }}>
          <Pill bg="#d1fae5" color="#065f46" style={{ fontSize: 26, padding: "10px 24px" }}>Great price</Pill>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 32, fontWeight: 500 }}>18% below the average for rooms nearby</div>
            <div style={{ height: 14, borderRadius: 14, background: L.soft, marginTop: 16, overflow: "hidden" }}>
              <div style={{ width: `${bar * 72}%`, height: "100%", borderRadius: 14, background: "linear-gradient(90deg,#34d399,#10b981)" }} />
            </div>
          </div>
          <div style={{ fontSize: 60, fontWeight: 600, color: "#059669", letterSpacing: -2 }}>{Math.round(bar * 18)}%</div>
        </FadeUp>
      </AbsoluteFill>
    </Fade>
  );
}

// ---------------- 6. Chat ----------------
function Bubble({ me, children, at, f }: { me?: boolean; children: React.ReactNode; at: number; f: number }) {
  const p = pop(prog(f, at, 10));
  if (f < at) return null;
  return (
    <div style={{ display: "flex", justifyContent: me ? "flex-end" : "flex-start", opacity: p, transform: `translateY(${(1 - p) * 16}px) scale(${0.95 + 0.05 * p})`, transformOrigin: me ? "right bottom" : "left bottom" }}>
      <div style={{ maxWidth: 270, padding: "11px 16px", borderRadius: 22, fontSize: 16, lineHeight: 1.3, background: me ? RED : L.soft, color: me ? "#fff" : L.ink }}>{children}</div>
    </div>
  );
}

export function SceneChat({ dur }: { dur: number }) {
  const f = useCurrentFrame();
  const intro = pop(prog(f, 0, 16));
  const press = prog(f, 76, 5) * (1 - prog(f, 82, 5));
  const shared = f >= 84;
  const theirs = f >= 104;
  const typing = f >= 20 && f < 36;
  const typing2 = f >= 58 && f < 70;
  return (
    <Fade dur={dur} inFrames={2} outFrames={3}>
      <Backdrop />
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 140 }}>
        <div style={{ width: 640 }}>
          <Rise start={4} size={92}>Private until</Rise>
          <Rise start={9} size={92} color={RED}>you say so.</Rise>
          <FadeUp start={20} style={{ fontSize: 34, color: L.muted, lineHeight: 1.4, marginTop: 20 }}>
            Chat first. Your phone and email stay hidden until you choose to share them.
          </FadeUp>
        </div>
        <div style={{ transform: `translateY(${(1 - intro) * 120}px)`, opacity: intro }}>
          <Phone scale={1.08}>
            <div style={{ position: "absolute", inset: 0, fontFamily }}>
              <div style={{ height: 112, paddingTop: 52, paddingInline: 16, display: "flex", alignItems: "center", gap: 12, borderBottom: `1px solid ${L.border}` }}>
                <span style={{ fontSize: 22 }}>←</span>
                <Img src={staticFile("photos/bedroom-4.jpg")} style={{ width: 40, height: 40, borderRadius: 12, objectFit: "cover" }} />
                <div><div style={{ fontSize: 16, fontWeight: 600 }}>Maya R.</div><div style={{ fontSize: 12, color: L.muted }}>Sunny private room off Clifton Ave · $575/mo</div></div>
              </div>
              <div style={{ padding: "12px 16px", background: "#f9f3ee", borderBottom: `1px solid ${L.border}`, fontSize: 14, color: L.muted, display: "grid", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span>{shared ? "✓ You shared alex@mail.uc.edu" : "🔒 Your contact info is hidden"}</span>
                  {!shared && <span style={{ padding: "6px 14px", borderRadius: 99, border: `1px solid ${L.border}`, background: "#fff", color: L.ink, fontSize: 13, fontWeight: 500, transform: `scale(${1 - press * 0.08})`, boxShadow: press ? "0 0 0 5px rgba(208,49,45,.15)" : "none" }}>Share mine</span>}
                </div>
                <div style={{ color: theirs ? L.ink : L.muted }}>{theirs ? "maya@mail.uc.edu · (513) 555-0187" : "Maya's contact info is hidden until they share it"}</div>
              </div>
              <div style={{ padding: 16, display: "grid", gap: 10 }}>
                <Bubble me at={6} f={f}>Hi Maya! Is the room still available for spring?</Bubble>
                {typing && <div style={{ background: L.soft, borderRadius: 22, padding: "14px 18px", width: 64, display: "flex", gap: 5 }}>{[0, 1, 2].map((d) => <span key={d} style={{ width: 8, height: 8, borderRadius: 99, background: "#a8a29e", transform: `translateY(${Math.sin((f + d * 4) / 3) * 3}px)` }} />)}</div>}
                <Bubble at={36} f={f}>Yes it is! The room is open Jan 1. Want to tour this week?</Bubble>
                <Bubble me at={50} f={f}>That would be great.</Bubble>
                {typing2 && <div style={{ background: L.soft, borderRadius: 22, padding: "14px 18px", width: 64, display: "flex", gap: 5 }}>{[0, 1, 2].map((d) => <span key={d} style={{ width: 8, height: 8, borderRadius: 99, background: "#a8a29e", transform: `translateY(${Math.sin((f + d * 4) / 3) * 3}px)` }} />)}</div>}
                {shared && <div style={{ textAlign: "center", fontSize: 13, color: L.muted }}>You shared your contact info.</div>}
                {theirs && <div style={{ textAlign: "center", fontSize: 13, color: L.muted }}>They shared their contact info too.</div>}
              </div>
              <div style={{ position: "absolute", left: 14, right: 14, bottom: 24, display: "flex", gap: 10 }}>
                <div style={{ flex: 1, height: 46, borderRadius: 99, border: `1px solid ${L.border}`, padding: "0 18px", display: "flex", alignItems: "center", color: L.muted, fontSize: 16 }}>Message</div>
                <div style={{ width: 46, height: 46, borderRadius: 99, background: RED, opacity: 0.5 }} />
              </div>
            </div>
          </Phone>
        </div>
      </AbsoluteFill>
    </Fade>
  );
}

// ---------------- 7. Compare + dark ----------------
function CompareCard({ mode, f }: { mode: Mode; f: number }) {
  const t = THEME[mode];
  const cols = [LISTINGS[0], LISTINGS[1], LISTINGS[2]];
  const rows: { k: string; v: (i: number) => string; best?: number }[] = [
    { k: "Rent", v: (i) => ["$575/mo", "$895/mo", "$1,350/mo"][i], best: 0 },
    { k: "Est. total", v: (i) => ["$635/mo", "$895/mo", "$1,470/mo"][i], best: 0 },
    { k: "To campus", v: (i) => ["0.6 mi", "0.2 mi", "0.7 mi"][i], best: 1 },
    { k: "Furnished", v: (i) => ["Yes", "Yes", "No"][i] },
  ];
  return (
    <div style={{ width: 1500, background: t.card, borderRadius: 44, padding: "40px 54px 30px", boxShadow: t.shadow, border: `1px solid ${t.border}`, fontFamily, color: t.ink }}>
      <div style={{ display: "grid", gridTemplateColumns: "190px repeat(3, minmax(0, 1fr))", columnGap: 36 }}>
        <div />
        {cols.map((c, i) => {
          const p = pop(prog(f, 2 + i * 4, 14));
          return (
            <div key={i} style={{ opacity: p, transform: `translateY(${(1 - p) * 40}px)` }}>
              <div style={{ height: 210, borderRadius: 26, overflow: "hidden" }}><Img src={staticFile(c.photo)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: mode === "dark" ? "brightness(.9)" : undefined }} /></div>
              <div style={{ fontSize: 24, fontWeight: 500, marginTop: 16, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.title}</div>
            </div>
          );
        })}
        {rows.map((r, ri) => {
          const p = snap(prog(f, 18 + ri * 5, 12));
          return (
            <div key={r.k} style={{ display: "contents" }}>
              <div style={{ borderTop: `1px solid ${t.border}`, marginTop: ri === 0 ? 24 : 0, padding: "20px 0", fontSize: 24, color: t.muted, opacity: p }}>{r.k}</div>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ borderTop: `1px solid ${t.border}`, marginTop: ri === 0 ? 24 : 0, padding: "20px 0", fontSize: 28, fontWeight: r.best === i ? 600 : 400, color: r.best === i ? (mode === "dark" ? "#6ee7b7" : "#059669") : t.ink, opacity: p, transform: `translateY(${(1 - p) * 10}px)` }}>
                  {r.v(i)}{r.best === i ? "  ✓" : ""}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SceneCompare({ dur }: { dur: number }) {
  const f = useCurrentFrame();
  const wipe = easeInOut(prog(f, 76, 28));
  const R = wipe * 2600;
  const layer = (mode: Mode) => (
    <AbsoluteFill>
      <Backdrop mode={mode} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 44, fontFamily }}>
        <div style={{ textAlign: "center" }}>
          <Rise start={0} size={92} color={THEME[mode].ink} style={{ display: "flex", justifyContent: "center" }}>Compare side by side.</Rise>
        </div>
        <CompareCard mode={mode} f={f} />
        <FadeUp start={40} style={{ fontSize: 38, color: THEME[mode].muted, display: "flex", gap: 14, alignItems: "center" }}>
          <span style={{ width: 14, height: 14, borderRadius: 99, background: mode === "dark" ? "#ef8a85" : RED }} />
          {f < 90 ? "Light mode" : "…and a clean dark mode too"}
        </FadeUp>
      </AbsoluteFill>
    </AbsoluteFill>
  );
  return (
    <Fade dur={dur} inFrames={2} outFrames={3}>
      {layer("light")}
      <AbsoluteFill style={{ clipPath: `circle(${R}px at 86% 88%)` }}>{layer("dark")}</AbsoluteFill>
    </Fade>
  );
}

// ---------------- 8. End card ----------------
export function SceneEnd({ dur }: { dur: number }) {
  const f = useCurrentFrame();
  const fan = [
    { src: LISTINGS[1].photo, rot: -11, x: -300, y: 30 },
    { src: LISTINGS[3].photo, rot: 11, x: 300, y: 30 },
    { src: LISTINGS[0].photo, rot: 0, x: 0, y: -10 },
  ];
  return (
    <Fade dur={dur} outFrames={2}>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", fontFamily }}>
        <div style={{ position: "relative", width: 1000, height: 470, marginTop: 70 }}>
          {fan.map((c, i) => {
            const p = pop(prog(f, i * 4, 16));
            return (
              <div key={i} style={{ position: "absolute", left: 500 - 190 + c.x * p, top: c.y + (1 - p) * 200, width: 380, height: 450, borderRadius: 34, overflow: "hidden", transform: `rotate(${c.rot * p}deg)`, boxShadow: "0 40px 70px -20px rgba(60,30,20,.4)", border: "6px solid #fff", opacity: p, zIndex: i === 2 ? 3 : 1 }}>
                <Img src={staticFile(c.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 40 }}>
          <span style={{ width: 70, height: 70, borderRadius: 99, background: RED, transform: `scale(${pop(prog(f, 12, 12)) * (1 + beat(f) * 0.08)})` }} />
          <Rise start={14} size={160} style={{ marginBottom: 0 }}>Roost</Rise>
        </div>
        <FadeUp start={28} style={{ fontSize: 42, color: L.muted, marginTop: 6 }}>Verified student subleases near UC</FadeUp>
        <FadeUp start={40} style={{ fontSize: 26, color: L.muted, marginTop: 34, letterSpacing: 2, textTransform: "uppercase" }}>Senior design capstone · University of Cincinnati</FadeUp>
      </AbsoluteFill>
    </Fade>
  );
}

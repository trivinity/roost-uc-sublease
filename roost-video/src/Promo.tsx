import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { SceneChat, SceneCompare, SceneEnd, SceneFilters, SceneTrust } from "./scenes2";
import { SceneLogo, SceneProblem, SceneSwipe } from "./scenes1";
import { snap } from "./theme";
import { prog } from "./ui";

// 120 BPM: a beat is 15 frames. Every scene is a whole number of beats, so every cut lands on the beat.
export const SCENES = [
  { C: SceneLogo, dur: 90 },
  { C: SceneProblem, dur: 90 },
  { C: SceneSwipe, dur: 180 },
  { C: SceneFilters, dur: 120 },
  { C: SceneTrust, dur: 120 },
  { C: SceneChat, dur: 150 },
  { C: SceneCompare, dur: 150 },
  { C: SceneEnd, dur: 90 },
] as const;

export const TOTAL = SCENES.reduce((n, s) => n + s.dur, 0);

// Two slanted colour panels sweep across the screen to hide each cut. Frame 10 of this clip is the cut itself.
function Wipe() {
  const f = useCurrentFrame();
  const panel = (delay: number, color: string) => {
    const a = snap(prog(f, delay, 8)); // in
    const b = snap(prog(f, 8 + delay, 8)); // out
    const x = a < 1 ? -120 + a * 120 : b * 120;
    return <div style={{ position: "absolute", top: -40, bottom: -40, left: "-15%", width: "130%", background: color, transform: `translateX(${x}%) skewX(-14deg)` }} />;
  };
  return (
    <AbsoluteFill style={{ overflow: "hidden", pointerEvents: "none" }}>
      {panel(0, "#f59e0b")}
      {panel(2, "#d0312d")}
    </AbsoluteFill>
  );
}

export const Promo = () => {
  let t = 0;
  const cuts: number[] = [];
  return (
    <AbsoluteFill style={{ background: "#fdfbf7" }}>
      {SCENES.map(({ C, dur }, i) => {
        const from = t;
        t += dur;
        if (i < SCENES.length - 1) cuts.push(t);
        return (
          <Sequence key={i} from={from} durationInFrames={dur}>
            <C dur={dur} />
          </Sequence>
        );
      })}
      {cuts.map((c) => (
        <Sequence key={c} from={c - 10} durationInFrames={22}>
          <Wipe />
        </Sequence>
      ))}
      <Audio src={staticFile("music.wav")} volume={(f) => interpolate(f, [0, 6, TOTAL - 30, TOTAL], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} />
    </AbsoluteFill>
  );
};

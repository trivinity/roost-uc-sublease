// Synthesizes an upbeat 120 BPM track (kick, clap, hats, bass, chord stabs, arp, risers). No samples, no licensing.
// Every scene in the video is a whole number of beats, so cuts land on the beat.
import { writeFileSync } from "node:fs";

const SR = 44100;
const BPM = 120;
const BEAT = 60 / BPM; // 0.5s
const SIXTEENTH = BEAT / 4;
const DUR = 34.5; // video is 33s, leave a tail for the final hit
const N = Math.floor(SR * DUR);
const L = new Float32Array(N);
const R = new Float32Array(N);

// scene cuts in seconds (frames / 30), used for risers
const CUTS = [90, 180, 360, 480, 600, 750, 900].map((f) => f / 30);

let seed = 12345;
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0;
  return seed / 2 ** 31 - 1;
};
const hz = (n) => 440 * 2 ** ((n - 69) / 12);
// sidechain: everything melodic ducks on each kick
const duck = (t) => 1 - 0.6 * Math.exp(-(t % BEAT) * 10);

function add(t0, len, fn, pan = 0.5, ducked = false) {
  const start = Math.floor(t0 * SR);
  const count = Math.floor(len * SR);
  for (let i = 0; i < count; i++) {
    const idx = start + i;
    if (idx < 0 || idx >= N) continue;
    const t = i / SR;
    let s = fn(t, i);
    if (ducked) s *= duck(t0 + t);
    L[idx] += s * (1 - pan) * 1.4;
    R[idx] += s * pan * 1.4;
  }
}

function kick(t0, amp = 0.95) {
  let phase = 0;
  add(t0, 0.4, (t) => {
    const f = 46 + 120 * Math.exp(-t * 30);
    phase += (2 * Math.PI * f) / SR;
    return Math.sin(phase) * Math.exp(-t * 8) * Math.min(1, t / 0.002) * amp + (t < 0.004 ? rnd() * 0.3 : 0);
  });
}

function clap(t0, amp = 0.34) {
  let prev = 0;
  add(t0, 0.3, (t) => {
    const n = rnd();
    const hp = n - prev; // crude high-pass
    prev = n;
    const burst = [0, 0.011, 0.022].reduce((a, d) => a + (t >= d ? Math.exp(-(t - d) * 90) : 0), 0);
    return hp * (burst * 0.6 + Math.exp(-t * 18) * 0.5) * amp;
  }, 0.5);
}

function hat(t0, open = false, amp = 0.1, pan = 0.5) {
  let prev = 0;
  add(t0, open ? 0.25 : 0.08, (t) => {
    const n = rnd();
    const hp = n - prev;
    prev = n;
    return hp * Math.exp(-t * (open ? 22 : 70)) * amp * (open ? 1.3 : 1);
  }, pan);
}

function bass(t0, note, len = 0.26, amp = 0.34) {
  const f = hz(note);
  add(t0, len, (t) => {
    let s = 0;
    for (let h = 1; h <= 6; h++) s += Math.sin(2 * Math.PI * f * h * t) / h / (1 + h * (1 - Math.exp(-t * 6)) * 0.4);
    return s * Math.min(1, t / 0.004) * Math.min(1, (len - t) / 0.03) * Math.exp(-t * 3) * amp;
  }, 0.5, true);
}

function stab(t0, notes, amp = 0.075, len = 0.28) {
  for (const note of notes) {
    for (const det of [-6, 6]) {
      const f = hz(note) * 2 ** (det / 1200);
      add(t0, len, (t) => (Math.sin(2 * Math.PI * f * t) + 0.5 * Math.sin(4 * Math.PI * f * t) + 0.28 * Math.sin(6 * Math.PI * f * t)) * Math.exp(-t * 11) * Math.min(1, t / 0.003) * amp * 0.5, 0.35 + (note % 5) * 0.08, true);
    }
  }
}

function pluck(t0, note, amp = 0.06, pan = 0.5) {
  const f = hz(note);
  add(t0, 0.35, (t) => (Math.sin(2 * Math.PI * f * t) + 0.35 * Math.sin(4 * Math.PI * f * t) * Math.exp(-t * 12)) * Math.exp(-t * 11) * Math.min(1, t / 0.002) * amp, pan, true);
}

function riser(t1, len = 0.9, amp = 0.16) {
  let prev = 0;
  add(t1 - len, len, (t) => {
    const n = rnd();
    const hp = n - prev * (0.85 - 0.8 * (t / len)); // brightens as it rises
    prev = n;
    return hp * (t / len) ** 2.2 * amp;
  });
}

function crash(t0, amp = 0.2) {
  let prev = 0;
  add(t0, 2.2, (t) => {
    const n = rnd();
    const hp = n - prev;
    prev = n;
    return hp * Math.exp(-t * 2.4) * amp;
  });
}

// ---- arrangement ----
const CHORDS = [
  { tri: [57, 60, 64], root: 45 }, // Am
  { tri: [53, 57, 60], root: 41 }, // F
  { tri: [60, 64, 67], root: 48 }, // C
  { tri: [55, 59, 62], root: 43 }, // G
];
const chordAt = (t) => CHORDS[Math.floor(t / (BEAT * 8)) % 4];

const TOTAL_BEATS = Math.floor(33 / BEAT);
for (let b = 0; b < TOTAL_BEATS; b++) {
  const t = b * BEAT;
  kick(t);
  if (b % 4 === 1 || b % 4 === 3) clap(t);
  hat(t + BEAT / 2, true, 0.1, 0.62); // open hat on the offbeat
  for (const q of [0, 2]) hat(t + (q * BEAT) / 4, false, 0.045, 0.4); // quiet 16ths
}

for (let bar = 0; bar < Math.ceil(33 / (BEAT * 4)); bar++) {
  const t0 = bar * BEAT * 4;
  const chord = chordAt(t0);
  // bass: syncopated roots
  for (const [pos, oct] of [[0, 0], [3, 0], [6, 12], [8, 0], [11, 0], [14, 12]]) bass(t0 + pos * SIXTEENTH, chord.root + oct);
  // chord stabs start on the second bar
  if (bar >= 1) for (const pos of [0, 3, 6, 10, 12]) stab(t0 + pos * SIXTEENTH, chord.tri, 0.075);
  // sparkly arp from bar 3
  if (bar >= 3) {
    for (let i = 0; i < 16; i++) {
      const notes = [chord.tri[0], chord.tri[1], chord.tri[2], chord.tri[0] + 12];
      const n = notes[(i * 3) % 4] + 12;
      pluck(t0 + i * SIXTEENTH, n, i % 4 === 0 ? 0.075 : 0.05, 0.25 + 0.5 * ((i * 5) % 7) / 6);
    }
  }
}

// risers into every cut, impact on each cut
for (const c of CUTS) {
  riser(c, 0.9);
  crash(c, 0.1);
}
// final hit
const END = 33;
crash(30, 0.14);
for (const note of [57, 60, 64, 69]) stab(END - 0.001, [note], 0.12, 1.4);
kick(END, 1);
crash(END, 0.24);

// ---- master ----
let peak = 0;
for (let i = 0; i < N; i++) {
  const fade = Math.min(1, (N - i) / (SR * 0.9));
  L[i] = Math.tanh(L[i] * 1.5) * fade;
  R[i] = Math.tanh(R[i] * 1.5) * fade;
  peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
}
const gain = 0.85 / peak;
const buf = Buffer.alloc(44 + N * 4);
buf.write("RIFF", 0);
buf.writeUInt32LE(36 + N * 4, 4);
buf.write("WAVEfmt ", 8);
buf.writeUInt32LE(16, 16);
buf.writeUInt16LE(1, 20);
buf.writeUInt16LE(2, 22);
buf.writeUInt32LE(SR, 24);
buf.writeUInt32LE(SR * 4, 28);
buf.writeUInt16LE(4, 32);
buf.writeUInt16LE(16, 34);
buf.write("data", 36);
buf.writeUInt32LE(N * 4, 40);
for (let i = 0; i < N; i++) {
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * gain)) * 32767), 44 + i * 4);
  buf.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * gain)) * 32767), 46 + i * 4);
}
writeFileSync("public/music.wav", buf);
console.log("wrote public/music.wav", (buf.length / 1e6).toFixed(1) + " MB");

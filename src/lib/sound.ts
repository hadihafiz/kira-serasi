/**
 * Tiny WebAudio sound effects (no audio assets to download).
 * Everything is synthesised; only call from a user gesture so browsers allow playback.
 */
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx ??= new AC();
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

/**
 * Call from a user gesture (tap on the sound toggle / "Kira!" button).
 * iOS Safari only allows audio that was started or resumed inside a gesture; sounds fired
 * later from timers are silent unless the context was unlocked first.
 */
export function unlockAudio() {
  const c = audio();
  if (!c) return;
  // play one silent sample to fully unlock on iOS
  const buf = c.createBuffer(1, 1, c.sampleRate);
  const src = c.createBufferSource();
  src.buffer = buf;
  src.connect(c.destination);
  src.start();
}

/**
 * Pencil scratch lasting `ms`: band-passed noise shaped into a few back-and-forth strokes,
 * so its length and rhythm follow the animation it accompanies.
 */
export function playScratch(ms = 180) {
  const c = audio();
  if (!c) return;
  const dur = Math.max(0.08, ms / 1000);
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  const strokes = Math.max(1, Math.round(dur / 0.16));
  for (let i = 0; i < len; i++) {
    const p = i / len;
    const stroke = Math.abs(Math.sin(p * strokes * Math.PI)); // one hump per stroke
    const edge = Math.min(1, p * 12, (1 - p) * 12); // fade in/out to avoid clicks
    data[i] = (Math.random() * 2 - 1) * stroke * edge;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 3200;
  filter.Q.value = 0.8;
  const gain = c.createGain();
  gain.gain.value = 0.14;
  src.connect(filter).connect(gain).connect(c.destination);
  src.start();
}

/**
 * One long, continuous pencil stroke lasting `ms` (used for the red circle at the end).
 * Unlike playScratch's short back-and-forth strokes, this is a single sweep: fades in, holds
 * with a fine pencil-grain texture, and rises in pitch as the circle closes.
 */
export function playCircleScratch(ms = 900) {
  const c = audio();
  if (!c) return;
  const dur = Math.max(0.3, ms / 1000);
  const len = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) {
    const p = i / len;
    const attack = Math.min(1, p / 0.12);
    const release = Math.min(1, (1 - p) / 0.18);
    // gentle swell with a little pressure variation, no gaps (one unbroken stroke)
    const pressure = 0.75 + 0.25 * Math.sin(p * Math.PI * 1.5) + 0.08 * Math.sin(p * 37);
    data[i] = (Math.random() * 2 - 1) * attack * release * pressure;
  }
  const src = c.createBufferSource();
  src.buffer = buf;

  const now = c.currentTime;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.Q.value = 1.1;
  filter.frequency.setValueAtTime(1900, now);
  filter.frequency.linearRampToValueAtTime(3600, now + dur); // pitch rises as the circle closes

  const gain = c.createGain();
  gain.gain.value = 0.2;
  src.connect(filter).connect(gain).connect(c.destination);
  src.start(now);
}

/** Happy "ting!" for the result. */
export function playTing() {
  const c = audio();
  if (!c) return;
  const now = c.currentTime;
  [1318.5, 1976].forEach((freq, i) => {
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(i === 0 ? 0.25 : 0.1, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
    osc.connect(gain).connect(c.destination);
    osc.start(now);
    osc.stop(now + 0.95);
  });
}

/** Soft page flip: low-passed noise sweep. */
export function playFlip() {
  const c = audio();
  if (!c) return;
  const len = Math.floor(c.sampleRate * 0.25);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.sin((i / len) * Math.PI);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 1400;
  const gain = c.createGain();
  gain.gain.value = 0.1;
  src.connect(filter).connect(gain).connect(c.destination);
  src.start();
}

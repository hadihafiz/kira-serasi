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

/** Pencil scratch: short band-passed noise burst. */
export function playScratch() {
  const c = audio();
  if (!c) return;
  const len = Math.floor(c.sampleRate * 0.18);
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = 3200;
  filter.Q.value = 0.8;
  const gain = c.createGain();
  gain.gain.value = 0.12;
  src.connect(filter).connect(gain).connect(c.destination);
  src.start();
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

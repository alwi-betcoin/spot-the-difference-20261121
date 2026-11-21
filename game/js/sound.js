// sound.js — every sound in Twin Vista is synthesised with WebAudio at the
// moment it is needed. There are no audio files: a find is a two-note chime,
// a wrong click a low thud, a hint a soft shimmer, and a finished scene a
// short rising arpeggio. The context is created lazily on the first user
// gesture, which is where browsers allow sound to start.

let context = null;

function audioContext() {
  if (context === null) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  if (context.state === 'suspended') context.resume();
  return context;
}

// One soft sine tone with a quick attack and a long, quiet decay.
function tone(ctx, frequency, startAt, duration, peak = 0.16) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0, startAt);
  gain.gain.linearRampToValueAtTime(peak, startAt + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, startAt + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(startAt);
  osc.stop(startAt + duration + 0.05);
}

export function playFindChime() {
  const ctx = audioContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  tone(ctx, 1318.5, t, 0.5);        // E6
  tone(ctx, 1760.0, t + 0.07, 0.7); // A6 answers it
}

export function playWrongThud() {
  const ctx = audioContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(160, t);
  osc.frequency.exponentialRampToValueAtTime(70, t + 0.18);
  gain.gain.setValueAtTime(0.22, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.25);
}

export function playHintShimmer() {
  const ctx = audioContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  tone(ctx, 2093.0, t, 0.35, 0.08);        // C7
  tone(ctx, 2637.0, t + 0.06, 0.4, 0.07);  // E7
  tone(ctx, 3135.9, t + 0.12, 0.5, 0.06);  // G7
}

export function playSceneComplete() {
  const ctx = audioContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
  notes.forEach((f, i) => tone(ctx, f, t + i * 0.11, 0.8, 0.14));
}

export function playTimeUp() {
  const ctx = audioContext();
  if (!ctx) return;
  const t = ctx.currentTime;
  tone(ctx, 392.0, t, 0.5, 0.14);        // G4
  tone(ctx, 311.1, t + 0.22, 0.9, 0.14); // Eb4, falling away
}

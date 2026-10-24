const STORAGE_KEY = 'fireos-muted';

let muted = loadMuted();
let audioCtx = null;

function loadMuted() {
  try {
    return window.localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    // localStorage may be unavailable (blocked storage, privacy mode, etc.)
    return false;
  }
}

function saveMuted(value) {
  try {
    window.localStorage.setItem(STORAGE_KEY, String(value));
  } catch {
    // mute preference just won't persist
  }
}

function getAudioContext() {
  if (audioCtx) {
    return audioCtx;
  }
  const Ctor = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!Ctor) {
    // not in jsdom, or browser blocks it until a user gesture; caller treats null as a no-op
    return null;
  }
  audioCtx = new Ctor();
  return audioCtx;
}

// short synthesized blip (sine wave, fast attack, exponential decay), not a sample file.
// playClick/playKey use different pitches so they're distinguishable without sounding like an arcade game.
function tone(frequency, durationMs, peakGain) {
  if (muted) {
    return;
  }
  const ctx = getAudioContext();
  if (!ctx) {
    return;
  }
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.value = frequency;
  const now = ctx.currentTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(peakGain, now + 0.005);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationMs / 1000);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + durationMs / 1000 + 0.02);
}

export function playClick() {
  tone(260, 55, 0.05);
}

export function playKey() {
  tone(760, 28, 0.035);
}

export function isMuted() {
  return muted;
}

export function toggleMute() {
  muted = !muted;
  saveMuted(muted);
  return muted;
}

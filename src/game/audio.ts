// Web Audio API - aucun fichier externe.

let audioCtx: AudioContext | null = null;

function getAudioCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') void audioCtx.resume();
  return audioCtx;
}

/** À appeler suite à une interaction utilisateur pour débloquer l'audio. */
export function unlockAudio(): void {
  getAudioCtx();
}

function playTone(freq: number, duration: number, type: OscillatorType, volume = 0.2, delay = 0): void {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  osc.connect(gain);
  gain.connect(ctx.destination);
  const t0 = ctx.currentTime + delay;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export function playCorrectSound(comboLevel: number): void {
  // le son devient plus aigu à mesure que le combo grandit
  const base = 420 + Math.min(comboLevel, 20) * 35;
  playTone(base, 0.12, 'triangle', 0.22);
  playTone(base * 1.5, 0.14, 'triangle', 0.15, 0.05);
}

export function playWrongSound(): void {
  // son de "dégonflement" rigolo, non punitif
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  const t0 = ctx.currentTime;
  osc.frequency.setValueAtTime(320, t0);
  osc.frequency.exponentialRampToValueAtTime(90, t0 + 0.35);
  gain.gain.setValueAtTime(0.16, t0);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.35);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + 0.36);
}

export function playBonusSound(): void {
  playTone(700, 0.1, 'square', 0.18, 0);
  playTone(900, 0.12, 'square', 0.18, 0.09);
  playTone(1200, 0.15, 'square', 0.18, 0.18);
}

export function playRecordFanfare(): void {
  const notes = [523, 659, 784, 1046];
  notes.forEach((f, i) => playTone(f, 0.2, 'triangle', 0.22, i * 0.13));
}

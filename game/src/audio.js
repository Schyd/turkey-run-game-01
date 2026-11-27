// Gobble Dash — all sound, synthesized with WebAudio.
// One job: bleeps, gobbles and stings. No audio files, no network.

export class SoundBank {
  constructor() {
    this.context = null;
    this.muted = false;
  }

  // Browsers only allow audio after a user gesture; create lazily.
  ensure() {
    if (!this.context) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return false;
      this.context = new AudioContext();
    }
    if (this.context.state === 'suspended') void this.context.resume();
    return true;
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  tone(freqStart, freqEnd, seconds, type, volume, delay = 0) {
    if (this.muted || !this.ensure()) return;
    const ctx = this.context;
    const t0 = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freqStart, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t0 + seconds);
    gain.gain.setValueAtTime(volume, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + seconds);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t0);
    osc.stop(t0 + seconds + 0.02);
  }

  jump() {
    this.tone(280, 620, 0.16, 'sine', 0.16);
  }

  dash() {
    this.tone(500, 900, 0.12, 'sawtooth', 0.07);
  }

  pickupCorn() {
    this.tone(660, 660, 0.07, 'triangle', 0.14);
    this.tone(990, 990, 0.09, 'triangle', 0.14, 0.07);
  }

  pickupPie() {
    this.tone(523, 523, 0.08, 'triangle', 0.15);
    this.tone(659, 659, 0.08, 'triangle', 0.15, 0.08);
    this.tone(784, 784, 0.12, 'triangle', 0.15, 0.16);
  }

  feather() {
    this.tone(880, 1320, 0.18, 'sine', 0.14);
  }

  hit() {
    this.tone(180, 60, 0.3, 'sawtooth', 0.2);
  }

  // The turkey's panicked gobble: three wobbling quacks.
  gobble() {
    for (let i = 0; i < 3; i += 1) {
      this.tone(340 - i * 40, 180, 0.11, 'square', 0.09, i * 0.11);
    }
  }

  spotted() {
    this.tone(220, 440, 0.18, 'square', 0.1);
    this.tone(440, 440, 0.1, 'square', 0.1, 0.18);
  }

  stageClear() {
    this.tone(523, 523, 0.1, 'triangle', 0.15);
    this.tone(659, 659, 0.1, 'triangle', 0.15, 0.1);
    this.tone(784, 784, 0.16, 'triangle', 0.15, 0.2);
  }

  caught() {
    this.tone(392, 392, 0.22, 'sawtooth', 0.16);
    this.tone(311, 311, 0.22, 'sawtooth', 0.16, 0.22);
    this.tone(233, 110, 0.5, 'sawtooth', 0.18, 0.44);
  }

  escaped() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((n, i) => this.tone(n, n, 0.18, 'triangle', 0.16, i * 0.13));
    this.tone(1319, 1319, 0.4, 'triangle', 0.16, 0.55);
  }
}

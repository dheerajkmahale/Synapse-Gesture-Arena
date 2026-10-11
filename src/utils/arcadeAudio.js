/**
 * Web Audio API Synthesizer for Synapse Gesture Arena Arcade Game
 * Pure client-side procedural sound generation without external audio files.
 */

class ArcadeAudioEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  init() {
    if (!this.ctx && typeof window !== "undefined") {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }
  }

  setMuted(muted) {
    this.muted = muted;
  }

  playTone(freq, duration = 0.1, type = "sine", volume = 0.15) {
    if (this.muted) return;
    try {
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {}
  }

  catch() {
    this.playTone(880, 0.08, "triangle", 0.18);
  }

  bonus() {
    this.playTone(660, 0.08, "square", 0.15);
    setTimeout(() => this.playTone(990, 0.12, "square", 0.15), 70);
  }

  miss() {
    this.playTone(180, 0.12, "sawtooth", 0.1);
  }

  tick() {
    this.playTone(1200, 0.05, "square", 0.2);
  }

  death() {
    this.playTone(120, 0.4, "sawtooth", 0.25);
    setTimeout(() => this.playTone(80, 0.6, "sawtooth", 0.2), 200);
  }

  highScore() {
    const notes = [523, 659, 784, 1046];
    notes.forEach((freq, idx) => {
      setTimeout(() => this.playTone(freq, 0.18, "triangle", 0.2), idx * 110);
    });
  }

  start() {
    this.playTone(440, 0.1, "triangle", 0.18);
    setTimeout(() => this.playTone(880, 0.15, "triangle", 0.18), 80);
  }
}

export const arcadeAudio = new ArcadeAudioEngine();

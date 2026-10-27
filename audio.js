/**
 * Web Audio API Sound Synthesizer
 * Produces crisp, zero-latency retro sound effects without external audio files!
 */
class SoundManager {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem('officesim_muted') === 'true';
    this.initialized = false;
    this.ambientGain = null;
    this.lastFootstepTime = 0;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.muted ? 0 : 0.4;
      this.masterGain.connect(this.ctx.destination);
      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio not supported:', e);
    }
  }

  unlock() {
    if (!this.ctx) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.unlock();
    this.muted = !this.muted;
    localStorage.setItem('officesim_muted', this.muted);
    if (this.masterGain) {
      this.masterGain.gain.setValueAtTime(this.muted ? 0 : 0.4, this.ctx.currentTime);
    }
    return this.muted;
  }

  // --- FOOTSTEP ---
  playFootstep(isTile = false) {
    if (this.muted || !this.ctx) return;
    const now = performance.now();
    if (now - this.lastFootstepTime < 240) return; // limit step rate
    this.lastFootstepTime = now;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      // Pitch variation for natural walking
      const baseFreq = isTile ? 220 + Math.random() * 40 : 140 + Math.random() * 30;
      osc.type = isTile ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, t + 0.06);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(isTile ? 800 : 450, t);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(t);
      osc.stop(t + 0.07);
    } catch (e) {}
  }

  // --- DOOR OPEN (Creak + Latch) ---
  playDoorOpen() {
    if (this.muted || !this.ctx) return;
    this.unlock();
    try {
      const t = this.ctx.currentTime;
      // 1. Latch click
      const click = this.ctx.createOscillator();
      const clickGain = this.ctx.createGain();
      click.type = 'square';
      click.frequency.setValueAtTime(950, t);
      click.frequency.exponentialRampToValueAtTime(320, t + 0.04);
      clickGain.gain.setValueAtTime(0.2, t);
      clickGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);
      click.connect(clickGain);
      clickGain.connect(this.masterGain);
      click.start(t);
      click.stop(t + 0.05);

      // 2. Door Creak (frequency sweep with slight vibrato)
      const creak = this.ctx.createOscillator();
      const creakGain = this.ctx.createGain();
      creak.type = 'sawtooth';
      creak.frequency.setValueAtTime(160, t + 0.04);
      creak.frequency.linearRampToValueAtTime(380, t + 0.28);
      creak.frequency.exponentialRampToValueAtTime(180, t + 0.45);

      // Filter for wooden acoustic resonance
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(450, t + 0.04);
      filter.Q.value = 4.0;

      creakGain.gain.setValueAtTime(0.001, t + 0.04);
      creakGain.gain.linearRampToValueAtTime(0.22, t + 0.15);
      creakGain.gain.exponentialRampToValueAtTime(0.001, t + 0.46);

      creak.connect(filter);
      filter.connect(creakGain);
      creakGain.connect(this.masterGain);

      creak.start(t + 0.04);
      creak.stop(t + 0.48);
    } catch (e) {}
  }

  // --- DOOR CLOSE ---
  playDoorClose() {
    if (this.muted || !this.ctx) return;
    this.unlock();
    try {
      const t = this.ctx.currentTime;
      // Low wooden thud
      const thud = this.ctx.createOscillator();
      const thudGain = this.ctx.createGain();
      thud.type = 'sine';
      thud.frequency.setValueAtTime(110, t);
      thud.frequency.exponentialRampToValueAtTime(40, t + 0.15);
      thudGain.gain.setValueAtTime(0.35, t);
      thudGain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      thud.connect(thudGain);
      thudGain.connect(this.masterGain);
      thud.start(t);
      thud.stop(t + 0.18);

      // Latch snap
      const snap = this.ctx.createOscillator();
      const snapGain = this.ctx.createGain();
      snap.type = 'triangle';
      snap.frequency.setValueAtTime(1200, t + 0.02);
      snap.frequency.exponentialRampToValueAtTime(200, t + 0.06);
      snapGain.gain.setValueAtTime(0.18, t + 0.02);
      snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

      snap.connect(snapGain);
      snapGain.connect(this.masterGain);
      snap.start(t + 0.02);
      snap.stop(t + 0.08);
    } catch (e) {}
  }

  // --- RETRO DIALOGUE TYPEWRITER BLIP ---
  playDialogueBlip(speaker = 'boss') {
    if (this.muted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = speaker === 'boss' ? 120 + Math.random() * 35 : 340 + Math.random() * 60;
      osc.type = speaker === 'boss' ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(baseFreq, t);

      gain.gain.setValueAtTime(0.06, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.04);
    } catch (e) {}
  }

  // --- INTERACTION CHIME ---
  playInteract() {
    if (this.muted || !this.ctx) return;
    this.unlock();
    try {
      const t = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
      notes.forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.06);

        gain.gain.setValueAtTime(0.12, t + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.06 + 0.14);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t + i * 0.06);
        osc.stop(t + i * 0.06 + 0.16);
      });
    } catch (e) {}
  }

  // --- WATER DISPENSER SOUND ---
  playWater() {
    if (this.muted || !this.ctx) return;
    this.unlock();
    try {
      const t = this.ctx.currentTime;
      // Bubble 1
      const osc1 = this.ctx.createOscillator();
      const g1 = this.ctx.createGain();
      osc1.frequency.setValueAtTime(420, t);
      osc1.frequency.exponentialRampToValueAtTime(780, t + 0.12);
      g1.gain.setValueAtTime(0.18, t);
      g1.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc1.connect(g1);
      g1.connect(this.masterGain);
      osc1.start(t);
      osc1.stop(t + 0.15);

      // Bubble 2
      const osc2 = this.ctx.createOscillator();
      const g2 = this.ctx.createGain();
      osc2.frequency.setValueAtTime(360, t + 0.12);
      osc2.frequency.exponentialRampToValueAtTime(690, t + 0.25);
      g2.gain.setValueAtTime(0.16, t + 0.12);
      g2.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc2.connect(g2);
      g2.connect(this.masterGain);
      osc2.start(t + 0.12);
      osc2.stop(t + 0.3);
    } catch (e) {}
  }

  // --- RETRO RPG QUEST VICTORY FANFARE ---
  playQuestComplete() {
    if (this.muted || !this.ctx) return;
    this.unlock();
    try {
      const t = this.ctx.currentTime;
      const notes = [261.63, 329.63, 392.00, 523.25, 659.25];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.1);
        gain.gain.setValueAtTime(0.25, t + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t + idx * 0.1);
        osc.stop(t + idx * 0.1 + 0.4);
      });
    } catch (e) {}
  }

  // --- RETRO PAGER CHAT BEEP ---
  playPagerBeep() {
    if (this.muted || !this.ctx) return;
    this.unlock();
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.setValueAtTime(1760, t + 0.06);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.15);
    } catch (e) {}
  }
}

window.soundManager = new SoundManager();

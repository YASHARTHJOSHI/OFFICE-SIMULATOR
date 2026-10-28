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

  // --- WINDOWS OS SOUND SYNTHESIZER ---
  playWindowsStartup() {
    if (this.muted || !this.ctx) return;
    this.unlock();
    try {
      const t = this.ctx.currentTime;
      // Classic uplifting 5-note chime: Eb4 -> Bb4 -> G4 -> Eb5 -> Bb5
      const notes = [
        { f: 311.13, delay: 0.0, dur: 1.4, vol: 0.18 }, // Eb4
        { f: 466.16, delay: 0.18, dur: 1.5, vol: 0.22 }, // Bb4
        { f: 392.00, delay: 0.38, dur: 1.6, vol: 0.20 }, // G4
        { f: 622.25, delay: 0.62, dur: 2.0, vol: 0.25 }, // Eb5
        { f: 932.33, delay: 0.85, dur: 2.2, vol: 0.22 }  // Bb5
      ];
      notes.forEach(n => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, t + n.delay);
        gain.gain.setValueAtTime(0.001, t + n.delay);
        gain.gain.linearRampToValueAtTime(n.vol, t + n.delay + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + n.delay + n.dur);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t + n.delay);
        osc.stop(t + n.delay + n.dur + 0.1);
      });
    } catch (e) {}
  }

  playWindowsClick() {
    if (this.muted || !this.ctx) return;
    this.unlock();
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 0.03);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.04);
    } catch (e) {}
  }

  playWindowsError() {
    if (this.muted || !this.ctx) return;
    this.unlock();
    try {
      const t = this.ctx.currentTime;
      // Classic Windows "ding" chord
      [523.25, 659.25, 783.99].forEach(f => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.12, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t);
        osc.stop(t + 0.5);
      });
    } catch (e) {}
  }

  playWindowsNotify() {
    if (this.muted || !this.ctx) return;
    this.unlock();
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, t); // D5
      osc.frequency.setValueAtTime(880.00, t + 0.09); // A5
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.3);
    } catch (e) {}
  }

  // --- SMARTPHONE NOTIFICATION POP CHIME ---
  playPhonePop() {
    this.playNotificationPop();
  }

  playNotificationPop() {
    if (this.muted || !this.ctx) return;
    this.unlock();
    try {
      const t = this.ctx.currentTime;

      // 1. Crisp droplet "pop" transient: rapid downward resonant sweep (1950Hz -> 620Hz in 45ms)
      const popOsc = this.ctx.createOscillator();
      const popGain = this.ctx.createGain();
      popOsc.type = 'sine';
      popOsc.frequency.setValueAtTime(1950, t);
      popOsc.frequency.exponentialRampToValueAtTime(620, t + 0.045);
      popGain.gain.setValueAtTime(0.26, t);
      popGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      popOsc.connect(popGain);
      popGain.connect(this.masterGain);
      popOsc.start(t);
      popOsc.stop(t + 0.06);

      // 2. Harmonic chord: D5 (587.3Hz) -> A5 (880Hz) -> D6 (1174.6Hz)
      const chord = [
        { f: 587.33, delay: 0.035, dur: 0.28, vol: 0.16 },
        { f: 880.00, delay: 0.075, dur: 0.35, vol: 0.22 },
        { f: 1174.66, delay: 0.125, dur: 0.42, vol: 0.25 }
      ];
      chord.forEach(n => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, t + n.delay);
        gain.gain.setValueAtTime(0.001, t + n.delay);
        gain.gain.linearRampToValueAtTime(n.vol, t + n.delay + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + n.delay + n.dur);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t + n.delay);
        osc.stop(t + n.delay + n.dur + 0.05);
      });
    } catch (e) {}
  }

  // --- RETRO COIN / MONEY REWARD SOUND ---
  playCoinReward() {
    if (this.muted || !this.ctx) return;
    this.unlock();
    try {
      const t = this.ctx.currentTime;
      // Twin coin pickup bell: B5 (987.77Hz) -> E6 (1318.51Hz)
      const coinNotes = [
        { f: 987.77, delay: 0.0, dur: 0.12, vol: 0.28 },
        { f: 1318.51, delay: 0.08, dur: 0.35, vol: 0.32 }
      ];
      coinNotes.forEach(n => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, t + n.delay);
        gain.gain.setValueAtTime(0.001, t + n.delay);
        gain.gain.linearRampToValueAtTime(n.vol, t + n.delay + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + n.delay + n.dur);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t + n.delay);
        osc.stop(t + n.delay + n.dur + 0.04);
      });
    } catch (e) {}
  }
  // --- ESPRESSO STREAM AUDIO ---
  startCoffeePour() {
    if (this.muted || !this.ctx) return;
    this.unlock();
    this.stopCoffeePour();

    try {
      const now = this.ctx.currentTime;
      // 1. Noise buffer for streaming hot liquid and high-pressure steam
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        output[i] = (b0 + b1 + b2 + white * 0.5362) * 0.28;
      }

      this.coffeeNoiseNode = this.ctx.createBufferSource();
      this.coffeeNoiseNode.buffer = noiseBuffer;
      this.coffeeNoiseNode.loop = true;

      // Resonant bandpass filter (pitch rises smoothly as cup fills with liquid)
      this.coffeeFilter = this.ctx.createBiquadFilter();
      this.coffeeFilter.type = 'bandpass';
      this.coffeeFilter.frequency.setValueAtTime(540, now);
      this.coffeeFilter.Q.setValueAtTime(4.2, now);

      // Low mechanical pump rumble (52Hz)
      this.coffeePumpOsc = this.ctx.createOscillator();
      this.coffeePumpOsc.type = 'triangle';
      this.coffeePumpOsc.frequency.setValueAtTime(52, now);
      this.coffeePumpGain = this.ctx.createGain();
      this.coffeePumpGain.gain.setValueAtTime(0.04, now);
      this.coffeePumpOsc.connect(this.coffeePumpGain);

      // Bubbling trickle modulation (13Hz flutter)
      this.coffeeLFO = this.ctx.createOscillator();
      this.coffeeLFO.type = 'sine';
      this.coffeeLFO.frequency.setValueAtTime(13, now);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(110, now);
      this.coffeeLFO.connect(lfoGain);
      lfoGain.connect(this.coffeeFilter.frequency);

      // Master pour gain
      this.coffeeGain = this.ctx.createGain();
      this.coffeeGain.gain.setValueAtTime(0.001, now);
      this.coffeeGain.gain.linearRampToValueAtTime(0.24, now + 0.1);

      this.coffeeNoiseNode.connect(this.coffeeFilter);
      this.coffeeFilter.connect(this.coffeeGain);
      this.coffeePumpGain.connect(this.coffeeGain);
      this.coffeeGain.connect(this.masterGain);

      this.coffeeNoiseNode.start(now);
      this.coffeePumpOsc.start(now);
      this.coffeeLFO.start(now);
      this.isCoffeePouring = true;
    } catch (e) {
      console.warn('Coffee sound error:', e);
    }
  }

  updateCoffeePourPitch(fillPercent) {
    if (!this.isCoffeePouring || !this.coffeeFilter || !this.ctx) return;
    try {
      const freq = 540 + (Math.min(100, Math.max(0, fillPercent)) / 100) * 580;
      this.coffeeFilter.frequency.setTargetAtTime(freq, this.ctx.currentTime, 0.05);
    } catch (e) {}
  }

  stopCoffeePour() {
    if (!this.isCoffeePouring) return;
    this.isCoffeePouring = false;
    try {
      if (this.coffeeGain && this.ctx) {
        const now = this.ctx.currentTime;
        this.coffeeGain.gain.setValueAtTime(this.coffeeGain.gain.value, now);
        this.coffeeGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
      }
      setTimeout(() => {
        try {
          if (this.coffeeNoiseNode) { this.coffeeNoiseNode.stop(); this.coffeeNoiseNode.disconnect(); }
          if (this.coffeePumpOsc) { this.coffeePumpOsc.stop(); this.coffeePumpOsc.disconnect(); }
          if (this.coffeeLFO) { this.coffeeLFO.stop(); this.coffeeLFO.disconnect(); }
        } catch (e) {}
      }, 160);
    } catch (e) {}
  }

  // --- COFFEE READY DING / CHIME ---
  playCoffeeReady() {
    if (this.muted || !this.ctx) return;
    this.unlock();
    try {
      const t = this.ctx.currentTime;
      const chimes = [
        { f: 739.99, delay: 0.0, dur: 0.55, vol: 0.24 },
        { f: 1108.73, delay: 0.08, dur: 0.75, vol: 0.28 }
      ];
      chimes.forEach(c => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(c.f, t + c.delay);
        gain.gain.setValueAtTime(0.001, t + c.delay);
        gain.gain.linearRampToValueAtTime(c.vol, t + c.delay + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + c.delay + c.dur);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t + c.delay);
        osc.stop(t + c.delay + c.dur + 0.05);
      });
    } catch (e) {}
  }

  // --- COFFEE DRINK / GULP SOUND ---
  playCoffeeDrink() {
    if (this.muted || !this.ctx) return;
    this.unlock();
    try {
      const t = this.ctx.currentTime;
      // Two gulp swallow sounds
      [0.0, 0.22].forEach((delay, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260 - idx * 25, t + delay);
        osc.frequency.exponentialRampToValueAtTime(140 - idx * 20, t + delay + 0.12);
        gain.gain.setValueAtTime(0.001, t + delay);
        gain.gain.linearRampToValueAtTime(0.26, t + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + delay + 0.14);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t + delay);
        osc.stop(t + delay + 0.15);
      });

      // Refreshing sparkle chime
      const sparkle = [1046.5, 1318.5, 1567.98, 2093.0];
      sparkle.forEach((f, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t + 0.38 + i * 0.06);
        gain.gain.setValueAtTime(0.001, t + 0.38 + i * 0.06);
        gain.gain.linearRampToValueAtTime(0.14, t + 0.38 + i * 0.06 + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.38 + i * 0.06 + 0.22);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t + 0.38 + i * 0.06);
        osc.stop(t + 0.38 + i * 0.06 + 0.25);
      });
    } catch (e) {}
  }

  // --- HOLOGRAPHIC BLUEPRINT MAP OPEN SOUND ---
  playMapOpen() {
    if (this.muted || !this.ctx) return;
    this.unlock();
    try {
      const t = this.ctx.currentTime;
      // High-tech rising holographic chime (3-tone electronic sonar ping)
      const tones = [523.25, 783.99, 1046.5]; // C5, G5, C6
      tones.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + idx * 0.05);
        gain.gain.setValueAtTime(0.001, t + idx * 0.05);
        gain.gain.linearRampToValueAtTime(0.18, t + idx * 0.05 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + idx * 0.05 + 0.22);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(t + idx * 0.05);
        osc.stop(t + idx * 0.05 + 0.25);
      });

      // Electronic scanner sweep
      const sweep = this.ctx.createOscillator();
      const sweepGain = this.ctx.createGain();
      sweep.type = 'triangle';
      sweep.frequency.setValueAtTime(320, t);
      sweep.frequency.exponentialRampToValueAtTime(1400, t + 0.18);
      sweepGain.gain.setValueAtTime(0.06, t);
      sweepGain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      sweep.connect(sweepGain);
      sweepGain.connect(this.masterGain);
      sweep.start(t);
      sweep.stop(t + 0.22);
    } catch (e) {}
  }

  // --- HOLOGRAPHIC BLUEPRINT MAP CLOSE SOUND ---
  playMapClose() {
    if (this.muted || !this.ctx) return;
    this.unlock();
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, t);
      osc.frequency.exponentialRampToValueAtTime(330, t + 0.14);
      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 0.16);
    } catch (e) {}
  }
}

window.soundManager = new SoundManager();

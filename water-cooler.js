// ====================================================================
// WATER-COOLER.JS
// Interactive Water Cooler Precision Filling Minigame
// Player must press and hold to dispense water and stop exactly on the target mark.
// ====================================================================

(function() {
  'use strict';

  class WaterCoolerGame {
    constructor() {
      this.isOpen = false;
      this.isDispensing = false;
      this.currentLevel = 0; // 0 to 100
      this.targetLevel = 70; // 0 to 100
      this.tolerance = 3.8;  // +/- tolerance percentage for perfect match
      this.fillRate = 28;    // percentage per second (~3.5s for full glass)
      this.gameStatus = 'ready'; // 'ready', 'filling', 'success', 'mismatch'
      this.lastTimestamp = 0;
      this.animId = null;

      // Audio state
      this.audioStreamNode = null;
      this.audioStreamGain = null;
      this.audioFilter = null;

      this.init();
    }

    init() {
      // DOM elements cache
      this.modal = document.getElementById('water-cooler-modal');
      this.waterLevelEl = document.getElementById('wc-water-fill');
      this.waterStreamEl = document.getElementById('wc-water-stream');
      this.targetLineEl = document.getElementById('wc-target-line');
      this.targetBadgeEl = document.getElementById('wc-target-badge');
      this.fillPercentEl = document.getElementById('wc-fill-percent');
      this.statusBanner = document.getElementById('wc-status-banner');
      this.statusTitle = document.getElementById('wc-status-title');
      this.statusDesc = document.getElementById('wc-status-desc');
      this.dispenseBtn = document.getElementById('wc-dispense-btn');
      this.actionsContainer = document.getElementById('wc-result-actions');
      this.tryAgainBtn = document.getElementById('wc-btn-try-again');
      this.exitBtn = document.getElementById('wc-btn-exit');
      this.closeModalBtn = document.getElementById('wc-btn-close-modal');
      this.bottleBubbles = document.getElementById('wc-bottle-bubbles');

      if (!this.modal) return;

      this.setupEvents();
    }

    setupEvents() {
      // Close button
      if (this.closeModalBtn) {
        this.closeModalBtn.addEventListener('click', () => this.close());
      }
      if (this.exitBtn) {
        this.exitBtn.addEventListener('click', () => this.close());
      }
      if (this.tryAgainBtn) {
        this.tryAgainBtn.addEventListener('click', () => this.reset(true));
      }

      // Dispense Button Mouse / Touch
      if (this.dispenseBtn) {
        const startHandler = (e) => {
          e.preventDefault();
          if (this.gameStatus === 'ready') {
            this.startDispensing();
          }
        };

        const stopHandler = (e) => {
          e.preventDefault();
          if (this.isDispensing) {
            this.stopDispensing();
          }
        };

        this.dispenseBtn.addEventListener('mousedown', startHandler);
        window.addEventListener('mouseup', stopHandler);

        this.dispenseBtn.addEventListener('touchstart', startHandler, { passive: false });
        window.addEventListener('touchend', stopHandler, { passive: false });
      }

      // Keyboard Controls (Space, E, Enter to dispense; ESC to exit)
      window.addEventListener('keydown', (e) => {
        if (!this.isOpen) return;

        const k = (e.key || '').toLowerCase();
        if (k === 'escape') {
          e.preventDefault();
          this.close();
          return;
        }

        if (this.gameStatus === 'ready' && !this.isDispensing) {
          if (k === 'e' || k === ' ' || k === 'enter' || e.code === 'KeyE' || e.code === 'Space') {
            e.preventDefault();
            this.startDispensing();
          }
        }
      });

      window.addEventListener('keyup', (e) => {
        if (!this.isOpen) return;

        const k = (e.key || '').toLowerCase();
        if (this.isDispensing) {
          if (k === 'e' || k === ' ' || k === 'enter' || e.code === 'KeyE' || e.code === 'Space') {
            e.preventDefault();
            this.stopDispensing();
          }
        }
      });
    }

    open() {
      this.isOpen = true;
      if (this.modal) {
        this.modal.classList.remove('hidden');
      }

      // Unlock sound manager if available
      if (window.soundManager && typeof window.soundManager.unlock === 'function') {
        window.soundManager.unlock();
      }

      this.reset(true);
    }

    close() {
      this.stopDispensingAudio();
      this.isOpen = false;
      this.isDispensing = false;
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
      if (this.modal) {
        this.modal.classList.add('hidden');
      }

      // Refocus game canvas for seamless controls
      const canvas = document.getElementById('game-canvas');
      if (canvas) canvas.focus();
    }

    reset(newTarget = true) {
      this.isDispensing = false;
      this.currentLevel = 0;
      this.gameStatus = 'ready';
      this.stopDispensingAudio();

      if (newTarget) {
        // Pick a target level between 52% and 86%
        this.targetLevel = Math.floor(52 + Math.random() * 34);
      }

      // Update Target Line position
      if (this.targetLineEl) {
        this.targetLineEl.style.bottom = `${this.targetLevel}%`;
        this.targetLineEl.classList.remove('success', 'mismatch');
      }
      if (this.targetBadgeEl) {
        this.targetBadgeEl.textContent = `TARGET: ${this.targetLevel}%`;
      }

      // Reset Water Fill visual
      if (this.waterLevelEl) {
        this.waterLevelEl.style.height = '0%';
        this.waterLevelEl.classList.remove('success', 'overflow');
      }
      if (this.waterStreamEl) {
        this.waterStreamEl.classList.remove('active');
      }
      if (this.fillPercentEl) {
        this.fillPercentEl.textContent = '0%';
        this.fillPercentEl.classList.remove('success', 'mismatch');
      }

      // Reset Status Banners & Actions
      if (this.statusBanner) {
        this.statusBanner.className = 'wc-status-banner ready';
      }
      if (this.statusTitle) {
        this.statusTitle.textContent = 'FILL THE GLASS';
      }
      if (this.statusDesc) {
        this.statusDesc.textContent = 'Press and HOLD to pour water. Release exactly on the marked level!';
      }

      if (this.dispenseBtn) {
        this.dispenseBtn.disabled = false;
        this.dispenseBtn.classList.remove('active');
        this.dispenseBtn.innerHTML = `
          <span class="btn-ripple"></span>
          <span class="wc-btn-icon">💧</span>
          <span class="wc-btn-text">HOLD TO DISPENSE</span>
          <small class="wc-btn-sub">[Space / E / Click]</small>
        `;
      }

      if (this.actionsContainer) {
        this.actionsContainer.classList.add('hidden');
      }
    }

    startDispensing() {
      if (this.gameStatus !== 'ready' || this.isDispensing) return;

      this.isDispensing = true;
      this.gameStatus = 'filling';
      this.lastTimestamp = performance.now();

      if (this.dispenseBtn) {
        this.dispenseBtn.classList.add('active');
      }
      if (this.waterStreamEl) {
        this.waterStreamEl.classList.add('active');
      }
      if (this.bottleBubbles) {
        this.bottleBubbles.classList.add('active');
      }

      this.startDispensingAudio();

      this.animId = requestAnimationFrame((t) => this.updateLoop(t));
    }

    stopDispensing() {
      if (!this.isDispensing) return;

      this.isDispensing = false;
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }

      if (this.dispenseBtn) {
        this.dispenseBtn.classList.remove('active');
        this.dispenseBtn.disabled = true;
      }
      if (this.waterStreamEl) {
        this.waterStreamEl.classList.remove('active');
      }
      if (this.bottleBubbles) {
        this.bottleBubbles.classList.remove('active');
      }

      this.stopDispensingAudio();
      this.evaluateFill();
    }

    updateLoop(timestamp) {
      if (!this.isDispensing) return;

      const dt = Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
      this.lastTimestamp = timestamp;

      // Increase water level
      this.currentLevel += this.fillRate * dt;

      // Update audio frequency as cup fills up!
      this.updateAudioPitch(this.currentLevel);

      // Max overflow limit at 108%
      if (this.currentLevel >= 105) {
        this.currentLevel = 105;
        this.renderWater();
        this.stopDispensing();
        return;
      }

      this.renderWater();
      this.animId = requestAnimationFrame((t) => this.updateLoop(t));
    }

    renderWater() {
      if (this.waterLevelEl) {
        this.waterLevelEl.style.height = `${Math.min(100, this.currentLevel)}%`;
      }
      if (this.fillPercentEl) {
        this.fillPercentEl.textContent = `${Math.round(this.currentLevel)}%`;
      }
    }

    evaluateFill() {
      const diff = Math.abs(this.currentLevel - this.targetLevel);
      const isPerfect = diff <= this.tolerance;

      if (isPerfect) {
        this.handleSuccess();
      } else {
        this.handleMismatch(this.currentLevel < this.targetLevel);
      }
    }

    handleSuccess() {
      this.gameStatus = 'success';

      if (this.targetLineEl) {
        this.targetLineEl.classList.add('success');
      }
      if (this.waterLevelEl) {
        this.waterLevelEl.classList.add('success');
      }
      if (this.fillPercentEl) {
        this.fillPercentEl.classList.add('success');
      }

      if (this.statusBanner) {
        this.statusBanner.className = 'wc-status-banner success';
      }
      if (this.statusTitle) {
        this.statusTitle.textContent = 'PERFECT FILL! 🎯💧';
      }
      if (this.statusDesc) {
        this.statusDesc.textContent = `Spot on! You stopped right at ${Math.round(this.currentLevel)}% (Target was ${this.targetLevel}%). Hydration 100%!`;
      }

      // Play Victory Audio Fanfare
      if (window.soundManager && typeof window.soundManager.playQuestComplete === 'function') {
        window.soundManager.playQuestComplete();
      }

      // Award Money & Update HUD
      if (typeof window.awardPlayerMoney === 'function') {
        window.awardPlayerMoney(75, 'Pure Precision Hydration Stipend');
      } else if (typeof window.playerMoney === 'number') {
        window.playerMoney += 75;
        const hudEl = document.getElementById('hud-money-val');
        if (hudEl) hudEl.textContent = `$${window.playerMoney.toLocaleString()}`;
      }

      // Show toast
      if (typeof window.showToast === 'function') {
        window.showToast('🧊 Pure glacial water! Stamina 100% restored & earned +$75!');
      }

      // Reveal Try Again & Exit options
      if (this.actionsContainer) {
        this.actionsContainer.classList.remove('hidden');
      }
      if (this.tryAgainBtn) {
        this.tryAgainBtn.textContent = 'Fill Another Cup 💧';
      }
      if (this.exitBtn) {
        this.exitBtn.textContent = 'Drink & Exit 🚶';
      }
    }

    handleMismatch(isUnder) {
      this.gameStatus = 'mismatch';

      if (this.targetLineEl) {
        this.targetLineEl.classList.add('mismatch');
      }
      if (this.fillPercentEl) {
        this.fillPercentEl.classList.add('mismatch');
      }

      if (this.statusBanner) {
        this.statusBanner.className = 'wc-status-banner mismatch';
      }

      if (isUnder) {
        if (this.statusTitle) this.statusTitle.textContent = 'MISMATCH: UNDERFILLED! ⚠️';
        if (this.statusDesc) this.statusDesc.textContent = `You stopped at ${Math.round(this.currentLevel)}%, below the target mark of ${this.targetLevel}%.`;
      } else {
        if (this.statusTitle) this.statusTitle.textContent = 'MISMATCH: OVERFLOW! 💦';
        if (this.statusDesc) this.statusDesc.textContent = `You overfilled to ${Math.round(this.currentLevel)}%! Water spilled past the mark of ${this.targetLevel}%.`;
        if (this.waterLevelEl) this.waterLevelEl.classList.add('overflow');
      }

      // Play gentle spill/buzz error
      this.playErrorSound();

      // Show Try Again and Exit options (As explicitly requested by user)
      if (this.actionsContainer) {
        this.actionsContainer.classList.remove('hidden');
      }
      if (this.tryAgainBtn) {
        this.tryAgainBtn.textContent = 'Try Again 🔄';
      }
      if (this.exitBtn) {
        this.exitBtn.textContent = 'Exit 🚪';
      }
    }

    // ==========================================
    // PROCEDURAL AUDIO SYNTHESIZER
    // ==========================================
    startDispensingAudio() {
      const sm = window.soundManager;
      if (!sm || sm.muted || !sm.ctx) return;

      try {
        const ctx = sm.ctx;
        const now = ctx.currentTime;

        // White noise buffer for water turbulence
        const bufferSize = ctx.sampleRate * 2;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        // Bandpass filter centered on liquid stream frequency
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(650, now);
        filter.Q.setValueAtTime(3.5, now);

        // Low bubble sub-oscillator
        const subOsc = ctx.createOscillator();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(180, now);

        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.08, now);
        subOsc.connect(subGain);

        // Master stream gain
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.001, now);
        gain.gain.exponentialRampToValueAtTime(0.2, now + 0.08);

        whiteNoise.connect(filter);
        filter.connect(gain);
        subGain.connect(gain);
        gain.connect(sm.masterGain);

        whiteNoise.start(now);
        subOsc.start(now);

        this.audioStreamNode = { whiteNoise, subOsc };
        this.audioStreamGain = gain;
        this.audioFilter = filter;
      } catch (e) {
        console.warn('Water audio stream error:', e);
      }
    }

    updateAudioPitch(level) {
      if (!this.audioFilter || !window.soundManager || !window.soundManager.ctx) return;
      try {
        const ctx = window.soundManager.ctx;
        // Frequency rises smoothly from 650Hz to 1400Hz as the glass fills!
        const targetFreq = 650 + (level / 100) * 850;
        this.audioFilter.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.05);
      } catch (e) {}
    }

    stopDispensingAudio() {
      if (this.audioStreamGain && window.soundManager && window.soundManager.ctx) {
        try {
          const now = window.soundManager.ctx.currentTime;
          this.audioStreamGain.gain.setValueAtTime(this.audioStreamGain.gain.value, now);
          this.audioStreamGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
          setTimeout(() => {
            if (this.audioStreamNode) {
              try {
                this.audioStreamNode.whiteNoise.stop();
                this.audioStreamNode.subOsc.stop();
              } catch (e) {}
              this.audioStreamNode = null;
            }
          }, 90);
        } catch (e) {}
      }
    }

    playErrorSound() {
      const sm = window.soundManager;
      if (!sm || sm.muted || !sm.ctx) return;
      try {
        const ctx = sm.ctx;
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(85, now + 0.28);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(sm.masterGain);
        osc.start(now);
        osc.stop(now + 0.32);
      } catch (e) {}
    }
  }

  // Instantiate and expose globally
  window.waterCoolerGame = new WaterCoolerGame();
})();

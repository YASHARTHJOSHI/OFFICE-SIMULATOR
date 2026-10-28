// ====================================================================
// COFFEE-MACHINE.JS
// Interactive Espresso Machine Mini-game & Cafeteria Queuing System
// Realistic bean-to-cup espresso dispensing, audio synthesis, and NPC queue
// ====================================================================

(function() {
  'use strict';

  // ==================================================================
  // 1. ESPRESSO MACHINE INTERACTIVE MODAL & BREWING GAME
  // ==================================================================
  class CoffeeMachineGame {
    constructor() {
      this.isOpen = false;
      this.isBrewing = false;
      this.fillProgress = 0; // 0 to 100%
      this.isFull = false;
      this.isDrunk = false;
      this.fillRate = 28;    // percent per second (~3.5 seconds to fill mug)
      this.animId = null;
      this.lastTimestamp = 0;
      this.steamInterval = null;

      // Movable Glass / Mug Tracking & Dragging
      this.mugPos = 36; // percent across drip station (14% to 86%)
      this.isDragging = false;
      this.isAligned = false;
      this.dragStartX = 0;
      this.dragStartMugPos = 36;
      this.mugControlsBound = false;

      this.init();
    }

    init() {
      this.modal = document.getElementById('coffee-machine-modal');
      this.lcdScreen = document.getElementById('cm-lcd-screen');
      this.coffeeStream = document.getElementById('cm-coffee-stream');
      this.coffeeFill = document.getElementById('cm-coffee-fill');
      this.cremaLayer = document.getElementById('cm-crema-layer');
      this.fillBadge = document.getElementById('cm-fill-badge');
      this.steamWrap = document.getElementById('cm-steam-particles');
      this.brewBtn = document.getElementById('cm-brew-btn');
      this.drinkBtn = document.getElementById('cm-drink-btn');
      this.exitBtn = document.getElementById('cm-exit-btn');
      this.closeModalBtn = document.getElementById('cm-btn-close-modal');
      this.statusBanner = document.getElementById('cm-status-banner');
      this.statusTitle = document.getElementById('cm-status-title');
      this.statusDesc = document.getElementById('cm-status-desc');
      this.mugEl = document.getElementById('cm-coffee-mug');
      this.machineButton = document.getElementById('cm-machine-tap-btn');

      // Movable Glass & Alignment Elements
      this.dripStation = document.getElementById('cm-drip-station');
      this.dripTray = document.getElementById('cm-drip-tray');
      this.spoutGuide = document.getElementById('cm-spout-guide');
      this.splashContainer = document.getElementById('cm-splash-container');
      this.slideLeftBtn = document.getElementById('cm-slide-left-btn');
      this.slideRightBtn = document.getElementById('cm-slide-right-btn');
      this.alignStatus = document.getElementById('cm-align-status');
      this.alignText = document.getElementById('cm-align-text');

      if (!this.modal) return;

      if (!this.eventsSetup) {
        this.setupEvents();
        this.setupMugControls();
        this.eventsSetup = true;
      }
    }

    setupEvents() {
      // Exit / Close buttons
      if (this.closeModalBtn) {
        this.closeModalBtn.addEventListener('click', () => this.close());
      }
      if (this.exitBtn) {
        this.exitBtn.addEventListener('click', () => this.close());
      }

      // Tap to Brew Button (or tap button on machine)
      const handleBrewClick = (e) => {
        if (e) e.preventDefault();
        if (this.isFull) return;
        if (!this.isBrewing) {
          this.startBrewing();
        } else {
          this.pauseBrewing();
        }
      };

      if (this.brewBtn) {
        this.brewBtn.addEventListener('click', handleBrewClick);
      }
      if (this.machineButton) {
        this.machineButton.addEventListener('click', handleBrewClick);
      }

      // OK / Drink Coffee Button
      if (this.drinkBtn) {
        this.drinkBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.drinkCoffee();
        });
      }

      // Keyboard Controls (E, Space, Enter, Escape, Left/Right Arrow, A/D to move glass)
      window.addEventListener('keydown', (e) => {
        if (!this.isOpen) return;

        const k = (e.key || '').toLowerCase();
        if (k === 'escape') {
          e.preventDefault();
          this.close();
          return;
        }

        // Slide glass left / right with keyboard
        if (k === 'arrowleft' || k === 'a' || e.code === 'ArrowLeft' || e.code === 'KeyA') {
          e.preventDefault();
          this.setMugPos(this.mugPos - 6);
          return;
        }
        if (k === 'arrowright' || k === 'd' || e.code === 'ArrowRight' || e.code === 'KeyD') {
          e.preventDefault();
          this.setMugPos(this.mugPos + 6);
          return;
        }

        if (k === 'e' || k === ' ' || k === 'enter' || e.code === 'KeyE' || e.code === 'Space') {
          e.preventDefault();
          if (this.isFull) {
            this.drinkCoffee();
          } else {
            handleBrewClick();
          }
        }
      });
    }

    setupMugControls() {
      if (!this.mugEl || this.mugControlsBound) return;
      this.mugControlsBound = true;

      // 1. Mouse Drag on Glass
      const onMouseDown = (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        this.isDragging = true;
        this.dragStartX = e.clientX;
        this.dragStartMugPos = this.mugPos;
        this.mugEl.classList.add('dragging');
      };

      const onMouseMove = (e) => {
        if (!this.isDragging || !this.dripStation) return;
        const deltaX = e.clientX - this.dragStartX;
        const stationW = this.dripStation.clientWidth || 300;
        const deltaPercent = (deltaX / stationW) * 100;
        this.setMugPos(this.dragStartMugPos + deltaPercent);
      };

      const onMouseUp = () => {
        if (this.isDragging) {
          this.isDragging = false;
          if (this.mugEl) this.mugEl.classList.remove('dragging');
        }
      };

      this.mugEl.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);

      // 2. Touch Drag on Glass (Mobile & Tablets)
      const onTouchStart = (e) => {
        if (e.touches.length !== 1) return;
        this.isDragging = true;
        this.dragStartX = e.touches[0].clientX;
        this.dragStartMugPos = this.mugPos;
        this.mugEl.classList.add('dragging');
      };

      const onTouchMove = (e) => {
        if (!this.isDragging || !this.dripStation || e.touches.length !== 1) return;
        const deltaX = e.touches[0].clientX - this.dragStartX;
        const stationW = this.dripStation.clientWidth || 300;
        const deltaPercent = (deltaX / stationW) * 100;
        this.setMugPos(this.dragStartMugPos + deltaPercent);
      };

      const onTouchEnd = () => {
        if (this.isDragging) {
          this.isDragging = false;
          if (this.mugEl) this.mugEl.classList.remove('dragging');
        }
      };

      this.mugEl.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd);

      // 3. Click anywhere on Drip Tray / Station to slide glass to that position
      if (this.dripTray) {
        this.dripTray.addEventListener('click', (e) => {
          if (this.isDragging) return;
          const stationRect = this.dripStation.getBoundingClientRect();
          const clickPercent = ((e.clientX - stationRect.left) / stationRect.width) * 100;
          this.setMugPos(clickPercent);
        });
      }

      // 4. Slide Left & Right Buttons
      if (this.slideLeftBtn) {
        this.slideLeftBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.setMugPos(this.mugPos - 8);
        });
      }
      if (this.slideRightBtn) {
        this.slideRightBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.setMugPos(this.mugPos + 8);
        });
      }
    }

    setMugPos(percent) {
      this.mugPos = Math.max(14, Math.min(86, percent));
      if (this.mugEl) {
        this.mugEl.style.left = `${this.mugPos}%`;
      }
      this.checkAlignment();
    }

    checkAlignment() {
      if (!this.coffeeStream || !this.mugEl) return false;
      const streamRect = this.coffeeStream.getBoundingClientRect();
      const mugRect = this.mugEl.getBoundingClientRect();

      // If stream or mug is not visible yet, assume false
      if (streamRect.width === 0 && !this.coffeeStream.classList.contains('active')) {
        // Calculate based on group head parent
        const parentHead = this.coffeeStream.closest('.cm-group-head');
        if (parentHead) {
          const headRect = parentHead.getBoundingClientRect();
          const headCenter = headRect.left + headRect.width / 2;
          const mugCenter = mugRect.left + 34;
          const aligned = Math.abs(headCenter - mugCenter) < 28;
          this.updateAlignmentUI(aligned);
          return aligned;
        }
      }

      // Center X of coffee stream
      const streamCenterX = streamRect.left + streamRect.width / 2;
      // Mug opening is ~60px wide (from mugRect.left + 4 to mugRect.left + 64)
      const mugLeft = mugRect.left + 4;
      const mugRight = mugRect.left + 64;

      const aligned = (streamCenterX >= mugLeft && streamCenterX <= mugRight);
      this.updateAlignmentUI(aligned);
      return aligned;
    }

    updateAlignmentUI(aligned) {
      this.isAligned = aligned;
      if (this.mugEl) {
        this.mugEl.classList.toggle('aligned', aligned);
      }
      if (this.alignStatus) {
        this.alignStatus.className = 'cm-align-status ' + (aligned ? 'aligned' : 'misaligned');
      }
      if (this.alignText) {
        this.alignText.textContent = aligned
          ? '● ALIGNED! STREAM FLOWING INTO GLASS ☕'
          : '⚠️ MISALIGNED • MOVE GLASS UNDER STREAM [◄ / ►]';
      }
    }

    updateSpoutGuidePos() {
      if (!this.coffeeStream || !this.spoutGuide || !this.dripStation) return;
      const streamRect = this.coffeeStream.getBoundingClientRect();
      const stationRect = this.dripStation.getBoundingClientRect();
      if (stationRect.width > 0 && streamRect.width > 0) {
        const relX = ((streamRect.left + streamRect.width / 2 - stationRect.left) / stationRect.width) * 100;
        this.spoutGuide.style.left = `${relX}%`;
        this.spoutGuide.style.right = 'auto';
      }
    }

    spawnSpillSplash() {
      if (!this.splashContainer || !this.coffeeStream || !this.dripStation) return;
      if (Math.random() < 0.4) return; // rate limit

      const streamRect = this.coffeeStream.getBoundingClientRect();
      const stationRect = this.dripStation.getBoundingClientRect();
      if (stationRect.width === 0) return;

      const relX = ((streamRect.left + streamRect.width / 2 - stationRect.left) / stationRect.width) * 100;
      const drop = document.createElement('div');
      drop.className = 'cm-splash-drop';
      const spread = (Math.random() - 0.5) * 22;
      drop.style.left = `calc(${relX}% + ${spread}px)`;
      drop.style.setProperty('--dx', `${(Math.random() - 0.5) * 18}px`);
      this.splashContainer.appendChild(drop);

      setTimeout(() => {
        if (drop && drop.parentNode) drop.parentNode.removeChild(drop);
      }, 420);
    }

    open() {
      this.isOpen = true;
      this.reset();

      if (this.modal) {
        this.modal.classList.remove('hidden');
      }

      // Unlock Web Audio API
      if (window.soundManager && typeof window.soundManager.unlock === 'function') {
        window.soundManager.unlock();
      }

      // Inform queue manager that player is using the machine
      if (window.coffeeQueueManager) {
        window.coffeeQueueManager.onPlayerEnterMachine();
      }

      setTimeout(() => {
        this.updateSpoutGuidePos();
        this.checkAlignment();
      }, 50);
    }

    close() {
      this.pauseBrewing();
      this.isOpen = false;

      if (this.modal) {
        this.modal.classList.add('hidden');
      }

      // Clear steam generator
      if (this.steamInterval) {
        clearInterval(this.steamInterval);
        this.steamInterval = null;
      }

      // Inform queue manager that player finished
      if (window.coffeeQueueManager) {
        window.coffeeQueueManager.onPlayerExitMachine();
      }

      // Refocus game canvas
      const canvas = document.getElementById('game-canvas');
      if (canvas) canvas.focus();
    }

    reset() {
      this.isBrewing = false;
      this.fillProgress = 0;
      this.isFull = false;
      this.isDrunk = false;
      this.lastTimestamp = 0;

      // Start mug slightly off-center (34%) so player slides it under the right spout!
      this.setMugPos(34);
      setTimeout(() => {
        this.updateSpoutGuidePos();
        this.checkAlignment();
      }, 30);

      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }

      if (window.soundManager && typeof window.soundManager.stopCoffeePour === 'function') {
        window.soundManager.stopCoffeePour();
      }

      // Reset DOM elements
      if (this.coffeeStream) {
        this.coffeeStream.classList.remove('active');
      }
      if (this.coffeeFill) {
        this.coffeeFill.style.height = '0%';
        this.coffeeFill.classList.remove('full');
      }
      if (this.cremaLayer) {
        this.cremaLayer.style.opacity = '0';
      }
      if (this.fillBadge) {
        this.fillBadge.textContent = '0%';
        this.fillBadge.classList.remove('ready');
      }
      if (this.lcdScreen) {
        this.lcdScreen.innerHTML = '<span class="lcd-glow">● READY 93°C</span><br><span class="lcd-sub">TAP BREW BUTTON ☕</span>';
      }
      if (this.statusBanner) {
        this.statusBanner.className = 'cm-status-banner ready';
      }
      if (this.statusTitle) {
        this.statusTitle.textContent = 'ESPRESSO PRO 9000™';
      }
      if (this.statusDesc) {
        this.statusDesc.textContent = 'Tap the brew button or press Space/E to start pouring coffee into your cup.';
      }
      if (this.brewBtn) {
        this.brewBtn.classList.remove('hidden', 'brewing');
        this.brewBtn.innerHTML = '<span class="cm-btn-icon">☕</span><span class="cm-btn-text">TAP TO BREW ESPRESSO</span><small class="cm-btn-sub">[Space / E / Click]</small>';
      }
      if (this.drinkBtn) {
        this.drinkBtn.classList.add('hidden');
      }
      if (this.machineButton) {
        this.machineButton.classList.remove('active');
      }
      if (this.steamWrap) {
        this.steamWrap.innerHTML = '';
      }
      if (this.splashContainer) {
        this.splashContainer.innerHTML = '';
      }
    }

    startBrewing() {
      if (this.isFull) return;
      this.isBrewing = true;
      this.lastTimestamp = performance.now();

      // UI updates
      if (this.coffeeStream) {
        this.coffeeStream.classList.add('active');
      }
      if (this.brewBtn) {
        this.brewBtn.classList.add('brewing');
        this.brewBtn.innerHTML = '<span class="cm-btn-icon">⏸️</span><span class="cm-btn-text">POURING... TAP TO PAUSE</span><small class="cm-btn-sub">[Filling Mug]</small>';
      }
      if (this.machineButton) {
        this.machineButton.classList.add('active');
      }
      if (this.statusBanner) {
        this.statusBanner.className = 'cm-status-banner brewing';
      }
      if (this.statusTitle) {
        this.statusTitle.textContent = 'STREAMING DARK ROAST... ☕';
      }
      if (this.statusDesc) {
        this.statusDesc.textContent = 'Rich 9-bar pressure extraction pouring directly into the mug.';
      }

      // Audio: start espresso stream
      if (window.soundManager && typeof window.soundManager.startCoffeePour === 'function') {
        window.soundManager.startCoffeePour();
        window.soundManager.updateCoffeePourPitch(this.fillProgress);
      }

      // Steam particles
      this.startSteamParticles();

      // Start animation loop
      if (!this.animId) {
        this.animId = requestAnimationFrame((ts) => this.brewLoop(ts));
      }
    }

    pauseBrewing() {
      this.isBrewing = false;
      if (this.coffeeStream) {
        this.coffeeStream.classList.remove('active');
      }
      if (this.brewBtn) {
        this.brewBtn.classList.remove('brewing');
        this.brewBtn.innerHTML = '<span class="cm-btn-icon">☕</span><span class="cm-btn-text">RESUME BREWING</span><small class="cm-btn-sub">[Click to Continue]</small>';
      }
      if (this.machineButton) {
        this.machineButton.classList.remove('active');
      }
      if (window.soundManager && typeof window.soundManager.stopCoffeePour === 'function') {
        window.soundManager.stopCoffeePour();
      }
      if (this.steamInterval) {
        clearInterval(this.steamInterval);
        this.steamInterval = null;
      }
    }

    brewLoop(timestamp) {
      if (!this.isOpen) return;

      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      const dt = (timestamp - this.lastTimestamp) / 1000;
      this.lastTimestamp = timestamp;

      if (this.isBrewing && !this.isFull) {
        const aligned = this.checkAlignment();
        if (aligned) {
          this.fillProgress = Math.min(100, this.fillProgress + this.fillRate * dt);

          // Update liquid fill
          if (this.coffeeFill) {
            this.coffeeFill.style.height = `${this.fillProgress}%`;
          }
          if (this.fillBadge) {
            this.fillBadge.textContent = `${Math.round(this.fillProgress)}%`;
            this.fillBadge.style.color = '#fbbf24';
          }
          if (this.cremaLayer && this.fillProgress > 15) {
            this.cremaLayer.style.opacity = Math.min(1, (this.fillProgress - 15) / 25).toString();
          }

          // Live digital LCD display
          if (this.lcdScreen) {
            const bar = Math.floor(this.fillProgress / 10);
            const barStr = '■'.repeat(bar) + '□'.repeat(10 - bar);
            this.lcdScreen.innerHTML = `<span class="lcd-glow">● POURING: ${Math.round(this.fillProgress)}%</span><br><span class="lcd-progress">${barStr} 9.2 BAR</span>`;
          }

          if (this.statusBanner) {
            this.statusBanner.className = 'cm-status-banner brewing';
          }
          if (this.statusTitle) {
            this.statusTitle.textContent = 'STREAMING DARK ROAST... ☕';
          }
          if (this.statusDesc) {
            this.statusDesc.textContent = 'Glass is aligned! Rich espresso extraction pouring directly in.';
          }

          // Update audio pitch as container fills
          if (window.soundManager && typeof window.soundManager.updateCoffeePourPitch === 'function') {
            window.soundManager.updateCoffeePourPitch(this.fillProgress);
          }

          // Check if glass is 100% full
          if (this.fillProgress >= 100) {
            this.onBrewComplete();
            return;
          }
        } else {
          // MISALIGNED! Coffee pours onto the drip tray grill, glass doesn't fill!
          if (this.fillBadge) {
            this.fillBadge.textContent = 'ALIGN GLASS!';
            this.fillBadge.style.color = '#f87171';
          }
          if (this.lcdScreen) {
            this.lcdScreen.innerHTML = `<span class="lcd-glow" style="color: #f87171;">⚠️ MOVE GLASS!</span><br><span class="lcd-progress">SLIDE UNDER STREAM</span>`;
          }
          if (this.statusBanner) {
            this.statusBanner.className = 'cm-status-banner ready';
          }
          if (this.statusTitle) {
            this.statusTitle.textContent = '⚠️ COFFEE IS MISSING THE GLASS!';
          }
          if (this.statusDesc) {
            this.statusDesc.textContent = 'Drag the glass or use Left/Right Arrow keys [◄ / ►] to move it under the stream!';
          }

          // Spawn grill splash droplets
          this.spawnSpillSplash();
        }
      }

      this.animId = requestAnimationFrame((ts) => this.brewLoop(ts));
    }

    onBrewComplete() {
      this.isBrewing = false;
      this.isFull = true;

      if (this.coffeeStream) {
        this.coffeeStream.classList.remove('active');
      }
      if (this.machineButton) {
        this.machineButton.classList.remove('active');
      }
      if (this.coffeeFill) {
        this.coffeeFill.classList.add('full');
      }
      if (this.fillBadge) {
        this.fillBadge.textContent = '100% FULL';
        this.fillBadge.classList.add('ready');
      }

      // Stop pour audio & play ding
      if (window.soundManager) {
        if (typeof window.soundManager.stopCoffeePour === 'function') {
          window.soundManager.stopCoffeePour();
        }
        if (typeof window.soundManager.playCoffeeReady === 'function') {
          window.soundManager.playCoffeeReady();
        }
      }

      // Status banner update
      if (this.statusBanner) {
        this.statusBanner.className = 'cm-status-banner complete';
      }
      if (this.statusTitle) {
        this.statusTitle.textContent = '✨ COFFEE IS READY! ☕';
      }
      if (this.statusDesc) {
        this.statusDesc.textContent = 'Your glass is filled with fresh piping-hot espresso! Press OK to drink.';
      }

      // LCD display
      if (this.lcdScreen) {
        this.lcdScreen.innerHTML = '<span class="lcd-done">★ CUP 100% FULL ★</span><br><span class="lcd-blink">PRESS OK TO DRINK ☕</span>';
      }

      // Swap Brew Button with OK / Drink Button
      if (this.brewBtn) {
        this.brewBtn.classList.add('hidden');
      }
      if (this.drinkBtn) {
        this.drinkBtn.classList.remove('hidden');
        this.drinkBtn.focus();
      }

      // Notification toast
      if (typeof window.showToast === 'function') {
        window.showToast('☕ Hot fresh espresso ready! Press "OK" to drink and boost stamina!');
      }
    }

    drinkCoffee() {
      if (!this.isFull || this.isDrunk) return;
      this.isDrunk = true;

      // Play drinking audio
      if (window.soundManager && typeof window.soundManager.playCoffeeDrink === 'function') {
        window.soundManager.playCoffeeDrink();
      }

      // Corporate Funds Bonus (+$50)
      if (typeof window.addCorporateFunds === 'function') {
        window.addCorporateFunds(50, 'Espresso Wellness Bonus');
      }

      // Apply Caffeinated Speed & Energy Boost to player
      if (typeof window.applyCoffeeSpeedBoost === 'function') {
        window.applyCoffeeSpeedBoost();
      }

      // Celebration toast
      if (typeof window.showToast === 'function') {
        window.showToast('⚡ *Gulp!* Delicious espresso drank! Energy 100% & Speed Boost +30% for 25s! ☕');
      }

      // Close modal smoothly
      setTimeout(() => {
        this.close();
      }, 350);
    }

    startSteamParticles() {
      if (this.steamInterval) return;
      this.steamInterval = setInterval(() => {
        if (!this.isOpen || !this.isBrewing || !this.steamWrap) return;

        const puff = document.createElement('div');
        puff.className = 'cm-steam-puff';
        const startX = 14 + (Math.random() * 22);
        puff.style.left = `${startX}px`;
        puff.style.bottom = `${this.fillProgress * 0.7 + 10}px`;
        this.steamWrap.appendChild(puff);

        setTimeout(() => {
          if (puff && puff.parentNode) {
            puff.parentNode.removeChild(puff);
          }
        }, 1400);
      }, 160);
    }
  }

  // ==================================================================
  // 2. CAFE ESPRESSO QUEUING SYSTEM (ORDERLY LINE MANAGEMENT)
  // Ensures people stand in a single-file queue and never overlap
  // ==================================================================
  class CoffeeQueueManager {
    constructor() {
      // 5 predefined queue slots in front of the Cafeteria Espresso Machine:
      // Machine counter is at y: 220-270, x: 310-440 (center x: 375)
      // Clear vertical open corridor down to y: 540
      this.slots = [
        { x: 375, y: 310, dir: 'up', label: 'Dispenser Head (Serving)' },
        { x: 375, y: 365, dir: 'up', label: 'Line Slot 1' },
        { x: 375, y: 420, dir: 'up', label: 'Line Slot 2' },
        { x: 375, y: 475, dir: 'up', label: 'Line Slot 3' },
        { x: 375, y: 530, dir: 'up', label: 'Line Slot 4' }
      ];

      // Ordered list of occupants: string id or object
      // index 0 = person currently at machine, index 1 = next in line, etc.
      this.queue = [];
      this.npcServeTimers = new Map();
      this.playerAtMachine = false;
    }

    // Called when player is near or opens the machine
    onPlayerEnterMachine() {
      this.playerAtMachine = true;
      if (!this.queue.includes('player')) {
        // Player takes slot 0! If an NPC was at slot 0, push everyone back by 1
        this.queue.unshift('player');
        this.reassignNpcQueueDestinations();
      }
    }

    onPlayerExitMachine() {
      this.playerAtMachine = false;
      const idx = this.queue.indexOf('player');
      if (idx !== -1) {
        this.queue.splice(idx, 1);
        this.reassignNpcQueueDestinations();
      }
    }

    // Join queue for an NPC heading for coffee/espresso
    joinQueue(npc) {
      if (!npc) return this.slots[0];

      const existingIndex = this.queue.indexOf(npc.id);
      if (existingIndex !== -1) {
        const slotIdx = Math.min(existingIndex, this.slots.length - 1);
        return this.slots[slotIdx];
      }

      // Add to queue
      this.queue.push(npc.id);
      const slotIndex = Math.min(this.queue.length - 1, this.slots.length - 1);
      const slot = this.slots[slotIndex];

      npc.queueSlotIndex = slotIndex;
      npc.isWaitingInCoffeeQueue = true;
      return slot;
    }

    // Leave queue when NPC finishes drinking coffee
    leaveQueue(npc) {
      if (!npc) return;
      const idx = this.queue.indexOf(npc.id);
      if (idx !== -1) {
        this.queue.splice(idx, 1);
        this.npcServeTimers.delete(npc.id);
        npc.queueSlotIndex = -1;
        npc.isWaitingInCoffeeQueue = false;
        this.reassignNpcQueueDestinations();
      }
    }

    // Reassign all NPCs to their new queue slots when someone steps forward
    reassignNpcQueueDestinations() {
      const engine = window.aiAgent || window.aiAgentEngine;
      if (!engine || !engine.npcs) return;

      this.queue.forEach((id, index) => {
        if (id === 'player') return;
        const npc = engine.npcs.find(n => n.id === id);
        if (npc && npc.scene === 'CAFETERIA') {
          const slotIdx = Math.min(index, this.slots.length - 1);
          npc.queueSlotIndex = slotIdx;
          const slot = this.slots[slotIdx];

          // Set smooth destination to their exact queue slot
          npc.targetX = slot.x;
          npc.targetY = slot.y;
          npc.pathQueue = [{ x: slot.x, y: slot.y, isFinal: true }];
          npc.isMoving = true;
          npc.direction = 'up';

          if (slotIdx === 0) {
            npc.activityLabel = '☕ Brewing Fresh Espresso at Machine';
          } else {
            npc.activityLabel = `☕ In Coffee Queue (Position #${slotIdx + 1})`;
          }
        }
      });
    }

    // Update loop called every frame from main.js
    update(dt) {
      if (!window.state) return;
      const engine = window.aiAgent || window.aiAgentEngine;

      // 1. Check player proximity in CAFETERIA
      if (window.state.currentScene === 'CAFETERIA') {
        const px = window.state.player.x;
        const py = window.state.player.y;
        const distToMachine = Math.hypot(px - 375, py - 310);

        if (distToMachine < 42 && !this.playerAtMachine) {
          this.onPlayerEnterMachine();
        } else if (distToMachine >= 65 && this.playerAtMachine && (!window.coffeeMachine || !window.coffeeMachine.isOpen)) {
          this.onPlayerExitMachine();
        }
      } else if (this.playerAtMachine) {
        this.onPlayerExitMachine();
      }

      // 2. Manage NPC at Slot 0 serving timer
      if (this.queue.length > 0 && this.queue[0] !== 'player') {
        const serverId = this.queue[0];
        const serverNpc = engine && engine.npcs ? engine.npcs.find(n => n.id === serverId) : null;

        if (serverNpc && serverNpc.scene === 'CAFETERIA') {
          const distToServing = Math.hypot(serverNpc.x - 375, serverNpc.y - 310);
          if (distToServing < 12) {
            // NPC has arrived at dispenser!
            serverNpc.direction = 'up';
            serverNpc.isMoving = false;
            let timer = this.npcServeTimers.get(serverId) || 0;
            timer += dt;
            this.npcServeTimers.set(serverId, timer);

            if (timer < 3500) {
              serverNpc.activityLabel = '☕ Brewing Fresh Espresso';
            } else if (timer < 6500) {
              serverNpc.activityLabel = '☕ Savoring Hot Espresso (*Sip*)';
            } else {
              // Finished! Leaves queue and picks next task
              this.leaveQueue(serverNpc);
              if (engine && typeof engine.pickNextRoutine === 'function') {
                engine.pickNextRoutine(serverNpc);
              }
            }
          }
        }
      }

      // 3. Strict Anti-Collision Separation in Cafeteria
      // Guarantees no two characters ever clip or stand on top of each other
      this.enforceNoOverlap();
    }

    enforceNoOverlap() {
      const engine = window.aiAgent || window.aiAgentEngine;
      if (!engine || !window.state || window.state.currentScene !== 'CAFETERIA') return;

      const entities = [];
      entities.push({ id: 'player', x: window.state.player.x, y: window.state.player.y, isPlayer: true });

      if (engine.npcs) {
        engine.npcs.forEach(npc => {
          if (npc.scene === 'CAFETERIA') {
            entities.push({ id: npc.id, x: npc.x, y: npc.y, npc: npc });
          }
        });
      }

      const MIN_DIST = 32; // minimum distance between human bodies
      for (let i = 0; i < entities.length; i++) {
        for (let j = i + 1; j < entities.length; j++) {
          const a = entities[i];
          const b = entities[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);

          if (dist < MIN_DIST && dist > 0.1) {
            const overlap = (MIN_DIST - dist) / 2;
            const pushX = (dx / dist) * overlap;
            const pushY = (dy / dist) * overlap;

            // Push apart
            if (b.npc && !b.isPlayer) {
              b.npc.x += pushX;
              b.npc.y += pushY;
            }
            if (a.npc && !a.isPlayer) {
              a.npc.x -= pushX;
              a.npc.y -= pushY;
            }
          }
        }
      }
    }
  }

  // ==================================================================
  // 3. CAFFEINE SPEED BOOST HELPER
  // ==================================================================
  let speedBoostTimeout = null;
  window.applyCoffeeSpeedBoost = function() {
    if (!window.state || !window.state.player) return;

    // Apply +35% movement speed boost
    window.state.player.speed = 220;
    window.state.player.runSpeed = 310;
    window.state.player.hasCaffeineBoost = true;

    if (speedBoostTimeout) clearTimeout(speedBoostTimeout);
    speedBoostTimeout = setTimeout(() => {
      if (window.state && window.state.player) {
        window.state.player.speed = 160;
        window.state.player.runSpeed = 240;
        window.state.player.hasCaffeineBoost = false;
        if (typeof window.showToast === 'function') {
          window.showToast('💤 Caffeine effect faded. Back to standard walking pace.');
        }
      }
    }, 25000); // 25 seconds boost
  };

  // Instantiate and mount globally
  window.coffeeMachine = new CoffeeMachineGame();
  window.coffeeQueueManager = new CoffeeQueueManager();

})();

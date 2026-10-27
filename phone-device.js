/**
 * PHONE-DEVICE.JS - Upright Handheld Smartphone with Task Notifications & Unique Character Themes
 * Toggled exclusively via Key [P] or Header Phone button.
 */

(function() {
  'use strict';

  class PhoneDeviceManager {
    constructor() {
      this.isOpen = false;
      this.overlay = null;
      this.wrapper = null;
      this.body = null;
      this.initialized = false;

      // Character Phone Profiles
      this.profiles = {
        char1: {
          id: 'char1',
          name: 'Vikram',
          role: 'Tech Lead / Specialist',
          carrier: 'OmniTech 5G',
          deviceName: 'OmniPhone 16 Pro',
          themeClass: 'phone-char1',
          widgetTitle: '🖥️ GitDeploy Telemetry',
          widgetPill: 'HEALTHY',
          widgetBody: '• 4 microservices operational (99.99%)<br>• Ingestion latency: 0.8ms • Zero queue backlog',
          tones: [587, 880]
        },
        char2: {
          id: 'char2',
          name: 'Neha',
          role: 'Strategic Planner',
          carrier: 'PearMobile 5G',
          deviceName: 'PearPhone Ultra',
          themeClass: 'phone-char2',
          widgetTitle: '📊 Sprint Roadmap & OKRs',
          widgetPill: 'ON SCHEDULE',
          widgetBody: '• Q4 All-Hands release: 94% tasks resolved<br>• Keynote presentation underway on stage',
          tones: [659, 987]
        },
        char3: {
          id: 'char3',
          name: 'Kabir',
          role: 'Senior Research Lead',
          carrier: 'Nexus Quantum 6G',
          deviceName: 'Nexus Quantum Fold',
          themeClass: 'phone-char3',
          widgetTitle: '🔬 Quantum Cores & Sensor Array',
          widgetPill: '0.015 K STABLE',
          widgetBody: '• Sensor cluster telemetry synchronized<br>• Coherence fidelity: 99.998%',
          tones: [784, 1046]
        },
        char4: {
          id: 'char4',
          name: 'Josh',
          role: 'Lead Architect',
          carrier: 'RootNet 5G',
          deviceName: 'CyberDeck Zero',
          themeClass: 'phone-char4',
          widgetTitle: '⚡ Architecture Kernel Zero',
          widgetPill: '3.4M REQ/S',
          widgetBody: '• Model 70B training at 98.4% efficiency<br>• Edge consensus pipeline active',
          tones: [440, 880]
        }
      };
    }

    init() {
      if (this.initialized) return;
      this.buildDOM();
      this.setupListeners();
      this.initialized = true;
      console.log('📱 Handheld Smartphone System Initialized (Press [P] to toggle)');
    }

    getActiveCharId() {
      if (window.state && window.state.player && window.state.player.charId) {
        return window.state.player.charId;
      }
      if (window.multiplayerEngine && window.multiplayerEngine.localPlayer && window.multiplayerEngine.localPlayer.charId) {
        return window.multiplayerEngine.localPlayer.charId;
      }
      return 'char1';
    }

    buildDOM() {
      if (document.getElementById('phone-overlay')) return;

      const overlay = document.createElement('div');
      overlay.id = 'phone-overlay';
      overlay.className = 'phone-overlay hidden';

      overlay.innerHTML = `
        <div class="phone-wrapper" id="phone-wrapper">
          <!-- Hand holding phone -->
          <div class="phone-hand-container">
            <div class="phone-hand-left-fingers">
              <div class="hand-finger"></div>
              <div class="hand-finger"></div>
              <div class="hand-finger"></div>
            </div>
            <div class="phone-hand-thumb"></div>
            <div class="phone-hand-cuff"></div>
          </div>

          <!-- Phone Hardware Body (Upright, Parallel to Screen) -->
          <div class="phone-body" id="phone-body">
            <!-- Hardware Buttons -->
            <div class="phone-btn-vol-up"></div>
            <div class="phone-btn-vol-down"></div>
            <div class="phone-btn-power"></div>

            <!-- Screen Viewport -->
            <div class="phone-screen" id="phone-screen">
              <!-- Dynamic Island / Speaker Pill -->
              <div class="phone-dynamic-island">
                <span class="island-camera"></span>
                <span class="island-sensor"></span>
              </div>

              <!-- Top Status Bar -->
              <div class="phone-status-bar">
                <div class="status-left">
                  <span id="phone-clock">10:42</span>
                  <span id="phone-carrier" class="status-carrier">OmniTech 5G</span>
                </div>
                <div class="status-right">
                  <span>📶</span>
                  <span>🛜</span>
                  <span id="phone-battery">🔋 98%</span>
                </div>
              </div>

              <!-- Scrollable Phone Screen View -->
              <div class="phone-content">
                <!-- Task Notification Card -->
                <div class="phone-notif-card" id="phone-notif-card">
                  <div class="notif-top">
                    <div class="notif-app-badge">
                      <span class="notif-pulse-dot"></span>
                      <span id="phone-notif-label">OMNICORP DIRECTIVE</span>
                    </div>
                    <span class="notif-time-ago">Just now</span>
                  </div>

                  <div class="notif-title" id="phone-notif-title">Global Telemetry Intelligence</div>
                  <div class="notif-loc-tag" id="phone-notif-location">📍 Acme R&D Innovation Mega-Hub</div>
                  <div class="notif-desc-text" id="phone-notif-desc">
                    Inspect architecture whiteboards, collaborate with developers, or attend Stage Presentation.
                  </div>

                  <!-- Dynamic Interactive Task Checklist -->
                  <div class="notif-checklist-wrap" id="phone-notif-checklist"></div>

                  <!-- Quick Action Buttons -->
                  <div class="notif-buttons-row">
                    <button class="notif-action-btn primary" id="phone-btn-open-quest">
                      <span>📜</span> Quest Log [Q]
                    </button>
                    <button class="notif-action-btn" id="phone-btn-ack">
                      <span>✔</span> Got It
                    </button>
                  </div>
                </div>

                <!-- Character Unique Widget -->
                <div class="phone-widget-card" id="phone-widget-card">
                  <div class="widget-header">
                    <span class="widget-title" id="phone-widget-title">🖥️ GitDeploy Telemetry</span>
                    <span class="widget-stat-pill" id="phone-widget-pill">HEALTHY</span>
                  </div>
                  <div class="widget-content-body" id="phone-widget-body">
                    • 4 microservices operational (99.99%)<br>
                    • Ingestion latency: 0.8ms • Zero queue backlog
                  </div>
                </div>

                <!-- App Icons Grid -->
                <div class="phone-apps-container">
                  <div class="apps-grid">
                    <button class="phone-app-btn" id="app-btn-chat" title="Office Chat & Pager">
                      <div class="app-icon-squircle icon-chat">💬</div>
                      <span class="app-label">Chat</span>
                    </button>
                    <button class="phone-app-btn" id="app-btn-quest" title="Quests & Rubrics">
                      <div class="app-icon-squircle icon-quests">📜</div>
                      <span class="app-label">Quests</span>
                    </button>
                    <button class="phone-app-btn" id="app-btn-browser" title="Intranet Web Browser">
                      <div class="app-icon-squircle icon-browser">🌐</div>
                      <span class="app-label">Browser</span>
                    </button>
                    <button class="phone-app-btn" id="app-btn-camera" title="Snapshot Photo">
                      <div class="app-icon-squircle icon-camera">📷</div>
                      <span class="app-label">Camera</span>
                    </button>
                    <button class="phone-app-btn" id="app-btn-terminal" title="Terminal / Code">
                      <div class="app-icon-squircle icon-terminal">&gt;_</div>
                      <span class="app-label">Terminal</span>
                    </button>
                    <button class="phone-app-btn" id="app-btn-notes" title="Daily Objectives">
                      <div class="app-icon-squircle icon-notes">📝</div>
                      <span class="app-label">Notes</span>
                    </button>
                    <button class="phone-app-btn" id="app-btn-music" title="Toggle Sound (M)">
                      <div class="app-icon-squircle icon-music">🎵</div>
                      <span class="app-label">Music</span>
                    </button>
                    <button class="phone-app-btn" id="app-btn-settings" title="CRT Scanlines">
                      <div class="app-icon-squircle icon-settings">⚙️</div>
                      <span class="app-label">CRT Mode</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Camera flash effect container -->
              <div class="camera-flash-overlay" id="phone-camera-flash"></div>

              <!-- Bottom Bar & Home Indicator -->
              <div class="phone-bottom-bar">
                <button class="phone-home-pill-btn" id="phone-home-pill" title="Close Phone [P / Esc]"></button>
                <span class="phone-esc-hint">Press [P] or [Esc] to Close</span>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);
      this.overlay = overlay;
      this.wrapper = document.getElementById('phone-wrapper');
      this.body = document.getElementById('phone-body');

      // Add Phone button in Header if not present
      this.addHeaderButton();
    }

    addHeaderButton() {
      const headerRight = document.querySelector('.header-right');
      if (headerRight && !document.getElementById('btn-phone-toggle')) {
        const btn = document.createElement('button');
        btn.id = 'btn-phone-toggle';
        btn.className = 'btn-pager-toggle';
        btn.title = 'Open Smartphone & Task Directives (P)';
        btn.innerHTML = `
          <span class="pager-icon">📱</span>
          <span class="pager-label">Phone</span>
        `;
        btn.onclick = () => this.toggle();
        // Insert right after pager button
        const pagerBtn = document.getElementById('btn-open-pager');
        if (pagerBtn && pagerBtn.nextSibling) {
          headerRight.insertBefore(btn, pagerBtn.nextSibling);
        } else {
          headerRight.appendChild(btn);
        }
      }
    }

    setupListeners() {
      // Global hotkey listener for [P] and [Escape]
      window.addEventListener('keydown', (e) => {
        const tag = (e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '');
        if (tag === 'input' || tag === 'textarea') return;

        const k = (e.key || '').toLowerCase();
        const code = e.code || '';

        if (k === 'p' || code === 'KeyP') {
          e.preventDefault();
          this.toggle();
        } else if (k === 'escape' && this.isOpen) {
          e.preventDefault();
          this.close();
        }
      });

      // Overlay background click to close
      if (this.overlay) {
        this.overlay.addEventListener('click', (e) => {
          if (e.target === this.overlay) {
            this.close();
          }
        });
      }

      // Close pill click
      const homePill = document.getElementById('phone-home-pill');
      if (homePill) homePill.onclick = () => this.close();

      // Notification action: Open Quest Log
      const btnQuest = document.getElementById('phone-btn-open-quest');
      if (btnQuest) {
        btnQuest.onclick = () => {
          this.close();
          if (typeof window.toggleClassicDashboard === 'function') {
            window.toggleClassicDashboard();
          }
        };
      }

      // Notification action: Got it
      const btnAck = document.getElementById('phone-btn-ack');
      if (btnAck) {
        btnAck.onclick = () => {
          if (window.soundManager) window.soundManager.playInteract();
          if (typeof window.showToast === 'function') {
            window.showToast('✔ Task directive acknowledged! Stay productive.');
          }
          this.close();
        };
      }

      // App button wiring
      const chatBtn = document.getElementById('app-btn-chat');
      if (chatBtn) {
        chatBtn.onclick = () => {
          this.close();
          if (typeof window.togglePagerModal === 'function') {
            window.togglePagerModal();
          }
        };
      }

      const questBtn = document.getElementById('app-btn-quest');
      if (questBtn) {
        questBtn.onclick = () => {
          this.close();
          if (typeof window.toggleClassicDashboard === 'function') {
            window.toggleClassicDashboard();
          }
        };
      }

      const browserBtn = document.getElementById('app-btn-browser');
      if (browserBtn) {
        browserBtn.onclick = () => {
          this.close();
          if (window.pcOS && typeof window.pcOS.open === 'function') {
            window.pcOS.open();
            setTimeout(() => {
              if (typeof window.pcOS.openBrowser === 'function') window.pcOS.openBrowser();
            }, 300);
          } else if (typeof window.showToast === 'function') {
            window.showToast('🌐 Log into your assigned desk PC to access Intranet!');
          }
        };
      }

      const cameraBtn = document.getElementById('app-btn-camera');
      if (cameraBtn) {
        cameraBtn.onclick = () => this.takeSnapshot();
      }

      const terminalBtn = document.getElementById('app-btn-terminal');
      if (terminalBtn) {
        terminalBtn.onclick = () => {
          if (window.soundManager) window.soundManager.playInteract();
          if (typeof window.showToast === 'function') {
            window.showToast('💻 OmniTerminal: Latency 0.8ms • All systems operational');
          }
        };
      }

      const notesBtn = document.getElementById('app-btn-notes');
      if (notesBtn) {
        notesBtn.onclick = () => {
          if (window.soundManager) window.soundManager.playInteract();
          const obj = document.getElementById('objective-text');
          if (typeof window.showToast === 'function') {
            window.showToast(obj ? `📝 Note: ${obj.textContent}` : '📝 Clear daily missions!');
          }
        };
      }

      const musicBtn = document.getElementById('app-btn-music');
      if (musicBtn) {
        musicBtn.onclick = () => {
          if (typeof window.toggleSound === 'function') {
            window.toggleSound();
          }
        };
      }

      const settingsBtn = document.getElementById('app-btn-settings');
      if (settingsBtn) {
        settingsBtn.onclick = () => {
          if (window.pixelEngine && typeof window.pixelEngine.toggleCRT === 'function') {
            const active = window.pixelEngine.toggleCRT();
            if (typeof window.showToast === 'function') {
              window.showToast(active ? '📺 CRT Scanlines: ON' : '📺 CRT Scanlines: OFF');
            }
          }
        };
      }
    }

    takeSnapshot() {
      const flash = document.getElementById('phone-camera-flash');
      if (flash) {
        flash.classList.add('flash');
        setTimeout(() => flash.classList.remove('flash'), 180);
      }
      if (window.soundManager) window.soundManager.playInteract();
      if (typeof window.showToast === 'function') {
        window.showToast('📸 Snapshot captured! Saved to OmniCloud Photos.');
      }
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      if (!this.initialized) this.init();
      this.isOpen = true;

      // Update character-specific phone theme
      const charId = this.getActiveCharId();
      const profile = this.profiles[charId] || this.profiles.char1;

      // Update phone wrapper theme class
      this.wrapper.className = `phone-wrapper ${profile.themeClass}`;

      // Update clock & carrier
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const clockEl = document.getElementById('phone-clock');
      if (clockEl) clockEl.textContent = timeStr;

      const carrierEl = document.getElementById('phone-carrier');
      if (carrierEl) carrierEl.textContent = profile.carrier;

      // Update character widget
      const widgetTitle = document.getElementById('phone-widget-title');
      const widgetPill = document.getElementById('phone-widget-pill');
      const widgetBody = document.getElementById('phone-widget-body');
      if (widgetTitle) widgetTitle.innerHTML = profile.widgetTitle;
      if (widgetPill) widgetPill.textContent = profile.widgetPill;
      if (widgetBody) widgetBody.innerHTML = profile.widgetBody;

      // Refresh live task notification
      this.refreshTaskNotification(profile);

      // Play character unique ring chime
      this.playPhoneChime(profile.tones);

      // Show overlay
      this.overlay.classList.remove('hidden');
    }

    close() {
      if (!this.isOpen) return;
      this.isOpen = false;
      if (this.overlay) {
        this.overlay.classList.add('hidden');
      }
    }

    playPhoneChime(tones = [587, 880]) {
      if (!window.soundManager) return;
      window.soundManager.unlock();
      if (window.soundManager.muted || !window.soundManager.ctx) return;

      try {
        const ctx = window.soundManager.ctx;
        const t = ctx.currentTime;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(tones[0], t);
        osc.frequency.setValueAtTime(tones[1], t + 0.08);

        gain.gain.setValueAtTime(0.18, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

        osc.connect(gain);
        gain.connect(window.soundManager.masterGain);

        osc.start(t);
        osc.stop(t + 0.36);
      } catch (err) {}
    }

    refreshTaskNotification(profile) {
      const sceneKey = (window.state && window.state.currentScene) || 'OFFICE_HALL';
      const scene = (window.SCENES && window.SCENES[sceneKey]) || {};

      const titleEl = document.getElementById('phone-notif-title');
      const locEl = document.getElementById('phone-notif-location');
      const descEl = document.getElementById('phone-notif-desc');
      const checkWrap = document.getElementById('phone-notif-checklist');

      const roomName = scene.name || 'OmniCorp Headquarters';
      const roomBadge = scene.badge || 'Office Floor';
      const roomObjective = scene.objective || 'Explore the office, complete workplace communication missions, and interact with team members.';

      if (locEl) locEl.textContent = `📍 ${roomName}`;

      let questTitle = 'Workplace Communication Mission';
      if (sceneKey === 'BIG_WORKPLACE') {
        questTitle = 'Global Telemetry Intelligence (All-Hands)';
      } else if (sceneKey === 'CAFETERIA') {
        questTitle = 'Cafeteria & Engineering Socialization';
      } else if (sceneKey === 'BOSS_CABINET') {
        questTitle = 'Executive Strategy Briefing';
      } else if (sceneKey === 'CORNER_OFFICE') {
        questTitle = 'Talent & Culture Feedback Consultation';
      } else {
        questTitle = 'Office Communication Directive';
      }

      if (titleEl) titleEl.textContent = questTitle;
      if (descEl) descEl.textContent = roomObjective;

      // Dynamic Checklist items matching current room
      const tasks = [];
      if (sceneKey === 'BIG_WORKPLACE') {
        tasks.push({ text: 'Inspect System Architecture Flowchart [E]', done: false });
        tasks.push({ text: 'Review Microservices Engine Code Spec [E]', done: false });
        tasks.push({ text: 'Attend ACME Metrics Presentation on Stage [E]', done: false });
        tasks.push({ text: 'Sit at Dev Pod workstation [E / C]', done: false });
      } else if (sceneKey === 'CAFETERIA') {
        tasks.push({ text: 'Brew fresh espresso at coffee station [E]', done: false });
        tasks.push({ text: 'Grab brain fuel from snack vending machine [E]', done: false });
        tasks.push({ text: 'Sit at dining table with colleagues [E / C]', done: false });
        tasks.push({ text: 'Enter R&D Mega-Hub through right corridor', done: false });
      } else if (sceneKey === 'BOSS_CABINET') {
        tasks.push({ text: 'Deliver Sprint Velocity report to Boss [E]', done: false });
        tasks.push({ text: 'Sit in executive leather chair [E / C]', done: false });
      } else if (sceneKey === 'CORNER_OFFICE') {
        tasks.push({ text: 'Consult HR Ma\'am on communication feedback [E]', done: false });
        tasks.push({ text: 'Review performance evaluation rubric [E / Q]', done: false });
      } else {
        tasks.push({ text: 'Talk to Rahul, Priya, Amit, or Neha [E]', done: false });
        tasks.push({ text: 'Log in to assigned developer desk PC [E]', done: false });
        tasks.push({ text: 'Open Quest Log to review rubric missions [Q]', done: false });
      }

      if (checkWrap) {
        checkWrap.innerHTML = tasks.map((t, idx) => `
          <div class="checklist-item ${t.done ? 'done' : ''}">
            <div class="checklist-checkbox">${t.done ? '✓' : ''}</div>
            <span>${t.text}</span>
          </div>
        `).join('');
      }
    }
  }

  // Instantiate singleton
  window.phoneDevice = new PhoneDeviceManager();

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => window.phoneDevice.init());
  } else {
    window.phoneDevice.init();
  }
})();

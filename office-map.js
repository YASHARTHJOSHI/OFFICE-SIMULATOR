// ====================================================================
// OFFICE-MAP.JS
// Holographic 2D Top-View Floor Plan & Live Location Radar
// Press 'M' to toggle the architectural schematic with real-time tracking
// ====================================================================

(function() {
  'use strict';

  const ROOMS_CONFIG = {
    BOSS_CABINET: {
      id: 'BOSS_CABINET',
      name: 'Executive Suite',
      code: 'SEC-01 // SUITE',
      subtitle: 'Lord Skywalker\'s Private Cabinet',
      icon: '👔',
      themeColor: '#f43f5e', // rose / executive
      accentColor: '#fda4af',
      rect: { x: 40, y: 30, w: 250, h: 140 },
      spawn: { x: 930, y: 495, dir: 'left' },
      features: [
        { label: 'Boss Desk', icon: '💼', x: 0.35, y: 0.45 },
        { label: 'Visitor Chair', icon: '🪑', x: 0.22, y: 0.55 },
        { label: 'Water Cooler', icon: '💧', x: 0.82, y: 0.35 },
        { label: 'Classified Files', icon: '📁', x: 0.90, y: 0.65 }
      ],
      desc: 'High-stakes executive office. Lord Skywalker demands 500% quarterly profits. Features executive water cooler and confidential audit files.'
    },
    OFFICE_HALL: {
      id: 'OFFICE_HALL',
      name: 'Main Office Floor',
      code: 'SEC-02 // CENTRAL',
      subtitle: 'Central Hub & Open Workstations',
      icon: '🏢',
      themeColor: '#38bdf8', // cyan
      accentColor: '#bae6fd',
      rect: { x: 40, y: 200, w: 260, h: 200 },
      spawn: { x: 512, y: 245, dir: 'down' },
      features: [
        { label: 'My Assigned PC', icon: '💻', x: 0.18, y: 0.62, highlight: true },
        { label: 'Cubicle Cluster', icon: '🖥️', x: 0.45, y: 0.45 },
        { label: 'Water Cooler', icon: '💧', x: 0.88, y: 0.28 },
        { label: 'Office Ficus', icon: '🌿', x: 0.88, y: 0.85 },
        { label: 'Bookshelves', icon: '📚', x: 0.30, y: 0.18 }
      ],
      desc: 'The vibrant heart of the company. Access your assigned PC workstation, hydrate at the cooler, or inspect the 3-time employee-of-the-month ficus.'
    },
    CORNER_OFFICE: {
      id: 'CORNER_OFFICE',
      name: 'Corner Office',
      code: 'SEC-03 // HR-AUDIT',
      subtitle: 'HR Ma\'am & Investigation Audit',
      icon: '💼',
      themeColor: '#a855f7', // purple
      accentColor: '#e9d5ff',
      rect: { x: 40, y: 430, w: 240, h: 125 },
      spawn: { x: 800, y: 470, dir: 'left' },
      features: [
        { label: 'HR Ma\'am Desk', icon: '👩‍💼', x: 0.45, y: 0.55 },
        { label: 'Classified Board', icon: '📋', x: 0.20, y: 0.35 },
        { label: 'Jasmine Green Tea', icon: '🍵', x: 0.85, y: 0.40 },
        { label: 'CRT Audit PC', icon: '💾', x: 0.85, y: 0.80 }
      ],
      desc: 'Quiet corner executive space. HR Ma\'am keeps an eye on corporate intrigue, serves freshly brewed jasmine green tea, and monitors audit logs.'
    },
    CAFETERIA: {
      id: 'CAFETERIA',
      name: 'Cafeteria & Lounge',
      code: 'SEC-04 // LOUNGE',
      subtitle: 'Break Area & Espresso Bar',
      icon: '☕',
      themeColor: '#f59e0b', // amber
      accentColor: '#fde68a',
      rect: { x: 335, y: 200, w: 235, h: 200 },
      spawn: { x: 200, y: 380, dir: 'right' },
      features: [
        { label: 'Espresso Pro 9000', icon: '☕', x: 0.45, y: 0.25, highlight: true },
        { label: 'Dining Tables', icon: '🪑', x: 0.45, y: 0.65 },
        { label: 'Snack Bar', icon: '🥪', x: 0.18, y: 0.30 },
        { label: 'Water Cooler', icon: '💧', x: 0.85, y: 0.30 }
      ],
      desc: 'Relaxation and hydration lounge. Brew realistic artisanal bean-to-cup espresso with the interactive machine, grab snacks, and chat with coworkers.'
    },
    BIG_WORKPLACE: {
      id: 'BIG_WORKPLACE',
      name: 'Acme R&D Mega-Hub',
      code: 'SEC-05 // DEV-FLOOR',
      subtitle: 'Engineering Pods & Quest Leads',
      icon: '💻',
      themeColor: '#10b981', // emerald
      accentColor: '#a7f3d0',
      rect: { x: 605, y: 200, w: 300, h: 220 },
      spawn: { x: 200, y: 360, dir: 'right' },
      features: [
        { label: 'Rahul (PR Review)', icon: '👨‍💻', x: 0.25, y: 0.45 },
        { label: 'Priya (UX Design)', icon: '👩‍💻', x: 0.50, y: 0.45 },
        { label: 'Amit (Backend DB)', icon: '👨‍💻', x: 0.25, y: 0.75 },
        { label: 'Neha (Infra/SRE)', icon: '👩‍💻', x: 0.50, y: 0.75 },
        { label: 'Vector Whiteboard', icon: '🎨', x: 0.40, y: 0.18, highlight: true },
        { label: 'Projector Portal', icon: '📽️', x: 0.88, y: 0.25, highlight: true }
      ],
      desc: 'Massive engineering development floor. Complete workplace quests with 4 AI mentor colleagues, sketch on the vector whiteboard, or slip behind the screen.'
    },
    CONFERENCE_ROOM: {
      id: 'CONFERENCE_ROOM',
      name: 'Executive Boardroom',
      code: 'SEC-06 // STRATEGY',
      subtitle: 'Strategy Suite & Telemetry Center',
      icon: '📊',
      themeColor: '#818cf8', // indigo
      accentColor: '#c7d2fe',
      rect: { x: 605, y: 30, w: 300, h: 140 },
      spawn: { x: 100, y: 350, dir: 'right' },
      features: [
        { label: 'Mahogany Table', icon: '🪑', x: 0.50, y: 0.55 },
        { label: 'Live Telemetry', icon: '📊', x: 0.90, y: 0.50, highlight: true },
        { label: 'Q3 Roadmap', icon: '📋', x: 0.75, y: 0.25 },
        { label: 'Espresso Credenza', icon: '☕', x: 0.28, y: 0.25 },
        { label: 'Water Station', icon: '💧', x: 0.90, y: 0.85 }
      ],
      desc: 'Top-floor panoramic boardroom overlooking the city skyline. Hold executive meetings around the mahogany table and inspect real-time cluster telemetry.'
    }
  };

  // Connecting doorways and hallways
  const CORRIDORS = [
    // 1. Boss Suite <-> Main Office Floor (Vertical door)
    { from: 'BOSS_CABINET', to: 'OFFICE_HALL', x1: 165, y1: 170, x2: 165, y2: 200, label: 'Executive Door' },
    // 2. Main Hall <-> Corner Office (Vertical door)
    { from: 'OFFICE_HALL', to: 'CORNER_OFFICE', x1: 160, y1: 400, x2: 160, y2: 430, label: 'Corner Door' },
    // 3. Main Hall <-> Cafeteria (Horizontal double doors)
    { from: 'OFFICE_HALL', to: 'CAFETERIA', x1: 300, y1: 300, x2: 335, y2: 300, label: 'Double Doors' },
    // 4. Cafeteria <-> Big Workplace (Horizontal hallway)
    { from: 'CAFETERIA', to: 'BIG_WORKPLACE', x1: 570, y1: 300, x2: 605, y2: 300, label: 'R&D Corridor' },
    // 5. Big Workplace <-> Conference Room (Vertical door behind screen)
    { from: 'BIG_WORKPLACE', to: 'CONFERENCE_ROOM', x1: 755, y1: 200, x2: 755, y2: 170, label: 'Glass Partition' }
  ];

  class OfficeMap {
    constructor() {
      this.isOpen = false;
      this.selectedRoomId = 'OFFICE_HALL';
      this.hoveredRoomId = null;
      this.canvas = null;
      this.ctx = null;
      this.animId = null;
      this.radarPulse = 0;
      this.modal = null;
      this.eventsBound = false;
      this.avatarImg = new Image();
      this.blueprintImg = new Image();
      this.blueprintImg.src = 'assets/office_blueprint_map.jpg';

      this.minimapCanvas = null;
      this.minimapCtx = null;
      this.minimapWidget = null;
      this.minimapAnimId = null;

      // Ensure DOM is ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.init());
      } else {
        this.init();
      }
    }

    init() {
      this.modal = document.getElementById('office-map-modal');
      this.canvas = document.getElementById('office-map-canvas');
      if (this.canvas) {
        this.ctx = this.canvas.getContext('2d');
      }

      this.minimapWidget = document.getElementById('hud-minimap-radar');
      this.minimapCanvas = document.getElementById('minimap-canvas');
      if (this.minimapCanvas) {
        this.minimapCtx = this.minimapCanvas.getContext('2d');
      }

      this.bindEvents();
      this.startMinimapLoop();
    }

    bindEvents() {
      if (this.eventsBound) return;
      this.eventsBound = true;

      // Click on Circular Minimap Radar -> Expands into full tactical map!
      if (this.minimapWidget) {
        this.minimapWidget.addEventListener('click', (e) => {
          e.stopPropagation();
          this.open();
        });
      }

      // Close buttons
      const closeBtn = document.getElementById('btn-close-office-map');
      if (closeBtn) closeBtn.addEventListener('click', () => this.close());
      const footerClose = document.getElementById('btn-map-footer-close');
      if (footerClose) footerClose.addEventListener('click', () => this.close());

      // Fast travel button in sidebar
      const fastTravelBtn = document.getElementById('btn-map-fast-travel');
      if (fastTravelBtn) {
        fastTravelBtn.addEventListener('click', () => this.handleFastTravel());
      }

      // Canvas click and hover
      if (this.canvas) {
        this.canvas.addEventListener('mousemove', (e) => this.handleCanvasHover(e));
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mouseleave', () => {
          this.hoveredRoomId = null;
          this.canvas.style.cursor = 'default';
        });
      }

      // Backdrop click closes map
      if (this.modal) {
        this.modal.addEventListener('click', (e) => {
          if (e.target === this.modal) this.close();
        });
      }

      // Keyboard listener for 'M' / 'm' / 'Escape'
      window.addEventListener('keydown', (e) => {
        const tag = (e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '');
        if (tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable)) return;

        // Press 'M' or 'm' to toggle
        if (e.key === 'm' || e.key === 'M' || e.code === 'KeyM') {
          // If water cooler or coffee machine open, don't interfere
          if (window.waterCoolerGame && window.waterCoolerGame.isOpen) return;
          if (window.coffeeMachine && window.coffeeMachine.isOpen) return;
          if (window.pcOS && window.pcOS.isOpen) return;

          e.preventDefault();
          this.toggle();
        } else if (e.key === 'Escape' || e.code === 'Escape') {
          if (this.isOpen) {
            e.preventDefault();
            this.close();
          }
        }
      });
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    open() {
      if (!this.modal) this.init();
      if (!this.modal) return;

      this.isOpen = true;
      this.selectedRoomId = (window.state && window.state.currentScene) ? window.state.currentScene : 'OFFICE_HALL';
      this.modal.classList.remove('hidden');

      if (window.soundManager && typeof window.soundManager.playMapOpen === 'function') {
        window.soundManager.playMapOpen();
      } else if (window.soundManager && typeof window.soundManager.playInteract === 'function') {
        window.soundManager.playInteract();
      }

      // Load player avatar
      this.updatePlayerAvatar();
      this.updateSidebarIntel();

      // Start render loop
      this.radarPulse = 0;
      this.render();
      if (this.animId) cancelAnimationFrame(this.animId);
      this.loop();
    }

    close() {
      if (!this.isOpen) return;
      this.isOpen = false;
      if (this.modal) this.modal.classList.add('hidden');
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }

      if (window.soundManager && typeof window.soundManager.playMapClose === 'function') {
        window.soundManager.playMapClose();
      } else if (window.soundManager && typeof window.soundManager.playInteract === 'function') {
        window.soundManager.playInteract();
      }
    }

    updatePlayerAvatar() {
      const p = window.state ? window.state.player : null;
      const charId = (p && p.charId) ? p.charId : 'char1';
      this.avatarImg.src = `assets/${charId}_avatar.png`;
    }

    loop() {
      if (!this.isOpen) return;
      this.radarPulse = (this.radarPulse + 0.028) % 1;
      this.render();
      this.animId = requestAnimationFrame(() => this.loop());
    }

    startMinimapLoop() {
      if (this.minimapAnimId) cancelAnimationFrame(this.minimapAnimId);
      const tick = () => {
        this.renderMinimap();
        this.minimapAnimId = requestAnimationFrame(tick);
      };
      this.minimapAnimId = requestAnimationFrame(tick);
    }

    renderMinimap() {
      if (!this.minimapCanvas || !this.minimapCtx) {
        this.minimapCanvas = document.getElementById('minimap-canvas');
        if (this.minimapCanvas) this.minimapCtx = this.minimapCanvas.getContext('2d');
        else return;
      }

      const ctx = this.minimapCtx;
      const W = this.minimapCanvas.width;
      const H = this.minimapCanvas.height;
      const cx = W / 2;
      const cy = H / 2;
      const R = 52;

      const currentRoomId = (window.state && window.state.currentScene) ? window.state.currentScene : 'OFFICE_HALL';
      const currentRoom = ROOMS_CONFIG[currentRoomId] || ROOMS_CONFIG['OFFICE_HALL'];

      // Update room label in minimap footer badge
      const badgeLabel = document.getElementById('minimap-room-label');
      if (badgeLabel && this.lastRoomBadge !== currentRoomId) {
        const shortNames = {
          BOSS_CABINET: 'SUITE [M]',
          OFFICE_HALL: 'HUB [M]',
          CORNER_OFFICE: 'HR [M]',
          CAFETERIA: 'CAFE [M]',
          BIG_WORKPLACE: 'DEV [M]',
          CONFERENCE_ROOM: 'BOARD [M]'
        };
        badgeLabel.textContent = shortNames[currentRoomId] || 'MAP [M]';
        this.lastRoomBadge = currentRoomId;
      }

      ctx.clearRect(0, 0, W, H);
      ctx.save();

      // Circular clip path
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.clip();

      // Deep cyber radial gradient
      const bgGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, R);
      bgGrad.addColorStop(0, '#0c1a2e');
      bgGrad.addColorStop(0.65, '#070f1e');
      bgGrad.addColorStop(1, '#020617');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Blueprint image background overlay
      if (this.blueprintImg && this.blueprintImg.complete && this.blueprintImg.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = 0.28;
        const rx = currentRoom.rect;
        const sx = (rx.x / 1024) * this.blueprintImg.naturalWidth;
        const sy = (rx.y / 576) * this.blueprintImg.naturalHeight;
        const sw = (rx.w / 1024) * this.blueprintImg.naturalWidth;
        const sh = (rx.h / 576) * this.blueprintImg.naturalHeight;
        ctx.drawImage(this.blueprintImg, sx, sy, sw, sh, 4, 4, W - 8, H - 8);
        ctx.restore();
      }

      // Concentric Radar Distance Rings
      ctx.lineWidth = 1;
      [15, 30, 45].forEach((r, idx) => {
        ctx.strokeStyle = idx === 2 ? 'rgba(56, 189, 248, 0.45)' : 'rgba(56, 189, 248, 0.18)';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Crosshair Reticle Lines
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, 4);
      ctx.lineTo(cx, H - 4);
      ctx.moveTo(4, cy);
      ctx.lineTo(W - 4, cy);
      ctx.stroke();
      ctx.setLineDash([]);

      // Rotating Radar Sweep Beam
      this.minimapSweep = ((this.minimapSweep || 0) + 0.04) % (Math.PI * 2);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(this.minimapSweep);
      const sweepGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, R);
      sweepGrad.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
      sweepGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, R, 0, 0.55);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Doorway blips on radar perimeter
      const doorways = {
        OFFICE_HALL: [
          { dir: 'N', angle: -Math.PI / 2 },
          { dir: 'SW', angle: Math.PI * 0.75 },
          { dir: 'E', angle: 0 }
        ],
        BOSS_CABINET: [{ dir: 'SE', angle: Math.PI * 0.25 }],
        CORNER_OFFICE: [{ dir: 'NE', angle: -Math.PI * 0.25 }],
        CAFETERIA: [
          { dir: 'W', angle: Math.PI },
          { dir: 'E', angle: 0 }
        ],
        BIG_WORKPLACE: [
          { dir: 'W', angle: Math.PI },
          { dir: 'NE', angle: -Math.PI * 0.3 }
        ],
        CONFERENCE_ROOM: [{ dir: 'SW', angle: Math.PI * 0.75 }]
      };
      const roomDoors = doorways[currentRoomId] || [];
      roomDoors.forEach(d => {
        const dx = cx + Math.cos(d.angle) * 44;
        const dy = cy + Math.sin(d.angle) * 44;
        ctx.fillStyle = '#38bdf8';
        ctx.beginPath();
        ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // Track NPCs in current scene (Offline & Online)
      this.renderMinimapNPCs(ctx, currentRoomId, cx, cy);

      // Track Remote Multiplayer Peers in current scene
      if (window.multiplayerEngine && window.multiplayerEngine.peers) {
        window.multiplayerEngine.peers.forEach(peer => {
          if (peer.scene === currentRoomId) {
            const px = Number.isFinite(peer.x) ? peer.x : 512;
            const py = Number.isFinite(peer.y) ? peer.y : 288;
            const radX = cx + ((px / 1024) - 0.5) * 78;
            const radY = cy + ((py / 576) - 0.5) * 78;

            // Glowing Emerald Blip
            ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';
            ctx.beginPath();
            ctx.arc(radX, radY, 6, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.arc(radX, radY, 3.2, 0, Math.PI * 2);
            ctx.fill();

            // Initial letter
            ctx.font = 'bold 7px "Outfit", sans-serif';
            ctx.fillStyle = '#f1f5f9';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            const initial = (peer.name || 'C')[0].toUpperCase();
            ctx.fillText(initial, radX, radY - 4);
          }
        });
      }

      // Track Local Player in current scene
      const p = (window.state && window.state.player) ? window.state.player : { x: 512, y: 288, direction: 'down' };
      const plRadX = cx + ((p.x / 1024) - 0.5) * 78;
      const plRadY = cy + ((p.y / 576) - 0.5) * 78;

      // Facing Direction Vision Cone
      const dirAngles = { up: -Math.PI / 2, down: Math.PI / 2, left: Math.PI, right: 0 };
      const facingAngle = dirAngles[p.direction] !== undefined ? dirAngles[p.direction] : Math.PI / 2;

      ctx.save();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.28)';
      ctx.beginPath();
      ctx.moveTo(plRadX, plRadY);
      ctx.arc(plRadX, plRadY, 18, facingAngle - 0.42, facingAngle + 0.42);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Pulsing Sonar Ping for Local Player
      const pingPhase = (performance.now() / 850) % 1;
      ctx.strokeStyle = `rgba(245, 158, 11, ${1 - pingPhase})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(plRadX, plRadY, 4 + pingPhase * 9, 0, Math.PI * 2);
      ctx.stroke();

      // Golden Core
      ctx.fillStyle = '#f59e0b';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(plRadX, plRadY, 3.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Bright white center dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(plRadX, plRadY, 1.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    renderMinimapNPCs(ctx, roomId, cx, cy) {
      const npcsByRoom = {
        BOSS_CABINET: [
          { name: 'Boss Anakin', x: 295, y: 350, icon: '👔', color: '#f43f5e' }
        ],
        CORNER_OFFICE: [
          { name: 'HR Elena', x: 420, y: 470, icon: '👩‍💼', color: '#a855f7' }
        ],
        BIG_WORKPLACE: [
          { name: 'Rahul', x: 270, y: 320, icon: '👨‍💻', color: '#10b981' },
          { name: 'Priya', x: 520, y: 320, icon: '👩‍💻', color: '#10b981' },
          { name: 'Amit', x: 270, y: 460, icon: '👨‍💻', color: '#10b981' },
          { name: 'Neha', x: 520, y: 460, icon: '👩‍💻', color: '#10b981' }
        ],
        CAFETERIA: [
          { name: 'Espresso Bar', x: 490, y: 270, icon: '☕', color: '#f59e0b' }
        ],
        CONFERENCE_ROOM: [
          { name: 'Telemetry Lead', x: 810, y: 380, icon: '📊', color: '#818cf8' }
        ]
      };

      const list = npcsByRoom[roomId] || [];
      list.forEach(npc => {
        const nx = cx + ((npc.x / 1024) - 0.5) * 78;
        const ny = cy + ((npc.y / 576) - 0.5) * 78;

        ctx.fillStyle = npc.color || '#38bdf8';
        ctx.beginPath();
        ctx.arc(nx, ny, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = '8px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(npc.icon, nx, ny - 6);
      });
    }

    getCanvasPos(e) {
      const rect = this.canvas.getBoundingClientRect();
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY
      };
    }

    handleCanvasHover(e) {
      const pos = this.getCanvasPos(e);
      let found = null;
      for (const key in ROOMS_CONFIG) {
        const r = ROOMS_CONFIG[key].rect;
        if (pos.x >= r.x && pos.x <= r.x + r.w && pos.y >= r.y && pos.y <= r.y + r.h) {
          found = key;
          break;
        }
      }
      this.hoveredRoomId = found;
      this.canvas.style.cursor = found ? 'pointer' : 'default';
    }

    handleCanvasClick(e) {
      const pos = this.getCanvasPos(e);
      for (const key in ROOMS_CONFIG) {
        const r = ROOMS_CONFIG[key].rect;
        if (pos.x >= r.x && pos.x <= r.x + r.w && pos.y >= r.y && pos.y <= r.y + r.h) {
          this.selectedRoomId = key;
          if (window.soundManager) window.soundManager.playInteract();
          this.updateSidebarIntel();
          break;
        }
      }
    }

    handleFastTravel() {
      const targetRoom = ROOMS_CONFIG[this.selectedRoomId];
      if (!targetRoom) return;

      const currentRoomId = (window.state && window.state.currentScene) ? window.state.currentScene : '';
      if (currentRoomId === targetRoom.id) {
        if (window.showToast) window.showToast('📍 You are already in the ' + targetRoom.name + '!');
        return;
      }

      // Execute scene switch
      if (typeof window.switchScene === 'function') {
        if (window.soundManager) window.soundManager.playDoorOpen();
        window.switchScene(targetRoom.id, targetRoom.spawn.x, targetRoom.spawn.y, targetRoom.spawn.dir || 'down');
        this.close();
        if (window.showToast) {
          window.showToast(`🚀 Teleported to ${targetRoom.name} (${targetRoom.subtitle})`);
        }
      }
    }

    updateSidebarIntel() {
      const room = ROOMS_CONFIG[this.selectedRoomId] || ROOMS_CONFIG['OFFICE_HALL'];
      const currentRoomId = (window.state && window.state.currentScene) ? window.state.currentScene : '';
      const isCurrent = (currentRoomId === room.id);

      const titleEl = document.getElementById('map-intel-title');
      const codeEl = document.getElementById('map-intel-code');
      const subEl = document.getElementById('map-intel-subtitle');
      const descEl = document.getElementById('map-intel-desc');
      const featuresEl = document.getElementById('map-intel-features');
      const travelBtn = document.getElementById('btn-map-fast-travel');
      const currentBadge = document.getElementById('map-intel-current-badge');
      const coordEl = document.getElementById('map-live-coords');

      if (titleEl) titleEl.textContent = `${room.icon} ${room.name}`;
      if (codeEl) {
        codeEl.textContent = room.code;
        codeEl.style.color = room.themeColor;
      }
      if (subEl) subEl.textContent = room.subtitle;
      if (descEl) descEl.textContent = room.desc;

      if (featuresEl) {
        featuresEl.innerHTML = '';
        room.features.forEach(f => {
          const pill = document.createElement('div');
          pill.className = 'map-feature-chip' + (f.highlight ? ' highlight' : '');
          pill.innerHTML = `<span class="chip-icon">${f.icon}</span> <span class="chip-label">${f.label}</span>`;
          featuresEl.appendChild(pill);
        });
      }

      if (currentBadge) {
        currentBadge.classList.toggle('hidden', !isCurrent);
      }

      if (travelBtn) {
        if (isCurrent) {
          travelBtn.innerHTML = `<span>📍 CURRENT LOCATION</span>`;
          travelBtn.disabled = true;
          travelBtn.classList.add('disabled');
        } else {
          travelBtn.innerHTML = `<span>🚀 FAST TRAVEL TO THIS ROOM</span>`;
          travelBtn.disabled = false;
          travelBtn.classList.remove('disabled');
        }
      }

      if (coordEl && window.state && window.state.player) {
        coordEl.textContent = `PLAYER POSITION: X: ${Math.round(window.state.player.x)}, Y: ${Math.round(window.state.player.y)}`;
      }
    }

    render() {
      const ctx = this.ctx;
      if (!ctx) return;

      const W = this.canvas.width;
      const H = this.canvas.height;
      const currentRoomId = (window.state && window.state.currentScene) ? window.state.currentScene : 'OFFICE_HALL';

      // 1. Blueprint Background (Navy Blue + Holographic Grid + Generated Schematic Artwork)
      ctx.fillStyle = '#070b14';
      ctx.fillRect(0, 0, W, H);

      if (this.blueprintImg && this.blueprintImg.complete && this.blueprintImg.naturalWidth > 0) {
        ctx.save();
        ctx.globalAlpha = 0.28;
        ctx.drawImage(this.blueprintImg, 0, 0, W, H);
        ctx.restore();
      }

      // Cyber Holographic Grid
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 24;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, H);
        ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(W, y);
        ctx.stroke();
      }

      // Subtle blueprint coordinate marks
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.font = '8px monospace';
      ctx.fillText('ACME CORP • CORPORATE HEADQUARTERS ARCHITECTURAL SCHEMATIC // LEVEL 12', 40, 20);
      ctx.fillText('GRID: 1024m² PERSPECTIVE', W - 180, 20);

      // 2. Render Connecting Corridors & Doorways First (behind room walls)
      this.renderCorridors(ctx);

      // 3. Render Each Room Block
      for (const key in ROOMS_CONFIG) {
        const room = ROOMS_CONFIG[key];
        const isCurrent = (key === currentRoomId);
        const isSelected = (key === this.selectedRoomId);
        const isHovered = (key === this.hoveredRoomId);
        this.renderRoom(ctx, room, isCurrent, isSelected, isHovered);
      }

      // 4. Render Characters across all office wings (Local player, remote peers, NPCs)
      this.renderAllCharacterPins(ctx);
    }

    renderCorridors(ctx) {
      CORRIDORS.forEach(c => {
        ctx.save();

        // Neon Glow Corridor Track
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 14;
        ctx.lineCap = 'square';
        ctx.beginPath();
        ctx.moveTo(c.x1, c.y1);
        ctx.lineTo(c.x2, c.y2);
        ctx.stroke();

        // Walkway floor pattern
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(c.x1, c.y1);
        ctx.lineTo(c.x2, c.y2);
        ctx.stroke();

        // Pulsing directional center line
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(c.x1, c.y1);
        ctx.lineTo(c.x2, c.y2);
        ctx.stroke();

        // Door icon at midpoint
        const midX = (c.x1 + c.x2) / 2;
        const midY = (c.y1 + c.y2) / 2;
        ctx.fillStyle = '#38bdf8';
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🚪', midX, midY);

        ctx.restore();
      });
    }

    renderRoom(ctx, room, isCurrent, isSelected, isHovered) {
      const r = room.rect;
      ctx.save();

      // Room Card Background
      if (isCurrent) {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      } else if (isHovered) {
        ctx.fillStyle = 'rgba(30, 41, 59, 0.85)';
      } else {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
      }

      // Rounded rectangle room body
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(r.x, r.y, r.w, r.h, 8);
      else ctx.rect(r.x, r.y, r.w, r.h);
      ctx.fill();

      // Room Border Glow
      if (isCurrent) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 14;
      } else if (isSelected) {
        ctx.strokeStyle = room.themeColor;
        ctx.lineWidth = 2;
        ctx.shadowColor = room.themeColor;
        ctx.shadowBlur = 8;
      } else if (isHovered) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
        ctx.lineWidth = 1.8;
      } else {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.lineWidth = 1.2;
      }
      ctx.stroke();
      ctx.restore();

      // Interior Architectural Top-View Furniture Decor
      this.renderRoomFurniture(ctx, room);

      // Room Header: Icon + Title
      ctx.save();
      ctx.font = 'bold 11px "Outfit", sans-serif';
      ctx.fillStyle = isCurrent ? '#38bdf8' : '#f8fafc';
      ctx.fillText(`${room.icon} ${room.name}`, r.x + 10, r.y + 18);

      // Room Code / Subtitle
      ctx.font = '7.5px "Press Start 2P", monospace';
      ctx.fillStyle = room.themeColor;
      ctx.fillText(room.code, r.x + 10, r.y + 30);

      // "YOU ARE HERE" Banner if active room
      if (isCurrent) {
        const badgeW = 92;
        const badgeH = 14;
        const badgeX = r.x + r.w - badgeW - 6;
        const badgeY = r.y + 6;

        ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (ctx.roundRect) ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
        else ctx.rect(badgeX, badgeY, badgeW, badgeH);
        ctx.fill();
        ctx.stroke();

        ctx.font = 'bold 7.5px "Outfit", sans-serif';
        ctx.fillStyle = '#38bdf8';
        ctx.fillText('● CURRENT ROOM', badgeX + 6, badgeY + 10);
      }
      ctx.restore();
    }

    renderRoomFurniture(ctx, room) {
      const r = room.rect;
      ctx.save();

      // Draw subtle interior gridlines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 0.8;
      for (let x = r.x + 20; x < r.x + r.w - 10; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, r.y + 38);
        ctx.lineTo(x, r.y + r.h - 10);
        ctx.stroke();
      }

      // Draw feature station icons at relative positions
      room.features.forEach(f => {
        const fx = r.x + f.x * r.w;
        const fy = r.y + f.y * r.h;

        // Station dot
        ctx.fillStyle = f.highlight ? 'rgba(245, 158, 11, 0.85)' : 'rgba(148, 163, 184, 0.55)';
        ctx.beginPath();
        ctx.arc(fx, fy, f.highlight ? 4 : 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Station Icon emoji
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(f.icon, fx, fy);

        // Small label text under prominent stations
        if (f.highlight) {
          ctx.font = 'bold 7px "Outfit", sans-serif';
          ctx.fillStyle = '#f59e0b';
          ctx.fillText(f.label, fx, fy + 12);
        }
      });

      ctx.restore();
    }

    renderAllCharacterPins(ctx) {
      // 1. Render NPCs across all office wings (Lord Skywalker, HR Elena, Mentors, etc.)
      const globalNPCs = [
        { scene: 'BOSS_CABINET', name: '👔 Lord Skywalker (CEO)', icon: '👔', color: '#f43f5e', relX: 0.35, relY: 0.50 },
        { scene: 'CORNER_OFFICE', name: '👩‍💼 HR Elena (VP People)', icon: '👩‍💼', color: '#a855f7', relX: 0.45, relY: 0.58 },
        { scene: 'BIG_WORKPLACE', name: '👨‍💻 Rahul (PR)', icon: '👨‍💻', color: '#10b981', relX: 0.25, relY: 0.45 },
        { scene: 'BIG_WORKPLACE', name: '👩‍💻 Priya (UX)', icon: '👩‍💻', color: '#10b981', relX: 0.50, relY: 0.45 },
        { scene: 'BIG_WORKPLACE', name: '👨‍💻 Amit (DB)', icon: '👨‍💻', color: '#10b981', relX: 0.25, relY: 0.75 },
        { scene: 'BIG_WORKPLACE', name: '👩‍💻 Neha (SRE)', icon: '👩‍💻', color: '#10b981', relX: 0.50, relY: 0.75 },
        { scene: 'CONFERENCE_ROOM', name: '📊 Telemetry Lead', icon: '📊', color: '#818cf8', relX: 0.90, relY: 0.50 }
      ];

      globalNPCs.forEach(npc => {
        const room = ROOMS_CONFIG[npc.scene];
        if (!room) return;
        const rx = room.rect;
        const x = Math.round(rx.x + npc.relX * rx.w);
        const y = Math.round(rx.y + npc.relY * rx.h);

        ctx.save();
        // Subtle ambient aura
        ctx.fillStyle = npc.color + '33';
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.fill();

        // Pin core
        ctx.fillStyle = npc.color;
        ctx.beginPath();
        ctx.arc(x, y, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Icon
        ctx.font = '9px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(npc.icon, x, y - 8);

        // Name tag
        ctx.font = 'bold 7px "Outfit", sans-serif';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(npc.name, x, y + 10);
        ctx.restore();
      });

      // 2. Render Live Remote Peers in Multiplayer across all rooms
      if (window.multiplayerEngine && window.multiplayerEngine.peers) {
        window.multiplayerEngine.peers.forEach(peer => {
          const peerScene = peer.scene || 'OFFICE_HALL';
          const peerRoom = ROOMS_CONFIG[peerScene];
          if (peerRoom) {
            const rx = peerRoom.rect;
            const px = Number.isFinite(peer.x) ? peer.x : 512;
            const py = Number.isFinite(peer.y) ? peer.y : 288;
            const mappedX = Math.round(rx.x + 16 + (px / 1024) * (rx.w - 32));
            const mappedY = Math.round(rx.y + 36 + (py / 576) * (rx.h - 48));

            ctx.save();
            // Pulsing Emerald Ping
            const peerPulse = (performance.now() / 900) % 1;
            ctx.strokeStyle = `rgba(16, 185, 129, ${1 - peerPulse})`;
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(mappedX, mappedY, 4 + peerPulse * 12, 0, Math.PI * 2);
            ctx.stroke();

            // Emerald Aura
            ctx.fillStyle = 'rgba(16, 185, 129, 0.4)';
            ctx.beginPath();
            ctx.arc(mappedX, mappedY, 6, 0, Math.PI * 2);
            ctx.fill();

            // Peer dot
            ctx.fillStyle = '#10b981';
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(mappedX, mappedY, 3.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Name callout pill
            const peerName = `🟢 ${peer.name || peer.username || 'Coworker'}`;
            ctx.font = 'bold 7.5px "Outfit", sans-serif';
            const tw = ctx.measureText(peerName).width;
            const pillW = tw + 8;
            const pillH = 13;
            const pillX = Math.round(mappedX - pillW / 2);
            const pillY = Math.round(mappedY - 20);

            ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 1;
            ctx.beginPath();
            if (ctx.roundRect) ctx.roundRect(pillX, pillY, pillW, pillH, 3);
            else ctx.rect(pillX, pillY, pillW, pillH);
            ctx.fill();
            ctx.stroke();

            ctx.fillStyle = '#a7f3d0';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(peerName, mappedX, pillY + 7);
            ctx.restore();
          }
        });
      }

      // 3. Render Main Player's Live "YOU ARE HERE" Beacon Pin
      this.renderPlayerPin(ctx);
    }

    renderPlayerPin(ctx) {
      const currentRoomId = (window.state && window.state.currentScene) ? window.state.currentScene : 'OFFICE_HALL';
      const currentRoom = ROOMS_CONFIG[currentRoomId];
      if (!currentRoom) return;

      const p = window.state ? window.state.player : { x: 512, y: 288 };
      const rx = currentRoom.rect;

      // Map player (x: 0..1024, y: 0..576) to this room's blueprint bounds with safe margins
      const padX = 22;
      const padY = 38;
      const availW = rx.w - padX * 2;
      const availH = rx.h - padY - 14;

      const normX = Math.max(0.04, Math.min(0.96, p.x / 1024));
      const normY = Math.max(0.04, Math.min(0.96, p.y / 576));

      const pinX = Math.round(rx.x + padX + normX * availW);
      const pinY = Math.round(rx.y + padY + normY * availH);

      ctx.save();

      // 1. Expanding Sonar Radar Wave Pings
      const maxRadius = 26;
      for (let i = 0; i < 2; i++) {
        const phase = (this.radarPulse + i * 0.5) % 1;
        const radius = 6 + phase * maxRadius;
        const alpha = Math.max(0, 1 - phase);
        ctx.strokeStyle = `rgba(56, 189, 248, ${alpha * 0.85})`;
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.arc(pinX, pinY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      // 2. High-Tech Golden Beacon Aura Ring
      ctx.fillStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.beginPath();
      ctx.arc(pinX, pinY, 9, 0, Math.PI * 2);
      ctx.fill();

      // 3. Player Avatar / Head Circle
      ctx.save();
      ctx.beginPath();
      ctx.arc(pinX, pinY, 7, 0, Math.PI * 2);
      ctx.clip();

      if (this.avatarImg && this.avatarImg.complete && this.avatarImg.naturalWidth > 0) {
        ctx.drawImage(this.avatarImg, pinX - 8, pinY - 8, 16, 16);
      } else {
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(pinX - 8, pinY - 8, 16, 16);
      }
      ctx.restore();

      // Avatar Border Ring
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(pinX, pinY, 7.5, 0, Math.PI * 2);
      ctx.stroke();

      // 4. "YOU ARE HERE" Pin Pill Callout
      const playerName = (window.state && window.state.playerProfile && window.state.playerProfile.name)
        ? window.state.playerProfile.name
        : 'YOU';
      const tagText = `📍 ${playerName}`;

      ctx.font = 'bold 8.5px "Outfit", sans-serif';
      const textW = ctx.measureText(tagText).width;
      const tagW = textW + 12;
      const tagH = 15;
      const tagX = Math.round(pinX - tagW / 2);
      const tagY = Math.round(pinY - 24);

      // Pill Background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.95)';
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.2;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 6;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(tagX, tagY, tagW, tagH, 4);
      else ctx.rect(tagX, tagY, tagW, tagH);
      ctx.fill();
      ctx.stroke();

      // Arrow tip pointing to head
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.moveTo(pinX - 3, tagY + tagH);
      ctx.lineTo(pinX + 3, tagY + tagH);
      ctx.lineTo(pinX, tagY + tagH + 3.5);
      ctx.closePath();
      ctx.fill();

      // Label text
      ctx.fillStyle = '#fef08a';
      ctx.shadowBlur = 0;
      ctx.fillText(tagText, tagX + 6, tagY + 11);

      ctx.restore();
    }
  }

  // Instantiate and expose globally
  window.officeMap = new OfficeMap();

})();

/**
 * 2D Office Simulator Game
 * Top-down Office Hall + Boss Cabinet Adventure
 */

// ==========================================
// ASSET LOADER
// ==========================================
const assets = {
  officeHall: new Image(),
  bossCabinet: new Image(),
  spritesheet: new Image(),
  charIdle: new Image(),
  charBack: new Image(),
  bossPortrait: new Image(),
  playerPortrait: new Image(),
  bossStanding: new Image(),
  bossCharacter: new Image(),
  cornerOffice: new Image(),
  doorSlightlyOpen: new Image(),
  doorLightSpill: new Image(),
  partnerCharacter: new Image(),
  partnerPortrait: new Image(),
  char1Spritesheet: new Image(),
  char2Spritesheet: new Image(),
  char1Avatar: new Image(),
  char2Avatar: new Image(),
  char1Idle: new Image(),
  char2Idle: new Image(),
  char1Sitting: new Image(),
  char2Sitting: new Image(),
  char3Spritesheet: new Image(),
  char3Avatar: new Image(),
  char3Idle: new Image(),
  char3Sitting: new Image()
};

let isGameInitialized = false;
const loadedAssets = new Set();
const totalAssets = Object.keys(assets).length;

function checkAllAssetsLoaded() {
  if (isGameInitialized) return;
  if (loadedAssets.size >= totalAssets) {
    console.log('All game assets loaded successfully!');
    initGame();
  }
}

function registerAsset(key, src) {
  const img = assets[key];
  img.onload = () => {
    loadedAssets.add(key);
    checkAllAssetsLoaded();
  };
  img.onerror = (e) => {
    console.warn('Asset fallback for:', key, src);
    loadedAssets.add(key);
    checkAllAssetsLoaded();
  };
  img.src = src;
  if (img.complete) {
    loadedAssets.add(key);
  }
}

registerAsset('officeHall', 'assets/office_hall.png?v=5');
registerAsset('bossCabinet', 'assets/boss_cabinet.png');
registerAsset('spritesheet', 'assets/spritesheet.png');
registerAsset('charIdle', 'assets/character_idle.png');
registerAsset('charBack', 'assets/char_back.png');
registerAsset('bossPortrait', 'assets/boss_portrait.png?v=3');
registerAsset('playerPortrait', 'assets/player_portrait.png?v=3');
registerAsset('bossStanding', 'assets/boss_standing.png?v=3');
registerAsset('bossCharacter', 'assets/boss_character.png?v=3');
registerAsset('cornerOffice', 'assets/corner_office.png');
registerAsset('doorSlightlyOpen', 'assets/door_slightly_open.png?v=5');
registerAsset('doorLightSpill', 'assets/door_light_spill.png?v=3');
registerAsset('partnerCharacter', 'assets/partner_character.png');
registerAsset('partnerPortrait', 'assets/partner_portrait.png');
registerAsset('char1Spritesheet', 'assets/char1_spritesheet.png');
registerAsset('char2Spritesheet', 'assets/char2_spritesheet.png');
registerAsset('char1Avatar', 'assets/char1_avatar.png');
registerAsset('char2Avatar', 'assets/char2_avatar.png');
registerAsset('char1Idle', 'assets/char1_idle.png');
registerAsset('char2Idle', 'assets/char2_idle.png');
registerAsset('char1Sitting', 'assets/char1_sitting.png?v=3');
registerAsset('char2Sitting', 'assets/char2_sitting.png?v=3');
registerAsset('char3Spritesheet', 'assets/char3_spritesheet.png?v=2');
registerAsset('char3Avatar', 'assets/char3_avatar.png?v=2');
registerAsset('char3Idle', 'assets/char3_idle.png?v=2');
registerAsset('char3Sitting', 'assets/char3_sitting.png?v=3');
registerAsset('char1SeatedDesk', 'assets/char1_seated_desk.png?v=3');
registerAsset('char2SeatedDesk', 'assets/char2_seated_desk.png?v=3');
registerAsset('char3SeatedDesk', 'assets/char3_seated_desk.png?v=3');

// 4 Workplace Quest NPC Employees (Rahul, Priya, Amit, Neha)
registerAsset('npc_rahulSpritesheet', 'assets/npc_rahul_spritesheet.png');
registerAsset('npc_rahulPortrait', 'assets/npc_rahul_portrait.png');
registerAsset('npc_rahulSeated', 'assets/npc_rahul_seated.png');

registerAsset('npc_priyaSpritesheet', 'assets/npc_priya_spritesheet.png');
registerAsset('npc_priyaPortrait', 'assets/npc_priya_portrait.png');
registerAsset('npc_priyaSeated', 'assets/npc_priya_seated.png');

registerAsset('npc_amitSpritesheet', 'assets/npc_amit_spritesheet.png');
registerAsset('npc_amitPortrait', 'assets/npc_amit_portrait.png');
registerAsset('npc_amitSeated', 'assets/npc_amit_seated.png');

registerAsset('npc_nehaSpritesheet', 'assets/npc_neha_spritesheet.png');
registerAsset('npc_nehaPortrait', 'assets/npc_neha_portrait.png');
registerAsset('npc_nehaSeated', 'assets/npc_neha_seated.png');

// Check if all cached already
checkAllAssetsLoaded();

// Safety fallback timeout: launch game within 1.5s even if an image takes long
setTimeout(() => {
  if (!isGameInitialized) {
    console.log('Asset loading safety timeout reached, initializing game...');
    initGame();
  }
}, 1500);

// ==========================================
// GAME STATE & CONSTANTS
// ==========================================
const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 576;

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const state = {
  currentScene: 'OFFICE_HALL', // 'OFFICE_HALL' or 'BOSS_CABINET'
  isTransitioning: false,
  isDialogueOpen: false,
  activePrompt: null,
  toastTimeout: null,
  dialogueTypingInterval: null,
  dialogueDone: false,
  currentDialogueCallback: null,

  // Player state
  player: {
    x: 506,
    y: 340,
    vx: 0,
    vy: 0,
    speed: 160, // base speed
    runSpeed: 240,
    direction: 'up', // 'down', 'up', 'left', 'right'
    isMoving: false,
    animFrame: 0,
    animTimer: 0,
    // Size varies by scene perspective
    scale: 1,
    width: 40,
    height: 85,
    charId: 'char1',
    isSitting: false,
    // Hitbox relative to (x, y) bottom-center (feet only for smooth navigation)
    hitbox: { w: 16, h: 8 }
  },

  // Click-to-move target
  clickTarget: null,
  clickPulse: null,

  // Input states
  keys: {
    up: false,
    down: false,
    left: false,
    right: false,
    sprint: false,
    interact: false
  },

  // Boss state in cabinet
  boss: {
    x: 295,
    y: 350,
    width: 140,
    height: 120,
    talkedCount: 0
  }
};

// ==========================================
// SCENE DEFINITIONS & COLLISIONS
// ==========================================
const SCENES = {
  OFFICE_HALL: {
    name: 'Main Office Hall',
    badge: 'Main Office Hall',
    objective: 'Walk to the wooden door at the top to enter the Boss\'s Cabinet',
    bg: () => assets.officeHall,
    playerScale: 0.55,
    playerWidth: 40,
    playerHeight: 86,
    spawn: { x: 512, y: 245, dir: 'down' },
    // AABB Obstacles - localized to object feet so walkways remain completely open!
    obstacles: [
      // Top wall (leaving wide door corridor open from x: 462 to 560, y <= 214)
      { x: 0, y: 0, w: 462, h: 214, label: 'Wall' },
      { x: 560, y: 0, w: 464, h: 214, label: 'Wall' },
      // Left boundary wall
      { x: 0, y: 0, w: 20, h: CANVAS_HEIGHT, label: 'Wall' },
      // Right boundary wall
      { x: 1004, y: 0, w: 20, h: CANVAS_HEIGHT, label: 'Wall' },
      // Bottom boundary
      { x: 0, y: 555, w: CANVAS_WIDTH, h: 25, label: 'Wall' },

      // Bookshelves along top wall (feet level only)
      { x: 236, y: 195, w: 82, h: 36, label: 'Bookshelf' },
      { x: 712, y: 195, w: 82, h: 36, label: 'Bookshelf' },

      // Water cooler top-right
      { x: 944, y: 190, w: 60, h: 42, label: 'Water Cooler' },

      // Left desk area (top desk)
      { x: 10, y: 300, w: 158, h: 125, label: 'Desk' },
      // Left desk area (bottom desk & trash can)
      { x: 50, y: 440, w: 160, h: 72, label: 'Desk Bottom-Left' },
      { x: 10, y: 440, w: 38, h: 55, label: 'Trash Can' },

      // Center desk cluster (4 separate desks so all aisles and horizontal walkways are open!)
      { x: 350, y: 275, w: 88, h: 55, label: 'Desk Top-Left' },
      { x: 512, y: 275, w: 88, h: 55, label: 'Desk Top-Right' },
      { x: 350, y: 425, w: 88, h: 55, label: 'Desk Bottom-Left' },
      { x: 512, y: 425, w: 88, h: 55, label: 'Desk Bottom-Right' },

      // Right desk
      { x: 765, y: 295, w: 155, h: 135, label: 'Desk' },

      // Right plant (bottom)
      { x: 880, y: 480, w: 85, h: 75, label: 'Plant' }
    ],

    // Interactive Trigger Zones
    triggers: [
      {
        id: 'door_to_boss',
        x: 462, y: 175, w: 98, h: 50,
        prompt: 'Enter Boss\'s Cabinet',
        promptPos: { x: 512, y: 170 },
        action: () => enterBossCabinet()
      },
      {
        id: 'corner_office_entrance',
        x: 0, y: 430, w: 52, h: 130,
        prompt: 'Enter Corner Office',
        promptPos: { x: 26, y: 410 },
        action: () => enterCornerOffice()
      },
      {
        id: 'hall_water_cooler',
        x: 935, y: 180, w: 75, h: 65,
        prompt: 'Drink Ice Cold Water',
        promptPos: { x: 975, y: 170 },
        action: () => {
          window.soundManager.playWater();
          showToast('💧 Gulp, gulp... Refreshing! Stamina restored to 100%.');
        }
      },
      {
        id: 'workstation_bottom_left',
        x: 375, y: 475, w: 75, h: 70,
        prompt: 'Sit at Workstation [E / C]',
        promptPos: { x: 410, y: 460 },
        action: () => toggleSitInChair(410, 512)
      },
      {
        id: 'workstation_bottom_right',
        x: 525, y: 475, w: 75, h: 70,
        prompt: 'Sit at Workstation [E / C]',
        promptPos: { x: 562, y: 460 },
        action: () => toggleSitInChair(562, 515)
      },
      {
        id: 'workstation_top_left',
        x: 375, y: 305, w: 75, h: 70,
        prompt: 'Sit at Workstation [E / C]',
        promptPos: { x: 410, y: 290 },
        action: () => toggleSitInChair(410, 340)
      },
      {
        id: 'workstation_top_right',
        x: 525, y: 305, w: 75, h: 70,
        prompt: 'Sit at Workstation [E / C]',
        promptPos: { x: 560, y: 290 },
        action: () => toggleSitInChair(560, 340)
      },
      {
        id: 'cubicle_pc',
        x: 440, y: 270, w: 70, h: 55,
        prompt: 'Check Coworker PC',
        promptPos: { x: 475, y: 260 },
        action: () => {
          window.soundManager.playInteract();
          showToast('💻 Screen shows: "git commit -m \'Fixed 10 bugs, created 20 new ones\'"');
        }
      },
      {
        id: 'bookshelf_left',
        x: 235, y: 190, w: 85, h: 55,
        prompt: 'Read Policy Manual',
        promptPos: { x: 275, y: 180 },
        action: () => {
          window.soundManager.playInteract();
          showToast('📚 Rule #1: Overtime is mandatory. Rule #2: Coffee is complimentary.');
        }
      },
      {
        id: 'office_plant',
        x: 870, y: 460, w: 95, h: 90,
        prompt: 'Inspect Office Ficus',
        promptPos: { x: 920, y: 450 },
        action: () => {
          window.soundManager.playInteract();
          showToast('🌿 A thriving corporate ficus. Employee of the Month 3 times running.');
        }
      }
    ]
  },

  BOSS_CABINET: {
    name: 'Executive Suite',
    badge: 'Boss\'s Cabinet',
    objective: 'Walk up to the Boss\'s desk to talk, or exit through the right door',
    bg: () => assets.bossCabinet,
    playerScale: 0.95,
    playerWidth: 68,
    playerHeight: 145,
    spawn: { x: 930, y: 495, dir: 'left' },
    // Walkable floor band (y: 475 to 530)
    obstacles: [
      // Top wall barrier
      { x: 0, y: 0, w: CANVAS_WIDTH, h: 468, label: 'Wall' },
      // Bottom barrier
      { x: 0, y: 532, w: CANVAS_WIDTH, h: 50, label: 'Bottom' },
      // Left wall barrier (solid)
      { x: 0, y: 0, w: 45, h: CANVAS_HEIGHT, label: 'Wall' },
      // Right boundary wall
      { x: 995, y: 0, w: 30, h: CANVAS_HEIGHT, label: 'Wall' },

      // Back-wall furniture bases (y <= 472 so foreground floor is 100% open and walkable!)
      { x: 195, y: 440, w: 220, h: 30, label: 'Boss Desk' },
      { x: 575, y: 440, w: 135, h: 30, label: 'Boxes' },
      { x: 715, y: 440, w: 65, h: 30, label: 'Executive Water Cooler' },
      { x: 800, y: 440, w: 75, h: 30, label: 'Filing Cabinet' },
      { x: 885, y: 440, w: 55, h: 30, label: 'Plant' }
    ],

    // Interactive Trigger Zones
    triggers: [
      {
        id: 'door_back_to_hall',
        x: 925, y: 450, w: 70, h: 80,
        prompt: 'Exit to Main Hall',
        promptPos: { x: 955, y: 435 },
        action: () => exitToMainHall()
      },
      {
        id: 'boss_visitor_chair',
        x: 275, y: 455, w: 90, h: 65,
        prompt: 'Sit in Visitor Chair [E / C]',
        promptPos: { x: 320, y: 440 },
        action: () => toggleSitInChair(320, 495)
      },
      {
        id: 'talk_to_boss',
        x: 390, y: 440, w: 120, h: 90,
        prompt: 'Talk to Anakin Skywalker',
        promptPos: { x: 450, y: 410 },
        action: () => startBossDialogue()
      },
      {
        id: 'cabinet_boxes',
        x: 570, y: 440, w: 140, h: 95,
        prompt: 'Inspect Moving Boxes',
        promptPos: { x: 640, y: 430 },
        action: () => {
          window.soundManager.playInteract();
          showToast('📦 Box labeled: "CONFIDENTIAL: Plans to replace everyone with AI Agents"');
        }
      },
      {
        id: 'cabinet_water',
        x: 710, y: 440, w: 75, h: 95,
        prompt: 'Executive Sparkling Water',
        promptPos: { x: 745, y: 430 },
        action: () => {
          window.soundManager.playWater();
          showToast('✨ Sssip... Ultra-purified Alpine glacier water! Tastes like luxury.');
        }
      },
      {
        id: 'filing_cabinet',
        x: 795, y: 440, w: 85, h: 95,
        prompt: 'Search File Cabinet',
        promptPos: { x: 835, y: 430 },
        action: () => {
          window.soundManager.playInteract();
          showToast('🗄️ Found: "Projected 500% profits, employee bonus pool: $0.00"');
        }
      }
    ]
  },

  CORNER_OFFICE: {
    name: 'Executive Corner Suite',
    badge: 'Corner Office',
    objective: 'Explore the study, or exit through the right door',
    bg: () => assets.cornerOffice,
    playerScale: 0.95,
    playerWidth: 68,
    playerHeight: 145,
    spawn: { x: 930, y: 495, dir: 'left' },
    // Walkable floor band (y: 475 to 535)
    obstacles: [
      // Top wall barrier
      { x: 0, y: 0, w: CANVAS_WIDTH, h: 468, label: 'Wall' },
      // Bottom barrier
      { x: 0, y: 535, w: CANVAS_WIDTH, h: 50, label: 'Bottom' },
      // Left wall barrier (solid)
      { x: 0, y: 0, w: 35, h: CANVAS_HEIGHT, label: 'Wall' },
      // Right boundary wall
      { x: 995, y: 0, w: 30, h: CANVAS_HEIGHT, label: 'Wall' },

      // Back-wall furniture bases (y <= 472 so foreground floor is 100% open and walkable!)
      { x: 35, y: 440, w: 60, h: 30, label: 'Coat Rack' },
      { x: 175, y: 440, w: 220, h: 30, label: 'Mahogany Desk' },
      { x: 310, y: 468, w: 30, h: 20, label: 'Senior Partner' },
      { x: 530, y: 440, w: 180, h: 30, label: 'Coffee Table' },
      { x: 715, y: 440, w: 65, h: 30, label: 'Ficus Plant' },
      { x: 795, y: 440, w: 85, h: 30, label: 'Filing Cabinet' },
      { x: 900, y: 440, w: 90, h: 30, label: 'Bookcase' }
    ],

    // Interactive Trigger Zones
    triggers: [
      {
        id: 'exit_corner_to_hall',
        x: 925, y: 450, w: 70, h: 80,
        prompt: 'Exit to Main Hall',
        promptPos: { x: 955, y: 435 },
        action: () => exitCornerOfficeToMainHall()
      },
      {
        id: 'talk_to_partner',
        x: 275, y: 440, w: 100, h: 90,
        prompt: 'Talk to Senior Partner',
        promptPos: { x: 325, y: 410 },
        action: () => startPartnerDialogue()
      },
      {
        id: 'corner_coat_rack',
        x: 35, y: 450, w: 65, h: 90,
        prompt: 'Inspect Detective Coat',
        promptPos: { x: 65, y: 420 },
        action: () => {
          window.soundManager.playInteract();
          showToast('🧥 A classic detective trench coat and fedora. Smells of rain and mystery.');
        }
      },
      {
        id: 'corner_desk_crt',
        x: 210, y: 450, w: 140, h: 90,
        prompt: 'Inspect CRT Terminal',
        promptPos: { x: 280, y: 410 },
        action: () => {
          window.soundManager.playInteract();
          showToast('🖥️ CRT screen glows: "CASE FILE #802: Corporate Intrigue - CLASSIFIED"');
        }
      },
      {
        id: 'corner_tea_table',
        x: 550, y: 450, w: 140, h: 90,
        prompt: 'Sip Jasmine Green Tea',
        promptPos: { x: 620, y: 420 },
        action: () => {
          window.soundManager.playWater();
          showToast('🍵 Freshly brewed hot jasmine tea. The aroma is deeply calming.');
        }
      },
      {
        id: 'corner_scanner',
        x: 795, y: 450, w: 85, h: 90,
        prompt: 'Check Laser Scanner',
        promptPos: { x: 840, y: 420 },
        action: () => {
          window.soundManager.playInteract();
          showToast('🖨️ High-speed scanner: "Ready. 45 confidential dossiers safely archived."');
        }
      },
      {
        id: 'corner_bookcase',
        x: 900, y: 450, w: 85, h: 90,
        prompt: 'Browse Legal Archives',
        promptPos: { x: 940, y: 420 },
        action: () => {
          window.soundManager.playInteract();
          showToast('📚 Leatherbound corporate statutes and encrypted audit ledgers.');
        }
      }
    ]
  }
};

// ==========================================
// INITIALIZATION
// ==========================================
function initGame() {
  if (isGameInitialized) return;
  isGameInitialized = true;

  setupEventListeners();
  setupStartMenuAndLobby();
  setupQuestEventListeners();
  if (window.aiAgent) window.aiAgent.updateHeaderScoreUI();
  updateResponsiveCanvas();
  window.addEventListener('resize', updateResponsiveCanvas);

  // Set initial player spawn in the open hallway
  switchScene('OFFICE_HALL', 512, 245, 'down');

  // Start Real-time Clock
  updateClock();
  setInterval(updateClock, 1000);

  // Game Loop
  lastTime = performance.now();
  requestAnimationFrame(gameLoop);
}

// Canvas Responsive Aspect-Ratio Fit
function updateResponsiveCanvas() {
  const container = document.getElementById('game-container');
  const availableW = container.clientWidth - 16;
  const availableH = container.clientHeight - 16;

  const targetAspect = CANVAS_WIDTH / CANVAS_HEIGHT;
  const screenAspect = availableW / availableH;

  let finalW, finalH;
  if (screenAspect > targetAspect) {
    finalH = availableH;
    finalW = finalH * targetAspect;
  } else {
    finalW = availableW;
    finalH = finalW / targetAspect;
  }

  canvas.style.width = `${Math.floor(finalW)}px`;
  canvas.style.height = `${Math.floor(finalH)}px`;
}

function updateClock() {
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const clockEl = document.getElementById('status-clock');
  if (clockEl) clockEl.textContent = timeStr;
}

// ==========================================
// INPUT CONTROLLER
// ==========================================
function setupEventListeners() {
  const handleKey = (e, isDown) => {
    window.soundManager.unlock();
    const k = (e.key || '').toLowerCase();
    const c = e.code || '';

    let matched = false;
    if (k === 'w' || k === 'arrowup' || c === 'KeyW' || c === 'ArrowUp') {
      state.keys.up = isDown;
      matched = true;
    }
    if (k === 's' || k === 'arrowdown' || c === 'KeyS' || c === 'ArrowDown') {
      state.keys.down = isDown;
      matched = true;
    }
    if (k === 'a' || k === 'arrowleft' || c === 'KeyA' || c === 'ArrowLeft') {
      state.keys.left = isDown;
      matched = true;
    }
    if (k === 'd' || k === 'arrowright' || c === 'KeyD' || c === 'ArrowRight') {
      state.keys.right = isDown;
      matched = true;
    }
    if (k === 'shift' || c === 'ShiftLeft' || c === 'ShiftRight') {
      state.keys.sprint = isDown;
      matched = true;
    }

    if (isDown) {
      // Cancel mouse click-to-move when keyboard is used
      state.clickTarget = null;

      if (k === 'e' || k === ' ' || k === 'enter' || c === 'KeyE' || c === 'Space' || c === 'Enter') {
        handleInteract();
        matched = true;
      }
      if (k === 'c' || c === 'KeyC') {
        toggleSitInChair();
        matched = true;
      }
      if (k === 'm' || c === 'KeyM') toggleSound();
      if (k === 'h' || c === 'KeyH') toggleHelpModal();
      if (k === 'f' || c === 'KeyF') toggleFullscreen();
    }

    if (matched && ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) {
      e.preventDefault();
    }
  };

  window.addEventListener('keydown', (e) => handleKey(e, true));
  window.addEventListener('keyup', (e) => handleKey(e, false));

  // Reset keys when window loses focus to prevent infinite walking
  window.addEventListener('blur', () => {
    state.keys.up = false;
    state.keys.down = false;
    state.keys.left = false;
    state.keys.right = false;
    state.keys.sprint = false;
    state.clickTarget = null;
  });

  // CRT Scanline Shader Toggle
  const btnCrt = document.getElementById('btn-crt');
  if (btnCrt && window.pixelEngine) {
    btnCrt.addEventListener('click', () => {
      window.soundManager.unlock();
      window.soundManager.playInteract();
      const active = window.pixelEngine.toggleCRT();
      btnCrt.style.borderColor = active ? '#10b981' : '';
      btnCrt.style.background = active ? 'rgba(16, 185, 129, 0.25)' : '';
      showToast(active ? '📺 Retro CRT Scanlines: ON' : '📺 Retro CRT Scanlines: OFF');
    });
  }

  // Canvas Click-to-Move
  canvas.addEventListener('click', (e) => {
    window.soundManager.unlock();
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const targetX = (e.clientX - rect.left) * scaleX;
    const targetY = (e.clientY - rect.top) * scaleY;
    state.clickTarget = { x: targetX, y: targetY };
    state.clickPulse = { x: targetX, y: targetY, timer: 0.45 };
  });

  // UI Buttons
  document.getElementById('btn-sound').addEventListener('click', toggleSound);
  document.getElementById('btn-fullscreen').addEventListener('click', toggleFullscreen);
  document.getElementById('btn-help').addEventListener('click', toggleHelpModal);
  document.getElementById('btn-close-help').addEventListener('click', toggleHelpModal);

  // Touch / Mobile D-Pad
  const dpadBtns = document.querySelectorAll('.dpad-btn');
  dpadBtns.forEach(btn => {
    const dir = btn.dataset.dir;
    const startHandler = (e) => {
      e.preventDefault();
      window.soundManager.unlock();
      state.clickTarget = null;
      state.keys[dir] = true;
    };
    const endHandler = (e) => {
      e.preventDefault();
      state.keys[dir] = false;
    };
    btn.addEventListener('touchstart', startHandler);
    btn.addEventListener('touchend', endHandler);
    btn.addEventListener('mousedown', startHandler);
    btn.addEventListener('mouseup', endHandler);
    btn.addEventListener('mouseleave', endHandler);
  });

  const touchAct = document.getElementById('touch-action-btn');
  if (touchAct) {
    touchAct.addEventListener('click', (e) => {
      e.preventDefault();
      window.soundManager.unlock();
      handleInteract();
    });
  }

  const touchSit = document.getElementById('touch-sit-btn');
  if (touchSit) {
    touchSit.addEventListener('click', (e) => {
      e.preventDefault();
      window.soundManager.unlock();
      toggleSitInChair();
    });
  }
}

function toggleSound() {
  const isMuted = window.soundManager.toggleMute();
  const soundIcon = document.getElementById('sound-icon');
  soundIcon.textContent = isMuted ? '🔇' : '🔊';
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen().catch(() => {});
  } else {
    document.exitFullscreen().catch(() => {});
  }
}

function toggleHelpModal() {
  const modal = document.getElementById('help-modal');
  modal.classList.toggle('hidden');
}

// ==========================================
// CHAIR SITTING & INTERACTION
// ==========================================
function toggleSitInChair(chairX, chairY) {
  const p = state.player;
  p.isSitting = !p.isSitting;

  if (p.isSitting) {
    if (chairX !== undefined && chairY !== undefined) {
      p.x = chairX;
      p.y = chairY;
    } else {
      // Find nearest workstation chair in current scene if [C] pressed directly
      const scene = SCENES[state.currentScene];
      let nearestDist = Infinity;
      let nearestTarget = null;
      if (scene && scene.triggers) {
        for (const t of scene.triggers) {
          if (t.id && (t.id.includes('workstation') || t.id.includes('chair'))) {
            const tx = t.promptPos ? t.promptPos.x : (t.x + t.w / 2);
            const ty = t.promptPos ? t.promptPos.y : (t.y + t.h / 2);
            const dist = Math.hypot(p.x - tx, p.y - ty);
            if (dist < nearestDist && dist < 120) {
              nearestDist = dist;
              nearestTarget = t;
            }
          }
        }
      }
      if (nearestTarget && typeof nearestTarget.action === 'function') {
        p.isSitting = false; // reset flag because action will toggle it
        nearestTarget.action();
        return;
      }
    }
    p.direction = 'up'; // face workstation / computer desk
    p.isMoving = false;
    state.clickTarget = null;
    window.soundManager.unlock();
    window.soundManager.playInteract();
    showToast('👨‍💻 Sitting at workstation. Press [E], [C], or move to stand up.');
  } else {
    p.y += 12; // step back cleanly onto the floor
    window.soundManager.unlock();
    window.soundManager.playFootstep(state.currentScene === 'BOSS_CABINET');
    showToast('🚶 Stood up from the chair.');
  }

  // Broadcast sit state
  if (window.multiplayerEngine && window.multiplayerEngine.active) {
    window.multiplayerEngine.broadcastPosition(p, state.currentScene);
  }
}

function handleInteract() {
  if (state.isTransitioning) return;

  // If dialogue box is open
  if (state.isDialogueOpen) {
    if (state.dialogueDone) {
      closeDialogue();
    } else {
      // Speed up text immediately
      fastForwardDialogue();
    }
    return;
  }

  // If an active trigger zone is in range
  if (state.activePrompt && state.activePrompt.action) {
    state.activePrompt.action();
  }
}

function showToast(text, duration = 3500) {
  const toast = document.getElementById('toast-message');
  const toastText = document.getElementById('toast-text');
  toastText.textContent = text;
  toast.classList.remove('hidden');

  if (state.toastTimeout) clearTimeout(state.toastTimeout);
  state.toastTimeout = setTimeout(() => {
    toast.classList.add('hidden');
  }, duration);
}

function openDialogue(speaker, avatarSrc, text, choices = [], onChoice = null) {
  state.isDialogueOpen = true;
  state.dialogueDone = false;
  state.currentDialogueCallback = onChoice;

  const box = document.getElementById('dialogue-box');
  const avatar = document.getElementById('dialogue-avatar');
  const speakerTag = document.getElementById('dialogue-speaker');
  const textEl = document.getElementById('dialogue-text');
  const choicesEl = document.getElementById('dialogue-choices');

  avatar.src = avatarSrc;
  speakerTag.textContent = speaker;
  textEl.innerHTML = '';
  choicesEl.innerHTML = '';
  box.classList.remove('hidden');

  // Typewriter effect
  let charIdx = 0;
  if (state.dialogueTypingInterval) clearInterval(state.dialogueTypingInterval);

  state.dialogueTypingInterval = setInterval(() => {
    if (charIdx < text.length) {
      textEl.textContent += text[charIdx];
      if (charIdx % 2 === 0) {
        window.soundManager.playDialogueBlip(speaker.toLowerCase().includes('boss') ? 'boss' : 'player');
      }
      charIdx++;
    } else {
      clearInterval(state.dialogueTypingInterval);
      state.dialogueDone = true;
      renderChoices(choices);
    }
  }, 22);

  state.fullDialogueText = text;
  state.dialogueChoices = choices;
}

function fastForwardDialogue() {
  if (state.dialogueTypingInterval) {
    clearInterval(state.dialogueTypingInterval);
  }
  const textEl = document.getElementById('dialogue-text');
  textEl.textContent = state.fullDialogueText;
  state.dialogueDone = true;
  renderChoices(state.dialogueChoices);
}

function renderChoices(choices) {
  const choicesEl = document.getElementById('dialogue-choices');
  choicesEl.innerHTML = '';
  if (!choices || choices.length === 0) return;

  choices.forEach((choice, index) => {
    const btn = document.createElement('button');
    btn.className = 'dialogue-choice-btn';
    btn.textContent = choice.label;
    btn.onclick = () => {
      window.soundManager.playInteract();
      if (choice.onSelect) choice.onSelect();
    };
    choicesEl.appendChild(btn);
  });
}

function closeDialogue() {
  state.isDialogueOpen = false;
  const box = document.getElementById('dialogue-box');
  box.classList.add('hidden');
}

// Boss Dialogue Tree
function startBossDialogue() {
  state.boss.talkedCount++;

  if (state.boss.talkedCount === 1) {
    openDialogue(
      'Anakin Skywalker',
      assets.bossPortrait.src,
      'HENDERSON! Who authorized you to step into my executive suite?! I don\'t like sand... or late quarterly reports! Did you finalize the Q3 profitability spreadsheet?!',
      [
        {
          label: 'Yes Lord Skywalker, profits are up 42% across all galactic sectors!',
          onSelect: () => {
            openDialogue(
              'Anakin Skywalker',
              assets.bossPortrait.src,
              'Most impressive. You are granted a seat on the executive council, but we do not grant you the rank of Senior VP! Now get back to the main hall!',
              [{ label: 'Right away, sir!', onSelect: () => closeDialogue() }]
            );
          }
        },
        {
          label: 'Actually sir, I came to ask about that promised salary raise...',
          onSelect: () => {
            openDialogue(
              'Anakin Skywalker',
              assets.bossPortrait.src,
              'A RAISE?! You were the chosen one! It was said that you would destroy the budget deficit, not increase it! You underestimate my power to deny vacation!',
              [{ label: 'Understood, back to my cubicle...', onSelect: () => closeDialogue() }]
            );
          }
        },
        {
          label: 'The coffee machine in the hall is out of beans.',
          onSelect: () => {
            openDialogue(
              'Anakin Skywalker',
              assets.bossPortrait.src,
              'THIS IS OUTRAGEOUS! IT\'S UNFAIR! I brought peace, freedom, justice, and security to this office, but who drank all the espresso?! Fix it immediately!',
              [{ label: 'On it, boss!', onSelect: () => closeDialogue() }]
            );
          }
        }
      ]
    );
  } else {
    // Secondary dialogues
    const randomLines = [
      'Don\'t make me destroy you with mandatory overtime, Henderson! Deadlines don\'t meet themselves!',
      'Did you try the executive sparkling water? It\'s for Jedi Council members only!',
      'From my point of view, the marketing department is evil!',
      'Remember Henderson: in this office, if you\'re not with me, then you\'re my enemy!'
    ];
    const line = randomLines[Math.floor(Math.random() * randomLines.length)];
    openDialogue('Anakin Skywalker', assets.bossPortrait.src, line, [
      { label: 'May the force be with you, sir!', onSelect: () => closeDialogue() }
    ]);
  }
}

// Senior Partner Dialogue Tree
function startPartnerDialogue() {
  if (!state.partner) state.partner = { talkedCount: 0 };
  state.partner.talkedCount++;

  if (state.partner.talkedCount === 1) {
    openDialogue(
      'Senior Partner',
      assets.partnerPortrait.src,
      'Henderson! Good to see someone from the main hall actually making progress. Lord Skywalker has been screaming about quarterly budget spreadsheets all morning...',
      [
        {
          label: 'Lord Skywalker demanded 500% profits and denied my vacation...',
          onSelect: () => {
            openDialogue(
              'Senior Partner',
              assets.partnerPortrait.src,
              'Classic Anakin. Don\'t let his dark side intimidate you. Take a sip of the jasmine tea—it keeps us sane around here.',
              [{ label: 'Thank you, I appreciate that!', onSelect: () => closeDialogue() }]
            );
          }
        },
        {
          label: 'What are you investigating on the whiteboard?',
          onSelect: () => {
            openDialogue(
              'Senior Partner',
              assets.partnerPortrait.src,
              'Classified corporate intrigue. Someone\'s been tampering with the mainframe audit logs after hours. Keep your eyes open.',
              [{ label: 'I\'ll stay vigilant.', onSelect: () => closeDialogue() }]
            );
          }
        },
        {
          label: 'Is there any coffee left in this building?',
          onSelect: () => {
            openDialogue(
              'Senior Partner',
              assets.partnerPortrait.src,
              'Only in Anakin\'s suite, and I wouldn\'t dare touch his espresso beans. Help yourself to our vintage tea set over there.',
              [{ label: 'Sounds refreshing, thanks!', onSelect: () => closeDialogue() }]
            );
          }
        }
      ]
    );
  } else {
    const randomLines = [
      'Stay sharp, Henderson. Corporate politics is a dangerous game.',
      'The CRT terminal has the encrypted audit files if you want to inspect them.',
      'If Anakin starts choking anyone in HR again, let me know immediately.',
      'Have you tried the jasmine green tea? Freshly brewed from the gardens.'
    ];
    const line = randomLines[Math.floor(Math.random() * randomLines.length)];
    openDialogue('Senior Partner', assets.partnerPortrait.src, line, [
      { label: 'Back to work!', onSelect: () => closeDialogue() }
    ]);
  }
}

// ==========================================
// SCENE SWITCHING & DOOR TRANSITIONS
// ==========================================
function switchScene(sceneKey, spawnX, spawnY, spawnDir = 'down') {
  state.currentScene = sceneKey;
  const scene = SCENES[sceneKey];

  // Update HUD
  document.getElementById('location-name').textContent = scene.badge;
  document.getElementById('objective-text').textContent = scene.objective;

  // Set Player Scale & Dimensions
  state.player.scale = scene.playerScale;
  state.player.width = scene.playerWidth;
  state.player.height = scene.playerHeight;
  state.player.hitbox = {
    w: (sceneKey === 'BOSS_CABINET' || sceneKey === 'CORNER_OFFICE') ? 22 : 16,
    h: (sceneKey === 'BOSS_CABINET' || sceneKey === 'CORNER_OFFICE') ? 10 : 8
  };

  // Place player
  state.player.x = spawnX !== undefined ? spawnX : scene.spawn.x;
  state.player.y = spawnY !== undefined ? spawnY : scene.spawn.y;
  state.player.direction = spawnDir;
  state.player.vx = 0;
  state.player.vy = 0;
  state.clickTarget = null;

  // Broadcast scene transition immediately in multiplayer
  if (window.multiplayerEngine && window.multiplayerEngine.active) {
    window.multiplayerEngine.broadcastPosition(state.player, sceneKey);
  }
}

function enterBossCabinet() {
  if (state.isTransitioning) return;
  state.isTransitioning = true;

  window.soundManager.playDoorOpen();
  const overlay = document.getElementById('transition-overlay');
  overlay.classList.remove('hidden');
  overlay.classList.add('active');

  setTimeout(() => {
    switchScene('BOSS_CABINET', 930, 495, 'left');
    window.soundManager.playDoorClose();

    setTimeout(() => {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.classList.add('hidden');
        state.isTransitioning = false;
        showToast('🚪 You entered the Boss\'s Executive Cabinet.');
      }, 350);
    }, 200);
  }, 350);
}

function exitToMainHall() {
  if (state.isTransitioning) return;
  state.isTransitioning = true;

  window.soundManager.playDoorOpen();
  const overlay = document.getElementById('transition-overlay');
  overlay.classList.remove('hidden');
  overlay.classList.add('active');

  setTimeout(() => {
    // Return to hall directly in front of the door
    switchScene('OFFICE_HALL', 512, 245, 'down');
    window.soundManager.playDoorClose();

    setTimeout(() => {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.classList.add('hidden');
        state.isTransitioning = false;
        showToast('🏢 Back in the Main Office Hall.');
      }, 350);
    }, 200);
  }, 350);
}

function enterCornerOffice() {
  if (state.isTransitioning) return;
  state.isTransitioning = true;

  window.soundManager.playDoorOpen();
  const overlay = document.getElementById('transition-overlay');
  overlay.classList.remove('hidden');
  overlay.classList.add('active');

  setTimeout(() => {
    // Enter from the right side just like in boss's room!
    switchScene('CORNER_OFFICE', 930, 495, 'left');
    window.soundManager.playDoorClose();

    setTimeout(() => {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.classList.add('hidden');
        state.isTransitioning = false;
        showToast('🚪 Entered the Executive Corner Office.');
      }, 350);
    }, 200);
  }, 350);
}

function exitCornerOfficeToMainHall() {
  if (state.isTransitioning) return;
  state.isTransitioning = true;

  window.soundManager.playDoorOpen();
  const overlay = document.getElementById('transition-overlay');
  overlay.classList.remove('hidden');
  overlay.classList.add('active');

  setTimeout(() => {
    // Return to Main Hall directly beside the bottom-left doorway facing into the hall
    switchScene('OFFICE_HALL', 65, 525, 'right');
    window.soundManager.playDoorClose();

    setTimeout(() => {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.classList.add('hidden');
        state.isTransitioning = false;
        showToast('🏢 Back in the Main Office Hall.');
      }, 350);
    }, 200);
  }, 350);
}

// ==========================================
// COLLISION DETECTION & PHYSICS
// ==========================================
function getCollisionOverlap(x, y, scene) {
  const pBox = {
    x: x - state.player.hitbox.w / 2,
    y: y - state.player.hitbox.h,
    w: state.player.hitbox.w,
    h: state.player.hitbox.h
  };

  // Room boundary walls
  if (pBox.x < 12 || pBox.x + pBox.w > CANVAS_WIDTH - 12) return 999;
  if (pBox.y < 12 || pBox.y + pBox.h > CANVAS_HEIGHT - 12) return 999;

  let totalOverlap = 0;
  for (const obs of scene.obstacles) {
    const overlapX = Math.min(pBox.x + pBox.w, obs.x + obs.w) - Math.max(pBox.x, obs.x);
    const overlapY = Math.min(pBox.y + pBox.h, obs.y + obs.h) - Math.max(pBox.y, obs.y);
    if (overlapX > 0 && overlapY > 0) {
      totalOverlap += overlapX * overlapY;
    }
  }

  return totalOverlap;
}

function checkCollision(x, y, scene) {
  return getCollisionOverlap(x, y, scene) > 0;
}

// ==========================================
// UPDATE LOOP
// ==========================================
let lastTime = performance.now();

function update(dt) {
  if (state.isDialogueOpen || state.isTransitioning) {
    state.player.isMoving = false;
    return;
  }

  const p = state.player;
  const currentSpeed = state.keys.sprint ? p.runSpeed : p.speed;

  // Directional Vector from Keyboard
  let dx = 0;
  let dy = 0;
  if (state.keys.up) dy -= 1;
  if (state.keys.down) dy += 1;
  if (state.keys.left) dx -= 1;
  if (state.keys.right) dx += 1;

  // Click-to-Move Pathing Support
  if (dx === 0 && dy === 0 && state.clickTarget) {
    const toTargetX = state.clickTarget.x - p.x;
    const toTargetY = state.clickTarget.y - p.y;
    const dist = Math.hypot(toTargetX, toTargetY);
    if (dist > 8) {
      dx = toTargetX / dist;
      dy = toTargetY / dist;
    } else {
      state.clickTarget = null;
    }
  }

  // Normalize diagonal movement
  if (dx !== 0 && dy !== 0) {
    dx *= 0.7071;
    dy *= 0.7071;
  }

  // If sitting in chair and movement key is pressed, stand up!
  if (p.isSitting && (dx !== 0 || dy !== 0)) {
    p.isSitting = false;
    window.soundManager.unlock();
    window.soundManager.playFootstep(state.currentScene === 'BOSS_CABINET');
    showToast('🚶 Stood up from the chair.');
    if (window.multiplayerEngine && window.multiplayerEngine.active) {
      window.multiplayerEngine.broadcastPosition(p, state.currentScene);
    }
  }

  p.isMoving = !p.isSitting && (dx !== 0 || dy !== 0);

  if (p.isMoving) {
    // Set Facing Direction
    if (Math.abs(dy) > Math.abs(dx)) {
      p.direction = dy < 0 ? 'up' : 'down';
    } else {
      p.direction = dx < 0 ? 'left' : 'right';
    }

    // Walking animation cycle
    p.animTimer += dt * (state.keys.sprint ? 12 : 8);
    p.animFrame = Math.floor(p.animTimer) % 4;

    // Footstep audio
    const isTile = state.currentScene === 'BOSS_CABINET';
    window.soundManager.playFootstep(isTile);

    // Spawn footstep particles via pixelEngine
    if (window.pixelEngine && window.pixelEngine.particles) {
      window.pixelEngine.particles.spawnFootstepDust(p.x, p.y, state.keys.sprint, isTile);
    }

    // Collision Sliding & Unstick Mechanics:
    // If movement reduces or maintains 0 overlap, it is 100% allowed!
    const scene = SCENES[state.currentScene];
    const targetX = p.x + dx * currentSpeed * dt;
    const targetY = p.y + dy * currentSpeed * dt;

    const curOverlap = getCollisionOverlap(p.x, p.y, scene);

    const newOverlapX = getCollisionOverlap(targetX, p.y, scene);
    if (newOverlapX === 0 || newOverlapX < curOverlap) {
      p.x = targetX;
    }

    const newOverlapY = getCollisionOverlap(p.x, targetY, scene);
    if (newOverlapY === 0 || newOverlapY < curOverlap) {
      p.y = targetY;
    }
  } else {
    p.animFrame = 0;
  }

  // Check Door Auto-Entry in Office Hall (walking straight into top door)
  if (state.currentScene === 'OFFICE_HALL' && p.y <= 218 && p.x >= 465 && p.x <= 555) {
    enterBossCabinet();
    return;
  }

  // Check Entrance to Corner Office in Office Hall (exact bottom-left place shown in picture)
  if (state.currentScene === 'OFFICE_HALL' && p.x <= 55 && p.y >= 520) {
    enterCornerOffice();
    return;
  }

  // Check Exit Door in Boss Cabinet (walking into right doorway)
  if (state.currentScene === 'BOSS_CABINET' && p.x >= 975 && p.y >= 450) {
    exitToMainHall();
    return;
  }

  // Check Exit Door in Corner Office (walking into right doorway)
  if (state.currentScene === 'CORNER_OFFICE' && p.x >= 975 && p.y >= 450) {
    exitCornerOfficeToMainHall();
    return;
  }

  // Trigger Zone Detection
  updateTriggers();

  // Multiplayer Real-time Synchronization
  if (window.multiplayerEngine && window.multiplayerEngine.active) {
    window.multiplayerEngine.broadcastPosition(p, state.currentScene);
    window.multiplayerEngine.updateRemotePlayers(dt);
  }

  // Pixel Particles & Ambient Emitters Update
  if (window.pixelEngine && window.pixelEngine.particles) {
    if (state.activePrompt && state.activePrompt.promptPos) {
      window.pixelEngine.particles.spawnEmbers(state.activePrompt.promptPos.x, state.activePrompt.promptPos.y);
    }
    if (state.currentScene === 'OFFICE_HALL') {
      window.pixelEngine.particles.spawnWaterSparkles(970, 210);
    }
    window.pixelEngine.particles.update(dt);
  }

  // Autonomous AI NPC Routines
  if (window.aiAgent) {
    window.aiAgent.update(dt * 1000);
  }
}

function updateTriggers() {
  const scene = SCENES[state.currentScene];
  const p = state.player;

  let foundTrigger = null;

  // 1. Check proximity to autonomous Workplace Quest NPCs
  if (window.aiAgent && window.aiAgent.npcs) {
    for (const npc of window.aiAgent.npcs) {
      if (npc.scene === state.currentScene) {
        const dist = Math.hypot(p.x - npc.x, p.y - npc.y);
        if (dist < 65) {
          const quest = window.aiAgent.quests[npc.questId];
          foundTrigger = {
            id: `talk_to_${npc.id}`,
            npcId: npc.id,
            questId: npc.questId,
            prompt: `Talk to ${npc.name} (${npc.role}) - ${quest.title} [E]`,
            promptPos: { x: npc.x, y: npc.y - 75 },
            action: () => openQuestModal(npc.questId, npc.id)
          };
          break;
        }
      }
    }
  }

  // 2. Standard Scene Triggers (Doors, water cooler, workstations)
  if (!foundTrigger) {
    for (const trig of scene.triggers) {
      const dist = Math.hypot(p.x - (trig.x + trig.w / 2), p.y - (trig.y + trig.h / 2));
      if (dist < 65 || (
        p.x >= trig.x - 20 && p.x <= trig.x + trig.w + 20 &&
        p.y >= trig.y - 20 && p.y <= trig.y + trig.h + 20
      )) {
        foundTrigger = trig;
        break;
      }
    }
  }

  state.activePrompt = foundTrigger;
}

// ==========================================
// RENDER LOOP
// ==========================================
function render() {
  // Guarantee context transform is completely reset to identity on every single frame
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  const scene = SCENES[state.currentScene];

  // 1. Draw Room Background
  const bg = scene.bg();
  if (bg && bg.complete) {
    ctx.drawImage(bg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  // 2. Draw Scene-Specific Interactive Decor / Characters
  if (state.currentScene === 'BOSS_CABINET') {
    renderBossInCabinet();
  } else if (state.currentScene === 'OFFICE_HALL') {
    renderDoorGlow();
  } else if (state.currentScene === 'CORNER_OFFICE') {
    renderCornerOffice();
  }

  // 3. Draw Autonomous AI NPCs (Rahul, Priya, Amit, Neha)
  if (window.aiAgent) {
    window.aiAgent.render(ctx, state.currentScene, assets, scene.playerScale);
  }

  // 3b. Draw Player Character
  renderPlayer();

  // 3c. Draw Other Online Players in Same Scene
  renderRemotePlayers();

  // 4. Draw Foreground Elements (e.g. if character walks behind desk)
  renderForeground();

  // 5. Draw Click Target Pulse
  if (state.clickPulse && state.clickPulse.timer > 0) {
    state.clickPulse.timer -= 0.016;
    const progress = 1 - Math.max(0, state.clickPulse.timer / 0.45);
    const radius = 6 + progress * 16;
    const alpha = Math.max(0, 1 - progress);
    ctx.save();
    ctx.strokeStyle = `rgba(245, 158, 11, ${alpha})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(state.clickPulse.x, state.clickPulse.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  // 6. Draw Floating Golden Triangle Indicator above any active interactable object
  if (state.activePrompt && state.activePrompt.promptPos && state.activePrompt.id !== 'door_to_boss' && state.activePrompt.id !== 'corner_office_entrance') {
    if (state.activePrompt.id === 'talk_to_boss') {
      drawGoldenTriangle(450, 320);
    } else if (state.activePrompt.id === 'talk_to_partner') {
      drawGoldenTriangle(325, 320);
    } else {
      drawGoldenTriangle(state.activePrompt.promptPos.x, state.activePrompt.promptPos.y - 20);
    }
  }

  // 7. Render Pixel Particles (Dust puffs, golden embers, water sparkles)
  if (window.pixelEngine && window.pixelEngine.particles) {
    window.pixelEngine.particles.render(ctx);
  }

  // 8. Render Ambient Retro Office Lighting & Vignette
  if (window.pixelEngine) {
    window.pixelEngine.renderAmbientLighting(ctx, CANVAS_WIDTH, CANVAS_HEIGHT, state.currentScene);
  }

  // 9. Render Retro CRT Scanline Shader (if toggled ON)
  if (window.pixelEngine) {
    window.pixelEngine.renderCRTScanlines(ctx, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
}

// Floating Golden Triangle Indicator (exact same style as above the door)
function drawGoldenTriangle(x, y) {
  const time = performance.now() * 0.003;
  const arrowY = y + Math.sin(time * 1.5) * 4;
  ctx.save();
  ctx.fillStyle = '#f59e0b';
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 8;
  ctx.beginPath();
  ctx.moveTo(x, arrowY + 12);
  ctx.lineTo(x - 8, arrowY);
  ctx.lineTo(x + 8, arrowY);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function renderDoorGlow() {
  const time = performance.now() * 0.003;
  const pulse = (Math.sin(time) + 1) * 0.5;

  // 1. Top Boss Door Animated Glow Highlight
  ctx.save();
  ctx.strokeStyle = `rgba(245, 158, 11, ${0.25 + pulse * 0.45})`;
  ctx.lineWidth = 3;
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 10 + pulse * 8;
  ctx.strokeRect(462, 36, 100, 175);
  ctx.restore();

  // Floating Arrow indicator pointing to Boss's door
  drawGoldenTriangle(512, 32);

  // 2. Frameless Slightly Opened Door in bottom-left corner (flush at x=0, no gaps, no green part)
  if (assets.doorSlightlyOpen && assets.doorSlightlyOpen.complete) {
    ctx.drawImage(assets.doorSlightlyOpen, 0, 430);
  }

  // Floating Golden Triangle indicator pointing to the slightly opened door
  drawGoldenTriangle(26, 405);
}

function renderBossInCabinet() {
  // In the boss cabinet, render Boss full body standing beside his desk
  if (assets.bossCharacter.complete) {
    const bossW = 71;
    const bossH = 145;
    const bossX = 450;
    const bossY = 490;

    // Soft shadow beneath boss feet
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(bossX, bossY - 2, 28, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle idle breathing/bobbing animation
    const breath = Math.sin(performance.now() * 0.003) * 1.5;
    ctx.drawImage(assets.bossCharacter, bossX - bossW / 2, bossY - bossH + breath, bossW, bossH);
  }

  // Floating Golden Triangle indicator pointing to right exit doorway
  drawGoldenTriangle(965, 415);
}

function renderCornerOffice() {
  // In the Corner Office, render Partner full body standing at the marked place (x: 325, y: 485)
  if (assets.partnerCharacter && assets.partnerCharacter.complete) {
    const partnerW = 71;
    const partnerH = 142;
    const partnerX = 325;
    const partnerY = 485;

    // Soft shadow beneath partner feet
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(partnerX, partnerY - 2, 26, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle idle breathing animation
    const breath = Math.sin(performance.now() * 0.003) * 1.5;
    ctx.drawImage(assets.partnerCharacter, partnerX - partnerW / 2, partnerY - partnerH + breath, partnerW, partnerH);
  }

  // Floating Golden Triangle indicator pointing to right exit doorway
  drawGoldenTriangle(965, 415);
}

function renderPlayer() {
  const p = state.player;
  const pw = p.width;
  const ph = p.height;
  const px = p.x - pw / 2;
  const py = p.y - ph;
  const scene = SCENES[state.currentScene];

  ctx.save();

  // If sitting in chair, render character naturally inside the existing in-scene chair!
  if (p.isSitting) {
    let sitImg = assets.char1SeatedDesk || assets.char1Sitting;
    if (p.charId === 'char3' && assets.char3SeatedDesk && assets.char3SeatedDesk.complete && assets.char3SeatedDesk.width > 0) {
      sitImg = assets.char3SeatedDesk;
    } else if (p.charId === 'char2' && assets.char2SeatedDesk && assets.char2SeatedDesk.complete && assets.char2SeatedDesk.width > 0) {
      sitImg = assets.char2SeatedDesk;
    } else if (assets.char1SeatedDesk && assets.char1SeatedDesk.complete && assets.char1SeatedDesk.width > 0) {
      sitImg = assets.char1SeatedDesk;
    } else if (p.charId === 'char3' && assets.char3Sitting && assets.char3Sitting.complete && assets.char3Sitting.width > 0) {
      sitImg = assets.char3Sitting;
    } else if (p.charId === 'char2' && assets.char2Sitting && assets.char2Sitting.complete && assets.char2Sitting.width > 0) {
      sitImg = assets.char2Sitting;
    } else if (assets.char1Sitting && assets.char1Sitting.complete && assets.char1Sitting.width > 0) {
      sitImg = assets.char1Sitting;
    }

    if (sitImg && sitImg.complete && sitImg.width > 0) {
      const scale = scene.playerScale || 0.55;
      const isMultiFrame = sitImg.width >= 200;
      const frameW = isMultiFrame ? Math.round(sitImg.width / 4) : sitImg.width;
      const frameH = sitImg.height;
      // 4-frame dynamic typing animation
      const animFrame = isMultiFrame ? (Math.floor(performance.now() / 140) % 4) : 0;
      const sx = animFrame * frameW;
      const sy = 0;

      const dw = Math.round(frameW * scale);
      const dh = Math.round(frameH * scale);
      const dx = Math.round(p.x - dw / 2);
      // Gentle typing breath / arm rhythm
      const breath = Math.sin(performance.now() * 0.005) * 1.0;
      const dy = Math.round(p.y - dh - 5 + breath);

      // Render character seated directly in the existing grey chair!
      ctx.drawImage(sitImg, sx, sy, frameW, frameH, dx, dy, dw, dh);

      // Pixel typing particle sparks directly off the keyboard terminal
      if (window.pixelEngine && window.pixelEngine.particles && Math.random() < 0.28) {
        window.pixelEngine.particles.spawnTypingParticles(p.x, p.y - 45);
      }
    }
    ctx.restore();
    return;
  }

  // 1. Soft Shadow beneath feet
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - 2, pw * 0.42, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Sprite Animation Frame
  let sheet = assets.char1Spritesheet;
  if (p.charId === 'char3' && assets.char3Spritesheet.complete && assets.char3Spritesheet.width > 0) {
    sheet = assets.char3Spritesheet;
  } else if (p.charId === 'char2' && assets.char2Spritesheet.complete && assets.char2Spritesheet.width > 0) {
    sheet = assets.char2Spritesheet;
  } else if (p.charId === 'char1' && assets.char1Spritesheet.complete && assets.char1Spritesheet.width > 0) {
    sheet = assets.char1Spritesheet;
  } else if (assets.spritesheet.complete && assets.spritesheet.width > 0) {
    sheet = assets.spritesheet;
  }

  if (sheet && sheet.complete && sheet.width > 0) {
    const frameW = 74;
    const frameH = 157;
    let row = 0;
    let isFlipped = false;

    if (p.direction === 'down') {
      row = 0;
    } else if (p.direction === 'up') {
      row = 2;
    } else if (p.direction === 'right') {
      row = 1;
    } else if (p.direction === 'left') {
      row = 1;
      isFlipped = true;
    }

    const col = p.isMoving ? (p.animFrame % 4) : 0;
    const sx = col * frameW;
    const sy = row * frameH;

    if (isFlipped) {
      ctx.save();
      ctx.translate(px + pw, py);
      ctx.scale(-1, 1);
      ctx.drawImage(sheet, sx, sy, frameW, frameH, 0, 0, pw, ph);
      ctx.restore();
    } else {
      ctx.drawImage(sheet, sx, sy, frameW, frameH, px, py, pw, ph);
    }
  } else if (assets.charIdle.complete) {
    ctx.drawImage(assets.charIdle, px, py, pw, ph);
  }

  ctx.restore();
}

function renderRemotePlayers() {
  if (!window.multiplayerEngine || !window.multiplayerEngine.active) return;

  const currentScene = state.currentScene;
  const scene = SCENES[currentScene];
  const pw = scene.playerWidth || 40;
  const ph = scene.playerHeight || 86;

  window.multiplayerEngine.peers.forEach((peer) => {
    // Only render if peer is currently in the same scene
    if (peer.scene !== currentScene) return;

    // Safety checks for coordinates to prevent NaN crashes
    const posX = Number.isFinite(peer.x) ? peer.x : (Number.isFinite(peer.targetX) ? peer.targetX : 512);
    const posY = Number.isFinite(peer.y) ? peer.y : (Number.isFinite(peer.targetY) ? peer.targetY : 245);

    const px = Math.round(posX - pw / 2);
    const py = Math.round(posY - ph);

    ctx.save();

    try {
      if (peer.isSitting) {
        let sitImg = assets.char1SeatedDesk || assets.char1Sitting;
        if (peer.charId === 'char3' && assets.char3SeatedDesk && assets.char3SeatedDesk.complete && assets.char3SeatedDesk.width > 0) {
          sitImg = assets.char3SeatedDesk;
        } else if (peer.charId === 'char2' && assets.char2SeatedDesk && assets.char2SeatedDesk.complete && assets.char2SeatedDesk.width > 0) {
          sitImg = assets.char2SeatedDesk;
        } else if (assets.char1SeatedDesk && assets.char1SeatedDesk.complete && assets.char1SeatedDesk.width > 0) {
          sitImg = assets.char1SeatedDesk;
        } else if (peer.charId === 'char3' && assets.char3Sitting && assets.char3Sitting.complete && assets.char3Sitting.width > 0) {
          sitImg = assets.char3Sitting;
        } else if (peer.charId === 'char2' && assets.char2Sitting && assets.char2Sitting.complete && assets.char2Sitting.width > 0) {
          sitImg = assets.char2Sitting;
        } else if (assets.char1Sitting && assets.char1Sitting.complete && assets.char1Sitting.width > 0) {
          sitImg = assets.char1Sitting;
        }

        if (sitImg && sitImg.complete && sitImg.width > 0) {
          const scale = scene.playerScale || 0.55;
          const isMultiFrame = sitImg.width >= 200;
          const frameW = isMultiFrame ? Math.round(sitImg.width / 4) : sitImg.width;
          const frameH = sitImg.height;
          const animFrame = isMultiFrame ? (Math.floor((performance.now() + (peer.animFrame || 0) * 100) / 140) % 4) : 0;
          const sx = animFrame * frameW;
          const sy = 0;

          const dw = Math.round(frameW * scale);
          const dh = Math.round(frameH * scale);
          const dx = Math.round(posX - dw / 2);
          const breath = Math.sin((performance.now() + (peer.animFrame || 0) * 100) * 0.005) * 1.0;
          const dy = Math.round(posY - dh - 5 + breath);

          // Render remote seated player inside existing in-scene chair!
          ctx.drawImage(sitImg, sx, sy, frameW, frameH, dx, dy, dw, dh);

          if (window.pixelEngine && window.pixelEngine.particles && Math.random() < 0.2) {
            window.pixelEngine.particles.spawnTypingParticles(posX, posY - 45);
          }
        }
      } else {
        // 1. Soft Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
        ctx.beginPath();
        ctx.ellipse(posX, posY - 2, pw * 0.42, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // 2. Sprite Sheet
        let sheet = assets.char1Spritesheet;
        if (peer.charId === 'char3' && assets.char3Spritesheet.complete && assets.char3Spritesheet.width > 0) {
          sheet = assets.char3Spritesheet;
        } else if (peer.charId === 'char2' && assets.char2Spritesheet.complete && assets.char2Spritesheet.width > 0) {
          sheet = assets.char2Spritesheet;
        } else if (peer.charId === 'char1' && assets.char1Spritesheet.complete && assets.char1Spritesheet.width > 0) {
          sheet = assets.char1Spritesheet;
        } else if (assets.spritesheet.complete && assets.spritesheet.width > 0) {
          sheet = assets.spritesheet;
        }

        if (sheet && sheet.complete && sheet.width > 0) {
          const frameW = 74;
          const frameH = 157;
          let row = 0;
          let isFlipped = false;

          if (peer.direction === 'down') {
            row = 0;
          } else if (peer.direction === 'up') {
            row = 2;
          } else if (peer.direction === 'right') {
            row = 1;
          } else if (peer.direction === 'left') {
            row = 1;
            isFlipped = true;
          }

          const col = peer.isMoving ? (peer.animFrame % 4) : 0;
          const sx = col * frameW;
          const sy = row * frameH;

          if (isFlipped) {
            ctx.save();
            ctx.translate(px + pw, py);
            ctx.scale(-1, 1);
            ctx.drawImage(sheet, sx, sy, frameW, frameH, 0, 0, pw, ph);
            ctx.restore();
          } else {
            ctx.drawImage(sheet, sx, sy, frameW, frameH, px, py, pw, ph);
          }
        }
      }

      // 3. Floating Player Name Tag Pill above head
      const tagText = peer.name || 'Colleague';
      ctx.font = 'bold 11px Outfit, sans-serif';
      const textWidth = ctx.measureText(tagText).width;
      const badgeW = textWidth + 22;
      const badgeH = 18;
      const badgeX = posX - badgeW / 2;
      const headTop = peer.isSitting ? (posY - Math.round(95 * (scene.playerScale || 0.55)) - 10) : py;
      const badgeY = headTop - 14;

      // Pill background
      ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 9);
      } else {
        ctx.rect(badgeX, badgeY, badgeW, badgeH);
      }
      ctx.fill();
      ctx.stroke();

      // Online green dot
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(badgeX + 8, badgeY + badgeH / 2, 3, 0, Math.PI * 2);
      ctx.fill();

      // Name text
      ctx.fillStyle = '#f8fafc';
      ctx.textBaseline = 'middle';
      ctx.fillText(tagText, badgeX + 16, badgeY + badgeH / 2 + 1);
    } catch (err) {
      console.warn('Error rendering remote peer:', err);
    } finally {
      ctx.restore();
    }
  });
}

// ==========================================
// WORKPLACE QUEST & CLASSIC DASHBOARD CONTROLLER
// ==========================================
let currentQuestId = null;
let currentNPCId = null;

function toggleClassicDashboard() {
  const dash = document.getElementById('classic-dashboard');
  const canvasWrap = document.getElementById('canvas-wrapper');
  const btnToggle = document.getElementById('btn-toggle-classic');
  if (!dash || !canvasWrap || !btnToggle) return;

  const isCurrentlyHidden = dash.classList.contains('hidden');

  if (isCurrentlyHidden) {
    // Switch to Dashboard Mode
    dash.classList.remove('hidden');
    canvasWrap.classList.add('hidden');
    btnToggle.classList.add('active');
    btnToggle.innerHTML = '<span id="toggle-mode-icon">🎮</span> <span id="toggle-mode-text">2D View</span>';
    renderClassicDashboard();
    window.soundManager.unlock();
    window.soundManager.playInteract();
    showToast('📋 Switched to Workplace Quest Dashboard.');
  } else {
    // Switch to 2D Game View
    dash.classList.add('hidden');
    canvasWrap.classList.remove('hidden');
    btnToggle.classList.remove('active');
    btnToggle.innerHTML = '<span id="toggle-mode-icon">📋</span> <span id="toggle-mode-text">Dashboard Mode</span>';
    window.soundManager.unlock();
    window.soundManager.playInteract();
    showToast('🎮 Switched to 2D Office View.');
  }
}

function renderClassicDashboard() {
  if (!window.aiAgent) return;

  const totalScore = window.aiAgent.getTotalScore();
  const rank = window.aiAgent.getRank();

  // Update Rank & Scores
  const rankEl = document.getElementById('dash-rank-pill');
  if (rankEl) rankEl.textContent = `Rank: ${rank}`;

  const scoreEl = document.getElementById('dash-total-score');
  if (scoreEl) scoreEl.textContent = `${totalScore}%`;

  // Calculate Average Pillars across completed quests
  let claritySum = 0, compSum = 0, toneSum = 0, nextSum = 0, count = 0;
  Object.values(window.aiAgent.scores).forEach(s => {
    if (s.details) {
      claritySum += s.details.clarity || 0;
      compSum += s.details.completeness || 0;
      toneSum += s.details.tone || 0;
      nextSum += s.details.nextAction || 0;
      count++;
    }
  });

  const cPct = count > 0 ? Math.round((claritySum / (count * 25)) * 100) : 0;
  const compPct = count > 0 ? Math.round((compSum / (count * 25)) * 100) : 0;
  const tPct = count > 0 ? Math.round((toneSum / (count * 25)) * 100) : 0;
  const nPct = count > 0 ? Math.round((nextSum / (count * 25)) * 100) : 0;

  const pClarity = document.getElementById('pillar-clarity');
  if (pClarity) pClarity.style.width = `${cPct}%`;
  const pComp = document.getElementById('pillar-completeness');
  if (pComp) pComp.style.width = `${compPct}%`;
  const pTone = document.getElementById('pillar-tone');
  if (pTone) pTone.style.width = `${tPct}%`;
  const pNext = document.getElementById('pillar-next-action');
  if (pNext) pNext.style.width = `${nPct}%`;

  // Populate 4 Quest Cards
  const grid = document.getElementById('dash-quests-grid');
  if (grid) {
    grid.innerHTML = '';
    window.aiAgent.npcs.forEach(npc => {
      const q = window.aiAgent.quests[npc.questId];
      const s = window.aiAgent.scores[npc.questId] || { score: 0, completed: false };

      const card = document.createElement('div');
      card.className = 'dash-quest-card';
      card.innerHTML = `
        <div class="dash-card-header">
          <img src="assets/${npc.id}_portrait.png" alt="${npc.name}" class="dash-card-avatar">
          <div class="dash-card-meta">
            <span class="dash-card-room">${q.location}</span>
            <div class="dash-card-title">${q.title}</div>
            <div class="dash-card-mentor">Mentor: ${npc.name} (${npc.role})</div>
          </div>
        </div>
        <p class="dash-card-desc">${q.objective}</p>
        <div class="dash-card-footer">
          <span class="dash-status-tag ${s.completed ? 'completed' : ''}">
            ${s.completed ? `⭐ Mastered (${s.score}%)` : (s.score > 0 ? `In Progress (${s.score}%)` : 'Not Started')}
          </span>
          <button class="btn-dash-action" data-quest="${q.id}" data-npc="${npc.id}">
            ${s.completed ? 'Review / Chat' : 'Start Quest 🚀'}
          </button>
        </div>
      `;

      const btn = card.querySelector('.btn-dash-action');
      if (btn) {
        btn.onclick = () => openQuestModal(q.id, npc.id);
      }
      grid.appendChild(card);
    });
  }

  // Populate Live Activity Feed
  const roster = document.getElementById('dash-activity-roster');
  if (roster) {
    roster.innerHTML = '';
    window.aiAgent.npcs.forEach(npc => {
      const pill = document.createElement('div');
      pill.className = 'activity-npc-pill';
      pill.innerHTML = `
        <img src="assets/${npc.id}_portrait.png" alt="${npc.name}" class="activity-npc-avatar">
        <div class="activity-npc-info">
          <div class="activity-npc-name">${npc.name} (${npc.role})</div>
          <div class="activity-npc-task">${npc.activityLabel}</div>
          <div class="activity-npc-loc">📍 Location: ${npc.scene.replace('_', ' ')} • ${npc.isSitting ? 'Seated at Desk' : 'Active'}</div>
        </div>
      `;
      roster.appendChild(pill);
    });
  }

  window.aiAgent.updateHeaderScoreUI();
}

function openQuestModal(questId, npcId) {
  if (!window.aiAgent) return;
  const quest = window.aiAgent.quests[questId];
  const npc = window.aiAgent.npcs.find(n => n.id === npcId);
  if (!quest || !npc) return;

  currentQuestId = questId;
  currentNPCId = npcId;

  const modal = document.getElementById('quest-modal');
  modal.classList.remove('hidden');

  // Populate Header
  const portImg = document.getElementById('quest-npc-portrait');
  if (portImg) portImg.src = `assets/${npc.id}_portrait.png`;
  const metaPill = document.getElementById('quest-meta-pill');
  if (metaPill) metaPill.textContent = `${quest.location.toUpperCase()} • ${npc.role.toUpperCase()}`;
  const titleEl = document.getElementById('quest-title-heading');
  if (titleEl) titleEl.textContent = quest.title;
  const subEl = document.getElementById('quest-subtitle');
  if (subEl) subEl.textContent = `Mentor: ${npc.name} • ${quest.objective}`;

  // Populate Tab 1 (Challenge)
  const scText = document.getElementById('quest-scenario-text');
  if (scText) scText.textContent = quest.scenario;
  const prText = document.getElementById('quest-prompt-text');
  if (prText) prText.textContent = quest.defaultPrompt;
  const draftIn = document.getElementById('quest-draft-input');
  if (draftIn) draftIn.value = '';

  // Hide previous results
  const resBox = document.getElementById('quest-eval-results');
  if (resBox) resBox.classList.add('hidden');

  // Default to challenge tab
  switchQuestTab('challenge');

  // Render chat history in Tab 2
  renderChatMessages(npcId);

  window.soundManager.unlock();
  window.soundManager.playInteract();
}

function closeQuestModal() {
  const modal = document.getElementById('quest-modal');
  if (modal) modal.classList.add('hidden');
  currentQuestId = null;
  currentNPCId = null;
}

function switchQuestTab(tabName) {
  const btnChallenge = document.getElementById('tab-btn-challenge');
  const btnChat = document.getElementById('tab-btn-chat');
  const tabChallenge = document.getElementById('quest-tab-challenge');
  const tabChat = document.getElementById('quest-tab-chat');
  if (!btnChallenge || !btnChat || !tabChallenge || !tabChat) return;

  if (tabName === 'challenge') {
    btnChallenge.classList.add('active');
    btnChat.classList.remove('active');
    tabChallenge.classList.remove('hidden');
    tabChat.classList.add('hidden');
  } else {
    btnChat.classList.add('active');
    btnChallenge.classList.remove('active');
    tabChat.classList.remove('hidden');
    tabChallenge.classList.add('hidden');
    renderChatMessages(currentNPCId);
  }
}

function renderChatMessages(npcId) {
  if (!window.aiAgent || !npcId) return;
  const history = window.aiAgent.chatHistory[npcId] || [];
  const container = document.getElementById('quest-chat-messages');
  if (!container) return;

  container.innerHTML = '';
  history.forEach(msg => {
    const bubble = document.createElement('div');
    bubble.className = `chat-msg ${msg.role}`;
    bubble.textContent = msg.content;
    container.appendChild(bubble);
  });
  container.scrollTop = container.scrollHeight;

  // Render Quick Chips
  const chipsWrap = document.getElementById('quest-chat-chips');
  if (chipsWrap) {
    chipsWrap.innerHTML = '';
    const suggestions = [
      'What are the key elements to include?',
      'Can you review my current draft thoughts?',
      'How do top engineers approach this?',
      'What common mistakes should I avoid?'
    ];
    suggestions.forEach(s => {
      const chip = document.createElement('button');
      chip.className = 'quick-chip';
      chip.textContent = s;
      chip.onclick = () => {
        const input = document.getElementById('quest-chat-input');
        if (input) input.value = s;
        handleSendChat();
      };
      chipsWrap.appendChild(chip);
    });
  }
}

async function handleSendChat() {
  const input = document.getElementById('quest-chat-input');
  if (!input) return;
  const text = (input.value || '').trim();
  if (!text || !currentNPCId || !window.aiAgent) return;

  input.value = '';
  const container = document.getElementById('quest-chat-messages');
  if (!container) return;

  // Player message bubble
  const userBubble = document.createElement('div');
  userBubble.className = 'chat-msg user';
  userBubble.textContent = text;
  container.appendChild(userBubble);

  // Typing indicator bubble
  const typingBubble = document.createElement('div');
  typingBubble.className = 'chat-msg assistant';
  typingBubble.innerHTML = '<em>Thinking & typing...</em>';
  container.appendChild(typingBubble);
  container.scrollTop = container.scrollHeight;

  try {
    const reply = await window.aiAgent.chatWithNPC(currentNPCId, text);
    typingBubble.textContent = reply;
  } catch (err) {
    typingBubble.textContent = 'Network timeout, please try again.';
  }
  container.scrollTop = container.scrollHeight;
}

async function handleSubmitEvaluation() {
  if (!window.aiAgent || !currentQuestId) return;
  const input = document.getElementById('quest-draft-input');
  const draft = (input ? input.value : '').trim();
  if (!draft) {
    showToast('⚠️ Please type your draft response before submitting for evaluation!');
    return;
  }

  const btn = document.getElementById('btn-submit-eval');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>⏳</span> EVALUATING WITH GROQ AI...';
  }

  try {
    const evalData = await window.aiAgent.evaluateSubmission(currentQuestId, draft);
    displayEvaluationResults(evalData);
  } catch (err) {
    console.warn('Evaluation failed:', err);
    showToast('⚠️ Evaluation error, loaded local rubric scorecard.');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>🚀</span> SUBMIT TO AI FOR EVALUATION';
    }
  }
}

function displayEvaluationResults(data) {
  if (!data) return;
  const box = document.getElementById('quest-eval-results');
  if (!box) return;
  box.classList.remove('hidden');

  const totalEl = document.getElementById('eval-total-score');
  if (totalEl) totalEl.textContent = data.totalScore;
  const sumEl = document.getElementById('eval-summary-text');
  if (sumEl) sumEl.textContent = data.summary;

  const rClarity = document.getElementById('rubric-clarity');
  if (rClarity) rClarity.textContent = `${data.clarity}/25`;
  const rComp = document.getElementById('rubric-completeness');
  if (rComp) rComp.textContent = `${data.completeness}/25`;
  const rTone = document.getElementById('rubric-tone');
  if (rTone) rTone.textContent = `${data.tone}/25`;
  const rNext = document.getElementById('rubric-next-action');
  if (rNext) rNext.textContent = `${data.nextAction}/25`;

  const stEl = document.getElementById('eval-strengths-text');
  if (stEl) stEl.textContent = data.strengths;
  const impEl = document.getElementById('eval-improvements-text');
  if (impEl) impEl.textContent = data.improvements;
  const exEl = document.getElementById('eval-exemplar-text');
  if (exEl) exEl.textContent = data.exemplaryRewrite;

  // Sound & Toast
  window.soundManager.unlock();
  window.soundManager.playLevelUp();
  showToast(`🎉 Score: ${data.totalScore}/100! Quest evaluation recorded.`);

  // Update header and dashboard
  if (window.aiAgent) window.aiAgent.updateHeaderScoreUI();
  renderClassicDashboard();

  box.scrollIntoView({ behavior: 'smooth' });
}

function setupQuestEventListeners() {
  const btnToggle = document.getElementById('btn-toggle-classic');
  if (btnToggle) btnToggle.addEventListener('click', toggleClassicDashboard);

  const btnClose = document.getElementById('btn-close-quest');
  if (btnClose) btnClose.addEventListener('click', closeQuestModal);

  const tabChallenge = document.getElementById('tab-btn-challenge');
  if (tabChallenge) tabChallenge.addEventListener('click', () => switchQuestTab('challenge'));

  const tabChat = document.getElementById('tab-btn-chat');
  if (tabChat) tabChat.addEventListener('click', () => switchQuestTab('chat'));

  const btnTemplate = document.getElementById('btn-toggle-template');
  if (btnTemplate) {
    btnTemplate.addEventListener('click', () => {
      if (!window.aiAgent || !currentQuestId) return;
      const quest = window.aiAgent.quests[currentQuestId];
      const input = document.getElementById('quest-draft-input');
      if (quest && input && quest.sampleTemplate) {
        input.value = quest.sampleTemplate;
        input.focus();
        showToast('📋 Inserted mission draft template.');
      }
    });
  }

  const btnSubmit = document.getElementById('btn-submit-eval');
  if (btnSubmit) btnSubmit.addEventListener('click', handleSubmitEvaluation);

  const btnSendChat = document.getElementById('btn-send-chat');
  if (btnSendChat) btnSendChat.addEventListener('click', handleSendChat);

  const chatInput = document.getElementById('quest-chat-input');
  if (chatInput) {
    chatInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleSendChat();
      }
    });
  }
}

function setupStartMenuAndLobby() {
  const startModal = document.getElementById('start-menu-modal');
  const startStepInitial = document.getElementById('start-step-initial');
  const startStepModes = document.getElementById('start-step-modes');
  const btnInitialStart = document.getElementById('btn-initial-start');
  const btnBackToStart = document.getElementById('btn-back-to-start');
  const btnModeOffline = document.getElementById('btn-mode-offline');
  const btnModeOnline = document.getElementById('btn-mode-online');

  const mpModal = document.getElementById('multiplayer-modal');
  const btnCloseLobby = document.getElementById('btn-close-lobby');
  const inputRoomCode = document.getElementById('input-room-code');
  const inputPlayerName = document.getElementById('input-player-name');
  const btnCopyCode = document.getElementById('btn-copy-code');
  const btnRegenCode = document.getElementById('btn-regen-code');
  const btnCreateRoomTab = document.getElementById('btn-create-room');
  const btnJoinRoomTab = document.getElementById('btn-join-room');
  const charGrid = document.getElementById('character-grid');
  const rosterList = document.getElementById('roster-list');
  const rosterCount = document.getElementById('roster-count');
  const btnEnterOffice = document.getElementById('btn-enter-office');
  const charSelectionStatus = document.getElementById('char-selection-status');

  const onlineBadge = document.getElementById('online-badge');
  const onlineRoomText = document.getElementById('online-room-text');
  const onlinePlayerCount = document.getElementById('online-player-count');
  const btnLeaveRoom = document.getElementById('btn-leave-room');

  let isHosting = true;
  let currentRoomCode = MultiplayerEngine.generateRoomCode();
  if (inputRoomCode) inputRoomCode.value = currentRoomCode;

  // Step 1: Initial "START GAME" button reveals the "Online" and "Offline" options
  if (btnInitialStart) {
    btnInitialStart.onclick = () => {
      window.soundManager.unlock();
      window.soundManager.playInteract();
      startStepInitial.classList.add('hidden');
      startStepModes.classList.remove('hidden');
    };
  }

  if (btnBackToStart) {
    btnBackToStart.onclick = () => {
      window.soundManager.playInteract();
      startStepModes.classList.add('hidden');
      startStepInitial.classList.remove('hidden');
    };
  }

  // Offline Mode: Launches immediately into existing single-player office
  if (btnModeOffline) {
    btnModeOffline.onclick = () => {
      window.soundManager.unlock();
      window.soundManager.playInteract();
      startModal.classList.add('hidden');
      state.player.charId = 'char1';
      showToast('🏢 Welcome to Office Simulator! Single-Player Mode.');
    };
  }

  // Online Mode: Opens Multiplayer Lobby
  if (btnModeOnline) {
    btnModeOnline.onclick = () => {
      window.soundManager.unlock();
      window.soundManager.playInteract();
      startModal.classList.add('hidden');
      mpModal.classList.remove('hidden');
      joinOrHostCurrentRoom();
    };
  }

  function joinOrHostCurrentRoom() {
    const code = (inputRoomCode.value || currentRoomCode).toUpperCase().trim();
    const name = inputPlayerName.value.trim() || 'Colleague';
    window.multiplayerEngine.startSession(code, name, isHosting);
    renderLobbyUI();
  }

  if (btnCreateRoomTab) {
    btnCreateRoomTab.onclick = () => {
      isHosting = true;
      btnCreateRoomTab.classList.add('active');
      btnJoinRoomTab.classList.remove('active');
      currentRoomCode = MultiplayerEngine.generateRoomCode();
      inputRoomCode.value = currentRoomCode;
      joinOrHostCurrentRoom();
    };
  }

  if (btnJoinRoomTab) {
    btnJoinRoomTab.onclick = () => {
      isHosting = false;
      btnJoinRoomTab.classList.add('active');
      btnCreateRoomTab.classList.remove('active');
      inputRoomCode.value = '';
      inputRoomCode.focus();
    };
  }

  if (inputRoomCode) {
    inputRoomCode.onchange = () => {
      if (inputRoomCode.value.trim().length >= 4) {
        joinOrHostCurrentRoom();
      }
    };
  }

  if (inputPlayerName) {
    inputPlayerName.onchange = () => {
      const newName = inputPlayerName.value.trim() || 'Colleague';
      window.multiplayerEngine.localPlayer.name = newName;
      if (window.multiplayerEngine.active) {
        window.multiplayerEngine.broadcast({
          type: 'PRESENCE',
          senderId: window.multiplayerEngine.localPlayer.id,
          player: window.multiplayerEngine.localPlayer
        });
      }
      renderLobbyUI();
    };
  }

  if (btnCopyCode) {
    btnCopyCode.onclick = () => {
      const code = inputRoomCode.value || currentRoomCode;
      navigator.clipboard.writeText(code).then(() => {
        showToast(`📋 Room Code [${code}] copied to clipboard!`);
      }).catch(() => {
        showToast(`Room Code: ${code}`);
      });
    };
  }

  if (btnRegenCode) {
    btnRegenCode.onclick = () => {
      currentRoomCode = MultiplayerEngine.generateRoomCode();
      inputRoomCode.value = currentRoomCode;
      joinOrHostCurrentRoom();
      showToast(`🎲 Generated New Room Code: ${currentRoomCode}`);
    };
  }

  if (btnCloseLobby) {
    btnCloseLobby.onclick = () => {
      window.multiplayerEngine.disconnect();
      mpModal.classList.add('hidden');
      startModal.classList.remove('hidden');
      startStepModes.classList.remove('hidden');
      startStepInitial.classList.add('hidden');
    };
  }

  if (btnLeaveRoom) {
    btnLeaveRoom.onclick = () => {
      window.multiplayerEngine.disconnect();
      onlineBadge.classList.add('hidden');
      startModal.classList.remove('hidden');
      startStepModes.classList.remove('hidden');
      startStepInitial.classList.add('hidden');
      showToast('🚪 Disconnected from multiplayer room.');
    };
  }

  if (onlineRoomText) {
    onlineRoomText.onclick = () => {
      if (window.multiplayerEngine.roomCode) {
        navigator.clipboard.writeText(window.multiplayerEngine.roomCode).then(() => {
          showToast(`📋 Room Code [${window.multiplayerEngine.roomCode}] copied to clipboard!`);
        });
      }
    };
  }

  // Render Character Cards with Live Locks
  function renderLobbyUI() {
    if (!charGrid) return;
    charGrid.innerHTML = '';

    const myId = window.multiplayerEngine.localPlayer.id;
    const myCharId = window.multiplayerEngine.localPlayer.charId;

    window.multiplayerEngine.characters.forEach(char => {
      const card = document.createElement('div');
      card.className = 'char-card';

      const isClaimedByMe = myCharId === char.id;
      const isClaimedByOther = char.claimedBy && char.claimedBy !== myId;

      if (char.isLocked) {
        card.classList.add('locked');
      } else if (isClaimedByMe) {
        card.classList.add('selected');
      } else if (isClaimedByOther) {
        card.classList.add('claimed');
      }

      let badgeHtml = '';
      if (char.isLocked) {
        badgeHtml = '<span class="char-badge-pill badge-locked">🔒 LOCKED</span>';
      } else if (isClaimedByMe) {
        badgeHtml = '<span class="char-badge-pill badge-selected">✓ SELECTED</span>';
      } else if (isClaimedByOther) {
        badgeHtml = `<span class="char-badge-pill badge-claimed">⛔ CLAIMED BY ${char.claimedByName || 'PEER'}</span>`;
      } else {
        badgeHtml = '<span class="char-badge-pill badge-available">● AVAILABLE</span>';
      }

      card.innerHTML = `
        <div class="char-avatar-frame">
          ${char.isLocked 
            ? '<span class="char-locked-icon">🔒</span>' 
            : `<img class="char-avatar-img" src="${char.avatar}" alt="${char.name}">`}
        </div>
        <div class="char-name">${char.name}</div>
        <div class="char-role">${char.role}</div>
        ${badgeHtml}
      `;

      card.onclick = () => {
        if (char.isLocked) {
          showToast('⏳ This character slot will be unlocked in the next expansion!');
          return;
        }

        window.soundManager.unlock();
        const res = window.multiplayerEngine.selectCharacter(char.id);
        if (res.success) {
          window.soundManager.playInteract();
          state.player.charId = char.id;
          renderLobbyUI();
        } else {
          showToast(`⚠️ ${res.reason}`);
        }
      };

      charGrid.appendChild(card);
    });

    // Update Enter Office Button state
    if (myCharId) {
      const selectedChar = window.multiplayerEngine.characters.find(c => c.id === myCharId);
      btnEnterOffice.disabled = false;
      btnEnterOffice.classList.remove('btn-enter-disabled');
      btnEnterOffice.innerHTML = `<span>▶</span> ENTER OFFICE AS ${selectedChar ? selectedChar.name.toUpperCase() : 'SELECTED'}`;
      charSelectionStatus.textContent = `Selected: ${selectedChar ? selectedChar.name : ''} (${selectedChar ? selectedChar.role : ''})`;
      charSelectionStatus.style.color = '#10b981';
    } else {
      btnEnterOffice.disabled = true;
      btnEnterOffice.classList.add('btn-enter-disabled');
      btnEnterOffice.textContent = 'SELECT CHARACTER TO ENTER';
      charSelectionStatus.textContent = 'Choose an available character to unlock entry';
      charSelectionStatus.style.color = '#94a3b8';
    }

    // Update Connected Roster List
    if (rosterList) {
      rosterList.innerHTML = '';
      const totalCount = 1 + window.multiplayerEngine.peers.size;
      rosterCount.textContent = totalCount;

      // Local player
      const meChar = window.multiplayerEngine.characters.find(c => c.id === myCharId);
      const myPill = document.createElement('div');
      myPill.className = 'roster-pill you';
      myPill.innerHTML = `<span>●</span> <strong>${window.multiplayerEngine.localPlayer.name} (You)</strong> - <em>${meChar ? meChar.name : 'Selecting...'}</em>`;
      rosterList.appendChild(myPill);

      // Remote peers
      window.multiplayerEngine.peers.forEach(peer => {
        const peerChar = window.multiplayerEngine.characters.find(c => c.id === peer.charId);
        const pill = document.createElement('div');
        pill.className = 'roster-pill';
        pill.innerHTML = `<span>●</span> <strong>${peer.name}</strong> - <em>${peerChar ? peerChar.name : 'Selecting...'}</em>`;
        rosterList.appendChild(pill);
      });
    }

    // Update in-game header online badge
    if (window.multiplayerEngine.active) {
      onlineRoomText.textContent = `ROOM: ${window.multiplayerEngine.roomCode}`;
      onlinePlayerCount.textContent = `👥 ${1 + window.multiplayerEngine.peers.size}`;
    }
  }

  // Enter Office Click
  if (btnEnterOffice) {
    btnEnterOffice.onclick = () => {
      if (!window.multiplayerEngine.localPlayer.charId) return;

      window.soundManager.unlock();
      window.soundManager.playDoorOpen();
      mpModal.classList.add('hidden');

      state.player.charId = window.multiplayerEngine.localPlayer.charId;
      onlineBadge.classList.remove('hidden');
      onlineRoomText.textContent = `ROOM: ${window.multiplayerEngine.roomCode}`;
      onlinePlayerCount.textContent = `👥 ${1 + window.multiplayerEngine.peers.size}`;

      const chosen = window.multiplayerEngine.characters.find(c => c.id === state.player.charId);
      showToast(`🏢 Entered ${window.multiplayerEngine.roomCode}! Playing as ${chosen ? chosen.name : 'Specialist'}.`);
    };
  }

  // Hook engine callbacks
  window.multiplayerEngine.onLobbyUpdate = () => {
    renderLobbyUI();
  };

  window.multiplayerEngine.onToast = (msg) => {
    showToast(msg);
  };
}

function renderForeground() {
  // Depth sorting clips if needed
}

// ==========================================
// MAIN LOOP
// ==========================================
function gameLoop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  try {
    update(dt);
    render();
  } catch (err) {
    console.error('[GameLoop] Render frame error:', err);
  }

  requestAnimationFrame(gameLoop);
}

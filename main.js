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
  doorLightSpill: new Image()
};

let assetsLoadedCount = 0;
const totalAssets = Object.keys(assets).length;

function loadAsset(img, src) {
  img.src = src;
  img.onload = () => {
    assetsLoadedCount++;
    if (assetsLoadedCount === totalAssets) {
      console.log('All game assets loaded successfully!');
      initGame();
    }
  };
  img.onerror = (e) => {
    console.error('Failed to load asset:', src, e);
  };
}

assets.officeHall.src = 'assets/office_hall.png';
assets.bossCabinet.src = 'assets/boss_cabinet.png';
assets.spritesheet.src = 'assets/spritesheet.png';
assets.charIdle.src = 'assets/character_idle.png';
assets.charBack.src = 'assets/char_back.png';
assets.bossPortrait.src = 'assets/boss_portrait.png?v=3';
assets.playerPortrait.src = 'assets/player_portrait.png?v=3';
assets.bossStanding.src = 'assets/boss_standing.png?v=3';
assets.bossCharacter.src = 'assets/boss_character.png?v=3';
assets.cornerOffice.src = 'assets/corner_office.png';
assets.doorSlightlyOpen.src = 'assets/door_slightly_open.png?v=2';
assets.doorLightSpill.src = 'assets/door_light_spill.png?v=2';

// Setup load listeners
Object.keys(assets).forEach(key => {
  if (assets[key].complete) {
    assetsLoadedCount++;
  } else {
    assets[key].addEventListener('load', () => {
      assetsLoadedCount++;
      if (assetsLoadedCount === totalAssets) {
        initGame();
      }
    });
  }
});

// Fallback init in case images were cached
if (assetsLoadedCount === totalAssets) {
  setTimeout(initGame, 50);
}

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
        x: 2, y: 430, w: 50, h: 130,
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
        id: 'cubicle_pc',
        x: 438, y: 270, w: 74, h: 55,
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
  setupEventListeners();
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
// INTERACTION & DIALOGUE LOGIC
// ==========================================
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

  p.isMoving = dx !== 0 || dy !== 0;

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
}

function updateTriggers() {
  const scene = SCENES[state.currentScene];
  const p = state.player;

  let foundTrigger = null;

  for (const trig of scene.triggers) {
    // Check player proximity to trigger box
    const dist = Math.hypot(p.x - (trig.x + trig.w / 2), p.y - (trig.y + trig.h / 2));
    if (dist < 65 || (
      p.x >= trig.x - 20 && p.x <= trig.x + trig.w + 20 &&
      p.y >= trig.y - 20 && p.y <= trig.y + trig.h + 20
    )) {
      foundTrigger = trig;
      break;
    }
  }

  state.activePrompt = foundTrigger;
}

// ==========================================
// RENDER LOOP
// ==========================================
function render() {
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

  // 3. Draw Player Character
  renderPlayer();

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
    } else {
      drawGoldenTriangle(state.activePrompt.promptPos.x, state.activePrompt.promptPos.y - 20);
    }
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

  // 2. Slightly Opened Door in bottom-left corner (where character stands)
  if (assets.doorSlightlyOpen && assets.doorSlightlyOpen.complete) {
    ctx.drawImage(assets.doorSlightlyOpen, 2, 430);
  }
  if (assets.doorLightSpill && assets.doorLightSpill.complete) {
    // Gentle ambient light pulsing from the doorway crack onto the floor
    const lightPulse = 0.82 + Math.sin(time * 2) * 0.18;
    ctx.save();
    ctx.globalAlpha = lightPulse;
    ctx.drawImage(assets.doorLightSpill, 2, 556);
    ctx.restore();
  }

  // Soft golden glow around the slightly opened door
  ctx.save();
  ctx.strokeStyle = `rgba(245, 158, 11, ${0.2 + pulse * 0.35})`;
  ctx.lineWidth = 2.5;
  ctx.shadowColor = '#f59e0b';
  ctx.shadowBlur = 8 + pulse * 6;
  ctx.strokeRect(2, 430, 48, 130);
  ctx.restore();

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
  // Floating Golden Triangle indicator pointing to right exit doorway
  drawGoldenTriangle(965, 415);
}

function renderPlayer() {
  const p = state.player;
  const pw = p.width;
  const ph = p.height;
  const px = p.x - pw / 2;
  const py = p.y - ph;

  ctx.save();

  // 1. Soft Shadow beneath feet
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(p.x, p.y - 2, pw * 0.42, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Sprite Animation Frame
  // Spritesheet: 4 columns (frames 0..3), 3 rows (0: Down, 1: Side/Right, 2: Up)
  if (assets.spritesheet.complete && assets.spritesheet.width > 0) {
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

    const col = p.isMoving ? p.animFrame : 0;
    const sx = col * frameW;
    const sy = row * frameH;

    if (isFlipped) {
      ctx.translate(px + pw, py);
      ctx.scale(-1, 1);
      ctx.drawImage(assets.spritesheet, sx, sy, frameW, frameH, 0, 0, pw, ph);
    } else {
      ctx.drawImage(assets.spritesheet, sx, sy, frameW, frameH, px, py, pw, ph);
    }
  } else if (assets.charIdle.complete) {
    // Fallback if sheet not yet loaded
    ctx.drawImage(assets.charIdle, px, py, pw, ph);
  }

  ctx.restore();
}

function renderForeground() {
  // If player is in Boss Cabinet and standing near/behind the desk,
  // we clip the desk front so depth sorting looks natural
}

// ==========================================
// MAIN LOOP
// ==========================================
function gameLoop(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.1);
  lastTime = now;

  update(dt);
  render();

  requestAnimationFrame(gameLoop);
}

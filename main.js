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
  bossCharacter: new Image()
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
      // Left desk area (bottom desk)
      { x: 50, y: 475, w: 158, h: 70, label: 'Desk' },

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
        glowBox: { x: 462, y: 36, w: 100, h: 176, r: 8, label: 'Boss Door' },
        action: () => enterBossCabinet()
      },
      {
        id: 'hall_water_cooler',
        x: 935, y: 180, w: 75, h: 65,
        prompt: 'Drink Ice Cold Water',
        promptPos: { x: 975, y: 170 },
        glowBox: { x: 944, y: 152, w: 60, h: 90, r: 6, label: 'Water Cooler' },
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
        glowBox: { x: 438, y: 250, w: 74, h: 62, r: 4, label: 'Coworker PC' },
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
        glowBox: { x: 236, y: 92, w: 82, h: 145, r: 6, label: 'Bookshelf' },
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
        glowBox: { x: 875, y: 465, w: 90, h: 95, r: 8, label: 'Office Ficus' },
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
        glowBox: { x: 935, y: 410, w: 65, h: 120, r: 6, label: 'Exit Door' },
        action: () => exitToMainHall()
      },
      {
        id: 'talk_to_boss',
        x: 390, y: 440, w: 120, h: 90,
        prompt: 'Talk to Boss',
        promptPos: { x: 450, y: 410 },
        glowBox: { x: 414, y: 345, w: 72, h: 146, r: 8, label: 'Boss' },
        action: () => startBossDialogue()
      },
      {
        id: 'cabinet_boxes',
        x: 570, y: 440, w: 140, h: 95,
        prompt: 'Inspect Moving Boxes',
        promptPos: { x: 640, y: 430 },
        glowBox: { x: 570, y: 405, w: 140, h: 95, r: 6, label: 'Boxes' },
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
        glowBox: { x: 712, y: 330, w: 68, h: 145, r: 6, label: 'Water Cooler' },
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
        glowBox: { x: 792, y: 355, w: 85, h: 130, r: 6, label: 'Filing Cabinet' },
        action: () => {
          window.soundManager.playInteract();
          showToast('🗄️ Found: "Projected 500% profits, employee bonus pool: $0.00"');
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

  // Canvas Click-to-Move & Object Click Interaction
  canvas.addEventListener('click', (e) => {
    window.soundManager.unlock();
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    const targetX = (e.clientX - rect.left) * scaleX;
    const targetY = (e.clientY - rect.top) * scaleY;

    // Check if clicked directly on an interactable object
    const scene = SCENES[state.currentScene];
    if (scene && scene.triggers) {
      for (const trig of scene.triggers) {
        if (trig.glowBox) {
          const b = trig.glowBox;
          if (targetX >= b.x && targetX <= b.x + b.w && targetY >= b.y && targetY <= b.y + b.h) {
            if (state.activePrompt === trig) {
              handleInteract();
              return;
            }
          }
        }
      }
    }

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
      'Boss Sterling',
      assets.bossPortrait.src,
      'HENDERSON! Who authorized you to step into my executive suite?! Did you finalize the Q3 profitability spreadsheet?!',
      [
        {
          label: 'Yes sir, profits are up 42% across all departments!',
          onSelect: () => {
            openDialogue(
              'Boss Sterling',
              assets.bossPortrait.src,
              'Outstanding! As your reward, you have earned the privilege to work Saturday. Now get back to the main hall!',
              [{ label: 'Right away, sir!', onSelect: () => closeDialogue() }]
            );
          }
        },
        {
          label: 'Actually sir, I came to ask about that promised salary raise...',
          onSelect: () => {
            openDialogue(
              'Boss Sterling',
              assets.bossPortrait.src,
              'A RAISE?! In this macroeconomic climate?! I just ordered a solid mahogany yacht! Do you want the company to go bankrupt?!',
              [{ label: 'Understood, back to my cubicle...', onSelect: () => closeDialogue() }]
            );
          }
        },
        {
          label: 'The coffee machine in the hall is out of beans.',
          onSelect: () => {
            openDialogue(
              'Boss Sterling',
              assets.bossPortrait.src,
              'THIS IS A CODE RED EMERGENCY! Fix it immediately! Drink water until then!',
              [{ label: 'On it, boss!', onSelect: () => closeDialogue() }]
            );
          }
        }
      ]
    );
  } else {
    // Secondary dialogues
    const randomLines = [
      'Don\'t just loiter around my desk, Henderson! Deadlines don\'t meet themselves!',
      'Did you try the executive sparkling water? Don\'t touch it, it\'s for board members only!',
      'Those confidential boxes on the floor? Pretend you didn\'t see them.',
      'Remember Henderson: in this office, work-life balance means 90% work, 10% life!'
    ];
    const line = randomLines[Math.floor(Math.random() * randomLines.length)];
    openDialogue('Boss Sterling', assets.bossPortrait.src, line, [
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
    w: sceneKey === 'BOSS_CABINET' ? 22 : 16,
    h: sceneKey === 'BOSS_CABINET' ? 10 : 8
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

  // Check Door Auto-Entry in Office Hall (walking straight into door)
  if (state.currentScene === 'OFFICE_HALL' && p.y <= 218 && p.x >= 465 && p.x <= 555) {
    enterBossCabinet();
    return;
  }

  // Check Exit Door in Boss Cabinet (walking into right doorway)
  if (state.currentScene === 'BOSS_CABINET' && p.x >= 975 && p.y >= 450) {
    exitToMainHall();
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

  // Active interactable object receives bright white highlight + star
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
  }

  // 3. Draw Player Character
  renderPlayer();

  // 4. Draw Foreground Elements (e.g. if character walks behind desk)
  renderForeground();

  // 5. Draw White Glow for All Interactable Objects
  renderInteractableGlows();

  // 6. Draw Click Target Pulse
  if (state.clickPulse && state.clickPulse.timer > 0) {
    state.clickPulse.timer -= 0.016;
    const progress = 1 - Math.max(0, state.clickPulse.timer / 0.45);
    const radius = 6 + progress * 16;
    const alpha = Math.max(0, 1 - progress);
    ctx.save();
    ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(state.clickPulse.x, state.clickPulse.y, radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

// Helper: Rounded Rectangle Path
function drawRoundedRect(c, x, y, w, h, r) {
  if (r === undefined) r = 6;
  c.beginPath();
  c.moveTo(x + r, y);
  c.lineTo(x + w - r, y);
  c.quadraticCurveTo(x + w, y, x + w, y + r);
  c.lineTo(x + w, y + h - r);
  c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  c.lineTo(x + r, y + h);
  c.quadraticCurveTo(x, y + h, x, y + h - r);
  c.lineTo(x, y + r);
  c.quadraticCurveTo(x, y, x + r, y);
  c.closePath();
}

// Helper: 4-Point Star Sparkle
function drawFourPointStar(c, cx, cy, outerR, innerR) {
  c.beginPath();
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2;
    c.lineTo(cx + Math.cos(angle) * outerR, cy + Math.sin(angle) * outerR);
    const halfAngle = angle + Math.PI / 4;
    c.lineTo(cx + Math.cos(halfAngle) * innerR, cy + Math.sin(halfAngle) * innerR);
  }
  c.closePath();
}

// System: White Glow around Every Interactable Object
function renderInteractableGlows() {
  const scene = SCENES[state.currentScene];
  if (!scene || !scene.triggers) return;

  const time = performance.now() * 0.003;

  scene.triggers.forEach((trig, idx) => {
    if (!trig.glowBox) return;

    const box = trig.glowBox;
    const isNearby = state.activePrompt === trig;

    ctx.save();

    if (isNearby) {
      // High-intensity pulsating white glow when player is near interactable
      const pulse = (Math.sin(time * 5) + 1) * 0.5; // 0 to 1

      // 1. Soft inner translucent wash
      ctx.fillStyle = `rgba(255, 255, 255, ${0.08 + pulse * 0.08})`;
      drawRoundedRect(ctx, box.x, box.y, box.w, box.h, box.r || 6);
      ctx.fill();

      // 2. Bright white outline with glow shadow
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 14 + pulse * 10;
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.85 + pulse * 0.15})`;
      ctx.lineWidth = 2.5;
      drawRoundedRect(ctx, box.x, box.y, box.w, box.h, box.r || 6);
      ctx.stroke();

      // 3. Crisp white corner brackets for indie-game polish
      const cornerLen = Math.min(10, Math.min(box.w, box.h) / 3);
      ctx.shadowBlur = 8;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;

      // Top-Left corner
      ctx.beginPath();
      ctx.moveTo(box.x, box.y + cornerLen);
      ctx.lineTo(box.x, box.y);
      ctx.lineTo(box.x + cornerLen, box.y);
      ctx.stroke();

      // Top-Right corner
      ctx.beginPath();
      ctx.moveTo(box.x + box.w - cornerLen, box.y);
      ctx.lineTo(box.x + box.w, box.y);
      ctx.lineTo(box.x + box.w, box.y + cornerLen);
      ctx.stroke();

      // Bottom-Left corner
      ctx.beginPath();
      ctx.moveTo(box.x, box.y + box.h - cornerLen);
      ctx.lineTo(box.x, box.y + box.h);
      ctx.lineTo(box.x + cornerLen, box.y + box.h);
      ctx.stroke();

      // Bottom-Right corner
      ctx.beginPath();
      ctx.moveTo(box.x + box.w - cornerLen, box.y + box.h);
      ctx.lineTo(box.x + box.w, box.y + box.h);
      ctx.lineTo(box.x + box.w, box.y + box.h - cornerLen);
      ctx.stroke();

      // 4. Floating 4-pointed diamond star above object
      const starCx = box.x + box.w / 2;
      const starCy = box.y - 12 + Math.sin(time * 4) * 3;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 12;
      drawFourPointStar(ctx, starCx, starCy, 6.5, 2.2);
      ctx.fill();
    } else {
      // Subtle ambient white glow around all interactable objects
      const ambientPulse = Math.sin(time * 2 + idx * 1.3) * 0.5 + 0.5;
      const alpha = 0.22 + ambientPulse * 0.18;

      ctx.shadowColor = 'rgba(255, 255, 255, 0.45)';
      ctx.shadowBlur = 5 + ambientPulse * 3;
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
      ctx.lineWidth = 1.5;
      drawRoundedRect(ctx, box.x, box.y, box.w, box.h, box.r || 6);
      ctx.stroke();
    }

    ctx.restore();
  });
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

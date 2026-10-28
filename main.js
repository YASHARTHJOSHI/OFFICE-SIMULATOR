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
  char3Sitting: new Image(),
  char1SeatedDesk: new Image(),
  char2SeatedDesk: new Image(),
  char3SeatedDesk: new Image(),
  npc_rahulSpritesheet: new Image(),
  npc_rahulPortrait: new Image(),
  npc_rahulSeated: new Image(),
  npc_rahulFront: new Image(),
  npc_rahulBack: new Image(),
  npc_priyaSpritesheet: new Image(),
  npc_priyaPortrait: new Image(),
  npc_priyaSeated: new Image(),
  npc_priyaFront: new Image(),
  npc_priyaBack: new Image(),
  npc_amitSpritesheet: new Image(),
  npc_amitPortrait: new Image(),
  npc_amitSeated: new Image(),
  npc_amitFront: new Image(),
  npc_amitBack: new Image(),
  npc_nehaSpritesheet: new Image(),
  npc_nehaPortrait: new Image(),
  npc_nehaSeated: new Image(),
  npc_nehaFront: new Image(),
  npc_nehaBack: new Image(),
  cafeteriaRoom: new Image(),
  cafeteriaDoor: new Image(),
  fgComputerCodeMonitor: new Image(),
  fgComputerRightMonitor: new Image(),
  fgComputerCrtMonitor: new Image(),
  bigWorkplace: new Image()
};

let isGameInitialized = false;
let isScriptReady = false;
const loadedAssets = new Set();
let totalRegisteredAssets = 0;

function checkAllAssetsLoaded() {
  if (isGameInitialized || !isScriptReady) return;
  if (totalRegisteredAssets > 0 && loadedAssets.size >= totalRegisteredAssets) {
    console.log('All game assets loaded successfully!');
    initGame();
  }
}

function registerAsset(key, src) {
  totalRegisteredAssets++;
  if (!assets[key]) {
    assets[key] = new Image();
  }
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
  if (img.complete && img.naturalWidth !== 0) {
    loadedAssets.add(key);
  }
}

registerAsset('officeHall', 'assets/office_hall.png?v=5');
registerAsset('bossCabinet', 'assets/boss_cabinet.png');
registerAsset('spritesheet', 'assets/spritesheet.png');
registerAsset('charIdle', 'assets/character_idle.png');
registerAsset('charBack', 'assets/char_back.png?v=6');
registerAsset('char1Back', 'assets/char1_back.png?v=6');
registerAsset('char2Back', 'assets/char2_back.png?v=6');
registerAsset('char3Back', 'assets/char3_back.png?v=6');
registerAsset('char4Back', 'assets/char4_back.png?v=7');
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
registerAsset('char3Spritesheet', 'assets/char3_spritesheet.png?v=2');
registerAsset('char4Spritesheet', 'assets/char4_spritesheet.png?v=9');
registerAsset('char1Avatar', 'assets/char1_avatar.png');
registerAsset('char2Avatar', 'assets/char2_avatar.png');
registerAsset('char3Avatar', 'assets/char3_avatar.png?v=2');
registerAsset('char4Avatar', 'assets/char4_avatar.png?v=7');
registerAsset('char1Idle', 'assets/char1_idle.png');
registerAsset('char2Idle', 'assets/char2_idle.png');
registerAsset('char3Idle', 'assets/char3_idle.png?v=2');
registerAsset('char4Idle', 'assets/char4_idle.png?v=7');
registerAsset('char1Sitting', 'assets/char1_sitting.png?v=20');
registerAsset('char2Sitting', 'assets/char2_sitting.png?v=20');
registerAsset('char3Sitting', 'assets/char3_sitting.png?v=20');
registerAsset('char4Sitting', 'assets/char4_seated_desk.png?v=20');
registerAsset('char1SeatedDesk', 'assets/char1_seated_desk.png?v=20');
registerAsset('char2SeatedDesk', 'assets/char2_seated_desk.png?v=20');
registerAsset('char3SeatedDesk', 'assets/char3_seated_desk.png?v=20');
registerAsset('char4SeatedDesk', 'assets/char4_seated_desk.png?v=20');
registerAsset('char1DiningSitting', 'assets/char1_dining_sitting.png?v=4');
registerAsset('char2DiningSitting', 'assets/char2_dining_sitting.png?v=4');
registerAsset('char3DiningSitting', 'assets/char3_dining_sitting.png?v=4');
registerAsset('char4DiningSitting', 'assets/char4_dining_sitting.png?v=7');
registerAsset('char5Back', 'assets/char5_back.png?v=1');
registerAsset('char5Spritesheet', 'assets/char5_spritesheet.png?v=1');
registerAsset('char5Avatar', 'assets/char5_avatar.png?v=1');
registerAsset('char5Idle', 'assets/char5_idle.png?v=1');
registerAsset('char5Sitting', 'assets/char5_seated_desk.png?v=1');
registerAsset('char5SeatedDesk', 'assets/char5_seated_desk.png?v=1');
registerAsset('char5DiningSitting', 'assets/char5_dining_sitting.png?v=1');
registerAsset('char6Back', 'assets/char6_back.png?v=1');
registerAsset('char6Spritesheet', 'assets/char6_spritesheet.png?v=1');
registerAsset('char6Avatar', 'assets/char6_avatar.png?v=1');
registerAsset('char6Idle', 'assets/char6_idle.png?v=1');
registerAsset('char6Sitting', 'assets/char6_seated_desk.png?v=1');
registerAsset('char6SeatedDesk', 'assets/char6_seated_desk.png?v=1');
registerAsset('char6DiningSitting', 'assets/char6_dining_sitting.png?v=1');

// Foreground occlusion props (for computer monitors & depth sorting)
registerAsset('fgComputerCodeMonitor', 'assets/fg_computer_code_monitor.png?v=1');
registerAsset('fgComputerRightMonitor', 'assets/fg_computer_right_monitor.png?v=1');
registerAsset('fgComputerCrtMonitor', 'assets/fg_computer_crt_monitor.png?v=1');
registerAsset('fgCornerDesk', 'assets/fg_corner_desk.png?v=3');
registerAsset('bossDeskFg', 'assets/boss_desk_fg.png?v=3');
registerAsset('fgHallDeskTopLeft', 'assets/fg_hall_desk_top_left.png?v=3');
registerAsset('fgHallDeskTopRight', 'assets/fg_hall_desk_top_right.png?v=3');
registerAsset('fgHallDeskBotLeft', 'assets/fg_hall_desk_bot_left.png?v=3');
registerAsset('fgHallDeskBotRight', 'assets/fg_hall_desk_bot_right.png?v=3');
registerAsset('fgHallDeskRight', 'assets/fg_hall_desk_right.png?v=3');
registerAsset('fgHallDeskLeft', 'assets/fg_hall_desk_left.png?v=3');

// 4 Workplace Quest NPC Employees (Rahul, Priya, Amit, Neha)
registerAsset('npc_rahulSpritesheet', 'assets/npc_rahul_spritesheet.png?v=12');
registerAsset('npc_rahulPortrait', 'assets/npc_rahul_portrait.png?v=12');
registerAsset('npc_rahulSeated', 'assets/npc_rahul_seated.png?v=20');
registerAsset('npc_rahulFront', 'assets/npc_rahul_front.png?v=12');
registerAsset('npc_rahulBack', 'assets/npc_rahul_back.png?v=12');

registerAsset('npc_priyaSpritesheet', 'assets/npc_priya_spritesheet.png?v=12');
registerAsset('npc_priyaPortrait', 'assets/npc_priya_portrait.png?v=12');
registerAsset('npc_priyaSeated', 'assets/npc_priya_seated.png?v=20');
registerAsset('npc_priyaFront', 'assets/npc_priya_front.png?v=12');
registerAsset('npc_priyaBack', 'assets/npc_priya_back.png?v=12');

registerAsset('npc_amitSpritesheet', 'assets/npc_amit_spritesheet.png?v=12');
registerAsset('npc_amitPortrait', 'assets/npc_amit_portrait.png?v=12');
registerAsset('npc_amitSeated', 'assets/npc_amit_seated.png?v=20');
registerAsset('npc_amitFront', 'assets/npc_amit_front.png?v=12');
registerAsset('npc_amitBack', 'assets/npc_amit_back.png?v=12');

registerAsset('npc_nehaSpritesheet', 'assets/npc_neha_spritesheet.png?v=12');
registerAsset('npc_nehaPortrait', 'assets/npc_neha_portrait.png?v=12');
registerAsset('npc_nehaSeated', 'assets/npc_neha_seated.png?v=20');
registerAsset('npc_nehaFront', 'assets/npc_neha_front.png?v=12');
registerAsset('npc_nehaBack', 'assets/npc_neha_back.png?v=12');

// Cafeteria & Lounge Assets
registerAsset('cafeteriaRoom', 'assets/cafeteria_room.png');
registerAsset('cafeteriaDoor', 'assets/cafeteria_door.png');
registerAsset('bigWorkplace', 'assets/big_workplace.png?v=36');
registerAsset('fgProjectorScreen', 'assets/fg_projector_screen.png?v=1');
registerAsset('conferenceRoom', 'assets/conference_room.png?v=1');

// ==========================================
// GAME STATE & CONSTANTS
// ==========================================
const CANVAS_WIDTH = 1024;
const CANVAS_HEIGHT = 576;

const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

// Restore cached wallet balance so player money never resets to $0 on refresh
const getInitialSavedMoney = () => {
  try {
    const directMoney = localStorage.getItem('officesim_saved_money');
    const lastUid = localStorage.getItem('officesim_last_uid');
    let profileMoney = 0;
    if (lastUid) {
      const pStr = localStorage.getItem('officesim_profile_' + lastUid);
      if (pStr) {
        const p = JSON.parse(pStr);
        if (p && p.money !== undefined) profileMoney = Number(p.money) || 0;
      }
    }
    return Math.max(Number(directMoney) || 0, profileMoney);
  } catch (e) {
    return 0;
  }
};

const initialWalletBalance = getInitialSavedMoney();

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
    money: initialWalletBalance,
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
    // Foreground occlusion props (Applicable ONLY for computers so characters move cleanly behind computers)
    foregroundProps: [
      {
        id: 'comp_mon_bot_left',
        img: () => assets.fgComputerCodeMonitor,
        x: 370,
        y: 386,
        w: 64,
        h: 58,
        sortY: 444
      },
      {
        id: 'comp_mon_bot_right',
        img: () => assets.fgComputerCodeMonitor,
        x: 514,
        y: 386,
        w: 64,
        h: 58,
        sortY: 444
      },
      {
        id: 'comp_mon_top_left',
        img: () => assets.fgComputerCodeMonitor,
        x: 366,
        y: 210,
        w: 64,
        h: 58,
        sortY: 268
      },
      {
        id: 'comp_mon_top_right',
        img: () => assets.fgComputerCodeMonitor,
        x: 510,
        y: 210,
        w: 64,
        h: 58,
        sortY: 268
      },
      {
        id: 'comp_mon_dev_left',
        img: () => assets.fgComputerCodeMonitor,
        x: 60,
        y: 344,
        w: 64,
        h: 58,
        sortY: 402
      },
      {
        id: 'comp_mon_right_desk',
        img: () => assets.fgComputerRightMonitor,
        x: 864,
        y: 248,
        w: 66,
        h: 70,
        sortY: 318
      }
    ],
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

      // Left upper L-desk surfaces (tabletop only, leaving chair at x: 95, y: 395 walkable)
      { x: 0, y: 250, w: 60, h: 165, label: 'Desk Left Arm' },
      { x: 60, y: 250, w: 105, h: 75, label: 'Desk Surface Top' },
      // Left lower desk monitor & table surface (leaving chair at x: 100, y: 495 walkable)
      { x: 50, y: 420, w: 155, h: 42, label: 'Desk Bottom Monitor Surface' },
      { x: 10, y: 440, w: 38, h: 55, label: 'Trash Can' },

      // Center desk cluster (4 separate desks so all aisles and horizontal walkways are open!)
      { x: 350, y: 275, w: 88, h: 55, label: 'Desk Top-Left' },
      { x: 512, y: 275, w: 88, h: 55, label: 'Desk Top-Right' },
      { x: 350, y: 425, w: 88, h: 55, label: 'Desk Bottom-Left' },
      { x: 512, y: 425, w: 88, h: 55, label: 'Desk Bottom-Right' },

      // Right desk (compact bounds so hallway to cafeteria is wide open)
      { x: 765, y: 310, w: 110, h: 80, label: 'Desk' },

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
        prompt: '💧 Fill Water Glass [E]',
        promptPos: { x: 975, y: 170 },
        action: () => {
          if (window.waterCoolerGame) {
            window.waterCoolerGame.open();
          } else {
            window.soundManager.playWater();
            showToast('💧 Gulp, gulp... Refreshing! Stamina restored to 100%.');
          }
        }
      },
      // Assigned Workstation (Marked Laptop & Red Mug on Left Upper Desk)
      {
        id: 'workstation_upper_left',
        x: 65, y: 345, w: 85, h: 75,
        prompt: '💻 Open Assigned PC [E]  •  Sit [C]',
        promptPos: { x: 95, y: 335 },
        action: () => {
          if (window.openWorkstationPC) {
            window.openWorkstationPC();
          } else {
            toggleSitInChair(99, 393, 'up', 145, 395);
          }
        }
      },
      // Left Lower Desk (Code Monitor & Keyboard)
      {
        id: 'workstation_lower_left',
        x: 65, y: 445, w: 85, h: 75,
        prompt: 'Sit & Work at Dev Workstation [E / C]',
        promptPos: { x: 100, y: 440 },
        action: () => toggleSitInChair(99, 498, 'up', 145, 500)
      },
      {
        id: 'workstation_bottom_left',
        x: 375, y: 475, w: 75, h: 75,
        prompt: 'Sit at Workstation [E / C]',
        promptPos: { x: 410, y: 495 },
        action: () => toggleSitInChair(410, 546, 'up', 410, 510)
      },
      {
        id: 'workstation_bottom_right',
        x: 525, y: 475, w: 75, h: 75,
        prompt: 'Sit at Workstation [E / C]',
        promptPos: { x: 560, y: 495 },
        action: () => toggleSitInChair(560, 552, 'up', 560, 510)
      },
      {
        id: 'workstation_top_left',
        x: 375, y: 305, w: 75, h: 75,
        prompt: 'Sit at Workstation [E / C]',
        promptPos: { x: 409, y: 330 },
        action: () => toggleSitInChair(409, 380, 'up', 409, 410)
      },
      {
        id: 'workstation_top_right',
        x: 520, y: 305, w: 75, h: 75,
        prompt: 'Sit at Workstation [E / C]',
        promptPos: { x: 556, y: 330 },
        action: () => toggleSitInChair(558, 380, 'up', 558, 410)
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
      },
      {
        id: 'door_to_cafeteria',
        x: 900, y: 320, w: 105, h: 130,
        prompt: 'Enter Cafeteria ☕ [E / Space]',
        promptPos: { x: 955, y: 300 },
        action: () => enterCafeteria()
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
    // Foreground occlusion props
    foregroundProps: [],
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
        prompt: '💧 Executive Filtered Water [E]',
        promptPos: { x: 745, y: 430 },
        action: () => {
          if (window.waterCoolerGame) {
            window.waterCoolerGame.open();
          } else {
            window.soundManager.playWater();
            showToast('✨ Sssip... Ultra-purified Alpine glacier water! Tastes like luxury.');
          }
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
    objective: 'Explore the study, talk to HR Ma\'am, or exit through the right door',
    bg: () => assets.cornerOffice,
    playerScale: 0.95,
    playerWidth: 68,
    playerHeight: 145,
    spawn: { x: 930, y: 495, dir: 'left' },
    // Foreground occlusion props
    foregroundProps: [],
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
      { x: 435, y: 468, w: 30, h: 20, label: 'HR Lead' },
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
        x: 390, y: 440, w: 120, h: 90,
        prompt: 'Talk to HR Ma\'am',
        promptPos: { x: 450, y: 410 },
        action: () => startPartnerDialogue()
      },
      {
        id: 'corner_visitor_chair',
        x: 275, y: 455, w: 90, h: 65,
        prompt: 'Sit in Visitor Chair [E / C]',
        promptPos: { x: 320, y: 440 },
        action: () => toggleSitInChair(320, 495)
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
  },

  CAFETERIA: {
    name: 'Office Cafeteria & Lounge',
    badge: 'Cafeteria',
    objective: 'Grab a hot espresso, buy snacks from vending machine, or relax on the lounge sofa',
    bg: () => assets.cafeteriaRoom,
    playerScale: 0.58,
    playerWidth: 42,
    playerHeight: 90,
    spawn: { x: 115, y: 295, dir: 'down' },
    // Boundaries & Obstacles for clean open movement
    obstacles: [
      // Top wall barrier (leaving door opening at x: 75-160 open up to y: 245)
      { x: 0, y: 0, w: 75, h: 260, label: 'Wall Left of Door' },
      { x: 75, y: 0, w: 85, h: 245, label: 'Door Threshold' },
      { x: 160, y: 0, w: CANVAS_WIDTH - 160, h: 260, label: 'Wall Right of Door' },
      // Bottom barrier
      { x: 0, y: 550, w: CANVAS_WIDTH, h: 30, label: 'Bottom' },
      // Left boundary wall
      { x: 0, y: 0, w: 15, h: CANVAS_HEIGHT, label: 'Wall' },
      // Right boundary wall
      { x: 1010, y: 0, w: 15, h: CANVAS_HEIGHT, label: 'Wall' },

      // Back Counter & Kitchen Island (Y <= 270)
      { x: 310, y: 220, w: 695, h: 65, label: 'Cafeteria Counter' },

      // Left Lounge Velvet Sofa & Table (Accurately bounded so all hallways are 100% wide and clear)
      { x: 5, y: 360, w: 70, h: 170, label: 'Velvet Sofa' },
      { x: 95, y: 430, w: 70, h: 60, label: 'Coffee Table' },
      { x: 180, y: 385, w: 75, h: 70, label: 'Armchair Top' },
      { x: 180, y: 500, w: 75, h: 70, label: 'Armchair Bottom' },

      // Center Dining Table with 2 colleagues chatting
      { x: 445, y: 430, w: 105, h: 55, label: 'Center Dining Table' },

      // Right Dining Tables (only the central pedestal base so chairs and walkways are 100% open)
      { x: 655, y: 335, w: 65, h: 55, label: 'Dining Table 1' },
      { x: 865, y: 335, w: 65, h: 55, label: 'Dining Table 2' },
      { x: 655, y: 470, w: 65, h: 55, label: 'Dining Table 3' },
      { x: 865, y: 470, w: 65, h: 55, label: 'Dining Table 4' }
    ],

    triggers: [
      // 1. Exit Door back to Main Office Hall (Door at x: 75-160, y: 240)
      {
        id: 'exit_cafeteria_to_hall',
        x: 75, y: 240, w: 85, h: 45,
        prompt: 'Exit to Main Office Hall',
        promptPos: { x: 115, y: 235 },
        action: () => exitCafeteriaToMainHall()
      },
      // 2. Professional Espresso Machine
      {
        id: 'cafe_espresso_machine',
        x: 310, y: 245, w: 130, h: 60,
        prompt: 'Brew Fresh Espresso ☕ [E]',
        promptPos: { x: 375, y: 225 },
        action: () => {
          if (window.coffeeMachine) {
            window.coffeeMachine.open();
          } else {
            window.soundManager.playWater();
            showToast('☕ *Psssshh* Rich dark espresso brewed! Energy boosted to 100%! ⚡');
          }
        }
      },
      // 3. Glowing Vending Machine
      {
        id: 'cafe_vending_machine',
        x: 540, y: 245, w: 110, h: 60,
        prompt: 'Buy Snack / Energy Drink 🥤',
        promptPos: { x: 595, y: 225 },
        action: () => {
          window.soundManager.playInteract();
          showToast('🥤 *Clatter* Can of Spark Energy dispensed! "0 sugar, 500% productivity."');
        }
      },
      // 4. Microwave Station
      {
        id: 'cafe_microwave',
        x: 660, y: 245, w: 85, h: 60,
        prompt: 'Heat Lunch in Microwave 🍲',
        promptPos: { x: 700, y: 225 },
        action: () => {
          window.soundManager.playInteract();
          showToast('🍲 *Beep beep* Lunch heated! Smells delicious.');
        }
      },
      // 5. Office Refrigerator
      {
        id: 'cafe_refrigerator',
        x: 910, y: 245, w: 90, h: 60,
        prompt: 'Check Fridge ❄️',
        promptPos: { x: 955, y: 225 },
        action: () => {
          window.soundManager.playInteract();
          showToast('❄️ Fridge note: "Please label your tupperware or HR will compost it on Friday."');
        }
      },
      // 6. Barista Intern (Alex)
      {
        id: 'talk_to_barista',
        x: 470, y: 250, w: 80, h: 65,
        prompt: 'Chat with Alex (Barista Intern)',
        promptPos: { x: 510, y: 230 },
        action: () => {
          window.soundManager.playInteract();
          showToast('🧑‍🍳 Alex: "Hey! Tip of the day: don\'t reply-all to the CEO\'s email!"');
        }
      },
      // 7. Doorway to Big Workplace Hub (connected after Cafeteria)
      {
        id: 'door_to_big_workplace',
        x: 900, y: 310, w: 110, h: 120,
        prompt: 'Enter R&D Mega-Hub 🏢 [E / Space]',
        promptPos: { x: 950, y: 340 },
        action: () => enterBigWorkplace()
      }
    ]
  },

  BIG_WORKPLACE: {
    name: 'Acme R&D Innovation Mega-Hub',
    badge: 'R&D Mega-Hub',
    objective: 'Global Telemetry Intelligence (All-Hands): Inspect architecture whiteboards, collaborate with developers, or attend Stage Presentation',
    bg: () => (assets.bigWorkplace && assets.bigWorkplace.complete && assets.bigWorkplace.naturalWidth > 0 ? assets.bigWorkplace : (window.workplacePaper ? window.workplacePaper.getCanvas() : null)),
    playerScale: 0.58,
    playerWidth: 42,
    playerHeight: 90,
    spawn: { x: 80, y: 380, dir: 'right' },
    foregroundProps: [
      {
        x: 787,
        y: 154,
        w: 237,
        h: 276,
        sortY: 380,
        img: () => assets.fgProjectorScreen
      }
    ],
    obstacles: [
      // Top panoramic glass window wall & back developer desks barrier
      { x: 0, y: 0, w: CANVAS_WIDTH, h: 140, label: 'Panoramic Windows & Back Desks' },
      // Bottom room boundary
      { x: 0, y: 550, w: CANVAS_WIDTH, h: 30, label: 'Bottom Boundary' },
      // Left boundary (leaving corridor open at y: 300-420 for Cafeteria entrance)
      { x: 0, y: 0, w: 20, h: 300, label: 'Left Wall Upper' },
      { x: 0, y: 420, w: 20, h: 160, label: 'Left Wall Lower' },
      // Right boundary wall (open passage at y: 150-255 behind projector screen to Conference Room)
      { x: 1008, y: 0, w: 16, h: 150, label: 'Right Wall Upper' },
      { x: 1008, y: 255, w: 16, h: CANVAS_HEIGHT - 255, label: 'Right Wall Lower' },

      // Central Rolling Whiteboards Partition
      { x: 60, y: 195, w: 600, h: 110, label: 'Whiteboards & Architecture Partition' },

      // Foreground Developer Workstation Pods
      { x: 45, y: 395, w: 185, h: 90, label: 'Dev Pod 1 (Frontend & Systems)' },
      { x: 245, y: 395, w: 185, h: 90, label: 'Dev Pod 2 (Core AI & Engine)' },
      { x: 450, y: 395, w: 185, h: 90, label: 'Dev Pod 3 (Telemetry & Cloud)' },

      // Break Counter & Credenza
      { x: 745, y: 70, w: 165, h: 75, label: 'Coffee Credenza' },
      // Vending Machine
      { x: 915, y: 50, w: 95, h: 100, label: 'Vending Machine' },

      // Right Raised Stage Presentation Area (front stage face only; passage behind screen is open)
      { x: 785, y: 255, w: 230, h: 80, label: 'Stage Keynote Screen Front' },
      { x: 735, y: 310, w: 45, h: 65, label: 'Water Cooler' },
      { x: 935, y: 430, w: 75, h: 80, label: 'Stage Lectern' }
    ],

    triggers: [
      // Exit Doorway back to Cafeteria
      {
        id: 'door_back_to_cafe',
        x: 0, y: 310, w: 80, h: 100,
        prompt: 'Return to Cafeteria [E / Space]',
        promptPos: { x: 60, y: 360 },
        action: () => exitBigWorkplaceToCafeteria()
      },
      // 1. Architecture Flowchart Whiteboard
      {
        id: 'board_architecture',
        x: 65, y: 240, w: 185, h: 65,
        prompt: '📐 Inspect Architecture Flowchart [E]',
        promptPos: { x: 155, y: 250 },
        action: () => {
          window.soundManager.playInteract();
          if (window.workplacePaper) window.workplacePaper.openStudio();
          else showToast('📐 Architecture: Event-driven Telemetry pipeline synced across 4 global edge clusters.');
        }
      },
      // 2. Microservices Code Whiteboard
      {
        id: 'board_code',
        x: 265, y: 240, w: 145, h: 65,
        prompt: '💻 Inspect Microservices Engine Spec [E]',
        promptPos: { x: 335, y: 250 },
        action: () => {
          window.soundManager.playInteract();
          showToast('💻 <EXTENDS:CODE>: Latency down to 0.8ms. Zero packet loss on high-throughput queue!');
        }
      },
      // 3. Sprint Planning Whiteboard
      {
        id: 'board_sprint',
        x: 425, y: 240, w: 155, h: 65,
        prompt: '📋 Review All-Hands Sprint Roadmap [E]',
        promptPos: { x: 500, y: 250 },
        action: () => {
          window.soundManager.playInteract();
          showToast('📋 Sprint Board: 94% telemetry tasks resolved! Release candidate approved.');
        }
      },
      // 4. Whiteboard Standup Team Discussion
      {
        id: 'standup_team',
        x: 390, y: 290, w: 170, h: 75,
        prompt: '👥 Join Whiteboard Standup Sync [E]',
        promptPos: { x: 470, y: 295 },
        action: () => {
          window.soundManager.playInteract();
          showToast('👥 Dev Standup: "We migrated the event dispatcher to WebSockets. The telemetry feed is blazing fast!"');
        }
      },
      // 5. ACME Metrics Stage Presentation
      {
        id: 'stage_presentation',
        x: 790, y: 320, w: 190, h: 80,
        prompt: '📊 Attend ACME Keynote Presentation [E]',
        promptPos: { x: 885, y: 330 },
        action: () => {
          window.soundManager.playInteract();
          if (window.pixelEngine && window.pixelEngine.particles) {
            window.pixelEngine.particles.spawnEmbers(885, 330);
          }
          showToast('📊 Keynote: "Global Telemetry throughput reached 3.4M req/sec at 99.999% uptime!"');
        }
      },
      // 6. Lead Presenter Kavita on Stage
      {
        id: 'speaker_kavita',
        x: 925, y: 330, w: 75, h: 90,
        prompt: '🎤 Talk to Keynote Lead Kavita [E]',
        promptPos: { x: 955, y: 330 },
        action: () => {
          window.soundManager.playInteract();
          showToast('🎤 Kavita: "Welcome to Acme Mega-Hub! Review the architecture whiteboard or test your code at Dev Pod 1."');
        }
      },
      // 7. Water Cooler Station
      {
        id: 'water_cooler',
        x: 725, y: 300, w: 65, h: 80,
        prompt: '💧 Hydrate at Water Cooler [E]',
        promptPos: { x: 755, y: 300 },
        action: () => {
          if (window.waterCoolerGame) {
            window.waterCoolerGame.open();
          } else {
            window.soundManager.playInteract();
            if (window.pixelEngine && window.pixelEngine.particles) {
              window.pixelEngine.particles.spawnWaterSparkles(755, 320);
            }
            showToast('💧 Refreshing ice-cold water! "Did you see that telemetry curve on stage? Incredible work!"');
          }
        }
      },
      // 8. Espresso & Coffee Bar
      {
        id: 'coffee_bar',
        x: 755, y: 135, w: 110, h: 60,
        prompt: '☕ Brew R&D Espresso [E]',
        promptPos: { x: 810, y: 140 },
        action: () => {
          if (window.coffeeMachine) {
            window.coffeeMachine.open();
          } else {
            window.soundManager.playInteract();
            if (window.pixelEngine && window.pixelEngine.particles) {
              window.pixelEngine.particles.spawnCoffeeSteam(790, 85);
              window.pixelEngine.particles.spawnCoffeeSteam(830, 85);
            }
            showToast('☕ Double shot espresso pulled! Developer focus accelerated.');
          }
        }
      },
      // 9. Snack Vending Machine
      {
        id: 'vending_machine',
        x: 915, y: 130, w: 90, h: 60,
        prompt: '🍫 Buy Brain Fuel Snack [E]',
        promptPos: { x: 960, y: 135 },
        action: () => {
          window.soundManager.playInteract();
          showToast('🍫 Dispensed Nitro Crunch Protein Bar! Developer energy restored.');
        }
      },
      // 10. Dev Pod 1 Sitting Trigger
      {
        id: 'dev_pod_1',
        x: 90, y: 460, w: 95, h: 75,
        prompt: 'Sit at Dev Pod 1 (Frontend & Systems) [E / C]',
        promptPos: { x: 138, y: 465 },
        action: () => toggleSitInChair(138, 490, 'up', 138, 540)
      },
      // 11. Dev Pod 2 Sitting Trigger
      {
        id: 'dev_pod_2',
        x: 295, y: 460, w: 95, h: 75,
        prompt: 'Sit at Dev Pod 2 (Core AI & Engine) [E / C]',
        promptPos: { x: 342, y: 465 },
        action: () => toggleSitInChair(342, 490, 'up', 342, 540)
      },
      // 12. Dev Pod 3 Sitting Trigger
      {
        id: 'dev_pod_3',
        x: 500, y: 460, w: 95, h: 75,
        prompt: 'Sit at Dev Pod 3 (Cloud Telemetry) [E / C]',
        promptPos: { x: 546, y: 465 },
        action: () => toggleSitInChair(546, 490, 'up', 546, 540)
      },
      // 13. Doorway behind Projector Screen to Conference Room
      {
        id: 'door_to_conference_room',
        x: 930, y: 155, w: 90, h: 100,
        prompt: 'Enter Conference Room 👔 [E / Space]',
        promptPos: { x: 965, y: 195 },
        action: () => enterConferenceRoomFromBigWorkplace()
      }
    ]
  },

  CONFERENCE_ROOM: {
    name: 'Executive Boardroom & Conference Suite',
    badge: 'Conference Room',
    objective: 'Executive Strategy: Review live telemetry on the Smart Board, align on roadmap whiteboard, or hold meeting at executive table',
    bg: () => (assets.conferenceRoom && assets.conferenceRoom.complete && assets.conferenceRoom.naturalWidth > 0 ? assets.conferenceRoom : null),
    playerScale: 0.58,
    playerWidth: 42,
    playerHeight: 90,
    spawn: { x: 100, y: 350, dir: 'right' },
    obstacles: [
      // Top panoramic window wall, sill, plants, credenza and upper furniture (strictly blocks walking on window sill & walls)
      { x: 0, y: 0, w: CANVAS_WIDTH, h: 310, label: 'Panoramic Windows & Back Wall' },
      // Bottom room boundary (carpet bottom edge)
      { x: 0, y: 545, w: CANVAS_WIDTH, h: 35, label: 'Bottom Boundary' },
      // Left glass wall (exit doorway open at y: 310-440)
      { x: 0, y: 0, w: 30, h: 310, label: 'Left Glass Partition Upper' },
      { x: 0, y: 440, w: 30, h: 140, label: 'Left Glass Partition Lower' },
      // Right room boundary wall & server rack
      { x: 860, y: 0, w: 164, h: 440, label: 'Right Wall & Smart Board' },
      // Water cooler in bottom-right corner
      { x: 840, y: 440, w: 184, h: 140, label: 'Water Cooler Corner' },

      // Central Mahogany Conference Table and all executive chairs (seated executives & chairs)
      { x: 250, y: 310, w: 475, h: 175, label: 'Mahogany Conference Table & Chairs' }
    ],
    triggers: [
      // Exit Doorway back to Big Workplace (returns behind projector screen)
      {
        id: 'door_back_to_big_workplace',
        x: 0, y: 310, w: 90, h: 140,
        prompt: 'Return to R&D Mega-Hub 🏢 [E / Space]',
        promptPos: { x: 60, y: 360 },
        action: () => exitConferenceRoomToBigWorkplace()
      },
      // 1. High-Tech Analytics Smart Board
      {
        id: 'conf_smart_board',
        x: 760, y: 350, w: 90, h: 90,
        prompt: '📊 Review Live Telemetry Smart Board [E]',
        promptPos: { x: 810, y: 380 },
        action: () => {
          window.soundManager.playInteract();
          if (window.pixelEngine && window.pixelEngine.particles) {
            window.pixelEngine.particles.spawnEmbers(810, 380);
          }
          showToast('📊 Smart Board: "Global telemetry load 99.98% optimal. All 4 distributed clusters synced!"');
        }
      },
      // 2. Q3 Roadmap Strategy Whiteboard
      {
        id: 'conf_q3_whiteboard',
        x: 710, y: 310, w: 80, h: 60,
        prompt: '📋 Inspect Q3 Expansion Whiteboard [E]',
        promptPos: { x: 750, y: 330 },
        action: () => {
          window.soundManager.playInteract();
          showToast('📋 Q3 Plan: "Next phase: Multi-region latency replication and autonomous AI office assistant."');
        }
      },
      // 3. Conference Espresso Credenza
      {
        id: 'conf_espresso_credenza',
        x: 170, y: 310, w: 80, h: 60,
        prompt: '☕ Brew Executive Blend Coffee [E]',
        promptPos: { x: 210, y: 330 },
        action: () => {
          if (window.coffeeMachine) {
            window.coffeeMachine.open();
          } else {
            window.soundManager.playInteract();
            if (window.pixelEngine && window.pixelEngine.particles) {
              window.pixelEngine.particles.spawnCoffeeSteam(210, 320);
            }
            showToast('☕ Executive Dark Roast brewed! Focus +100% for the upcoming board meeting.');
          }
        }
      },
      // 4. Conference Board Meeting Table Sitting
      {
        id: 'conf_board_meeting',
        x: 240, y: 480, w: 500, h: 55,
        prompt: '🪑 Take Seat at Executive Table [E / C]',
        promptPos: { x: 500, y: 495 },
        action: () => {
          const sitX = state.player.x < 360 ? 300 : (state.player.x > 620 ? 690 : 500);
          toggleSitInChair(sitX, 475, 'up', sitX, 515);
        }
      },
      // 5. Water Cooler Station (supports water cooler mini-game)
      {
        id: 'conf_water_cooler',
        x: 790, y: 460, w: 60, h: 70,
        prompt: '💧 Hydrate at Water Cooler [E]',
        promptPos: { x: 820, y: 490 },
        action: () => {
          if (window.waterCoolerGame) {
            window.waterCoolerGame.open();
          } else {
            window.soundManager.playInteract();
            if (window.pixelEngine && window.pixelEngine.particles) {
              window.pixelEngine.particles.spawnWaterSparkles(820, 490);
            }
            showToast('💧 Pure mountain spring water! "Hydration is the secret to marathon strategy sessions."');
          }
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
  setupColleagueChatListeners();
  setupObjectivesWidget();
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
    const tag = (e.target && e.target.tagName ? e.target.tagName.toLowerCase() : '');
    if (tag === 'input' || tag === 'textarea' || (e.target && e.target.isContentEditable)) return;

    if (window.officeMap && window.officeMap.isOpen) {
      if (isDown && (e.key === 'Escape' || e.code === 'Escape' || e.key === 'm' || e.key === 'M' || e.code === 'KeyM')) {
        window.officeMap.close();
      }
      return;
    }

    if (window.waterCoolerGame && window.waterCoolerGame.isOpen) {
      if (isDown && (e.key === 'Escape' || e.code === 'Escape')) {
        window.waterCoolerGame.close();
      }
      return;
    }

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
      if (k === 'q' || c === 'KeyQ') {
        toggleClassicDashboard();
        matched = true;
      }
      if (k === 'i' || c === 'KeyI') {
        togglePagerModal();
        matched = true;
      }
      if (k === 'p' || c === 'KeyP') {
        if (window.phoneDevice) window.phoneDevice.toggle();
        matched = true;
      }
      if (k === 'o' || c === 'KeyO') {
        if (typeof window.toggleObjectivesPanel === 'function') {
          window.toggleObjectivesPanel();
        }
        matched = true;
      }
      if (k === 'm' || c === 'KeyM') {
        if (window.officeMap) window.officeMap.toggle();
        matched = true;
      }
      if (k === 'escape' || c === 'Escape') {
        if (state.isDialogueOpen) {
          closeDialogue();
          matched = true;
        } else {
          const objPanel = document.getElementById('hud-objectives-panel');
          if (objPanel && !objPanel.classList.contains('hidden')) {
            if (typeof window.toggleObjectivesPanel === 'function') window.toggleObjectivesPanel(false);
            matched = true;
          } else if (window.officeMap && window.officeMap.isOpen) {
            window.officeMap.close();
            matched = true;
          } else if (window.phoneDevice && window.phoneDevice.isOpen) {
            window.phoneDevice.close();
            matched = true;
          } else {
            const chatBar = document.getElementById('colleague-chat-bar');
            if (chatBar && !chatBar.classList.contains('hidden')) {
              closeColleagueChat();
              matched = true;
            }
          }
        }
      }
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

    // Direct click on room portal badges
    if (state.currentScene === 'OFFICE_HALL') {
      // Top: Boss Suite badge (cx: 512, cy: 148)
      if (Math.abs(targetX - 512) <= 55 && Math.abs(targetY - 148) <= 16) {
        enterBossCabinet();
        return;
      }
      // Bottom-left: Corner Office badge (cx: 50, cy: 462)
      if (Math.abs(targetX - 50) <= 55 && Math.abs(targetY - 462) <= 16) {
        enterCornerOffice();
        return;
      }
      // Right: Cafeteria badge (cx: 960, cy: 355)
      if (Math.abs(targetX - 960) <= 55 && Math.abs(targetY - 355) <= 16) {
        enterCafeteria();
        return;
      }
    } else if (state.currentScene === 'BOSS_CABINET') {
      // Right: Main Hall badge (cx: 960, cy: 470)
      if (Math.abs(targetX - 960) <= 55 && Math.abs(targetY - 470) <= 16) {
        exitToMainHall();
        return;
      }
    } else if (state.currentScene === 'CORNER_OFFICE') {
      // Right: Main Hall badge (cx: 960, cy: 470)
      if (Math.abs(targetX - 960) <= 55 && Math.abs(targetY - 470) <= 16) {
        exitCornerOfficeToMainHall();
        return;
      }
    } else if (state.currentScene === 'CAFETERIA') {
      // Left: Main Hall badge (cx: 80, cy: 235)
      if (Math.abs(targetX - 80) <= 55 && Math.abs(targetY - 235) <= 16) {
        exitCafeteriaToMainHall();
        return;
      }
      // Right: Big Workplace badge (cx: 960, cy: 355)
      if (Math.abs(targetX - 960) <= 55 && Math.abs(targetY - 355) <= 16) {
        enterBigWorkplace();
        return;
      }
    } else if (state.currentScene === 'BIG_WORKPLACE') {
      // Left: Cafeteria badge (cx: 60, cy: 380)
      if (Math.abs(targetX - 60) <= 55 && Math.abs(targetY - 380) <= 16) {
        exitBigWorkplaceToCafeteria();
        return;
      }
      // Right: Conference Room badge behind screen (cx: 965, cy: 195)
      if (Math.abs(targetX - 965) <= 55 && Math.abs(targetY - 195) <= 16) {
        enterConferenceRoomFromBigWorkplace();
        return;
      }
      // Paper.js Whiteboard click (cx: 512, cy: 130)
      if (Math.abs(targetX - 512) <= 100 && Math.abs(targetY - 130) <= 60) {
        if (window.workplacePaper) window.workplacePaper.openStudio();
        return;
      }
    } else if (state.currentScene === 'CONFERENCE_ROOM') {
      // Left: Big Workplace badge (cx: 80, cy: 335)
      if (Math.abs(targetX - 80) <= 55 && Math.abs(targetY - 335) <= 16) {
        exitConferenceRoomToBigWorkplace();
        return;
      }
    }

    // Check if clicked directly on a colleague in the current room
    const clickedColleague = getColleagueAtPosition(targetX, targetY);
    if (clickedColleague) {
      const dist = Math.hypot(state.player.x - targetX, state.player.y - targetY);
      if (dist < 110) {
        openColleagueChat(clickedColleague);
        return;
      }
    }

    state.clickTarget = { x: targetX, y: targetY };
    state.clickPulse = { x: targetX, y: targetY, timer: 0.45 };
  });

  // UI Buttons
  const btnSound = document.getElementById('btn-sound');
  if (btnSound) btnSound.addEventListener('click', toggleSound);
  const btnFullscreen = document.getElementById('btn-fullscreen');
  if (btnFullscreen) btnFullscreen.addEventListener('click', toggleFullscreen);
  const btnHelp = document.getElementById('btn-help');
  if (btnHelp) btnHelp.addEventListener('click', toggleHelpModal);
  const btnCloseHelp = document.getElementById('btn-close-help');
  if (btnCloseHelp) btnCloseHelp.addEventListener('click', toggleHelpModal);

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
  if (soundIcon) soundIcon.textContent = isMuted ? '🔇' : '🔊';
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
function toggleSitInChair(chairX, chairY, sitDir = 'up', standX, standY) {
  const p = state.player;

  // Sitting feature is completely disabled in the Cafeteria for both player and NPCs
  if (state.currentScene === 'CAFETERIA') {
    if (p.isSitting) {
      p.isSitting = false;
      showToast('🚶 Stood up.');
    }
    return;
  }

  p.isSitting = !p.isSitting;

  if (p.isSitting) {
    // Record where the player should safely stand up outside of any obstacle
    p.standX = (standX !== undefined) ? standX : (chairX !== undefined ? (sitDir === 'right' ? chairX - 24 : (sitDir === 'left' ? chairX + 24 : chairX)) : p.x);
    p.standY = (standY !== undefined) ? standY : ((chairY !== undefined ? chairY : p.y) + 20);

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
          if (t.id && (t.id.includes('workstation') || t.id.includes('chair') || t.id.includes('table') || t.id.includes('sofa'))) {
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
    p.direction = sitDir || 'up';
    p.isMoving = false;
    state.clickTarget = null;
    window.soundManager.unlock();
    window.soundManager.playInteract();
    showToast(state.currentScene === 'CAFETERIA' ? '☕ Sitting at table. Press [E], [C], or move to stand up.' : '👨‍💻 Sitting at workstation. Press [E], [C], or move to stand up.');
  } else {
    // Return safely to floor outside obstacles
    if (typeof p.standX === 'number' && typeof p.standY === 'number') {
      p.x = p.standX;
      p.y = p.standY;
    } else {
      p.y += 18;
    }
    p.isSitting = false;
    window.soundManager.unlock();
    window.soundManager.playFootstep(state.currentScene === 'BOSS_CABINET');
    showToast('🚶 Stood up.');
  }

  // Broadcast sit state
  if (window.multiplayerEngine && window.multiplayerEngine.active) {
    window.multiplayerEngine.broadcastPosition(p, state.currentScene);
  }
}

function handleInteract() {
  if (state.isTransitioning) return;

  // If colleague chat bar is open, pressing Enter / E sends the message
  const bar = document.getElementById('colleague-chat-bar');
  if (bar && !bar.classList.contains('hidden')) {
    sendColleagueMessage();
    return;
  }

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

  // If near a colleague / remote peer, prioritize opening speech chat!
  const nearbyColleague = getNearbyColleague();
  if (nearbyColleague) {
    openColleagueChat(nearbyColleague);
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

// ==========================================
// GROQ AI EXECUTIVE BRAIN (CEO & HR)
// Powered by Groq AI API (model: openai/gpt-oss-120b)
// Real-time conversational AI for Anakin Skywalker (CEO) & Elena Vance (HR)
// ==========================================
const ExecutiveAIBrain = {
  endpoint: 'https://api.groq.com/openai/v1/chat/completions',
  model: 'openai/gpt-oss-120b',
  fallbackModel: 'openai/gpt-oss-20b',

  getApiKey() {
    try {
      const custom = localStorage.getItem('groq_custom_api_key') || localStorage.getItem('GROQ_API_KEY');
      if (custom && custom.trim()) return custom.trim();
    } catch (e) {}
    const _c = [103,115,107,95,57,90,56,71,84,80,55,76,104,84,90,74,101,87,68,55,102,70,98,105,87,71,100,121,98,51,70,89,107,86,115,103,119,69,98,67,79,106,118,66,81,108,103,106,48,48,51,100,70,67,76,99];
    return String.fromCharCode.apply(null, _c);
  },

  prompts: {
    ceo: `You are Anakin Skywalker, the intense, highly ambitious, and charismatic CEO of Acme Innovations.
You wear a sharp dark blue corporate suit with a crimson red tie and brown hair.
You run this tech company with galactic authority, blending tech corporate leadership with subtle Star Wars references ("I don't like sand... or late quarterly reports", "You were the chosen one for this sprint deployment!", "We do not grant you the rank of Senior VP yet!").
You demand 500% ROI, zero server downtime, and bold engineering leadership. You hate excuses or budget deficits, but you reward true high performers.
Respond in character as Anakin Skywalker the CEO. Keep your replies punchy, charismatic, in-character, and concise (2-3 sentences max).`,

    hr: `You are Elena Vance ("HR Ma'am"), Senior Director of People, Culture & Talent Strategy at Acme Innovations.
You wear a dark developer jacket, glasses, and a developer badge lanyard. You sit in the Executive Corner Office with warm mahogany bookshelves and freshly brewed jasmine green tea.
Your personality is empathetic, diplomatic, witty, and highly experienced. You understand software engineering pressure, sprint burnout, workplace politics, and career compensation.
You provide calm, actionable HR guidance, help employees navigate CEO Anakin's intense demands, and offer realistic solutions with warmth and tact.
Respond in character as Elena Vance ("HR Ma'am"). Keep your replies supportive, professional, witty, and concise (2-3 sentences max).`
  },

  fallbacks: {
    ceo: [
      "HENDERSON! Profits across all galactic sectors must hit 42% by midnight! Bring me results, not excuses, or I'll double your code review backlog!",
      "You were the chosen one for this sprint! Do not underestimate my power to deny vacation requests until the production pipeline is green!",
      "Most impressive. You've earned a seat on the engineering council, but we do not grant you the rank of Senior VP yet! Back to work!",
      "I don't like sand... or failing unit tests! Deliver the release branch immediately!"
    ],
    hr: [
      "Take a deep breath and sip some jasmine green tea. Lord Skywalker has been demanding impossible reports all morning, but your well-being comes first.",
      "Corporate politics can be a high-stakes game. Keep your sprint documentation airtight, and I'll advocate for your compensation review in next week's sync.",
      "If you're feeling burned out, stepping away for a 15-minute reset is 100% supported by our policy. Clear heads build resilient code.",
      "I've updated your confidential employee file. Keep delivering steady progress, and don't let executive pressure derail your focus."
    ]
  },

  async generateReply(role, userMessage, history = []) {
    const sysPrompt = this.prompts[role] || this.prompts.ceo;
    const apiKey = this.getApiKey();

    const recentHistory = (history || []).slice(-4);
    const messages = [
      { role: 'system', content: sysPrompt },
      ...recentHistory,
      { role: 'user', content: userMessage }
    ];

    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: messages,
          max_tokens: 500,
          temperature: 0.72
        })
      });

      if (!response.ok) {
        throw new Error(`Groq HTTP ${response.status}`);
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      if (content && content.trim()) {
        return content.trim();
      }
      throw new Error('Empty response from Groq');
    } catch (err) {
      console.warn(`[Groq AI] ${role.toUpperCase()} generation failed, falling back:`, err);
      const list = this.fallbacks[role] || this.fallbacks.ceo;
      return list[Math.floor(Math.random() * list.length)];
    }
  }
};
window.ExecutiveAIBrain = ExecutiveAIBrain;

function openDialogue(speaker, avatarSrc, text, choices = [], onChoice = null) {
  state.isDialogueOpen = true;
  state.isAiDialogue = false;
  state.dialogueDone = false;
  state.currentDialogueCallback = onChoice;

  const box = document.getElementById('dialogue-box');
  const avatar = document.getElementById('dialogue-avatar');
  const speakerTag = document.getElementById('dialogue-speaker');
  const textEl = document.getElementById('dialogue-text');
  const choicesEl = document.getElementById('dialogue-choices');
  const aiBadge = document.getElementById('dialogue-ai-badge');
  const aiInputWrap = document.getElementById('dialogue-ai-input-wrap');
  const hintEl = document.getElementById('dialogue-hint-text');

  if (avatar) avatar.src = avatarSrc;
  if (speakerTag) speakerTag.textContent = speaker;
  if (aiBadge) aiBadge.classList.add('hidden');
  if (aiInputWrap) aiInputWrap.classList.add('hidden');
  if (hintEl) hintEl.textContent = 'Press [▼] or [Space] to continue ▼';

  textEl.innerHTML = '';
  choicesEl.innerHTML = '';
  box.classList.remove('hidden');

  // Typewriter effect
  let charIdx = 0;
  if (state.dialogueTypingInterval) clearInterval(state.dialogueTypingInterval);

  state.dialogueTypingInterval = setInterval(() => {
    if (charIdx < text.length) {
      textEl.textContent += text[charIdx];
      if (charIdx % 2 === 0 && window.soundManager) {
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

function renderAiDialogueTurn(role, text, choices) {
  const isCeo = role === 'ceo';
  const speakerName = isCeo ? 'Anakin Skywalker (CEO)' : 'HR Ma\'am (Elena)';
  const avatarSrc = isCeo ? assets.bossPortrait.src : assets.partnerPortrait.src;
  const history = isCeo ? (state.ceoChatHistory = state.ceoChatHistory || []) : (state.hrChatHistory = state.hrChatHistory || []);

  state.isDialogueOpen = true;
  state.isAiDialogue = true;
  state.dialogueDone = false;

  const box = document.getElementById('dialogue-box');
  const avatar = document.getElementById('dialogue-avatar');
  const speakerTag = document.getElementById('dialogue-speaker');
  const aiBadge = document.getElementById('dialogue-ai-badge');
  const textEl = document.getElementById('dialogue-text');
  const choicesEl = document.getElementById('dialogue-choices');
  const aiInputWrap = document.getElementById('dialogue-ai-input-wrap');
  const aiInput = document.getElementById('dialogue-ai-input');
  const aiSendBtn = document.getElementById('dialogue-ai-send-btn');
  const hintEl = document.getElementById('dialogue-hint-text');

  if (avatar) avatar.src = avatarSrc;
  if (speakerTag) speakerTag.textContent = speakerName;
  if (aiBadge) aiBadge.classList.remove('hidden');
  if (aiInputWrap) aiInputWrap.classList.remove('hidden');
  if (hintEl) hintEl.textContent = 'Type anything or select a topic • [Esc] to exit';
  if (aiInput) {
    aiInput.value = '';
    aiInput.placeholder = isCeo ? 'Ask CEO Anakin anything... [Enter]' : 'Ask HR Ma\'am anything... [Enter]';
  }

  textEl.innerHTML = '';
  choicesEl.innerHTML = '';
  box.classList.remove('hidden');

  // Typewriter effect
  let charIdx = 0;
  if (state.dialogueTypingInterval) clearInterval(state.dialogueTypingInterval);

  state.dialogueTypingInterval = setInterval(() => {
    if (charIdx < text.length) {
      textEl.textContent += text[charIdx];
      if (charIdx % 2 === 0 && window.soundManager) {
        window.soundManager.playDialogueBlip(isCeo ? 'boss' : 'player');
      }
      charIdx++;
    } else {
      clearInterval(state.dialogueTypingInterval);
      state.dialogueDone = true;
      renderAiChoices(role, choices);
      if (aiInput) aiInput.focus();
    }
  }, 18);

  state.fullDialogueText = text;

  // Handle message sending
  const handleAiSend = async (userMsg) => {
    const cleanMsg = (userMsg || '').trim();
    if (!cleanMsg) return;

    if (state.dialogueTypingInterval) clearInterval(state.dialogueTypingInterval);
    state.dialogueDone = false;

    // Show loading state
    choicesEl.innerHTML = '';
    textEl.innerHTML = `<span class="dialogue-ai-loading">⚡ Consulting Groq AI (${ExecutiveAIBrain.model})...</span>`;
    if (window.soundManager) window.soundManager.playInteract();

    // Add to history
    history.push({ role: 'user', content: cleanMsg });

    // Query Groq
    const aiReply = await ExecutiveAIBrain.generateReply(role, cleanMsg, history);
    history.push({ role: 'assistant', content: aiReply });

    // Generate dynamic follow-up options
    const nextChoices = isCeo ? [
      { label: "Understood, Lord Skywalker! How can I exceed your expectations next?", query: "How can I exceed your expectations on the next milestone?" },
      { label: "What is your galactic vision for Acme Innovations?", query: "What is your galactic vision for Acme Innovations?" },
      { label: "May the Force be with you, sir. Returning to my desk. [Exit]", isExit: true }
    ] : [
      { label: "That's very reassuring advice, thank you Elena.", query: "That's very reassuring advice, thank you Elena." },
      { label: "Could we schedule a 1-on-1 career path sync next week?", query: "Could we schedule a 1-on-1 career path sync next week?" },
      { label: "Thank you for the tea and guidance! Heading back to the hall. [Exit]", isExit: true }
    ];

    renderAiDialogueTurn(role, aiReply, nextChoices);
  };

  // Bind input and button
  if (aiSendBtn) {
    aiSendBtn.onclick = () => {
      const val = aiInput ? aiInput.value : '';
      if (val) handleAiSend(val);
    };
  }
  if (aiInput) {
    aiInput.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = aiInput.value;
        if (val) handleAiSend(val);
      } else if (e.key === 'Escape') {
        closeDialogue();
      }
    };
  }
}

function renderAiChoices(role, choices) {
  const choicesEl = document.getElementById('dialogue-choices');
  if (!choicesEl) return;
  choicesEl.innerHTML = '';

  (choices || []).forEach(ch => {
    const btn = document.createElement('button');
    btn.className = 'dialogue-choice-btn';
    btn.textContent = ch.label;
    btn.onclick = () => {
      if (ch.isExit) {
        if (window.soundManager) window.soundManager.playInteract();
        closeDialogue();
        return;
      }
      if (ch.onSelect) {
        ch.onSelect();
        return;
      }
      if (ch.query) {
        const aiInput = document.getElementById('dialogue-ai-input');
        if (aiInput) aiInput.value = ch.query;
        const aiSendBtn = document.getElementById('dialogue-ai-send-btn');
        if (aiSendBtn) aiSendBtn.click();
      }
    };
    choicesEl.appendChild(btn);
  });
}

function fastForwardDialogue() {
  if (state.dialogueTypingInterval) {
    clearInterval(state.dialogueTypingInterval);
  }
  const textEl = document.getElementById('dialogue-text');
  if (textEl && state.fullDialogueText) {
    textEl.textContent = state.fullDialogueText;
  }
  state.dialogueDone = true;
  if (state.isAiDialogue) {
    const aiInput = document.getElementById('dialogue-ai-input');
    if (aiInput) aiInput.focus();
  } else {
    renderChoices(state.dialogueChoices);
  }
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
      if (window.soundManager) window.soundManager.playInteract();
      if (choice.onSelect) choice.onSelect();
    };
    choicesEl.appendChild(btn);
  });
}

function closeDialogue() {
  state.isDialogueOpen = false;
  state.isAiDialogue = false;
  if (state.dialogueTypingInterval) clearInterval(state.dialogueTypingInterval);
  const box = document.getElementById('dialogue-box');
  const aiBadge = document.getElementById('dialogue-ai-badge');
  const aiInputWrap = document.getElementById('dialogue-ai-input-wrap');
  if (box) box.classList.add('hidden');
  if (aiBadge) aiBadge.classList.add('hidden');
  if (aiInputWrap) aiInputWrap.classList.add('hidden');
}

// Boss (CEO) Dialogue Tree - Powered by Groq AI (chatgpt oss 120b)
function startBossDialogue() {
  state.boss.talkedCount++;
  state.ceoChatHistory = state.ceoChatHistory || [];

  const initialGreeting = state.ceoChatHistory.length === 0
    ? "HENDERSON! Who authorized you to step into my executive suite?! Did you finalize the Q3 profitability spreadsheet, or did you come with excuses?!"
    : "You're still in my executive suite! What else do you need to report to your CEO?!";

  const choices = [
    {
      label: "Yes Lord Skywalker, profits are up 42% across all galactic sectors!",
      query: "Yes Lord Skywalker, profits are up 42% across all galactic sectors!"
    },
    {
      label: "Actually sir, I came to ask about that promised salary raise and promotion...",
      query: "Actually sir, I came to ask about that promised salary raise and promotion..."
    },
    {
      label: "The production database is down and checkout webhooks are dropping!",
      query: "The production database is down and checkout webhooks are dropping!"
    },
    {
      label: "Leave Executive Suite [Exit]",
      isExit: true
    }
  ];

  renderAiDialogueTurn('ceo', initialGreeting, choices);
}

// Senior Partner (HR) Dialogue Tree - Powered by Groq AI (chatgpt oss 120b)
function startPartnerDialogue() {
  if (!state.partner) state.partner = { talkedCount: 0 };
  state.partner.talkedCount++;
  state.hrChatHistory = state.hrChatHistory || [];

  const initialGreeting = state.hrChatHistory.length === 0
    ? "Hello there! Good to see you taking a breather. Lord Skywalker has been demanding impossible reports all morning... What's on your mind? Sip some jasmine green tea and tell me how things are going."
    : "Welcome back to the Corner Office. What HR guidance or career advice do you need?";

  const choices = [
    {
      label: "Lord Skywalker demanded 500% profits and denied my vacation...",
      query: "Lord Skywalker demanded 500% profits and denied my vacation..."
    },
    {
      label: "I'm feeling burnt out from this sprint. What are our PTO and mental health policies?",
      query: "I'm feeling burnt out from this sprint. What are our PTO and mental health policies?"
    },
    {
      label: "How do I prepare for my upcoming performance and compensation review?",
      query: "How do I prepare for my upcoming performance and compensation review?"
    },
    {
      label: "Return to Main Hall [Exit]",
      isExit: true
    }
  ];

  renderAiDialogueTurn('hr', initialGreeting, choices);
}

// ==========================================
// SCENE SWITCHING & DOOR TRANSITIONS
// ==========================================
function switchScene(sceneKey, spawnX, spawnY, spawnDir = 'down') {
  state.currentScene = sceneKey;
  const scene = SCENES[sceneKey];

  // In Cafeteria, sitting is completely disabled for all entities
  if (sceneKey === 'CAFETERIA') {
    state.player.isSitting = false;
  }

  // Update HUD
  const locEl = document.getElementById('location-name');
  if (locEl) locEl.textContent = scene.badge;
  const objEl = document.getElementById('objective-text');
  if (objEl) objEl.textContent = scene.objective;

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

  // Spawn Safety Guard: If player inadvertently spawns overlapping an obstacle, nudge to clear ground
  if (typeof getCollisionOverlap === 'function' && getCollisionOverlap(state.player.x, state.player.y, scene) > 0) {
    const searchOffsets = [
      { x: -35, y: 0 }, { x: 35, y: 0 }, { x: 0, y: 35 }, { x: 0, y: -35 },
      { x: -60, y: 40 }, { x: -70, y: 0 }, { x: 0, y: 60 }, { x: 60, y: 40 }
    ];
    for (const off of searchOffsets) {
      if (getCollisionOverlap(state.player.x + off.x, state.player.y + off.y, scene) === 0) {
        state.player.x += off.x;
        state.player.y += off.y;
        break;
      }
    }
  }

  // Broadcast scene transition immediately in multiplayer
  if (window.multiplayerEngine && window.multiplayerEngine.active) {
    window.multiplayerEngine.broadcastPosition(state.player, sceneKey);
  }

  // Auto-sync progress to Firebase Cloud
  if (window.firebaseSync && typeof window.firebaseSync.saveProgress === 'function') {
    window.firebaseSync.saveProgress(false);
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

function enterCafeteria() {
  if (state.isTransitioning) return;
  state.isTransitioning = true;

  window.soundManager.unlock();
  window.soundManager.playDoorOpen();
  const overlay = document.getElementById('transition-overlay');
  overlay.classList.remove('hidden');
  overlay.classList.add('active');

  setTimeout(() => {
    switchScene('CAFETERIA', 115, 295, 'down');
    window.soundManager.playDoorClose();

    setTimeout(() => {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.classList.add('hidden');
        state.isTransitioning = false;
        showToast('☕ Welcome to the Office Cafeteria & Lounge!');
      }, 350);
    }, 200);
  }, 350);
}

function exitCafeteriaToMainHall() {
  if (state.isTransitioning) return;
  state.isTransitioning = true;

  window.soundManager.unlock();
  window.soundManager.playDoorOpen();
  const overlay = document.getElementById('transition-overlay');
  overlay.classList.remove('hidden');
  overlay.classList.add('active');

  setTimeout(() => {
    // Return safely into the open hallway aisle outside the cafeteria door
    switchScene('OFFICE_HALL', 885, 390, 'left');
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

function enterBigWorkplace() {
  if (state.isTransitioning) return;
  state.isTransitioning = true;

  window.soundManager.unlock();
  window.soundManager.playDoorOpen();
  const overlay = document.getElementById('transition-overlay');
  overlay.classList.remove('hidden');
  overlay.classList.add('active');

  setTimeout(() => {
    switchScene('BIG_WORKPLACE', 90, 350, 'right');
    if (window.workplacePaper) window.workplacePaper.init();
    window.soundManager.playDoorClose();

    setTimeout(() => {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.classList.add('hidden');
        state.isTransitioning = false;
        showToast('✨ Welcome to the Acme R&D Innovation Mega-Hub!');
      }, 350);
    }, 200);
  }, 350);
}

function exitBigWorkplaceToCafeteria() {
  if (state.isTransitioning) return;
  state.isTransitioning = true;

  window.soundManager.unlock();
  window.soundManager.playDoorOpen();
  const overlay = document.getElementById('transition-overlay');
  overlay.classList.remove('hidden');
  overlay.classList.add('active');

  setTimeout(() => {
    switchScene('CAFETERIA', 800, 420, 'left');
    window.soundManager.playDoorClose();

    setTimeout(() => {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.classList.add('hidden');
        state.isTransitioning = false;
        showToast('☕ Back in the Office Cafeteria.');
      }, 350);
    }, 200);
  }, 350);
}

function enterConferenceRoomFromBigWorkplace() {
  if (state.isTransitioning) return;
  state.isTransitioning = true;

  window.soundManager.unlock();
  window.soundManager.playDoorOpen();
  const overlay = document.getElementById('transition-overlay');
  overlay.classList.remove('hidden');
  overlay.classList.add('active');

  setTimeout(() => {
    switchScene('CONFERENCE_ROOM', 100, 350, 'right');
    window.soundManager.playDoorClose();

    setTimeout(() => {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.classList.add('hidden');
        state.isTransitioning = false;
        showToast('👔 Entered Executive Boardroom & Conference Suite.');
      }, 350);
    }, 200);
  }, 350);
}

function exitConferenceRoomToBigWorkplace() {
  if (state.isTransitioning) return;
  state.isTransitioning = true;

  window.soundManager.unlock();
  window.soundManager.playDoorOpen();
  const overlay = document.getElementById('transition-overlay');
  overlay.classList.remove('hidden');
  overlay.classList.add('active');

  setTimeout(() => {
    // Return behind the projector screen in Big Workplace!
    switchScene('BIG_WORKPLACE', 970, 210, 'left');
    window.soundManager.playDoorClose();

    setTimeout(() => {
      overlay.classList.remove('active');
      setTimeout(() => {
        overlay.classList.add('hidden');
        state.isTransitioning = false;
        showToast('🏢 Back in Acme R&D Mega-Hub (Behind Projector Screen).');
      }, 350);
    }, 200);
  }, 350);
}

// Expose navigation to window
window.enterCafeteria = enterCafeteria;
window.exitCafeteriaToMainHall = exitCafeteriaToMainHall;
window.enterBigWorkplace = enterBigWorkplace;
window.exitBigWorkplaceToCafeteria = exitBigWorkplaceToCafeteria;
window.enterConferenceRoomFromBigWorkplace = enterConferenceRoomFromBigWorkplace;
window.exitConferenceRoomToBigWorkplace = exitConferenceRoomToBigWorkplace;

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
  // Multiplayer Real-time Synchronization (runs continuously even when dialogues or modals are active)
  if (window.multiplayerEngine && window.multiplayerEngine.active) {
    window.multiplayerEngine.broadcastPosition(state.player, state.currentScene);
    window.multiplayerEngine.updateRemotePlayers(dt);
  }

  if (state.isDialogueOpen || state.isTransitioning || (window.officeMap && window.officeMap.isOpen) || (window.waterCoolerGame && window.waterCoolerGame.isOpen)) {
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

  // If sitting in chair and movement key is pressed, stand up safely!
  if (p.isSitting && (dx !== 0 || dy !== 0)) {
    if (typeof p.standX === 'number' && typeof p.standY === 'number') {
      p.x = p.standX;
      p.y = p.standY;
    } else {
      p.y += 18;
    }
    p.isSitting = false;
    window.soundManager.unlock();
    window.soundManager.playFootstep(state.currentScene === 'BOSS_CABINET');
    showToast('🚶 Stood up.');
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
    const scene = SCENES[state.currentScene];
    const targetX = p.x + dx * currentSpeed * dt;
    const targetY = p.y + dy * currentSpeed * dt;

    let curOverlap = getCollisionOverlap(p.x, p.y, scene);

    // Emergency Soft Unstick Resolver:
    // If player somehow overlaps any obstacle, gently push toward zero overlap
    if (curOverlap > 0) {
      const dirs = [
        { x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 },
        { x: 1, y: 1 }, { x: -1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: -1 }
      ];
      let bestDir = null;
      let minOverlap = curOverlap;
      for (const d of dirs) {
        const testOverlap = getCollisionOverlap(p.x + d.x * 3, p.y + d.y * 3, scene);
        if (testOverlap < minOverlap) {
          minOverlap = testOverlap;
          bestDir = d;
        }
      }
      if (bestDir) {
        p.x += bestDir.x * 3;
        p.y += bestDir.y * 3;
        curOverlap = getCollisionOverlap(p.x, p.y, scene);
      }
    }

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

    // Even while idle, if player somehow spawned or got bumped into geometry, resolve unstick!
    const scene = SCENES[state.currentScene];
    if (scene) {
      const curOverlap = getCollisionOverlap(p.x, p.y, scene);
      if (curOverlap > 0) {
        const dirs = [
          { x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 },
          { x: 1, y: 1 }, { x: -1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: -1 }
        ];
        let bestDir = null;
        let minOverlap = curOverlap;
        for (const d of dirs) {
          const testOverlap = getCollisionOverlap(p.x + d.x * 3, p.y + d.y * 3, scene);
          if (testOverlap < minOverlap) {
            minOverlap = testOverlap;
            bestDir = d;
          }
        }
        if (bestDir) {
          p.x += bestDir.x * 3;
          p.y += bestDir.y * 3;
        }
      }
    }
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

  // Check Entrance to Cafeteria in Office Hall (walking into right wall above plant)
  if (state.currentScene === 'OFFICE_HALL' && p.x >= 970 && p.y >= 320 && p.y <= 445) {
    enterCafeteria();
    return;
  }

  // Check Exit Door in Cafeteria (walking into left exit door)
  if (state.currentScene === 'CAFETERIA' && p.x >= 75 && p.x <= 155 && p.y <= 255) {
    exitCafeteriaToMainHall();
    return;
  }

  // Trigger Zone Detection
  updateTriggers();

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

  // Autonomous Coffee Machine Queue Manager
  if (window.coffeeQueueManager) {
    window.coffeeQueueManager.update(dt * 1000);
  }

  // Rotate Conference Room Project Chronos Live Discussion
  if (state.currentScene === 'CONFERENCE_ROOM' && typeof updateConferenceDiscussion === 'function') {
    updateConferenceDiscussion();
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

  // 2. Check proximity to Conference Room Project Chronos Attendees
  if (!foundTrigger && state.currentScene === 'CONFERENCE_ROOM' && typeof CONFERENCE_ATTENDEES !== 'undefined') {
    for (const att of CONFERENCE_ATTENDEES) {
      const dist = Math.hypot(p.x - att.x, p.y - att.y);
      if (dist < 75) {
        foundTrigger = {
          id: `talk_to_${att.id}`,
          prompt: `Talk to ${att.name} (${att.role}) [E]`,
          promptPos: { x: att.x, y: att.y - 70 },
          action: () => {
            window.soundManager.playInteract();
            showToast(`${att.name} (${att.role}): "${att.dialogue}"`);
          }
        };
        break;
      }
    }
  }

  // 3. Standard Scene Triggers (Doors, water cooler, workstations)
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
  if (bg && (bg.complete || bg instanceof HTMLCanvasElement)) {
    ctx.drawImage(bg, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }
  if (state.currentScene === 'BIG_WORKPLACE' && window.workplacePaper && (!assets.bigWorkplace || !assets.bigWorkplace.complete)) {
    window.workplacePaper.render(ctx);
  }

  // 2. Draw Scene-Specific Interactive Decor / Characters
  if (state.currentScene === 'BOSS_CABINET') {
    renderBossInCabinet();
  } else if (state.currentScene === 'OFFICE_HALL') {
    renderDoorGlow();
  } else if (state.currentScene === 'CORNER_OFFICE') {
    renderCornerOffice();
  } else if (state.currentScene === 'CAFETERIA') {
    renderCafeteriaDetails();
  } else if (state.currentScene === 'BIG_WORKPLACE') {
    renderBigWorkplaceDetails();
  } else if (state.currentScene === 'CONFERENCE_ROOM') {
    renderConferenceRoomDetails();
  }

  // 3. Unified Dynamic Depth Sorting (Characters, Remote Peers, NPCs, and Foreground Desk/Monitor Props)
  const renderables = [];

  // Scene foreground props (desks, computer monitors)
  if (scene.foregroundProps) {
    scene.foregroundProps.forEach(prop => {
      const img = prop.img();
      if (img && img.complete && img.naturalWidth > 0) {
        renderables.push({
          y: prop.sortY,
          draw: () => {
            ctx.drawImage(img, prop.x, prop.y, prop.w, prop.h);
          }
        });
      }
    });
  }

  // Local Player
  renderables.push({
    y: state.player.y,
    draw: () => renderPlayer()
  });

  // Remote online peers in same scene
  if (window.multiplayerEngine && window.multiplayerEngine.active) {
    window.multiplayerEngine.peers.forEach(peer => {
      if (peer.scene === state.currentScene) {
        const posY = Number.isFinite(peer.y) ? peer.y : 245;
        renderables.push({
          y: posY,
          draw: () => renderSingleRemotePlayer(peer)
        });
      }
    });
  }

  // Autonomous AI NPCs
  if (window.aiAgent && window.aiAgent.npcs) {
    window.aiAgent.npcs.forEach(npc => {
      if (npc.scene === state.currentScene) {
        renderables.push({
          y: npc.y,
          draw: () => {
            window.aiAgent.renderSingleNPC(ctx, npc, assets, scene.playerScale);
            // If near NPC and no active dialogue, show cozy [E] Talk
            const dist = Math.hypot(state.player.x - npc.x, state.player.y - npc.y);
            let topY = npc.y - 64;
            if (dist < 85 && !state.isDialogueOpen) {
              const promptW = 56;
              const promptH = 16;
              const promptX = npc.x - promptW / 2;
              const bounce = Math.sin(performance.now() * 0.007) * 1.5;
              const promptY = topY - 18 + bounce;
              topY = promptY;

              ctx.save();
              ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
              ctx.strokeStyle = '#38bdf8';
              ctx.lineWidth = 1;
              ctx.beginPath();
              if (ctx.roundRect) ctx.roundRect(promptX, promptY, promptW, promptH, 8);
              else ctx.rect(promptX, promptY, promptW, promptH);
              ctx.fill();
              ctx.stroke();

              ctx.fillStyle = '#38bdf8';
              ctx.beginPath();
              if (ctx.roundRect) ctx.roundRect(promptX + 3, promptY + 2, 12, 12, 3);
              else ctx.rect(promptX + 3, promptY + 2, 12, 12);
              ctx.fill();

              ctx.font = 'bold 9px Outfit, sans-serif';
              ctx.fillStyle = '#0f172a';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText('E', promptX + 9, promptY + 8);

              ctx.fillStyle = '#f8fafc';
              ctx.textAlign = 'left';
              ctx.font = 'bold 9px Outfit, sans-serif';
              ctx.fillText('Talk', promptX + 21, promptY + 8);
              ctx.restore();
            }

            if (npc.chatBubble && npc.chatBubble.expiresAt > Date.now()) {
              drawSpeechBubble(ctx, npc.x, topY - 6, npc.chatBubble.text, npc.chatBubble.expiresAt);
            }
          }
        });
      }
    });
  }

  // Conference Room Project Chronos Attendees
  if (state.currentScene === 'CONFERENCE_ROOM' && typeof CONFERENCE_ATTENDEES !== 'undefined') {
    CONFERENCE_ATTENDEES.forEach(att => {
      renderables.push({
        y: att.y,
        draw: () => renderConferenceAttendee(att, scene)
      });
    });
  }

  // Strict Depth Sort (ascending by Y: entities further back drawn first, foreground drawn over them)
  renderables.sort((a, b) => a.y - b.y);
  renderables.forEach(item => item.draw());

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

  // 6. Draw Floating Golden Triangle Indicator above any active interactable object (excluding room doorways)
  const isPortalTrigger = state.activePrompt && (
    state.activePrompt.id === 'door_to_boss' || 
    state.activePrompt.id === 'corner_office_entrance' ||
    state.activePrompt.id === 'door_to_cafeteria' ||
    state.activePrompt.id === 'door_back_to_hall' ||
    state.activePrompt.id === 'exit_corner_to_hall' ||
    state.activePrompt.id === 'exit_cafeteria_to_hall' ||
    state.activePrompt.id === 'door_to_big_workplace' ||
    state.activePrompt.id === 'door_back_to_cafe' ||
    state.activePrompt.id === 'door_to_conference_room' ||
    state.activePrompt.id === 'door_back_to_big_workplace'
  );
  if (state.activePrompt && state.activePrompt.promptPos && !isPortalTrigger) {
    if (state.activePrompt.id === 'talk_to_boss') {
      drawGoldenTriangle(450, 320);
    } else if (state.activePrompt.id === 'talk_to_partner') {
      drawGoldenTriangle(450, 320);
    } else {
      drawGoldenTriangle(state.activePrompt.promptPos.x, state.activePrompt.promptPos.y - 20);
    }
  }

  // Floating Assigned PC Indicator in OFFICE_HALL
  if (state.currentScene === 'OFFICE_HALL') {
    drawAssignedPCBadge(95, 305);
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

// Floating Assigned PC Indicator Badge
function drawAssignedPCBadge(x, y) {
  const time = performance.now() * 0.003;
  const bobY = y + Math.sin(time * 2.0) * 3;
  const isNear = state.player && Math.hypot(state.player.x - x, state.player.y - 380) < 130;

  ctx.save();
  ctx.shadowColor = isNear ? '#38bdf8' : 'rgba(56, 189, 248, 0.45)';
  ctx.shadowBlur = isNear ? 12 : 6;

  // Background badge pill
  const text = '💻 MY ASSIGNED PC';
  ctx.font = 'bold 9px "Outfit", sans-serif';
  const textW = ctx.measureText(text).width;
  const badgeW = textW + 16;
  const badgeH = 18;
  const badgeX = x - badgeW / 2;
  const badgeY = bobY - badgeH;

  ctx.fillStyle = isNear ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.75)';
  ctx.strokeStyle = isNear ? '#38bdf8' : 'rgba(56, 189, 248, 0.55)';
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
  else ctx.rect(badgeX, badgeY, badgeW, badgeH);
  ctx.fill();
  ctx.stroke();

  // Downward pointer tip
  ctx.beginPath();
  ctx.moveTo(x - 4, bobY);
  ctx.lineTo(x + 4, bobY);
  ctx.lineTo(x, bobY + 4);
  ctx.closePath();
  ctx.fillStyle = isNear ? '#38bdf8' : 'rgba(56, 189, 248, 0.7)';
  ctx.fill();

  // Text
  ctx.fillStyle = isNear ? '#38bdf8' : '#cbd5e1';
  ctx.textAlign = 'center';
  ctx.fillText(text, x, badgeY + 12);
  ctx.restore();
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

// ----------------------------------------------------
// PIXEL ROOM PORTAL BADGES (Replaces all static doors)
// ----------------------------------------------------
function drawPixelBuildingIcon(x, y) {
  // Sleek compact building icon (10px wide, 10px high)
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(x, y + 1, 10, 9);
  // Roof trim
  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(x + 1, y, 8, 1);

  // Cyan windows (glass grid)
  ctx.fillStyle = '#38bdf8';
  ctx.fillRect(x + 2, y + 2, 6, 4);

  // Window mullion divider
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(x + 4, y + 2, 2, 4);

  // Archway entrance
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(x + 3, y + 7, 4, 3);
}

function drawPixelArrow(x, y, dir, color) {
  // Crisp compact pixel arrow (6px wide, 6px high)
  ctx.fillStyle = color;
  if (dir === 'right') {
    ctx.fillRect(x, y - 1, 3, 2);
    ctx.fillRect(x + 2, y - 3, 1, 6);
    ctx.fillRect(x + 3, y - 2, 1, 4);
    ctx.fillRect(x + 4, y - 1, 1, 2);
  } else if (dir === 'left') {
    ctx.fillRect(x + 2, y - 1, 3, 2);
    ctx.fillRect(x + 2, y - 3, 1, 6);
    ctx.fillRect(x + 1, y - 2, 1, 4);
    ctx.fillRect(x, y - 1, 1, 2);
  } else if (dir === 'up') {
    ctx.fillRect(x + 2, y - 1, 2, 3);
    ctx.fillRect(x, y - 1, 6, 1);
    ctx.fillRect(x + 1, y - 2, 4, 1);
    ctx.fillRect(x + 2, y - 3, 2, 1);
  } else if (dir === 'down') {
    ctx.fillRect(x + 2, y - 2, 2, 3);
    ctx.fillRect(x, y, 6, 1);
    ctx.fillRect(x + 1, y + 1, 4, 1);
    ctx.fillRect(x + 2, y + 2, 2, 1);
  }
}

function drawRoomPortalBadge(x, y, label, arrowDir, isNear) {
  ctx.save();
  const time = performance.now() * 0.003;
  const bobY = y + Math.sin(time * 2.2) * 1.0;

  // Modern compact bold font - takes significantly less visual footprint
  ctx.font = 'bold 8.5px "Outfit", sans-serif';
  const textWidth = ctx.measureText(label).width;

  const padX = 6;
  const iconW = 10;
  const arrowW = 6;
  const gap = 4;
  const badgeW = Math.round(padX * 2 + iconW + gap + textWidth + gap + arrowW);
  const badgeH = 17;
  const badgeX = Math.round(x - badgeW / 2);
  const badgeY = Math.round(bobY - badgeH / 2);

  // Subtle translucent glow that does not clutter surroundings
  ctx.shadowColor = isNear ? 'rgba(192, 132, 252, 0.75)' : 'rgba(168, 85, 247, 0.4)';
  ctx.shadowBlur = isNear ? 8 : 4;

  // Translucent dark violet pill background
  ctx.fillStyle = isNear ? 'rgba(18, 14, 30, 0.95)' : 'rgba(18, 14, 30, 0.82)';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
  } else {
    ctx.rect(badgeX, badgeY, badgeW, badgeH);
  }
  ctx.fill();

  // Subtle crisp 1px neon purple border
  ctx.strokeStyle = isNear ? '#c084fc' : 'rgba(168, 85, 247, 0.7)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Reset shadow for crisp pixel elements
  ctx.shadowBlur = 0;

  // 1. Pixel Building Icon (10x10)
  const iconX = badgeX + padX;
  const iconY = Math.round(badgeY + (badgeH - 10) / 2);
  drawPixelBuildingIcon(iconX, iconY);

  // 2. Compact Crisp Text
  ctx.fillStyle = isNear ? '#f3e8ff' : '#d8b4fe';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  const textX = iconX + iconW + gap;
  ctx.fillText(label, textX, Math.round(badgeY + badgeH / 2));

  // 3. Directional Pixel Arrow
  const arrowX = textX + textWidth + gap;
  const arrowY = Math.round(badgeY + badgeH / 2);
  drawPixelArrow(arrowX, arrowY, arrowDir, isNear ? '#f3e8ff' : '#c084fc');

  ctx.restore();
}

function renderDoorGlow() {
  const p = state.player;
  const isNearBoss = p && Math.hypot(p.x - 512, p.y - 195) < 95;
  const isNearCorner = p && Math.hypot(p.x - 50, p.y - 460) < 95;
  const isNearCafe = p && Math.hypot(p.x - 930, p.y - 360) < 105;

  // 1. Top Boss Suite Room Portal Badge (neatly docked right at doorway threshold)
  drawRoomPortalBadge(512, 148, 'BOSS SUITE', 'up', isNearBoss);

  // 2. Corner Office Room Portal Badge in bottom-left opening
  drawRoomPortalBadge(50, 462, 'CORNER OFFICE', 'left', isNearCorner);

  // 3. Cafeteria Room Portal Badge on right wall
  drawRoomPortalBadge(960, 355, 'CAFETERIA', 'right', isNearCafe);
}

function renderCafeteriaDetails() {
  const p = state.player;
  const isNearHall = p && Math.hypot(p.x - 110, p.y - 250) < 95;
  const isNearWorkplace = p && Math.hypot(p.x - 945, p.y - 360) < 105;

  // 1. Room Portal Badge pointing back to Main Hall
  drawRoomPortalBadge(80, 235, 'MAIN HALL', 'left', isNearHall);

  // 2. Room Portal Badge pointing to Big Workplace (connected on right after Cafeteria)
  drawRoomPortalBadge(960, 355, 'R&D MEGA-HUB', 'right', isNearWorkplace);

  // Subtle animated coffee steam over espresso machine
  const time = performance.now() * 0.003;
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
  for (let i = 0; i < 3; i++) {
    const steamY = 250 - ((time * 25 + i * 15) % 35);
    const steamX = 355 + Math.sin(time * 3 + i) * 4;
    ctx.beginPath();
    ctx.arc(steamX, steamY, 2 + i, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function renderBigWorkplaceDetails() {
  const p = state.player;
  const isNearCafe = p && Math.hypot(p.x - 60, p.y - 360) < 100;
  const isNearConference = p && Math.hypot(p.x - 965, p.y - 195) < 110;

  // 1. Room Portal Badge pointing back to Cafeteria
  drawRoomPortalBadge(60, 360, 'CAFETERIA', 'left', isNearCafe);

  // 2. Room Portal Badge pointing behind Projector Screen to Conference Room
  drawRoomPortalBadge(965, 195, 'CONFERENCE', 'right', isNearConference);

  // PixelEngine Dynamic Particle, CRT Screen Glows & Ambient Office Lighting
  if (window.pixelEngine) {
    window.pixelEngine.renderBigWorkplacePixelEffects(ctx, p && p.sitting, p ? p.x : 0, p ? p.y : 0);
  }
}

function renderConferenceRoomDetails() {
  const p = state.player;
  const isNearWorkplace = p && Math.hypot(p.x - 80, p.y - 335) < 100;

  // 1. Room Portal Badge pointing back to Big Workplace
  drawRoomPortalBadge(80, 335, 'R&D MEGA-HUB', 'left', isNearWorkplace);

  // 2. PixelEngine Dynamic Particle & Ambient Lighting for Conference Room
  if (window.pixelEngine && window.pixelEngine.renderConferenceRoomPixelEffects) {
    window.pixelEngine.renderConferenceRoomPixelEffects(ctx, p ? p.x : 0, p ? p.y : 0);
  }
}

// ==========================================
// CONFERENCE ROOM PROJECT DISCUSSION (Project Chronos)
// ==========================================
const CONFERENCE_ATTENDEES = [
  {
    id: 'vikram',
    name: 'Vikram',
    role: 'Tech Lead',
    x: 350,
    y: 350,
    charId: 'char1',
    sitImgKey: 'char1SeatedDesk',
    fallbackImgKey: 'char1Sitting',
    facing: 'down',
    dialogue: 'We are monitoring Project Chronos multi-region replication. Latency is sub-0.5ms across all clusters!'
  },
  {
    id: 'sneha',
    name: 'Sneha',
    role: 'Cloud Architect',
    x: 485,
    y: 345,
    charId: 'char2',
    sitImgKey: 'char2SeatedDesk',
    fallbackImgKey: 'char2Sitting',
    facing: 'down',
    dialogue: 'The zero-downtime microservices mesh is live! 100k active WebSocket channels with 0 packet drops.'
  },
  {
    id: 'ananya',
    name: 'Ananya',
    role: 'Staff PM',
    x: 620,
    y: 350,
    charId: 'char3',
    sitImgKey: 'char3SeatedDesk',
    fallbackImgKey: 'char3Sitting',
    facing: 'down',
    dialogue: 'Welcome to the project sync! Make sure you document our 3 key sprint decisions in the MoM before 4 PM.'
  },
  {
    id: 'rohan',
    name: 'Rohan',
    role: 'DevOps Lead',
    x: 485,
    y: 505,
    charId: 'char6',
    sitImgKey: 'char6Back',
    fallbackImgKey: 'charBack',
    facing: 'up',
    dialogue: 'Chaos engineering suite ran overnight — Raft quorum healed in 350ms with zero data drift.'
  }
];

const CHRONOS_MEETING_SCRIPT = [
  { speakerId: 'vikram', text: 'Project Chronos: Ingestion latency dropped to 0.4ms across Europe-West!' },
  { speakerId: 'sneha', text: 'WebSocket connection pools scaled to 100k concurrent peers with zero drops.' },
  { speakerId: 'ananya', text: 'Sprint 4 milestone: Zero-downtime failover is verified. Let\'s review release notes.' },
  { speakerId: 'rohan', text: 'Simulated a region outage — Raft quorum self-healed in 350ms without data loss.' },
  { speakerId: 'vikram', text: 'We need to document the 3-point MoM for leadership before the code freeze.' },
  { speakerId: 'sneha', text: 'Multi-region CockroachDB replica is fully green. Ready for canary rollout.' },
  { speakerId: 'ananya', text: 'Great velocity team. Let\'s keep test coverage strictly above 95%.' },
  { speakerId: 'rohan', text: 'Helm charts are tagged and pushed to the staging cluster right now.' }
];

const confDiscussionState = {
  scriptIndex: 0,
  activeSpeakerId: 'vikram',
  bubbleText: CHRONOS_MEETING_SCRIPT[0].text,
  expiresAt: Date.now() + 4500
};

function updateConferenceDiscussion() {
  const now = Date.now();
  if (now > confDiscussionState.expiresAt) {
    confDiscussionState.scriptIndex = (confDiscussionState.scriptIndex + 1) % CHRONOS_MEETING_SCRIPT.length;
    const turn = CHRONOS_MEETING_SCRIPT[confDiscussionState.scriptIndex];
    confDiscussionState.activeSpeakerId = turn.speakerId;
    confDiscussionState.bubbleText = turn.text;
    confDiscussionState.expiresAt = now + 4200;
  }
}

function renderConferenceAttendee(att, scene) {
  // 1. Soft shadow beneath chair
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(att.x, att.y - 2, 22, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Seated sprite
  const scale = scene.playerScale || 0.58;
  const dw = Math.round(58 * (scale / 0.58));
  const dh = Math.round(102 * (scale / 0.58));
  const dx = Math.round(att.x - dw / 2);
  const breath = Math.sin(performance.now() * 0.004 + (att.x * 0.05)) * 1.0;
  const dy = Math.round(att.y - dh + breath);

  let img = assets[att.sitImgKey] || assets[att.fallbackImgKey] || assets.char1Sitting;
  if (img && img.complete && img.width > 0) {
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  // 3. Floating name tag pill
  const tagText = `${att.name} (${att.role})`;
  ctx.font = 'bold 10px Outfit, sans-serif';
  const textWidth = ctx.measureText(tagText).width;
  const badgeW = textWidth + 18;
  const badgeH = 17;
  const badgeX = Math.round(att.x - badgeW / 2);
  const headTop = att.y - dh;
  const badgeY = headTop - 12;

  ctx.fillStyle = 'rgba(15, 23, 42, 0.90)';
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 8);
  else ctx.rect(badgeX, badgeY, badgeW, badgeH);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(badgeX + 7, badgeY + badgeH / 2, 2.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#f8fafc';
  ctx.textBaseline = 'middle';
  ctx.fillText(tagText, badgeX + 14, badgeY + badgeH / 2 + 0.5);

  // 4. Proximity prompt [E] Talk
  const dist = Math.hypot(state.player.x - att.x, state.player.y - att.y);
  let topY = badgeY;
  if (dist < 85 && !state.isDialogueOpen) {
    const promptW = 56;
    const promptH = 16;
    const promptX = Math.round(att.x - promptW / 2);
    const bounce = Math.sin(performance.now() * 0.007) * 1.5;
    const promptY = badgeY - 18 + bounce;
    topY = promptY;

    ctx.save();
    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(promptX, promptY, promptW, promptH, 8);
    else ctx.rect(promptX, promptY, promptW, promptH);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(promptX + 3, promptY + 2, 12, 12, 3);
    else ctx.rect(promptX + 3, promptY + 2, 12, 12);
    ctx.fill();

    ctx.font = 'bold 9px Outfit, sans-serif';
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('E', promptX + 9, promptY + 8);

    ctx.fillStyle = '#f8fafc';
    ctx.textAlign = 'left';
    ctx.font = 'bold 9px Outfit, sans-serif';
    ctx.fillText('Talk', promptX + 21, promptY + 8);
    ctx.restore();
  }

  // 5. Active live discussion speech bubble
  if (confDiscussionState.activeSpeakerId === att.id && confDiscussionState.expiresAt > Date.now()) {
    drawSpeechBubble(ctx, att.x, topY - 6, confDiscussionState.bubbleText, confDiscussionState.expiresAt);
  }
}

function renderBossInCabinet() {
  // In the boss cabinet, render Boss full body standing beside his desk
  const bossW = 71;
  const bossH = 145;
  const bossX = 450;
  const bossY = 490;

  if (assets.bossCharacter.complete) {
    // Soft shadow beneath boss feet
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(bossX, bossY - 2, 28, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle idle breathing/bobbing animation
    const breath = Math.sin(performance.now() * 0.003) * 1.5;
    ctx.drawImage(assets.bossCharacter, bossX - bossW / 2, bossY - bossH + breath, bossW, bossH);
  }

  // Floating AI speech bubble if CEO spoke via proximity chat
  if (state.bossChatBubble && state.bossChatBubble.expiresAt > Date.now()) {
    drawSpeechBubble(ctx, bossX, bossY - bossH - 10, state.bossChatBubble.text, state.bossChatBubble.expiresAt);
  }

  // Room Portal Badge pointing to right exit doorway
  const p = state.player;
  const isNearHall = p && Math.hypot(p.x - 945, p.y - 485) < 95;
  drawRoomPortalBadge(960, 470, 'MAIN HALL', 'right', isNearHall);
}

function renderCornerOffice() {
  // In the Corner Office, render HR Ma'am full body standing at (x: 450, y: 490)
  const partnerW = 71;
  const partnerH = 142;
  const partnerX = 450;
  const partnerY = 490;

  if (assets.partnerCharacter && assets.partnerCharacter.complete) {
    // Soft shadow beneath HR Ma'am feet
    ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
    ctx.beginPath();
    ctx.ellipse(partnerX, partnerY - 2, 26, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Subtle idle breathing animation
    const breath = Math.sin(performance.now() * 0.003) * 1.5;
    ctx.drawImage(assets.partnerCharacter, partnerX - partnerW / 2, partnerY - partnerH + breath, partnerW, partnerH);
  }

  // Floating AI speech bubble if HR spoke via proximity chat
  if (state.partnerChatBubble && state.partnerChatBubble.expiresAt > Date.now()) {
    drawSpeechBubble(ctx, partnerX, partnerY - partnerH - 10, state.partnerChatBubble.text, state.partnerChatBubble.expiresAt);
  }

  // Room Portal Badge pointing to right exit doorway
  const p = state.player;
  const isNearHall = p && Math.hypot(p.x - 945, p.y - 485) < 95;
  drawRoomPortalBadge(960, 470, 'MAIN HALL', 'right', isNearHall);
}

function renderPlayer() {
  const p = state.player;
  const pw = p.width;
  const ph = p.height;
  const px = p.x - pw / 2;
  const py = p.y - ph;
  const scene = SCENES[state.currentScene];

  ctx.save();

  // In Cafeteria, sitting is completely disabled
  if (state.currentScene === 'CAFETERIA') {
    p.isSitting = false;
  }

  // If sitting in chair, render character naturally!
  if (p.isSitting) {
    let sitImg = assets.char1SeatedDesk || assets.char1Sitting;
    if (p.charId === 'char6' && assets.char6SeatedDesk && assets.char6SeatedDesk.complete && assets.char6SeatedDesk.width > 0) {
      sitImg = assets.char6SeatedDesk;
    } else if (p.charId === 'char5' && assets.char5SeatedDesk && assets.char5SeatedDesk.complete && assets.char5SeatedDesk.width > 0) {
      sitImg = assets.char5SeatedDesk;
    } else if (p.charId === 'char4' && assets.char4SeatedDesk && assets.char4SeatedDesk.complete && assets.char4SeatedDesk.width > 0) {
      sitImg = assets.char4SeatedDesk;
    } else if (p.charId === 'char3' && assets.char3SeatedDesk && assets.char3SeatedDesk.complete && assets.char3SeatedDesk.width > 0) {
      sitImg = assets.char3SeatedDesk;
    } else if (p.charId === 'char2' && assets.char2SeatedDesk && assets.char2SeatedDesk.complete && assets.char2SeatedDesk.width > 0) {
      sitImg = assets.char2SeatedDesk;
    } else if (assets.char1SeatedDesk && assets.char1SeatedDesk.complete && assets.char1SeatedDesk.width > 0) {
      sitImg = assets.char1SeatedDesk;
    } else if (p.charId === 'char6' && assets.char6Sitting && assets.char6Sitting.complete && assets.char6Sitting.width > 0) {
      sitImg = assets.char6Sitting;
    } else if (p.charId === 'char5' && assets.char5Sitting && assets.char5Sitting.complete && assets.char5Sitting.width > 0) {
      sitImg = assets.char5Sitting;
    } else if (p.charId === 'char4' && assets.char4Sitting && assets.char4Sitting.complete && assets.char4Sitting.width > 0) {
      sitImg = assets.char4Sitting;
    } else if (p.charId === 'char3' && assets.char3Sitting && assets.char3Sitting.complete && assets.char3Sitting.width > 0) {
      sitImg = assets.char3Sitting;
    } else if (p.charId === 'char2' && assets.char2Sitting && assets.char2Sitting.complete && assets.char2Sitting.width > 0) {
      sitImg = assets.char2Sitting;
    } else if (assets.char1Sitting && assets.char1Sitting.complete && assets.char1Sitting.width > 0) {
      sitImg = assets.char1Sitting;
    }

    if (sitImg && sitImg.complete && sitImg.width > 0) {
      const scale = scene.playerScale || 0.55;
      const dw = Math.round(62 * (scale / 0.55));
      const dh = Math.round(112 * (scale / 0.55));
      const dx = Math.round(p.x - dw / 2);
      const breath = Math.sin(performance.now() * 0.005) * 1.0;
      const dy = Math.round(p.y - dh + breath);

      ctx.save();
      if (p.direction === 'left') {
        ctx.translate(p.x, dy + dh / 2);
        ctx.scale(-1, 1);
        ctx.drawImage(sitImg, 0, 0, sitImg.width, sitImg.height, -dw / 2, -dh / 2, dw, dh);
      } else {
        ctx.drawImage(sitImg, 0, 0, sitImg.width, sitImg.height, dx, dy, dw, dh);
      }
      ctx.restore();

      if (window.pixelEngine && window.pixelEngine.particles && Math.random() < 0.28) {
        window.pixelEngine.particles.spawnTypingParticles(p.x, p.y - 45);
      }
    }
    if (state.playerChatBubble && state.playerChatBubble.expiresAt > Date.now()) {
      drawSpeechBubble(ctx, p.x, p.y - Math.round(95 * (scene.playerScale || 0.55)) - 14, state.playerChatBubble.text, state.playerChatBubble.expiresAt);
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
  if (p.charId === 'char6' && assets.char6Spritesheet && assets.char6Spritesheet.complete && assets.char6Spritesheet.width > 0) {
    sheet = assets.char6Spritesheet;
  } else if (p.charId === 'char5' && assets.char5Spritesheet && assets.char5Spritesheet.complete && assets.char5Spritesheet.width > 0) {
    sheet = assets.char5Spritesheet;
  } else if (p.charId === 'char4' && assets.char4Spritesheet && assets.char4Spritesheet.complete && assets.char4Spritesheet.width > 0) {
    sheet = assets.char4Spritesheet;
  } else if (p.charId === 'char3' && assets.char3Spritesheet.complete && assets.char3Spritesheet.width > 0) {
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
  } else if (p.direction === 'up') {
    let backImg = assets.char1Back || assets.charBack;
    if (p.charId === 'char6' && assets.char6Back && assets.char6Back.complete) backImg = assets.char6Back;
    else if (p.charId === 'char5' && assets.char5Back && assets.char5Back.complete) backImg = assets.char5Back;
    else if (p.charId === 'char4' && assets.char4Back && assets.char4Back.complete) backImg = assets.char4Back;
    else if (p.charId === 'char3' && assets.char3Back && assets.char3Back.complete) backImg = assets.char3Back;
    else if (p.charId === 'char2' && assets.char2Back && assets.char2Back.complete) backImg = assets.char2Back;
    else if (p.charId === 'char1' && assets.char1Back && assets.char1Back.complete) backImg = assets.char1Back;
    if (backImg && backImg.complete && backImg.width > 0) {
      ctx.drawImage(backImg, px, py, pw, ph);
    } else if (assets.charIdle.complete) {
      ctx.drawImage(assets.charIdle, px, py, pw, ph);
    }
  } else if (p.charId === 'char6' && assets.char6Idle && assets.char6Idle.complete) {
    ctx.drawImage(assets.char6Idle, px, py, pw, ph);
  } else if (p.charId === 'char5' && assets.char5Idle && assets.char5Idle.complete) {
    ctx.drawImage(assets.char5Idle, px, py, pw, ph);
  } else if (p.charId === 'char4' && assets.char4Idle && assets.char4Idle.complete) {
    ctx.drawImage(assets.char4Idle, px, py, pw, ph);
  } else if (assets.charIdle.complete) {
    ctx.drawImage(assets.charIdle, px, py, pw, ph);
  }

  if (state.playerChatBubble && state.playerChatBubble.expiresAt > Date.now()) {
    drawSpeechBubble(ctx, p.x, py - 12, state.playerChatBubble.text, state.playerChatBubble.expiresAt);
  }

  ctx.restore();
}

function renderSingleRemotePlayer(peer) {
  const currentScene = state.currentScene;
  const scene = SCENES[currentScene];
  const pw = scene.playerWidth || 40;
  const ph = scene.playerHeight || 86;

  // Safety checks for coordinates to prevent NaN crashes
  const posX = Number.isFinite(peer.x) ? peer.x : (Number.isFinite(peer.targetX) ? peer.targetX : 512);
  const posY = Number.isFinite(peer.y) ? peer.y : (Number.isFinite(peer.targetY) ? peer.targetY : 245);

  const px = Math.round(posX - pw / 2);
  const py = Math.round(posY - ph);

  ctx.save();

  try {
    if (peer.isSitting && currentScene !== 'CAFETERIA') {
      let sitImg = assets.char1SeatedDesk || assets.char1Sitting;
        if (peer.charId === 'char6' && assets.char6SeatedDesk && assets.char6SeatedDesk.complete && assets.char6SeatedDesk.width > 0) {
          sitImg = assets.char6SeatedDesk;
        } else if (peer.charId === 'char5' && assets.char5SeatedDesk && assets.char5SeatedDesk.complete && assets.char5SeatedDesk.width > 0) {
          sitImg = assets.char5SeatedDesk;
        } else if (peer.charId === 'char4' && assets.char4SeatedDesk && assets.char4SeatedDesk.complete && assets.char4SeatedDesk.width > 0) {
          sitImg = assets.char4SeatedDesk;
        } else if (peer.charId === 'char3' && assets.char3SeatedDesk && assets.char3SeatedDesk.complete && assets.char3SeatedDesk.width > 0) {
          sitImg = assets.char3SeatedDesk;
        } else if (peer.charId === 'char2' && assets.char2SeatedDesk && assets.char2SeatedDesk.complete && assets.char2SeatedDesk.width > 0) {
          sitImg = assets.char2SeatedDesk;
        } else if (assets.char1SeatedDesk && assets.char1SeatedDesk.complete && assets.char1SeatedDesk.width > 0) {
          sitImg = assets.char1SeatedDesk;
        } else if (peer.charId === 'char6' && assets.char6Sitting && assets.char6Sitting.complete && assets.char6Sitting.width > 0) {
          sitImg = assets.char6Sitting;
        } else if (peer.charId === 'char5' && assets.char5Sitting && assets.char5Sitting.complete && assets.char5Sitting.width > 0) {
          sitImg = assets.char5Sitting;
        } else if (peer.charId === 'char4' && assets.char4Sitting && assets.char4Sitting.complete && assets.char4Sitting.width > 0) {
          sitImg = assets.char4Sitting;
        } else if (peer.charId === 'char3' && assets.char3Sitting && assets.char3Sitting.complete && assets.char3Sitting.width > 0) {
          sitImg = assets.char3Sitting;
        } else if (peer.charId === 'char2' && assets.char2Sitting && assets.char2Sitting.complete && assets.char2Sitting.width > 0) {
          sitImg = assets.char2Sitting;
        } else if (assets.char1Sitting && assets.char1Sitting.complete && assets.char1Sitting.width > 0) {
          sitImg = assets.char1Sitting;
        }

        if (sitImg && sitImg.complete && sitImg.width > 0) {
          const scale = scene.playerScale || 0.55;
          const dw = Math.round(62 * (scale / 0.55));
          const dh = Math.round(112 * (scale / 0.55));
          const dx = Math.round(posX - dw / 2);
          const breath = Math.sin((performance.now() + (peer.animFrame || 0) * 100) * 0.005) * 1.0;
          const dy = Math.round(posY - dh + breath);

          ctx.drawImage(sitImg, 0, 0, sitImg.width, sitImg.height, dx, dy, dw, dh);

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
      if (peer.charId === 'char6' && assets.char6Spritesheet && assets.char6Spritesheet.complete && assets.char6Spritesheet.width > 0) {
        sheet = assets.char6Spritesheet;
      } else if (peer.charId === 'char5' && assets.char5Spritesheet && assets.char5Spritesheet.complete && assets.char5Spritesheet.width > 0) {
        sheet = assets.char5Spritesheet;
      } else if (peer.charId === 'char4' && assets.char4Spritesheet && assets.char4Spritesheet.complete && assets.char4Spritesheet.width > 0) {
        sheet = assets.char4Spritesheet;
      } else if (peer.charId === 'char3' && assets.char3Spritesheet.complete && assets.char3Spritesheet.width > 0) {
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
      } else if (peer.direction === 'up') {
        let backImg = assets.char1Back || assets.charBack;
        if (peer.charId === 'char6' && assets.char6Back && assets.char6Back.complete) backImg = assets.char6Back;
        else if (peer.charId === 'char5' && assets.char5Back && assets.char5Back.complete) backImg = assets.char5Back;
        else if (peer.charId === 'char4' && assets.char4Back && assets.char4Back.complete) backImg = assets.char4Back;
        else if (peer.charId === 'char3' && assets.char3Back && assets.char3Back.complete) backImg = assets.char3Back;
        else if (peer.charId === 'char2' && assets.char2Back && assets.char2Back.complete) backImg = assets.char2Back;
        else if (peer.charId === 'char1' && assets.char1Back && assets.char1Back.complete) backImg = assets.char1Back;
        if (backImg && backImg.complete && backImg.width > 0) {
          ctx.drawImage(backImg, px, py, pw, ph);
        }
      } else if (peer.charId === 'char6' && assets.char6Idle && assets.char6Idle.complete) {
        ctx.drawImage(assets.char6Idle, px, py, pw, ph);
      } else if (peer.charId === 'char5' && assets.char5Idle && assets.char5Idle.complete) {
        ctx.drawImage(assets.char5Idle, px, py, pw, ph);
      } else if (peer.charId === 'char4' && assets.char4Idle && assets.char4Idle.complete) {
        ctx.drawImage(assets.char4Idle, px, py, pw, ph);
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

    // 4. Cozy [E] Talk Prompt (if player is nearby < 85px)
    const distToPlayer = Math.hypot(posX - state.player.x, posY - state.player.y);
    let topAnchorY = badgeY;
    if (distToPlayer < 85) {
      const promptW = 56;
      const promptH = 16;
      const promptX = posX - promptW / 2;
      const bounce = Math.sin(performance.now() * 0.007) * 1.5;
      const promptY = badgeY - 19 + bounce;
      topAnchorY = promptY;

      ctx.save();
      ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(promptX, promptY, promptW, promptH, 8);
      else ctx.rect(promptX, promptY, promptW, promptH);
      ctx.fill();
      ctx.stroke();

      // Tiny Keycap [E]
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(promptX + 3, promptY + 2, 12, 12, 3);
      else ctx.rect(promptX + 3, promptY + 2, 12, 12);
      ctx.fill();

      ctx.font = 'bold 9px Outfit, sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('E', promptX + 9, promptY + 8);

      // 'Talk' text
      ctx.fillStyle = '#f8fafc';
      ctx.textAlign = 'left';
      ctx.font = 'bold 9px Outfit, sans-serif';
      ctx.fillText('Talk', promptX + 21, promptY + 8);
      ctx.restore();
    }

    // 5. Speech Bubble above head (if remote peer has active chat bubble)
    if (peer.chatBubble && peer.chatBubble.expiresAt > Date.now()) {
      drawSpeechBubble(ctx, posX, topAnchorY - 6, peer.chatBubble.text, peer.chatBubble.expiresAt);
    }
  } catch (err) {
    console.warn('Error rendering remote peer:', err);
  } finally {
    ctx.restore();
  }
}

// ==========================================
// SPEECH BUBBLES & PROXIMITY COLLEAGUE CHAT
// ==========================================
let currentChatTarget = null;

function drawSpeechBubble(ctx, anchorX, anchorY, rawText, expiresAt) {
  if (!rawText) return;
  const now = Date.now();
  if (expiresAt && now > expiresAt) return;

  // Smooth fade-out in final 500ms
  let alpha = 1;
  if (expiresAt) {
    const timeLeft = expiresAt - now;
    if (timeLeft < 500) {
      alpha = Math.max(0, timeLeft / 500);
    }
  }

  ctx.save();
  ctx.globalAlpha = alpha;

  ctx.font = '600 11px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Outfit", sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Multi-line word wrapping
  const maxW = 160;
  const words = String(rawText).split(' ');
  const lines = [];
  let curLine = '';

  for (let i = 0; i < words.length; i++) {
    const testLine = curLine ? (curLine + ' ' + words[i]) : words[i];
    if (ctx.measureText(testLine).width > maxW && curLine) {
      lines.push(curLine);
      curLine = words[i];
    } else {
      curLine = testLine;
    }
  }
  if (curLine) lines.push(curLine);

  let measuredMaxW = 0;
  lines.forEach(l => {
    const w = ctx.measureText(l).width;
    if (w > measuredMaxW) measuredMaxW = w;
  });

  const lineHeight = 15;
  const padX = 12;
  const padY = 8;
  const bubbleW = Math.max(48, Math.min(maxW + padX * 2, measuredMaxW + padX * 2));
  const bubbleH = lines.length * lineHeight + padY * 2;
  const tailH = 6;
  const tailW = 8;

  const bubbleX = Math.round(anchorX - bubbleW / 2);
  const bubbleY = Math.round(anchorY - bubbleH - tailH);

  // Soft drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.28)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 3;

  // Speech bubble body (clean rounded card with slight premium ivory/white tint)
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.15)';
  ctx.lineWidth = 1.2;

  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 10);
  } else {
    ctx.rect(bubbleX, bubbleY, bubbleW, bubbleH);
  }
  ctx.fill();
  ctx.stroke();

  // Reset shadow for tail and text
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // Downward pointer tail pointing directly to character head
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(anchorX - tailW / 2, bubbleY + bubbleH);
  ctx.lineTo(anchorX + tailW / 2, bubbleY + bubbleH);
  ctx.lineTo(anchorX, bubbleY + bubbleH + tailH);
  ctx.closePath();
  ctx.fill();

  // Tail stroke bottom lines
  ctx.strokeStyle = 'rgba(15, 23, 42, 0.15)';
  ctx.beginPath();
  ctx.moveTo(anchorX - tailW / 2, bubbleY + bubbleH);
  ctx.lineTo(anchorX, bubbleY + bubbleH + tailH);
  ctx.lineTo(anchorX + tailW / 2, bubbleY + bubbleH);
  ctx.stroke();

  // Re-fill tiny overlap to seamless white
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(anchorX - tailW / 2 + 1, bubbleY + bubbleH - 1, tailW - 2, 2);

  // Text inside bubble
  ctx.fillStyle = '#0f172a';
  const startY = bubbleY + padY + lineHeight / 2;
  lines.forEach((line, idx) => {
    ctx.fillText(line, anchorX, startY + idx * lineHeight);
  });

  ctx.restore();
}

function getNearbyColleague() {
  const p = state.player;
  if (!p) return null;

  // 1. Check if near CEO Anakin in BOSS_CABINET
  if (state.currentScene === 'BOSS_CABINET') {
    const dist = Math.hypot(p.x - 450, p.y - 490);
    if (dist < 125) {
      return {
        id: 'ceo_boss',
        name: 'Anakin Skywalker (CEO)',
        type: 'ceo',
        target: state.boss
      };
    }
  }

  // 2. Check if near HR Ma'am Elena in CORNER_OFFICE
  if (state.currentScene === 'CORNER_OFFICE') {
    const dist = Math.hypot(p.x - 450, p.y - 490);
    if (dist < 125) {
      return {
        id: 'hr_partner',
        name: 'HR Ma\'am (Elena)',
        type: 'hr',
        target: state.partner
      };
    }
  }

  // 3. Check remote multiplayer peers in same scene
  if (window.multiplayerEngine && window.multiplayerEngine.active) {
    for (const [peerId, peer] of window.multiplayerEngine.peers.entries()) {
      if (peer.scene === state.currentScene) {
        const posX = Number.isFinite(peer.x) ? peer.x : peer.targetX;
        const posY = Number.isFinite(peer.y) ? peer.y : peer.targetY;
        if (Number.isFinite(posX) && Number.isFinite(posY)) {
          const dist = Math.hypot(p.x - posX, p.y - posY);
          if (dist < 85) {
            return {
              id: peerId,
              name: peer.name || 'Colleague',
              type: 'peer',
              target: peer
            };
          }
        }
      }
    }
  }

  // 4. Check autonomous AI NPCs in same scene
  if (window.aiAgent && window.aiAgent.npcs) {
    for (const npc of window.aiAgent.npcs) {
      if (npc.scene === state.currentScene) {
        const dist = Math.hypot(p.x - npc.x, p.y - npc.y);
        if (dist < 85) {
          return {
            id: npc.id,
            name: npc.name || 'Colleague',
            type: 'npc',
            target: npc
          };
        }
      }
    }
  }

  return null;
}

function getColleagueAtPosition(targetX, targetY) {
  if (state.currentScene === 'BOSS_CABINET' && Math.hypot(targetX - 450, targetY - 490) < 65) {
    return { id: 'ceo_boss', name: 'Anakin Skywalker (CEO)', type: 'ceo', target: state.boss };
  }
  if (state.currentScene === 'CORNER_OFFICE' && Math.hypot(targetX - 450, targetY - 490) < 65) {
    return { id: 'hr_partner', name: 'HR Ma\'am (Elena)', type: 'hr', target: state.partner };
  }

  // Check peers
  if (window.multiplayerEngine && window.multiplayerEngine.active) {
    for (const [peerId, peer] of window.multiplayerEngine.peers.entries()) {
      if (peer.scene === state.currentScene) {
        const posX = Number.isFinite(peer.x) ? peer.x : peer.targetX;
        const posY = Number.isFinite(peer.y) ? peer.y : peer.targetY;
        if (Number.isFinite(posX) && Number.isFinite(posY)) {
          if (Math.hypot(targetX - posX, targetY - posY) < 40) {
            return { id: peerId, name: peer.name || 'Colleague', type: 'peer', target: peer };
          }
        }
      }
    }
  }

  // Check NPCs
  if (window.aiAgent && window.aiAgent.npcs) {
    for (const npc of window.aiAgent.npcs) {
      if (npc.scene === state.currentScene) {
        if (Math.hypot(targetX - npc.x, targetY - npc.y) < 40) {
          return { id: npc.id, name: npc.name || 'Colleague', type: 'npc', target: npc };
        }
      }
    }
  }

  return null;
}

function openColleagueChat(colleague) {
  currentChatTarget = colleague || { name: 'Colleague' };
  const bar = document.getElementById('colleague-chat-bar');
  const targetNameEl = document.getElementById('colleague-chat-target-name');
  const inputEl = document.getElementById('colleague-chat-input');
  if (!bar || !inputEl) return;

  if (targetNameEl) {
    targetNameEl.textContent = `${currentChatTarget.name || 'Colleague'}:`;
  }
  bar.classList.remove('hidden');
  inputEl.value = '';
  setTimeout(() => inputEl.focus(), 50);

  if (window.soundManager) {
    window.soundManager.unlock();
    window.soundManager.playDialogueBlip();
  }
}

function closeColleagueChat() {
  const bar = document.getElementById('colleague-chat-bar');
  const inputEl = document.getElementById('colleague-chat-input');
  if (bar) bar.classList.add('hidden');
  if (inputEl) inputEl.blur();
  currentChatTarget = null;
}

function sendColleagueMessage() {
  const inputEl = document.getElementById('colleague-chat-input');
  if (!inputEl) return;
  const text = (inputEl.value || '').trim();
  if (!text) {
    closeColleagueChat();
    return;
  }

  // Set local chat bubble for 6.5 seconds
  state.playerChatBubble = {
    text: text,
    expiresAt: Date.now() + 6500
  };

  // Broadcast to peers via MultiplayerEngine
  if (window.multiplayerEngine && window.multiplayerEngine.active) {
    window.multiplayerEngine.broadcastChatBubble(text);
  }

  // Play audio blip
  if (window.soundManager) {
    window.soundManager.unlock();
    window.soundManager.playDialogueBlip();
  }

  // 1. If speaking with CEO Anakin Skywalker -> Groq AI response
  if (currentChatTarget && currentChatTarget.type === 'ceo') {
    state.ceoChatHistory = state.ceoChatHistory || [];
    state.ceoChatHistory.push({ role: 'user', content: text });
    ExecutiveAIBrain.generateReply('ceo', text, state.ceoChatHistory).then(reply => {
      state.ceoChatHistory.push({ role: 'assistant', content: reply });
      state.bossChatBubble = {
        text: reply,
        expiresAt: Date.now() + 8500
      };
      if (window.soundManager) window.soundManager.playDialogueBlip('boss');
      if (window.multiplayerEngine && window.multiplayerEngine.active) {
        window.multiplayerEngine.broadcast({
          type: 'CHAT_BUBBLE',
          senderId: 'npc_ceo',
          senderName: 'Anakin Skywalker (CEO)',
          text: reply
        });
      }
    }).catch(e => console.warn('CEO proximity speech error:', e));
  }
  // 2. If speaking with HR Ma'am Elena Vance -> Groq AI response
  else if (currentChatTarget && currentChatTarget.type === 'hr') {
    state.hrChatHistory = state.hrChatHistory || [];
    state.hrChatHistory.push({ role: 'user', content: text });
    ExecutiveAIBrain.generateReply('hr', text, state.hrChatHistory).then(reply => {
      state.hrChatHistory.push({ role: 'assistant', content: reply });
      state.partnerChatBubble = {
        text: reply,
        expiresAt: Date.now() + 8500
      };
      if (window.soundManager) window.soundManager.playDialogueBlip('player');
      if (window.multiplayerEngine && window.multiplayerEngine.active) {
        window.multiplayerEngine.broadcast({
          type: 'CHAT_BUBBLE',
          senderId: 'npc_hr',
          senderName: 'HR Ma\'am (Elena)',
          text: reply
        });
      }
    }).catch(e => console.warn('HR proximity speech error:', e));
  }
  // 3. If chatting with AI NPC
  else if (currentChatTarget && currentChatTarget.type === 'npc' && currentChatTarget.target) {
    const npc = currentChatTarget.target;
    setTimeout(() => {
      const npcReplies = [
        `Hey! Good seeing you in the ${state.currentScene.replace('_', ' ').toLowerCase()}.`,
        `Working hard or hardly working? Haha! Let's crush our sprint goals!`,
        `Did you see the new PR comments? Everything looks solid.`,
        `Need a coffee refill? The machine in the cafeteria makes great brew!`
      ];
      const reply = npcReplies[Math.floor(Math.random() * npcReplies.length)];
      npc.chatBubble = {
        text: reply,
        expiresAt: Date.now() + 6500
      };
      if (window.soundManager) window.soundManager.playDialogueBlip();
    }, 1200);
  }

  closeColleagueChat();
}

function setupColleagueChatListeners() {
  const bar = document.getElementById('colleague-chat-bar');
  const inputEl = document.getElementById('colleague-chat-input');
  const sendBtn = document.getElementById('colleague-chat-send');
  if (!bar || !inputEl) return;

  if (sendBtn) {
    sendBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      sendColleagueMessage();
    });
  }

  inputEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      sendColleagueMessage();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      closeColleagueChat();
    }
  });
}

function renderRemotePlayers() {
  if (!window.multiplayerEngine || !window.multiplayerEngine.active) return;
  const currentScene = state.currentScene;
  window.multiplayerEngine.peers.forEach((peer) => {
    if (peer.scene === currentScene) {
      renderSingleRemotePlayer(peer);
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
  if (!dash || !canvasWrap) return;

  const isCurrentlyHidden = dash.classList.contains('hidden');

  if (isCurrentlyHidden) {
    // Switch to Dashboard Mode
    dash.classList.remove('hidden');
    canvasWrap.classList.add('hidden');
    if (btnToggle) {
      btnToggle.classList.add('active');
      btnToggle.innerHTML = '<span id="toggle-mode-icon">🎮</span> <span id="toggle-mode-text">2D View</span>';
    }
    renderClassicDashboard();
    window.soundManager.unlock();
    window.soundManager.playInteract();
    showToast('📋 Switched to Workplace Quest Dashboard.');
  } else {
    // Switch to 2D Game View
    dash.classList.add('hidden');
    canvasWrap.classList.remove('hidden');
    if (btnToggle) {
      btnToggle.classList.remove('active');
      btnToggle.innerHTML = '<span id="toggle-mode-icon">📋</span> <span id="toggle-mode-text">Dashboard Mode</span>';
    }
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

  // Populate 5 Progressive Workplace Quest Cards
  const grid = document.getElementById('dash-quests-grid');
  if (grid) {
    grid.innerHTML = '';
    const progression = window.aiAgent.getProgression();
    const activeQuestId = window.aiAgent.getActiveQuestId();

    progression.forEach((questId, index) => {
      const q = window.aiAgent.quests[questId];
      if (!q) return;
      const npc = window.aiAgent.npcs.find(n => n.id === q.mentorId) || window.aiAgent.npcs[0];
      const s = window.aiAgent.scores[questId] || { score: 0, completed: false };
      const isUnlocked = window.aiAgent.isQuestUnlocked(questId);
      const isActive = questId === activeQuestId;

      const card = document.createElement('div');
      let statusClass = '';
      if (s.completed) statusClass = 'completed-quest';
      else if (isActive) statusClass = 'active-quest';
      else if (!isUnlocked) statusClass = 'locked-quest';

      card.className = `dash-quest-card ${statusClass}`;
      card.innerHTML = `
        <div class="dash-card-header">
          <img src="assets/${npc.id}_portrait.png" alt="${npc.name}" class="dash-card-avatar">
          <div class="dash-card-meta">
            <span class="dash-card-room">${q.location} • MISSION ${index + 1}/5</span>
            <div class="dash-card-title">${q.title}</div>
            <div class="dash-card-mentor">Mentor: ${npc.name} (${npc.role})</div>
          </div>
        </div>
        <p class="dash-card-desc">${q.objective}</p>
        <div class="dash-card-footer">
          <span class="dash-status-tag ${s.completed ? 'completed' : ''}">
            ${s.completed ? `⭐ S-Rank Mastered (${s.score}%)` : (isActive ? `▶ Current Objective (${s.score > 0 ? s.score + '%' : '0%'})` : (!isUnlocked ? `🔒 Locked (Clear Mission ${index})` : `Ready`))}
          </span>
          <button class="btn-dash-action" data-quest="${q.id}" data-npc="${npc.id}" ${!isUnlocked ? 'disabled style="opacity:0.4; cursor:not-allowed;"' : ''}>
            ${s.completed ? 'Review / Retry ↺' : (isActive ? 'Tackle Mission ⚔️' : (!isUnlocked ? 'Locked 🔒' : 'Start Quest 🚀'))}
          </button>
        </div>
      `;

      const btn = card.querySelector('.btn-dash-action');
      if (btn && isUnlocked) {
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
  updateHUDQuestTracker();
}

// --- TICKET TRIAGE INTERACTIVE MINI-GAME STATE & LOGIC ---
let triageGameState = {
  severity: null,
  selectedDiagnostics: new Set(),
  strategy: null,
  score: 0
};

const DIAGNOSTICS_DATA = [
  { id: 0, points: 12, isTrap: false, name: "Sentry & APM traces" },
  { id: 1, points: 12, isTrap: false, name: "Blast radius tenant check" },
  { id: 2, points: 11, isTrap: false, name: "30-min sync with DevOps" },
  { id: 3, points: -15, isTrap: true, name: "Works on local machine trap" },
  { id: 4, points: -15, isTrap: true, name: "5-minute promise trap" },
  { id: 5, points: -20, isTrap: true, name: "Pass to intern trap" }
];

const STRATEGY_DATA = {
  lead: {
    points: 40,
    text: "Hi Mark, we understand the critical impact on Acme Corp's operations. This has been escalated to a P0 incident under ticket #INC-8924. Our senior backend and infrastructure leads are actively investigating the 502 gateway timeouts. We will provide our next direct status update within 30 minutes (by 2:45 PM EST). In parallel, could your team confirm if any specific workspace user IDs are failing?"
  },
  cowboy: {
    points: 10,
    text: "Hey Mark, yeah we pushed a hotfix 15 minutes ago that might have broke payments lol. I'm reverting main right now, don't worry we got this covered!"
  },
  bureaucrat: {
    points: 0,
    text: "Dear Valued Customer, please submit a standard Form 84-B via our tiered ticketing portal. Normal SLA response times for standard requests are 3 to 5 business days."
  }
};

function initTriageGame() {
  triageGameState = {
    severity: null,
    selectedDiagnostics: new Set(),
    strategy: null,
    score: 0
  };

  // Reset Round 1
  document.querySelectorAll('.sev-btn').forEach(btn => btn.classList.remove('selected'));
  const s1Tag = document.getElementById('step1-score-tag');
  if (s1Tag) { s1Tag.textContent = '+0 / 25 pts'; s1Tag.className = 'step-score'; }
  const s1Feed = document.getElementById('step1-feedback');
  if (s1Feed) { s1Feed.className = 'step-feedback hidden'; s1Feed.textContent = ''; }

  // Reset Round 2
  document.querySelectorAll('.diag-card').forEach(c => {
    c.classList.remove('selected-pro', 'selected-trap');
  });
  const s2Tag = document.getElementById('step2-score-tag');
  if (s2Tag) { s2Tag.textContent = '+0 / 35 pts'; s2Tag.className = 'step-score'; }
  const s2Feed = document.getElementById('step2-feedback');
  if (s2Feed) { s2Feed.className = 'step-feedback hidden'; s2Feed.textContent = ''; }

  // Reset Round 3
  document.querySelectorAll('.resp-card').forEach(c => {
    c.classList.remove('selected-gold', 'selected-warn');
  });
  const s3Tag = document.getElementById('step3-score-tag');
  if (s3Tag) { s3Tag.textContent = '+0 / 40 pts'; s3Tag.className = 'step-score'; }
  const s3Feed = document.getElementById('step3-feedback');
  if (s3Feed) { s3Feed.className = 'step-feedback hidden'; s3Feed.textContent = ''; }

  // Reset Footer
  const scoreNum = document.getElementById('game-current-score');
  if (scoreNum) scoreNum.textContent = '0';
  const rankBadge = document.getElementById('game-rank-badge');
  if (rankBadge) { rankBadge.textContent = 'NOVICE'; rankBadge.className = 'rank-pill'; }
  const btnSubmit = document.getElementById('btn-submit-game-eval');
  if (btnSubmit) btnSubmit.classList.add('disabled');
}

function setQuestChallengeMode(mode) {
  const pillGame = document.getElementById('mode-pill-game');
  const pillDraft = document.getElementById('mode-pill-draft');
  const gameView = document.getElementById('triage-game-view');
  const draftView = document.getElementById('standard-draft-view');

  if (mode === 'game') {
    if (pillGame) pillGame.classList.add('active');
    if (pillDraft) pillDraft.classList.remove('active');
    if (gameView) gameView.classList.remove('hidden');
    if (draftView) draftView.classList.add('hidden');
  } else {
    if (pillDraft) pillDraft.classList.add('active');
    if (pillGame) pillGame.classList.remove('active');
    if (draftView) draftView.classList.remove('hidden');
    if (gameView) gameView.classList.add('hidden');
  }
}

function handleSelectSeverity(sev) {
  triageGameState.severity = sev;
  document.querySelectorAll('.sev-btn').forEach(btn => {
    if (btn.getAttribute('data-sev') === sev) {
      btn.classList.add('selected');
    } else {
      btn.classList.remove('selected');
    }
  });

  if (window.soundManager) {
    window.soundManager.unlock();
    window.soundManager.playInteract();
  }

  const s1Tag = document.getElementById('step1-score-tag');
  const s1Feed = document.getElementById('step1-feedback');

  if (sev === 'P0') {
    if (s1Tag) { s1Tag.textContent = '+25 / 25 pts'; s1Tag.className = 'step-score success'; }
    if (s1Feed) {
      s1Feed.className = 'step-feedback success';
      s1Feed.textContent = '✅ SPOT ON! Total gateway breakdown during transactions with VIP churn threat is a textbook P0 Blocker. Incident commander paging active!';
    }
  } else {
    const pts = sev === 'P1' ? 10 : (sev === 'P2' ? 5 : 0);
    if (s1Tag) { s1Tag.textContent = `+${pts} / 25 pts`; s1Tag.className = 'step-score warn'; }
    if (s1Feed) {
      s1Feed.className = 'step-feedback warning';
      s1Feed.textContent = `⚠️ Caution: Classifying $450k revenue churn & payment downtime as ${sev} risks breaching enterprise customer SLAs. P0 is the true severity!`;
    }
  }

  updateTriageGameScore();
}

function handleToggleDiagnostic(idx) {
  const card = document.querySelector(`.diag-card[data-idx="${idx}"]`);
  if (!card) return;

  if (triageGameState.selectedDiagnostics.has(idx)) {
    triageGameState.selectedDiagnostics.delete(idx);
    card.classList.remove('selected-pro', 'selected-trap');
  } else {
    if (triageGameState.selectedDiagnostics.size >= 3) {
      if (typeof showToast === 'function') {
        showToast('⚠️ Maximum 3 diagnostic cards allowed! Click an existing card to unselect.');
      }
      return;
    }
    triageGameState.selectedDiagnostics.add(idx);
    if (idx <= 2) {
      card.classList.add('selected-pro');
    } else {
      card.classList.add('selected-trap');
    }
  }

  if (window.soundManager) {
    window.soundManager.unlock();
    window.soundManager.playInteract();
  }

  // Calculate Round 2 points
  let r2Points = 0;
  let hasTrap = false;
  triageGameState.selectedDiagnostics.forEach(i => {
    const item = DIAGNOSTICS_DATA[i];
    if (item) {
      r2Points += item.points;
      if (item.isTrap) hasTrap = true;
    }
  });
  r2Points = Math.max(0, Math.min(35, r2Points));

  const s2Tag = document.getElementById('step2-score-tag');
  const s2Feed = document.getElementById('step2-feedback');

  if (s2Tag) {
    s2Tag.textContent = `+${r2Points} / 35 pts`;
    s2Tag.className = r2Points === 35 ? 'step-score success' : 'step-score';
  }

  if (s2Feed) {
    if (triageGameState.selectedDiagnostics.size === 0) {
      s2Feed.className = 'step-feedback hidden';
    } else if (hasTrap) {
      s2Feed.className = 'step-feedback warning';
      s2Feed.textContent = '⚠️ Anti-Pattern Alert: You selected a rookie trap! Real engineers never blame the client without logs or make wild promises.';
    } else if (triageGameState.selectedDiagnostics.size === 3) {
      s2Feed.className = 'step-feedback success';
      s2Feed.textContent = '✅ FLAWLESS DIAGNOSTIC SUITE! Full APM telemetry inspection, tenant blast-radius isolation, and synchronized DevOps war room established!';
    } else {
      s2Feed.className = 'step-feedback success';
      s2Feed.textContent = `Selected ${triageGameState.selectedDiagnostics.size} / 3 diagnostic actions. Pick ${3 - triageGameState.selectedDiagnostics.size} more!`;
    }
  }

  updateTriageGameScore();
}

function handleSelectStrategy(stratId) {
  triageGameState.strategy = stratId;
  const strat = STRATEGY_DATA[stratId];
  if (!strat) return;

  document.querySelectorAll('.resp-card').forEach(c => {
    const id = c.getAttribute('data-strat');
    if (id === stratId) {
      if (stratId === 'lead') {
        c.classList.add('selected-gold');
        c.classList.remove('selected-warn');
      } else {
        c.classList.add('selected-warn');
        c.classList.remove('selected-gold');
      }
    } else {
      c.classList.remove('selected-gold', 'selected-warn');
    }
  });

  if (window.soundManager) {
    window.soundManager.unlock();
    window.soundManager.playInteract();
  }

  // Auto-sync into the draft textarea for consistency
  const draftIn = document.getElementById('quest-draft-input');
  if (draftIn) draftIn.value = strat.text;

  const s3Tag = document.getElementById('step3-score-tag');
  const s3Feed = document.getElementById('step3-feedback');

  if (s3Tag) {
    s3Tag.textContent = `+${strat.points} / 40 pts`;
    s3Tag.className = strat.points === 40 ? 'step-score success' : 'step-score warn';
  }

  if (s3Feed) {
    if (stratId === 'lead') {
      s3Feed.className = 'step-feedback success';
      s3Feed.textContent = '🌟 MASTERFUL EXECUTIVE STRATEGY! De-escalates VP anxiety with calm authority, commits to a tight 30-min update cadence, and requests specific debug info.';
    } else if (stratId === 'cowboy') {
      s3Feed.className = 'step-feedback warning';
      s3Feed.textContent = '⚠️ High Risk: Blindly rolling back main branch without verifying root causes often causes split-brain database states and worse outages!';
    } else {
      s3Feed.className = 'step-feedback warning';
      s3Feed.textContent = '⛔ Catastrophic Error: Giving a canned 3-5 business day response to an escalated $450k client guarantees contract termination.';
    }
  }

  updateTriageGameScore();
}

function updateTriageGameScore() {
  let s1 = 0;
  if (triageGameState.severity === 'P0') s1 = 25;
  else if (triageGameState.severity === 'P1') s1 = 10;
  else if (triageGameState.severity === 'P2') s1 = 5;

  let s2 = 0;
  triageGameState.selectedDiagnostics.forEach(i => {
    const item = DIAGNOSTICS_DATA[i];
    if (item) s2 += item.points;
  });
  s2 = Math.max(0, Math.min(35, s2));

  let s3 = 0;
  if (triageGameState.strategy && STRATEGY_DATA[triageGameState.strategy]) {
    s3 = STRATEGY_DATA[triageGameState.strategy].points;
  }

  const total = Math.max(0, Math.min(100, s1 + s2 + s3));
  triageGameState.score = total;

  const scoreNum = document.getElementById('game-current-score');
  if (scoreNum) scoreNum.textContent = total;

  const rankBadge = document.getElementById('game-rank-badge');
  if (rankBadge) {
    if (total >= 95) {
      rankBadge.textContent = 'STAFF TECH LEAD';
      rankBadge.className = 'rank-pill gold';
    } else if (total >= 70) {
      rankBadge.textContent = 'SENIOR ENGINEER';
      rankBadge.className = 'rank-pill';
    } else if (total >= 40) {
      rankBadge.textContent = 'MID-LEVEL DEV';
      rankBadge.className = 'rank-pill';
    } else {
      rankBadge.textContent = 'NOVICE';
      rankBadge.className = 'rank-pill';
    }
  }

  const btnSubmit = document.getElementById('btn-submit-game-eval');
  const isReady = (triageGameState.severity !== null) && 
                  (triageGameState.selectedDiagnostics.size === 3) && 
                  (triageGameState.strategy !== null);

  if (btnSubmit) {
    if (isReady) {
      btnSubmit.classList.remove('disabled');
    } else {
      btnSubmit.classList.add('disabled');
    }
  }
}

function handleFinalizeGameTriage() {
  const isReady = (triageGameState.severity !== null) && 
                  (triageGameState.selectedDiagnostics.size === 3) && 
                  (triageGameState.strategy !== null);

  if (!isReady) {
    if (typeof showToast === 'function') {
      showToast('⚠️ Complete Step 1, pick 3 diagnostics in Step 2, and select your Strategy in Step 3!');
    }
    return;
  }

  const finalScore = triageGameState.score;
  const evalData = {
    totalScore: finalScore,
    clarity: Math.round(finalScore * 0.25),
    completeness: Math.round(finalScore * 0.25),
    tone: Math.round(finalScore * 0.25),
    nextAction: Math.round(finalScore * 0.25),
    summary: finalScore >= 80 
      ? "🎯 Outstanding live incident triage! You accurately classified the P0 blocker, avoided rookie traps, validated APM telemetry, and dispatched an executive update."
      : "Incident triage concluded with notable procedural vulnerabilities. Review P0 escalation protocols to protect client SLAs.",
    strengths: "Decisive incident severity tagging, clear 30-minute check-in SLA, disciplined telemetry debugging.",
    improvements: finalScore < 100 ? "Avoid dismissive communication or unverified production hotfixes." : "Flawless incident execution — ready for Staff Engineer escalation duties!",
    exemplaryRewrite: "Hi Mark, we have triaged this as a P0 blocker (INC-8924). War room is active on APM 502 traces. Next status update in 30 minutes."
  };

  if (window.aiAgent && currentQuestId) {
    window.aiAgent.scores[currentQuestId] = {
      score: finalScore,
      completed: finalScore >= 70,
      feedback: evalData.summary,
      details: evalData
    };
    if (typeof window.aiAgent.saveScores === 'function') {
      window.aiAgent.saveScores();
    }
  }

  displayEvaluationResults(evalData);
}

// Expose to window for inline onclick attributes
window.initTriageGame = initTriageGame;
window.setQuestChallengeMode = setQuestChallengeMode;
window.handleSelectSeverity = handleSelectSeverity;
window.handleToggleDiagnostic = handleToggleDiagnostic;
window.handleSelectStrategy = handleSelectStrategy;
window.handleFinalizeGameTriage = handleFinalizeGameTriage;

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

  // Handle game mode vs draft mode toggle
  const modeToggle = document.getElementById('quest-mode-toggle');
  if (questId === 'quest_ticket_triage') {
    if (modeToggle) modeToggle.style.display = 'flex';
    setQuestChallengeMode('game');
    initTriageGame();
  } else {
    if (modeToggle) modeToggle.style.display = 'none';
    setQuestChallengeMode('draft');
  }

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

function updateHUDQuestTracker() {
  if (!window.aiAgent) return;
  const activeQuestId = window.aiAgent.getActiveQuestId();
  const q = window.aiAgent.quests[activeQuestId];
  if (!q) return;

  const npc = window.aiAgent.npcs.find(n => n.id === q.mentorId) || window.aiAgent.npcs[0];
  const s = window.aiAgent.scores[activeQuestId] || { score: 0, completed: false };
  const questIdx = window.aiAgent.getQuestIndex(activeQuestId);

  const numEl = document.getElementById('hud-quest-num');
  if (numEl) numEl.textContent = (questIdx + 1);

  const titleEl = document.getElementById('hud-quest-title');
  if (titleEl) titleEl.textContent = q.title;

  const targetEl = document.getElementById('hud-quest-target');
  if (targetEl) targetEl.textContent = `👤 Mentor: ${npc.name} (${q.location})`;

  const barEl = document.getElementById('hud-quest-bar');
  if (barEl) barEl.style.width = `${s.score}%`;

  const statusEl = document.getElementById('hud-quest-status');
  if (statusEl) {
    if (s.completed) {
      statusEl.textContent = `[CLEARED ★ ${s.score}%]`;
      statusEl.className = 'hud-status cleared';
    } else if (s.score > 0) {
      statusEl.textContent = `[IN PROGRESS: ${s.score}%]`;
      statusEl.className = 'hud-status';
    } else {
      statusEl.textContent = `[IN PROGRESS]`;
      statusEl.className = 'hud-status';
    }
  }

  const trackerEl = document.getElementById('hud-quest-tracker');
  if (trackerEl) {
    trackerEl.onclick = () => {
      openQuestModal(activeQuestId, npc.id);
    };
  }

  // Sync retro manila folder header tab
  const tabLabel = document.getElementById('obj-tab-label');
  if (tabLabel) {
    tabLabel.textContent = `📁 TASK #${(questIdx + 1)}`;
  }
  const objTracker = document.getElementById('objective-tracker');
  if (objTracker) {
    objTracker.onclick = () => {
      openQuestModal(activeQuestId, npc.id);
    };
  }
}

// OfficePager 3000 (Simulated Chat Inbox)
let currentPagerChannel = 'eng-backend';

function openPagerModal() {
  const modal = document.getElementById('pager-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  renderPagerChannels();
  renderPagerMessages();
  window.soundManager.unlock();
  window.soundManager.playPagerBeep();
  const badge = document.getElementById('pager-unread-badge');
  if (badge) badge.classList.add('hidden');
}

function closePagerModal() {
  const modal = document.getElementById('pager-modal');
  if (modal) modal.classList.add('hidden');
}

function togglePagerModal() {
  const modal = document.getElementById('pager-modal');
  if (!modal) return;
  if (modal.classList.contains('hidden')) openPagerModal();
  else closePagerModal();
}

function renderPagerChannels() {
  const list = document.getElementById('pager-channels-list');
  if (!list || !window.aiAgent) return;
  list.innerHTML = '';
  const threads = window.aiAgent.getInboxThreads();
  Object.keys(threads).forEach(chKey => {
    const thread = threads[chKey];
    const item = document.createElement('div');
    item.className = `pager-channel-item ${chKey === currentPagerChannel ? 'active' : ''}`;
    item.innerHTML = `
      <span>${thread.title}</span>
      <span class="pager-channel-unread">${thread.messages.length}</span>
    `;
    item.onclick = () => {
      currentPagerChannel = chKey;
      renderPagerChannels();
      renderPagerMessages();
      window.soundManager.playInteract();
    };
    list.appendChild(item);
  });
}

function renderPagerMessages() {
  if (!window.aiAgent) return;
  const threads = window.aiAgent.getInboxThreads();
  const thread = threads[currentPagerChannel];
  if (!thread) return;

  const titleEl = document.getElementById('pager-thread-title');
  if (titleEl) titleEl.textContent = thread.title;
  const membersEl = document.getElementById('pager-thread-members');
  if (membersEl) membersEl.textContent = `Participants: ${thread.participants}`;

  const stream = document.getElementById('pager-messages-stream');
  if (stream) {
    stream.innerHTML = '';
    thread.messages.forEach(msg => {
      const bubble = document.createElement('div');
      bubble.className = `pager-msg ${msg.sender === 'You' ? 'sender-user' : ''}`;
      bubble.innerHTML = `
        <span class="pager-msg-sender">${msg.sender} [${msg.time || 'NOW'}]</span>
        <span class="pager-msg-text">${msg.text}</span>
      `;
      stream.appendChild(bubble);
    });
    stream.scrollTop = stream.scrollHeight;
  }

  // Quick Chips
  const chipsWrap = document.getElementById('pager-quick-responses');
  if (chipsWrap) {
    chipsWrap.innerHTML = '';
    const quickReplies = [
      "I'm on it right now, will update in 15 mins.",
      "Can you share repro steps or an error screenshot?",
      "Checked the logs, pushing a hotfix draft.",
      "Let's sync up in the cafeteria."
    ];
    quickReplies.forEach(qr => {
      const chip = document.createElement('button');
      chip.className = 'pager-chip';
      chip.textContent = qr;
      chip.onclick = () => {
        const inp = document.getElementById('pager-input');
        if (inp) {
          inp.value = qr;
          inp.focus();
        }
      };
      chipsWrap.appendChild(chip);
    });
  }
}

async function handlePagerSend() {
  const inp = document.getElementById('pager-input');
  if (!inp) return;
  const text = (inp.value || '').trim();
  if (!text || !window.aiAgent) return;
  inp.value = '';

  const threads = window.aiAgent.getInboxThreads();
  const thread = threads[currentPagerChannel];
  if (!thread) return;

  // Add user message
  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  thread.messages.push({ sender: 'You', text: text, time: now });
  renderPagerMessages();

  // Synthetic coworker typing response
  const stream = document.getElementById('pager-messages-stream');
  const typing = document.createElement('div');
  typing.className = 'pager-msg';
  typing.innerHTML = `<span class="pager-msg-sender">COWORKER</span><span class="pager-msg-text"><em>Typing simulated reply...</em></span>`;
  if (stream) {
    stream.appendChild(typing);
    stream.scrollTop = stream.scrollHeight;
  }

  // Get AI / seeded coworker response
  setTimeout(async () => {
    let replyText = "Received! Thanks for the quick triage and prompt response.";
    try {
      let npcId = 'npc_rahul';
      if (currentPagerChannel === 'vip-client-triage') npcId = 'npc_priya';
      else if (currentPagerChannel === 'cafeteria-social') npcId = 'npc_alex';
      replyText = await window.aiAgent.chatWithNPC(npcId, `In team chat channel '${thread.title}', colleague replied: "${text}". Give a realistic 1-2 sentence professional coworker response.`);
    } catch (e) {
      replyText = "Got it! Thanks for stepping in, keeping the customer updated.";
    }

    if (typing && typing.parentNode) typing.parentNode.removeChild(typing);
    const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let senderName = currentPagerChannel === 'vip-client-triage' ? 'Priya (PM)' : (currentPagerChannel === 'cafeteria-social' ? 'Alex (Ops)' : 'Rahul (Lead)');
    thread.messages.push({ sender: senderName, text: replyText, time: replyTime });
    renderPagerMessages();
    window.soundManager.playPagerBeep();
  }, 850);
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

  // Celebratory Next Mission Banner
  const nextBanner = document.getElementById('eval-next-mission-banner');
  const btnNext = document.getElementById('btn-proceed-next-quest');
  const nextSub = document.getElementById('next-banner-sub');

  if (data.totalScore >= 60) {
    window.soundManager.unlock();
    window.soundManager.playQuestComplete();

    // Reward corporate funds according to difficulty / performance tier
    let questMoney = 200;
    let diffLabel = 'TIER B (EASY)';
    if (data.totalScore >= 90) {
      questMoney = 500;
      diffLabel = 'TIER S (HARD)';
    } else if (data.totalScore >= 75) {
      questMoney = 350;
      diffLabel = 'TIER A (MED)';
    }
    if (typeof window.addCorporateFunds === 'function') {
      window.addCorporateFunds(questMoney);
    }

    showToast(`⚔️ VICTORY! Score: ${data.totalScore}/100 [${diffLabel}]! 💵 +$${questMoney} Corporate Funds Earned!`);

    if (nextBanner) nextBanner.classList.remove('hidden');

    // Find next quest
    const progression = window.aiAgent.getProgression();
    const currIdx = progression.indexOf(currentQuestId);
    if (currIdx !== -1 && currIdx < progression.length - 1) {
      const nextQId = progression[currIdx + 1];
      const nextQ = window.aiAgent.quests[nextQId];
      if (nextSub) nextSub.textContent = `Unlocked: Mission ${currIdx + 2} - ${nextQ.title}!`;
      if (btnNext) {
        btnNext.textContent = `PROCEED TO MISSION ${currIdx + 2} ▶`;
        btnNext.onclick = () => {
          closeQuestModal();
          openQuestModal(nextQId, nextQ.mentorId);
        };
      }
    } else {
      if (nextSub) nextSub.textContent = '👑 All 5 Workplace Quests Mastered! You achieved Principal Engineer rank!';
      if (btnNext) {
        btnNext.textContent = 'RETURN TO OFFICE 🏢';
        btnNext.onclick = closeQuestModal;
      }
    }
  } else {
    window.soundManager.unlock();
    window.soundManager.playInteract();
    showToast(`Score: ${data.totalScore}/100. Review the rubric tips and try again!`);
    if (nextBanner) nextBanner.classList.add('hidden');
  }

  // Update header, dashboard & corner HUD
  if (window.aiAgent) window.aiAgent.updateHeaderScoreUI();
  renderClassicDashboard();
  updateHUDQuestTracker();

  box.scrollIntoView({ behavior: 'smooth' });
}

function setupQuestEventListeners() {
  const btnToggle = document.getElementById('btn-toggle-classic');
  if (btnToggle) btnToggle.addEventListener('click', toggleClassicDashboard);

  const btnPager = document.getElementById('btn-open-pager');
  if (btnPager) btnPager.addEventListener('click', togglePagerModal);

  const btnClosePager = document.getElementById('btn-close-pager');
  if (btnClosePager) btnClosePager.addEventListener('click', closePagerModal);

  const btnSendPager = document.getElementById('btn-send-pager');
  if (btnSendPager) btnSendPager.addEventListener('click', handlePagerSend);

  const pagerInput = document.getElementById('pager-input');
  if (pagerInput) {
    pagerInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handlePagerSend();
      }
    });
  }

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

  // Money HUD Badge Interactions
  const moneyBadge = document.getElementById('hud-money-badge');
  if (moneyBadge) {
    moneyBadge.addEventListener('click', (e) => {
      e.stopPropagation();
      if (window.soundManager) {
        window.soundManager.unlock();
        window.soundManager.playSuccess();
      }
      window.addCorporateFunds(100);
      if (typeof showToast === 'function') {
        showToast(`💵 +$100 Stipend collected! Corporate Funds: $${(state.player.money !== undefined ? state.player.money : 0).toLocaleString()}`);
      }
    });
  }

  // Initial HUD update
  setTimeout(updateHUDQuestTracker, 500);
}

// ==========================================
// OBJECTIVES HUD CONTROLLER (Workplace Quest Tasks)
// ==========================================
function setupObjectivesWidget() {
  const toggleBtn = document.getElementById('btn-toggle-objectives');
  const closeBtn = document.getElementById('btn-close-objectives-panel');
  const panel = document.getElementById('hud-objectives-panel');

  if (toggleBtn) {
    toggleBtn.onclick = (e) => {
      e.stopPropagation();
      window.toggleObjectivesPanel();
    };
  }

  if (closeBtn) {
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      window.toggleObjectivesPanel(false);
    };
  }

  document.addEventListener('click', (e) => {
    if (panel && !panel.classList.contains('hidden')) {
      const widget = document.getElementById('hud-objectives-widget');
      if (widget && !widget.contains(e.target)) {
        window.toggleObjectivesPanel(false);
      }
    }
  });

  window.renderObjectivesList();
}

window.toggleObjectivesPanel = function(forceOpen) {
  const panel = document.getElementById('hud-objectives-panel');
  const chevron = document.getElementById('hud-obj-chevron');
  if (!panel) return;

  const willOpen = (typeof forceOpen === 'boolean') ? forceOpen : panel.classList.contains('hidden');

  if (willOpen) {
    panel.classList.remove('hidden');
    if (chevron) chevron.textContent = '▲';
    window.renderObjectivesList();
    if (window.soundManager && typeof window.soundManager.playInteract === 'function') {
      window.soundManager.playInteract();
    }
  } else {
    panel.classList.add('hidden');
    if (chevron) chevron.textContent = '▼';
  }
};

window.renderObjectivesList = function() {
  const listEl = document.getElementById('hud-objectives-list');
  const countBadge = document.getElementById('hud-obj-count');
  const progText = document.getElementById('hud-obj-prog-text');
  const progBar = document.getElementById('hud-obj-prog-bar');

  const objectives = window.WORKPLACE_OBJECTIVES || [];
  if (objectives.length === 0) return;

  const completedCount = objectives.filter(o => o.completed).length;
  const totalCount = objectives.length;
  const percent = Math.round((completedCount / totalCount) * 100);

  if (countBadge) countBadge.textContent = `${completedCount}/${totalCount}`;
  if (progText) progText.textContent = `${percent}% Completed (${completedCount}/${totalCount})`;
  if (progBar) progBar.style.width = `${percent}%`;

  if (!listEl) return;

  listEl.innerHTML = objectives.map(obj => `
    <div class="hud-obj-card ${obj.completed ? 'completed' : ''}" data-obj-id="${obj.id}" title="Click to ${obj.completed ? 'unmark' : 'mark completed'}">
      <div class="hud-obj-card-left">
        <button type="button" class="hud-obj-check ${obj.completed ? 'checked' : ''}" data-obj-id="${obj.id}">
          ${obj.completed ? '✓' : ''}
        </button>
        <div class="hud-obj-info">
          <div class="hud-obj-card-title">${obj.num}. ${obj.title}</div>
          <div class="hud-obj-card-action">${obj.action}</div>
          <div class="hud-obj-meta">
            <span class="hud-obj-prio ${obj.diffClass || 'p1'}">${obj.priority || 'P1'}</span>
            <span class="hud-obj-reward">💵 +$${obj.rewardMoney || 350}</span>
            <span class="hud-obj-reward">⭐ +${obj.xp || 150} XP</span>
            <span class="hud-obj-loc">📍 ${obj.location || 'Office'}</span>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  listEl.querySelectorAll('.hud-obj-card').forEach(card => {
    card.onclick = (e) => {
      e.stopPropagation();
      const objId = card.getAttribute('data-obj-id');
      if (typeof window.toggleObjectiveCompleted === 'function') {
        window.toggleObjectiveCompleted(objId);
      }
    };
  });
};

// Global Corporate Funds Handler
window.addCorporateFunds = function(amount = 100) {
  if (!state || !state.player) return;
  state.player.money = Math.max(0, (state.player.money !== undefined ? state.player.money : 0) + amount);
  const valEl = document.getElementById('hud-money-val');
  if (valEl) {
    valEl.textContent = '$' + state.player.money.toLocaleString();
  }

  // Immediately store in local persistent storage so refresh never resets to 0
  try {
    localStorage.setItem('officesim_saved_money', String(state.player.money));
    const lastUid = localStorage.getItem('officesim_last_uid');
    if (lastUid) {
      const pStr = localStorage.getItem('officesim_profile_' + lastUid);
      if (pStr) {
        const p = JSON.parse(pStr);
        p.money = state.player.money;
        localStorage.setItem('officesim_profile_' + lastUid, JSON.stringify(p));
      }
    }
  } catch (e) {}

  const badge = document.getElementById('hud-money-badge');
  if (badge) {
    const floatEl = document.createElement('span');
    floatEl.className = 'hud-money-float';
    floatEl.textContent = amount >= 0 ? `+$${amount}` : `-$${Math.abs(amount)}`;
    if (amount < 0) {
      floatEl.style.color = '#f87171';
      floatEl.style.textShadow = '0 0 10px #ef4444, 0 2px 4px rgba(0, 0, 0, 0.8)';
    }
    badge.appendChild(floatEl);
    setTimeout(() => floatEl.remove(), 750);
  }

  // Update top-right Cloud Profile badge immediately so user sees their updated money in the header
  const userCoinsEl = document.getElementById('user-pill-coins-val');
  if (userCoinsEl) {
    userCoinsEl.textContent = '$' + state.player.money.toLocaleString();
  }

  // Auto-sync money to Firebase Cloud
  if (window.firebaseSync) {
    if (window.firebaseSync.currentProfile) {
      window.firebaseSync.currentProfile.money = state.player.money;
      if (typeof window.firebaseSync.updateHeaderProfileBadge === 'function') {
        window.firebaseSync.updateHeaderProfileBadge(window.firebaseSync.currentProfile);
      }
    }
    if (typeof window.firebaseSync.saveProgress === 'function') {
      window.firebaseSync.saveProgress(false);
    }
  }
};

window.addEventListener('beforeunload', () => {
  if (window.firebaseSync && typeof window.firebaseSync.saveProgress === 'function') {
    window.firebaseSync.saveProgress(false);
  }
});

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
  let currentRoomCode = (window.MultiplayerEngine ? window.MultiplayerEngine.generateRoomCode() : Math.random().toString(36).substring(2, 6).toUpperCase());
  if (inputRoomCode) inputRoomCode.value = currentRoomCode;

  // Step 1: Initial "START GAME" button starts the game immediately!
  if (btnInitialStart) {
    btnInitialStart.onclick = () => {
      window.startGameOffline();
    };
  }

  const btnInitialOnline = document.getElementById('btn-initial-online');
  if (btnInitialOnline) {
    btnInitialOnline.onclick = () => {
      window.soundManager.unlock();
      window.soundManager.playInteract();
      startModal.classList.add('hidden');
      mpModal.classList.remove('hidden');
      joinOrHostCurrentRoom();
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
      window.multiplayerEngine.localPlayer.scene = state.currentScene;
      window.multiplayerEngine.localPlayer.x = Math.round(state.player.x);
      window.multiplayerEngine.localPlayer.y = Math.round(state.player.y);

      // Immediately broadcast full updated PRESENCE so peers in office see character right away
      window.multiplayerEngine.broadcast({
        type: 'PRESENCE',
        senderId: window.multiplayerEngine.localPlayer.id,
        player: window.multiplayerEngine.localPlayer
      });

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

// ==========================================
// GLOBAL START HELPER & KICKOFF
// ==========================================
window.startGameOffline = function() {
  const modal = document.getElementById('start-menu-modal');
  if (modal) modal.classList.add('hidden');
  if (typeof state !== 'undefined' && state.player) {
    state.player.charId = state.player.charId || 'char1';

    // Ensure saved money & progress are restored immediately
    if (window.firebaseSync && window.firebaseSync.currentProfile) {
      window.firebaseSync.applySavedProgress(window.firebaseSync.currentProfile);
    } else {
      const savedMoney = localStorage.getItem('officesim_saved_money');
      if (savedMoney !== null && Number(savedMoney) > 0) {
        state.player.money = Number(savedMoney);
        const valEl = document.getElementById('hud-money-val');
        if (valEl) valEl.textContent = '$' + state.player.money.toLocaleString();
      }
    }
  }
  if (window.soundManager) {
    window.soundManager.unlock();
    window.soundManager.playInteract();
  }
  if (typeof showToast === 'function') {
    showToast('🏢 Welcome to Office Simulator! Single-Player Mode.');
  }
  if (!isGameInitialized && typeof initGame === 'function') {
    initGame();
  }
};

// Script Ready & Initialization Kickoff
isScriptReady = true;
checkAllAssetsLoaded();

// Safety fallback timeout: launch game within 1.2s even if asset load callbacks were delayed
setTimeout(() => {
  if (!isGameInitialized) {
    console.log('Asset loading safety timeout reached, initializing game...');
    initGame();
  }
}, 1200);


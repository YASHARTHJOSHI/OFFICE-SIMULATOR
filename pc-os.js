/**
 * OfficeOS - Windows-style Desktop Environment for Assigned Workstation
 * Features:
 * - Desktop Wallpaper (User Fantasy Pixel Art)
 * - Draggable Windows (Terminal, OfficeChat, Notepad, Minesweeper, Intranet, File Explorer, Recycle Bin)
 * - Windows Taskbar with Start Menu, active window buttons, system tray with real-time clock & volume
 * - Interactive Command Prompt with rich commands (neofetch, matrix, git, help, etc.)
 * - Playable 9x9 Retro Minesweeper
 * - Slack / OfficeChat with channels & live coworker banter
 * - Notepad with persistent localStorage auto-save
 */

(function () {
  'use strict';

  // State Management
  const PC_STATE = {
    isOpen: false,
    activeWindowId: null,
    highestZ: 100,
    windows: {},
    startMenuOpen: false,
    draggedWin: null,
    dragOffset: { x: 0, y: 0 },
    clockInterval: null,
    minesweeper: {
      rows: 9,
      cols: 9,
      mines: 10,
      grid: [],
      revealed: 0,
      flags: 0,
      gameOver: false,
      won: false,
      timer: 0,
      timerInterval: null
    }
  };

  // Sound helper wrappers
  function playSound(type) {
    if (!window.soundManager) return;
    if (type === 'startup') window.soundManager.playWindowsStartup();
    else if (type === 'click') window.soundManager.playWindowsClick();
    else if (type === 'error') window.soundManager.playWindowsError();
    else if (type === 'notify') window.soundManager.playWindowsNotify();
  }

  // DOM Elements cache
  let overlay, desktop, taskbar, startMenu, taskbarApps, trayClock;

  function initPCOS() {
    overlay = document.getElementById('pc-desktop-overlay');
    if (!overlay) return;

    desktop = overlay.querySelector('.pc-desktop-area');
    taskbar = overlay.querySelector('.pc-taskbar');
    startMenu = overlay.querySelector('.pc-start-menu');
    taskbarApps = overlay.querySelector('.pc-taskbar-apps');
    trayClock = overlay.querySelector('.pc-tray-clock');

    // Setup Start Button
    const startBtn = overlay.querySelector('#pc-start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleStartMenu();
      });
    }

    // Close Start Menu on desktop click
    desktop.addEventListener('click', () => {
      if (PC_STATE.startMenuOpen) toggleStartMenu(false);
      deselectAllIcons();
    });

    // Close PC on Shut Down or Exit Button
    const exitBtn = overlay.querySelector('#pc-exit-btn');
    if (exitBtn) {
      exitBtn.addEventListener('click', () => closeWorkstationPC());
    }
    const shutdownBtn = overlay.querySelector('#pc-start-shutdown');
    if (shutdownBtn) {
      shutdownBtn.addEventListener('click', () => closeWorkstationPC());
    }

    // Desktop Icons
    setupDesktopIcons();

    // Start Menu Items
    setupStartMenuItems();

    // Drag Listener
    window.addEventListener('mousemove', onWindowDrag);
    window.addEventListener('mouseup', onWindowDragEnd);

    // Escape Key Listener
    window.addEventListener('keydown', (e) => {
      if (!PC_STATE.isOpen) return;
      if (e.key === 'Escape') {
        // If a window is open, close or exit
        closeWorkstationPC();
      }
    });

    // Volume mute icon in tray
    const soundTray = overlay.querySelector('#pc-tray-sound');
    if (soundTray) {
      soundTray.addEventListener('click', (e) => {
        e.stopPropagation();
        if (window.soundManager) {
          const isMuted = window.soundManager.toggleMute();
          soundTray.textContent = isMuted ? '🔇' : '🔊';
        }
      });
    }

    // Start Clock
    updateTrayClock();
    if (PC_STATE.clockInterval) clearInterval(PC_STATE.clockInterval);
    PC_STATE.clockInterval = setInterval(updateTrayClock, 1000);
  }

  function updateTrayClock() {
    if (!trayClock) return;
    const now = new Date();
    let hours = now.getHours();
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    trayClock.innerHTML = `<div>${hours}:${minutes} ${ampm}</div><div class="pc-tray-date">${now.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>`;
  }

  function toggleStartMenu(force) {
    PC_STATE.startMenuOpen = force !== undefined ? force : !PC_STATE.startMenuOpen;
    if (startMenu) {
      if (PC_STATE.startMenuOpen) {
        startMenu.classList.add('visible');
        playSound('click');
        // Update user profile in Start menu with active player data
        updateStartMenuUser();
      } else {
        startMenu.classList.remove('visible');
      }
    }
  }

  function updateStartMenuUser() {
    const userImg = document.getElementById('pc-user-avatar');
    const userName = document.getElementById('pc-user-name');
    const userRole = document.getElementById('pc-user-role');
    const player = window.state ? window.state.player : null;

    if (player && userName) {
      const charNames = {
        char1: 'Yasharth (Lead Dev)',
        char2: 'Priya (Fullstack Dev)',
        char3: 'Dev (Frontend Arch)',
        char4: 'Josh (AI Engineer)'
      };
      userName.textContent = charNames[player.charId] || player.name || 'Yasharth';
      if (userRole) userRole.textContent = 'Assigned Workstation #1 • OmniCorp';
      if (userImg) {
        userImg.src = `assets/${player.charId || 'char1'}_avatar.png`;
      }
    }
  }

  function deselectAllIcons() {
    const icons = overlay.querySelectorAll('.pc-desktop-icon');
    icons.forEach(ic => ic.classList.remove('selected'));
  }

  function setupDesktopIcons() {
    const icons = overlay.querySelectorAll('.pc-desktop-icon');
    icons.forEach(ic => {
      ic.addEventListener('click', (e) => {
        e.stopPropagation();
        deselectAllIcons();
        ic.classList.add('selected');
        playSound('click');
      });

      ic.addEventListener('dblclick', (e) => {
        e.stopPropagation();
        const appId = ic.getAttribute('data-app');
        if (appId) openApp(appId);
      });
    });
  }

  function setupStartMenuItems() {
    const items = overlay.querySelectorAll('.pc-start-item');
    items.forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const appId = item.getAttribute('data-app');
        toggleStartMenu(false);
        if (appId) openApp(appId);
      });
    });
  }

  // ==========================================
  // WINDOW MANAGER
  // ==========================================
  function registerWindow(id, title, icon, contentHtml, defaultW = 540, defaultH = 380) {
    const winEl = document.createElement('div');
    winEl.className = 'pc-window';
    winEl.id = `pc-win-${id}`;
    winEl.style.width = `${defaultW}px`;
    winEl.style.height = `${defaultH}px`;

    // Center window with slight offset
    const areaRect = desktop.getBoundingClientRect();
    const count = Object.keys(PC_STATE.windows).length;
    const initialLeft = Math.max(30, Math.min(areaRect.width - defaultW - 30, 80 + count * 28));
    const initialTop = Math.max(20, Math.min(areaRect.height - defaultH - 30, 40 + count * 24));

    winEl.style.left = `${initialLeft}px`;
    winEl.style.top = `${initialTop}px`;

    winEl.innerHTML = `
      <div class="pc-window-titlebar">
        <div class="pc-window-title">
          <span class="pc-win-icon">${icon}</span>
          <span class="pc-win-text">${title}</span>
        </div>
        <div class="pc-window-controls">
          <button class="pc-win-btn win-min" title="Minimize">─</button>
          <button class="pc-win-btn win-max" title="Maximize">□</button>
          <button class="pc-win-btn win-close" title="Close">✕</button>
        </div>
      </div>
      <div class="pc-window-body">
        ${contentHtml}
      </div>
    `;

    desktop.appendChild(winEl);

    // Taskbar item
    const taskItem = document.createElement('div');
    taskItem.className = 'pc-taskbar-item active';
    taskItem.id = `pc-task-${id}`;
    taskItem.innerHTML = `<span class="pc-task-icon">${icon}</span><span class="pc-task-label">${title}</span>`;
    taskItem.addEventListener('click', () => {
      toggleMinimizeWindow(id);
    });
    taskbarApps.appendChild(taskItem);

    // Window Events
    winEl.addEventListener('mousedown', () => {
      bringToFront(id);
    });

    const titlebar = winEl.querySelector('.pc-window-titlebar');
    titlebar.addEventListener('mousedown', (e) => {
      if (e.target.closest('.pc-window-controls')) return;
      startWindowDrag(id, e);
    });

    const minBtn = winEl.querySelector('.win-min');
    minBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      minimizeWindow(id);
    });

    const maxBtn = winEl.querySelector('.win-max');
    maxBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMaximizeWindow(id);
    });

    const closeBtn = winEl.querySelector('.win-close');
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      closeWindow(id);
    });

    PC_STATE.windows[id] = {
      el: winEl,
      taskEl: taskItem,
      title,
      icon,
      isMax: false,
      isMin: false,
      origRect: { left: initialLeft, top: initialTop, width: defaultW, height: defaultH }
    };

    bringToFront(id);
    playSound('click');
    return winEl;
  }

  function bringToFront(id) {
    const win = PC_STATE.windows[id];
    if (!win) return;
    PC_STATE.highestZ += 2;
    win.el.style.zIndex = PC_STATE.highestZ;
    PC_STATE.activeWindowId = id;

    // Update active style on taskbar
    overlay.querySelectorAll('.pc-taskbar-item').forEach(it => it.classList.remove('active'));
    win.taskEl.classList.add('active');
  }

  function startWindowDrag(id, e) {
    const win = PC_STATE.windows[id];
    if (!win || win.isMax) return;
    bringToFront(id);
    PC_STATE.draggedWin = win;
    const rect = win.el.getBoundingClientRect();
    PC_STATE.dragOffset.x = e.clientX - rect.left;
    PC_STATE.dragOffset.y = e.clientY - rect.top;
  }

  function onWindowDrag(e) {
    if (!PC_STATE.draggedWin) return;
    const desktopRect = desktop.getBoundingClientRect();
    let newX = e.clientX - desktopRect.left - PC_STATE.dragOffset.x;
    let newY = e.clientY - desktopRect.top - PC_STATE.dragOffset.y;

    // Boundary constraints
    newX = Math.max(0, Math.min(desktopRect.width - 60, newX));
    newY = Math.max(0, Math.min(desktopRect.height - 40, newY));

    PC_STATE.draggedWin.el.style.left = `${newX}px`;
    PC_STATE.draggedWin.el.style.top = `${newY}px`;
  }

  function onWindowDragEnd() {
    PC_STATE.draggedWin = null;
  }

  function minimizeWindow(id) {
    const win = PC_STATE.windows[id];
    if (!win) return;
    win.isMin = true;
    win.el.style.display = 'none';
    win.taskEl.classList.remove('active');
    playSound('click');
  }

  function toggleMinimizeWindow(id) {
    const win = PC_STATE.windows[id];
    if (!win) return;
    if (win.isMin) {
      win.isMin = false;
      win.el.style.display = 'flex';
      bringToFront(id);
    } else if (PC_STATE.activeWindowId === id) {
      minimizeWindow(id);
    } else {
      bringToFront(id);
    }
  }

  function toggleMaximizeWindow(id) {
    const win = PC_STATE.windows[id];
    if (!win) return;
    win.isMax = !win.isMax;
    if (win.isMax) {
      win.origRect = {
        left: parseInt(win.el.style.left, 10),
        top: parseInt(win.el.style.top, 10),
        width: parseInt(win.el.style.width, 10),
        height: parseInt(win.el.style.height, 10)
      };
      win.el.style.left = '0px';
      win.el.style.top = '0px';
      win.el.style.width = '100%';
      win.el.style.height = '100%';
      win.el.classList.add('maximized');
    } else {
      win.el.style.left = `${win.origRect.left}px`;
      win.el.style.top = `${win.origRect.top}px`;
      win.el.style.width = `${win.origRect.width}px`;
      win.el.style.height = `${win.origRect.height}px`;
      win.el.classList.remove('maximized');
    }
    playSound('click');
  }

  function closeWindow(id) {
    const win = PC_STATE.windows[id];
    if (!win) return;
    if (win.el && win.el.parentNode) win.el.parentNode.removeChild(win.el);
    if (win.taskEl && win.taskEl.parentNode) win.taskEl.parentNode.removeChild(win.taskEl);
    delete PC_STATE.windows[id];
    playSound('click');
  }

  // ==========================================
  // APPLICATIONS
  // ==========================================
  function openApp(appId) {
    // If window already exists, restore and bring to front
    if (PC_STATE.windows[appId]) {
      const win = PC_STATE.windows[appId];
      if (win.isMin) {
        win.isMin = false;
        win.el.style.display = 'flex';
      }
      bringToFront(appId);
      return;
    }

    switch (appId) {
      case 'terminal':
        initTerminalApp();
        break;
      case 'slack':
        initSlackApp();
        break;
      case 'notepad':
        initNotepadApp();
        break;
      case 'minesweeper':
        initMinesweeperApp();
        break;
      case 'browser':
        initBrowserApp();
        break;
      case 'explorer':
        initExplorerApp();
        break;
      case 'recycle':
        initRecycleApp();
        break;
      default:
        console.warn('Unknown app:', appId);
    }
  }

  // --- 1. TERMINAL APP ---
  function initTerminalApp() {
    const html = `
      <div class="pc-terminal-container">
        <div class="pc-terminal-output" id="term-output">
          <div class="term-line welcome">OfficeOS Terminal v11.4 [Version 10.0.22631]</div>
          <div class="term-line welcome">(c) OmniCorp Corporation. All rights reserved.</div>
          <div class="term-line welcome">Type <span class="term-cmd-highlight">help</span> or <span class="term-cmd-highlight">neofetch</span> to get started.</div>
          <div class="term-line">&nbsp;</div>
        </div>
        <div class="pc-terminal-input-row">
          <span class="term-prompt">C:\\Users\\dev&gt;</span>
          <input type="text" id="term-input" class="term-input" autocomplete="off" spellcheck="false" />
        </div>
      </div>
    `;

    const winEl = registerWindow('terminal', 'Command Prompt (cmd.exe)', '💻', html, 580, 390);
    const input = winEl.querySelector('#term-input');
    const output = winEl.querySelector('#term-output');

    input.focus();
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = input.value.trim();
        handleTerminalCommand(cmd, output);
        input.value = '';
        output.scrollTop = output.scrollHeight;
      }
    });

    winEl.addEventListener('click', () => input.focus());
  }

  function handleTerminalCommand(rawCmd, outputEl) {
    const line = document.createElement('div');
    line.className = 'term-line';
    line.innerHTML = `<span class="term-prompt">C:\\Users\\dev&gt;</span> <span class="term-user-cmd">${escapeHtml(rawCmd)}</span>`;
    outputEl.appendChild(line);

    const parts = rawCmd.split(' ');
    const cmd = parts[0].toLowerCase();

    const addOutput = (text, isHtml = false, color = '') => {
      const out = document.createElement('div');
      out.className = 'term-line';
      if (color) out.style.color = color;
      if (isHtml) out.innerHTML = text;
      else out.textContent = text;
      outputEl.appendChild(out);
    };

    switch (cmd) {
      case '':
        break;
      case 'help':
        addOutput('Available commands:');
        addOutput('  neofetch      - Display system specs & workstation info');
        addOutput('  git status    - Check repository status');
        addOutput('  git log       - View recent employee commit messages');
        addOutput('  git commit    - Push hotfixes to production');
        addOutput('  whoami        - Display active user profile');
        addOutput('  matrix        - Stream digital cyber-rain');
        addOutput('  ls / dir      - List files in current directory');
        addOutput('  cat <file>    - Read file contents (e.g. cat secret.txt)');
        addOutput('  clear / cls   - Clear terminal output');
        addOutput('  exit          - Close command prompt');
        break;
      case 'clear':
      case 'cls':
        outputEl.innerHTML = '';
        break;
      case 'exit':
        closeWindow('terminal');
        break;
      case 'whoami':
        const p = window.state ? window.state.player : null;
        addOutput(`omnicorp\\${p ? p.charId : 'developer'} (Assigned Workstation #1 - Full Admin Privileges)`);
        break;
      case 'neofetch':
      case 'specs':
        const neofetchHtml = `
<pre class="term-neofetch">
   <span>   ___  __  __ _  _ _ ____</span>     <span>OS:</span> OfficeOS 11 Pro 64-bit
   <span>  / _ \\|  \\/  | \\| | |/ ___|</span>    <span>Host:</span> Workstation #1 (Left Upper L-Desk)
   <span> | | | | |\\/| | .\\' | | |    </span>    <span>Kernel:</span> 6.1.42-coffee-boost
   <span> | |_| | |  | | |\\  | | |___ </span>    <span>Uptime:</span> 7 hours, 42 mins (0 breaks)
   <span>  \\___/|_|  |_|_| \\_|_|\\____|</span>    <span>Shell:</span> bash / cmd.exe
                                <span>CPU:</span> 12th Gen Intel Core i9-12900K
                                <span>Memory:</span> 14.2 GB / 32.0 GB (44% Slack)
                                <span>Resolution:</span> 1024x576 Pixel Display
                                <span>Wallpaper:</span> 16-Bit Pixel Mountain Castle
</pre>`;
        addOutput(neofetchHtml, true);
        break;
      case 'git':
        const sub = parts[1] ? parts[1].toLowerCase() : '';
        if (sub === 'status') {
          addOutput('On branch main');
          addOutput('Your branch is up to date with \'origin/main\'.');
          addOutput('nothing to commit, working tree clean (All sitting postures verified!)', false, '#10b981');
        } else if (sub === 'log') {
          addOutput('commit e18d481 - Fix sitting position, orientation, and chair alignment (HEAD -> main)');
          addOutput('commit 6113d21 - Replaced character 4 with Josh in multiplayer');
          addOutput('commit 94cba12 - Fix ticket triage game format with interactive escalation');
          addOutput('commit 57fa820 - Remove door and add written Cafeteria button');
        } else if (sub === 'commit') {
          addOutput('[main 7c4a19b] Hotfix deployed: 0 bugs reported (for now).', false, '#38bdf8');
          playSound('notify');
        } else {
          addOutput('Usage: git status | git log | git commit');
        }
        break;
      case 'matrix':
        addOutput('Entering the Matrix... Wake up, Neo.', false, '#10b981');
        let count = 0;
        const matrixTimer = setInterval(() => {
          if (count > 15) {
            clearInterval(matrixTimer);
            addOutput('Matrix stream disconnected.', false, '#10b981');
            return;
          }
          const chars = '0123456789ABCDEF@#$%&*~';
          let stream = '';
          for (let i = 0; i < 48; i++) {
            stream += chars[Math.floor(Math.random() * chars.length)] + ' ';
          }
          addOutput(stream, false, '#10b981');
          outputEl.scrollTop = outputEl.scrollHeight;
          count++;
        }, 120);
        break;
      case 'ls':
      case 'dir':
        addOutput(' Directory of C:\\Users\\dev');
        addOutput('10/27/2026  09:15 PM    <DIR>          .');
        addOutput('10/27/2026  09:15 PM    <DIR>          ..');
        addOutput('10/27/2026  10:30 PM             2,410 secret_plans.txt');
        addOutput('10/27/2026  08:12 PM               415 todo.txt');
        addOutput('10/27/2026  11:00 PM            18,290 resume_FINAL_v7.pdf');
        addOutput('10/27/2026  11:25 PM             1,024 boss_coffee_receipts.csv');
        break;
      case 'cat':
      case 'type':
        const file = parts[1] ? parts[1].toLowerCase() : '';
        if (file === 'secret_plans.txt' || file === 'secret.txt') {
          addOutput('TOP SECRET: Phase 2 Roadmap');
          addOutput('- Replace all Monday meetings with 5-minute async memes.');
          addOutput('- Install espresso drip line directly to workstation #1.');
          addOutput('- Ask Anakin for bonus pool before Q4 ends.');
        } else if (file === 'todo.txt') {
          addOutput('TODO: 1. Attend Standup without yawning. 2. PR Review for Rahul. 3. Defeat Minesweeper highscore.');
        } else if (file) {
          addOutput(`Cannot open file: ${file}`);
        } else {
          addOutput('Usage: cat <filename>');
        }
        break;
      default:
        addOutput(`'${cmd}' is not recognized as an internal or external command. Type 'help' for options.`, false, '#ef4444');
        playSound('error');
    }
  }

  // --- 2. SLACK / OFFICECHAT APP ---
  function initSlackApp() {
    const html = `
      <div class="pc-slack-wrap">
        <div class="pc-slack-sidebar">
          <div class="pc-slack-workspace">
            <strong>OmniCorp Slack</strong>
            <span class="slack-status-dot online"></span>
          </div>
          <div class="pc-slack-section">CHANNELS</div>
          <div class="pc-slack-channel active" data-chan="general"># general</div>
          <div class="pc-slack-channel" data-chan="dev-team"># dev-team</div>
          <div class="pc-slack-channel" data-chan="watercooler"># watercooler</div>
          <div class="pc-slack-channel" data-chan="memes"># memes</div>
          <div class="pc-slack-section">DIRECT MESSAGES</div>
          <div class="pc-slack-dm" data-chan="dm-rahul">🟢 Rahul (Tech Lead)</div>
          <div class="pc-slack-dm" data-chan="dm-priya">🟢 Priya (Product PM)</div>
          <div class="pc-slack-dm" data-chan="dm-amit">🟢 Amit (HR Manager)</div>
          <div class="pc-slack-dm" data-chan="dm-boss">🔴 Anakin (CEO)</div>
        </div>
        <div class="pc-slack-main">
          <div class="pc-slack-header">
            <span id="slack-current-channel"># general</span>
            <span class="slack-topic">Topic: Free donuts in Cafeteria! Do NOT push broken code on Friday.</span>
          </div>
          <div class="pc-slack-messages" id="slack-msg-feed"></div>
          <div class="pc-slack-input-row">
            <input type="text" id="slack-input" placeholder="Message #general..." />
            <button id="slack-send-btn" class="pc-btn-primary">Send ⏎</button>
          </div>
        </div>
      </div>
    `;

    const winEl = registerWindow('slack', 'OfficeChat - OmniCorp Workspace', '💬', html, 640, 420);

    const channelsData = {
      'general': [
        { user: 'Anakin Skywalker', avatar: 'boss', time: '09:00 AM', text: 'Good morning team. Today\'s objective: 0 critical bugs and 200% sprint productivity.' },
        { user: 'Priya', avatar: 'npc_priya', time: '09:14 AM', text: 'Ticket triage sprint kickoff at 11 AM! Please check your assigned P0 customer tickets.' },
        { user: 'Alex', avatar: 'npc_alex', time: '10:05 AM', text: '☕ Cafeteria update: Fresh Colombian dark roast is brewed at the espresso bar!' }
      ],
      'dev-team': [
        { user: 'Rahul', avatar: 'npc_rahul', time: '09:30 AM', text: 'Reminder: PRs need clean descriptions and unit tests before requesting review.' },
        { user: 'Neha', avatar: 'npc_neha', time: '09:45 AM', text: 'Standup in 5 mins! Keep it crisp: What you did, what you\'re doing, and blockers.' },
        { user: 'Rahul', avatar: 'npc_rahul', time: '10:12 AM', text: 'Whoever fixed the chair sitting position: code looks super clean. Approved!' }
      ],
      'watercooler': [
        { user: 'Amit', avatar: 'npc_amit', time: '10:20 AM', text: 'Remember to stretch every 45 minutes and stay hydrated at the water cooler! 💧' },
        { user: 'Priya', avatar: 'npc_priya', time: '10:35 AM', text: 'Anyone want to split a sandwich in the Cafeteria around 1:00 PM?' }
      ],
      'memes': [
        { user: 'Neha', avatar: 'npc_neha', time: '11:00 AM', text: 'QA Engineer walks into a bar. Orders a beer. Orders 0 beers. Orders 999999999 beers. Orders a lizard.' },
        { user: 'Rahul', avatar: 'npc_rahul', time: '11:05 AM', text: 'A real customer walks into the bar and asks where the restroom is. The bar bursts into flames.' }
      ],
      'dm-rahul': [
        { user: 'Rahul', avatar: 'npc_rahul', time: '10:00 AM', text: 'Hey! Ping me when you submit your PR review quest, I\'ll take a look right away.' }
      ],
      'dm-priya': [
        { user: 'Priya', avatar: 'npc_priya', time: '09:40 AM', text: 'Hey there! Did you get a chance to check the escalation ticket triage game?' }
      ],
      'dm-amit': [
        { user: 'Amit', avatar: 'npc_amit', time: '09:10 AM', text: 'Remember: Ask without apology! If you hit a roadblock, my 1-on-1 door is always open.' }
      ],
      'dm-boss': [
        { user: 'Anakin Skywalker', avatar: 'boss', time: '08:30 AM', text: 'I sense great potential in you. Do not disappoint the Executive Committee.' }
      ]
    };

    let curChannel = 'general';
    const feed = winEl.querySelector('#slack-msg-feed');
    const input = winEl.querySelector('#slack-input');
    const sendBtn = winEl.querySelector('#slack-send-btn');
    const chanTitle = winEl.querySelector('#slack-current-channel');

    function renderFeed(ch) {
      feed.innerHTML = '';
      const list = channelsData[ch] || [];
      list.forEach(m => {
        const item = document.createElement('div');
        item.className = 'slack-msg-item';
        item.innerHTML = `
          <div class="slack-msg-avatar">👤</div>
          <div class="slack-msg-content">
            <div class="slack-msg-meta">
              <strong>${m.user}</strong> <span class="slack-msg-time">${m.time}</span>
            </div>
            <div class="slack-msg-text">${escapeHtml(m.text)}</div>
          </div>
        `;
        feed.appendChild(item);
      });
      feed.scrollTop = feed.scrollHeight;
    }

    renderFeed(curChannel);

    // Channel Click listeners
    winEl.querySelectorAll('.pc-slack-channel, .pc-slack-dm').forEach(btn => {
      btn.addEventListener('click', () => {
        winEl.querySelectorAll('.pc-slack-channel, .pc-slack-dm').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        curChannel = btn.getAttribute('data-chan');
        chanTitle.textContent = btn.textContent;
        renderFeed(curChannel);
        playSound('click');
      });
    });

    const sendMsg = () => {
      const val = input.value.trim();
      if (!val) return;
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const playerName = (window.state && window.state.player && window.state.player.charId === 'char4') ? 'Josh' : 'Yasharth';

      if (!channelsData[curChannel]) channelsData[curChannel] = [];
      channelsData[curChannel].push({
        user: `${playerName} (You)`,
        avatar: 'player',
        time: timeStr,
        text: val
      });

      renderFeed(curChannel);
      input.value = '';
      playSound('notify');

      // AI coworker simulated reply after 1.2s!
      setTimeout(() => {
        const replies = [
          'Agreed! Let\'s ship this to production today. 🚀',
          'Nice catch on that! Added to sprint board.',
          'Haha 100%! Grab a coffee and let\'s discuss at standup.',
          'Looking great. Let\'s sync up after lunch!'
        ];
        const randomReply = replies[Math.floor(Math.random() * replies.length)];
        const responder = curChannel.includes('rahul') ? 'Rahul' : (curChannel.includes('priya') ? 'Priya' : (curChannel.includes('amit') ? 'Amit' : 'Neha'));
        channelsData[curChannel].push({
          user: responder,
          avatar: 'npc',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          text: randomReply
        });
        renderFeed(curChannel);
        playSound('notify');
      }, 1200);
    };

    sendBtn.addEventListener('click', sendMsg);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMsg();
    });
  }

  // --- 3. NOTEPAD / TODO APP ---
  function initNotepadApp() {
    const savedNotes = localStorage.getItem('officesim_pc_notes') ||
`=== OMNICORP WORKSTATION #1 DEVELOPER NOTES ===
[x] 09:30 AM - Morning Standup (Keep updates under 60s)
[x] 11:00 AM - Fix Character Sitting Alignment in OfficeSim
[ ] 02:00 PM - Code Review PR #412 with Rahul
[ ] 03:30 PM - Escalation Ticket Triage with Priya
[ ] 05:00 PM - Try beating Minesweeper highscore!

--- SECRET WI-FI PASSCODE ---
SSID: OmniCorp-Guest-5G
Pass: CoffeeFirstCodeLater!2026

--- SNIPPETS ---
git add . && git commit -m "another day another feature"`;

    const html = `
      <div class="pc-notepad-container">
        <div class="pc-notepad-menubar">
          <span>File</span>
          <span>Edit</span>
          <span>Format</span>
          <span>View</span>
          <span>Help</span>
          <span class="pc-notepad-status" id="notepad-save-status">Saved</span>
        </div>
        <textarea id="pc-notepad-text" class="pc-notepad-area" spellcheck="false">${escapeHtml(savedNotes)}</textarea>
      </div>
    `;

    const winEl = registerWindow('notepad', 'Notepad - todo.txt', '📝', html, 520, 360);
    const textarea = winEl.querySelector('#pc-notepad-text');
    const status = winEl.querySelector('#notepad-save-status');

    textarea.addEventListener('input', () => {
      status.textContent = 'Editing...';
      localStorage.setItem('officesim_pc_notes', textarea.value);
      setTimeout(() => {
        status.textContent = 'Saved';
      }, 500);
    });
  }

  // --- 4. MINESWEEPER APP ---
  function initMinesweeperApp() {
    const html = `
      <div class="pc-minesweeper-box">
        <div class="ms-header">
          <div class="ms-counter" id="ms-mines-count">010</div>
          <button class="ms-face-btn" id="ms-face">🙂</button>
          <div class="ms-counter" id="ms-timer">000</div>
        </div>
        <div class="ms-grid" id="ms-grid"></div>
      </div>
    `;

    const winEl = registerWindow('minesweeper', 'Minesweeper.exe', '💣', html, 320, 380);
    setupMinesweeperGame(winEl);
  }

  function setupMinesweeperGame(winEl) {
    const ms = PC_STATE.minesweeper;
    const gridEl = winEl.querySelector('#ms-grid');
    const faceBtn = winEl.querySelector('#ms-face');
    const minesCountEl = winEl.querySelector('#ms-mines-count');
    const timerEl = winEl.querySelector('#ms-timer');

    function resetGame() {
      if (ms.timerInterval) clearInterval(ms.timerInterval);
      ms.timer = 0;
      ms.timerInterval = null;
      ms.gameOver = false;
      ms.won = false;
      ms.revealed = 0;
      ms.flags = 0;
      faceBtn.textContent = '🙂';
      minesCountEl.textContent = '010';
      timerEl.textContent = '000';

      // Build grid
      ms.grid = [];
      gridEl.innerHTML = '';

      for (let r = 0; r < ms.rows; r++) {
        const row = [];
        for (let c = 0; c < ms.cols; c++) {
          row.push({ r, c, isMine: false, isRevealed: false, isFlagged: false, neighborMines: 0 });
        }
        ms.grid.push(row);
      }

      // Place 10 mines randomly
      let placed = 0;
      while (placed < ms.mines) {
        const rr = Math.floor(Math.random() * ms.rows);
        const cc = Math.floor(Math.random() * ms.cols);
        if (!ms.grid[rr][cc].isMine) {
          ms.grid[rr][cc].isMine = true;
          placed++;
        }
      }

      // Count neighbor mines
      for (let r = 0; r < ms.rows; r++) {
        for (let c = 0; c < ms.cols; c++) {
          if (ms.grid[r][c].isMine) continue;
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < ms.rows && nc >= 0 && nc < ms.cols && ms.grid[nr][nc].isMine) {
                count++;
              }
            }
          }
          ms.grid[r][c].neighborMines = count;
        }
      }

      // Render DOM cells
      for (let r = 0; r < ms.rows; r++) {
        for (let c = 0; c < ms.cols; c++) {
          const cell = document.createElement('div');
          cell.className = 'ms-cell';
          cell.dataset.r = r;
          cell.dataset.c = c;

          cell.addEventListener('mousedown', (e) => {
            if (ms.gameOver || ms.won) return;
            if (e.button === 0 && !cell.classList.contains('revealed') && !cell.classList.contains('flagged')) {
              faceBtn.textContent = '😮';
            }
          });

          cell.addEventListener('mouseup', () => {
            if (!ms.gameOver && !ms.won) faceBtn.textContent = '🙂';
          });

          cell.addEventListener('click', () => {
            if (ms.gameOver || ms.won) return;
            startTimer();
            revealCell(r, c);
          });

          cell.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if (ms.gameOver || ms.won) return;
            startTimer();
            toggleFlag(r, c);
          });

          gridEl.appendChild(cell);
        }
      }
    }

    function startTimer() {
      if (ms.timerInterval) return;
      ms.timerInterval = setInterval(() => {
        ms.timer++;
        if (ms.timer > 999) ms.timer = 999;
        timerEl.textContent = String(ms.timer).padStart(3, '0');
      }, 1000);
    }

    function revealCell(r, c) {
      const cellData = ms.grid[r][c];
      if (cellData.isRevealed || cellData.isFlagged) return;

      const cellEl = gridEl.children[r * ms.cols + c];
      cellData.isRevealed = true;
      ms.revealed++;

      if (cellData.isMine) {
        // Explode!
        cellEl.classList.add('mine-hit');
        cellEl.textContent = '💣';
        endGame(false);
        return;
      }

      cellEl.classList.add('revealed');
      if (cellData.neighborMines > 0) {
        cellEl.textContent = cellData.neighborMines;
        cellEl.classList.add(`n${cellData.neighborMines}`);
      } else {
        // Flood fill empty neighbors
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = r + dr;
            const nc = c + dc;
            if (nr >= 0 && nr < ms.rows && nc >= 0 && nc < ms.cols) {
              revealCell(nr, nc);
            }
          }
        }
      }

      // Check win condition
      if (ms.revealed === ms.rows * ms.cols - ms.mines) {
        endGame(true);
      }
    }

    function toggleFlag(r, c) {
      const cellData = ms.grid[r][c];
      if (cellData.isRevealed) return;

      const cellEl = gridEl.children[r * ms.cols + c];
      cellData.isFlagged = !cellData.isFlagged;

      if (cellData.isFlagged) {
        cellEl.classList.add('flagged');
        cellEl.textContent = '🚩';
        ms.flags++;
      } else {
        cellEl.classList.remove('flagged');
        cellEl.textContent = '';
        ms.flags--;
      }

      const remaining = Math.max(0, ms.mines - ms.flags);
      minesCountEl.textContent = String(remaining).padStart(3, '0');
      playSound('click');
    }

    function endGame(isWin) {
      if (ms.timerInterval) clearInterval(ms.timerInterval);
      ms.gameOver = true;
      ms.won = isWin;

      if (isWin) {
        faceBtn.textContent = '😎';
        playSound('startup');
        if (window.showToast) window.showToast('🏆 You beat Minesweeper! Executive efficiency +100!');
      } else {
        faceBtn.textContent = '😵';
        playSound('error');
        // Reveal all mines
        for (let r = 0; r < ms.rows; r++) {
          for (let c = 0; c < ms.cols; c++) {
            if (ms.grid[r][c].isMine) {
              const el = gridEl.children[r * ms.cols + c];
              el.classList.add('revealed');
              el.textContent = '💣';
            }
          }
        }
      }
    }

    faceBtn.addEventListener('click', resetGame);
    resetGame();
  }

  // --- 5. BROWSER / INTRANET APP ---
  function initBrowserApp() {
    const html = `
      <div class="pc-browser-wrap">
        <div class="pc-browser-toolbar">
          <button class="pc-nav-btn">◀</button>
          <button class="pc-nav-btn">▶</button>
          <button class="pc-nav-btn">🔄</button>
          <div class="pc-url-bar">
            🔒 <span class="url-text">http://intranet.omnicorp.local/portal</span>
          </div>
        </div>
        <div class="pc-browser-body">
          <div class="intranet-header">
            <h2>🏢 OmniCorp Global Intranet</h2>
            <p>Welcome to Workstation #1 • Empowering innovation through endless coffee.</p>
          </div>
          <div class="intranet-grid">
            <div class="intranet-card">
              <h3>⭐ Employee of the Month</h3>
              <p><strong>Yasharth Joshi</strong></p>
              <p class="intranet-sub">"Shipped multiplayer, fixed sitting bugs, and drank 14 espressos in a single shift."</p>
            </div>
            <div class="intranet-card">
              <h3>☕ Cafeteria Daily Menu</h3>
              <ul>
                <li>• Triple Shot Dark Roast: <strong>Free</strong></li>
                <li>• Enterprise Artisan Bagel: <strong>$1.50</strong></li>
                <li>• Mystery Tech Burrito: <strong>$2.00</strong></li>
              </ul>
            </div>
            <div class="intranet-card">
              <h3>📋 HR Policy Highlights</h3>
              <p>• "Ask Without Apology": Don't suffer in silence when debugging.</p>
              <p>• "Meeting Echo": 15-minute meetings max with crisp action items.</p>
              <p>• Friday Deployments strictly monitored by Anakin Skywalker.</p>
            </div>
          </div>
        </div>
      </div>
    `;

    registerWindow('browser', 'OmniCorp Intranet - Internet Explorer', '🌐', html, 620, 420);
  }

  // --- 6. FILE EXPLORER APP ---
  function initExplorerApp() {
    const html = `
      <div class="pc-explorer-wrap">
        <div class="pc-explorer-nav">
          <span>Address: C:\\Users\\dev\\Projects</span>
        </div>
        <div class="pc-explorer-body">
          <div class="pc-file-item" data-name="officesim_src">
            <div class="pc-file-icon">📁</div>
            <div class="pc-file-name">OfficeSim_v2.0</div>
          </div>
          <div class="pc-file-item" data-name="multiplayer">
            <div class="pc-file-icon">📁</div>
            <div class="pc-file-name">P2P_Networking</div>
          </div>
          <div class="pc-file-item" data-name="ai_agents">
            <div class="pc-file-icon">📁</div>
            <div class="pc-file-name">Autonomous_NPCs</div>
          </div>
          <div class="pc-file-item" data-name="secret">
            <div class="pc-file-icon">📄</div>
            <div class="pc-file-name">Boss_Secrets.docx</div>
          </div>
          <div class="pc-file-item" data-name="resume">
            <div class="pc-file-icon">📝</div>
            <div class="pc-file-name">Resume_Updated.pdf</div>
          </div>
        </div>
      </div>
    `;

    const winEl = registerWindow('explorer', 'File Explorer - My PC', '📁', html, 520, 340);
    winEl.querySelectorAll('.pc-file-item').forEach(f => {
      f.addEventListener('dblclick', () => {
        playSound('notify');
        const name = f.getAttribute('data-name');
        if (window.showToast) window.showToast(`Opened: ${f.querySelector('.pc-file-name').textContent}`);
      });
    });
  }

  // --- 7. RECYCLE BIN APP ---
  function initRecycleApp() {
    const html = `
      <div class="pc-recycle-wrap">
        <div class="pc-recycle-toolbar">
          <button id="pc-empty-bin" class="pc-btn-primary">🗑️ Empty Recycle Bin</button>
        </div>
        <div class="pc-recycle-list" id="recycle-list">
          <div class="pc-recycle-row">
            <span>🐛 500_Merge_Conflicts_From_Hell.diff</span>
            <span>42 KB</span>
          </div>
          <div class="pc-recycle-row">
            <span>📉 Projected_Layoffs_Discarded.xlsx</span>
            <span>128 KB</span>
          </div>
          <div class="pc-recycle-row">
            <span>📄 Reasons_To_Do_Overtime.txt</span>
            <span>0 KB (Empty)</span>
          </div>
        </div>
      </div>
    `;

    const winEl = registerWindow('recycle', 'Recycle Bin', '🗑️', html, 440, 300);
    const emptyBtn = winEl.querySelector('#pc-empty-bin');
    const list = winEl.querySelector('#recycle-list');

    emptyBtn.addEventListener('click', () => {
      list.innerHTML = '<div style="padding: 2rem; text-align: center; color: #94a3b8;">Recycle Bin is completely empty!</div>';
      playSound('click');
      if (window.showToast) window.showToast('🗑️ Recycle Bin cleared!');
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ==========================================
  // PUBLIC API
  // ==========================================
  window.openWorkstationPC = function () {
    if (!overlay) initPCOS();
    if (!overlay) return;

    PC_STATE.isOpen = true;
    overlay.classList.remove('hidden');
    playSound('startup');

    // Seat player at the laptop chair naturally
    if (window.toggleSitInChair && window.state && window.state.player && !window.state.player.isSitting) {
      window.toggleSitInChair(95, 380, 'up', 145, 395);
    }

    if (window.showToast) {
      window.showToast('💻 Logged into Workstation #1 (OfficeOS 11 Pro)');
    }

    // Auto-open Terminal on first launch
    if (Object.keys(PC_STATE.windows).length === 0) {
      setTimeout(() => {
        openApp('terminal');
      }, 300);
    }
  };

  window.closeWorkstationPC = function () {
    if (!overlay) return;
    PC_STATE.isOpen = false;
    overlay.classList.add('hidden');
    if (PC_STATE.startMenuOpen) toggleStartMenu(false);
    playSound('click');
  };

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPCOS);
  } else {
    initPCOS();
  }
})();

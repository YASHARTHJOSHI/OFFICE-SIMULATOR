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
        char1: 'Vikram (Tech Lead)',
        char2: 'Neha (Strategic Planner)',
        char3: 'Kabir (Research Lead)',
        char4: 'Josh (Lead Architect)',
        char5: 'Yasharth (Principal Architect)'
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
    if (overlay) {
      overlay.querySelectorAll('iframe').forEach(f => f.style.pointerEvents = 'none');
    }
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
    if (overlay) {
      overlay.querySelectorAll('iframe').forEach(f => f.style.pointerEvents = 'auto');
    }
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
      case 'mail':
        initMailApp();
        break;
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

  // --- 2. WHATSAPP WEB / OFFICECHAT APP ---
  function initSlackApp() {
    const html = `
      <div class="pc-wa-app">
        <!-- 1. Leftmost Activity Rail -->
        <div class="pc-wa-rail">
          <div class="pc-wa-rail-top">
            <button class="pc-wa-rail-btn active" title="Chats" data-tab="chats">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3c-4.97 0-9 4.03-9 9 0 1.69.47 3.27 1.28 4.63L3 21l4.48-1.24A8.95 8.95 0 0 0 12 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 16.2c-1.46 0-2.84-.4-4.02-1.09l-.29-.17-2.66.74.75-2.58-.19-.31A7.16 7.16 0 0 1 4.8 12c0-3.97 3.23-7.2 7.2-7.2s7.2 3.23 7.2 7.2-3.23 7.2-7.2 7.2z"/>
              </svg>
              <span class="pc-wa-badge-dot"></span>
            </button>
            <button class="pc-wa-rail-btn" title="Status">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="9" stroke-dasharray="8 4"/>
              </svg>
            </button>
            <button class="pc-wa-rail-btn" title="Channels">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 4v16m-7-12v8m-7-4v0"/>
                <path d="M3 11l4-4h4l6-4v18l-6-4H7l-4-4z"/>
              </svg>
            </button>
            <button class="pc-wa-rail-btn" title="Communities">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 3s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </button>
            <button class="pc-wa-rail-btn meta-ai-btn" title="Meta AI">
              <div class="pc-wa-meta-ai-icon"></div>
            </button>
          </div>
          <div class="pc-wa-rail-bottom">
            <button class="pc-wa-rail-btn" title="Settings">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </button>
            <div class="pc-wa-profile-avatar" title="My Status: Online">
              <img id="wa-my-avatar" src="assets/char4_avatar.png" alt="Me" />
            </div>
          </div>
        </div>

        <!-- 2. Left Chats List Pane -->
        <div class="pc-wa-sidebar">
          <div class="pc-wa-sidebar-header">
            <h2 class="pc-wa-brand-title">WhatsApp</h2>
            <div class="pc-wa-header-actions">
              <button class="pc-wa-icon-btn pc-wa-newchat-btn" title="New Chat">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
              </button>
              <button class="pc-wa-icon-btn" title="Menu">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Search Bar -->
          <div class="pc-wa-search-wrap">
            <div class="pc-wa-search-box">
              <span class="pc-wa-search-icon">🔍</span>
              <input type="text" id="wa-search-input" placeholder="Search or start a new chat" />
            </div>
          </div>

          <!-- Filter Pills -->
          <div class="pc-wa-filters">
            <button class="pc-wa-filter-chip active" data-filter="all">All</button>
            <button class="pc-wa-filter-chip" data-filter="unread">Unread</button>
            <button class="pc-wa-filter-chip" data-filter="favs">Favourites</button>
            <button class="pc-wa-filter-chip" data-filter="groups">Groups</button>
            <button class="pc-wa-filter-chip add-filter" title="Add Custom Filter">+</button>
          </div>

          <!-- Notifications Off Alert Banner -->
          <div class="pc-wa-notif-banner" id="wa-notif-banner">
            <div class="pc-wa-notif-icon">🔕</div>
            <div class="pc-wa-notif-text">
              Message and call notifications are off. <a href="#" id="wa-enable-notif">Turn on</a>
            </div>
            <button class="pc-wa-notif-close" id="wa-close-notif" title="Dismiss">✕</button>
          </div>

          <!-- Chat Contacts List -->
          <div class="pc-wa-chat-list" id="wa-chat-list">
            <!-- Dynamically injected -->
          </div>

          <!-- Bottom Windows Promo -->
          <div class="pc-wa-bottom-promo" id="wa-desktop-promo">
            <span class="wa-promo-icon">💬</span>
            <span class="wa-promo-text">Get WhatsApp for Windows</span>
          </div>
        </div>

        <!-- 3. Right Active Chat Pane -->
        <div class="pc-wa-main">
          <!-- Active Chat Header -->
          <div class="pc-wa-chat-header">
            <div class="pc-wa-header-contact">
              <div class="pc-wa-header-avatar" id="wa-active-avatar">
                <!-- Avatar injected -->
              </div>
              <div class="pc-wa-header-info">
                <strong id="wa-active-name">Siddharth Roy (DevOps Lead)</strong>
                <span id="wa-active-status" class="wa-status-online">online</span>
              </div>
            </div>
            <div class="pc-wa-header-tools">
              <button class="pc-wa-tool-btn" title="Video Call">📹</button>
              <button class="pc-wa-tool-btn" title="Voice Call">📞</button>
              <span class="pc-wa-tool-divider"></span>
              <button class="pc-wa-tool-btn" title="Search in chat">🔍</button>
              <button class="pc-wa-tool-btn" title="More options">⋮</button>
            </div>
          </div>

          <!-- Message Stream with WhatsApp Dark Doodle Wallpaper -->
          <div class="pc-wa-chat-body" id="wa-msg-stream">
            <!-- Date badge & Message Bubbles injected -->
          </div>

          <!-- Input Footer Bar -->
          <div class="pc-wa-chat-footer">
            <button class="pc-wa-footer-btn" title="Emojis" id="wa-emoji-btn">😊</button>
            <button class="pc-wa-footer-btn" title="Attach file" id="wa-attach-btn">📎</button>
            <div class="pc-wa-input-pill">
              <input type="text" id="wa-msg-input" placeholder="Type a message" autocomplete="off" />
            </div>
            <button class="pc-wa-send-btn" id="wa-send-btn" title="Send message">
              <span id="wa-send-icon">🎙️</span>
            </button>
          </div>
        </div>
      </div>
    `;

    const winEl = registerWindow('slack', 'WhatsApp Web - OfficeChat', '💬', html, 840, 530);

    // Dynamic player avatar
    const myAv = winEl.querySelector('#wa-my-avatar');
    if (myAv && window.state && window.state.player) {
      if (window.state.player.charId === 'char5') myAv.src = 'assets/char5_avatar.png';
      else if (window.state.player.charId === 'char4') myAv.src = 'assets/char4_avatar.png';
      else if (window.state.player.charId === 'char1') myAv.src = 'assets/char1_avatar.png';
      else if (window.state.player.charId === 'char2') myAv.src = 'assets/char2_avatar.png';
      else if (window.state.player.charId === 'char3') myAv.src = 'assets/char3_avatar.png';
    }

    // Conversations Data matching professional office & engineering environment
    const contactsData = {
      'siddharth': {
        id: 'siddharth',
        name: 'Siddharth Roy (DevOps Lead)',
        subtitle: 'online',
        avatarBg: '#0284c7',
        avatarText: '⚡',
        avatarImg: 'assets/char1_avatar.png',
        type: 'direct',
        unread: 0,
        pinned: true,
        lastTime: '10:20 AM',
        messages: [
          { sender: 'other', text: 'Hey! Saw the fresh Groq AI SWE directives on your phone. Telemetry latency is looking super clean.', time: '10:14 AM' },
          { sender: 'me', text: 'Thanks! Digging into the Redis pool connection leak and query benchmarks now.', time: '10:16 AM' },
          { sender: 'other', text: 'Awesome. Staging deployment passed all canary health checks. Let me know if you need any cluster logs.', time: '10:18 AM' },
          { sender: 'me', text: 'Will do! Grab a coffee at the cafeteria after standup?', time: '10:19 AM' },
          { sender: 'other', text: 'Deal! See you at 11:00 AM near the coffee station. ☕', time: '10:20 AM' }
        ]
      },
      'kavita': {
        id: 'kavita',
        name: 'Kavita Sen (Lead UI/UX)',
        subtitle: 'last seen today at 10:05 AM',
        avatarBg: '#ec4899',
        avatarText: '🎨',
        avatarImg: 'assets/npc_priya_portrait.png',
        type: 'direct',
        unread: 0,
        lastTime: '09:50 AM',
        messages: [
          { sender: 'other', text: 'Hey, check out the new pixel-art money icon on the top-left of the game screen!', time: '09:45 AM' },
          { sender: 'me', text: 'Looks super clean! Sized to 38px with crisp pixel-art edges so it does not clutter the viewport.', time: '09:48 AM' },
          { sender: 'other', text: 'Love the click stipend animation too! Approved for production. ✨', time: '09:50 AM' }
        ]
      },
      'ananya': {
        id: 'ananya',
        name: 'Ananya Patel (QA Automation)',
        subtitle: 'online',
        avatarBg: '#10b981',
        avatarText: '🧪',
        avatarImg: 'assets/char2_avatar.png',
        type: 'direct',
        unread: 0,
        lastTime: '09:25 AM',
        messages: [
          { sender: 'other', text: 'All 42 end-to-end integration tests passed on staging! 🟢', time: '09:20 AM' },
          { sender: 'me', text: 'Zero regressions on multiplayer room sync?', time: '09:22 AM' },
          { sender: 'other', text: 'Zero regressions. WebSocket roundtrip latency is holding steady under 12ms.', time: '09:25 AM' }
        ]
      },
      'meera': {
        id: 'meera',
        name: 'Meera Joshi (HR Operations)',
        subtitle: 'last seen today at 09:00 AM',
        avatarBg: '#8b5cf6',
        avatarText: '👔',
        avatarImg: 'assets/npc_amit_portrait.png',
        type: 'direct',
        unread: 0,
        lastTime: '08:50 AM',
        messages: [
          { sender: 'other', text: 'Good morning! Remember to check your daily workplace communication objectives.', time: '08:45 AM' },
          { sender: 'me', text: 'On track! Aiming for Principal Engineer rank today.', time: '08:48 AM' },
          { sender: 'other', text: 'Wonderful! Let me know if you need any feedback on your rubric.', time: '08:50 AM' }
        ]
      },
      'eng-core': {
        id: 'eng-core',
        name: '#engineering-sprint-core',
        subtitle: 'Rahul, Priya, Siddharth, You and 18 others',
        avatarBg: '#475569',
        avatarText: '🏛️',
        type: 'group',
        unread: 2,
        lastTime: '09:08 AM',
        messages: [
          { sender: 'other', user: 'Rahul (Tech Lead)', text: 'Sprint #42 is officially in code freeze. Please finish open PR reviews.', time: '09:00 AM' },
          { sender: 'other', user: 'Priya (PM)', text: 'All P0 customer triage tickets are assigned on the dashboard.', time: '09:05 AM' },
          { sender: 'me', text: 'Acknowledged! Reviewing the distributed consensus PR now.', time: '09:08 AM' }
        ]
      },
      'facilities': {
        id: 'facilities',
        name: 'OmniCorp Campus Facilities',
        subtitle: 'Facilities, Security, You',
        avatarBg: '#ca8a04',
        avatarText: '🏢',
        type: 'group',
        unread: 0,
        lastTime: '08:35 AM',
        messages: [
          { sender: 'system', text: 'OmniCorp Facilities announcement: Cafeteria espresso station has been refilled.', time: '08:30 AM' },
          { sender: 'other', user: 'Coordinator', text: 'Evening campus shuttle will depart at 06:15 PM from the Main Lobby.', time: '08:35 AM' }
        ]
      },
      'rahul': {
        id: 'rahul',
        name: 'Rahul (Tech Lead)',
        subtitle: 'online',
        avatarBg: '#6366f1',
        avatarText: '💻',
        avatarImg: 'assets/npc_rahul_portrait.png',
        type: 'direct',
        unread: 0,
        lastTime: '10:12 AM',
        messages: [
          { sender: 'other', text: 'Good morning! Check the PR review queue when you get to your desk.', time: '09:30 AM' },
          { sender: 'me', text: 'Just tested the room portal badges and compact pill layout.', time: '10:00 AM' },
          { sender: 'other', text: 'Whoever fixed the badges & character sitting position: code looks super clean. Approved! 🚀', time: '10:12 AM' }
        ]
      },
      'priya': {
        id: 'priya',
        name: 'Priya (Product PM)',
        subtitle: 'online',
        avatarBg: '#ec4899',
        avatarText: '📋',
        avatarImg: 'assets/npc_priya_portrait.png',
        type: 'direct',
        unread: 0,
        lastTime: '09:14 AM',
        messages: [
          { sender: 'other', text: 'Ticket triage sprint kickoff at 11 AM! Please check your assigned P0 customer tickets.', time: '09:14 AM' },
          { sender: 'me', text: 'On it! Already locked in the diagnostic traps on the dashboard.', time: '09:20 AM' },
          { sender: 'other', text: 'Perfect! Keep up the momentum.', time: '09:22 AM' }
        ]
      },
      'amit': {
        id: 'amit',
        name: 'Amit (HR & Engineering)',
        subtitle: 'busy',
        avatarBg: '#8b5cf6',
        avatarText: '👔',
        avatarImg: 'assets/npc_amit_portrait.png',
        type: 'direct',
        unread: 0,
        lastTime: '09:10 AM',
        messages: [
          { sender: 'other', text: 'Remember: Ask without apology! If you hit a roadblock, my 1-on-1 door is always open.', time: '09:10 AM' }
        ]
      },
      'boss': {
        id: 'boss',
        name: 'Anakin Skywalker (CEO)',
        subtitle: 'online',
        avatarBg: '#ef4444',
        avatarText: '⚡',
        avatarImg: 'assets/boss_character.png',
        type: 'direct',
        unread: 0,
        lastTime: '08:30 AM',
        messages: [
          { sender: 'other', text: 'I sense great potential in you. Do not disappoint the Executive Committee.', time: '08:30 AM' }
        ]
      }
    };

    let activeContactId = 'siddharth';
    let currentFilter = 'all';
    let searchQuery = '';

    const chatListEl = winEl.querySelector('#wa-chat-list');
    const msgStreamEl = winEl.querySelector('#wa-msg-stream');
    const msgInputEl = winEl.querySelector('#wa-msg-input');
    const sendBtnEl = winEl.querySelector('#wa-send-btn');
    const sendIconEl = winEl.querySelector('#wa-send-icon');
    const activeAvatarEl = winEl.querySelector('#wa-active-avatar');
    const activeNameEl = winEl.querySelector('#wa-active-name');
    const activeStatusEl = winEl.querySelector('#wa-active-status');
    const searchInputEl = winEl.querySelector('#wa-search-input');
    const notifBannerEl = winEl.querySelector('#wa-notif-banner');
    const notifCloseEl = winEl.querySelector('#wa-close-notif');
    const notifEnableEl = winEl.querySelector('#wa-enable-notif');

    // Dismiss notifications banner
    if (notifCloseEl) {
      notifCloseEl.addEventListener('click', () => {
        notifBannerEl.style.display = 'none';
      });
    }
    if (notifEnableEl) {
      notifEnableEl.addEventListener('click', (e) => {
        e.preventDefault();
        notifBannerEl.innerHTML = '<span style="color:#00a884; font-size:0.8rem; font-weight:600;">🔔 Notifications enabled successfully!</span>';
        setTimeout(() => { notifBannerEl.style.display = 'none'; }, 2000);
      });
    }

    // Render Contact List in Sidebar
    function renderContacts() {
      chatListEl.innerHTML = '';
      const keys = Object.keys(contactsData);

      keys.forEach(k => {
        const c = contactsData[k];
        
        // Filter logic
        if (currentFilter === 'unread' && c.unread === 0) return;
        if (currentFilter === 'groups' && c.type !== 'group') return;
        if (currentFilter === 'favs' && !c.pinned) return;

        // Search logic
        if (searchQuery) {
          const matchName = c.name.toLowerCase().includes(searchQuery.toLowerCase());
          const lastMsg = c.messages[c.messages.length - 1];
          const matchText = lastMsg && lastMsg.text.toLowerCase().includes(searchQuery.toLowerCase());
          if (!matchName && !matchText) return;
        }

        const lastMsg = c.messages[c.messages.length - 1];
        let previewText = '';
        if (lastMsg) {
          if (lastMsg.sender === 'me') {
            previewText = `<span class="wa-preview-check">✓✓</span> You: ${escapeHtml(lastMsg.text)}`;
          } else {
            previewText = (lastMsg.user ? `~${escapeHtml(lastMsg.user)}: ` : '') + escapeHtml(lastMsg.text);
          }
        }

        const item = document.createElement('div');
        item.className = `pc-wa-chat-item ${k === activeContactId ? 'active' : ''}`;
        item.setAttribute('data-id', k);

        const avatarMarkup = c.avatarImg 
          ? `<img src="${c.avatarImg}" class="wa-avatar-img" alt="" onerror="this.outerHTML='<span class=\'wa-avatar-fallback\'>${c.avatarText}</span>'" />`
          : `<span class="wa-avatar-fallback" style="background:${c.avatarBg}">${c.avatarText}</span>`;

        item.innerHTML = `
          <div class="wa-item-avatar">
            ${avatarMarkup}
          </div>
          <div class="wa-item-content">
            <div class="wa-item-row-top">
              <span class="wa-item-name">${escapeHtml(c.name)}</span>
              <span class="wa-item-time">${c.lastTime || ''}</span>
            </div>
            <div class="wa-item-row-bottom">
              <span class="wa-item-snippet">${previewText}</span>
              ${c.unread > 0 ? `<span class="wa-unread-badge">${c.unread}</span>` : ''}
            </div>
          </div>
        `;

        item.addEventListener('click', () => {
          activeContactId = k;
          c.unread = 0;
          renderContacts();
          renderActiveChat();
          playSound('click');
        });

        chatListEl.appendChild(item);
      });
    }

    // Render Active Conversation
    function renderActiveChat() {
      const c = contactsData[activeContactId];
      if (!c) return;

      // Update Header
      activeNameEl.textContent = c.name;
      activeStatusEl.textContent = c.subtitle;
      activeStatusEl.className = c.subtitle === 'online' ? 'wa-status-online' : 'wa-status-muted';

      const avatarMarkup = c.avatarImg 
        ? `<img src="${c.avatarImg}" class="wa-avatar-img" alt="" onerror="this.outerHTML='<span class=\'wa-avatar-fallback\'>${c.avatarText}</span>'" />`
        : `<span class="wa-avatar-fallback" style="background:${c.avatarBg}">${c.avatarText}</span>`;
      activeAvatarEl.innerHTML = avatarMarkup;

      // Build Message Bubbles
      msgStreamEl.innerHTML = `
        <div class="wa-date-divider">
          <span>TODAY</span>
        </div>
      `;

      c.messages.forEach(m => {
        if (m.sender === 'system') {
          const sys = document.createElement('div');
          sys.className = 'wa-system-message';
          sys.innerHTML = `<span>🔒 ${escapeHtml(m.text)}</span>`;
          msgStreamEl.appendChild(sys);
          return;
        }

        const isMe = m.sender === 'me';
        const bubble = document.createElement('div');
        bubble.className = `wa-bubble ${isMe ? 'outgoing' : 'incoming'} ${m.quoted ? 'has-reply' : ''} ${m.reaction ? 'has-reaction' : ''}`;

        let quotedHtml = '';
        if (m.quoted) {
          quotedHtml = `
            <div class="wa-quoted-box">
              <div class="wa-quoted-author">${escapeHtml(m.quoted.author)}</div>
              <div class="wa-quoted-text">${escapeHtml(m.quoted.text)}</div>
            </div>
          `;
        }

        let userHeader = '';
        if (!isMe && c.type === 'group' && m.user) {
          userHeader = `<div class="wa-bubble-sender-title">~${escapeHtml(m.user)}</div>`;
        }

        let reactionHtml = '';
        if (m.reaction) {
          reactionHtml = `<div class="wa-reaction-badge">${m.reaction}</div>`;
        }

        const checkmarks = isMe ? '<span class="wa-checkmarks double-blue">✓✓</span>' : '';

        bubble.innerHTML = `
          <div class="wa-bubble-content">
            ${userHeader}
            ${quotedHtml}
            <div class="wa-bubble-text">${escapeHtml(m.text)}</div>
            <div class="wa-bubble-meta">
              <span class="wa-bubble-time">${m.time}</span>
              ${checkmarks}
            </div>
          </div>
          ${reactionHtml}
        `;

        msgStreamEl.appendChild(bubble);
      });

      msgStreamEl.scrollTop = msgStreamEl.scrollHeight;
    }

    // Search filter input listener
    if (searchInputEl) {
      searchInputEl.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        renderContacts();
      });
    }

    // Filter Chips
    winEl.querySelectorAll('.pc-wa-filter-chip:not(.add-filter)').forEach(chip => {
      chip.addEventListener('click', () => {
        winEl.querySelectorAll('.pc-wa-filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        currentFilter = chip.getAttribute('data-filter');
        renderContacts();
        playSound('click');
      });
    });

    // Send Message Handler
    const handleSend = () => {
      const text = msgInputEl.value.trim();
      if (!text) return;

      const c = contactsData[activeContactId];
      if (!c) return;

      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'pm' : 'am';
      hours = hours % 12 || 12;
      const timeStr = `${hours}:${minutes} ${ampm}`;

      c.messages.push({
        sender: 'me',
        text: text,
        time: timeStr
      });
      c.lastTime = timeStr;

      msgInputEl.value = '';
      sendIconEl.textContent = '🎙️';
      renderActiveChat();
      renderContacts();
      playSound('notify');

      // Show typing indicator in header
      activeStatusEl.textContent = 'typing...';
      activeStatusEl.className = 'wa-status-typing';

      setTimeout(() => {
        activeStatusEl.textContent = c.subtitle;
        activeStatusEl.className = c.subtitle === 'online' ? 'wa-status-online' : 'wa-status-muted';

        let replyText = 'Got it! Looking into this right away.';
        if (activeContactId === 'siddharth') {
          const siddharthReplies = [
            'Telemetry metrics are looking super healthy! 99.99% uptime on all pods.',
            'Staging cluster updated with your changes. All green lights! 🚀',
            'Let me know when you push your branch, will review right away.',
            'Coffee break sounds good! See you by the cafeteria lounge in 10 mins. ☕'
          ];
          replyText = siddharthReplies[Math.floor(Math.random() * siddharthReplies.length)];
        } else if (activeContactId === 'kavita') {
          replyText = 'Design looks crisp and pixel-perfect! Added to our design system.';
        } else if (activeContactId === 'ananya') {
          replyText = 'Automated regression test suite passed with 100% coverage! ✅';
        } else if (activeContactId === 'meera') {
          replyText = 'Feedback noted! Great progress on your communication milestones.';
        } else if (activeContactId === 'rahul') {
          replyText = 'PR looks solid! Approving and merging into main branch now. 🚀';
        } else if (activeContactId === 'priya') {
          replyText = 'Awesome update! Marking ticket as resolved on our Jira board.';
        } else if (activeContactId === 'boss') {
          replyText = 'Impressive progress. Maintain high sprint velocity for the Executive Committee.';
        } else if (c.type === 'group') {
          replyText = 'Acknowledged by the engineering team. Keep up the great velocity!';
        }

        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
        c.messages.push({
          sender: 'other',
          user: c.type === 'group' ? (c.id === 'facilities' ? 'Facilities Coordinator' : 'Rahul (Tech Lead)') : undefined,
          text: replyText,
          time: replyTime
        });
        c.lastTime = replyTime;

        renderActiveChat();
        renderContacts();
        playSound('notify');
      }, 1200);
    };

    sendBtnEl.addEventListener('click', handleSend);
    msgInputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSend();
    });

    // Toggle mic / send icon when typing
    msgInputEl.addEventListener('input', () => {
      if (msgInputEl.value.trim().length > 0) {
        sendIconEl.textContent = '➤';
        sendBtnEl.classList.add('can-send');
      } else {
        sendIconEl.textContent = '🎙️';
        sendBtnEl.classList.remove('can-send');
      }
    });

    // Initial render
    renderContacts();
    renderActiveChat();
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

  // --- 5. BROWSER (REAL INTERNET, GOOGLE & INTRANET) ---
  function initBrowserApp() {
    const defaultUrl = 'https://www.google.com?igu=1';
    const html = `
      <div class="pc-browser-wrap">
        <!-- Browser Tabs -->
        <div class="pc-browser-tabs">
          <div class="pc-b-tab active" id="tab-web" data-target="web">
            <span class="pc-tab-icon">🌐</span>
            <span class="pc-tab-title" id="pc-tab-title">Google Search</span>
          </div>
          <div class="pc-b-tab" id="tab-intranet" data-target="intranet">
            <span class="pc-tab-icon">🏢</span>
            <span class="pc-tab-title">OmniCorp Portal</span>
          </div>
        </div>

        <!-- Navigation Toolbar -->
        <div class="pc-browser-toolbar">
          <button class="pc-nav-btn" id="pc-btn-back" title="Back">◀</button>
          <button class="pc-nav-btn" id="pc-btn-fwd" title="Forward">▶</button>
          <button class="pc-nav-btn" id="pc-btn-reload" title="Refresh">🔄</button>
          <button class="pc-nav-btn" id="pc-btn-home" title="Google Home">🏠</button>
          
          <div class="pc-url-bar-wrap">
            <span class="pc-url-lock" id="pc-url-lock">🔒</span>
            <input type="text" class="pc-url-input" id="pc-url-input" value="${defaultUrl}" placeholder="Search Google or enter web address..." autocomplete="off" spellcheck="false" />
            <button class="pc-btn-go" id="pc-btn-go">Search / Go</button>
          </div>

          <button class="pc-btn-popout" id="pc-btn-popout" title="Open in External Browser Window">
            <span>↗</span> Popout
          </button>
        </div>

        <!-- Bookmarks Bar -->
        <div class="pc-browser-bookmarks">
          <span style="color: #64748b; font-size: 0.7rem; font-weight: 600;">Favorites:</span>
          <div class="pc-bookmark-chip" data-url="https://www.google.com?igu=1">🔍 Google</div>
          <div class="pc-bookmark-chip" data-url="intranet://portal">🏢 Intranet Portal</div>
          <div class="pc-bookmark-chip" data-url="https://en.wikipedia.org/wiki/Special:Search">📖 Wikipedia</div>
          <div class="pc-bookmark-chip" data-url="https://playdosgames.com">🕹️ DOS Games</div>
          <div class="pc-bookmark-chip" data-url="https://news.ycombinator.com">📰 Hacker News</div>
          <div class="pc-bookmark-chip" data-url="https://github.com">💻 GitHub</div>
        </div>

        <!-- Browser Body Viewport -->
        <div class="pc-browser-body" id="pc-browser-body">
          <!-- Real Internet Iframe View (Active by default with Google) -->
          <iframe 
            class="pc-browser-iframe" 
            id="pc-browser-iframe" 
            src="${defaultUrl}" 
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads"
            allow="fullscreen"
          ></iframe>

          <!-- Intranet Portal View (Hidden when browsing real internet) -->
          <div class="pc-intranet-view hidden" id="pc-intranet-view">
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
              <div class="intranet-card">
                <h3>🌐 Real World Internet</h3>
                <p>Access the real internet via the URL bar above:</p>
                <p style="margin-top: 6px;">Search anything on <strong>Google</strong> or click bookmarks!</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Status Bar -->
        <div class="pc-browser-statusbar">
          <span id="pc-browser-status-msg">🔒 Connected to World Wide Web</span>
          <span>Tip: Click [↗ Popout] if any website restricts embedded frames</span>
        </div>
      </div>
    `;

    const winEl = registerWindow('browser', 'Office Browser - Google & Intranet', '🌐', html, 800, 520);

    const iframe = winEl.querySelector('#pc-browser-iframe');
    const intranetView = winEl.querySelector('#pc-intranet-view');
    const urlInput = winEl.querySelector('#pc-url-input');
    const btnGo = winEl.querySelector('#pc-btn-go');
    const btnBack = winEl.querySelector('#pc-btn-back');
    const btnFwd = winEl.querySelector('#pc-btn-fwd');
    const btnReload = winEl.querySelector('#pc-btn-reload');
    const btnHome = winEl.querySelector('#pc-btn-home');
    const btnPopout = winEl.querySelector('#pc-btn-popout');
    const tabWeb = winEl.querySelector('#tab-web');
    const tabIntranet = winEl.querySelector('#tab-intranet');
    const tabTitle = winEl.querySelector('#pc-tab-title');
    const statusMsg = winEl.querySelector('#pc-browser-status-msg');

    let historyStack = [defaultUrl];
    let historyIdx = 0;

    function navigate(inputVal, addToHistory = true) {
      inputVal = (inputVal || '').trim();
      if (!inputVal) return;

      if (inputVal === 'intranet://portal' || inputVal.toLowerCase() === 'intranet' || inputVal.toLowerCase() === 'portal') {
        iframe.classList.add('hidden');
        intranetView.classList.remove('hidden');
        tabIntranet.classList.add('active');
        tabWeb.classList.remove('active');
        urlInput.value = 'intranet://portal';
        if (statusMsg) statusMsg.textContent = '🏢 OmniCorp Local Intranet (Port 3000)';
        return;
      }

      // Real Internet Navigation
      iframe.classList.remove('hidden');
      intranetView.classList.add('hidden');
      tabWeb.classList.add('active');
      tabIntranet.classList.remove('active');

      let targetUrl = inputVal;

      // Detect if user typed a search query vs actual URL
      const isUrl = /^https?:\/\//i.test(targetUrl) || 
                    (/^[\w-]+\.[a-z]{2,}/i.test(targetUrl) && !targetUrl.includes(' '));

      if (!isUrl) {
        // Query Google Search with igu=1 (Iframe Google Universal)
        targetUrl = `https://www.google.com/search?igu=1&q=${encodeURIComponent(inputVal)}`;
        if (tabTitle) tabTitle.textContent = `Search: ${inputVal}`;
      } else {
        if (!/^https?:\/\//i.test(targetUrl)) {
          targetUrl = 'https://' + targetUrl;
        }
        // If navigating to Google domain, ensure igu=1 is preserved so Google iframe doesn't block
        if (/google\.[a-z.]+(\/|$)/i.test(targetUrl) && !targetUrl.includes('igu=1')) {
          targetUrl += (targetUrl.includes('?') ? '&' : '?') + 'igu=1';
        }
        try {
          const u = new URL(targetUrl);
          if (tabTitle) tabTitle.textContent = u.hostname;
        } catch(e) {
          if (tabTitle) tabTitle.textContent = 'Web Browser';
        }
      }

      urlInput.value = targetUrl;
      iframe.src = targetUrl;
      if (statusMsg) statusMsg.textContent = `🌐 Navigating to ${targetUrl}...`;

      if (addToHistory) {
        historyStack = historyStack.slice(0, historyIdx + 1);
        historyStack.push(targetUrl);
        historyIdx = historyStack.length - 1;
      }
    }

    btnGo.addEventListener('click', () => navigate(urlInput.value));
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        navigate(urlInput.value);
      }
    });

    btnHome.addEventListener('click', () => navigate('https://www.google.com?igu=1'));
    btnReload.addEventListener('click', () => {
      if (!iframe.classList.contains('hidden')) {
        iframe.src = iframe.src;
      }
    });

    btnBack.addEventListener('click', () => {
      if (historyIdx > 0) {
        historyIdx--;
        navigate(historyStack[historyIdx], false);
      }
    });

    btnFwd.addEventListener('click', () => {
      if (historyIdx < historyStack.length - 1) {
        historyIdx++;
        navigate(historyStack[historyIdx], false);
      }
    });

    btnPopout.addEventListener('click', () => {
      const u = urlInput.value;
      if (u && !u.startsWith('intranet://')) {
        window.open(u.replace(/([?&])igu=1&?/g, '$1').replace(/[?&]$/, ''), '_blank');
      } else {
        window.open('https://www.google.com', '_blank');
      }
    });

    tabWeb.addEventListener('click', () => {
      if (urlInput.value === 'intranet://portal') {
        navigate('https://www.google.com?igu=1');
      } else {
        navigate(urlInput.value || 'https://www.google.com?igu=1');
      }
    });

    tabIntranet.addEventListener('click', () => {
      navigate('intranet://portal');
    });

    // Bookmarks
    winEl.querySelectorAll('.pc-bookmark-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        const url = chip.getAttribute('data-url');
        if (url) navigate(url);
      });
    });
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

  // --- 8. OMNIMAIL APP (Corporate Tasks & Directives) ---
  function initMailApp() {
    const html = `
      <div class="pc-mail-app">
        <!-- 1. Left Folder Sidebar -->
        <div class="pc-mail-sidebar">
          <button class="pc-mail-compose-btn" id="mail-btn-compose">
            <span>✏️</span> New Email
          </button>
          <div class="pc-mail-folder-list">
            <div class="pc-mail-folder-item active" data-folder="inbox">
              <div class="folder-left"><span>📥</span> Inbox</div>
              <span class="pc-mail-badge" id="mail-badge-inbox">5</span>
            </div>
            <div class="pc-mail-folder-item" data-folder="tasks">
              <div class="folder-left"><span>⚡</span> Directives & Tasks</div>
              <span class="pc-mail-badge alert" id="mail-badge-tasks">5</span>
            </div>
            <div class="pc-mail-folder-item" data-folder="sent">
              <div class="folder-left"><span>📤</span> Sent Items</div>
              <span class="pc-mail-badge" id="mail-badge-sent">0</span>
            </div>
            <div class="pc-mail-folder-item" data-folder="drafts">
              <div class="folder-left"><span>📋</span> Drafts</div>
            </div>
            <div class="pc-mail-folder-item" data-folder="trash">
              <div class="folder-left"><span>🗑️</span> Trash</div>
            </div>
          </div>
          <div class="pc-mail-user-card">
            <span style="font-size:0.68rem; color:#94a3b8;">LOGGED IN AS:</span>
            <span class="pc-mail-user-email" id="mail-user-email">vikram.lead@omnicorp.internal</span>
            <span class="pc-mail-user-status">● Connected (OmniMail Server)</span>
          </div>
        </div>

        <!-- 2. Middle List Pane -->
        <div class="pc-mail-list-pane">
          <div class="pc-mail-search-bar">
            <input type="text" class="pc-mail-search-input" id="mail-search-input" placeholder="🔍 Search directives, senders, tasks..." />
          </div>
          <div class="pc-mail-filter-tabs">
            <button class="pc-mail-tab-btn active" data-filter="all">All</button>
            <button class="pc-mail-tab-btn" data-filter="tasks">⚡ Tasks Only</button>
            <button class="pc-mail-tab-btn" data-filter="unread">Unread</button>
          </div>
          <div class="pc-mail-threads-scroll" id="mail-threads-list">
            <!-- Dynamically populated threads -->
          </div>
        </div>

        <!-- 3. Right Reading Pane & Composer -->
        <div class="pc-mail-read-pane" id="mail-read-pane">
          <!-- Selected email detail rendered here -->
        </div>

        <!-- Modal Compose Dialog -->
        <div class="pc-mail-compose-dialog" id="mail-compose-dialog" style="display: none;">
          <div class="compose-dialog-header">
            <span>✉️ New Message — OmniMail</span>
            <button class="pc-win-btn" id="compose-dialog-close">✕</button>
          </div>
          <div class="compose-dialog-body">
            <div class="compose-input-row">
              <span class="compose-label">To:</span>
              <select class="compose-select" id="compose-to-select">
                <option value="amit.sharma@omnicorp.internal">Amit Sharma (HR & Engineering Manager)</option>
                <option value="m.sterling@acmecorp.com">Mark Sterling (VP of Tech & Enterprise)</option>
                <option value="sre-incident-bot@omnicorp.internal">SRE Incident Command Team</option>
                <option value="neha.patel@omnicorp.internal">Neha Patel (Planning & InfoSec Lead)</option>
                <option value="deploy-bot@omnicorp.internal">DevOps Automation Cluster</option>
                <option value="rahul.lead@omnicorp.internal">Rahul (Tech Lead)</option>
                <option value="priya.pm@omnicorp.internal">Priya (Product PM)</option>
              </select>
            </div>
            <div class="compose-input-row">
              <span class="compose-label">Subject:</span>
              <input type="text" class="compose-input" id="compose-subject-input" placeholder="e.g. Q4 Sprint Deliverable Sign-off" />
            </div>
            <div class="pc-mail-template-pills">
              <span style="font-size:0.72rem; color:#94a3b8; font-weight:700;">Quick Fill:</span>
              <button class="mail-pill-btn" data-fill="retro">Sprint Retro</button>
              <button class="mail-pill-btn" data-fill="status">Status Update</button>
              <button class="mail-pill-btn" data-fill="rca">Incident RCA</button>
              <button class="mail-pill-btn" data-fill="canary">Canary Sign-off</button>
            </div>
            <textarea class="compose-textarea" id="compose-body-textarea" placeholder="Type your email message..."></textarea>
          </div>
          <div class="compose-dialog-footer">
            <span style="font-size:0.72rem; color:#94a3b8;">Sending via Workstation #1 Intranet</span>
            <div style="display:flex; gap:8px;">
              <button class="pc-win-btn" id="compose-btn-cancel" style="padding:6px 14px; border-radius:6px;">Discard</button>
              <button class="pc-mail-send-btn" id="compose-btn-send">
                <span>🚀</span> Send Email
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    const winEl = registerWindow('mail', 'OmniMail - Corporate Directives & Outlook', '✉️', html, 880, 560);

    // Initial Mail Database
    const defaultMails = [
      {
        id: 'mail_task_retro',
        isTask: true,
        isCompleted: false,
        isRead: false,
        folder: 'inbox',
        senderName: 'Amit Sharma',
        senderDept: 'Head of Engineering & HR',
        senderEmail: 'amit.sharma@omnicorp.internal',
        senderAvatar: 'assets/npc_amit_portrait.png',
        senderGlyph: '👔',
        subject: '[ACTION REQUIRED] Q4 Engineering Sprint Retrospective & OKR Sign-off',
        date: 'Today, 10:15 AM',
        category: 'HR DIRECTIVE',
        priority: 'High',
        difficulty: 'MED',
        taskTitle: 'Submit Sprint Retrospective to HR Manager Amit',
        xpReward: 180,
        fundsReward: 350,
        body: `Hi team,<br><br>As part of our continuous engineering excellence initiative, please reply to this directive thread with your completed sprint summary, technical challenges encountered (e.g. Redis socket connection pooling, database query benchmarks), and key takeaways.<br><br>Once submitted, this will be formally logged into our Q4 engineering performance audit and OKR evaluation.<br><br>Best regards,<br><strong>Amit Sharma</strong><br>Head of Engineering & HR Operations`,
        suggestedReply: `Hi Amit,\n\nHere is my Q4 Engineering Sprint summary:\n- Resolved Redis ingestion connection leak and stabilized socket recycling.\n- Added idempotency key verification to payment webhook listeners.\n- Benchmarked PostgreSQL telemetry logs and optimized index coverage.\n- Completed cross-functional triage with product and design teams.\n\nAll deliverables deployed and verified on staging!\n\nBest,\nLead Engineer`,
        replies: []
      },
      {
        id: 'mail_task_rca',
        isTask: true,
        isCompleted: false,
        isRead: false,
        folder: 'inbox',
        senderName: 'SRE Incident Command',
        senderDept: 'Site Reliability Engineering',
        senderEmail: 'sre-incident-bot@omnicorp.internal',
        senderAvatar: '',
        senderGlyph: '⚡',
        subject: 'INCIDENT-4091 [P0]: Root Cause Analysis (RCA) Sign-off for Payment Gateway',
        date: 'Today, 09:42 AM',
        category: 'INCIDENT P0',
        priority: 'Urgent',
        difficulty: 'HARD',
        taskTitle: 'Submit Post-Mortem RCA Sign-off to SRE Team',
        xpReward: 200,
        fundsReward: 500,
        body: `<strong>[INCIDENT-4091: SEVERITY 1 - RESOLVED]</strong><br><br>The upstream checkout gateway experienced a 4-minute packet drop anomaly during peak load. SRE on-call has mitigated the traffic spike.<br><br><strong>Directive:</strong> The assigned backend engineer must submit a signed Root Cause Analysis (RCA) and mitigation plan to close this incident ticket.<br><br>SRE Escalation Command`,
        suggestedReply: `SRE Team,\n\nRoot Cause Analysis (RCA) for INCIDENT-4091:\n1. Root Cause: TCP connection pool reached maximum backlog during ingress burst due to aggressive retry policy.\n2. Remediation: Implemented exponential backoff with jitter and increased socket recycling threshold.\n3. Long-term fix: Distributed circuit-breaker pattern deployed across microservice mesh.\n\nSigned-off for ticket closure.`,
        replies: []
      },
      {
        id: 'mail_task_client',
        isTask: true,
        isCompleted: false,
        isRead: false,
        folder: 'inbox',
        senderName: 'Mark Sterling',
        senderDept: 'VP of Technology & Enterprise',
        senderEmail: 'm.sterling@acmecorp.com',
        senderAvatar: '',
        senderGlyph: '👔',
        subject: 'Executive Query: Production Microservice SLA & Latency Telemetry Report',
        date: 'Today, 08:30 AM',
        category: 'EXECUTIVE',
        priority: 'High',
        difficulty: 'MED',
        taskTitle: 'Send Enterprise Telemetry Report to VP Mark Sterling',
        xpReward: 170,
        fundsReward: 350,
        body: `Engineering Team,<br><br>Before our executive board review at 2 PM, I need official confirmation on our enterprise telemetry numbers—specifically 99.99% uptime compliance and sub-millisecond ingestion latency figures.<br><br>Please confirm before noon.<br><br>Mark Sterling<br>VP of Technology & Enterprise Infrastructure`,
        suggestedReply: `Mark,\n\nConfirming our production SLA figures:\n- Cluster uptime: 99.994% across all 4 operational pods.\n- Telemetry ingestion latency: 0.82ms average (P99 at 4.1ms).\n- Queue backlog: 0 messages.\n\nAll metrics verified against production Grafana dashboards.`,
        replies: []
      },
      {
        id: 'mail_task_security',
        isTask: true,
        isCompleted: false,
        isRead: false,
        folder: 'inbox',
        senderName: 'Neha Patel',
        senderDept: 'Strategic Planning & InfoSec Lead',
        senderEmail: 'neha.patel@omnicorp.internal',
        senderAvatar: 'assets/npc_priya_portrait.png',
        senderGlyph: '🛡️',
        subject: 'Security Notice: Zero-Trust mTLS & Secret Key Rotation Sign-off',
        date: 'Yesterday, 04:15 PM',
        category: 'SECURITY AUDIT',
        priority: 'Normal',
        difficulty: 'EASY',
        taskTitle: 'Send mTLS Security Sign-off to InfoSec Lead Neha',
        xpReward: 150,
        fundsReward: 200,
        body: `Hi,<br><br>Our quarterly SOC2 Type II compliance audit is closing today. I need your formal sign-off confirming all workload certificate authorities and service mesh secrets have been rotated to 12-hour automated cycles.<br><br>Thanks,<br>Neha Patel`,
        suggestedReply: `Hi Neha,\n\nConfirming security compliance:\n- Workload mTLS certificates now auto-rotate via SPIFFE/SPIRE every 12 hours.\n- Vault secrets verified with zero plaintext keys in repositories.\n- Branch protection and signed commits enforced across all repos.\n\nSign-off approved.`,
        replies: []
      },
      {
        id: 'mail_task_canary',
        isTask: true,
        isCompleted: false,
        isRead: false,
        folder: 'inbox',
        senderName: 'DevOps Automation Cluster',
        senderDept: 'CI/CD Pipeline Engine',
        senderEmail: 'deploy-bot@omnicorp.internal',
        senderAvatar: '',
        senderGlyph: '🤖',
        subject: 'Deployment Gate: Production Canary Approval for Kafka Consumer v2.4',
        date: 'Yesterday, 02:10 PM',
        category: 'DEVOPS',
        priority: 'Normal',
        difficulty: 'EASY',
        taskTitle: 'Submit Deployment Approval Token to DevOps Cluster',
        xpReward: 160,
        fundsReward: 250,
        body: `Canary v2.4 passed automated synthetic health probes (p99 latency 1.1ms, 0 error rate over 10,000 requests).<br><br><strong>Action:</strong> Lead engineer sign-off required to promote canary to 100% fleet traffic.<br><br>Reply with approval token: <code>ACK_DEPLOY_PROD_CANARY</code>.`,
        suggestedReply: `ACK_DEPLOY_PROD_CANARY\n\nVerified canary telemetry logs. Error rate is 0.00%. Approved for 100% production rollout.`,
        replies: []
      }
    ];

    // Load or initialize state
    let mails = defaultMails;
    let sentMails = [];
    try {
      const stored = localStorage.getItem('pc_omnimail_state_v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.mails && parsed.mails.length) mails = parsed.mails;
        if (parsed.sentMails) sentMails = parsed.sentMails;
      }
    } catch (e) {}

    const saveMailState = () => {
      try {
        localStorage.setItem('pc_omnimail_state_v1', JSON.stringify({ mails, sentMails }));
      } catch (e) {}
    };

    // State
    let currentFolder = 'inbox';
    let currentFilter = 'all';
    let selectedMailId = mails[0] ? mails[0].id : null;
    let searchQuery = '';

    // Elements
    const folderItems = winEl.querySelectorAll('.pc-mail-folder-item');
    const badgeInbox = winEl.querySelector('#mail-badge-inbox');
    const badgeTasks = winEl.querySelector('#mail-badge-tasks');
    const badgeSent = winEl.querySelector('#mail-badge-sent');
    const threadsList = winEl.querySelector('#mail-threads-list');
    const readPane = winEl.querySelector('#mail-read-pane');
    const searchInput = winEl.querySelector('#mail-search-input');
    const tabBtns = winEl.querySelectorAll('.pc-mail-tab-btn');
    const userEmailEl = winEl.querySelector('#mail-user-email');

    // Compose elements
    const composeBtn = winEl.querySelector('#mail-btn-compose');
    const composeDialog = winEl.querySelector('#mail-compose-dialog');
    const composeClose = winEl.querySelector('#compose-dialog-close');
    const composeCancel = winEl.querySelector('#compose-btn-cancel');
    const composeSend = winEl.querySelector('#compose-btn-send');
    const composeTo = winEl.querySelector('#compose-to-select');
    const composeSub = winEl.querySelector('#compose-subject-input');
    const composeBody = winEl.querySelector('#compose-body-textarea');

    // Dynamic player user email
    if (window.state && window.state.player && userEmailEl) {
      const charId = window.state.player.charId || 'char1';
      const emailMap = {
        char1: 'vikram.techlead@omnicorp.internal',
        char2: 'neha.planner@omnicorp.internal',
        char3: 'kabir.research@omnicorp.internal',
        char4: 'josh.architect@omnicorp.internal',
        char5: 'yasharth.architect@omnicorp.internal'
      };
      userEmailEl.textContent = emailMap[charId] || 'yasharth.dev@omnicorp.internal';
    }

    // Update Badges
    const updateBadges = () => {
      const unreadCount = mails.filter(m => !m.isRead).length;
      const pendingTaskCount = mails.filter(m => m.isTask && !m.isCompleted).length;
      if (badgeInbox) {
        badgeInbox.textContent = unreadCount;
        badgeInbox.style.display = unreadCount > 0 ? 'inline-block' : 'none';
      }
      if (badgeTasks) {
        badgeTasks.textContent = pendingTaskCount;
        badgeTasks.className = `pc-mail-badge ${pendingTaskCount > 0 ? 'alert' : 'success'}`;
        badgeTasks.textContent = pendingTaskCount > 0 ? pendingTaskCount : '✓';
      }
      if (badgeSent) {
        badgeSent.textContent = sentMails.length;
      }
    };

    // Render Threads List
    const renderThreadsList = () => {
      let list = [];
      if (currentFolder === 'sent') {
        list = sentMails;
      } else {
        list = mails;
        if (currentFolder === 'tasks') {
          list = list.filter(m => m.isTask);
        }
      }

      // Apply Filter Tabs
      if (currentFolder !== 'sent') {
        if (currentFilter === 'tasks') {
          list = list.filter(m => m.isTask && !m.isCompleted);
        } else if (currentFilter === 'unread') {
          list = list.filter(m => !m.isRead);
        }
      }

      // Apply Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        list = list.filter(m => 
          (m.subject && m.subject.toLowerCase().includes(q)) ||
          (m.senderName && m.senderName.toLowerCase().includes(q)) ||
          (m.category && m.category.toLowerCase().includes(q)) ||
          (m.body && m.body.toLowerCase().includes(q))
        );
      }

      if (list.length === 0) {
        threadsList.innerHTML = `
          <div style="padding: 2.5rem 1.5rem; text-align: center; color: #64748b; font-size: 0.8rem;">
            <span>📭</span><br>No messages found in this view.
          </div>
        `;
        return;
      }

      threadsList.innerHTML = list.map(m => {
        const isSelected = m.id === selectedMailId;
        const unreadClass = !m.isRead ? 'unread' : '';
        const selectedClass = isSelected ? 'selected' : '';

        let tagHtml = '';
        if (m.isTask) {
          tagHtml = m.isCompleted
            ? `<span class="mail-status-tag tag-task-completed">✓ TASK COMPLETED</span>`
            : `<span class="mail-status-tag tag-task-pending">⚡ TASK PENDING</span>`;
        }

        const previewSnippet = m.replies && m.replies.length > 0 
          ? `You: ${m.replies[m.replies.length - 1].text}` 
          : (m.body ? m.body.replace(/<[^>]*>?/gm, '') : '');

        return `
          <div class="pc-mail-item ${selectedClass} ${unreadClass}" data-id="${m.id}">
            <div class="pc-mail-item-header">
              <span class="pc-mail-item-sender">
                <span>${m.senderGlyph || '✉️'}</span> ${escapeHtml(m.senderName)}
              </span>
              <span class="pc-mail-item-time">${m.date || ''}</span>
            </div>
            <div class="pc-mail-item-subject">${escapeHtml(m.subject)}</div>
            <div class="pc-mail-item-preview">${escapeHtml(previewSnippet)}</div>
            <div class="pc-mail-tag-row">
              ${tagHtml}
              ${m.isTask ? `<span class="mail-status-tag tag-reward">💵 +$${m.fundsReward}</span>` : ''}
              <span class="mail-status-tag tag-category">${m.category || 'Direct'}</span>
            </div>
          </div>
        `;
      }).join('');

      // Click binding
      threadsList.querySelectorAll('.pc-mail-item').forEach(el => {
        el.addEventListener('click', () => {
          const id = el.getAttribute('data-id');
          selectEmail(id);
        });
      });
    };

    // Select Email and Render Detail
    const selectEmail = (id) => {
      selectedMailId = id;
      const allList = currentFolder === 'sent' ? sentMails : mails;
      const email = allList.find(m => m.id === id);
      if (!email) {
        readPane.innerHTML = `<div style="padding: 3rem; text-align:center; color:#64748b;">Select an email to view.</div>`;
        return;
      }

      email.isRead = true;
      saveMailState();
      updateBadges();
      renderThreadsList();

      // Render Task Banner
      let bannerHtml = '';
      if (email.isTask) {
        if (!email.isCompleted) {
          bannerHtml = `
            <div class="pc-mail-task-banner pending">
              <div class="task-banner-text">
                <div class="task-banner-heading">⚡ Active Simulation Task Directive</div>
                <div class="task-banner-desc">Reply to this email with the requested engineering deliverables to complete this task.</div>
              </div>
              <div class="task-reward-pill">+${email.xpReward} XP &amp; 💵 +$${email.fundsReward} Cash</div>
            </div>
          `;
        } else {
          bannerHtml = `
            <div class="pc-mail-task-banner completed">
              <div class="task-banner-text">
                <div class="task-banner-heading">✓ Task Completed &amp; Verified by Leadership</div>
                <div class="task-banner-desc">Deliverable logged in Q4 Sprint audit. Milestone reward credited to your account.</div>
              </div>
              <div class="task-reward-pill">✓ +${email.xpReward} XP Awarded</div>
            </div>
          `;
        }
      }

      // Render Thread Replies
      let threadHistoryHtml = '';
      if (email.replies && email.replies.length > 0) {
        threadHistoryHtml = `
          <div class="pc-mail-thread-history">
            <span style="font-size:0.75rem; font-weight:700; color:#94a3b8; text-transform:uppercase;">Thread Activity (${email.replies.length}):</span>
            ${email.replies.map(r => `
              <div class="pc-mail-reply-bubble">
                <div class="reply-bubble-meta">
                  <span>${r.sender === 'me' ? '📤 You (Sent Reply)' : '📥 ' + escapeHtml(r.sender)}</span>
                  <span>${r.time}</span>
                </div>
                <div class="reply-bubble-text">${escapeHtml(r.text)}</div>
              </div>
            `).join('')}
          </div>
        `;
      }

      // Avatar
      const avatarContent = email.senderAvatar 
        ? `<img src="${email.senderAvatar}" alt="${escapeHtml(email.senderName)}" onerror="this.style.display='none'; this.parentElement.textContent='${email.senderGlyph || '✉️'}';" />`
        : `<span>${email.senderGlyph || '✉️'}</span>`;

      // Reply Box UI
      let replyDrawerHtml = '';
      if (currentFolder !== 'sent') {
        const defaultBoxVal = (!email.isCompleted && email.suggestedReply) ? email.suggestedReply : '';
        const btnLabel = email.isCompleted ? 'Send Follow-up Email' : '🚀 Send Email & Complete Task';

        replyDrawerHtml = `
          <div class="pc-mail-reply-drawer">
            <div class="pc-mail-template-pills">
              <span style="font-size:0.72rem; color:#94a3b8; font-weight:700;">Template Fill:</span>
              <button class="mail-pill-btn" id="btn-use-suggested">Suggested Answer</button>
              <button class="mail-pill-btn" id="btn-use-status">Status Report</button>
              <button class="mail-pill-btn" id="btn-use-clear">Clear</button>
            </div>
            <textarea class="pc-mail-reply-box" id="mail-reply-input" placeholder="Type your formal engineering response or sign-off...">${escapeHtml(defaultBoxVal)}</textarea>
            <div class="pc-mail-reply-actions">
              <span style="font-size:0.72rem; color:#64748b;">Press [Send Email] to complete directive in simulation</span>
              <button class="pc-mail-send-btn" id="mail-btn-send-reply">
                <span>✉️</span> ${btnLabel}
              </button>
            </div>
          </div>
        `;
      }

      readPane.innerHTML = `
        <div class="pc-mail-detail-header">
          <div class="pc-mail-detail-title">${escapeHtml(email.subject)}</div>
          <div class="pc-mail-sender-row">
            <div class="pc-mail-sender-info">
              <div class="pc-mail-sender-avatar">${avatarContent}</div>
              <div class="pc-mail-sender-meta">
                <span class="pc-mail-sender-name">${escapeHtml(email.senderName)}</span>
                <span class="pc-mail-sender-sub">${escapeHtml(email.senderDept)} &bull; &lt;${escapeHtml(email.senderEmail)}&gt;</span>
              </div>
            </div>
            <span style="font-size: 0.75rem; color: #94a3b8;">${email.date}</span>
          </div>
        </div>

        ${bannerHtml}

        <div class="pc-mail-body-content">
          ${email.body}
        </div>

        ${threadHistoryHtml}

        ${replyDrawerHtml}
      `;

      // Bind Reply Actions
      const replyBtn = readPane.querySelector('#mail-btn-send-reply');
      const replyInput = readPane.querySelector('#mail-reply-input');
      const btnSuggested = readPane.querySelector('#btn-use-suggested');
      const btnStatus = readPane.querySelector('#btn-use-status');
      const btnClear = readPane.querySelector('#btn-use-clear');

      if (btnSuggested && replyInput) {
        btnSuggested.onclick = () => {
          replyInput.value = email.suggestedReply || 'Acknowledged and approved for production.';
          playSound('click');
        };
      }
      if (btnStatus && replyInput) {
        btnStatus.onclick = () => {
          replyInput.value = 'Status Update: Systems running smoothly at 99.99% uptime. Latency steady under 1ms. All tests passing.';
          playSound('click');
        };
      }
      if (btnClear && replyInput) {
        btnClear.onclick = () => {
          replyInput.value = '';
          playSound('click');
        };
      }

      if (replyBtn && replyInput) {
        replyBtn.onclick = () => {
          const text = replyInput.value.trim();
          if (!text) {
            if (window.showToast) window.showToast('⚠️ Please enter an email response before sending!');
            playSound('error');
            return;
          }
          sendReplyToEmail(email, text);
        };
      }
    };

    // Send Reply & Complete Task Logic
    const sendReplyToEmail = (email, text) => {
      if (!email.replies) email.replies = [];
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      email.replies.push({
        sender: 'me',
        text: text,
        time: `Today, ${nowStr}`
      });

      // Add to sent folder
      sentMails.unshift({
        id: `sent_${Date.now()}`,
        isTask: false,
        isCompleted: true,
        isRead: true,
        folder: 'sent',
        senderName: 'You (Lead Dev)',
        senderDept: 'Assigned Workstation #1',
        senderEmail: userEmailEl ? userEmailEl.textContent : 'yasharth@omnicorp.internal',
        subject: `Re: ${email.subject}`,
        date: `Today, ${nowStr}`,
        category: 'SENT',
        priority: 'Normal',
        body: text.replace(/\n/g, '<br>'),
        replies: []
      });

      const wasPending = email.isTask && !email.isCompleted;
      if (wasPending) {
        email.isCompleted = true;

        // Award XP and Funds
        const xp = email.xpReward || 150;
        const funds = email.fundsReward || 300;

        if (window.state && window.state.player) {
          window.state.player.score = (window.state.player.score || 0) + xp;
          const scoreEl = document.getElementById('stat-score');
          if (scoreEl) scoreEl.textContent = window.state.player.score;
        }
        if (typeof window.addCorporateFunds === 'function') {
          window.addCorporateFunds(funds);
        }

        // Play smartphone pop & success chime
        if (window.soundManager) {
          if (typeof window.soundManager.playPhonePop === 'function') window.soundManager.playPhonePop();
          if (typeof window.soundManager.playSuccess === 'function') window.soundManager.playSuccess();
        }

        // Show Toast
        if (window.showToast) {
          const diffBadge = email.priority === 'Urgent' ? 'P0 HARD' : (email.priority === 'High' ? 'P1 MED' : 'P2 EASY');
          window.showToast(`⭐ +${xp} XP & 💵 +$${funds} Cash Reward [${diffBadge}]! Completed "${email.taskTitle || email.subject}".`);
        }

        // Sync with Smartphone Tasks
        if (window.phoneDevice && typeof window.phoneDevice.getActiveCharId === 'function') {
          const charId = window.phoneDevice.getActiveCharId();
          const tasks = window.phoneDevice.characterTasks[charId] || [];
          const uncompleted = tasks.find(t => !t.completed);
          if (uncompleted) {
            uncompleted.completed = true;
            window.phoneDevice.completedTaskTitles.add(uncompleted.title);
            window.phoneDevice.renderSweTaskList(charId);
            window.phoneDevice.updatePhoneBadge();

            const allDone = tasks.length > 0 && tasks.every(t => t.completed);
            if (allDone && typeof window.phoneDevice.onAllTasksCompleted === 'function') {
              window.phoneDevice.onAllTasksCompleted(charId);
            }
          }
        }
      } else {
        playSound('notify');
        if (window.showToast) {
          window.showToast(`✉️ Email reply delivered to ${email.senderName}!`);
        }
      }

      saveMailState();
      selectEmail(email.id);

      // Automated coworker response after 4.5 seconds
      setTimeout(() => {
        const replyMap = {
          'mail_task_retro': 'Thank you! Reviewed your retrospective submission. Outstanding technical clarity. Keep up the high velocity!',
          'mail_task_rca': 'RCA received and verified. The incident ticket INC-4091 has been marked resolved. Great turnaround!',
          'mail_task_client': 'Confirmed and received. The executive board was very pleased with the sub-millisecond telemetry numbers.',
          'mail_task_security': 'Sign-off received and filed with compliance auditors. SOC2 Type II audit passed.',
          'mail_task_canary': 'ACK token processed. Canary promoted to 100% production traffic. Deployment pipeline green.'
        };
        const replyText = replyMap[email.id] || 'Thanks for the quick response! Logged into team records.';

        email.replies.push({
          sender: email.senderName,
          text: replyText,
          time: `Today, ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        });
        saveMailState();

        if (window.soundManager && typeof window.soundManager.playPhonePop === 'function') {
          window.soundManager.playPhonePop();
        }
        if (window.showToast) {
          window.showToast(`📬 New Reply from ${email.senderName}: "${replyText.substring(0, 48)}..."`);
        }
        if (selectedMailId === email.id) {
          selectEmail(email.id);
        }
      }, 4500);
    };

    // Filter tabs
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.getAttribute('data-filter') || 'all';
        renderThreadsList();
      });
    });

    // Folders
    folderItems.forEach(item => {
      item.addEventListener('click', () => {
        folderItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        currentFolder = item.getAttribute('data-folder') || 'inbox';
        renderThreadsList();
        const first = (currentFolder === 'sent' ? sentMails[0] : mails[0]);
        if (first) selectEmail(first.id);
      });
    });

    // Search bar
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        renderThreadsList();
      });
    }

    // Compose dialog
    if (composeBtn && composeDialog) {
      composeBtn.onclick = () => {
        composeDialog.style.display = 'flex';
        playSound('click');
      };
    }
    if (composeClose && composeDialog) {
      composeClose.onclick = () => { composeDialog.style.display = 'none'; };
    }
    if (composeCancel && composeDialog) {
      composeCancel.onclick = () => { composeDialog.style.display = 'none'; };
    }

    // Quick fill pills in compose
    winEl.querySelectorAll('.mail-pill-btn[data-fill]').forEach(pill => {
      pill.addEventListener('click', () => {
        const fillType = pill.getAttribute('data-fill');
        if (fillType === 'retro') {
          composeSub.value = 'Sprint Retrospective & OKR Deliverables';
          composeBody.value = 'Hi team,\n\nHere are my sprint deliverables:\n- Microservice latency reduced to 0.8ms.\n- Zero open P0 blockers.\n- Ready for Q1 planning.\n\nBest,\nEngineer';
        } else if (fillType === 'status') {
          composeSub.value = 'Engineering Status Report';
          composeBody.value = 'All production pods operating normally. Ingestion queue is at zero backlog. Next deployment scheduled for 2 PM.';
        } else if (fillType === 'rca') {
          composeSub.value = 'Post-Mortem Root Cause Analysis';
          composeBody.value = 'Root Cause: Database connection timeout on burst traffic.\nMitigation: Increased pool capacity and added connection recycling.\nAction Items: Monitoring alerts adjusted.';
        } else if (fillType === 'canary') {
          composeSub.value = 'Canary Deployment Verification & Sign-off';
          composeBody.value = 'ACK_DEPLOY_PROD_CANARY\n\nSynthetic health probes pass. Zero regressions observed. Approved for rollout.';
        }
        playSound('click');
      });
    });

    // Send custom compose
    if (composeSend) {
      composeSend.onclick = () => {
        const to = composeTo.value;
        const sub = composeSub.value.trim() || 'Engineering Directive Update';
        const body = composeBody.value.trim();

        if (!body) {
          if (window.showToast) window.showToast('⚠️ Please write message content before sending!');
          playSound('error');
          return;
        }

        const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const newSent = {
          id: `custom_${Date.now()}`,
          isTask: false,
          isCompleted: true,
          isRead: true,
          folder: 'sent',
          senderName: 'You (Lead Dev)',
          senderDept: 'Assigned Workstation #1',
          senderEmail: userEmailEl ? userEmailEl.textContent : 'yasharth@omnicorp.internal',
          subject: sub,
          date: `Today, ${nowStr}`,
          category: 'SENT',
          priority: 'Normal',
          body: body.replace(/\n/g, '<br>'),
          replies: []
        };

        sentMails.unshift(newSent);
        saveMailState();
        composeDialog.style.display = 'none';

        // Award proactive communication bonus
        const commsBonus = 80;
        if (window.state && window.state.player) {
          window.state.player.score = (window.state.player.score || 0) + commsBonus;
          const scoreEl = document.getElementById('stat-score');
          if (scoreEl) scoreEl.textContent = window.state.player.score;
        }

        // Chimes & toast
        if (window.soundManager && typeof window.soundManager.playPhonePop === 'function') {
          window.soundManager.playPhonePop();
        }
        if (window.showToast) {
          window.showToast(`✉️ Email sent to ${to}! +${commsBonus} XP Communication Bonus.`);
        }

        updateBadges();
      };
    }

    // Initial view
    updateBadges();
    renderThreadsList();
    if (mails[0]) selectEmail(mails[0].id);
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

    // Auto-open Mail on first launch if no other windows open
    if (Object.keys(PC_STATE.windows).length === 0) {
      setTimeout(() => {
        openApp('mail');
      }, 250);
    }
  };

  window.closeWorkstationPC = function () {
    if (!overlay) return;
    PC_STATE.isOpen = false;
    overlay.classList.add('hidden');
    if (PC_STATE.startMenuOpen) toggleStartMenu(false);
    playSound('click');
  };

  // Expose global pcOS API
  window.pcOS = {
    open: window.openWorkstationPC,
    close: window.closeWorkstationPC,
    openApp: openApp,
    openMail: function() {
      window.openWorkstationPC();
      setTimeout(() => openApp('mail'), 220);
    },
    openBrowser: function() {
      window.openWorkstationPC();
      setTimeout(() => openApp('browser'), 220);
    },
    openTerminal: function() {
      window.openWorkstationPC();
      setTimeout(() => openApp('terminal'), 220);
    },
    openSlack: function() {
      window.openWorkstationPC();
      setTimeout(() => openApp('slack'), 220);
    },
    openNotepad: function() {
      window.openWorkstationPC();
      setTimeout(() => openApp('notepad'), 220);
    }
  };

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPCOS);
  } else {
    initPCOS();
  }
})();


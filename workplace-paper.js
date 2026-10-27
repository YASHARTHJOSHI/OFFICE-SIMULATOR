// ====================================================================
// WORKPLACE-PAPER.JS
// High-Tech Modern Workplace Scene powered by Paper.js Vector Graphics
// ====================================================================

(function() {
  'use strict';

  let paperCanvas = null;
  let paperProject = null;
  let isInitialized = false;

  // Animated vector elements
  let holoRing1 = null;
  let holoRing2 = null;
  let holoParticles = [];
  let serverLights = [];
  let whiteboardWave = null;
  let wavePhase = 0;

  // Interactive Whiteboard Modal State
  let modalActive = false;
  let studioPaperProject = null;
  let studioCanvas = null;
  let studioTool = null;
  let currentStudioPath = null;
  let studioMode = 'draw'; // 'draw' or 'waves' or 'nodes'
  let studioColor = '#a855f7';

  // ----------------------------------------------------
  // 1. INITIALIZE PAPER.JS FOR BIG WORKPLACE BACKGROUND
  // ----------------------------------------------------
  function initBigWorkplacePaper() {
    if (isInitialized) return;
    if (typeof paper === 'undefined') {
      console.warn('Paper.js is not loaded yet.');
      return;
    }

    try {
      paperCanvas = document.createElement('canvas');
      paperCanvas.width = 1024;
      paperCanvas.height = 576;

      // Create new Paper scope/project
      paperProject = new paper.Project(paperCanvas);
      paperProject.activate();

      buildVectorWorkplaceArchitecture();
      isInitialized = true;
      console.log('✨ Paper.js Big Workplace Architecture synthesized successfully!');
    } catch (err) {
      console.error('Failed to initialize Paper.js Big Workplace:', err);
    }
  }

  // ----------------------------------------------------
  // 2. VECTOR ARCHITECTURE & INTERIOR BUILDER
  // ----------------------------------------------------
  function buildVectorWorkplaceArchitecture() {
    const P = paper;

    // A. Deep Modern Slate & Indigo Flooring
    const floor = new P.Path.Rectangle(new P.Point(0, 0), new P.Size(1024, 576));
    floor.fillColor = {
      gradient: {
        stops: [['#090d16', 0], ['#0f172a', 0.45], ['#13112b', 1]]
      },
      origin: new P.Point(512, 0),
      destination: new P.Point(512, 576)
    };

    // B. Floor Grid & Tech Conduit Lines
    const gridGroup = new P.Group();
    for (let y = 220; y <= 560; y += 38) {
      const line = new P.Path.Line(new P.Point(0, y), new P.Point(1024, y));
      line.strokeColor = new P.Color(0.2, 0.3, 0.45, 0.22);
      line.strokeWidth = 1;
      gridGroup.addChild(line);
    }
    for (let x = 40; x <= 1000; x += 64) {
      const line = new P.Path.Line(new P.Point(x, 220), new P.Point(x, 560));
      line.strokeColor = new P.Color(0.2, 0.3, 0.45, 0.16);
      line.strokeWidth = 1;
      gridGroup.addChild(line);
    }

    // Glowing Cyan & Violet Floor LED Conduit Tracks
    const conduitTop = new P.Path.Line(new P.Point(20, 255), new P.Point(1004, 255));
    conduitTop.strokeColor = '#06b6d4';
    conduitTop.strokeWidth = 2;
    conduitTop.shadowColor = new P.Color(0.02, 0.71, 0.83, 0.6);
    conduitTop.shadowBlur = 8;

    const conduitMid = new P.Path.Line(new P.Point(150, 420), new P.Point(880, 420));
    conduitMid.strokeColor = '#8b5cf6';
    conduitMid.strokeWidth = 1.5;
    conduitMid.shadowColor = new P.Color(0.55, 0.36, 0.96, 0.5);
    conduitMid.shadowBlur = 6;

    // C. Top Panoramic Glass Window Wall & City Skyline View
    const windowWall = new P.Path.Rectangle(new P.Point(0, 0), new P.Size(1024, 220));
    windowWall.fillColor = {
      gradient: {
        stops: [['#020617', 0], ['#0b132b', 0.6], ['#1e1b4b', 1]]
      },
      origin: new P.Point(512, 0),
      destination: new P.Point(512, 220)
    };

    // Distant Neon City Skyline Silhouettes
    const skyline = new P.Path();
    skyline.moveTo(new P.Point(0, 200));
    const buildings = [
      [30, 90], [55, 90], [65, 120], [105, 120], [120, 70], [160, 70],
      [180, 140], [210, 140], [230, 80], [280, 80], [300, 110], [350, 110],
      [370, 50], [420, 50], [440, 130], [500, 130], [520, 65], [570, 65],
      [590, 115], [640, 115], [660, 75], [720, 75], [740, 125], [790, 125],
      [810, 85], [870, 85], [890, 140], [940, 140], [960, 95], [1024, 95]
    ];
    for (let i = 0; i < buildings.length; i++) {
      skyline.lineTo(new P.Point(buildings[i][0], buildings[i][1]));
    }
    skyline.lineTo(new P.Point(1024, 200));
    skyline.closePath();
    skyline.fillColor = new P.Color(0.04, 0.08, 0.18, 0.85);

    // Window Beacons on Skyscrapers
    for (let i = 0; i < 40; i++) {
      const wx = 30 + (i * 24) % 960;
      const wy = 60 + ((i * 17) % 110);
      const winDot = new P.Path.Rectangle(new P.Point(wx, wy), new P.Size(3, 4));
      winDot.fillColor = i % 3 === 0 ? '#38bdf8' : (i % 3 === 1 ? '#a855f7' : '#fbbf24');
      winDot.opacity = 0.75;
    }

    // Glass Window Columns
    for (let x = 0; x <= 1024; x += 128) {
      const col = new P.Path.Rectangle(new P.Point(x, 0), new P.Size(8, 220));
      col.fillColor = '#1e293b';
      const sheen = new P.Path.Line(new P.Point(x + 12, 10), new P.Point(x + 40, 210));
      sheen.strokeColor = new P.Color(1, 1, 1, 0.08);
      sheen.strokeWidth = 2;
    }
    const windowSill = new P.Path.Rectangle(new P.Point(0, 212), new P.Size(1024, 12));
    windowSill.fillColor = '#0f172a';
    const sillBevel = new P.Path.Line(new P.Point(0, 212), new P.Point(1024, 212));
    sillBevel.strokeColor = '#334155';
    sillBevel.strokeWidth = 2;

    // D. Ceiling Structural Trusses & Pendant Lights
    for (let x = 64; x < 1000; x += 192) {
      const cord = new P.Path.Line(new P.Point(x, 0), new P.Point(x, 48));
      cord.strokeColor = '#475569';
      cord.strokeWidth = 1.5;
      new P.Path.Ellipse({
        point: new P.Point(x - 20, 48),
        size: new P.Size(40, 10),
        fillColor: '#1e293b',
        strokeColor: '#38bdf8',
        strokeWidth: 1.5
      });
      const cone = new P.Path();
      cone.moveTo(new P.Point(x - 18, 55));
      cone.lineTo(new P.Point(x - 65, 220));
      cone.lineTo(new P.Point(x + 65, 220));
      cone.lineTo(new P.Point(x + 18, 55));
      cone.closePath();
      cone.fillColor = {
        gradient: {
          stops: [[new P.Color(0.22, 0.74, 0.97, 0.16), 0], [new P.Color(0.22, 0.74, 0.97, 0.0), 1]]
        },
        origin: new P.Point(x, 55),
        destination: new P.Point(x, 220)
      };
    }

    // E. POD A: Frontend & Mobile Dev Hub (Left Cluster: x: 175, y: 280)
    buildWorkstationPod(P, 175, 280, 'POD A: MOBILE & WEB', '#38bdf8');

    // F. POD B: AI Research & Data Cluster (Center Cluster: x: 475, y: 280)
    buildWorkstationPod(P, 475, 280, 'POD B: CORE ENGINE', '#a855f7');

    // G. POD C: Cloud Infra & Systems (Right Cluster: x: 775, y: 280)
    buildWorkstationPod(P, 775, 280, 'POD C: CLOUD & SRE', '#10b981');

    // H. Central Holographic Innovation Hub (x: 480, y: 445)
    buildCollaborationHub(P, 480, 445);

    // I. Big Paper.js Smart Whiteboard on Top Wall (x: 430, y: 70)
    buildPaperSmartWhiteboard(P, 430, 70, 165, 115);

    // J. Quantum Server Rack in Bottom-Right Corner (x: 920, y: 430)
    buildQuantumServerRack(P, 920, 430);

    // K. Designer Velvet Lounge Pod in Bottom-Left Corner (x: 50, y: 440)
    buildLoungeSectional(P, 50, 440);

    // L. Geometric Planters
    buildGeometricPlanter(P, 30, 250);
    buildGeometricPlanter(P, 975, 250);

    paperProject.view.draw();
  }

  function buildWorkstationPod(P, x, y, label, accentColor) {
    const w = 150;
    const h = 80;

    const shadow = new P.Path.Rectangle(new P.Point(x - 2, y + 25), new P.Size(w + 4, h - 15));
    shadow.fillColor = new P.Color(0, 0, 0, 0.45);

    const deskTop = new P.Path.Rectangle(new P.Point(x, y + 20), new P.Size(w, h - 25));
    deskTop.fillColor = '#1e293b';
    deskTop.strokeColor = accentColor;
    deskTop.strokeWidth = 1.5;

    const rgbBar = new P.Path.Line(new P.Point(x + 2, y + 21), new P.Point(x + w - 2, y + 21));
    rgbBar.strokeColor = accentColor;
    rgbBar.strokeWidth = 2;
    rgbBar.shadowColor = accentColor;
    rgbBar.shadowBlur = 6;

    const mon1 = new P.Path.Rectangle(new P.Point(x + 12, y), new P.Size(56, 32));
    mon1.fillColor = '#020617';
    mon1.strokeColor = '#475569';
    mon1.strokeWidth = 1.5;
    for (let r = 0; r < 4; r++) {
      const codeLine = new P.Path.Line(new P.Point(x + 16, y + 8 + r * 6), new P.Point(x + 35 + (r % 2) * 18, y + 8 + r * 6));
      codeLine.strokeColor = r === 0 ? accentColor : (r === 2 ? '#fbbf24' : '#64748b');
      codeLine.strokeWidth = 1.5;
    }

    const mon2 = new P.Path.Rectangle(new P.Point(x + 78, y), new P.Size(56, 32));
    mon2.fillColor = '#020617';
    mon2.strokeColor = '#475569';
    mon2.strokeWidth = 1.5;
    const chart = new P.Path();
    chart.moveTo(new P.Point(x + 84, y + 25));
    chart.lineTo(new P.Point(x + 94, y + 16));
    chart.lineTo(new P.Point(x + 106, y + 20));
    chart.lineTo(new P.Point(x + 118, y + 10));
    chart.strokeColor = '#10b981';
    chart.strokeWidth = 1.5;

    const kb1 = new P.Path.Rectangle(new P.Point(x + 24, y + 36), new P.Size(32, 12));
    kb1.fillColor = '#0f172a';
    kb1.strokeColor = '#334155';
    kb1.strokeWidth = 1;

    const kb2 = new P.Path.Rectangle(new P.Point(x + 90, y + 36), new P.Size(32, 12));
    kb2.fillColor = '#0f172a';
    kb2.strokeColor = '#334155';
    kb2.strokeWidth = 1;

    new P.Path.Ellipse({
      point: new P.Point(x + 28, y + 54),
      size: new P.Size(24, 18),
      fillColor: '#334155',
      strokeColor: '#64748b',
      strokeWidth: 1.5
    });
    new P.Path.Ellipse({
      point: new P.Point(x + 94, y + 54),
      size: new P.Size(24, 18),
      fillColor: '#334155',
      strokeColor: '#64748b',
      strokeWidth: 1.5
    });

    const text = new P.PointText(new P.Point(x + w / 2, y + h + 8));
    text.content = label;
    text.fillColor = accentColor;
    text.fontFamily = 'Outfit, sans-serif';
    text.fontWeight = 'bold';
    text.fontSize = 8;
    text.justification = 'center';
  }

  function buildCollaborationHub(P, cx, cy) {
    new P.Path.Ellipse({
      point: new P.Point(cx - 75, cy - 20),
      size: new P.Size(150, 60),
      fillColor: new P.Color(0.06, 0.09, 0.16, 0.88),
      strokeColor: '#38bdf8',
      strokeWidth: 2,
      shadowColor: '#38bdf8',
      shadowBlur: 14
    });

    new P.Path.Ellipse({
      point: new P.Point(cx - 28, cy - 4),
      size: new P.Size(56, 26),
      fillColor: '#0369a1',
      strokeColor: '#67e8f9',
      strokeWidth: 1.5
    });

    holoRing1 = new P.Path.Ellipse({
      point: new P.Point(cx - 40, cy - 45),
      size: new P.Size(80, 24),
      strokeColor: '#38bdf8',
      strokeWidth: 1.5,
      dashArray: [6, 4]
    });

    holoRing2 = new P.Path.Ellipse({
      point: new P.Point(cx - 30, cy - 55),
      size: new P.Size(60, 18),
      strokeColor: '#a855f7',
      strokeWidth: 1.5,
      dashArray: [4, 4]
    });

    for (let i = 0; i < 12; i++) {
      const p = new P.Path.Circle(new P.Point(cx - 30 + Math.random() * 60, cy - 60 + Math.random() * 40), 1.8);
      p.fillColor = i % 2 === 0 ? '#38bdf8' : '#c084fc';
      p.opacity = 0.85;
      holoParticles.push({ path: p, baseAngle: i * (Math.PI / 6), speed: 0.03 + Math.random() * 0.02, radius: 20 + Math.random() * 25 });
    }

    const chairPositions = [
      [cx - 85, cy + 5],
      [cx + 65, cy + 5],
      [cx - 35, cy + 28],
      [cx + 15, cy + 28]
    ];
    chairPositions.forEach(([px, py]) => {
      new P.Path.Ellipse({
        point: new P.Point(px, py),
        size: new P.Size(22, 16),
        fillColor: '#1e293b',
        strokeColor: '#475569',
        strokeWidth: 1.5
      });
    });

    const text = new P.PointText(new P.Point(cx, cy + 56));
    text.content = 'SPARK COLLABORATION HUB';
    text.fillColor = '#38bdf8';
    text.fontFamily = 'Outfit, sans-serif';
    text.fontWeight = 'bold';
    text.fontSize = 8.5;
    text.justification = 'center';
  }

  function buildPaperSmartWhiteboard(P, x, y, w, h) {
    const frame = new P.Path.Rectangle(new P.Point(x - 4, y - 4), new P.Size(w + 8, h + 8));
    frame.fillColor = '#0f172a';
    frame.strokeColor = '#a855f7';
    frame.strokeWidth = 2;
    frame.shadowColor = '#a855f7';
    frame.shadowBlur = 12;

    const screen = new P.Path.Rectangle(new P.Point(x, y), new P.Size(w, h));
    screen.fillColor = '#0b0f19';

    const title = new P.PointText(new P.Point(x + 10, y + 16));
    title.content = '🎨 PAPER.JS VECTOR LAB';
    title.fillColor = '#c084fc';
    title.fontFamily = 'Press Start 2P, monospace';
    title.fontSize = 7;

    const hint = new P.PointText(new P.Point(x + w - 10, y + 16));
    hint.content = '[PRESS E]';
    hint.fillColor = '#34d399';
    hint.fontFamily = 'Press Start 2P, monospace';
    hint.fontSize = 6;
    hint.justification = 'right';

    whiteboardWave = new P.Path();
    whiteboardWave.strokeColor = '#38bdf8';
    whiteboardWave.strokeWidth = 2;
    whiteboardWave.shadowColor = '#38bdf8';
    whiteboardWave.shadowBlur = 4;
    for (let i = 0; i <= 6; i++) {
      const px = x + 15 + i * 22;
      const py = y + 55 + Math.sin(i * 1.2) * 16;
      whiteboardWave.add(new P.Point(px, py));
    }
    whiteboardWave.smooth();

    for (let i = 0; i < 4; i++) {
      const nodeX = x + 25 + i * 36;
      const nodeY = y + 88 + (i % 2) * 10;
      const circle = new P.Path.Circle(new P.Point(nodeX, nodeY), 4);
      circle.fillColor = '#a855f7';
      circle.strokeColor = '#f3e8ff';
      circle.strokeWidth = 1;
      if (i > 0) {
        const conn = new P.Path.Line(new P.Point(nodeX - 36, y + 88 + ((i - 1) % 2) * 10), new P.Point(nodeX, nodeY));
        conn.strokeColor = new P.Color(0.66, 0.52, 0.98, 0.5);
        conn.strokeWidth = 1.2;
      }
    }
  }

  function buildQuantumServerRack(P, x, y) {
    const w = 75;
    const h = 95;

    const chassis = new P.Path.Rectangle(new P.Point(x, y), new P.Size(w, h));
    chassis.fillColor = '#0b0f19';
    chassis.strokeColor = '#10b981';
    chassis.strokeWidth = 2;
    chassis.shadowColor = '#10b981';
    chassis.shadowBlur = 8;

    for (let b = 0; b < 6; b++) {
      const by = y + 8 + b * 14;
      const blade = new P.Path.Rectangle(new P.Point(x + 4, by), new P.Size(w - 8, 10));
      blade.fillColor = '#1e293b';
      blade.strokeColor = '#334155';
      blade.strokeWidth = 1;

      for (let l = 0; l < 4; l++) {
        const led = new P.Path.Circle(new P.Point(x + 12 + l * 8, by + 5), 1.5);
        led.fillColor = l === 0 ? '#10b981' : (l === 1 ? '#38bdf8' : '#334155');
        serverLights.push(led);
      }
      const vent = new P.Path.Line(new P.Point(x + 50, by + 5), new P.Point(x + 66, by + 5));
      vent.strokeColor = '#475569';
      vent.strokeWidth = 1.5;
    }

    const text = new P.PointText(new P.Point(x + w / 2, y + h + 10));
    text.content = 'QUANTUM BLADE CLUSTER';
    text.fillColor = '#10b981';
    text.fontFamily = 'Outfit, sans-serif';
    text.fontWeight = 'bold';
    text.fontSize = 7;
    text.justification = 'center';
  }

  function buildLoungeSectional(P, x, y) {
    const sofaBack = new P.Path.Rectangle(new P.Point(x, y), new P.Size(75, 20));
    sofaBack.fillColor = '#312e81';
    sofaBack.strokeColor = '#6366f1';
    sofaBack.strokeWidth = 1.5;

    const sofaSeat = new P.Path.Rectangle(new P.Point(x, y + 20), new P.Size(75, 45));
    sofaSeat.fillColor = '#1e1b4b';
    sofaSeat.strokeColor = '#4f46e5';
    sofaSeat.strokeWidth = 1.5;

    const table = new P.Path.Rectangle(new P.Point(x + 25, y + 72), new P.Size(30, 18));
    table.fillColor = '#0f172a';
    table.strokeColor = '#64748b';
    table.strokeWidth = 1;

    const text = new P.PointText(new P.Point(x + 37, y + 98));
    text.content = 'IDEATION LOUNGE';
    text.fillColor = '#818cf8';
    text.fontFamily = 'Outfit, sans-serif';
    text.fontWeight = 'bold';
    text.fontSize = 7;
    text.justification = 'center';
  }

  function buildGeometricPlanter(P, x, y) {
    const pot = new P.Path();
    pot.moveTo(new P.Point(x, y + 35));
    pot.lineTo(new P.Point(x + 24, y + 35));
    pot.lineTo(new P.Point(x + 20, y + 55));
    pot.lineTo(new P.Point(x + 4, y + 55));
    pot.closePath();
    pot.fillColor = '#1e293b';
    pot.strokeColor = '#38bdf8';
    pot.strokeWidth = 1.5;

    const leaves = [
      [x + 12, y + 28, 12, '#047857'],
      [x + 6, y + 20, 10, '#059669'],
      [x + 18, y + 20, 10, '#10b981'],
      [x + 12, y + 10, 8, '#34d399']
    ];
    leaves.forEach(([lx, ly, r, col]) => {
      new P.Path.Circle({
        point: new P.Point(lx - r, ly - r),
        radius: r,
        fillColor: col
      });
    });
  }

  // ----------------------------------------------------
  // 3. FRAME-BY-FRAME VECTOR ANIMATION UPDATE
  // ----------------------------------------------------
  function updateVectorAnimations() {
    if (!paperProject || !isInitialized) return;
    const time = performance.now() * 0.003;

    if (holoRing1) {
      holoRing1.rotation = Math.sin(time) * 12;
      holoRing1.strokeColor = {
        hue: (time * 40) % 360,
        saturation: 0.8,
        brightness: 0.9
      };
    }
    if (holoRing2) {
      holoRing2.rotation = -Math.cos(time * 0.8) * 15;
    }

    const cx = 480;
    const cy = 445;
    holoParticles.forEach(pt => {
      pt.baseAngle += pt.speed;
      const px = cx + Math.cos(pt.baseAngle) * pt.radius;
      const py = cy - 45 + Math.sin(pt.baseAngle) * (pt.radius * 0.35);
      pt.path.position = new paper.Point(px, py);
    });

    if (whiteboardWave && whiteboardWave.segments.length > 0) {
      wavePhase += 0.05;
      for (let i = 0; i < whiteboardWave.segments.length; i++) {
        const seg = whiteboardWave.segments[i];
        const baseY = 70 + 55;
        seg.point.y = baseY + Math.sin(wavePhase + i * 1.1) * 14;
      }
      whiteboardWave.smooth();
    }

    if (Math.random() < 0.25 && serverLights.length > 0) {
      const idx = Math.floor(Math.random() * serverLights.length);
      const randColor = Math.random() < 0.5 ? '#10b981' : (Math.random() < 0.5 ? '#38bdf8' : '#f43f5e');
      serverLights[idx].fillColor = randColor;
    }

    paperProject.view.draw();
  }

  // ----------------------------------------------------
  // 4. MAIN RENDER FUNCTION FOR GAME ENGINE
  // ----------------------------------------------------
  function renderBigWorkplace(mainCtx) {
    if (!isInitialized) {
      initBigWorkplacePaper();
    }
    if (paperCanvas) {
      updateVectorAnimations();
      mainCtx.drawImage(paperCanvas, 0, 0);
    }
  }

  function getCanvas() {
    if (!isInitialized) {
      initBigWorkplacePaper();
    }
    return paperCanvas;
  }

  // ----------------------------------------------------
  // 5. INTERACTIVE PAPER.JS INNOVATION STUDIO MODAL
  // ----------------------------------------------------
  function openPaperInnovationModal() {
    modalActive = true;
    let modal = document.getElementById('paper-innovation-modal');
    if (!modal) {
      createPaperStudioModal();
      modal = document.getElementById('paper-innovation-modal');
    }
    modal.classList.remove('hidden');

    setTimeout(() => {
      initInteractiveStudioCanvas();
    }, 50);
  }

  function closePaperInnovationModal() {
    modalActive = false;
    const modal = document.getElementById('paper-innovation-modal');
    if (modal) modal.classList.add('hidden');
    if (paperProject) paperProject.activate();
  }

  function createPaperStudioModal() {
    const div = document.createElement('div');
    div.id = 'paper-innovation-modal';
    div.className = 'paper-studio-modal hidden';
    div.innerHTML = `
      <div class="paper-studio-content">
        <div class="paper-studio-header">
          <div class="studio-title-wrap">
            <span class="studio-badge">✨ PAPER.JS VECTOR ENGINE</span>
            <h2>Workplace Innovation & Interactive Vector Board</h2>
          </div>
          <button id="btn-close-paper-studio" class="modal-close-btn">&times;</button>
        </div>

        <div class="paper-studio-toolbar">
          <div class="tool-group">
            <span class="toolbar-label">Mode:</span>
            <button id="btn-tool-draw" class="studio-tool-btn active">✏️ Smooth Spline</button>
            <button id="btn-tool-waves" class="studio-tool-btn">🌊 Harmonic Wave</button>
            <button id="btn-tool-nodes" class="studio-tool-btn">🕸️ Neural Nodes</button>
          </div>
          <div class="tool-group">
            <span class="toolbar-label">Color:</span>
            <button class="color-swatch active" data-color="#a855f7" style="background:#a855f7"></button>
            <button class="color-swatch" data-color="#38bdf8" style="background:#38bdf8"></button>
            <button class="color-swatch" data-color="#34d399" style="background:#34d399"></button>
            <button class="color-swatch" data-color="#f43f5e" style="background:#f43f5e"></button>
            <button class="color-swatch" data-color="#fbbf24" style="background:#fbbf24"></button>
          </div>
          <div class="tool-group">
            <button id="btn-studio-clear" class="studio-action-btn">🗑️ Clear Canvas</button>
            <button id="btn-studio-generate" class="studio-action-btn">⚡ Synthesize Network</button>
          </div>
        </div>

        <div class="paper-studio-canvas-wrap">
          <canvas id="paper-studio-canvas" width="850" height="420"></canvas>
          <div class="paper-studio-tip">💡 Draw vector strokes with your mouse or trackpad. Paper.js automatically computes smooth Bezier splines and tangents in real-time!</div>
        </div>
      </div>
    `;
    document.body.appendChild(div);

    document.getElementById('btn-close-paper-studio').addEventListener('click', closePaperInnovationModal);

    const toolBtns = div.querySelectorAll('.studio-tool-btn');
    toolBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        toolBtns.forEach(b => b.classList.remove('active'));
        e.currentTarget.classList.add('active');
        if (btn.id === 'btn-tool-draw') studioMode = 'draw';
        else if (btn.id === 'btn-tool-waves') {
          studioMode = 'waves';
          generateHarmonicWaves();
        } else if (btn.id === 'btn-tool-nodes') {
          studioMode = 'nodes';
          generateNeuralNetwork();
        }
      });
    });

    const swatches = div.querySelectorAll('.color-swatch');
    swatches.forEach(swatch => {
      swatch.addEventListener('click', (e) => {
        swatches.forEach(s => s.classList.remove('active'));
        e.currentTarget.classList.add('active');
        studioColor = e.currentTarget.dataset.color;
      });
    });

    document.getElementById('btn-studio-clear').addEventListener('click', () => {
      if (studioPaperProject) {
        studioPaperProject.activeLayer.removeChildren();
        studioPaperProject.view.draw();
      }
    });

    document.getElementById('btn-studio-generate').addEventListener('click', () => {
      generateNeuralNetwork();
    });
  }

  function initInteractiveStudioCanvas() {
    studioCanvas = document.getElementById('paper-studio-canvas');
    if (!studioCanvas) return;

    if (!studioPaperProject) {
      studioPaperProject = new paper.Project(studioCanvas);
    }
    studioPaperProject.activate();

    studioTool = new paper.Tool();
    studioTool.minDistance = 6;

    studioTool.onMouseDown = function(event) {
      currentStudioPath = new paper.Path();
      currentStudioPath.strokeColor = studioColor;
      currentStudioPath.strokeWidth = 3.5;
      currentStudioPath.strokeCap = 'round';
      currentStudioPath.shadowColor = studioColor;
      currentStudioPath.shadowBlur = 8;
      currentStudioPath.add(event.point);
    };

    studioTool.onMouseDrag = function(event) {
      if (currentStudioPath) {
        currentStudioPath.add(event.point);
      }
    };

    studioTool.onMouseUp = function(event) {
      if (currentStudioPath) {
        currentStudioPath.smooth({ type: 'continuous' });
        currentStudioPath = null;
      }
    };

    generateNeuralNetwork();
  }

  function generateHarmonicWaves() {
    if (!studioPaperProject) return;
    studioPaperProject.activate();
    studioPaperProject.activeLayer.removeChildren();

    const colors = ['#38bdf8', '#818cf8', '#c084fc', '#f43f5e', '#34d399'];
    for (let w = 0; w < 5; w++) {
      const path = new paper.Path();
      path.strokeColor = colors[w];
      path.strokeWidth = 2.5;
      path.shadowColor = colors[w];
      path.shadowBlur = 6;
      for (let x = 0; x <= 850; x += 35) {
        const y = 210 + Math.sin(x * 0.015 + w * 0.8) * (50 + w * 12);
        path.add(new paper.Point(x, y));
      }
      path.smooth();
    }
    studioPaperProject.view.draw();
  }

  function generateNeuralNetwork() {
    if (!studioPaperProject) return;
    studioPaperProject.activate();
    studioPaperProject.activeLayer.removeChildren();

    const nodes = [];
    const count = 28;
    for (let i = 0; i < count; i++) {
      const pt = new paper.Point(40 + Math.random() * 770, 40 + Math.random() * 340);
      nodes.push(pt);
    }

    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dist = nodes[i].getDistance(nodes[j]);
        if (dist < 140) {
          const line = new paper.Path.Line(nodes[i], nodes[j]);
          line.strokeColor = new paper.Color(0.66, 0.45, 0.98, (1 - dist / 140) * 0.7);
          line.strokeWidth = 1.2;
        }
      }
    }

    nodes.forEach((pt, idx) => {
      const circle = new paper.Path.Circle(pt, 5 + (idx % 3) * 2);
      const col = idx % 2 === 0 ? studioColor : '#38bdf8';
      circle.fillColor = col;
      circle.shadowColor = col;
      circle.shadowBlur = 8;
    });

    studioPaperProject.view.draw();
  }

  window.workplacePaper = {
    init: initBigWorkplacePaper,
    render: renderBigWorkplace,
    getCanvas: getCanvas,
    openStudio: openPaperInnovationModal,
    closeStudio: closePaperInnovationModal
  };

})();

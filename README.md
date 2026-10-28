# 🏢 Corporate Ladder: 2D Office Simulator
           
A retro 2D pixel-art office adventure built with HTML5 Canvas, Vanilla JavaScript, CSS, and the Web Audio API.

Explore the office floor, interact with coworkers' workstations, drink from water coolers, inspect company policies, and enter the executive door to meet the Boss in his private suite.
best game ever:)
---

## 🎮 Game Features

- **Pixel-Art Environments**:
  - **Main Office Hall**: 3/4 top-down view with cubicles, dual-monitor workstations, water coolers, bookshelves, clock, and the executive wooden door.
  - **Boss's Executive Cabinet**: Rich 2.5D side-view executive office with mahogany wainscoting, CRT monitor desk, filing cabinets, and moving boxes.
- **Main Character**:
  - Smooth 60 FPS 4-directional walking animations (down, left, right, and custom back-view).
  - Compact collision footbox with anti-stuck sliding physics.
  - Click-to-Move / Tap-to-Move support with animated target pulse.
- **The Boss**:
  - Full-body pixel-art executive in a navy blue suit and red tie.
  - Positioned beside his executive desk with subtle breathing animation.
  - Interactive branching dialogue system with typewriter sound effects and character portrait.
- **Seamless Room Transitions**:
  - Walk up to the wooden door at the top of the office to enter the Boss's Cabinet.
  - Enter and exit smoothly through the right door archway.
- **Synthesized Web Audio**:
  - Zero-latency sound effects generated in real-time via Web Audio API (footsteps, wooden door creaks, water bubbles, interaction chimes, and retro text blips).

---

## 🕹️ Controls

| Action | Controls |
| :--- | :--- |
| **Move Character** | <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> or <kbd>Arrow Keys</kbd> |
| **Sprint / Run** | Hold <kbd>Shift</kbd> |
| **Interact / Open Door** | <kbd>E</kbd> or <kbd>Space</kbd> or Walk directly into doors |
| **Mouse / Touch** | Click anywhere on the floor to walk there, or use on-screen D-Pad |
| **Toggle Audio** | <kbd>M</kbd> or Sound button in header |
| **Fullscreen** | <kbd>F</kbd> |
| **Help Modal** | <kbd>H</kbd> |

---

## 🚀 Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/YASHARTHJOSHI/OFFICE-SIMULATOR.git
   cd OFFICE-SIMULATOR
   ```

2. Start any static web server:
   ```bash
   python -m http.server 3000
   ```
   *or with Node.js:*
   ```bash
   npx serve .
   ```

3. Open your browser and navigate to `http://localhost:3000`.

---

## 📁 Project Structure

```
├── index.html            # Main markup and UI overlays
├── style.css             # Modern dark mode design and retro typography
├── main.js               # Canvas game loop, physics, animations, and scenes
├── audio.js              # Web Audio API sound effect synthesizer
├── assets/
│   ├── office_hall.png   # Main Office Hall environment
│   ├── boss_cabinet.png  # Executive Cabinet environment
│   ├── boss_character.png# Full-body Boss sprite
│   ├── boss_portrait.png # Boss dialogue avatar
│   ├── character_idle.png# Main character sprite
│   ├── spritesheet.png   # 4-direction character walk cycle
│   └── player_portrait.png
└── README.md
```

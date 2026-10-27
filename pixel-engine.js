/**
 * PixelEngine.js - Retro 2D Pixel Graphics & Physics Enhancement Library
 * Includes:
 * 1. Pixel Particle System (dust puffs on footsteps, golden embers, water sparkles)
 * 2. Pixel-Perfect Ambient Lighting & Vignette Overlay
 * 3. Retro CRT Scanline Shader Toggle
 * 4. Sub-pixel Anti-Jitter & Smooth Corner Sliding Physics
 */

class PixelParticleEngine {
  constructor() {
    this.particles = [];
    this.maxParticles = 120;
  }

  /**
   * Spawn footstep dust particles behind character feet
   */
  spawnFootstepDust(x, y, isSprint = false, isTile = false) {
    const count = isSprint ? 4 : 2;
    const baseColor = isTile ? 'rgba(210, 220, 235,' : 'rgba(180, 160, 140,';

    for (let i = 0; i < count; i++) {
      if (this.particles.length >= this.maxParticles) {
        this.particles.shift();
      }
      this.particles.push({
        x: Math.round(x + (Math.random() - 0.5) * 12),
        y: Math.round(y - 1 + (Math.random() - 0.5) * 3),
        vx: (Math.random() - 0.5) * (isSprint ? 35 : 18),
        vy: -Math.random() * (isSprint ? 22 : 12),
        size: Math.random() > 0.5 ? 2 : 3,
        colorPrefix: baseColor,
        alpha: 0.65,
        decay: 1.8 + Math.random() * 1.5
      });
    }
  }

  /**
   * Spawn golden glowing embers above interactive triggers
   */
  spawnEmbers(x, y) {
    if (Math.random() > 0.4) return;
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift();
    }
    this.particles.push({
      x: Math.round(x + (Math.random() - 0.5) * 14),
      y: Math.round(y + (Math.random() - 0.5) * 8),
      vx: (Math.random() - 0.5) * 10,
      vy: -18 - Math.random() * 16,
      size: Math.random() > 0.6 ? 2 : 1,
      colorPrefix: 'rgba(245, 158, 11,',
      alpha: 0.85,
      decay: 1.2 + Math.random() * 0.8
    });
  }

  /**
   * Spawn blue water droplets near cooler
   */
  spawnWaterSparkles(x, y) {
    if (Math.random() > 0.3) return;
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift();
    }
    this.particles.push({
      x: Math.round(x + (Math.random() - 0.5) * 16),
      y: Math.round(y + (Math.random() - 0.5) * 8),
      vx: (Math.random() - 0.5) * 8,
      vy: -12 - Math.random() * 12,
      size: 2,
      colorPrefix: 'rgba(56, 189, 248,',
      alpha: 0.8,
      decay: 1.5
    });
  }

  /**
   * Spawn glowing retro typing particles from keyboard/terminal when sitting at desk
   */
  spawnTypingParticles(x, y) {
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift();
    }
    this.particles.push({
      x: Math.round(x + (Math.random() - 0.5) * 16),
      y: Math.round(y + (Math.random() - 0.5) * 4),
      vx: (Math.random() - 0.5) * 16,
      vy: -14 - Math.random() * 12,
      size: 2,
      colorPrefix: Math.random() > 0.5 ? 'rgba(56, 189, 248,' : 'rgba(16, 185, 129,',
      alpha: 0.9,
      decay: 1.8
    });
  }

  /**
   * Spawn warm white coffee/food steam puffs rising from dining table
   */
  spawnCoffeeSteam(x, y) {
    if (Math.random() > 0.4) return;
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift();
    }
    this.particles.push({
      x: Math.round(x + (Math.random() - 0.5) * 10),
      y: Math.round(y + (Math.random() - 0.5) * 4),
      vx: (Math.random() - 0.5) * 6,
      vy: -14 - Math.random() * 10,
      size: Math.random() > 0.5 ? 3 : 2,
      colorPrefix: 'rgba(255, 255, 255,',
      alpha: 0.85,
      decay: 0.9 + Math.random() * 0.4
    });
  }

  /**
   * Spawn microscopic sunbeam dust motes drifting in window daylight
   */
  spawnSunbeamDust() {
    if (Math.random() > 0.3) return;
    if (this.particles.length >= this.maxParticles) {
      this.particles.shift();
    }
    this.particles.push({
      x: Math.round(40 + Math.random() * 660),
      y: Math.round(8 + Math.random() * 95),
      vx: 4 + Math.random() * 8,
      vy: 2 + Math.random() * 4,
      size: 1,
      colorPrefix: 'rgba(255, 255, 255,',
      alpha: 0.65,
      decay: 0.45 + Math.random() * 0.35
    });
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.alpha -= p.decay * dt;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }

  render(ctx) {
    if (this.particles.length === 0) return;
    ctx.save();
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const px = Math.round(p.x);
      const py = Math.round(p.y);
      const alpha = Math.max(0, Math.min(1, p.alpha));

      ctx.fillStyle = `${p.colorPrefix} ${alpha})`;
      ctx.fillRect(px, py, p.size, p.size);
    }
    ctx.restore();
  }
}

class PixelEngine {
  constructor() {
    this.particles = new PixelParticleEngine();
    this.crtEnabled = false;
    this.ambientLighting = true;
  }

  /**
   * Render ambient office lighting overlay
   */
  renderAmbientLighting(ctx, width, height, currentScene) {
    if (!this.ambientLighting) return;

    ctx.save();
    // Warm office vignette
    const gradient = ctx.createRadialGradient(
      width / 2, height / 2, width * 0.35,
      width / 2, height / 2, width * 0.65
    );
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    gradient.addColorStop(1, 'rgba(8, 12, 22, 0.28)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Warm lamp highlight in Corner Office or Boss Cabinet
    if (currentScene === 'CORNER_OFFICE') {
      const lampGlow = ctx.createRadialGradient(325, 430, 10, 325, 430, 160);
      lampGlow.addColorStop(0, 'rgba(253, 230, 138, 0.12)');
      lampGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = lampGlow;
      ctx.fillRect(0, 0, width, height);
    } else if (currentScene === 'BOSS_CABINET') {
      const bossGlow = ctx.createRadialGradient(450, 420, 10, 450, 420, 180);
      bossGlow.addColorStop(0, 'rgba(251, 191, 36, 0.1)');
      bossGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = bossGlow;
      ctx.fillRect(0, 0, width, height);
    } else if (currentScene === 'BIG_WORKPLACE') {
      // 1. Natural daylight bleed from top panoramic skyscraper windows
      const daylight = ctx.createLinearGradient(0, 0, 0, 180);
      daylight.addColorStop(0, 'rgba(186, 230, 253, 0.09)');
      daylight.addColorStop(0.6, 'rgba(224, 242, 254, 0.04)');
      daylight.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = daylight;
      ctx.fillRect(0, 0, width, 180);

      // 2. Stage presentation spotlight & keynote focus
      const stageSpotlight = ctx.createRadialGradient(880, 290, 50, 880, 310, 220);
      stageSpotlight.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
      stageSpotlight.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = stageSpotlight;
      ctx.fillRect(740, 180, 284, 396);
    }

    ctx.restore();
  }

  /**
   * Render authentic CRT terminal phosphor glows, desk lamp cones, and particle routines for Big Workplace
   */
  renderBigWorkplacePixelEffects(ctx, isPlayerSitting, playerX, playerY) {
    const now = performance.now();
    const pulse = (Math.sin(now * 0.0035) + 1) * 0.5;

    ctx.save();

    // 1. CRT Green Phosphor Terminal Screen Glows (Dev Pods)
    ctx.fillStyle = `rgba(16, 185, 129, ${0.08 + pulse * 0.05})`;
    ctx.fillRect(108, 442, 42, 30);
    ctx.fillRect(312, 442, 42, 30);
    ctx.fillRect(516, 442, 42, 30);

    // CRT Back Window Row Screens
    ctx.fillStyle = `rgba(16, 185, 129, ${0.05 + pulse * 0.03})`;
    ctx.fillRect(168, 77, 28, 20);
    ctx.fillRect(324, 77, 28, 20);
    ctx.fillRect(434, 77, 28, 20);
    ctx.fillRect(590, 77, 28, 20);

    // 2. Desk Lamp Warm Incandescent Cones on Dev Pods
    const lampGlow1 = ctx.createRadialGradient(88, 445, 4, 88, 445, 55);
    lampGlow1.addColorStop(0, 'rgba(253, 230, 138, 0.12)');
    lampGlow1.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = lampGlow1;
    ctx.fillRect(35, 395, 110, 100);

    const lampGlow2 = ctx.createRadialGradient(292, 445, 4, 292, 445, 55);
    lampGlow2.addColorStop(0, 'rgba(253, 230, 138, 0.12)');
    lampGlow2.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = lampGlow2;
    ctx.fillRect(240, 395, 110, 100);

    const lampGlow3 = ctx.createRadialGradient(496, 445, 4, 496, 445, 55);
    lampGlow3.addColorStop(0, 'rgba(253, 230, 138, 0.12)');
    lampGlow3.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = lampGlow3;
    ctx.fillRect(445, 395, 110, 100);

    // 3. Stage Keynote Projector Glow
    ctx.fillStyle = `rgba(6, 182, 212, ${0.06 + pulse * 0.04})`;
    ctx.fillRect(787, 222, 235, 155);

    // 4. Espresso Machines Dual Steam
    if (Math.random() < 0.28) {
      this.particles.spawnCoffeeSteam(790, 85);
    }
    if (Math.random() < 0.28) {
      this.particles.spawnCoffeeSteam(830, 85);
    }

    // 5. Water Cooler Sparkling Droplets
    if (Math.random() < 0.15) {
      this.particles.spawnWaterSparkles(738, 365);
    }

    // 6. Microscopic Sunbeam Dust Motes across Panoramic Windows
    if (Math.random() < 0.35) {
      this.particles.spawnSunbeamDust();
    }

    // 7. Developer Typing Code Sparks when sitting at Pod
    if (isPlayerSitting && playerY > 400 && Math.random() < 0.45) {
      this.particles.spawnTypingParticles(playerX, playerY - 14);
    }

    ctx.restore();
  }

  /**
   * Retro CRT Scanline Shader Overlay
   */
  renderCRTScanlines(ctx, width, height) {
    if (!this.crtEnabled) return;

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
    for (let y = 0; y < height; y += 3) {
      ctx.fillRect(0, y, width, 1);
    }
    ctx.restore();
  }

  toggleCRT() {
    this.crtEnabled = !this.crtEnabled;
    return this.crtEnabled;
  }
}

// Global Singleton
window.pixelEngine = new PixelEngine();

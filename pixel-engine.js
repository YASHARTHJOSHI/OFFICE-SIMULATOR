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

// Gobble Dash — the turkey you play.
// One job: the turkey's movement, its states, and how it looks.

import { GRAVITY, GROUND_Y, JUMP_VELOCITY, PLAYER } from './config.js';

export class Turkey {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 300;
    this.y = GROUND_Y - PLAYER.height;
    this.vy = 0;
    this.width = PLAYER.width;
    this.height = PLAYER.height;
    this.onGround = true;
    this.hiding = false;
    this.dashing = false;
    this.stamina = 100;
    this.invulnerableUntil = 0;
    this.stumbleUntil = 0;
    this.runCycle = 0;
    this.lives = PLAYER.maxLives;
  }

  get invulnerable() {
    return performance.now() < this.invulnerableUntil;
  }

  get stumbling() {
    return performance.now() < this.stumbleUntil;
  }

  get hiddenHeight() {
    return 40;
  }

  jump(sounds) {
    if (!this.onGround || this.hiding) return false;
    this.vy = JUMP_VELOCITY;
    this.onGround = false;
    sounds.jump();
    return true;
  }

  update(dt, input, sounds) {
    const now = performance.now();
    this.hiding = input.hide && this.onGround && !this.stumbling;

    // Dash drains stamina; standing still refills it.
    this.dashing = input.dash && this.stamina > 5 && !this.hiding && !this.stumbling;
    if (this.dashing) {
      this.stamina = Math.max(0, this.stamina - PLAYER.dashDrainPerSecond * dt);
      if (this.stamina <= 0) sounds.dash();
    } else {
      this.stamina = Math.min(100, this.stamina + PLAYER.dashRegenPerSecond * dt);
    }

    this.vy += GRAVITY * dt;
    this.y += this.vy * dt;
    if (this.y >= GROUND_Y - this.height) {
      this.y = GROUND_Y - this.height;
      this.vy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    this.runCycle += dt * (this.dashing ? 22 : 13);
    void now;
  }

  hurt(seconds) {
    this.lives -= 1;
    this.invulnerableUntil = performance.now() + PLAYER.invulnerableSeconds * 1000;
    this.stumbleUntil = performance.now() + seconds * 1000;
  }

  // Axis-aligned box used for collisions; smaller than the drawing.
  get box() {
    const h = this.hiding ? this.hiddenHeight : this.height;
    return {
      x: this.x + 10,
      y: this.y + (this.height - h),
      w: this.width - 20,
      h: h - 6,
    };
  }

  draw(ctx, time) {
    const flicker = this.invulnerable && Math.floor(time * 14) % 2 === 0;
    if (flicker) ctx.globalAlpha = 0.35;
    const x = this.x;
    const y = this.y;
    const squash = this.hiding ? 0.62 : 1;
    const bob = this.onGround ? Math.sin(this.runCycle) * 3 : 0;

    ctx.save();
    ctx.translate(x + this.width / 2, y + this.height);
    ctx.scale(1, squash);
    ctx.translate(0, -this.height + bob);

    // Fanned tail feathers.
    ctx.fillStyle = '#7a4a21';
    for (let i = -2; i <= 2; i += 1) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 9);
      ctx.beginPath();
      ctx.ellipse(-14, -34, 7, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = '#d94f2b';
    for (let i = -2; i <= 2; i += 1) {
      ctx.save();
      ctx.rotate((i * Math.PI) / 9);
      ctx.beginPath();
      ctx.ellipse(-14, -50, 4, 7, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Body.
    ctx.fillStyle = '#8a5a2b';
    ctx.beginPath();
    ctx.ellipse(0, -26, 26, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a06a35';
    ctx.beginPath();
    ctx.ellipse(0, -22, 20, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Wing.
    ctx.fillStyle = '#6e4423';
    ctx.beginPath();
    ctx.ellipse(-6, -26, 14, 10, -0.4 + Math.sin(this.runCycle) * 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Head and neck.
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(14, -52, 10, 26);
    ctx.fillStyle = '#e8d8b0';
    ctx.beginPath();
    ctx.arc(20, -56, 11, 0, Math.PI * 2);
    ctx.fill();
    // Beak.
    ctx.fillStyle = '#e8a33d';
    ctx.beginPath();
    ctx.moveTo(28, -58);
    ctx.lineTo(42, -54);
    ctx.lineTo(28, -50);
    ctx.closePath();
    ctx.fill();
    // Wattle.
    ctx.fillStyle = '#d94f2b';
    ctx.beginPath();
    ctx.ellipse(26, -46, 4, 7, 0.3, 0, Math.PI * 2);
    ctx.fill();
    // Panicked eye.
    ctx.fillStyle = '#1c1c1c';
    ctx.beginPath();
    ctx.arc(23, -59, 3.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(24, -60, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Legs.
    ctx.strokeStyle = '#e8a33d';
    ctx.lineWidth = 4;
    const step = this.onGround ? Math.sin(this.runCycle) * 8 : 4;
    ctx.beginPath();
    ctx.moveTo(-6, -4);
    ctx.lineTo(-6 + step, 0);
    ctx.moveTo(8, -4);
    ctx.lineTo(8 - step, 0);
    ctx.stroke();

    ctx.restore();
    ctx.globalAlpha = 1;
  }
}

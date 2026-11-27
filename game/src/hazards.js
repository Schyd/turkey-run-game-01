// Gobble Dash — everything the turkey must dodge or collect.
// One job: hazards and pickups, their spawning, motion and drawing.

import { GROUND_Y, HAZARD_KINDS } from './config.js';

let nextId = 1;

export class Hazard {
  constructor(kind, x, y, speed) {
    this.id = nextId;
    nextId += 1;
    this.kind = kind;
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.vy = 0;
    this.spin = 0;
    this.passed = false;
    this.wobble = Math.random() * Math.PI * 2;
    if (kind === 'fence') {
      this.w = 46;
      this.h = 58;
    } else if (kind === 'knife') {
      this.w = 64;
      this.h = 18;
    } else if (kind === 'pumpkin') {
      this.w = 56;
      this.h = 48;
    } else {
      this.w = 110;
      this.h = 78;
    }
  }

  update(dt, scrollSpeed) {
    if (this.kind === 'knife' && this.vy !== 0) {
      // Falling knife: drops fast, then slides along the ground.
      this.vy += 2600 * dt;
      this.y += this.vy * dt;
      this.spin += dt * 9;
      if (this.y > GROUND_Y - this.h) {
        this.y = GROUND_Y - this.h;
        this.vy = 0;
      }
    } else if (this.kind === 'pumpkin') {
      this.spin += dt * 7;
    }
    this.x -= scrollSpeed * dt;
    this.wobble += dt * 5;
  }

  get box() {
    return { x: this.x + 6, y: this.y + 4, w: this.w - 12, h: this.h - 8 };
  }

  draw(ctx) {
    const { x, y, w, h } = this;
    if (this.kind === 'fence') {
      ctx.fillStyle = '#7a4a21';
      ctx.fillRect(x, y + 8, 6, h - 8);
      ctx.fillRect(x + w - 6, y + 8, 6, h - 8);
      ctx.fillStyle = '#a06a35';
      ctx.fillRect(x - 4, y + 12, w + 8, 9);
      ctx.fillRect(x - 4, y + 32, w + 8, 9);
    } else if (this.kind === 'knife') {
      ctx.save();
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate(this.vy !== 0 ? this.spin : -0.5);
      ctx.fillStyle = '#c8ccd4';
      ctx.beginPath();
      ctx.moveTo(-32, -4);
      ctx.lineTo(14, -8);
      ctx.lineTo(32, 0);
      ctx.lineTo(14, 8);
      ctx.lineTo(-32, 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#5a3a1a';
      ctx.fillRect(-32, -5, 16, 10);
      ctx.restore();
    } else if (this.kind === 'pumpkin') {
      ctx.save();
      ctx.translate(x + w / 2, y + h / 2);
      ctx.rotate(this.spin * 0.35);
      ctx.fillStyle = '#e07b39';
      ctx.beginPath();
      ctx.ellipse(0, 0, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b85c1e';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, 0, w / 4, h / 2, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = '#4a7a2b';
      ctx.fillRect(-3, -h / 2 - 8, 6, 12);
      ctx.restore();
    } else {
      // Oven: a hot kitchen oven with a glowing door.
      ctx.fillStyle = '#3a3a3a';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = '#555555';
      ctx.fillRect(x + 6, y + 6, w - 12, h - 12);
      const glow = 0.6 + Math.sin(this.wobble) * 0.25;
      ctx.fillStyle = `rgba(255, 120, 30, ${glow})`;
      ctx.fillRect(x + 18, y + 22, w - 36, h - 38);
      ctx.fillStyle = '#1c1c1c';
      ctx.fillRect(x + 18, y + 22, w - 36, 6);
      ctx.fillStyle = '#e8a33d';
      ctx.beginPath();
      ctx.arc(x + w / 2, y + 12, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ff5a1e';
      ctx.font = 'bold 13px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('HOT!', x + w / 2, y - 8);
    }
  }
}

export class Pickup {
  constructor(kind, x, y) {
    this.kind = kind;
    this.x = x;
    this.y = y;
    this.taken = false;
    this.bob = Math.random() * Math.PI * 2;
  }

  update(dt, scrollSpeed) {
    this.x -= scrollSpeed * dt;
    this.bob += dt * 4;
  }

  get box() {
    return { x: this.x - 16, y: this.y - 16, w: 32, h: 32 };
  }

  draw(ctx) {
    const bobY = Math.sin(this.bob) * 5;
    ctx.save();
    ctx.translate(this.x, this.y + bobY);
    if (this.kind === 'corn') {
      ctx.fillStyle = '#e8c85a';
      ctx.beginPath();
      ctx.ellipse(0, 0, 10, 16, 0.3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#b89a2e';
      ctx.lineWidth = 2;
      for (let i = -1; i <= 1; i += 1) {
        ctx.beginPath();
        ctx.moveTo(-6 + i * 6, -12);
        ctx.lineTo(-6 + i * 6, 12);
        ctx.stroke();
      }
      ctx.fillStyle = '#4a7a2b';
      ctx.beginPath();
      ctx.ellipse(0, 14, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.kind === 'pie') {
      ctx.fillStyle = '#c98a3d';
      ctx.beginPath();
      ctx.moveTo(-16, 8);
      ctx.lineTo(16, 8);
      ctx.lineTo(12, -8);
      ctx.lineTo(-12, -8);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#d94f2b';
      ctx.beginPath();
      ctx.arc(0, -8, 10, Math.PI, 0);
      ctx.fill();
    } else {
      // Golden feather: a rare extra life.
      ctx.fillStyle = '#e8c85a';
      ctx.beginPath();
      ctx.ellipse(0, 0, 7, 18, 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff3c8';
      ctx.beginPath();
      ctx.ellipse(-2, -4, 3, 10, 0.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }
}

// Picks what spawns next, weighted by stage: the kitchen adds ovens,
// the barn adds falling knives, the farmyard starts gentle.
export function pickSpawn(stageIndex, distanceMeters) {
  const roll = Math.random();
  if (stageIndex === 2) {
    if (roll < 0.24) return 'oven';
    if (roll < 0.5) return 'knife';
    if (roll < 0.72) return 'pumpkin';
    if (roll < 0.9) return 'fence';
    return 'corn';
  }
  if (stageIndex === 1) {
    if (roll < 0.3) return 'knife';
    if (roll < 0.55) return 'pumpkin';
    if (roll < 0.8) return 'fence';
    return 'corn';
  }
  if (roll < 0.45) return 'fence';
  if (roll < 0.7) return 'pumpkin';
  if (roll < 0.85) return 'knife';
  return 'corn';
}

export function spawnFor(kind, stageIndex) {
  const x = 1320;
  if (kind === 'corn') {
    const pickups = [];
    for (let i = 0; i < 3; i += 1) {
      pickups.push(new Pickup('corn', x + i * 46, GROUND_Y - 120 - (i === 1 ? 46 : 0)));
    }
    return { hazards: [], pickups };
  }
  if (kind === 'knife' && stageIndex >= 1 && Math.random() < 0.5) {
    const knife = new Hazard('knife', x, 120, 0);
    knife.vy = 60;
    return { hazards: [knife], pickups: [] };
  }
  if (kind === 'knife') {
    return { hazards: [new Hazard('knife', x, GROUND_Y - 100, 0)], pickups: [] };
  }
  if (kind === 'oven') {
    return { hazards: [new Hazard('oven', x, GROUND_Y - 78, 0)], pickups: [] };
  }
  if (kind === 'pumpkin') {
    return { hazards: [new Hazard('pumpkin', x, GROUND_Y - 48, 0)], pickups: [] };
  }
  return { hazards: [new Hazard('fence', x, GROUND_Y - 58, 0)], pickups: [] };
}

export function boxesOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

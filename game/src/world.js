// Gobble Dash — the world the turkey runs through.
// One job: stages, distance, and the scrolling farm-to-kitchen scenery.

import { CANVAS_HEIGHT, CANVAS_WIDTH, ESCAPE_DISTANCE_METERS, GROUND_Y, PIXELS_PER_METER, STAGES } from './config.js';

export class World {
  constructor() {
    this.reset();
  }

  reset() {
    this.distancePx = 0;
    this.scrollX = 0;
    this.stageIndex = 0;
    this.stageBannerUntil = 0;
    this.clouds = [];
    for (let i = 0; i < 6; i += 1) {
      this.clouds.push({ x: Math.random() * CANVAS_WIDTH, y: 50 + Math.random() * 110, speed: 8 + Math.random() * 14 });
    }
  }

  get distanceMeters() {
    return Math.floor(this.distancePx / PIXELS_PER_METER);
  }

  get stage() {
    return STAGES[this.stageIndex];
  }

  get escaped() {
    return this.distanceMeters >= ESCAPE_DISTANCE_METERS;
  }

  update(dt, scrollSpeed, time) {
    this.distancePx += scrollSpeed * dt;
    this.scrollX += scrollSpeed * dt;
    const meters = this.distanceMeters;
    let next = 0;
    for (let i = 0; i < STAGES.length; i += 1) {
      if (meters >= STAGES[i].startMeters) next = i;
    }
    if (next !== this.stageIndex) {
      this.stageIndex = next;
      this.stageBannerUntil = time + 2.2;
    }
    for (const cloud of this.clouds) {
      cloud.x -= cloud.speed * dt;
      if (cloud.x < -140) {
        cloud.x = CANVAS_WIDTH + 60;
        cloud.y = 50 + Math.random() * 110;
      }
    }
  }

  draw(ctx, time) {
    const palette = this.stage.palette;
    const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
    sky.addColorStop(0, palette.skyTop);
    sky.addColorStop(1, palette.skyBottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);

    // Sun.
    ctx.fillStyle = '#fff3c8';
    ctx.beginPath();
    ctx.arc(1080, 96, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe98a';
    ctx.beginPath();
    ctx.arc(1080, 96, 36, 0, Math.PI * 2);
    ctx.fill();

    // Clouds.
    ctx.fillStyle = 'rgba(255, 250, 235, 0.9)';
    for (const cloud of this.clouds) {
      ctx.beginPath();
      ctx.ellipse(cloud.x, cloud.y, 52, 20, 0, 0, Math.PI * 2);
      ctx.ellipse(cloud.x + 34, cloud.y + 6, 36, 16, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    if (this.stageIndex === 0) this.drawFarmyard(ctx, palette);
    else if (this.stageIndex === 1) this.drawBarn(ctx, palette, time);
    else this.drawKitchen(ctx, palette);

    // Ground.
    ctx.fillStyle = palette.ground;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, CANVAS_HEIGHT - GROUND_Y);
    ctx.fillStyle = palette.groundTop;
    ctx.fillRect(0, GROUND_Y, CANVAS_WIDTH, 10);
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    for (let i = 0; i < 12; i += 1) {
      const x = ((i * 137 - this.scrollX * 0.6) % (CANVAS_WIDTH + 80) + CANVAS_WIDTH + 80) % (CANVAS_WIDTH + 80) - 40;
      ctx.fillRect(x, GROUND_Y + 34, 26, 5);
    }
  }

  drawFarmyard(ctx, palette) {
    // Rolling hills.
    ctx.fillStyle = palette.hill;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    ctx.quadraticCurveTo(320, GROUND_Y - 120, 640, GROUND_Y);
    ctx.quadraticCurveTo(960, GROUND_Y - 90, 1280, GROUND_Y);
    ctx.closePath();
    ctx.fill();

    // Red barn in the distance.
    const barnX = 880 - ((this.scrollX * 0.25) % 1500);
    ctx.fillStyle = '#a83a2a';
    ctx.fillRect(barnX, GROUND_Y - 170, 190, 170);
    ctx.fillStyle = '#7a2a1e';
    ctx.beginPath();
    ctx.moveTo(barnX - 12, GROUND_Y - 170);
    ctx.lineTo(barnX + 95, GROUND_Y - 240);
    ctx.lineTo(barnX + 202, GROUND_Y - 170);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#f2e6c8';
    ctx.fillRect(barnX + 70, GROUND_Y - 90, 50, 90);
    ctx.strokeStyle = '#f2e6c8';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(barnX + 70, GROUND_Y - 90);
    ctx.lineTo(barnX + 120, GROUND_Y);
    ctx.moveTo(barnX + 120, GROUND_Y - 90);
    ctx.lineTo(barnX + 70, GROUND_Y);
    ctx.stroke();

    // Fence posts scrolling past.
    ctx.fillStyle = '#7a4a21';
    for (let i = 0; i < 9; i += 1) {
      const x = ((i * 160 - this.scrollX) % (CANVAS_WIDTH + 160) + CANVAS_WIDTH + 160) % (CANVAS_WIDTH + 160) - 80;
      ctx.fillRect(x, GROUND_Y - 46, 8, 46);
    }
    ctx.fillStyle = '#a06a35';
    ctx.fillRect(0, GROUND_Y - 40, CANVAS_WIDTH, 6);
    ctx.fillRect(0, GROUND_Y - 22, CANVAS_WIDTH, 6);

    // Hay bales.
    ctx.fillStyle = '#e8c85a';
    for (let i = 0; i < 3; i += 1) {
      const x = ((i * 520 + 260 - this.scrollX * 0.8) % (CANVAS_WIDTH + 300) + CANVAS_WIDTH + 300) % (CANVAS_WIDTH + 300) - 150;
      ctx.beginPath();
      ctx.arc(x, GROUND_Y - 18, 34, Math.PI, 0);
      ctx.fill();
      ctx.strokeStyle = '#b89a2e';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x, GROUND_Y - 18, 22, Math.PI, 0);
      ctx.stroke();
    }
  }

  drawBarn(ctx, palette, time) {
    // Wooden barn walls and beams — kept light so the turkey reads.
    ctx.fillStyle = '#b0824a';
    ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);
    ctx.fillStyle = '#96682f';
    for (let x = 0; x < CANVAS_WIDTH; x += 130) {
      ctx.fillRect(x, 0, 10, GROUND_Y);
    }
    ctx.fillStyle = '#7a5222';
    ctx.fillRect(0, 130, CANVAS_WIDTH, 16);
    ctx.fillRect(0, 330, CANVAS_WIDTH, 16);

    // Hanging lanterns.
    for (let i = 0; i < 4; i += 1) {
      const x = 160 + i * 320;
      const sway = Math.sin(time * 1.2 + i) * 6;
      ctx.strokeStyle = '#3a2a1a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + sway, 74);
      ctx.stroke();
      ctx.fillStyle = '#e8a33d';
      ctx.beginPath();
      ctx.arc(x + sway, 86, 16, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff3c8';
      ctx.beginPath();
      ctx.arc(x + sway, 86, 9, 0, Math.PI * 2);
      ctx.fill();
    }

    // Hay bales stacked at the back.
    ctx.fillStyle = '#e8c85a';
    ctx.beginPath();
    ctx.arc(180, GROUND_Y - 24, 44, Math.PI, 0);
    ctx.arc(1080, GROUND_Y - 24, 44, Math.PI, 0);
    ctx.fill();
  }

  drawKitchen(ctx, palette) {
    // Tiled kitchen wall.
    ctx.fillStyle = '#f2e6c8';
    ctx.fillRect(0, 0, CANVAS_WIDTH, GROUND_Y);
    ctx.strokeStyle = '#d9c9a8';
    ctx.lineWidth = 2;
    for (let y = 0; y < GROUND_Y; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(CANVAS_WIDTH, y);
      ctx.stroke();
    }
    for (let x = 0; x < CANVAS_WIDTH; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, GROUND_Y);
      ctx.stroke();
    }

    // Window with the outside world — the escape.
    ctx.fillStyle = '#7ab8e8';
    ctx.fillRect(1020, 90, 180, 150);
    ctx.fillStyle = '#fde9c8';
    ctx.beginPath();
    ctx.arc(1100, 140, 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#4a7a2b';
    ctx.fillRect(1020, 200, 180, 40);
    ctx.strokeStyle = '#8a5a2b';
    ctx.lineWidth = 8;
    ctx.strokeRect(1020, 90, 180, 150);
    ctx.beginPath();
    ctx.moveTo(1110, 90);
    ctx.lineTo(1110, 240);
    ctx.moveTo(1020, 165);
    ctx.lineTo(1200, 165);
    ctx.stroke();

    // Hanging pans and a shelf with pumpkins.
    ctx.fillStyle = '#3a3a3a';
    for (let i = 0; i < 3; i += 1) {
      const x = 180 + i * 110;
      ctx.beginPath();
      ctx.arc(x, 130, 30, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#555555';
      ctx.beginPath();
      ctx.arc(x, 130, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#3a3a3a';
    }
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(420, 210, 300, 12);
    ctx.fillStyle = '#e07b39';
    ctx.beginPath();
    ctx.arc(470, 196, 18, 0, Math.PI * 2);
    ctx.arc(560, 196, 18, 0, Math.PI * 2);
    ctx.arc(660, 196, 18, 0, Math.PI * 2);
    ctx.fill();
  }
}

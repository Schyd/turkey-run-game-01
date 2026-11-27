// Gobble Dash — Farmer Bram, who chases the turkey.
// One job: chase, search, and corner. He never stops coming.

import { FARMER, GROUND_Y } from './config.js';

export class Farmer {
  constructor() {
    this.reset();
  }

  reset() {
    // The chase is a gap in world pixels between the turkey and the farmer.
    // It grows when the turkey outruns him and shrinks when the turkey
    // stumbles, hides, or lets him corner it. Screen x follows the gap.
    this.gap = 240;
    this.x = 300 - this.gap;
    this.y = GROUND_Y - FARMER.height;
    this.width = FARMER.width;
    this.height = FARMER.height;
    this.walkCycle = 0;
    this.searching = false;
    this.searchTimer = 0;
    this.lunging = false;
    this.lungeTimer = 0;
    this.shouted = false;
  }

  // How close he is to the turkey, 0 (far) to 1 (about to catch).
  proximityTo(turkeyX) {
    return Math.max(0, Math.min(1, 1 - this.gap / 320));
  }

  update(dt, turkey, sounds) {
    // Cornering lunge: when he gets close he bursts forward and shouts.
    if (this.gap < 110 && !this.lunging && !this.searching) {
      this.lunging = true;
      this.lungeTimer = 0.5;
      if (!this.shouted) {
        sounds.spotted();
        this.shouted = true;
      }
    }
    if (this.gap > 200) this.shouted = false;

    if (turkey.hiding) {
      // The turkey is in the hay and the world has stopped: he walks up,
      // searching, slow and looking around.
      this.searching = true;
      this.searchTimer = 0.8;
      this.gap -= FARMER.hideChaseSpeed * dt;
    } else {
      if (this.searchTimer > 0) {
        this.searchTimer -= dt;
        this.searching = this.searchTimer > 0;
      }
      if (turkey.stumbling) {
        this.gap -= FARMER.stumbleGain * dt;
      } else if (turkey.dashing) {
        this.gap += (560 - FARMER.dashChaseSpeed) * dt;
      } else {
        this.gap += FARMER.keepPaceLag * dt;
      }
    }
    if (this.lunging) {
      this.gap -= FARMER.lungeGain * dt;
      this.lungeTimer -= dt;
      if (this.lungeTimer <= 0) this.lunging = false;
    }

    // He never falls too far behind: the chase is always on.
    if (this.gap > FARMER.maxGap) this.gap = FARMER.maxGap;
    if (this.gap < 0) this.gap = 0;
    this.x = turkey.x - this.gap;
    this.walkCycle += dt * 9;
  }

  caught(turkey) {
    return this.x + this.width - 10 >= turkey.x + FARMER.catchGap;
  }

  draw(ctx, time) {
    const x = this.x;
    const y = this.y;
    const step = Math.sin(this.walkCycle) * 7;

    ctx.save();
    ctx.translate(x + this.width / 2, y + this.height);

    // Legs in overalls.
    ctx.strokeStyle = '#3a5a8c';
    ctx.lineWidth = 9;
    ctx.beginPath();
    ctx.moveTo(-12, -52);
    ctx.lineTo(-12 + step, 0);
    ctx.moveTo(12, -52);
    ctx.lineTo(12 - step, 0);
    ctx.stroke();

    // Body: plaid shirt and overalls.
    ctx.fillStyle = '#b03a2e';
    ctx.fillRect(-26, -104, 52, 54);
    ctx.fillStyle = '#3a5a8c';
    ctx.fillRect(-22, -88, 44, 38);
    ctx.fillStyle = '#e8a33d';
    ctx.fillRect(-22, -88, 44, 6);

    // Arms: one reaching forward with the pitchfork, one pumping.
    ctx.strokeStyle = '#b03a2e';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(20, -96);
    ctx.lineTo(38, -70 + Math.sin(this.walkCycle) * 4);
    ctx.moveTo(-20, -96);
    ctx.lineTo(-34, -72 - Math.sin(this.walkCycle) * 4);
    ctx.stroke();

    // Pitchfork.
    ctx.strokeStyle = '#8a8a8a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(38, -118);
    ctx.lineTo(52, -40);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(44, -128);
    ctx.lineTo(50, -112);
    ctx.moveTo(50, -130);
    ctx.lineTo(56, -114);
    ctx.moveTo(56, -128);
    ctx.lineTo(62, -112);
    ctx.stroke();

    // Head.
    ctx.fillStyle = '#e8b98a';
    ctx.beginPath();
    ctx.arc(0, -118, 16, 0, Math.PI * 2);
    ctx.fill();
    // Angry eyes.
    ctx.fillStyle = '#1c1c1c';
    ctx.beginPath();
    ctx.arc(6, -120, 2.6, 0, Math.PI * 2);
    ctx.arc(13, -120, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1c1c1c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(3, -126);
    ctx.lineTo(9, -123);
    ctx.moveTo(16, -123);
    ctx.lineTo(10, -126);
    ctx.stroke();
    // Moustache and shouting mouth.
    ctx.fillStyle = '#5a3a1a';
    ctx.fillRect(-2, -110, 18, 4);
    ctx.fillStyle = '#7a2a1a';
    ctx.beginPath();
    ctx.ellipse(8, -104, 5, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Straw hat.
    ctx.fillStyle = '#e8c85a';
    ctx.beginPath();
    ctx.ellipse(0, -132, 26, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#d9b84a';
    ctx.fillRect(-13, -146, 26, 14);

    // "!" when he is searching and cannot see the turkey.
    if (this.searching) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('?', 34, -160 + Math.sin(time * 6) * 4);
    }

    ctx.restore();
  }
}

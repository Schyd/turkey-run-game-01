// Gobble Dash — the game itself: states, loop, collisions, scoring.
// One job: run the turkey's escape from title screen to caught or escaped.

import { CANVAS_HEIGHT, CANVAS_WIDTH, ESCAPE_DISTANCE_METERS, GROUND_Y, PLAYER, SCORES, STAGES } from './config.js';
import { SoundBank } from './audio.js';
import { Input } from './input.js';
import { Turkey } from './turkey.js';
import { Farmer } from './farmer.js';
import { Hazard, Pickup, boxesOverlap, pickSpawn, spawnFor } from './hazards.js';
import { World } from './world.js';
import { drawEnd, drawHud, drawPaused, drawStageBanner, drawTitle } from './render.js';

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = new Input(canvas);
    this.sounds = new SoundBank();
    this.turkey = new Turkey();
    this.farmer = new Farmer();
    this.world = new World();
    this.state = 'title';
    this.score = 0;
    this.corn = 0;
    this.pieScore = 0;
    this.bestScore = 0;
    this.hazards = [];
    this.pickups = [];
    this.spawnTimer = 0;
    this.featherTimer = 18;
    this.lastTime = 0;
    this.pauseLatch = false;
    this.muteLatch = false;
    this.demo = false;
    this.endStats = null;
    this.isNewBest = false;
    this.applyShotParam();
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'playing') this.state = 'paused';
    });
  }

  // ?shot=start|play|end|caught stages a real render of the game for
  // screenshots: the title, a live run, or an end screen — no placeholders.
  applyShotParam() {
    const params = new URLSearchParams(window.location.search);
    const shot = params.get('shot');
    if (shot === 'play') {
      this.demo = true;
      this.startRun();
      this.world.distancePx = 847 * 12;
      this.world.stageIndex = 1;
      this.score = 1250;
      this.corn = 6;
      // Staged so the scene reads ~3 s in, when the screenshot is taken:
      // the turkey jumps the fence, the pumpkin and corn follow, the knife
      // flies overhead, the farmer closes in from the left.
      this.hazards = [
        new Hazard('fence', 1430, GROUND_Y - 58, 0),
        new Hazard('pumpkin', 1630, GROUND_Y - 48, 0),
        new Hazard('knife', 1500, GROUND_Y - 100, 0),
      ];
      this.pickups = [
        new Pickup('corn', 1560, GROUND_Y - 120),
        new Pickup('corn', 1606, GROUND_Y - 166),
        new Pickup('corn', 1652, GROUND_Y - 120),
      ];
      this.farmer.gap = 180;
      this.farmer.x = this.turkey.x - this.farmer.gap;
      this.turkey.y = GROUND_Y - PLAYER.height;
      this.turkey.vy = 0;
      this.turkey.onGround = true;
    } else if (shot === 'end') {
      this.state = 'escaped';
      this.world.distancePx = ESCAPE_DISTANCE_METERS * 12;
      this.world.stageIndex = 2;
      this.endStats = { score: 3420, distanceMeters: ESCAPE_DISTANCE_METERS, corn: 14, stageName: 'KITCHEN' };
      this.isNewBest = true;
    } else if (shot === 'caught') {
      this.state = 'caught';
      this.world.distancePx = 523 * 12;
      this.world.stageIndex = 0;
      this.farmer.gap = 50;
      this.farmer.x = this.turkey.x - this.farmer.gap;
      this.endStats = { score: 980, distanceMeters: 523, corn: 4, stageName: 'FARMYARD' };
      this.isNewBest = false;
    }
  }

  startRun() {
    this.turkey.reset();
    this.farmer.reset();
    this.world.reset();
    this.hazards = [];
    this.pickups = [];
    this.score = 0;
    this.corn = 0;
    this.pieScore = 0;
    this.spawnTimer = 1.2;
    this.featherTimer = 18;
    this.endStats = null;
    this.isNewBest = false;
    this.state = 'playing';
  }

  finish(result) {
    this.state = result;
    const stats = {
      score: this.score,
      distanceMeters: this.world.distanceMeters,
      corn: this.corn,
      stageName: this.world.stage.name,
    };
    if (result === 'escaped') {
      stats.score += SCORES.escapeBonus;
      this.score = stats.score;
      this.sounds.escaped();
    } else {
      this.sounds.caught();
    }
    this.endStats = stats;
    this.isNewBest = stats.score > this.bestScore && stats.score > 0;
    if (this.isNewBest) this.bestScore = stats.score;
  }

  scrollSpeed() {
    if (this.turkey.hiding) return 0;
    if (this.turkey.stumbling) return 0;
    let speed = this.world.stage.scrollSpeed;
    if (this.turkey.dashing) speed = PLAYER.dashSpeed;
    return speed;
  }

  update(dt, time) {
    if (this.state !== 'playing') return;

    // Pause is edge-triggered so a quick tap always registers.
    if (this.input.consumePause()) {
      this.state = 'paused';
      return;
    }
    if (this.input.muteKey && !this.muteLatch) {
      this.muteLatch = true;
      this.sounds.toggleMute();
    }
    if (!this.input.muteKey) this.muteLatch = false;

    // Demo mode plays itself so screenshots show a live run.
    if (this.demo) this.demoDrive();

    if (this.input.consumeJump()) this.turkey.jump(this.sounds);

    const speed = this.scrollSpeed();
    this.turkey.update(dt, this.input, this.sounds);
    this.farmer.update(dt, this.turkey, this.sounds);
    this.world.update(dt, speed, time);

    // Spawning (paused in demo mode: the staged scene stays clean).
    if (!this.demo) {
      this.spawnTimer -= dt;
      if (this.spawnTimer <= 0) {
        this.spawnTimer = this.world.stage.spawnInterval * (0.85 + Math.random() * 0.3);
        const kind = pickSpawn(this.world.stageIndex, this.world.distanceMeters);
        const { hazards, pickups } = spawnFor(kind, this.world.stageIndex);
        this.hazards.push(...hazards);
        this.pickups.push(...pickups);
      }
      this.featherTimer -= dt;
      if (this.featherTimer <= 0) {
        this.featherTimer = 22 + Math.random() * 10;
        if (Math.random() < 0.6) {
          this.pickups.push(new Pickup(Math.random() < 0.5 ? 'feather' : 'pie', 1320, GROUND_Y - 160));
        }
      }
    }

    // Stage banner sound on transition.
    if (this.world.stageBannerUntil > time && this.world.stageBannerUntil - time > 2.1) {
      this.sounds.stageClear();
    }

    // Move everything, drop what scrolled off.
    for (const hazard of this.hazards) hazard.update(dt, speed);
    for (const pickup of this.pickups) pickup.update(dt, speed);
    this.hazards = this.hazards.filter((h) => h.x > -160);
    this.pickups = this.pickups.filter((p) => p.x > -60 && !p.taken);

    // Score grows with every meter run.
    this.score = Math.max(this.score, this.world.distanceMeters * SCORES.meter + this.corn * SCORES.corn + this.pieScore);

    // Collisions with hazards.
    const turkeyBox = this.turkey.box;
    if (!this.turkey.invulnerable && !this.turkey.dashing) {
      for (const hazard of this.hazards) {
        if (boxesOverlap(turkeyBox, hazard.box)) {
          this.turkey.hurt(PLAYER.stumbleSeconds);
          this.sounds.hit();
          this.sounds.gobble();
          this.hazards = this.hazards.filter((h) => h !== hazard);
          if (this.turkey.lives <= 0) {
            this.finish('caught');
            return;
          }
          break;
        }
      }
    }

    // Pickups.
    for (const pickup of this.pickups) {
      if (!pickup.taken && boxesOverlap(turkeyBox, pickup.box)) {
        pickup.taken = true;
        if (pickup.kind === 'corn') {
          this.corn += 1;
          this.sounds.pickupCorn();
        } else if (pickup.kind === 'pie') {
          this.pieScore += SCORES.pie;
          this.sounds.pickupPie();
        } else {
          this.turkey.lives = Math.min(PLAYER.maxLives, this.turkey.lives + 1);
          this.sounds.feather();
        }
      }
    }

    // The farmer catches the turkey, or the turkey reaches the window.
    if (this.farmer.caught(this.turkey)) {
      this.finish('caught');
      return;
    }
    if (this.world.escaped) {
      this.finish('escaped');
    }
  }

  // Simple autopilot for the screenshot run: jump ground hazards (and
  // knives that have landed) in time; let flying knives pass overhead.
  demoDrive() {
    const reach = this.scrollSpeed() * 0.5;
    // A knife counts as landed only once it is near the ground; a flying
    // one passes over a grounded turkey and must never trigger a jump.
    const jumpable = (h) => h.kind !== 'knife' || h.y > GROUND_Y - 60;
    const ahead = this.hazards
      .filter((h) => jumpable(h) && h.x > this.turkey.x && h.x - this.turkey.x < reach)
      .sort((a, b) => a.x - b.x)[0];
    if (ahead && this.turkey.onGround) {
      this.turkey.jump(this.sounds);
    }
  }

  draw(time) {
    const ctx = this.ctx;
    this.world.draw(ctx, time);

    for (const pickup of this.pickups) pickup.draw(ctx);
    for (const hazard of this.hazards) hazard.draw(ctx);
    this.farmer.draw(ctx, time);
    if (this.state !== 'title') this.turkey.draw(ctx, time);

    if (this.state === 'playing' || this.state === 'paused') {
      drawHud(ctx, {
        score: this.score,
        distanceMeters: this.world.distanceMeters,
        lives: this.turkey.lives,
        maxLives: PLAYER.maxLives,
        stamina: this.turkey.stamina,
        stage: this.world.stage,
        farmerProximity: this.farmer.proximityTo(this.turkey.x),
        muted: this.sounds.muted,
      });
    }

    if (this.world.stageBannerUntil > time && this.state === 'playing') {
      drawStageBanner(ctx, this.world.stage.label, this.world.stageBannerUntil - time);
    }

    if (this.state === 'title') drawTitle(ctx, this.bestScore, time);
    if (this.state === 'paused') drawPaused(ctx);
    if ((this.state === 'caught' || this.state === 'escaped') && this.endStats) {
      drawEnd(ctx, this.state, this.endStats, this.isNewBest);
    }
  }

  handleMenus() {
    const click = this.input.consumeClick();
    if (this.state === 'title') {
      if (this.input.consumeJump() || this.input.consumeAction() || click) {
        this.sounds.ensure();
        this.startRun();
      }
    } else if (this.state === 'paused') {
      if (this.input.consumePause() || click) this.state = 'playing';
    } else if (this.state === 'caught' || this.state === 'escaped') {
      if (this.input.consumeAction() || this.input.consumeJump() || click) this.startRun();
    }
  }

  frame(timeMs) {
    // Re-register first: one bad frame must never stop the loop.
    requestAnimationFrame((t) => this.frame(t));
    const time = timeMs / 1000;
    const dt = Math.min(0.05, this.lastTime ? (timeMs - this.lastTime) / 1000 : 0.016);
    this.lastTime = timeMs;
    this.handleMenus();
    this.update(dt, time);
    this.draw(time);
    window.GOBBLE_DEBUG = {
      state: this.state,
      score: this.score,
      distanceMeters: this.world.distanceMeters,
      lives: this.turkey.lives,
      stage: this.world.stage.name,
      farmerX: Math.round(this.farmer.x),
      farmerGap: Math.round(this.farmer.gap),
      turkeyX: Math.round(this.turkey.x),
      hazards: this.hazards.length,
    };
  }

  start() {
    this.pieScore = 0;
    requestAnimationFrame((t) => this.frame(t));
  }
}

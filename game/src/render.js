// Gobble Dash — everything drawn on top of the world.
// One job: the HUD, the title screen, pause and end screens.

import { CANVAS_HEIGHT, CANVAS_WIDTH, ESCAPE_DISTANCE_METERS } from './config.js';

function drawHeart(ctx, x, y, filled, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = filled ? '#d94f2b' : 'rgba(255,255,255,0.35)';
  ctx.beginPath();
  ctx.moveTo(0, 8);
  ctx.bezierCurveTo(-12, -4, -7, -12, 0, -5);
  ctx.bezierCurveTo(7, -12, 12, -4, 0, 8);
  ctx.fill();
  ctx.restore();
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(30, 18, 8, 0.72)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 14);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 220, 150, 0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

export function drawHud(ctx, state) {
  const { score, distanceMeters, lives, maxLives, stamina, stage, farmerProximity, muted } = state;

  // Top bar.
  panel(ctx, 16, 14, 560, 64);
  ctx.fillStyle = '#ffe9b0';
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(`SCORE ${score}`, 34, 40);
  ctx.font = 'bold 22px sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(`${distanceMeters} m / ${ESCAPE_DISTANCE_METERS} m`, 34, 66);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffe9b0';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText(stage.name, 560, 40);
  ctx.textAlign = 'left';

  // Lives.
  for (let i = 0; i < maxLives; i += 1) {
    drawHeart(ctx, 610 + i * 34, 46, i < lives);
  }

  // Dash stamina.
  panel(ctx, 16, 88, 220, 22);
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(22, 93, 208, 12);
  ctx.fillStyle = stamina > 25 ? '#7ab84a' : '#e8a33d';
  ctx.fillRect(22, 93, 208 * (stamina / 100), 12);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('DASH  [Shift]', 22, 126);

  // Distance progress to the kitchen window.
  panel(ctx, 940, 14, 324, 64);
  ctx.fillStyle = '#3a2a1a';
  ctx.fillRect(956, 40, 292, 14);
  ctx.fillStyle = '#e8a33d';
  ctx.fillRect(956, 40, 292 * Math.min(1, distanceMeters / ESCAPE_DISTANCE_METERS), 14);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('ESCAPE', 956, 30);
  ctx.textAlign = 'right';
  ctx.fillText('KITCHEN WINDOW', 1248, 70);
  ctx.textAlign = 'left';

  // Farmer proximity warning.
  if (farmerProximity > 0.62) {
    const blink = Math.floor(performance.now() / 180) % 2 === 0;
    if (blink) {
      ctx.fillStyle = '#ff3b1e';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('! FARMER BRAM IS CLOSE — RUN !', CANVAS_WIDTH / 2, 150);
      ctx.textAlign = 'left';
    }
  }

  if (muted) {
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = 'bold 15px sans-serif';
    ctx.fillText('MUTED (M)', CANVAS_WIDTH - 130, CANVAS_HEIGHT - 20);
  }
}

export function drawStageBanner(ctx, label, timeLeft) {
  const alpha = Math.min(1, timeLeft);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(30, 18, 8, 0.8)';
  ctx.beginPath();
  ctx.roundRect(CANVAS_WIDTH / 2 - 260, 240, 520, 90, 16);
  ctx.fill();
  ctx.strokeStyle = '#e8a33d';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = '#ffe9b0';
  ctx.font = 'bold 34px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, CANVAS_WIDTH / 2, 285);
  ctx.restore();
}

export function drawTitle(ctx, bestScore, time) {
  ctx.fillStyle = 'rgba(30, 18, 8, 0.45)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffe9b0';
  ctx.font = 'bold 92px sans-serif';
  ctx.fillText('GOBBLE DASH', CANVAS_WIDTH / 2, 170);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText('The Great Thanksgiving Escape', CANVAS_WIDTH / 2, 240);

  panel(ctx, CANVAS_WIDTH / 2 - 330, 290, 660, 170);
  ctx.fillStyle = '#ffe9b0';
  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('You are Giblet the turkey. Farmer Bram wants you', CANVAS_WIDTH / 2, 322);
  ctx.fillText('for Thanksgiving dinner. Run the farmyard,', CANVAS_WIDTH / 2, 352);
  ctx.fillText('the barn and the kitchen — and get out the window!', CANVAS_WIDTH / 2, 382);
  ctx.fillStyle = '#ffffff';
  ctx.font = '20px sans-serif';
  ctx.fillText('SPACE / CLICK — jump      ↓ — hide in the hay', CANVAS_WIDTH / 2, 420);
  ctx.fillText('SHIFT — dash      P — pause      M — mute', CANVAS_WIDTH / 2, 444);

  const pulse = 0.7 + Math.sin(time * 4) * 0.3;
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#e8a33d';
  ctx.font = 'bold 30px sans-serif';
  ctx.fillText('PRESS ENTER OR CLICK TO START', CANVAS_WIDTH / 2, 540);
  ctx.restore();

  if (bestScore > 0) {
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText(`Best escape so far: ${bestScore} points`, CANVAS_WIDTH / 2, 600);
  }
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.font = '16px sans-serif';
  ctx.fillText('A complete original game — no turkeys were harmed. The farmer disagrees.', CANVAS_WIDTH / 2, 668);
  ctx.textAlign = 'left';
}

export function drawPaused(ctx) {
  ctx.fillStyle = 'rgba(30, 18, 8, 0.55)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffe9b0';
  ctx.font = 'bold 56px sans-serif';
  ctx.fillText('PAUSED', CANVAS_WIDTH / 2, 330);
  ctx.fillStyle = '#ffffff';
  ctx.font = '24px sans-serif';
  ctx.fillText('Press P to keep running', CANVAS_WIDTH / 2, 400);
  ctx.textAlign = 'left';
}

export function drawEnd(ctx, result, stats, isBest) {
  ctx.fillStyle = 'rgba(30, 18, 8, 0.55)';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  panel(ctx, CANVAS_WIDTH / 2 - 380, 130, 760, 430);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  if (result === 'escaped') {
    ctx.fillStyle = '#7ab84a';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText('YOU ESCAPED!', CANVAS_WIDTH / 2, 200);
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px sans-serif';
    ctx.fillText('Giblet slipped out the kitchen window —', CANVAS_WIDTH / 2, 262);
    ctx.fillText('Thanksgiving dinner is cancelled this year.', CANVAS_WIDTH / 2, 294);
  } else {
    ctx.fillStyle = '#ff5a3b';
    ctx.font = 'bold 64px sans-serif';
    ctx.fillText('CAUGHT!', CANVAS_WIDTH / 2, 200);
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px sans-serif';
    ctx.fillText('Farmer Bram got you. The oven was already warm…', CANVAS_WIDTH / 2, 262);
    ctx.fillText('Next year, run faster.', CANVAS_WIDTH / 2, 294);
  }

  ctx.fillStyle = '#ffe9b0';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText(`Score ${stats.score}    •    Distance ${stats.distanceMeters} m`, CANVAS_WIDTH / 2, 360);
  ctx.fillStyle = '#ffffff';
  ctx.font = '22px sans-serif';
  ctx.fillText(`Corn collected ${stats.corn}    •    Reached ${stats.stageName}`, CANVAS_WIDTH / 2, 398);
  if (isBest) {
    ctx.fillStyle = '#e8a33d';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText('★ NEW BEST ESCAPE! ★', CANVAS_WIDTH / 2, 446);
  }

  const pulse = 0.7 + Math.sin(performance.now() / 250) * 0.3;
  ctx.save();
  ctx.globalAlpha = pulse;
  ctx.fillStyle = '#e8a33d';
  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('PRESS R OR CLICK TO RUN AGAIN', CANVAS_WIDTH / 2, 510);
  ctx.restore();
  ctx.textAlign = 'left';
}

// Gobble Dash — boot the game.
// One job: wire the canvas to the game and start the loop.

import { CANVAS_HEIGHT, CANVAS_WIDTH } from './config.js';
import { Game } from './game.js';

const canvas = document.getElementById('game');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const game = new Game(canvas);
window.GOBBLE_GAME = game;
game.start();

// Gobble Dash — tuning and stage data.
// One job: every number the game balances on, in one place.

export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;
export const GROUND_Y = 620;
export const TURKEY_X = 300;
export const GRAVITY = 2400;
export const JUMP_VELOCITY = -820;
export const PIXELS_PER_METER = 12;

// The turkey's escape route: farmyard, then barn, then kitchen.
// Each stage is harder: faster scroll, denser hazards, new dangers.
export const STAGES = [
  {
    name: 'FARMYARD',
    label: 'Stage 1 — The Farmyard',
    startMeters: 0,
    endMeters: 600,
    scrollSpeed: 260,
    spawnInterval: 1.15,
    palette: {
      skyTop: '#f7b733',
      skyBottom: '#fde9c8',
      ground: '#8a5a2b',
      groundTop: '#a06a35',
      hill: '#c98a3d',
      accent: '#d94f2b',
    },
  },
  {
    name: 'BARN',
    label: 'Stage 2 — The Barn',
    startMeters: 600,
    endMeters: 1200,
    scrollSpeed: 310,
    spawnInterval: 0.95,
    palette: {
      skyTop: '#e07b39',
      skyBottom: '#f6d9a0',
      ground: '#6e4423',
      groundTop: '#8a5a2b',
      hill: '#a06a35',
      accent: '#b03a2e',
    },
  },
  {
    name: 'KITCHEN',
    label: 'Stage 3 — The Kitchen',
    startMeters: 1200,
    endMeters: 1800,
    scrollSpeed: 360,
    spawnInterval: 0.8,
    palette: {
      skyTop: '#c94f2b',
      skyBottom: '#f2c184',
      ground: '#7a3b2e',
      groundTop: '#93503f',
      hill: '#8a5a2b',
      accent: '#e8a33d',
    },
  },
];

export const ESCAPE_DISTANCE_METERS = 1800;

export const PLAYER = {
  width: 72,
  height: 64,
  maxLives: 3,
  dashSpeed: 560,
  dashDrainPerSecond: 55,
  dashRegenPerSecond: 28,
  invulnerableSeconds: 1.6,
  stumbleSeconds: 0.45,
};

export const FARMER = {
  width: 84,
  height: 118,
  // Speeds are relative to the scrolling world: the farmer keeps pace with
  // the turkey, gains ground when the turkey stumbles or hides, and falls
  // behind when the turkey dashes.
  stumbleGain: 140,
  hideChaseSpeed: 120,
  dashChaseSpeed: 175,
  keepPaceLag: 6,
  maxGap: 260,
  lungeGain: 60,
  catchGap: 52,
};

export const SCORES = {
  corn: 100,
  pie: 250,
  feather: 0,
  meter: 1,
  escapeBonus: 1000,
};

export const HAZARD_KINDS = ['fence', 'knife', 'pumpkin', 'oven'];

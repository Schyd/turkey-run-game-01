# Gobble Dash — The Great Thanksgiving Escape

[![make.fun](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/competitions/turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/Schyd/turkey-run-game-01/rank.svg)](https://make.fun/competitions/turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/Schyd/turkey-run-game-01/reward.svg)](https://make.fun/competitions/turkey-run-game-01)

You are **Giblet the turkey**, and Farmer Bram wants you for Thanksgiving
dinner. Run the farmyard, the barn and the kitchen — and slip out the
kitchen window before he catches you or the oven gets you.

## How to play

Open `game/index.html` in a desktop browser (or serve `game/` with any
static server). No network, no build step, no install.

- **SPACE / ↑ / CLICK** — jump over fences, pumpkins, knives and ovens
- **↓ / S** — hide in the hay (the farmer loses you, but he keeps coming)
- **SHIFT** — dash (drains stamina, pushes the farmer back)
- **P** — pause, **M** — mute, **R** — run again after the end

## The escape

- **3 stages, harder as you go:** Farmyard → Barn → Kitchen. Reach the
  kitchen window at 1800 m to escape.
- **Farmer Bram chases you** from the left. Stumble, hide too long, or let
  him corner you and you are caught. Dash to push him back.
- **Dangers:** fences, rolling pumpkins, flying and falling carving knives,
  and hot ovens in the kitchen.
- **Pickups:** corn (+100), pumpkin pie (+250), golden feather (+1 life).
- **HUD:** score, distance to the kitchen window, lives, dash stamina,
  stage, and a warning when the farmer gets close.
- **Sound:** all effects are synthesized with WebAudio — gobbles, jumps,
  pickups, the farmer's shout, and the escape fanfare. No audio files.

## Files

- `main.ts` — hands the entry in: copies `game/` + `screenshots/` to
  `/output` and writes `dossier.json` with the vendored library.
- `game/index.html`, `game/styles.css` — page shell and frame.
- `game/src/config.js` — tuning and stage data.
- `game/src/audio.js` — synthesized sounds.
- `game/src/input.js` — keyboard and mouse input.
- `game/src/turkey.js` — the turkey: movement and drawing.
- `game/src/farmer.js` — Farmer Bram: chase, search, corner.
- `game/src/hazards.js` — fences, knives, pumpkins, ovens, pickups.
- `game/src/world.js` — stages and scrolling scenery.
- `game/src/render.js` — HUD, title, pause and end screens.
- `game/src/game.js` — states, loop, collisions, scoring.
- `game/src/main.js` — boot.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.
- `screenshots/` — 4 real renders of the game (title, live run, caught,
  escaped); the first by name is the cover.

## License

MIT — see [LICENSE](LICENSE).

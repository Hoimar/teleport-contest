# Teleport Implementation Loop

Live checkpoint only. For history, use `git log`, `git show`, `lessons.md` (avoid token-intensive full reads as explained in `AGENTS.md`'s "## Memory Routing"),
and `feature_map.md`.

## Context Rules

- Read this file fully before resuming a loop.
- Use `npm run agent:brief -- --target <target>` for targeted context.
- Search `lessons.md` and `feature_map.md`; do not full-read them by default.
- Regenerate broad corpus state with `node scripts/triage-corpus.mjs`.

## Current State

- Current branch in this workspace: `main`.
- Baseline commit before the current `seed0002` pass: `ccbf286`.
- Current target: `seed0002-healer-reflection-drummer` has advanced from
  `S 83/595 R 5690/27158` to `S 116/595 R 6795/27158`.
- Recently completed targets still full after this pass: `seed0383`,
  `seed5002`, `seed0116`, and `seed8000`.
- User-requested regression queue item `seed0360-wizard-world-tour` is fixed:
  `S 833/833 R 120639/120639`, exact screens, cursors, and RNG.

## Latest Loop Checkpoint

- Target: `seed0360-wizard-world-tour` regression cleanup.
- Current verification: `S 833/833 R 120639/120639`, `FS -`, `FR -`, `C 0`.
- Sentinel verification after the pass: total `S 485/1063 R 39980/64569`.
  `seed8000`, `seed0116`, and `seed0383` remain full passes; `seed0013`
  remains first-screen blocked with `R 578/4804`. Focused verifies also kept
  `seed0002` at `S 116/595 R 6795/27158` and `seed5002` full.
- Frozen public score after the pass: `5/44` passing, `S 1750/11405`,
  `R 234644/792838`, cells `1755/11405`, cursors `4081/11405`.
- Harness checks: hack audit `hard=0 suspicious=39`; memory lint is clean.
- Implemented subsystem truth in this iteration:
  - Scroll of light, potion paralysis, door-open side effects, and Healer
    quaff/read prompt details now consume C-like turns and discovery/exercise
    side effects.
  - Display/vision now carries lit corridor memory, dark-room color correction,
    DEC open-door glyphs, full trap glyph mapping, and room-vs-corridor
    adjacent night-vision wall handling.
  - `newsym()` maps the terrain/object/trap layer under the hero before
    drawing `@`, so stepping away from dark remembered floor preserves object
    glyphs like C's `_map_location(show=false)`.
  - Adjacent night vision now treats open doorway squares like room interiors
    for neighboring walls and secret doors while still avoiding dark-corridor
    endpoint over-visibility.
  - `dog_goal()` now uses the C `couldsee(omx,omy)` master-sight predicate and
    falls back to retained hero tracks/`edog->ogoal` when the master is unseen.
  - Pet-combat toplines now distinguish a final hero+pet packed line from a
    packed line that must block before a later monster pline.
  - Hero kill side effects now include extra treasure gates before corpse
    chance, and final corpse deletion runs `obj_resists(obj,0,0)`.
- Production `js/` has no intentional debug I/O or frozen imports.
- Coherent commit pending for: `js/display.js`, `js/vision.js`,
  `feature_map.md`, `lessons.md`, and this checkpoint.
- Next queue:
  - Continue `seed0002` from screen 116 / `FR 6717` (`obj_resists()`
    vs pet movement/candidate RNG).
  - Broaden the same display memory rules only from new evidence; do not
    reintroduce broad unlit-room rendering changes.

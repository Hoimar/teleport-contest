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
- Baseline commit before the current JS batch: `34b02d8`.
- Current target: `seed0002-healer-reflection-drummer` has advanced from
  the prior focused checkpoint `S 323/595 R 17551/27158` to focused cells
  `S 339/595 R 18356/27158` (`frozen/score.sh` cells `339/595`,
  cursor-inclusive screen score `335/595`).
- Recently completed targets still full after this pass: `seed0383`,
  `seed5002`, `seed0116`, `seed0360`, and `seed8000`.
- User-requested regression queue item `seed0360-wizard-world-tour` is fixed:
  `S 833/833 R 120639/120639`, exact screens, cursors, and RNG.

## Latest Loop Checkpoint

- Target: `seed0002-healer-reflection-drummer`.
- Current verification: focused cells `S 339/595 R 18356/27158`,
  `FS 338:char:mixed:n`, `FR 17729:rn2(4)=1=>rn2(100)=93`, `C 4`.
- Sentinel verification after the pass: total `S 708/1063 R 51550/64569`.
  `seed8000`, `seed0116`, `seed0383`, and `seed0360` remain full passes;
  `seed0013` remains first-screen blocked with `R 587/4804`.
- Frozen public score after this pass is `5/44` passing. Current exact
  passes are `seed0116`, `seed0360`, `seed0383`, `seed5002`, and
  `seed8000`; the user-reported `seed0360` frozen-score regression is absent
  locally (`S 833/833 R 120639/120639`).
- Harness checks: hack audit `hard=0 suspicious=39`; memory lint is clean.
- Implemented subsystem truth in this iteration:
  - Ordinary `mklev()` now runs the final `wallification(1,0,COLNO-1,ROWNO-1)`
    pass on non-special levels, matching the late room-wall/corner topology
    exposed after stair descent (`C ref: src/mklev.c:mklev()`).
  - `shkinit()` now seeds basic `mextra.eshk` shopkeeper state, including shop
    room/type/level and inside-door/home coordinates, and shopkeepers enter a
    partial `shk_move()`/`move_special()` path instead of ordinary movement
    (`C ref: src/shknam.c:shkinit()`, `src/shk.c:shk_move()`,
    `src/priest.c:move_special()`).
  - `dosounds()` now renders current fountain/sink plus vault/shop ambient
    messages, can force a tty `--More--` when a sound cannot pack with the
    existing topline, and can latch run-sound `--More--` while the post-sound
    turn tail resumes after dismissal (`C ref: src/sounds.c:dosounds()` and
    `win/tty/topl.c:update_topl()`).
  - Floor look now names statues from `obj->corpsenm` and uses tty topline
    packing overflow to block before long `You see here ...` messages.
  - Pet inventory drop/pickup now latches an already-active More frame before
    visible pet inventory side effects and queues the pet line after More;
    food rations use current object naming in pet messages.
  - Current `FR 17729` is a run-sound `--More--`/pet-goal ordering frontier:
    screens are exact through 337, but by screen 338 JS has already printed a
    vault guard sound where C has not. C's next RNG is `dog_goal()` `rn2(4)`;
    JS instead reaches the later vault `dosounds()` `rn2(100)`. A broad
    `dog_goal()` terrain shortcut was tested and rejected because it regressed
    early pet movement.
- Production `js/` has no intentional debug I/O or frozen imports.
- The shopkeeper/sound/pet-More batch is committed; next edits should start
  from this checkpoint.
- Next queue:
  - Continue `seed0002` from cells screen 338 / `FR 17729`. Inspect the
    tty/run sound `--More--` boundary against C `dosounds()`, `moveloop_core()`,
    `topl.c:more()`, and the subsequent `dog_goal()` state. Preserve the exact
    visible run frame without advancing live state/RNG past C's post-dismissal
    boundary.
  - Keep `seed0360` in the sentinel queue because the user reported a local
    frozen-score regression; current frozen verification is full.

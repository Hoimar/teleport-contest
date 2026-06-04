# Teleport Implementation Loop

Live checkpoint only. For history, use `git log`, `git show`, `lessons.md` (avoid token-intensive full reads as explained in `AGENTS.md`'s "## Memory Routing"),
and `feature_map.md`.

## Context Rules

- Read this file fully before resuming a loop.
- Use `npm run agent:brief -- --target <target>` for targeted context.
- Search `lessons.md` and `feature_map.md`; do not full-read them by default.
- Regenerate broad corpus state with `node scripts/triage-corpus.mjs`.

## Current State

- Current branch in this workspace: `main`, ahead of origin.
- Latest committed parity repair: `Repair seed4500 startup and study timing`
  (see `git log` for the current hash).
- Last toolkit commit: `7d2f959` (`Track scratch tracing toolkit`).
- Latest verified parity repair:
  - `seed4500-knight-coverage`: `S 1814/1814 R 108275/108275 C 0 OK`.
  - Strict sentinels exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
  - Extra guards: `seed0103-knight-ride-pony` exact and
    `seed0501-priest-cast-read-turn` exact.
  - Implementation: scoped startup tutorial More flags to actual
    welcome/preamble tutorial handoff, restored liquid avoidance swim-tip
    emission after the avoidance More, added the C final busy turn before
    spellbook `learn()` side effects, and defined `MZ_HUGE=4` in monster
    movement (`C refs: options.c:ask_do_tutorial()`,
    hack.c:swim_move_danger()/handle_tip(), spell.c:study_book()/learn(),
    allmain.c:moveloop_core(), include/monflag.h`).
- Scratch trace/checkpoint files are agent-toolkit state and may be committed
  when useful; keep production parity and scratch-tool commits coherent.
- Strict sentinels are exact:
  `5/5 S 1063/1063 R 64569/64569 C 0`.
- `npm run parity:state -- --refresh-live` on the latest verified repair:
  checked-in public `exact 31/44 S 8563/11405 R 526848/792838 C 1`;
  hosted public cache `exact 30/44 S 8124/10982 R 437829/840358 C 1`;
  class `public-session-drift`; leaderboard fetch failed; strict sentinel exact.
- `node scripts/triage-corpus.mjs --markdown scratch/divergence-inventory.md`
  regenerated local divergence state after the `seed4500` WIP fix: `31/44`
  local sessions pass, including `seed0012`, `seed0108`, and `seed4500`.
- Hack audit remains `hard=0 suspicious=42`; `memory:lint` reports
  `issues=0`. Production `js/` has no intentional debug I/O or imports from
  `frozen/`.

## Latest Loop Checkpoint

- Latest verified repairs on 2026-06-04:
  - `seed0012-monk-vault-escort` committed at `7179887`, exact
    `S 308/308 R 13878/13878 C 0`, strict sentinels exact. Ported the vault
    escort cleanup boundary, fake-corridor restoration loop, active-guard sound
    suppression, and counted-search vault timing.
  - `seed0108-wizard-extcmd-wishlist` committed at `d71dd87`, exact
    `S 303/303 R 16958/16958 C 0`, strict sentinels exact. Fixed `#loot`
    take-out menu sequencing without RNG changes.
  - `seed4500-knight-coverage` WIP exact after startup/tutorial, swim-tip, and
    spellbook occupation timing repairs:
    `S 1814/1814 R 108275/108275 C 0`; strict sentinels exact; `seed0103`
    and `seed0501` guards exact.
  - Regression classification: target screen-only UI drift repaired; strict
    sentinel stable; public vs hosted remains session-file drift, not a local
    engine regression.
  - Next queue: choose the next checked-in public divergence; current
    high-signal candidates include `seed0360-wizard-world-tour` (post-startup
    map/RNG drift still shaped like `rn2(5)=>rn2(19)`) and early startup or
    mklev/u_init sessions from `scratch/divergence-inventory.md`.

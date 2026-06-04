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
- Last committed parity repair: `d71dd87` (`Repair loot take-out class menu`).
- Last toolkit commit: `7d2f959` (`Track scratch tracing toolkit`).
- Latest committed parity repair:
  - `seed0108-wizard-extcmd-wishlist`: `S 303/303 R 16958/16958 C 0 OK`.
  - Strict sentinels exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
  - Implementation: `#loot` take-out now follows C `query_classes()` class
    counting before the object-specific take-out menu (`C refs:
    pickup.c:use_container()`, `pickup.c:traditional_loot()`,
    pickup.c:query_classes()`).
- Scratch trace/checkpoint files are agent-toolkit state and may be committed
  when useful; keep production parity and scratch-tool commits coherent.
- Strict sentinels are exact:
  `5/5 S 1063/1063 R 64569/64569 C 0`.
- `npm run parity:state -- --refresh-live` after commit `7d2f959`:
  checked-in public `exact 30/44 S 7245/11405 R 468676/792838 C 1`;
  hosted public cache `exact 29/44 S 6806/10982 R 379657/840358 C 1`;
  class `public-session-drift`; leaderboard fetch failed; strict sentinel exact.
- `node scripts/triage-corpus.mjs --markdown scratch/divergence-inventory.md`
  regenerated local divergence state after the `seed0108` WIP fix: `30/44`
  local sessions pass, including `seed0012` and `seed0108`.
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
  - Regression classification: target screen-only UI drift repaired; strict
    sentinel stable; public vs hosted remains session-file drift, not a local
    engine regression.
  - Next queue: choose the next checked-in public divergence; current
    high-signal candidates include
    post-startup UI/display sessions and mklev/u_init sessions from
    `scratch/divergence-inventory.md`.

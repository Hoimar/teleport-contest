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
- Baseline commit before this cursor-fix pass: `a1c49b3`.
- Just-completed target: `seed0360-wizard-world-tour` frozen-scorer cursor
  regression.
- Active hypothesis for the next pass: retarget `seed0383-wizard-hallucinate`;
  RNG is exact and the remaining blocker is hallucinated new-level map/redraw
  drift after screen 195/196.

## Latest Loop Checkpoint

- Target: `seed0360-wizard-world-tour`.
- Current verification: full pass, `S 833/833 R 120639/120639`, `FS -`,
  `FR -`, `C 0`; `node frozen/ps_test_runner.mjs
  sessions/seed0360-wizard-world-tour.session.json` also passes
  `Screen 833/833`, `cursors 833/833`.
- Sentinel verification after the pass: total `S 430/1063 R 38877/64569`.
  `seed8000` and `seed0116` remain full passes; `seed0383` is
  `S 197/219 R 16915/16915`; `seed0002` is
  `S 83/595 R 5690/27158`; `seed0013` remains
  `S 0/99 R 580/4804`.
- Clean-end full verification: `S 1699/11405 R 233570/792838`; hack audit
  `hard=0 suspicious=38`; memory lint is clean.
- Implemented subsystem truth in this iteration:
  - Forced getpos cursor movement now uses `getpos.c:truncate_to_map()` edge
    shortening, so diagonal moves at the map edge do not drift on one axis.
  - Controlled teleport and farlook exits clear stale getpos prompt cursors so
    post-command message frames return the terminal cursor to the hero/map
    position (`C ref: teleport.c:teleds()`, `pager.c:do_look()`).
  - The initial `#levelchange` `getlin()` prompt places the cursor one column
    past the visible prompt for tty's invisible trailing input space
    (`C ref: win/tty/getline.c:hooked_tty_getlin()`).
- Production `js/` has no intentional debug I/O or frozen imports.
- Coherent commit pending for: `js/cmd.js`, `feature_map.md`, `lessons.md`, and
  this checkpoint.
- Next queue:
  - Retarget `seed0383-wizard-hallucinate`: RNG is complete, first visible
    blocker is hallucinated new-level map/redraw drift after screen 195/196.

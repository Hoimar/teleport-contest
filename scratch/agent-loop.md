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
- Baseline commit before the current `seed0383` pass: `5e4371b`.
- Just-completed target: `seed0360-wizard-world-tour` frozen-scorer cursor
  regression remains stable at full pass.
- Active hypothesis for the next pass: continue `seed0383-wizard-hallucinate`;
  RNG is exact and the remaining blocker is a `Monnam()` display-name side
  effect during fleeing/scary monster movement before screen 199.

## Latest Loop Checkpoint

- Target: `seed0383-wizard-hallucinate`.
- Current verification: `S 200/219 R 16915/16915`, `FS 199:char:map:l`,
  `FR -`, `C 0`.
- User-requested sentinel check: `seed0360-wizard-world-tour` remains a full
  pass, `S 833/833 R 120639/120639`, `FS -`, `FR -`, `C 0`.
- Sentinel verification after the pass: total `S 433/1063 R 38877/64569`.
  `seed8000` and `seed0116` remain full passes; `seed0002` remains
  `S 83/595 R 5690/27158`; `seed0013` remains
  `S 0/99 R 580/4804`.
- Harness checks: hack audit `hard=0 suspicious=39`; memory lint is clean.
- Implemented subsystem truth in this iteration:
  - Active override/menu screens suppress the ordinary input-boundary
    Hallucination refresh while C is still inside `select_menu()`.
  - Full-screen tty menu dismissal before level-teleport selection performs the
    `erase_menu_or_text()` full redraw shape (`docrt()+flush_screen()`).
  - Level teleport consumes old-level `vision_recalc(2)` Hallucination warning
    redraws before save, then performs the arrival-side monster overlay needed
    to match C's display RNG through the materialize frame.
  - Visible monster pickup messages now use a `Monnam()`-style hallucinated
    subject and real food floor names, and pickup refreshes the monster layer
    before the following object-layer hallucination redraw.
- Production `js/` has no intentional debug I/O or frozen imports.
- Coherent commit pending for: `js/allmain.js`, `js/cmd.js`, `js/monmove.js`,
  `js/vision.js`, `feature_map.md`, `lessons.md`, and this checkpoint.
- Next queue:
  - Continue `seed0383-wizard-hallucinate`: C step 199 has a display-RNG
    `Monnam()` side effect around `distfleeck()`/scary movement before the
    final monster/object redraw. Do not patch with display skips; port the
    relevant monster-message side effect.

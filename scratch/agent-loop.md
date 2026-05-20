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
- Baseline commit before the current JS batch: `d0d699b`.
- Current target: `seed0002-healer-reflection-drummer` has advanced from
  the prior focused checkpoint `S 281/595 R 12877/27158` to focused cells
  `S 323/595 R 17551/27158` (`frozen/score.sh` cells `323/595`,
  cursor-inclusive screen score `319/595`).
- Recently completed targets still full after this pass: `seed0383`,
  `seed5002`, `seed0116`, `seed0360`, and `seed8000`.
- User-requested regression queue item `seed0360-wizard-world-tour` is fixed:
  `S 833/833 R 120639/120639`, exact screens, cursors, and RNG.

## Latest Loop Checkpoint

- Target: `seed0002-healer-reflection-drummer`.
- Current verification: focused cells `S 323/595 R 17551/27158`,
  `FS 323:char:map:L`, `FR 17043:rn2(1)=0=>rn2(5)=0`, `C 4`.
- Sentinel verification after the pass: total `S 692/1063 R 50746/64569`.
  `seed8000`, `seed0116`, `seed0383`, and `seed0360` remain full passes;
  `seed0013` remains first-screen blocked with `R 588/4804`.
- Frozen public score after this pass is `5/44` passing. Current exact
  passes are `seed0116`, `seed0360`, `seed0383`, `seed5002`, and
  `seed8000`; the user-reported `seed0360` frozen-score regression is absent
  locally (`S 833/833 R 120639/120639`).
- Harness checks: hack audit `hard=0 suspicious=39`; memory lint is clean.
- Implemented subsystem truth in this iteration:
  - Sink sewage/vomit now consumes the Con-shaped hunger-loss RNG, starts
    three hidden helpless turns, and prints `You can move again.` at the
    negative-multi finish. Declining the sink prompt falls through to the
    ordinary inventory drink prompt.
  - Healing and extra-healing potion effects now own their dice, max-HP
    increments, and Con/Str exercise front doors.
  - Burdened helpless/vomit finish now only partly credits movement debt; the
    following input boundary can still allocate the C catch-up monster pass.
  - Ordinary stair traversal now preserves stair flags through the deferred
    level-change path, lands on destination stairs, applies burdened descent
    `rnd(3)` damage, and latches the old map under the arrival `--More--`
    until destination `docrt()` resumes after dismissal.
  - Replay-backed dungeon scaffolding now retains both the DOD level-1 exit
    branch and DOD level-2 Mines branch with `mines_dnum`, enough for current
    branch predicates during generated level 2.
  - Vault `makevtele()` uses the single `!noteleport && !rn2(3)` front door
    instead of an extra branch-level gate, fixing the destination generation
    RNG slice.
  - Uppercase corridor run turning uses a closer `hack.c:lookaround()`
    `corrct`/`noturn`/`last_str_turn` shape, reaching the door-bump frame
    without the earlier boulder detour regression.
  - Monster-opened/removed doors now immediately recompute vision like
    `monmove.c:UnblockDoor()` before later monsters act.
  - Pet inventory drop messaging is visible-square gated and packable behind
    higher-priority pending toplines; javelin naming is covered for current
    projectile evidence.
  - Current `FR 17043` is during the post-stair `L` door-bump frame. The
    door-bump message and cursor match, but C consumes `move_special(priest.c)`
    RNG before JS ordinary movement RNG; a naive unconditional shopkeeper
    special RNG front door regressed earlier frames and was not kept.
- Production `js/` has no intentional debug I/O or frozen imports.
- Coherent commit pending for: `js/allmain.js`, `js/cmd.js`, `js/dog.js`,
  `js/mklev.js`, `js/monmove.js`, `feature_map.md`, `lessons.md`, and this
  checkpoint.
- Next queue:
  - Continue `seed0002` from cells screen 323 / `FR 17043`. Inspect C
    `move_special(priest.c)` shopkeeper/priest predicates and current
    shopkeeper state around the door-bump frame before changing movement.
  - Keep `seed0360` in the sentinel queue because the user reported a local
    frozen-score regression; current frozen verification is full.

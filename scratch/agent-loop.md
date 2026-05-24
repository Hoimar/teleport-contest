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
- Current dirty batch is based on `cf1dfc5` (`Pass seed0060 Orc Rogue session`).
- Current target `seed0030-ten-diverse-deaths` advanced to:
  `S 42/1953 R 7173/105529 FS 23:char:mixed:l FR 6732:rnd(5)=1=>rn2(5)=0 C 0`.
- Strict sentinels are exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
- Full local public corpus after the dirty batch:
  `exact 22/44 S 3713/11405 R 285834/792838 C 0`.
- Hosted public cache still differs from checked-in sessions
  (`public-session-drift`).
- Hack audit remains `hard=0 suspicious=41`; `memory:lint` reports
  `issues=0`. Production `js/` has no intentional debug I/O or imports from
  `frozen/`.

## Latest Loop Checkpoint

- Target: `seed0030-ten-diverse-deaths`.
- Focused verification: `S 42/1953 R 7173/105529 FS 23:char:mixed:l FR 6732:rnd(5)=1=>rn2(5)=0 C 0`.
- Implemented subsystem truth in this iteration:
  - `!legacy` Tourist startup now applies the recomputed Hawaiian-shirt AC
    before the first map/status frame, while legacy startup keeps the
    pre-`find_ac()` status until the deferred startup pager update
    (`C refs: src/u_init.c:u_init_inventory_attrs()`,
    `src/u_init.c:u_init_skills_discoveries()`,
    `src/do_wear.c:find_ac()`);
  - carried gold is inserted at the front of JS inventory so systems walking
    inventory order, especially pet `dog_goal()` food scans, see `$` before
    lettered items (`C refs: src/invent.c:assigninvlet()`,
    `src/invent.c:reorder_invent()`, `src/dogmove.c:dog_goal()`).
- Verification:
  - `npm run verify -- --target seed0030-ten-diverse-deaths --full`
    -> target advanced, strict exact, full suite
    `S 3713/11405 R 285834/792838`, hack audit clean, memory lint clean.
  - `npm run parity:state -- --no-leaderboard`
    -> checked-in corpus `exact 22/44 S 3713/11405 R 285834/792838 C 0`,
    strict exact, hosted cache drift noted.
- Next queue:
  - Commit this coherent verified batch.
  - Per user request, hand off after this iteration instead of starting the
    next subsystem.
  - When resumed, continue `seed0030-ten-diverse-deaths` at the first mismatch:
    expected `There's some graffiti on the floor here.--More--`, actual blank;
    RNG first mismatch `6732:rnd(5)=1=>rn2(5)=0`. Start with engraving /
    floor-look C refs, not startup AC or door logic.

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
- Current dirty batch is based on `099c764` (`Pass seed0016 Healer sleep zap session`).
- Current target `seed0060-orc-rogue-kick-search` is exact:
  `S 41/41 R 3626/3626 C 0`.
- Strict sentinels are exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
- Full local public corpus after the dirty batch:
  `exact 22/44 S 3688/11405 R 285240/792838 C 0`.
- Hosted public cache still differs from checked-in sessions
  (`public-session-drift`); leaderboard fetch failed during
  `parity:state -- --refresh-live`.
- Hack audit remains `hard=0 suspicious=41`; `memory:lint` reports
  `issues=0`. Production `js/` has no intentional debug I/O or imports from
  `frozen/`.

## Latest Loop Checkpoint

- Target: `seed0060-orc-rogue-kick-search`.
- Focused verification: `S 41/41 R 3626/3626 FS - FR - C 0`.
- Implemented subsystem truth in this iteration:
  - Orc Rogue startup now runs C-shaped race inventory after role inventory:
    racial object substitutions, non-Wizard `Xtra_food`, orcish object
    preknowledge, `nocreate` reset, and deferred starting-inventory discovery
    order (`C refs: src/u_init.c:u_init_role()`,
    `src/u_init.c:u_init_race()`, `src/u_init.c:ini_inv_obj_substitution()`,
    `src/u_init.c:u_init_skills_discoveries()`);
  - same-turn kicked-location avoidance now covers tame/pacific movement from
    both dog and generic monster paths and clears on later time-consuming
    non-kick commands (`C refs: src/dokick.c:dokick()`,
    `src/cmd.c`, `src/monmove.c:m_avoid_kicked_loc()`,
    `src/dogmove.c:dog_move()`);
  - display `newsym()` now supports infravision drawing for out-of-sight
    infravisible monsters via `couldsee()` without changing `IN_SIGHT`
    (`C refs: include/display.h:_see_with_infrared()`,
    `src/display.c:newsym()`, `src/polyself.c:set_uasmon()`);
  - inventory/discovery/insight naming now treats known orcish daggers as
    object names while retaining the `crude dagger` descriptor, and `^X`
    weapon status uses skill class for racial short swords
    (`C refs: src/objnam.c:doname_base()`,
    `src/o_init.c:dodiscovered()`, `src/insight.c:weapon_insight()`).
- Verification after the memory edit:
  - `npm run verify -- --target seed0060-orc-rogue-kick-search --full`
    -> target exact, strict exact, full suite
    `S 3688/11405 R 285240/792838`, hack audit clean, memory lint clean.
- Next queue:
  - Commit this coherent verified batch.
  - Continue the porting loop from corpus triage; likely next public target:
    `seed0030-ten-diverse-deaths`, unless fresh triage suggests a narrower
    subsystem target.

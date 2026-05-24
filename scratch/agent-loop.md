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
- Current dirty batch is based on `436c5bb` (`Tighten harness guidance`).
- Current target `seed0016-healer-newmoon-eat-zap` is exact:
  `S 36/36 R 3656/3656 C 0`.
- Strict sentinels are exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
- Full local public corpus after the dirty batch:
  `exact 21/44 S 3647/11405 R 284149/792838 C 0`.
- Hosted public cache still differs from checked-in sessions
  (`public-session-drift`); leaderboard fetch failed during
  `parity:state -- --refresh-live`.
- Hack audit remains `hard=0 suspicious=41`; `memory:lint` reports
  `issues=0`. Production `js/` has no intentional debug I/O or imports from
  `frozen/`.

## Latest Loop Checkpoint

- Target: `seed0016-healer-newmoon-eat-zap`.
- Focused verification: `S 36/36 R 3656/3656 FS - FR - C 0`.
- Implemented subsystem truth in this iteration:
  - Healer startup role/race math now uses C-like attr distribution, race
    `ATTRMAX()`, level-0 HP/Pw advances, and deferred worn AC
    (`C refs: src/u_init.c:u_init_misc()`, `src/attrib.c:newhp()`,
    `src/exper.c:newpw()`, `include/attrib.h:ATTRMAX()`);
  - apply prompt compactification, stethoscope self-status piousness, apple
    text, and inventory stack consumption now follow the relevant command and
    object paths (`C refs: src/invent.c:getobj()`,
    `src/insight.c:ustatusline()`, `src/eat.c`, `src/mkobj.c:splitobj()`);
  - self-zapped sleep routes through `zapyourself()`, uses sleeping
    metabolism, and resumes nomul/monster-turn work after blocking More
    prompts (`C refs: src/zap.c:dozap()`, `src/zap.c:zapyourself()`,
    `src/eat.c:gethungry()`, `src/allmain.c:moveloop_core()`);
  - starting pets carry full monster flags, no-hands pets split multi-stacks
    with `next_ident()`, and pet pickup messages can queue behind sleep More
    (`C refs: src/mon.c:can_carry()`, `src/dogmove.c:dog_invent()`,
    `src/mkobj.c:splitobj()`).
  - Healer/Priest/Wizard spell-list chance fields now use role stats from
    `role.c:roles[]` and C-like `spell.c:percent_success()` penalties instead
    of a Healer shortcut; stone-to-flesh does not receive the healing-spell
    bonus (`C refs: src/spell.c:percent_success()`, `src/role.c:roles[]`);
  - discovery rows use object type names with wand descriptors, so encountered
    wands print appearance suffixes like `(platinum)` (`C refs:
    src/o_init.c:dodiscovered()`, `src/objnam.c:obj_typename()`);
  - `^X` background/attributes use race adjectives, new-moon lines, and
    racial `ATTRMAX()` limits for current evidence (`C refs:
    src/insight.c:background_enlightenment()`,
    src/insight.c:attributes_enlightenment()`, `include/attrib.h:ATTRMAX()`);
  - generic monster-turn More pauses were narrowed: prayer finish and
    hallucinated pet-combat map updates can complete the C turn boundary
    without a broad `_more` stop (`C refs: src/pray.c:prayer_done()`,
    `src/allmain.c:moveloop_core()`, `win/tty/topl.c:more()`);
  - pet inventory messages only queue `--More--` when packed topline text
    overflows, and deferred pet-death More resumes accrue burdened movement
    debt without starting an immediate extra catch-up pass (`C refs:
    src/dogmove.c:dog_invent()`, `src/topl.c:more()`,
    `src/allmain.c:u_calc_moveamt()`).
- Verification after the memory edit:
  - `npm run verify -- --target seed0016-healer-newmoon-eat-zap --full`
    -> target exact, strict exact, full suite
    `S 3647/11405 R 284149/792838`, hack audit clean, memory lint clean.
  - `npm run parity:state -- --refresh-live` -> checked-in public exact
    `21/44`, strict exact, hosted drift classified as `public-session-drift`.
- Next queue:
  - Commit this coherent verified batch.
  - Continue the porting loop from corpus triage; likely next public targets:
    `seed0060-orc-rogue-kick-search` or `seed0030-ten-diverse-deaths`.

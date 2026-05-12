# Teleport Implementation Loop

This file is the live handoff checkpoint, not a full history. It was compacted on 2026-05-12 to reduce agent context load. Older iteration detail is intentionally omitted; use `git log`, `git show`, `lessons.md`, and `feature_map.md` only when a specific past decision needs to be recovered.

## Context Hygiene

- Read this file in full before resuming the loop; it is intentionally compact.
- Prefer `rg` over full reads for large persistent memory:
  - `lessons.md`: grep by subsystem, function, C file, session, or FR number.
  - `feature_map.md`: grep by session id, subsystem row, JS file, or C source.
  - `scratch/divergence-inventory.md`: generated inventory; grep or regenerate with `scripts/triage-corpus.mjs`.
  - `sessions/*.session.json`: do not read in full; use `scripts/triage-session.mjs`, `scripts/trace-dog-goal.mjs`, or targeted JSON searches.
- Full-read `AGENTS.md` when loop policy is uncertain. Otherwise use targeted searches for workflow clauses.
- Full-read local `teleport-*` skill `SKILL.md` files when invoked; they are short.

## Current State

- Branch: `main`.
- Baseline requested by user: resume from commit `04d9360` and continue on the current branch without pushing.
- Latest committed loop work: current `HEAD` (`Handle monster trapped-door movement`).
- Local divergence from remote: branch is ahead of `origin/main`; do not push unless explicitly asked.
- Current target: `seed0383-wizard-hallucinate` exact-RNG screen-0 map glyph drift after Oracle movement parity.
- Active subsystem hypothesis: core RNG ownership for `seed0383` is complete (`R 16915/16915`). The remaining first mismatch is display/map state on screen 0, with wall-glyph cells around the Oracle/startup map missing in JS. Next work should compare map terrain, remembered terrain, wallification, and hallucination/display context before touching RNG-bearing turn code.

## Latest Verified Scores

- Sentinel after the monster passwall / trapped-door movement slice: total `S 162/1063 R 34338/64569`.
- `seed8000-tourist-starter`: `S 23/23 R 3060/3130`, FR `3047`.
- `seed0002-healer-reflection-drummer`: `S 11/595 R 1266/27158`, FR `1215`.
- `seed0013-friday13-save-then-fullmoon-restore`: `S 0/99 R 535/4804`, FR `507`.
- `seed0116-wizard-wear-shop`: `S 127/127 R 12562/12562`, PASS; remaining comparison notes are four cursor-only prompt positions.
- `seed0383-wizard-hallucinate`: `S 1/219 R 16915/16915`, no RNG mismatch; remaining mismatch is screen 0 map glyph drift.
- Full suite after latest production slice: `S 163/11406`, 1/44 passing (`seed0116`).

## Recent Implementation Delta

The recent loop advanced `seed0383` through multiple general subsystems without adding per-seed reward hacks:

- Fog cloud gas-region lifetime and `inside_gas_cloud()` TTL maintenance.
- Hallucination/confusion Wisdom exercise on 5-turn boundaries.
- Swallow timer decrement, expulsion, `unstuck()`, `mnexto()` relocation, and `mspec_used` countdown.
- Occupied-square and swallowed-hero melee front doors using the same current-evidence `uhitm()` shape.
- Hero-killed tame monster path: current `abuse_dog()`/hallucination yelp/`xkilled()` gates, live monster removal, and redraw.

Latest committed production slice:

- Commit: `d9f72d4 Handle pet abuse on hero kill`.
- Evidence: `seed0383` moved from FR `11372` / `R 11419/16915` to FR `11387` / `R 11430/16915`.
- Classification: the pet-abuse blocker is resolved for current evidence; remaining blocker is ordinary movement candidate geometry after the pet is removed.
- Known limitation: hero combat is still only a narrow front door. Corpses, treasure object creation, luck/accounting, passive effects, and general `uhitm()` remain incomplete.

Committed production slice:

- Oracle / turn-tail generation slice:
  - added `AGENTS.md` C-reference breadcrumb guidance
  - loaded `dat/oracle.lua` structure: centered room, centaur statues, Delphi subroom, fountains, Oracle, random rooms, corridors, and wallification
  - added C-order `makemon(NULL,0,0)` random placement before species selection and wired `maybe_generate_rnd_mon()` to live `makemon()`
  - prevented dead pets from reappearing through level-teleport arrival fallback
  - added Oracle ambient `dosounds()` gate and tame-kill alignment abuse
  - added queued message-more handling and the paranoid pool prompt front door
- Evidence: `seed0383` moved from `R 11430/16915` / FR `11387` to `R 16801/16915` / FR `16750`. Sentinel screens stayed `S 162/1063`; sentinel RNG total moved to `R 34224/64569`.
- Residual debt: Oracle screen 0 still has map glyph drift, random-room/ordinary movement deterministic state still diverges, and full Oracle Lua/runtime special level support remains partial.

Latest committed production slice:

- Ordinary monster item-search / minvent slice:
  - tightened `muse.c:searches_for_item()` front door so ordinary intelligent collectors chase specific usable magic instead of every scroll/potion/amulet
  - added the `m_move()` `lined_up()` suppression gate so monsters already positioned for an attack do not detour into item search
  - retained monster-init objects on `mon.inventory` and applied `m_initthrow()` stack quantities via `rn1(oquan, 3)`
- Evidence: the original `seed0383` gnome blocker moved from FR `16750` (`rn2(24)` vs `rn2(32)`) to FR `16755` (`rnd(2)` in C `mattacku()` vs JS next-monster `distfleeck()`). Sentinel screens stayed `S 162/1063`; `seed0116` remains a full pass.
- Classification: lagging `seed0383` RNG total decreased to `R 16761/16915` because retaining real monster inventory changes later divergent state, but this is structural minvent debt reduction, not score optimization.

Previous verified production slice:

- Monster wear / weapon movement slice:
  - factored basic monster boot wear into `js/mon_wear.js`
  - applied creation-time `m_dowear(mtmp, TRUE)` after monster initial inventory so startup boots are worn without later delay
  - allowed moved `AT_WEAP` monsters to enter ranged `mattacku()` and consume `AC_VALUE()` before the still-unimplemented `thrwmu()` path
  - modeled the failed ranged-selection `weapon_check = NEED_WEAPON` handoff and the later close HTH wield turn
  - added `mfndpos()`'s no-diagonal-through-door rule for ordinary movement candidates
- Evidence: `seed0383` moved from FR `16755` / `R 16761/16915` to FR `16834` / `R 16868/16915`. Sentinel screens stayed `S 162/1063`; sentinel RNG total moved to `R 34291/64569`; full public screens stayed `S 162/11406`.
- Classification: the FR `16755` weapon/AC boundary was resolved structurally. It exposed the later ordinary `m_move()` denominator gap that the passwall/trapped-door movement slice resolved.

Latest verified production slice:

- Monster passwall / trapped-door movement slice:
  - added `mfndpos()` wall-passability front door for `M1_WALLWALK` plus C ref `hack.c:may_passwall()`
  - allowed hand-capable monsters to include closed doors as openable movement candidates
  - added post-move closed/trapped door handling with synchronized `flags`/`doormask`, C ref `monmove.c:postmov()` and `mb_trapped()` `rnd(15)` damage ownership
  - added awake confusion/stun recovery gates before `distfleeck()`, C ref `monmove.c:dochug()`
- Evidence: `seed0383` moved from FR `16834` / `R 16868/16915` to `R 16915/16915` with no RNG mismatch. Sentinel screens stayed `S 162/1063`; sentinel RNG total moved to `R 34338/64569`; full public screens moved to `S 163/11406`.
- Classification: later ordinary movement denominator drift and trapped-door status recovery are resolved structurally. Remaining `seed0383` blocker is display/map glyph drift on screen 0, not RNG ownership.

## Current Queue

1. Classify `seed0383` exact-RNG screen-0 map glyph drift:
   - `node scripts/triage-session.mjs sessions/seed0383-wizard-hallucinate.session.json`
   - compare the reported Oracle/startup wall cells against actual terrain, remembered glyph state, `wallification()`, and `display.c` rendering
   - because RNG is exact, do not change turn ordering or movement to chase this mismatch.
2. Replace the menu/discovery residual scaffolding with real `o_init` description storage, discovery persistence, and broader role inventory/menu text when it becomes the highest safe structural next step.
3. Broaden sleeping/hider front doors only from C evidence if a session reaches them.
4. Keep save/restore and broader startup/display blockers secondary unless the active queue is blocked.

## Regression Notes

- `seed0116` now passes fully. Avoid broad changes that disturb Soko zoo, pet movement, command prompt, object color, menu lifecycle, or turn-tail state without a clear classification and sentinel rerun.
- `seed0002` and other non-target RNG prefixes shifted during shared hero-kill/death-side-effect work while matched screens stayed unchanged. Treat these as queued evidence only if those sessions become active targets.
- `seed0383` now has exact RNG but still has screen `0` mismatch because map/display context remains incomplete; do not optimize visible screens directly or change RNG-bearing movement for this blocker.

## Verification Cadence

- Run target triage after each production edit.
- Run sentinel suite after each meaningful edit.
- Run the full suite after broad shared changes or every 3-5 meaningful implementation iterations.
- Update `feature_map.md` and `lessons.md` only when subsystem truth changes.
- Make local commits after coherent, verified implementation improvements; do not push.

## Compaction Note

Historical detail removed from this file included older iterations for seed0116 special-level/zoo work, seed0383 startup/special-level work, and earlier probes. Durable subsystem lessons from those iterations are preserved in `lessons.md` and summarized in `feature_map.md`. For old operational details, prefer targeted `git show`/`git log -S` searches over re-expanding this checkpoint.

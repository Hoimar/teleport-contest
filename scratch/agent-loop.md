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
- Latest loop work: seed0383 swallowed `gulpmu()` cold plines, swallowed display, pre-finish delayed-occupation turn, and a `#wizintrinsic` menu triage/dehack pass.
- Local commit note: committing is currently blocked by `.git/index.lock` creation failing with a read-only filesystem error; keep verified work in the worktree until git writes are available again.
- Local divergence from remote: branch is ahead of `origin/main`; do not push unless explicitly asked.
- Current target: `seed0383-wizard-hallucinate` `#wizintrinsic` menu lifecycle.
- Active subsystem hypothesis: core RNG ownership for `seed0383` is complete (`R 16915/16915`). The swallowed cold-damage and delayed-occupation boundary is resolved for current evidence. The new first mismatch is screen 162: C shows the `wizcmds.c:wiz_intrinsic()` paged `NHW_MENU` headed `Which intrinsics?`, with property rows and footer, while JS still uses a one-line prompt and applies hallucination immediately on `h`. Next work should replace that fallback with a real menu state where `h` toggles the row and Enter confirms before the timeout pline.

## Latest Verified Scores

- Sentinel after the seed0383 swallowed `gulpmu()`/display slice and dehack cleanup: total `S 324/1063 R 34338/64569`.
- `seed8000-tourist-starter`: `S 23/23 R 3060/3130`, FR `3047`.
- `seed0002-healer-reflection-drummer`: `S 11/595 R 1266/27158`, FR `1215`.
- `seed0013-friday13-save-then-fullmoon-restore`: `S 0/99 R 535/4804`, FR `507`.
- `seed0116-wizard-wear-shop`: `S 127/127 R 12562/12562`, PASS; cursor-only prompt drift cleared.
- `seed0383-wizard-hallucinate`: `S 163/219 R 16915/16915`, no RNG mismatch; remaining mismatch is screen 162 `#wizintrinsic` menu rendering/selection lifecycle.
- Full suite after latest production slice: `S 326/11406`, 1/44 passing (`seed0116`).

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

Latest verified production slice:

- Seed0383 display/command/special-level and vision slice:
  - cleared the quest-intro pager body before writing role history (`C ref: allmain.c:newgame() -> com_pager("legacy")`)
  - rendered undiscovered secret doors as oriented walls and liquids as the corpus-compatible DEC backtick byte (`C ref: display.c:wall_angle()`, `display.c:back_to_glyph()`)
  - replaced the hardcoded Wizard `#levelchange` level-16/17 messages with a queued `pluslvl()`/innate-message path and tty prompt packing (`C ref: exper.c:pluslvl()`, `attrib.c:adjabil()`)
  - marked the current debug level-teleport menu row from dungeon coordinates (`C ref: teleport.c:level_tele()`)
  - lit the full `bigrm-12` selection and ran final `wallification()` before the post-load flip (`C ref: dat/bigrm-12.lua`, `sp_lev.c:lspo_final_map_cleanup()`)
  - hid covered floor objects/traps under pools and lava (`C ref: display.h:covers_objects()`)
  - blocked line of sight through waterwalls/lavawalls/clouds (`C ref: vision.c:does_block()`)
  - rendered visible T-walls from `seenv` instead of raw terrain type (`C ref: display.c:wall_angle()`)
- Evidence: `seed0383` moved from `S 1/219` to `S 136/219` while preserving `R 16915/16915`; sentinel moved from `S 162/1063` to `S 297/1063`; full public screens moved from `S 163/11406` to `S 299/11406`.
- Classification: this is display, command prompt, special-level, and vision truth, not reward-hacking. It exposes the next structural blocker as object appearance naming/discovery text on screen 73.

Latest verified production slice:

- Seed0383 object appearance / delayed occupation message slice:
  - retained live shuffled amulet/wand descriptions from `o_init` and used them for unknown carried appearance names
  - corrected current stale wand constants to generated object IDs (`WAN_FIRE=430`, `WAN_DEATH=433`)
  - hid BUC, enchantment, and charges for unknown appearance objects while keeping startup inventory known
  - allowed delayed armor occupations to pause/resume across tty `--More--`
  - emitted current pet `mattackm()` miss/hit plines and packed them into one `--More--` prompt
- Evidence: `seed0383` moved from `S 136/219` to `S 139/219` while preserving `R 16915/16915`; sentinel moved from `S 297/1063` to `S 300/1063`; full public screens moved from `S 299/11406` to `S 302/11406`.
- Classification: this is `o_init`/`objnam`/inventory truth plus a first delayed-occupation message boundary, not reward-hacking. It exposes the next blocker as pet kill side-effect timing at a monster-message `--More--`.
- Discarded direction: deferring pet kill removal until the next input moved the map in the right direction but broke flat RNG (`R 10262/16915`, first mismatch changed to `rn2(3)` vs `rn2(5)`) because `movemon()` could not resume inside the pass. Treat this as evidence for a resumable `movemon()`/`pline()` boundary or a carefully scoped pending-side-effect queue.

Latest verified production slice:

- Seed0383 delayed monster-message / warning slice:
  - nested tty `--More--` reads now occur inside the current pet-combat and visible monster-pickup message paths, preserving the same JS call stack and flat RNG order
  - pet `mattackm()` now emits the `monkilled()`-style visible death message before corpse/growth/removal side effects
  - non-tame `mpickstuff()` now emits visible pickup plines before floor extraction and stays silent for unseen pickups
  - warning glyphs now display for unseen hostile monsters within `Warning` range and old unseen/unremembered warning cells are cleared
- Evidence: `seed0383` moved from `S 139/219` to `S 140/219` while preserving `R 16915/16915`; sentinel moved from `S 300/1063` to `S 301/1063`; full public screens moved from `S 302/11406` to `S 303/11406`.
- Classification: this is message/display subsystem truth, not reward-hacking. It exposes the next blocker as map-state drift after the second nested message: expected and actual message text match, but warning markers and monster positions differ.

Latest verified maintenance slice:

- `o_init` / `objnam` descriptor broadening:
  - retained upstream `objects.h` descriptor rows for rings, potions, scroll labels, and fixed scroll labels in addition to existing amulet/wand rows
  - unknown carried ring/potion/scroll names now come from live shuffled description state (`C ref: objnam.c:xname()`, `o_init.c:shuffle_all()`) and suppress BUC/enchantment text while unknown
  - pluralized `scroll labeled ...` inventory names without adding evidence strings
- Evidence: target `seed0383` unchanged at `S 140/219 R 16915/16915`; sentinel unchanged at `S 301/1063 R 34338/64569`; full public suite unchanged at `S 303/11406` with 1/44 passing; `seed0116` remains `S 127/127 R 12562/12562`.
- Classification: structural object identity debt reduction, not a screen-count optimization. The active `seed0383` first mismatch remains warning/spatial map drift at screen 139.
- Blocker analysis note: direct boundary sampling shows the map mismatch exposes earlier hidden ordinary-monster spatial drift (expected/actual positions differ for warning-visible hostile markers and a centaur) rather than a simple message text or RNG ownership issue. Avoid coordinate patches; compare `monmove.c:m_move()` deterministic targeting/candidate phases before changing RNG-bearing movement.

Latest verified movement-state maintenance slice:

- Hero track ring / ordinary `m_move()` retargeting:
  - added `js/track.js` for `track.c:initrack()/settrack()/gettrack()` and record the hero track at the turn-boundary
  - wired ordinary non-pet `m_move()` to use `gettrack()` when the C `should_see` gate is false and the monster has eyes
  - reset the hero track ring after level teleport arrival, matching `cmd.c`'s `initrack()`; this fixed a transient `seed0116` regression where a Soko newt followed stale previous-level coordinates
  - moved global warning refresh out of screen serialization and into the main input-boundary path, matching `allmain.c` `see_monsters()` timing while preserving movement-side `newsym()` updates
- Evidence: target `seed0383` unchanged at `S 140/219 R 16915/16915`; sentinel unchanged at `S 301/1063 R 34338/64569` after the level-change reset; full public suite unchanged at `S 303/11406` with 1/44 passing; `seed0116` remains `S 127/127 R 12562/12562`.
- Classification: structural movement-state debt reduction, not score optimization. Hero tracks are now available for ordinary monsters, but the active `seed0383` screen-139 drift is not explained by missing hero-track fallback.

Latest verified movement-state maintenance slice:

- `m_balks_at_approaching()` front door:
  - added deterministic approach gating for wielded polearms, aklys autoreturn preferred range, and current ranged attack availability (`C ref: monmove.c:m_balks_at_approaching()`, `mhitu.c:ranged_attk_available()`, `weapon.c:autoreturn_weapon()`)
  - threaded `appr == -2` preferred-range candidate selection through the minimal ordinary `m_move()` path
- Evidence: target `seed0383` unchanged at `S 140/219 R 16915/16915`; `seed0116` remains `S 127/127 R 12562/12562`; sentinel unchanged at `S 301/1063 R 34338/64569`; full public suite unchanged at `S 303/11406` with 1/44 passing. `seed4500-knight-coverage` RNG prefix improved from `1752/108275` to `1772/108275` with no screen-count change.
- Classification: structural movement-state debt reduction, not score optimization. The active `seed0383` screen-139 drift is not explained by the missing approach gate; continue comparing deterministic `m_move()` candidate/target phases.

Latest verified message/combat boundary slice:

- Monster pickup and physical `mattacku()` pline boundaries:
  - visible non-pet `mpickstuff()` now leaves packed tty `--More--` pending instead of blocking before later same-pass map updates (`C ref: mon.c:mpickstuff()`, `pline.c:pline_mon()`)
  - physical monster-to-hero attacks now emit current `hitmsg()`-style clauses and flush an already-pending monster topline before applying the new hit message boundary (`C ref: mhitu.c:hitmsg()`)
- Evidence: target `seed0383` moved from `S 140/219 R 16915/16915` to `S 143/219 R 16915/16915`; sentinel moved from `S 301/1063 R 34338/64569` to `S 304/1063 R 34338/64569`; full public suite moved from `S 303/11406` to `S 306/11406` with 1/44 passing. `seed0116` remains `S 127/127 R 12562/12562`.
- Classification at that point: structural tty/message-combat boundary progress, not reward hacking. Physical hit plines and the initial engulf pline landed at C-like pending-more boundaries while preserving exact flat RNG, exposing the later screen-142 swallowed cold-damage boundary that the next slice resolved.
- Notable non-sentinel movement: full-suite `seed4500-knight-coverage` RNG prefix is now `1769/108275`, close to the prior `1772/108275` m-balk result, with no screen-count change.
- Discarded direction: making the ice-vortex freezing message immediate advanced visible messages but broke exact `seed0383` RNG at FR `10483` (`rn2(5)` expected vs `rn2(20)` actual) because the repeated swallowed cold damage was split across the wrong `--More--` boundary. The retained fix uses packable `gulpmu()` damage plines and moves the extra swallowed turn before the finish message.

Latest verified swallowed-combat/menu-triage/dehack slice:

- Swallowed `gulpmu()` / delayed occupation / display:
  - repeat `gulpmu()` cold/fire/electric plines now use packable tty topline behavior instead of forcing every damage line to block (`C ref: mhitu.c:gulpmu()`, `pline.c:pline()`)
  - delayed armor finish now waits behind one swallowed pre-finish turn, matching `allmain.c:moveloop_core()`'s hero-can-move loop before `unmul()` prints `gn.nomovemsg`
  - swallowed display now activates after the initial engulf `--More--` and renders the colored 3x3 stomach glyph (`C ref: display.c:swallowed()`, `display.c:swallow_to_glyph()`)
- Evidence: target `seed0383` moved from `S 143/219 R 16915/16915` to `S 163/219 R 16915/16915`; sentinel moved from `S 304/1063 R 34338/64569` to `S 324/1063 R 34338/64569`; full public suite moved from `S 306/11406` to `S 326/11406` with 1/44 passing. `seed0116` remains `S 127/127 R 12562/12562`.
- Systematic triage result: the new first mismatch is `seed0383` screen 162, key Enter, class `char`, surface `mixed`, no RNG mismatch. Expected is the `wizcmds.c:wiz_intrinsic()` `NHW_MENU` (`Which intrinsics?`, property rows, page footer); actual is the stale one-line prompt `Which intrinsics?`.
- Dehack cleanup: removed the stale `swallowedWearMore` command branch. The wrong assumption was that Space after `You finish your dressing maneuver.` should advance the pending swallowed turn; current evidence shows that turn belongs before the finish message, in the immobile turn loop. Sentinel and target triage were unchanged by the removal.

## Current Queue

1. Replace the `#wizintrinsic` one-line prompt fallback with a real menu:
   - `node scripts/triage-session.mjs sessions/seed0383-wizard-hallucinate.session.json`
   - inspect `wizcmds.c:wiz_intrinsic()` and tty `NHW_MENU` rendering/selection (`win/tty/wintty.c`)
   - current screen 162 expects `Which intrinsics?`, a subtitle, property rows, and `(1 of 4)` footer; `h` should toggle the hallucination row, not immediately print the timeout message
   - preserve exact `seed0383` flat RNG; menu selection is zero-time and should not disturb the already-complete core RNG.
2. Broaden remaining `o_init`/`objnam` data paths after ring/potion/scroll support:
   - add spellbook, venom, and armor-description descriptor groups when evidence reaches them
   - replace limited discovery text tables with live discovery state
   - preserve seed0116's passed inventory/menu evidence by using real object state rather than evidence strings.
3. Broaden sleeping/hider front doors only from C evidence if a session reaches them.
4. Keep save/restore and broader startup/display blockers secondary unless the active queue is blocked.

## Regression Notes

- `seed0116` now passes fully. Avoid broad changes that disturb Soko zoo, pet movement, command prompt, object color, menu lifecycle, or turn-tail state without a clear classification and sentinel rerun.
- Transient regression classified/fixed: carrying `_utrack` across level teleport made `seed0116` drop to `S 110/127 R 6360/12562`; adding the C-like level-change `initrack()` restored `S 127/127 R 12562/12562`.
- `seed0002` and other non-target RNG prefixes shifted during shared hero-kill/death-side-effect work while matched screens stayed unchanged. Treat these as queued evidence only if those sessions become active targets.
- `seed0383` now has exact RNG and reaches screen `162`; the swallowed cold-damage/occupation-finish blocker is resolved for current evidence. Treat the new blocker as `wizcmds.c:wiz_intrinsic()` menu lifecycle, not a message-line spelling issue.
- Wrong assumption removed: Space after `You finish your dressing maneuver.` is not the structural place to advance an extra swallowed turn. The pending turn belongs before the finish message in the C immobile turn loop.

## Verification Cadence

- Run target triage after each production edit.
- Run sentinel suite after each meaningful edit.
- Run the full suite after broad shared changes or every 3-5 meaningful implementation iterations.
- Update `feature_map.md` and `lessons.md` only when subsystem truth changes.
- Make local commits after coherent, verified implementation improvements; do not push.

## Compaction Note

Historical detail removed from this file included older iterations for seed0116 special-level/zoo work, seed0383 startup/special-level work, and earlier probes. Durable subsystem lessons from those iterations are preserved in `lessons.md` and summarized in `feature_map.md`. For old operational details, prefer targeted `git show`/`git log -S` searches over re-expanding this checkpoint.

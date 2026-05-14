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
- Baseline for this loop turn: branch `main` at commit `65867f6`; `git status --short --branch` reported no local changes at startup.
- Latest loop work: seed0002 now creates the starting pet through `makedog()` before the post-pet startup replay, replaces the replayed startup turn-tail RNG with live movement/sound/hunger/wipe calls, applies C's `NODIAG(PM_GRID_BUG)` candidate filter, removes seed-specific display-only floor-object injections, and aligns `dog_goal()`'s non-hungry fallback. Seed5002 now has the caller-aware `mkcorpstat()` special-corpse timer restart, grave epitaph data-file offset, Wizard startup inventory filtering, no-legacy startup message/AC lifecycle, and duplicate-name wereform `verysmall()` disambiguation.
- Current target: `seed5002-wizard-coverage-pair` object-generation/map-placement boundary.
- Active subsystem hypothesis: startup inventory, date-message preamble, the current human wererat statue container gate, the helm-of-brilliance `SPFX_NOGEN` artifact miss, and the ordinary shopkeeper/stocking/mimic front doors now match through the current evidence. The next seed5002 mismatch is `FR 4282`, expected `rn2(100)` while JS emits `rn2(10)`, indicating a later shop-stock object-init or stocking-position detail.

## Latest Verified Scores

- Sentinel after seed0002 display-object dehack: total `S 326/1063 R 35782/64569`.
- `seed8000-tourist-starter`: `S 23/23 R 3060/3130`, FR `3047`.
- `seed0002-healer-reflection-drummer`: `S 11/595 R 2672/27158`, FR `2375`.
- `seed0013-friday13-save-then-fullmoon-restore`: `S 0/99 R 573/4804`, FR `540`.
- `seed0116-wizard-wear-shop`: `S 127/127 R 12562/12562`, PASS; cursor-only prompt drift cleared.
- `seed0383-wizard-hallucinate`: `S 165/219 R 16915/16915`, no core RNG mismatch; remaining mismatch is screen 164 swallow-color rendering after the `#wizintrinsic` commit.
- Full suite after scoped `mkcorpstat()` timer restart: `S 327/11406`, 1/44 passing (`seed0116`). Sentinel screens remain stable; `seed5002` moved from `R 1745/12167` to `R 2535/12167`, then to `R 2792/12167` after the grave epitaph offset, then to `S 4/410 R 3986/12167` after Wizard `ini_inv_mkobj_filter()`, no-legacy startup AC, legacy-gated late `nhlib.lua`, and queued `moveloop_preamble()` date messages.
- Full-suite verification after startup inventory/message lifecycle slice: `S 331/11406`, 1/44 passing (`seed0116`). Sentinel remains stable at `S 326/1063 R 35782/64569`; public movement is mainly `seed5002` advancing to `S 4/410 R 3986/12167`.
- Target verification after duplicate-name wereform `verysmall()` fix: `seed5002` advanced from `R 3986/12167` to `R 4114/12167`; sentinel remains stable at `S 326/1063 R 35782/64569`.
- Target verification after random-artifact eligibility cleanup: `seed5002` advanced from `R 4114/12167` to `R 4144/12167`; sentinel remains stable at `S 326/1063 R 35782/64569`.
- Full-suite verification after partial shop stocking: public screens remain `S 331/11406`, `1/44 passing`; `seed5002` advanced to `S 4/410 R 4256/12167`, with the first visible mismatch reduced to a one-cell gold color attribute and cursor match on screen 4. Sentinel remains stable at `S 326/1063 R 35782/64569`.
- Target verification after shop mimic appearance branch: `seed5002` advanced from `R 4256/12167` to `R 5787/12167`; sentinel remains stable at `S 326/1063 R 35782/64569`.
- Target triage refreshed 2026-05-14 with `node scripts/triage-session.mjs sessions/seed0383-wizard-hallucinate.session.json`: `S 165/219 R 16915/16915 FS 164:attr:map:Enter FR - C 1`. Evidence screens now show the intrinsic menu pages, `h` toggle, `Hallu` status tail, and cursor matching; the remaining diffs are swallowed-cell colors on the hallucinatory commit screen.
- Triage note: adding `display.c:mon_to_glyph()`-shaped hallucinated visible-monster rendering is structural display debt reduction but does not affect the current first mismatch; the missing consumer is earlier than or inside `make_hallucinated()`/`swallowed(0)` display-context ownership, not ordinary visible-monster redraw after the commit screen.
- Instrumentation blocker note: rebuilding the local C recorder to enable `NETHACK_RNGLOG_DISP` was attempted with `bash nethack-c/build-recorder.sh`, but the build script needs to fetch Lua and network access is unavailable (`curl: Could not resolve host`). Continue without adding seed-specific color offsets; a future environment with the recorder built can capture the display RNG stream directly.

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
- 2026-05-14 follow-up: ordinary spellbook descriptors from `objects.h:SPELL()` are now retained for IDs `366..407`, shuffled with the existing `[366,406]` range, and unknown ordinary spellbooks render from live appearance state as `${desc} spellbook`. Novel and Book of the Dead remain special-book naming debt.
- Verification after spellbook descriptor slice: `seed0383` unchanged at `S 165/219 R 16915/16915 FS 164:attr:map:Enter FR -`; sentinel unchanged at `S 326/1063 R 34338/64569`.
- 2026-05-14 follow-up: venom descriptors from `objects.h` are now retained for IDs `479..480` so the existing venom shuffle range no longer swaps empty description slots.
- Verification after venom descriptor slice: `seed0383` unchanged at `S 165/219 R 16915/16915 FS 164:attr:map:Enter FR -`; sentinel unchanged at `S 326/1063 R 34338/64569`.
- 2026-05-14 follow-up: armor appearance descriptors for the C shuffled subranges (helms, gloves, cloaks, boots) are now retained and unknown carried armor can display the shuffled descriptor directly.
- Verification after armor descriptor slice: sentinel unchanged at `S 326/1063 R 34338/64569`; `seed0116` remains `S 127/127 R 12562/12562`; `seed0383` remains `S 165/219 R 16915/16915 FS 164:attr:map:Enter FR -`.
- 2026-05-14 follow-up: `dog.js:obj_resists()` stale unique IDs were corrected to the current generated object table (`AMULET_OF_YENDOR=213`, `SPE_BOOK_OF_THE_DEAD=409`) instead of ring/spellbook slots.
- Verification after unique-ID cleanup: sentinel unchanged at `S 326/1063 R 34338/64569`; `seed0116` remains `S 127/127 R 12562/12562`; `seed0383` remains `S 165/219 R 16915/16915 FS 164:attr:map:Enter FR -`.
- 2026-05-14 follow-up: novel and Book of the Dead fixed descriptors/names are now modeled outside the ordinary spellbook shuffle range (`408=paperback`, `409=papyrus`; known names `novel` and `Book of the Dead`).
- Verification after special-book naming cleanup: sentinel unchanged at `S 326/1063 R 34338/64569`; `seed0116` remains `S 127/127 R 12562/12562`; `seed0383` remains `S 165/219 R 16915/16915 FS 164:attr:map:Enter FR -`.
- 2026-05-14 follow-up: startup now honors `OPTIONS=!legacy` by skipping the quest-intro pager, while no-legacy welcome `--More--` renders on the next tty message row. `seed5002` moved from the stale Book of Thoth overlay to a map/placement first-screen diff with cursor matching and RNG prefix `R 641/12167`.
- Verification after `!legacy` startup cleanup: sentinel unchanged at `S 326/1063 R 34338/64569`; `seed5002` triage is `S 0/410 R 641/12167 FS 0:char:map:init FR 415:rn2(70)=21=>rn2(100)=11`.
- 2026-05-14 themed-map slice: added the `themerms.lua` `Circular, medium` static map to the generic themed `des.map()` table and preserved `lspo_map()` origin rolls followed by `filler_region()`'s percent gate and `litstate_rnd(-1)`. `seed5002` startup RNG prefix moved to `R 699/12167`, with first mismatch now at the next expected `lspo_map()` (`FR 417: rn2(70)=11 => rn2(100)=71`), indicating remaining themed-room selection/content coverage rather than pet placement.
- Verification after `Circular, medium` themed-map slice: sentinel unchanged at `S 326/1063 R 34338/64569`; full suite unchanged on screens at `S 326/11406`, `1/44 passing`, with `seed4500` RNG prefix now `1797/108275` and `seed5002` `699/12167`.
- 2026-05-14 follow-up: added the C `lspo_map()` themed-origin collision retry loop and the separate `themeroom_fill()` reservoir front door, including low-difficulty `Buried zombies` shuffle/corpse creation. This moved `seed5002` to `R 1765/12167` and `seed0013` sentinel to `R 573/4804`; sentinel screens remain unchanged and `seed0116` remains a full pass. A broad attempt to change all corpse timeout RNG to `start_corpse_timeout()` shape was reverted because it regressed seed8000/seed0116 startup; keep corpse timer work scoped until a safe shared mapping is ready.
- Full-suite verification after themed retry/fill slice: `S 326/11406`, `1/44 passing`; notable RNG movements include `seed0013-friday13` `573/4804`, `seed0013-rogue` `571/4838`, `seed0200` `1477/3822`, `seed0360` `2838/120639`, `seed4500` `1774/108275`, and `seed5002` `1765/12167`.
- 2026-05-14 trap-victim cleanup: replaced stale mktrap-victim ammo IDs (`349/353`) with generated `ARROW=18` and `DART=23`. Sentinel remains screen-stable with total `S 326/1063 R 35987/64569`; `seed0002` RNG prefix improved to `2877/27158`, `seed0116` remains a full pass, and `seed5002` now reaches the trap-victim random-possession/gem-selection boundary (`R 1738/12167`, first local mismatch `rn2(5)` vs `rn2(6)`). A narrower mkcorpstat corpse-timer override also improved seed5002 screen drift but regressed seed8000/seed0116 and was reverted.
- 2026-05-14 gem-class init cleanup: ported C's luckstone/loadstone/rock exceptions inside the `GEM_CLASS` `mksobj_init()` branch. Sentinel remains screen-stable with total `S 326/1063 R 36049/64569`; `seed0002` moved to `R 2939/27158`, and `seed5002` moved to the shared `mkcorpstat()` corpse timeout boundary at `R 1745/12167`.
- Full-suite verification after gem-class cleanup: `S 326/11406`, `1/44 passing`; notable RNG movements include `seed0002` `2939/27158`, `seed0030` `6361/105529`, `seed0398` `1570/3026`, `seed2200` `2702/3018`, and `seed5002` `1745/12167`. Screen totals remain stable; object-generation RNG prefixes are the main movement.
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

1. Resolve `seed0383` display-RNG context ownership:
   - Current triage: `S 165/219 R 16915/16915 FS 164:attr:Enter FR -`.
   - Chars, cursor, status, and core RNG match on the hallucinatory commit screen; only swallowed map cell colors differ.
   - Stay on `display.c:swallowed()`, `display.h:what_mon()`, `potion.c:make_hallucinated()`, and display RNG seed/ownership. Do not add seed-specific color sequences.
   - Local recorder build is blocked by restricted network fetching Lua; use source-level reasoning or existing recorded display evidence until a recorder is available.
2. Continue mklev/object generation from current evidence:
   - `seed5002` now reaches `S 4/410 R 5787/12167`; first local mismatch is still the post-startup one-cell gold color attribute after Enter, with local RNG mismatch `FR 4282` (`rn2(100)` expected vs `rn2(10)` actual). Startup inventory, no-legacy AC, date messages, `moveloop_preamble()`, the human-form wererat statue `verysmall()` gate, `SPFX_NOGEN` helm artifact miss, first ordinary shopkeeper/stocking path, and shop mimic appearance branch now match through the current evidence.
   - `seed0002` now reaches `R 2672/27158`; mineralize, starting-pet creation, startup turn-tail, early pet object-resistance scans, and grid-bug NODIAG mtrack gating match through the current evidence, and display-only floor placeholders are removed. The next safe step is tracing the later movement/pet-goal ordering boundary at `FR 2375` (`rn2(5)` expected vs `rn2(100)` actual), likely retained real object placement/order rather than fake display objects.
   - Prior corpse timer attempts regressed seed8000/seed0116 because they applied timer RNG too broadly. The retained mapping is caller-aware and sentinel-stable; next object-generation work should inspect the new post-timer `mkobj`/room-fill boundary.
3. Broaden remaining `o_init`/`objnam` data paths after live descriptors:
   - Replace limited discovery text tables with live discovery state.
   - Preserve seed0116's passed inventory/menu evidence by using real object state rather than evidence strings.
4. Broaden sleeping/hider front doors only from C evidence if a session reaches them.

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

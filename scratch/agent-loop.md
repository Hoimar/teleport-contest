# Teleport Implementation Loop

## 2026-05-11 Marathon Restart - Bigroom Candidate Drift

- Branch/baseline commit: `main` at `baf0231`.
- Full suite baseline before this loop: 50/11406 screens, 0/44 passing.
- Sentinel baseline before this loop: 50/1063 screens, RNG 16368/64569.
- Current target: `seed0383-wizard-hallucinate` as evidence for special bigroom monster placement parity.
- Active hypothesis: the FR 5730 blocker is not another monster inventory gate; C and JS both enter `collect_coords()` after selected-monster init, but JS shuffles a full radius-3 ring (`rn2(24)`) where C's center is close enough to a map edge to produce `rn2(17)`. The next useful step is to identify which placement center drifted and whether the cause is special-level floor selection, monster collision relocation, or group-origin propagation.
- Queue:
  1. Classify the `seed0383` FR 5730 `collect_coords()` center/caller drift.
  2. Fix the general special bigroom placement/topology cause if localized.
  3. Continue `seed0116` missing `dog_goal()` object-state calls if bigroom placement locally blocks.
  4. Reclassify `seed0367` monster-init side effect if selected-monster changes touch role quest levels.
  5. Refresh hack-debt cleanup targets from `feature_map.md` if the structural queue blocks.
- Verification cadence: target triage after each edit, sentinel suite after each meaningful edit, full suite after 3-5 meaningful iterations and before handoff.
- Failed probes this loop: none yet.

### Iteration 1 - `bigrm-12` Centered Map Offset

- Change: applied C's centered `des.map([[...]])` placement for the 75x19 `bigrm-12` static map (`x=3,y=1`) to terrain loading and random floor-location coordinates.
- Evidence: `seed0383` moved from FR 5730 (`collect_coords()` `rn2(17)` expected vs JS full-ring `rn2(24)`) to FR 6406, confirming the candidate-count drift was map placement, not `collect_coords()` itself.
- Regression stability: sentinel screens stayed 50/1063.

### Iteration 2 - Default Monster Weapon Branches

- Change: filled the normal `m_initweap()` default cases for darts, crossbows/bolts, bows/arrows, daggers, aklyses, and strong-monster long sword/lucern hammer selections. The kobold dart branch now calls the same `m_initthrow()`-shaped helper.
- Evidence: `seed0383` crossed the `rnd(14)=4` non-strong dagger path and moved from FR 6406 to FR 6636.
- Regression stability: sentinel screens stayed 50/1063.

### Iteration 3 - Monster Instance Level And Defensive Predicates

- Change: monster item chance gates now use `adj_lev()`-shaped instance level instead of species `mlevel`; generated monster data now carries `mflags1`; `rnd_defensive_item()` skips animals, mindless monsters, ghosts, and Kops before consuming selection RNG.
- Evidence: `seed0383` moved through false defensive-item rolls from FR 6636 to FR 8264.
- Regression stability: sentinel screens stayed 50/1063.

### Iteration 4 - Mummy, Ogre, Greedy Gold, And Golem HP

- Change: added mummy wrapping inventory, ogre axe/club weapon initialization, minvent-shaped greedy gold amount/object creation, and golem fixed-HP no-RNG handling.
- Evidence: `seed0383` moved from FR 8264 to FR 9383 and matched RNG rose from 5788/16915 at loop start to 10004/16915. The current blocker is `rn2(2)` expected vs `rn2(10)` actual after deeper special bigroom monster/object initialization.
- Regression stability: sentinel screens stayed 50/1063; sentinel RNG improved from 16368/64569 to 20584/64569.
- Full-suite checkpoint: corpus screens remain 50/11406, 0/44 passing. Non-sentinel RNG prefixes shifted in monster-heavy sessions as expected from broader monster initialization (`seed0360`, `seed0367`, `seed0373`, `seed4500` need reclassification if selected), with no screen-count regressions.
- Current queue: classify `seed0383` FR 9383; continue `seed0116` `dog_goal()` object-state calls; reclassify non-sentinel monster-init side effects if they become the active target.

### Iteration 5 - Special Flip, Region Placement, Wishes, And Pet Arrival

- Change: added the post-load `flip_level_rnd()` path and horizontal-only `bigrm-12` gate for `noflipy`; `mineralize()` now keeps kelp placement but skips buried gold/gems on most special levels; `place_lregion()` now rejects occupied teleport candidates with a `put_lregion_here()`-shaped helper; wizard Ctrl-W wishes consume object-name lookup, normal `mksobj()` init, and `makewish()` timeout RNG for the current amulet/DSM/wand evidence; amulet init now includes the cursed-amulet `rn2(10)` gate; level-teleport pet arrival starts with zero movement.
- Evidence: `seed0383` moved from FR 9383 through special flip, kelp/mineralize, arrival placement, pet-arrival coordinate shuffles, and three wizard wish object creations to FR 9666. Current blocker is `rn2(3) @ create_gas_cloud(region.c:1303)` expected vs `rn2(12) @ mcalcmove`, likely missing a gas-cloud/region side effect before monster movement accrual.
- Regression stability: sentinel screens stayed 50/1063. Sentinel RNG total is now 20420/64569; `seed0116` screen stability remains 16/127 but its RNG prefix shifted to 5658/12562 after the more accurate amulet/pet-arrival behavior.
- Full-suite checkpoint: corpus screens remain 50/11406, 0/44 passing. `seed0383` is now 9895/16915; `seed8000` remains 23/23 screens.
- Current queue: classify the FR 9666 gas-cloud creation source; continue `seed0116` `dog_goal()`/wear object-state calls; reclassify broader command/inventory wish behavior if `seed0108` or `seed0383` command paths become the active target.

### Iteration 6 - Fog Cloud Every-Turn Effect

- Change: `mcalcmove()` now applies the `FOG_CLOUD` `m_everyturn_effect()` vapor-cloud TTL (`create_gas_cloud(..., 1, 0)` -> `rn1(3,4)`) before speed rounding.
- Evidence: the vapor TTL exists in JS but appears at RNG index 9677 rather than C's FR 9666. That classifies the remaining blocker as monster list/order drift around the first movement allocation, not a missing gas-cloud TTL implementation. In the current JS order, the fog cloud is after the pet and several bigroom monsters; C reaches the fog-cloud effect first.
- Regression stability: sentinel screens stayed 50/1063. Full suite remains 50/11406 screens, 0/44 passing; `seed0383` lagging RNG is 9884/16915 because the correct fog-cloud effect is still in the wrong slot.
- Current queue: compare C/JS `fmon` ordering after `bigrm-12` monster/group creation and pet arrival; continue `seed0116` object/wear-state work if list-order classification blocks locally.

### Iteration 7 - Preserve Migrating Pet Movement

- Change: debug level teleport now snapshots the existing tame monster before `mklev()` clears the old level, and `pet_arrive_with_you()` places that migrating pet with preserved data, edog state, and movement budget instead of constructing a fresh fixed-movement pet.
- Evidence: `seed0116` returned to the dog-goal object boundary: FR 5532, after matching `distfleeck()`, the kitten wanderer gate, and 14 carried-inventory `obj_resists()` calls. `seed0383` remains at FR 9666, so this does not mask the bigroom monster-order blocker.
- Regression stability: sentinel screens stayed 50/1063. Full suite remains 50/11406 screens, 0/44 passing; current `seed0116` RNG is 5650/12562.
- Current queue: implement or classify the three missing `obj_resists()` calls from nearby floor/shop object state for `seed0116`; compare special-level `fmon` ordering for `seed0383`.

## 2026-05-11 Marathon Restart - Peaceful Monster Predicate Queue

- Full suite baseline before this loop: 50/11406 screens, 0/44 passing.
- Sentinel baseline before this loop: 50/1063 screens, RNG 13829/64569.
- Current target: `seed0383-wizard-hallucinate` as evidence for special bigroom monster creation parity.
- Active hypothesis: the FR 3661 blocker belongs to `makemon.c:peace_minded()` predicate coverage and call ordering. The broad call site is correct in C, but JS must first model the non-RNG predicate front door to avoid extra `rn2(16)` rolls for always-hostile/peaceful and special-sound monsters.
- Queue:
  1. Port the non-RNG `peace_minded()` predicates and move ordinary `makemon()` peaceful initialization into C order.
  2. If `seed0383` moves, follow the same monster-init boundary exposed next.
  3. Continue `seed0116` missing `dog_goal()` object-state calls.
  4. Classify `seed8000` live monster movement ownership if monster changes touch turn order.
  5. Fall back to startup/windowing or visible hack-debt cleanup only if the structural targets block.
- Verification cadence: target triage after each edit, sentinel suite after each meaningful edit, full suite after 3-5 meaningful iterations and before handoff.
- Failed probes this loop: none yet.

### Iteration 1 - `peace_minded()` Predicate Front Door

- Change: regenerated monster data with `msound` and `mflags2`, added a checked-in generator for that table, and ported the non-RNG front door of `makemon.c:peace_minded()` (`M2_PEACEFUL`, `M2_HOSTILE`, leader/guardian/nemesis, Erinys, race masks, amulet, and minion cases). Ordinary `makemon()` now applies peacefulness unless `MM_ANGRY` is set.
- Evidence: `seed0383` moved from FR 3661 (`rn2(16)` expected vs gender `rn2(2)`) to FR 4097, proving the earlier broad peacefulness probe is now contained by predicates.
- Regression stability: sentinel screens stayed 50/1063; `seed8000`, `seed0002`, `seed0013`, and `seed0116` screen counts were unchanged.

### Iteration 2 - Centaur `m_initweap()` Slice

- Change: added the `S_CENTAUR` bow/crossbow branch with projectile quantity RNG and the shared offensive-item gate.
- Evidence: `seed0383` moved from FR 4097 to FR 4120 through the `MOUNTAIN_CENTAUR` weapon path.
- Regression stability: sentinel screens stayed 50/1063.

### Iteration 3 - Greedy Monster Money Gate

- Change: added the `m_initinv()` `likes_gold()` `rn2(5)` chance gate for `M2_GREEDY` monsters. Monster gold retention is still pending.
- Evidence: `seed0383` moved from FR 4120 to FR 4335, crossing the mountain-centaur inventory tail.
- Regression stability: sentinel screens stayed 50/1063.

### Iteration 4 - Troll `m_initweap()` Slice

- Change: added the `S_TROLL` polearm branch and shared offensive-item gate.
- Evidence: `seed0383` moved from FR 4335 to FR 5212.
- Regression stability: sentinel screens stayed 50/1063.

### Iteration 5 - Quantum Mechanic Inventory Gate

- Change: added the `S_QUANTMECH` `rn2(20)` inventory gate and conservative box/corpse creation for the rare path.
- Evidence: `seed0383` moved from FR 5212 to FR 5430 through the genetic-engineer/quantum-mechanic inventory gate.
- Regression stability: sentinel screens stayed 50/1063.

### Iteration 6 - Gnome Generic Weapon Gate

- Change: added the generic normal-monster weapon picker for `S_GNOME` before gnome candle inventory handling.
- Evidence: `seed0383` moved from FR 5430 to FR 5730. The new blocker is a spatial `collect_coords`/`enexto` candidate-count mismatch (`rn2(17)` expected vs `rn2(24)` actual), not the prior selected-monster inventory sequence.
- Regression stability: sentinel screens stayed 50/1063.
- Full-suite checkpoint: corpus remains 50/11406 screens, 0/44 passing. `seed0383` RNG prefix improved from 3716/16915 to 5788/16915. Non-sentinel RNG prefixes shifted as expected from broader monster-init behavior (`seed0361` and `seed4500` improved; `seed0367` moved earlier and needs reclassification if selected next).
- Current queue: classify `seed0383` `collect_coords` candidate-count drift; continue `seed0116` `dog_goal()` object-state calls; classify `seed0367` monster-init side effect if it becomes a target.

## 2026-05-10 Marathon Restart - Pet/Object And Monster Init Queue

- Full suite baseline before this loop: 50/11406 screens, 0/44 passing.
- Sentinel baseline before this loop: 50/1063 screens, RNG 13135/64569.
- Corpus triage baseline: 44 sessions, 42 compact buckets in `scratch/divergence-inventory.md`.
- Current target: `seed0116-wizard-wear-shop` as evidence for pet/object movement parity.
- Active hypothesis: the FR 5518 blocker belongs to general `dogmove.c:dog_goal()` object scanning and object resistance/reachability, not a pet-position special case.
- Queue:
  1. Implement a conservative general `dog_goal()` object scan/reachability slice over retained floor objects.
  2. If `seed0116` moves, follow the same pet/object subsystem boundary exposed next.
  3. Revisit selected-monster initialization/equipment for `seed0383` without reintroducing level-specific reservoir hacks.
  4. Classify the `seed8000` post-screen monster movement ownership drift after any monmove changes.
  5. Continue high-ROI startup buckets from `scratch/divergence-inventory.md` if pet/monster targets locally block.
- Verification cadence: target triage after every edit, sentinel suite after every meaningful edit, full suite after 3-5 iterations and before handoff.
- Failed probes this loop: none yet.

### Iteration 1 - `dog_goal()` Floor Object Scan

- Change: `js/dog.js` now initializes minimal `edog` state for pets and scans retained nearby floor objects in `dog_goal()` using C-shaped `dogfood()`, reachability, carry, and `obj_resists()` checks before falling back to follow movement.
- Evidence: the first attempt exposed legacy display-only object records in `seed0002`; adding a numeric-`otyp` guard kept old override scaffolding from becoming bogus pet targets. `seed0116` stayed at 16/127 while the blocker remained in the same dog-goal phase.
- Regression stability: sentinel screens stayed 50/1063 after the guard. No seed-specific pet branch was added.
- Classified blocker: `seed0116` needed the hero-inventory branch of `dog_goal()`, not just floor scanning.

### Iteration 2 - `dog_goal()` Hero Inventory Scan

- Change: `dog_goal()` now scans retained hero inventory when the pet has no stronger goal, applying `dogfood()` and `obj_resists()` over real inventory objects before candidate movement.
- Evidence: `seed0116` moved from RNG 5555/12562 with first mismatch FR 5518 to RNG 5713/12562 with first mismatch FR 5532. The remaining gap is three more object-resistance calls before movement selection, likely missing floor/object state rather than the base Wizard inventory.
- Regression stability: sentinel screens stayed 50/1063; sentinel RNG improved from 13135/64569 to 13308/64569.
- Implementation delta: pet/object behavior advanced; no gameplay code was specialized to `seed0116`.

### Iteration 3 - Wizard Optional Blindfold Inventory

- Change: `js/u_init.js` now retains the Wizard optional blindfold `ini_inv()` branch behind the upstream `!rn2(5)` gate instead of dropping the granted item state.
- Evidence: `seed0116` did not receive the blindfold in C for this seed, so target counts were unchanged. This still removes a real Wizard inventory retention stub for other configured sessions.
- Regression stability: sentinel screens stayed 50/1063 and RNG stayed 13308/64569.
- Full-suite checkpoint: after this iteration the corpus remained 50/11406 screens, 0/44 passing.

### Iteration 4 - Special Bigroom Group Initialization

- Change: `makemon()` now runs the `G_SGROUP`/`G_LGROUP` group-init phase for random monsters while loading special bigroom levels, using `m_initgrp()` with `enexto_core()` placement and `MM_NOGRP` suppression for group members.
- Evidence: `seed0383` moved from FR 3127/RNG 3195 to FR 3177/RNG 3254, through the first special bigroom group gate and placement slice.
- Regression stability: sentinel screens stayed 50/1063; sentinel RNG improved to 13367/64569.
- Classified blocker: `seed0383` then exposed selected-monster equipment/init, specifically the branch before `m_initinv()`.

### Iteration 5 - Bigroom Monster Equipment Slices

- Change: `m_initweap_for()` now covers giant boulder/weapon gates and the elven `S_HUMAN` equipment branch, including elven armor/weapon item creation and thrown-arrow quantity RNG.
- Evidence: the giant slice was useful later but not the first blocker. The elven branch moved `seed0383` from FR 3177/RNG 3254 to FR 3219/RNG 3282. The new blocker is deeper in selected-monster item initialization after elven equipment.
- Regression stability: sentinel screens stayed 50/1063; sentinel RNG improved to 13395/64569.
- Implementation delta: selected-monster initialization is broader and still subsystem-level; no level-specific reservoir or seed replay was introduced.
- Full-suite checkpoint: corpus remains 50/11406 screens, 0/44 passing. `seed0383` is now 3282/16915 RNG; `seed0116` remains 5713/12562 RNG and 16/127 screens.
- Current queue: finish `seed0383` selected-monster equipment/init after FR 3219; continue `seed0116` missing `dog_goal()` object-state calls; classify `seed8000` post-screen movement ownership.

### Iteration 6 - Multigen Projectile Initialization

- Change: `mksobj_init()` now applies the C `is_multigen()` weapon quantity roll (`rn1(6,6)`) for missile weapons before ordinary weapon enchantment/curse logic.
- Evidence: `seed0383` moved from FR 3219/RNG 3282 to FR 3229/RNG 3315, through elven-arrow creation in `m_initthrow()`.
- Regression stability: sentinel screens stayed 50/1063; sentinel RNG improved to 13428/64569.
- Implementation delta: weapon object initialization is more C-shaped for arrows/bolts/darts/shuriken and not tied to a seed.

### Iteration 7 - Shared `m_initweap()` Offensive Item Gate

- Change: giant and elven `m_initweap()` branches now run the shared final `m_lev > rn2(75)` offensive-item gate before returning, matching `makemon.c`'s post-switch behavior.
- Evidence: `seed0383` moved from FR 3229/RNG 3315 to FR 3404/RNG 3991, showing the bigroom selected-monster path now crosses several more monster equipment/init calls.
- Regression stability: sentinel screens stayed 50/1063; sentinel RNG improved to 14104/64569.
- Current queue: classify `seed0383` FR 3404 (`rn2(11)` expected vs `rn2(100)` actual), then continue pet object-state work for `seed0116`.

### Iteration 8 - Monster Defensive Item Init

- Change: `m_initinv_for()` now models the `m_lev > rn2(50)` defensive-item branch with a conservative `rnd_defensive_item()` picker and real `mksobj()` creation for scrolls, potions, and wands.
- Evidence: `seed0383` first RNG mismatch moved from FR 3404 to FR 3661, crossing the previously missing defensive item selection and creation. The lagging matched-count metric dropped from 3991 to 3716 because later accidental equalities changed, but the first mismatch moved later.
- Regression stability: sentinel screens stayed 50/1063; sentinel RNG is 13829/64569 after the structural shift.
- Full-suite checkpoint: corpus remains 50/11406 screens, 0/44 passing. The screen score is unchanged and `seed0383` is now blocked at FR 3661.
- Current queue: classify `seed0383` FR 3661, then continue `seed0116` dog-goal object-state or `seed8000` live movement ownership.

### Failed Probe - General Peaceful Initialization

- Probe: changed `makemon()` to call `peace_minded_for(ptr)` for all ordinary monsters before group initialization, matching the broad C call site.
- Result: this targeted `seed0383` FR 3661, but regressed sentinel topology because JS `peace_minded_for()` lacks C's `always_peaceful()`, `always_hostile()`, race-hostile, minion, and special sound predicates. It added `rn2(16)` rolls for monsters C rejects without RNG.
- Reverted: restored the previous `NO_MINVENT`-only peaceful call. Sentinel returned to 50/1063 and `seed0116` returned to 16/127.
- Next: implement `peace_minded()` predicates from `makemon.c`/monster flags before moving the general peaceful call earlier.

## Baseline

- Full suite before edits: 35/11284 screens, 0/44 passing. Sentinel before edits: 35/1063 screens.
- Current target: `seed0116-wizard-wear-shop` as evidence for startup/map topology and command-boundary behavior.
- Initial hypothesis: the post-welcome one-cell terrain mismatch is a general door-state alias bug, not a session-specific map issue.
- Queue:
  1. Continue `seed0116` startup prompt path after the door-state fix.
  2. Classify `seed0116` FR 2978 next-level boundary (`getbones()` expected, live-turn RNG actual).
  3. Implement special-room fill / shop/zoo room handling from `sp_lev.c:fill_special_room`.
  4. Continue monster table and movement-state parity after startup blockers move.
- Verification cadence: target triage after each edit; sentinel suite after each meaningful edit; full suite after 3-5 meaningful iterations or before a true stopping handoff.

## Iteration 1 - Door State Alias

- Change: `js/mklev.js` now keeps `loc.flags` and `loc.doormask` synchronized when `dosdoor()` creates doors and secret doors. This mirrors C's `doormask`/`flags` alias in `struct rm`.
- Evidence: `seed0116` visible mismatch moved from screen 1 one-cell door/floor difference to screen 2 missing tutorial prompt.
- Score delta: `seed0116` 1/127 -> 2/127; sentinel 35/1063 -> 36/1063. Full-suite recheck pending cadence.
- Regression stability: sentinel suite did not regress (`seed8000` 23/23, `seed0002` 11/595, `seed0013` 0/99, `seed0116` 2/127, `seed0383` 0/219).
- Implementation delta: level-generation door topology became more C-faithful; no seed-specific branches or replay tables added.
- Next: classify and implement the general startup tutorial prompt path exposed at `seed0116` screen 2.

## Iteration 2 - Startup Prompt And Debug Command Lifecycle

- Change: implemented a general post-welcome tutorial prompt overlay for sessions where `tutorial` was not set in config, including Space/Enter invalid-choice redraw. Added prompt-cursor support for message-line prompts.
- Change: added `.` as a time-taking rest command and implemented the debug `^V` level-teleport prompt lifecycle: prompt with trailing space, digit echo, Enter-triggered level generation, and "You materialize on a different level!" message.
- Evidence: `seed0116` moved from 2/127 after the door fix to 10/127; RNG prefix moved from 2983/12562 to 3942/12562.
- Score delta: sentinel 36/1063 -> 44/1063; full suite 35/11284 baseline -> 44/11284 after this batch.
- Regression stability: sentinel suite did not regress (`seed8000` 23/23, `seed0002` 11/595, `seed0013` 0/99, `seed0116` 10/127, `seed0383` 0/219).
- Implementation delta: command dispatch now models rest/wait and debug level teleport prompt timing; startup tutorial prompt moved out of seed-only override behavior for configured non-replay sessions. No seed-specific logic added.
- Classified blocker: `seed0116` now blocks at FR 3011, where C enters `sp_lev.c:lspo_map` for themed/special `des.map()` generation after level teleport and JS still creates an ordinary room. This is a special-level/themed-map subsystem blocker.

## Queue

1. Finish themed/special `des.map()` room accounting after the initial static map slice.
2. Implement special-room fill / `fill_zoo` (`sp_lev.c:fill_special_room`, `mkroom.c`) for `seed0383` FR 969.
3. Continue real monster table and inventory/equipment parity.
4. Generalize remaining startup menu/windowing paths and reduce seed0002 override debt.

## Iteration 3 - Static Themed `des.map()` Slice

- Change: added static `des.map()` handling for shaped themed rooms in `js/mklev.js`, including map origin RNG, terrain placement, `filler_region()` percent(30), `litstate_rnd(-1)`, and irregular fillable room registration.
- Evidence: `seed0116` level-teleport boundary moved from FR 3011 (`lspo_map` expected vs JS chance check) to FR 3327 in later room placement.
- Score delta: `seed0116` screens stayed 10/127. The lagging RNG matched count went 3942 -> 3478 because earlier accidental later equalities disappeared, but the first mismatch moved later by 316 RNG calls.
- Regression stability: sentinel screens stayed 44/1063 with no screen-count regressions; `seed8000` remains 23/23. Full suite stayed 44/11284 screens.
- Implementation delta: special-level support advanced from no `des.map()` handling to a static themed-map subset. No seed-specific branch was added.
- Classified blocker: remaining `seed0116` mismatch is room-placement/rectangle accounting after the map fragment and final hero placement, not the initial `lspo_map` origin/filler RNG.

## Iteration 4 - Themed Room Accounting, Corridors, Vault Fallback, Shop Gate

- Change: corrected implemented themed map literals against `themerms.lua`; enabled `in_mk_themerooms` during themed-room generation so `check_room()` uses C's immediate-fail collision semantics; changed `filler_region()` room registration to flood-fill from the seed floor cell and mark adjacent walls as edges instead of using the full map rectangle.
- Change: added the irregular-room inward door search in `finddpos_shift()`, implemented the post-niche vault fallback `rnd_rect() && create_vault()`, and added the ordinary-level random special-room/shop decision point with a conservative partial `mkshop()` marker.
- Evidence: `seed0116` moved from FR 3327 to FR 4592. The visible screen count remains 10/127 because hero placement/map visibility is still wrong after level teleport, but the RNG boundary moved through room placement, corridor joining, vault retry, and shop chance.
- Score delta: sentinel screens stayed 44/1063; full suite stayed 44/11284. `seed0116` lagging RNG matched count improved from 3478/12562 to 5360/12562. `seed0013` sentinel RNG prefix improved from 63 to 73 after the shared level-generation fixes.
- Regression stability: sentinel suite did not regress (`seed8000` 23/23, `seed0002` 11/595, `seed0013` 0/99, `seed0116` 10/127, `seed0383` 0/219).
- Implementation delta: themed room geometry and ordinary-level special-room scheduling are more C-faithful; no per-seed branches or screen replays were added.
- Classified blocker: `seed0116` now blocks in room fill at FR 4592 (`fill_ordinary_room`/bonus spatial state), while the first visible mismatch still reflects wrong final hero placement/visibility after level teleport.

## Iteration 5 - Arrival, Prompt, Vault Fill, And Monster Init Followups

- Change: debug level teleport now uses `place_lregion(..., LR_UPTELE)` instead of snapping to upstairs; the existing tame pet now migrates with the hero through a minimal `mon_arrive(With_you)`-shaped path; normal Space now reports unknown outside explicit dismissal states; `W`/wear prompt and a basic `T` cloak takeoff path are implemented.
- Change: vault special-room fill now runs at vault creation and again in the final special-room pass, with `mkgold()` merging existing coordinate gold instead of consuming a second `next_ident()`. Corpse initialization retries `G_NOCORPSE` random monsters, and kobolds consume their `m_initweap()` dart gate.
- Evidence: `seed0116` moved from 10/127 and FR 4592 to 16/127 and FR 5517, with the first visible mismatch now just the pet's movement after taking off the cloak. `seed0383` moved from FR 969/1191/1250 through vault fill and mineralize to FR 2450.
- Score delta: sentinel screens moved from 44/1063 to 50/1063, all from `seed0116`; full suite moved from 44/11284 to 50/11284. No sessions pass yet.
- Regression stability: sentinel suite did not regress (`seed8000` 23/23, `seed0002` 11/595, `seed0013` 0/99, `seed0116` 16/127, `seed0383` 0/219).
- Implementation delta: level arrival, basic inventory prompt dispatch, vault special fill, gold merging, corpse retry, and kobold monster equipment became more C-shaped. No per-seed branches or screen replays were added.
- Current queue: pet movement (`dogmove.c`) for `seed0116`; post-mineralize HP/Pw/startup sequencing for `seed0383`; broader special-room stocking/shopkeeper work.

## Iteration 6 - Debug Levelchange And Bigroom Special Loading

- Change: implemented wizard/debug `#levelchange` as an extended-command prompt plus numeric getlin-style prompt, with Wizard/human `newhp()`/`newpw()` level-gain RNG and level-derived status ranks. Added the `^V ? Enter` level-teleport menu path and menu-letter selection.
- Change: special-level dispatch now runs before the ordinary below-Medusa `rn2(5)` gate. Added a partial `bigrm-12` Lua special loader covering variant selection, Lua shuffle/init, scripted percent gates, stairs, object placement, trap placement, and entry into monster placement. Broadened generated tool/armor `mksobj_init()` RNG for lamps/candles/cameras/tinning kits/markers/cursed armor.
- Evidence: `seed0383` moved from FR 2450 (`newhp()`/`newpw()` missing after `#levelchange`) to FR 2701, now blocking at `des.monster()` because the JS random monster table only covers early level-1 monsters and has no level-12 eligible reservoir.
- Score delta: public screens stayed 50/11284; `seed0383` lagging RNG prefix improved from 2450/16915 to 2701/16915. Full suite remains 0/44 passing.
- Regression stability: sentinel screens stayed 50/1063 (`seed8000` 23/23, `seed0002` 11/595, `seed0013` 0/99, `seed0116` 16/127, `seed0383` 0/219). `seed0116` remains blocked at pet movement FR 5517.
- Implementation delta: debug command lifecycle, level-gain stat RNG, debug menu teleport, special-level dispatch, a concrete bigroom Lua slice, and random tool/armor initialization became more C-shaped. No per-seed branches or screen replays were added.
- Current queue: generated `monsters.h` table for `rndmonst_adj()`; pet movement (`dogmove.c`) for `seed0116`; first-screen map glyph drift in configured Wizard startup; broader Lua special-level parser.

## Iteration 7 - Replace Level-Specific Monster Reservoir

- Change: removed the `LEVEL12_*` random-monster reservoir scaffold and replaced it with `js/monster_data.js`, generated from `nethack-c/upstream/include/monsters.h`. `rndmonst_adj()` now walks that general table with C-style weighted reservoir sampling instead of branching on the level-12 difficulty window.
- Change: fixed the generator to include both `NAM(...)` and `NAMS(...)` monster rows, and corrected the local `G_NOCORPSE` constant to match `include/monflag.h` (`0x0010`) so corpse/statue retry behavior remains aligned with the generated `geno` values.
- Evidence: `seed0116` remains at 16/127 and FR 5517 after the rework; `seed0383` now reaches FR 3185 on the general monster table and blocks in selected-monster initialization/equipment after `des.monster()`.
- Score delta: sentinel screens stayed 50/1063. `seed0383` RNG prefix moved from the documented FR 2701 to FR 3185 without retaining the level-specific table.
- Regression stability: sentinel suite did not regress (`seed8000` 23/23, `seed0002` 11/595, `seed0013` 0/99, `seed0116` 16/127, `seed0383` 0/219).
- Implementation delta: random monster selection is now sourced from upstream monster data and no longer has level-12-specific behavior. Remaining debt is selected-monster equipment/init parity, not the selection table itself.
- Current queue: pet movement (`dogmove.c`) for `seed0116`; selected-monster equipment/init for `seed0383`; first-screen map glyph drift in configured Wizard startup; broader Lua special-level parser.

## Iteration 8 - Pet Wanderer Gate And Object Placement State

- Baseline for this run: full suite 50/11284 screens, 0/44 passing; sentinel 50/1063 screens.
- Change: added a partial `dogmove.c:dog_move()` follow-movement path for tame monsters, using `mon.c:mfndpos()` scan order and `dogmove.c` distance-weighted candidate selection. Normal tame movement now calls `dog_move(..., after=false)` through the `monmove.c:dochug()` path.
- Change: modeled the `monmove.c:dochug()` `is_wanderer()` gate for upstream `M2_WANDER` pet types currently represented in JS startup pet data (kitten and pony), preserving the `rn2(4)` before `dog_goal()`.
- Change: `mksobj_at()` and `mkobj_at()` now retain created non-gold objects on `level.objects` with conservative class glyphs instead of consuming creation RNG and discarding the object state.
- Evidence: `seed0116` first RNG mismatch moved from FR 5517 (`rn2(4)` expected vs JS movement allocation/candidate RNG) to FR 5518, now at `dog_goal()` object reachability/resistance (`rn2(100) @ obj_resists`). `seed0383` sentinel RNG prefix improved from 3185 to 3194; `seed0002` improved from 1250 to 1303.
- Score delta: sentinel screens stayed 50/1063; target `seed0116` screens stayed 16/127. Full suite stayed 50/11284 screens, 0/44 passing.
- Regression stability: sentinel suite did not lose screens (`seed8000` 23/23, `seed0002` 11/595, `seed0013` 0/99, `seed0116` 16/127, `seed0383` 0/219). `seed0002` first mismatch class changed to include an attr diff but matched-screen count did not regress.
- Implementation delta: pet movement is less skeletal, and generated map objects are now available to later systems. No per-seed branches or screen replays were added.
- Classified blocker: `seed0116` dog movement is now blocked by `dog_goal()` scanning and reachability over the real object list. JS still lacks enough level object placement/content state near the pet to reproduce the `obj_resists()` scan before movement selection.
- Current queue: implement `dog_goal()` object scan/reachability once object state is richer; selected-monster equipment/init for `seed0383`; first-screen map glyph drift in configured Wizard startup; broader Lua special-level parser.

## Probe - Monster Group Initialization

- Probe: attempted to add the `makemon.c` `G_SGROUP`/`G_LGROUP` group-init phase before selected-monster inventory, using `enexto_core()` for the collect-coords ring shuffle.
- Result: this correctly targeted the `seed0383` FR 3127 blocker shape, but it regressed sentinel topology (`seed0116` fell to 0/127 and `seed8000` initially fell to 4/23) because surrounding ordinary/special monster placement and group suppression are not complete enough to create extra monsters generally yet.
- Kept: corrected the ordinary-room sleeping-monster call site to pass `MM_NOGRP` instead of literal `2`, which is the upstream flag value and is inert while group creation is not active.
- Reverted: removed the active group-init call and dead helper scaffolding. Sentinel returned to 50/1063.
- Next: group initialization remains a valid `seed0383` blocker, but should be reintroduced only with fuller placement semantics and sentinel protection, not as a standalone RNG consumer.

## Verification

- Full suite after Iteration 8 and the reverted group probe: 50/11284 screens, 0/44 passing.
- Sentinel after final edits: 50/1063 screens, no matched-screen regressions.

## Dehack Cleanup - Tracked Scratch Stub

- Baseline for this cleanup: sentinel 50/1063 screens.
- Cleanup target: tracked one-off debug scaffolding.
- Change: deleted `scratch/run_test.mjs`, an unfinished stub that imported game modules but had no runnable diagnostic and only recorded abandoned seed0002 key guesses.
- Implementation delta: reduced stale tracked scratch/debug debt; no production JS changed and no seed-specific behavior added.
- Verification: sentinel suite remained 50/1063 screens with no matched-screen regressions. Direct `seed0002-healer-reflection-drummer` triage remained 11/595 screens and FR 1215 (`rn2(6)=5=>rn2(4)=1`).

# Teleport Implementation Loop

## 2026-05-12 09:47 CEST Resume From 04d9360 - Live Monster Movement

- Branch/baseline commit: `main` at `04d9360`.
- Startup verification:
  1. Full suite baseline at resume: `51/11406` screens, 0/44 passing.
  2. Sentinel baseline at resume: `51/1063` screens, RNG `20354/64569`.
  3. Target baseline: `seed0116-wizard-wear-shop` at `S 17/127 R 5682/12562`, first RNG mismatch FR 5573 (`rn2(5)` expected vs `rn2(100)` actual).
- Iteration 1 implementation delta:
  1. Extended `scripts/trace-dog-goal.mjs` with `--monsters` so movement work can inspect `fmon` order, movement budgets, species speed, and tame state alongside dog-goal scans.
  2. Ported a narrow ordinary-monster movement owner in `js/monmove.js`: `distfleeck()` now returns C-like nearby/inrange state, non-tame monsters use the `dochug()` movement-opportunity front door, ordinary movement performs post-`m_move()` `distfleeck()`, and a minimal adjacent `m_move()` retains `mtrack` and consumes backtracking rolls.
  3. Added the empty-square pickup message for `,`; later C-source review corrected this path to remain zero-turn when no object is present.
- Evidence:
  1. `seed0116` crossed FR 5573 and FR 5616, including the missing non-pet post-`m_move()` `distfleeck()` and the `mtrack` `rn2(32)` roll. It now blocks at FR 5710: C consumes the kitten nearby `M2_WANDER` gate while JS starts `dog_goal()` object resistance.
  2. Visible `seed0116` screens improved from `17/127` to `21/127`; current visible mismatch is pet/status state after `,`, not the pickup message.
  3. `seed0383` RNG prefix improved from `9877/16915` to `9937/16915` while its screen count stayed unchanged.
- Regression stability:
  1. Sentinel moved from `51/1063 R 20354/64569` to `55/1063 R 20611/64569`.
  2. No sentinel screen-count regressions. `seed0002` and `seed0013` RNG prefixes shifted with unchanged screens and are classified as expected structural side effects of ordinary-monster movement ownership.
  3. Full suite moved from `51/11406` to `55/11406`, 0/44 passing.
- Current queue:
  1. Classify `seed0116` FR 5710 pet apparent-nearby/position parity after the `L`, `j`, `j`, `l`, `,` command sequence. JS pet state before `,` is two squares from the hero, but C reaches the nearby kitten wanderer gate.
  2. Continue `seed0383` FR 9716 `dog_goal()` object visibility/state once the shared pet-position issue is classified.
  3. Recheck special-level monster/list effects after pet state advances.
  4. Continue startup/windowing dehack work only when it unlocks real subsystem parity.
- Verification cadence remains: target triage after each production edit, sentinel after each meaningful edit, full suite after broad shared changes or every 3-5 meaningful iterations.

### Iteration 2 - Command/Object Ownership Through Wizard Wish And Zap

- Implementation delta:
  1. Added zero-turn command/message handling for empty pickup and no-shopkeeper `#pay`.
  2. Added persistent inventory letters, basic drop-to-floor behavior, retained wished inventory objects, partial shuffled descriptions for the current wished ring/wand evidence, `P` ring put-on prompts, and `z` wand selection/direction prompts.
  3. Generalized non-charged ring init to the upstream cursed-ring gate instead of startup-only harmless-ring RNG, and exported `place_object()` for command-side floor placement.
  4. Added early turn-tail exercise/seer RNG ownership and pet/ordinary-monster open-door stepping plus candidate-square `dogfood()` probes.
- Evidence:
  1. `seed0116` moved from `S 21/127 R 5809/12562` after iteration 1 to `S 80/127 R 5958/12562`.
  2. It now passes the ring wish (`o - an ivory ring.`), `P`/ring-finger prompts, right-hand ring message, digging-wand wish (`p - a curved wand.`), `z` wand prompt, and direction prompt.
  3. Current first blocker is `FR 5911`: C consumes `rn2(19)` from `exercise()` after `zap_dig()` while JS starts `distfleeck()`. The visible mismatch is pet/map state after the zap direction key, so the next owner is turn/movement phase ordering or remaining wand-effect disclosure timing.
- Regression stability:
  1. Sentinel moved from iteration-1 `55/1063 R 20611/64569` to `114/1063 R 20722/64569`.
  2. Full suite moved from iteration-1 `55/11406` to `114/11406`, 0/44 passing.
  3. `seed8000` stayed complete at `23/23`; non-target sentinel RNG shifts are classified as expected consequences of command/object/turn ownership becoming less stubbed.
- Current queue:
  1. Classify `seed0116` FR 5911 post-zap exercise/monster phase order against `zap.c:weffects()`, `dig.c:zap_dig()`, `attrib.c:exerper()`, and `allmain.c:moveloop_core()`.
  2. Continue `seed0383` FR 9716 `dog_goal()` floor-object/state parity once the shared movement phase question is classified or locally blocked.
  3. Recheck special-level monster/list effects after dog-goal or phase-order state advances.
  4. Keep startup/windowing dehack work secondary unless it unlocks active subsystem parity.

### Iteration 3 - Soko Zoo, Monster Init, And Turn-Tail Ownership

- Implementation delta:
  1. Ported the active Soko1 zoo slice far enough to create filled irregular zoo room metadata, attach doors in x-major order, flip room/door metadata with the map, run `fill_special_room()` after flip/fixup, and respect special-level alignment precedence.
  2. Tightened object/monster init in the Soko path: `TIN` now starts with the spinach gate, leprechauns create minvent gold before misc/greedy gates, `rnd_misc_item()` covers the current polymorph/life-saving/speed/invisibility/gain-level evidence, corrected wand ids feed those items, spiders/snakes create hide-under floor objects during mklev, human werecreatures keep the shared offensive tail, and `MM_ASLEEP` is retained.
  3. Tightened live pet movement around the zoo by rejecting boulder-occupied squares and applying Sokoban `m_avoid_soko_push_loc()` push-block avoidance.
  4. Added current turn-tail owners for `mcalcdistress()`/human-form `were_change()` and the zoo room `dosounds()` `rn2(200)` gate.
- Evidence:
  1. `seed0116` advanced from the post-zap FR 5911 boundary through Soko special loading, zoo monster/object creation, dog movement, `were_change()`, and zoo sound gates to `S 109/127 R 12522/12562`.
  2. Intermediate target triage checkpoints during this slice included FR 9457 after tin ordering, FR 9567 after special-level alignment precedence, FR 10415/10929 through Soko zoo fill and monster minvent/misc ownership, FR 12427 after deeper zoo/dog movement, FR 12461 after boulder candidate rejection, and FR 12522 after `were_change()`, zoo sound, and Sokoban push avoidance.
  3. Current first visible mismatch is screen 109 attr-only map/object color drift. Current first RNG mismatch is FR 12522: C expects `rn2(50)` from `were_change(were.c:17)`, while JS begins another `distfleeck()` `rn2(5)` pass.
- Regression stability:
  1. Target triage: `node scripts/triage-session.mjs sessions/seed0116-wizard-wear-shop.session.json` => `S 109/127 R 12522/12562 FS 109:attr:map:e FR 12522:rn2(50)=0=>rn2(5)=0 C 4`.
  2. Sentinel suite: `seed8000` `S 23/23 R 3060/3130`, `seed0002` `S 11/595 R 1258/27158`, `seed0013` `S 0/99 R 536/4804`, `seed0116` `S 109/127 R 12522/12562`, `seed0383` `S 0/219 R 9926/16915`; total `S 143/1063 R 27302/64569`.
  3. Full suite: `S 143/11406`, 0/44 passing. No sentinel screen-count regressions; non-target RNG shifts are classified as expected structural effects of broader mklev, movement, and turn-tail ownership.
- Current queue:
  1. Classify `seed0116` FR 12522 movement budget/list state before the expected next `were_change()` gate. Inspect per-monster movement budgets, list order, sleeping/zero-speed handling, and `somebody_can_move`; do not add an offset.
  2. Continue `seed0383` FR 9716 `dog_goal()` floor-object/state parity after the seed0116 movement-budget owner is classified or locally blocked.
  3. Recheck Soko screen 109 attr-only map/object color state if it intersects object/monster ownership.
  4. Continue special-level object/monster parity and visible hack-debt cleanup when it unlocks active subsystem work.

### Iteration 4 - Sleeping And Hidden Monster Movement Front Doors

- Implementation delta:
  1. `movemon()` now subtracts movement for frozen or still-sleeping monsters without entering `dochug()`/`distfleeck()`, matching the C ordering where `dochug()` returns before movement AI RNG.
  2. Soko giant mimics now carry object-appearance state as boulders, and object/furniture-appearing hiders spend movement without entering `dochug()`.
- Evidence:
  1. Before this change, `seed0116` matched through the pet post-move `distfleeck()` at FR 12521 but JS consumed extra `distfleeck()` calls for sleeping zoo monsters and then Soko giant mimics before C reached turn-boundary `were_change()`.
  2. After the change, `seed0116` target triage reports `S 109/127 R 12562/12562 FS 109:attr:map:e FR - C 4`; the evidence session now has complete RNG parity and only display attr/cursor mismatches remain.
- Regression stability:
  1. Sentinel suite: `seed8000` `S 23/23 R 3060/3130`, `seed0002` `S 11/595 R 1258/27158`, `seed0013` `S 0/99 R 536/4804`, `seed0116` `S 109/127 R 12562/12562`, `seed0383` `S 0/219 R 9926/16915`; total `S 143/1063 R 27342/64569`.
  2. No sentinel screen-count regressions. `seed0383` remained at FR 9716, so the next queued dog-goal object-state work is not masked by this movement-front-door fix.
- Current queue:
  1. Resume user-priority `seed0383` FR 9716 `dog_goal()` floor-object/state parity. Use `scripts/trace-dog-goal.mjs --scan --rng` to compare the final scanned `fobj`/inventory entries before editing.
  2. Classify seed0116 screen 109 attr-only map/object color drift as display/object-state debt now that RNG is exact.
  3. Broaden sleeping `disturb()` and full mimic `set_mimic_sym()` only when C evidence reaches those predicates.
  4. Continue special-level object/monster parity and visible hack-debt cleanup when it unlocks active subsystem work.

### Iteration 5 - Wizard Intrinsic, Inventory Stacks, Pet Ranged Scoring, And Movement Front Doors

- Implementation delta:
  1. Added a narrow wizard/debug `#wizintrinsic` command state so `h` selects hallucination, prints the timeout message, and consumes a turn instead of moving west.
  2. Added conservative `addinv()`-style carried stack merging for startup and wished stackable objects, including startup cursed-state clearing before role inventory adjustments.
  3. Added the post-candidate `pet_ranged_attk(FALSE)` target scan with `score_targ()` `rnd(5)` fuzz rolls.
  4. Retained and aged minimal fog gas regions so fog clouds only consume vapor TTL when no gas region is already visible at their square.
  5. Added ordinary `m_move()` front doors for peaceful neutral movement, peaceful item-search gate RNG, and the stalker/bat/light approach `rn2(3)` gate.
- Evidence:
  1. `seed0383` first moved from FR 9716 to FR 9732 after `#wizintrinsic`, proving the previous dog-goal blocker was a command-state fallthrough where `h` moved the hero.
  2. Inventory stack merging moved the dog-goal scan through the duplicate Wizard scroll stack and into pet candidate selection at FR 9739.
  3. Pet ranged scoring, fog-region retention, peaceful movement, and light approach gates moved `seed0383` through FR 9739, FR 9756, FR 9757, and FR 9786 to the current FR 9806.
  4. Current `seed0383` blocker: `rn2(28)` expected vs `rn2(16)` actual in `m_move()` backtracking/candidate geometry, pointing at `mfndpos()` terrain/flag candidate counts.
- Regression stability:
  1. Target triage: `seed0383-wizard-hallucinate` now reports `S 0/219 R 10290/16915 FS 0:char:map:init FR 9806:rn2(28)=10=>rn2(16)=6 C 0`.
  2. Sentinel suite: `seed8000` `S 23/23 R 3060/3130`, `seed0002` `S 11/595 R 1259/27158`, `seed0013` `S 0/99 R 536/4804`, `seed0116` `S 109/127 R 12562/12562`, `seed0383` `S 0/219 R 10290/16915`; total `S 143/1063 R 27707/64569`.
  3. Full suite: `S 143/11406`, 0/44 passing. No matched-screen regressions; the `seed0002` +1 RNG shift is classified as a structural effect of startup inventory cursed/stack state.
- Current queue:
  1. Continue user-priority `seed0383` at FR 9806 by porting enough `monmove.c:mfndpos()` terrain/flag candidate accounting to move the `rn2(28)` vs `rn2(16)` boundary without adding a denominator offset.
  2. Classify seed0116 screen 109 attr-only map/object color drift as display/object-state debt now that RNG is exact.
  3. Broaden `#wizintrinsic` beyond hallucination only when evidence reaches additional intrinsic selections.
  4. Continue special-level object/monster parity and visible hack-debt cleanup when it unlocks active subsystem work.

### Iteration 6 - Flying Terrain Candidates, Pet Carry Capacity, And Pet Melee Front Door

- Implementation delta:
  1. Ported more of `mon.c:mfndpos()` terrain eligibility for ordinary movement: flying/in-air monsters now keep pool/lava candidate squares, swimmers can use water walls, and obstructed terrain remains blocked until `ALLOW_WALL`/`ALLOW_DIG` are real.
  2. Added a conservative `can_carry()` load check for pets so small domestic pets reject heavy tools such as the tinning kit after the upstream apport roll.
  3. Added a narrow `dogmove.c` candidate-melee front door before `pet_ranged_attk(FALSE)`, including current evidence for miss/passive RNG and a partial hit/damage/death/growth shape.
- Evidence:
  1. `seed0383` moved through the FR 9806 `rn2(28)` vs `rn2(16)` candidate denominator; trace confirmed the ice-vortex backtracking call now matches `rn2(28)=10`.
  2. The same evidence moved through the first pet `mattackm()` miss/passive path at FR 9857 and now blocks at FR 9933.
  3. Short-lived guarded traces showed the FR 9933 state is not a ranged-scoring predicate bug: JS starts the pet's second movement pass at `(28,3)` with no adjacent target and enters `score_targ()` `rnd(5)`, while C enters `mattackm()`. The next owner is intervening ordinary monster/pet spatial state before the second pass.
- Regression stability:
  1. Target triage: `seed0383-wizard-hallucinate` now reports `S 0/219 R 10241/16915 FS 0:char:map:init FR 9933:rnd(20)=5=>rnd(5)=5 C 0`.
  2. Sentinel suite: `seed8000` `S 23/23 R 3060/3130`, `seed0002` `S 11/595 R 1249/27158`, `seed0013` `S 0/99 R 536/4804`, `seed0116` `S 109/127 R 12562/12562`, `seed0383` `S 0/219 R 10241/16915`; total `S 143/1063 R 27648/64569`.
  3. Full suite: `S 143/11406`, 0/44 passing. No matched-screen regressions; `seed0002` has a RNG-only shift classified as expected structural pet/monster movement side effect.
- Current queue:
  1. Continue user-priority `seed0383` at FR 9933 by classifying the live monster/pet spatial state between the first pet melee and the second pet pass; focus on ordinary `m_move()` positions and candidate blockers, not a ranged-score suppression.
  2. Classify seed0116 screen 109 attr-only map/object color drift as display/object-state debt now that RNG is exact.
  3. Broaden `#wizintrinsic` beyond hallucination only when evidence reaches additional intrinsic selections.
  4. Continue special-level object/monster parity and visible hack-debt cleanup when it unlocks active subsystem work.

### Iteration 7 - Hero Occupied-Monster Movement Front Door

- Implementation delta:
  1. Added the `hack.c:domove()` occupied-monster front door: moving into a monster square now calls a basic attack path, consumes a turn, stops run mode, and leaves the hero in place instead of overlapping the monster.
  2. Kept full `uhitm()` hit/damage/passive effects in the combat backlog; this slice only owns the position/turn boundary.
- Evidence:
  1. `seed0383` step 169 is a westward hero attack in C (`You hit ...`), while JS previously moved into the target square when no retained monster was present there. The new command path is ready for that state once the earlier monster-position drift is fixed.
  2. Current `seed0383` first mismatch remains FR 9933. The useful classification changed: JS still has no monster on the westward `h` target before the hero attack screen, so the immediate owner is monster spatial state before the hero attack and second pet pass, not another dog-goal or ranged-scoring patch.
  3. Discarded direction: a hero-track/gettrack probe was tried and removed because it did not move FR 9933 and regressed `seed0116` from exact RNG parity to FR 6278.
- Regression stability:
  1. Target triage after the command front door: `seed0383-wizard-hallucinate` reports `S 0/219 R 10177/16915 FS 0:char:map:init FR 9933:rnd(20)=5=>rnd(5)=5 C 0`.
  2. Sentinel suite: `seed8000` `S 23/23 R 3060/3130`, `seed0002` `S 11/595 R 1249/27158`, `seed0013` `S 0/99 R 540/4804`, `seed0116` `S 109/127 R 12562/12562`, `seed0383` `S 0/219 R 10177/16915`; total `S 143/1063 R 27588/64569`.
  3. Full suite: `S 143/11406`, 0/44 passing. No matched-screen regressions; several non-target RNG-only prefixes shifted because occupied-monster movement now changes later post-mismatch state.
- Current queue:
  1. Continue `seed0383` FR 9933 by finding why the C hero has a monster on the westward `h` target while JS has empty floor before that command. Focus on ordinary monster movement budgets/list order and live spatial state before step 169.
  2. Classify seed0116 screen 109 attr-only map/object color drift as display/object-state debt now that RNG is exact.
  3. Broaden `#wizintrinsic` beyond hallucination only when evidence reaches additional intrinsic selections.
  4. Continue special-level object/monster parity and visible hack-debt cleanup when it unlocks active subsystem work.

### Iteration 8 - Upstream Object Colors And TTY Gray Normalization

- Implementation delta:
  1. Added generated upstream `objects[otyp].oc_color` metadata to `js/object_data.js` and used it for placed object display colors instead of class/material defaults.
  2. Normalized `CLR_GRAY` to `NO_COLOR` at display-cell storage time to match the tty backend, where both gray and default emit no foreground color.
  3. Split ordinary stairs from branch stairs by recording `isbranch` on stairway records: ordinary up/down stairs render in default/gray color, while branch stairs remain yellow.
- Evidence:
  1. `seed0116` keeps exact RNG parity and screen 109 as the first visible mismatch, but the attr-only drift narrowed from 13 cells to 4 cells.
  2. Remaining `seed0116` screen 109 cells are live object identity/color state, not class-default renderer debt: two potions, one arrow stack, and one ring are visible, cansee cells whose JS `otyp`/color differs from C.
  3. A temporary all-stairs-gray version regressed `seed8000` to `S 6/23`; this was classified as missing branch-stair color state and fixed by marking branch stairs structurally.
- Regression stability:
  1. Target triage after the final branch-stair fix: `seed0116-wizard-wear-shop` reports `S 109/127 R 12562/12562 FS 109:attr:map:e FR - C 4`.
  2. Sentinel suite: `seed8000` `S 23/23 R 3060/3130`, `seed0002` `S 11/595 R 1249/27158`, `seed0013` `S 0/99 R 540/4804`, `seed0116` `S 109/127 R 12562/12562`, `seed0383` `S 0/219 R 10177/16915`; total `S 143/1063 R 27588/64569`.
  3. Full suite: `S 143/11406`, 0/44 passing. No screen-count regressions after the branch-stair refinement.
- Current queue:
  1. Return to user-priority `seed0383` FR 9933 by classifying ordinary monster movement/spatial state before the hero `h` attack and the pet's second movement pass.
  2. Keep `seed0116` screen 109 as a secondary object identity/description-state target: two visible potions, one arrow stack, and one ring still have exact-RNG color/state drift.
  3. Broaden `#wizintrinsic` beyond hallucination only when evidence reaches additional intrinsic selections.
  4. Continue special-level object/monster parity and visible hack-debt cleanup when it unlocks active subsystem work.

### Iteration 9 - Wear Command Timing And Startup Worn State

- Implementation delta:
  1. Added generated upstream `objects[otyp].oc_delay` metadata as `OBJECT_DELAY` for command-side wear timing evidence.
  2. Split displayed `P`/`W` prompt filters from accepted wearable classes: `W` lists unworn armor, `P` lists rings/amulets, but `getobj()` selections can still accept the current armor/amulet evidence.
  3. Marked the deferred Wizard startup cloak object as worn when deferred startup AC is applied, and cleared that worn state on `T`.
  4. Changed `#wizintrinsic h` back to a zero-time prompt selection so it does not move west or run the monster phase.
  5. Added initial delayed-armor wear handling for gray dragon scale mail and amulet wear messages. Full occupation continuation remains incomplete.
- Evidence:
  1. `seed0383` moved beyond the FR 9933 pet melee/spatial blocker to `S 0/219 R 10324/16915`, first RNG mismatch FR 10079 (`rn2(1)=0` expected from `dog_move()` candidate choice versus JS `rnd(20)=2` from pet melee).
  2. C trace around the key sequence shows `P o` starts delayed gray dragon scale mail dressing with `nomul=-5`, while `#wizintrinsic h` has only prompt/UI traces and no RNG.
  3. A too-broad `W` prompt initially regressed `seed0116` to screen 15 by listing a worn startup cloak; this was classified as missing worn startup object state and fixed by marking the deferred cloak worn and clearing it on `T`.
- Regression stability:
  1. Target triage: `seed0116-wizard-wear-shop` stays `S 109/127 R 12562/12562 FS 109:attr:map:e FR - C 4`.
  2. Target triage: `seed0383-wizard-hallucinate` reports `S 0/219 R 10324/16915 FS 0:char:map:init FR 10079:rn2(1)=0=>rnd(20)=2 C 0`.
  3. Sentinel suite: `seed8000` `S 23/23 R 3060/3130`, `seed0002` `S 11/595 R 1249/27158`, `seed0013` `S 0/99 R 540/4804`, `seed0116` `S 109/127 R 12562/12562`, `seed0383` `S 0/219 R 10324/16915`; total `S 143/1063 R 27735/64569`.
  4. Full suite: `S 143/11406`, 0/44 passing. No matched-screen regressions; the seed0383 RNG gain is structural command/inventory timing, not a screen-score target.
- Current queue:
  1. Continue user-priority `seed0383` at FR 10079 by classifying why JS sees an adjacent pet melee target after the gnome death where C continues `dog_move()` candidate selection and ranged scoring. Focus on post-kill monster occupancy, pet candidate flags, and `mattackm()` eligibility.
  2. Keep full delayed occupation continuation for armor dressing in the command/inventory backlog; the current implementation owns the initial timing and object delay metadata only.
  3. Keep `seed0116` screen 109 as a secondary object identity/description-state target: two visible potions, one arrow stack, and one ring still have exact-RNG color/state drift.
  4. Continue special-level object/monster parity and visible hack-debt cleanup when it unlocks active subsystem work.

### Iteration 10 - Armor Occupation Continuation And Pet Attack Balking

- Implementation delta:
  1. `moveloop_core()` now advances remaining delayed armor occupation turns from `OBJECT_DELAY` and prints the finish message when the occupation completes.
  2. `makemon()` now retains adjusted instance `m_lev` and `mhpmax` alongside `mhp`, and pet migration preserves those fields.
  3. Pet melee now applies the C HP/level balk front door before `mattackm()`, so deep-level strong monsters do not get false pet attack RNG just because they are adjacent.
- Evidence:
  1. Minimal occupation continuation moved `seed0383` from FR 10079 to FR 10080 by matching the post-gnome `dog_move()` `rn2(1)` candidate choice.
  2. Retaining adjusted `m_lev`/`mhpmax` and applying the pet balk gate moved through the false ape melee and pet ranged `score_targ()` at FR 10080.
  3. Current `seed0383` target triage: `S 0/219 R 10527/16915 FS 0:char:map:init FR 10082:rn2(5)=3=>rn2(3)=1 C 0`.
  4. Current blocker is no longer pet melee eligibility; it is the next ordinary-monster movement front door after the pet pass, where C enters another `distfleeck()` and JS consumes an extra `rn2(3)` approach/movement gate.
- Regression stability:
  1. `seed0116-wizard-wear-shop` stayed exact on RNG: `S 109/127 R 12562/12562 FS 109:attr:map:e FR - C 4`.
  2. Sentinel suite: `seed8000` `S 23/23 R 3060/3130`, `seed0002` `S 11/595 R 1274/27158`, `seed0013` `S 0/99 R 540/4804`, `seed0116` `S 109/127 R 12562/12562`, `seed0383` `S 0/219 R 10527/16915`; total `S 143/1063 R 27963/64569`.
  3. Full suite: `S 143/11406`, 0/44 passing. No matched-screen regressions; `seed0002` and `seed0361` RNG-only shifts are classified as expected structural side effects of retained adjusted monster level/HP and occupation timing.
- Current queue:
  1. Continue user-priority `seed0383` at FR 10082 by identifying the ordinary monster that enters JS's extra `rn2(3)` gate after the pet pass; inspect movement predicates and spatial/list state around C's `movemon_turn` immediately after `dog_move`.
  2. Keep message-interrupted occupation continuation as a known approximation; current implementation owns RNG timing better but not full `--More--` choreography.
  3. Keep `seed0116` screen 109 as a secondary object identity/description-state target: two visible potions, one arrow stack, and one ring still have exact-RNG color/state drift.
  4. Continue special-level object/monster parity and visible hack-debt cleanup when it unlocks active subsystem work.

### Iteration 11 - Turn-Based Fog Region Aging

- Implementation delta:
  1. `movemon()` now ages retained gas regions at most once per game turn instead of once per `movemon()` pass.
  2. This keeps extra high-movement monster passes from expiring fog-cloud vapor regions too early and reopening `create_gas_cloud()` TTL RNG in the same turn.
- Evidence:
  1. A temporary guarded trace around ordinary movement showed the FR 10082 extra `rn2(3)` was not an approach/candidate gate; it was the fog-cloud vapor TTL gate reopening before C.
  2. After turn-based gas aging, `seed0383` moved from FR 10082 to FR 10154. The new mismatch is `rn2(2)=1` expected from neutral `dog_move()` candidate selection versus JS `rnd(20)=20` from pet melee.
  3. A temporary guarded pet trace identified the target as an `IGUANA` at `(27,4)` adjacent to the pet at `(28,4)`. C's dog_move trace has `mfndpos=7` and no adjacent target there, so the remaining owner is ordinary iguana spatial drift before the pet pass.
- Regression stability:
  1. Target triage: `seed0383-wizard-hallucinate` reports `S 0/219 R 10413/16915 FS 0:char:map:init FR 10154:rn2(2)=1=>rnd(20)=20 C 0`.
  2. `seed0116-wizard-wear-shop` stayed exact on RNG: `S 109/127 R 12562/12562 FS 109:attr:map:e FR - C 4`.
  3. Sentinel suite: `seed8000` `S 23/23 R 3060/3130`, `seed0002` `S 11/595 R 1274/27158`, `seed0013` `S 0/99 R 540/4804`, `seed0116` `S 109/127 R 12562/12562`, `seed0383` `S 0/219 R 10413/16915`; total `S 143/1063 R 27849/64569`.
  4. Full suite: `S 143/11406`, 0/44 passing. No matched-screen regressions; the seed0383 first mismatch moved later even though aggregate matched-call count dropped due later resync differences.
- Current queue:
  1. Continue user-priority `seed0383` at FR 10154 by tracing the iguana's prior ordinary movement from its C/JS divergence point. Focus on movement candidate geometry, occupied-square rejection, or list/budget state before the dog pass.
  2. Keep message-interrupted occupation continuation as a known approximation; current implementation owns RNG timing better but not full `--More--` choreography.
  3. Keep `seed0116` screen 109 as a secondary object identity/description-state target: two visible potions, one arrow stack, and one ring still have exact-RNG color/state drift.
  4. Continue special-level object/monster parity and visible hack-debt cleanup when it unlocks active subsystem work.

### Iteration 12 - Pet Kill Growth HP State

- Implementation delta:
  1. `pet_melee_attack()` now applies the C-shaped `grow_up(mtmp, victim)` max/current HP update after pet kills instead of only consuming the growth roll.
  2. Pet melee candidates now pass a `mfndpos()`-style square reachability check before `ALLOW_M` attack handling, so monster-occupied squares are only attacked if the pet could otherwise enter that square.
- Evidence:
  1. A guarded trace showed the FR 10154 false iguana melee was caused by stale pet HP state, not an iguana movement-selector special case: after the prior gnome kill, C's `grow_up()` consumed `rnd(2)=1`, increased the kitten's `mhpmax`, and did not heal current HP because `max_increase` was 1.
  2. JS had left the kitten at `4/4`; after the fix it reaches the C-like `4/5` state, lowers the later attack-balk threshold, skips the level-3 iguana melee, and follows C through the neutral `dog_move()` candidate RNG.
  3. `seed0383` moved from FR 10154 to FR 10213. The new blocker is `mattacku()` monster-to-hero combat: C has an adjacent monster attack consume `rnd(2)`, hit rolls, damage, knockback, and status updates while JS falls through to ordinary movement `rn2(5)`.
- Regression stability:
  1. Target triage: `seed0383-wizard-hallucinate` reports `S 0/219 R 10573/16915 FS 0:char:map:init FR 10213:rnd(2)=2=>rn2(5)=0 C 0`.
  2. `seed0116-wizard-wear-shop` stayed exact on RNG: `S 109/127 R 12562/12562 FS 109:attr:map:e FR - C 4`.
  3. Sentinel suite: `seed8000` `S 23/23 R 3060/3130`, `seed0002` `S 11/595 R 1274/27158`, `seed0013` `S 0/99 R 540/4804`, `seed0116` `S 109/127 R 12562/12562`, `seed0383` `S 0/219 R 10573/16915`; total `S 143/1063 R 28009/64569`.
  4. Full suite: `S 143/11406`, 0/44 passing. No matched-screen regressions; total public screens are unchanged because this remains behind seed0383's first visible hallucination/map mismatch.
- Current queue:
  1. Continue user-priority `seed0383` at FR 10213 by porting a narrow, general `dochug()` adjacent hero attack / `mattacku()` front door for ordinary monsters. Use `mhitu.c` for the current multiattack hit/damage/knockback RNG shape.
  2. Keep message-interrupted occupation continuation as a known approximation; current implementation owns RNG timing better but not full `--More--` choreography.
  3. Keep `seed0116` screen 109 as a secondary object identity/description-state target: two visible potions, one arrow stack, and one ring still have exact-RNG color/state drift.
  4. Continue special-level object/monster parity and visible hack-debt cleanup when it unlocks active subsystem work.

### Iteration 13 - First Monster-To-Hero Physical `mattacku()`

- Implementation delta:
  1. `scripts/generate-monster-data.mjs` now includes `mattk[]` attack metadata from `include/monsters.h`, and `js/mklev.js` carries that metadata on monster data records.
  2. Wizard wish handling now preserves explicit blessed/cursed/uncursed state and enchantment from wish text; delayed armor recalculates AC and applies it for the final occupation turn before the finish message.
  3. `monmove.js` now has a constrained post-move `mattacku()` front door for generated multiattack physical melee monsters, including `AC_VALUE()`, the occupation `multi` hit bonus, per-attack `rnd(20+i)`, damage dice, `mhitm_knockback()`'s initial `rn2(3)`/`rn2(6)`, negative-AC damage reduction, and hero HP updates.
- Evidence:
  1. `seed0383` moved from FR 10213 to FR 10280. The ape attack sequence at FR 10213 now matches C through three physical attacks: `rnd(2)`, hit rolls, `d(1,3)`, `d(1,3)`, `d(1,6)`, knockback front-door rolls, and negative-AC reductions.
  2. The +3 blessed gray dragon scale mail wish state is necessary: without it JS keeps `u.uac=10` and misses C's `AC_VALUE(-2)` roll. Applying deferred AC on the final occupation turn is also necessary because C's attack still has `gm.multi < 0` and receives the +4 hit bonus.
  3. A direct `AT_ENGL`/`gulpmu()` attempt for the ice vortex matched the expected FR 10280 shape locally, but it fired too early at FR 10183 because JS already has the vortex adjacent before C. That direction was reverted and classified as a spatial/list-timing blocker, not an attack-RNG blocker.
- Regression stability:
  1. Target triage: `seed0383-wizard-hallucinate` reports `S 0/219 R 10640/16915 FS 0:char:map:init FR 10280:rnd(2)=1=>rn2(12)=10 C 0`.
  2. `seed0116-wizard-wear-shop` stayed exact on RNG: `S 109/127 R 12562/12562 FS 109:attr:map:e FR - C 4`.
  3. Sentinel suite: `seed8000` `S 23/23 R 3060/3130`, `seed0002` `S 11/595 R 1274/27158`, `seed0013` `S 0/99 R 540/4804`, `seed0116` `S 109/127 R 12562/12562`, `seed0383` `S 0/219 R 10640/16915`; total `S 143/1063 R 28076/64569`.
  4. Full suite: `S 143/11406`, 0/44 passing. No matched-screen regressions; total public screens are unchanged because the remaining seed0383 screen blocker is still the initial hallucination/map display drift.
- Current queue:
  1. Continue user-priority `seed0383` at FR 10280 by classifying ice-vortex `AT_ENGL` timing. Compare the vortex's C/JS position, movement budget, and list order before enabling `gulpmu()`; a broad engulf front door currently regresses to FR 10183.
  2. Keep message-interrupted occupation continuation as a known approximation; current implementation owns final-turn AC and attack timing better but not full `--More--` choreography.
  3. Keep `seed0116` screen 109 as a secondary object identity/description-state target: two visible potions, one arrow stack, and one ring still have exact-RNG color/state drift.
  4. Continue special-level object/monster parity and visible hack-debt cleanup when it unlocks active subsystem work.

### Iteration 14 - Ice Vortex Engulf, Regen HP, And Swallowed Pet Sight

- Implementation delta:
  1. Enabled the narrow generated-attack `AT_ENGL` front door in `monmove.js` for one real engulf attack row, including hit roll, `gulpmu()` damage dice, swallow placement/state, swallow timer, and current cold/fire/electric/physical/acid damage gates.
  2. Preserved the C `dochug()` phase-three rule that standard attacks do not fire after `m_move()` returns `MMOVE_MOVED`; this keeps the ice vortex from attacking on the earlier adjacent-move pass.
  3. Added damaged-hero `regen_hp()` ownership in the turn tail immediately after `maybe_generate_rnd_mon()`, matching the post-swallow `rn2(100)` before hunger and engraving-wipe RNG.
  4. Added swallowed-master suppression for `dog_goal()` apport candidates, so the pet still scans `obj_resists()` for nearby floor objects but does not fire the `rn2(8)` apport gate while the hero is swallowed.
- Evidence:
  1. `seed0383` moved through the FR 10280 ice-vortex `AT_ENGL` sequence: `rnd(2)`, hit roll, `d(1,6)`, swallow timer, and cold gate now match C.
  2. The new `regen_hp()` owner matched C's FR 10321 `rn2(100)` after engulf damage and before `gethungry()`/wipe checks.
  3. The swallowed pet-sight gate matched the post-swallow `dog_goal()` floor-object and inventory scan through FR 10346, then candidate selection and pet ranged scoring through FR 10355.
  4. Current blocker is `seed0383` FR 10360: C expects another `distfleeck()` `rn2(5)`, while JS enters a tiger `m_move()` `mtrack` `rn2(32)` backtracking roll. A guarded temporary trace identified the owner as the tiger at `(45,13)`; the trace was removed. The next owner is prior tiger spatial or `mtrack[0]` drift, not engulf combat.
- Regression stability:
  1. Target triage: `seed0383-wizard-hallucinate` reports `S 0/219 R 10597/16915 FS 0:char:map:init FR 10360:rn2(5)=4=>rn2(32)=30 C 0`.
  2. `seed0116-wizard-wear-shop` stayed exact on RNG: `S 109/127 R 12562/12562 FS 109:attr:map:e FR - C 4`.
  3. Sentinel suite: `seed8000` `S 23/23 R 3060/3130`, `seed0002` `S 11/595 R 1274/27158`, `seed0013` `S 0/99 R 540/4804`, `seed0116` `S 109/127 R 12562/12562`, `seed0383` `S 0/219 R 10597/16915`; total `S 143/1063 R 28033/64569`.
  4. Full suite: `S 143/11406`, 0/44 passing. No matched-screen regressions; the seed0383 aggregate matched-call count is lower after later resync changes, but the first mismatch moved structurally later from FR 10280 to FR 10360.
- Current queue:
  1. Continue user-priority `seed0383` at FR 10360 by comparing tiger movement history, `mtrack[0]`, and candidate geometry before the post-swallow movement pass. Do not suppress `mtrack` generally; seed0116 depends on real backtracking rolls.
  2. Keep message-interrupted occupation continuation as a known approximation; current implementation owns final-turn AC, stop-on-engulf, and attack timing better but not full `--More--` choreography.
  3. Keep `seed0116` screen 109 as a secondary object identity/description-state target: two visible potions, one arrow stack, and one ring still have exact-RNG color/state drift.
  4. Continue special-level object/monster parity and visible hack-debt cleanup when it unlocks active subsystem work.

### Iteration 15 - Swallowed Movement And Repeat Engulf Timing

- Implementation delta:
  1. Added a minimal `set_apparxy()` owner before ordinary `distfleeck()`, targeting the real hero square in the current visibility model so swallowed monsters keep `mux/muy` aligned with `u.ux/u.uy`.
  2. Added the `monmove.c:m_move()` swallowed-bystander early return: while the hero is swallowed, non-fleeing monsters other than `u.ustuck` spend their movement opportunity without ordinary path selection or `mtrack` backtracking.
  3. Split initial and already-swallowed `AT_ENGL` handling so repeat engulf attacks skip the hit roll and swallow timer while still rolling `gulpmu()` damage and elemental gates.
- Evidence:
  1. `seed0383` moved from FR 10360 (`rn2(5)` expected vs JS tiger `rn2(32)` backtracking) to FR 10374 (`rnd(2)` expected from repeat ice-vortex `gulpmu()` damage vs JS gnome `distfleeck()` `rn2(5)`).
  2. A temporary trace, removed before verification, showed creation/list order remains C-shaped around the ice vortex, gnome, and earth elemental. The next owner is the intervening gnome's prior movement/sleep/frozen/offmap/death state, not a species-order swap or an engulf RNG omission.
  3. `seed0116` remains exact on RNG with only the four visible object-color attr cells at screen 109.
- Regression stability:
  1. Target triage: `seed0383-wizard-hallucinate` reports `S 0/219 R 10675/16915 FS 0:char:map:init FR 10374:rnd(2)=1=>rn2(5)=4 C 0`.
  2. Target triage: `seed0116-wizard-wear-shop` reports `S 109/127 R 12562/12562 FS 109:attr:map:e FR - C 4`.
  3. Sentinel suite: `seed8000` `S 23/23 R 3060/3130`, `seed0002` `S 11/595 R 1274/27158`, `seed0013` `S 0/99 R 540/4804`, `seed0116` `S 109/127 R 12562/12562`, `seed0383` `S 0/219 R 10675/16915`; total `S 143/1063 R 28111/64569`.
  4. Full suite: `S 143/11406`, 0/44 passing. No matched-screen regressions; the score delta is lagging evidence while the structural gain is the later first mismatch and removal of false swallowed-bystander path RNG.
- Current queue:
  1. Continue user-priority `seed0383` at FR 10374 by tracing why the gnome at about `(46,3)` remains eligible for `distfleeck()` before the swallowed ice vortex repeats `gulpmu()`. Compare prior movement budget, `msleeping`/`mcanmove`, offmap/death state, and list membership; do not swap list order by hand.
  2. Keep `seed0116` screen 109 as a secondary object identity/description-state target: two visible potions, one arrow stack, and one ring still have exact-RNG color/state drift.
  3. Continue special-level object/monster parity and visible hack-debt cleanup when it unlocks active subsystem work.

### Iteration 16 - Movement Pass Snapshot

- Implementation delta:
  1. `movemon()` now snapshots the live monster array before the movement pass, mirroring `mon.c:iter_mons_safe()` so removals or insertions during combat do not shift ownership of later monsters' turns.
  2. The pass still checks that a snapshotted monster remains linked before processing it, preserving the C idea of a stable traversal without acting on monsters that have already been removed.
- Evidence:
  1. Current target behavior is neutral: `seed0383` remains at FR 10374 (`rnd(2)` expected from repeat ice-vortex `gulpmu()` vs JS gnome `distfleeck()`), so the active blocker is still the gnome's state/list membership before the swallowed-monster pass.
  2. `seed0116` remains exact on RNG with only the four visible object-color attr cells at screen 109.
- Regression stability:
  1. `node scripts/triage-session.mjs sessions/seed0383-wizard-hallucinate.session.json` => `S 0/219 R 10675/16915 FS 0:char:map:init FR 10374:rnd(2)=1=>rn2(5)=4 C 0`.
  2. `node scripts/triage-session.mjs sessions/seed0116-wizard-wear-shop.session.json` => `S 109/127 R 12562/12562 FS 109:attr:map:e FR - C 4`.
  3. `node scripts/run-sentinel-suite.mjs` => total `S 143/1063 R 28111/64569`.
  4. `node frozen/ps_test_runner.mjs` => total `S 143/11406`, 0/44 passing. No matched-screen regressions.
- Current queue:
  1. Continue `seed0383` FR 10374 by checking whether removed/dead-monster cleanup or prior gnome state differs before the repeat engulf turn; do not force order or skip the gnome by session.
  2. Use the exact-RNG `seed0116` screen 109 attr mismatch as the next localized object-state target if the seed0383 live-state owner remains locally blocked.
  3. Continue special-level object/monster parity and visible hack-debt cleanup when it unlocks active subsystem work.

### Iteration 17 - Runtime `o_init` Appearance Colors

- Implementation delta:
  1. `js/o_init.js` now retains mutable per-otype color and material arrays, applies the C `randomize_gem_colors()` color copies, and performs the `shuffle_all()` color/material swaps for amulets, potions, rings, scrolls, spellbooks, wands, venoms, and the armor description ranges.
  2. `place_object()` now takes floor-object display colors from the runtime shuffled object state instead of the static `object_data.js` defaults. `object_material()` also reads the runtime material table for later object behavior that depends on shuffled material.
- Evidence:
  1. `seed0116` stayed exact on RNG and the screen 109 attr mismatch narrowed from four cells to three: the shuffled ring cell at `[15,15]` now matches C's white `=` display.
  2. The remaining visible object drift is two potions and an arrow stack. The potions now use shuffled colors (`otyp 298` cyan, `otyp 300` yellow) but C displays default-color potions there, so the next owner is object identity/state in Soko/trap-victim/special-level object creation rather than the base renderer. The arrow stack remains an orcish-arrow-looking black object where C displays a default-color weapon glyph.
  3. `seed0383` target triage stayed unchanged at FR 10374, so the object-display fix does not disturb the current swallowed-monster movement blocker.
- Regression stability:
  1. `node scripts/triage-session.mjs sessions/seed0116-wizard-wear-shop.session.json` => `S 109/127 R 12562/12562 FS 109:attr:map:e FR - C 4`; direct sample shows three attr cells plus the existing cursor-only diagnostics.
  2. `node scripts/triage-session.mjs sessions/seed0383-wizard-hallucinate.session.json` => `S 0/219 R 10675/16915 FS 0:char:map:init FR 10374:rnd(2)=1=>rn2(5)=4 C 0`.
  3. `node scripts/run-sentinel-suite.mjs` => total `S 143/1063 R 28111/64569`.
  4. `node frozen/ps_test_runner.mjs` => total `S 143/11406`, 0/44 passing. No matched-screen regressions.
- Current queue:
  1. Continue `seed0383` FR 10374 gnome state/list membership unless a narrower live-state diagnostic remains blocked.
  2. For `seed0116`, trace the remaining three object identities back to Soko/trap-victim/special-level object creation. Focus on why C has default-color potion/weapon glyphs where JS has `POT_RESTORE_ABILITY`, `POT_BLINDNESS`, and orcish arrows.
  3. Keep broader description/name identity wiring in the object backlog; this slice only owns runtime color/material appearance.

### Iteration 18 - Monster Item Pickup And Wear Delay

- Implementation delta:
  1. Added a conservative `monmove.c:m_search_items()`/`mpickstuff()` front door for intelligent collector monsters: nearby desirable floor objects can retarget ordinary movement without adding RNG, the monster picks one reachable item from the landing square, and pickup sets an `I_SPECIAL` re-equip check for a later movement turn.
  2. Added a minimal monster `m_dowear()` path for boots using `OBJECT_DELAY`, setting `mfrozen`/`mcanmove=0` and timing the cooldown through `mcalcdistress()`.
  3. Added the swallowed-hero `mattacku()` guard so only `u.ustuck` can roll attacks while `u.uswallow` is true.
- Evidence:
  1. C trace showed monster `#144` was a gnome that moved onto levitation boots, picked them up, and then spent later ready movement turns wearing them before re-entering `distfleeck()`. JS had left the boots on the floor and the gnome awake, which caused the FR 10374 extra gnome `distfleeck()`.
  2. `seed0383` moved from `S 0/219 R 10675/16915` at FR 10374 to `S 0/219 R 10822/16915` at FR 10491. The current blocker is no longer the gnome or repeat engulf; C continues a swallowed-pet `dog_goal()` floor-object scan (`obj_resists()`), while JS reaches `mcalcmove()`.
  3. `seed0116` remained exact on RNG and unchanged on the three screen-109 object-color attr cells.
- Regression stability:
  1. `node scripts/triage-session.mjs sessions/seed0383-wizard-hallucinate.session.json` => `S 0/219 R 10822/16915 FS 0:char:map:init FR 10491:rn2(100)=2=>rn2(12)=10 C 0`.
  2. `node scripts/triage-session.mjs sessions/seed0116-wizard-wear-shop.session.json` => `S 109/127 R 12562/12562 FS 109:attr:map:e FR - C 4`.
  3. `node scripts/run-sentinel-suite.mjs` => total `S 143/1063 R 28258/64569`.
  4. `node frozen/ps_test_runner.mjs` => total `S 143/11406`, 0/44 passing. No matched-screen regressions; non-target RNG-only shifts in object/monster-heavy sessions are classified as expected consequences of enabling monster item pickup and wear timing.
- Current queue:
  1. Continue `seed0383` at FR 10491 by comparing the swallowed pet's `dog_goal()` search rectangle and retained `fobj` entries after the second repeat-engulf turn. Count missing/extra object scans before changing candidate movement.
  2. Keep `seed0116` screen 109 as the secondary exact-RNG object identity target: two visible potions and one arrow stack still have object identity/color drift.
  3. Broaden monster inventory/equipment only from evidence; current implementation owns collector pickup and boot wear delay, not full `minvent`, armor preference, or all `m_search_items()` type predicates.

### Iteration 19 - Swallowed Hero Position And Gas Region Lifetime

- Implementation delta:
  1. `advanceTurn()` now restores the C invariant that a swallowed hero's `u.ux/u.uy` are pinned to the engulfing `u.ustuck` monster before monster movement and pet goal logic observe the master square.
  2. `m_move_basic()` keeps `u.ux/u.uy` synchronized when the swallowing monster moves and requests a vision recalculation.
  3. Minimal fog gas regions now match the `run_regions()` lifetime shape more closely: zero-TTL regions remain visible until the next region pass, and region aging runs after the final monster movement pass for the turn rather than before `m_everyturn_effect()`.
- Evidence:
  1. `seed0383` moved from `S 0/219 R 10822/16915` at FR 10491 to `S 0/219 R 10907/16915` at FR 10608.
  2. The FR 10491 dog-goal gap was caused by hero coordinate drift: C's pet sees the swallowed master at `u.ustuck`, scans six floor objects, the wanderer gate, and 16 inventory `obj_resists()` calls; JS had the hero one cell away and took the follow/candidate path early.
  3. The FR 10531 fog mismatch was a region lifetime issue. C keeps a just-aged zero-TTL gas region visible until the next `run_regions()` pass, preventing a false fog-cloud vapor TTL roll during the same monster phase.
  4. Discarded direction: a direct swallowed-hero attack front door in `domove()` matched the later C shape locally, but regressed to FR 10483 because JS is still misaligned around the `W` wear prompt selection. Do not reintroduce it until prompt/message state reaches the C boundary.
- Regression stability:
  1. `node scripts/triage-session.mjs sessions/seed0383-wizard-hallucinate.session.json` => `S 0/219 R 10907/16915 FS 0:char:map:init FR 10608:rn2(20)=12=>rn2(5)=2 C 0`.
  2. `node scripts/triage-session.mjs sessions/seed0116-wizard-wear-shop.session.json` => `S 109/127 R 12562/12562 FS 109:attr:map:e FR - C 4`.
  3. `node scripts/run-sentinel-suite.mjs` => total `S 143/1063 R 28343/64569`; no sentinel screen-count regressions.
  4. `node frozen/ps_test_runner.mjs` => total `S 143/11406`, 0/44 passing. Non-target RNG shifts are classified as expected structural side effects of swallowed-position and region-lifetime ownership; matched screen counts stayed stable.
- Current queue:
  1. Classify `seed0383` FR 10608 by aligning the zero-RNG command/prompt sequence: `W` wear prompt, `n` selection, message-more screens, `#wizintrinsic` getlin/menu, and the later `h` key that should reach swallowed hero `uhitm()`.
  2. Keep `seed0116` screen 109 as the secondary exact-RNG object identity target: two visible potions and one arrow stack still have object identity/color drift.
  3. Broaden monster inventory/equipment only from evidence; current implementation owns collector pickup and boot wear delay, not full `minvent`, armor preference, or all `m_search_items()` type predicates.

### Iteration 20 - Swallowed Hero Attack Front Door

- Implementation delta:
  1. `rhack()` now treats the space after `You finish your dressing maneuver.` while swallowed as a message dismissal that resumes the pending turn sequence, instead of an unknown zero-time command. A broader attempt to treat every `(being worn)` message this way overshot C and was discarded.
  2. `domove()` now routes swallowed directional movement into a narrow `u.ustuck` hero-attack front door rather than moving the swallowed hero. The current evidence shape includes the leading hunger/exercise calls, `hitum()` hit roll, `dmgval()` `rnd(6)`, message, knockback front-door rolls, known-hit, and passive roll.
  3. Discarded direction: changing delayed armor occupation from `delay - 1` to `delay` regressed `seed0383` to FR 10213. Keep the existing occupation count; the missing boundary was message continuation, not object delay.
- Evidence:
  1. `seed0383` moved from `S 0/219 R 10907/16915` at FR 10608 to `S 0/219 R 10903/16915` at FR 10646. The lagging matched-call count dipped by 4, but the first mismatch moved structurally from before the swallowed attack to post-attack ordinary monster movement.
  2. The in-attack mismatch `rnd(6)` expected vs `d(1,6)` actual was fixed by using `dmgval()`'s one-die `rnd(6)` shape instead of dice notation.
  3. Current blocker: after the swallowed hero attack, C expects another `distfleeck()` gate in ordinary monster movement, while JS consumes an extra `rn2(3)` approach/candidate gate. The next useful step is to identify the live monster/predicate owner, not to change combat again.
- Regression stability:
  1. `node scripts/triage-session.mjs sessions/seed0383-wizard-hallucinate.session.json` => `S 0/219 R 10903/16915 FS 0:char:map:init FR 10646:rn2(5)=0=>rn2(3)=1 C 0`.
  2. `node scripts/triage-session.mjs sessions/seed0116-wizard-wear-shop.session.json` => `S 109/127 R 12562/12562 FS 109:attr:map:e FR - C 4`.
  3. `node scripts/run-sentinel-suite.mjs` => total `S 143/1063 R 28339/64569`; no sentinel screen-count regressions.
  4. `node frozen/ps_test_runner.mjs` => total `S 143/11406`, 0/44 passing. No public screen-count regressions; non-target RNG prefixes remained stable except the expected structural shift in `seed0383`.
- Current queue:
  1. Classify `seed0383` FR 10646 post-attack movement: identify which monster owns the extra JS `rn2(3)` and compare its C/JS `distfleeck()`, approach gate, candidate geometry, and movement budget state.
  2. Keep `seed0116` screen 109 as the secondary exact-RNG object identity target: two visible potions and one arrow stack still have object identity/color drift.
  3. Broaden monster inventory/equipment only from evidence; current implementation owns collector pickup and boot wear delay, not full `minvent`, armor preference, or all `m_search_items()` type predicates.

## 2026-05-12 08:55 CEST Restart - Dehack, Deep Triage, Implementation Loop

- Branch/baseline commit: `main` at `f4be79ac016690ec4a293cadad6427ed4d4715e3`.
- Startup wall time: 2026-05-12 08:55 CEST.
- Full suite baseline: 50/11406 screens, 0/44 passing.
- Sentinel baseline: 50/1063 screens, RNG 20420/64569.
- Corpus triage baseline: 44 sessions, 41 compact buckets regenerated in `scratch/divergence-inventory.md`.
- Current target: pet/floor-object parity, with `seed0116-wizard-wear-shop` as the smaller exact-prefix evidence path and `seed0383-wizard-hallucinate` as the deeper special-level evidence path.
- Active hypothesis: both leading live blockers are missing retained or position-correct objects feeding `dogmove.c:dog_goal()`. This should be solved by object/shop/special-level state fidelity, not by changing the dog movement selector for a single session.
- Dehack iteration:
  1. Deleted stale tracked probes `scratch/check_features.mjs`, `scratch/check_mklev.mjs`, and `scratch/inspect_screens.mjs`.
  2. Kept reusable diagnostics in `scripts/triage-corpus.mjs`, `scripts/triage-session.mjs`, and `scripts/trace-dog-goal.mjs`.
  3. Verification after cleanup: sentinel stayed at 50/1063 screens and direct `seed0002` triage stayed 11/595 screens, FR 1215.
- Deep triage facts:
  1. `seed0116`: exact prefix parity reaches 14 `obj_resists()` calls in `dog_goal()`; C then expects three more `obj_resists()` calls before candidate selection. JS has 14 Wizard inventory objects and no nearby retained floor objects in the pet search rectangle.
  2. `seed0383`: exact prefix parity reaches six nearby floor-object resistance checks and two failed apport rolls; C then scans at least one more `fobj` entry while JS starts the follow-player gate. The likely cause is a missing object near the search rectangle or a one-cell pet-arrival/search-rectangle drift.
  3. Corpus startup remains broad: 10 early-startup buckets still block on chargen/options, 19 mklev-or-uinit buckets block on level generation or initial inventory, and 10 late-startup buckets block on object/monster/special-level/display side effects. The pet/object target is still highest-value because it sits past much deeper initialized state and has precise RNG evidence.
- Queue:
  1. Improve `scripts/trace-dog-goal.mjs` so it can print the exact dog-goal floor/inventory scan order and classification decisions, not just the retained object set.
  2. Localize the three missing `seed0116` object scans: inspect shop stocking, cloak takeoff/wear state, retained floor/shop objects around the kitten, and inventory objects after `T`.
  3. Localize the extra `seed0383` scan: compare special `des.object()`/kelp placement, pet-arrival candidate rejection, and nearby `fobj` order after the second apport failure.
  4. Implement the general subsystem owner once localized: shop object retention, special-level object placement, pet-arrival placement predicates, or dog-goal classification.
  5. Continue visible hack-debt cleanup when it unlocks the active work, especially seed0002 startup `_override_screen` debt and seed replay tables.
- Verification cadence: target triage after each production edit, sentinel after each meaningful edit, full suite after 3-5 meaningful implementation iterations or broad shared changes.

### Close-Up Checkpoint - User Stop Request

- Active loop time for this restarted lane: about 25 minutes, from 08:55 CEST startup through final verification.
- Meaningful implementation iterations completed in this lane: 5.
- Implementation delta:
  1. Removed stale tracked scratch probes and regenerated compact corpus divergence inventory.
  2. Retained unburied `mineralize()` gold/gem objects on the live floor object chain.
  3. Matched tame movement short-circuiting around the wanderer roll and kept post-pet `distfleeck()` in the turn path.
  4. Added uppercase vi run command state so `L` and related commands consume repeated full turns instead of one step or an unknown-command screen.
  5. Added early pet `whappr` handling and old/new pet square redraws, exposing the next real live-movement blocker.
- Lagging score delta:
  1. Full public corpus moved from 50/11406 screens, 0/44 passing to 51/11406 screens, 0/44 passing.
  2. Sentinel suite moved from 50/1063 screens and RNG 20420/64569 to 51/1063 screens and RNG 20354/64569.
  3. Evidence session `seed0116-wizard-wear-shop` moved from 16/127 screens to 17/127 screens and now blocks at FR 5573 during the internal uppercase-`L` run turns.
- Sentinel stability: no sentinel screen-count regressions. `seed8000` stayed complete at 23/23; `seed0002`, `seed0013`, and `seed0383` kept their screen counts while RNG prefixes shifted from structural movement/pet predicate changes.
- Regression classification:
  1. `seed0002` RNG prefix shifted from 1314 to 1247, `seed0013` from 543 to 538, and `seed0383` from 9906 to 9877 with unchanged screen counts. These are classified as expected structural side effects of generalized movement/run/pet predicates, not accidental display regressions.
  2. The discarded direction was treating the pet/object mismatch as another dog-goal candidate selector issue. Current traces show the next `seed0116` blocker is live monster movement ownership around `distfleeck()`, while `seed0383` remains floor-object/position state.
- Final verification:
  1. `node scripts/triage-session.mjs sessions/seed0116-wizard-wear-shop.session.json` => `S 17/127 R 5682/12562`, first mismatch screen 17, first RNG mismatch FR 5573 (`rn2(5)` expected vs `rn2(100)` actual).
  2. `node scripts/run-sentinel-suite.mjs` => total `S 51/1063 R 20354/64569`.
  3. `node frozen/ps_test_runner.mjs` => total `S 51/11406`, 0/44 passing.
- Current queue:
  1. Classify live monster movement ownership during run turns: `seed0116` FR 5573 expects another `distfleeck()` before JS continues pet object scanning.
  2. Continue `seed0383` `dog_goal()` object visibility/state at FR 9716, especially missing or position-drifted special-level floor objects near the pet.
  3. Recheck special-level monster/list ordering after dog-goal state advances.
  4. Continue startup/windowing dehack work only when it unlocks real subsystem parity.
- Global next-step check before stopping: active queue, `feature_map.md`, visible replay/override hack debt, latest regressions, and relevant upstream owners (`monmove.c`, `dogmove.c`, `mklev.c`) were checked. Safe structural next steps remain, but the exact valid stop condition is that the user explicitly asked to close the current iteration so they can push to `main`.

## 2026-05-12 Marathon Restart - Dehack/Triage Backlog

- Branch/baseline commit: `main` at `0497013`.
- Startup wall time: 2026-05-12 00:44 CEST.
- Full suite baseline: 50/11406 screens, 0/44 passing.
- Sentinel baseline: 50/1063 screens, RNG 20420/64569.
- Corpus triage baseline: 44 sessions, 41 compact buckets regenerated in `scratch/divergence-inventory.md`.
- Current target: pet/floor-object parity using `seed0383-wizard-hallucinate` and `seed0116-wizard-wear-shop` as evidence.
- Active hypothesis: the next useful subsystem move is not another pet step special case. Both evidence paths are blocked by the same C subsystem boundary: `dogmove.c:dog_goal()` scans `fobj` and then `gi.invent`, and JS still lacks enough retained/position-correct floor and inventory objects to feed that scan.
- Dehack scan:
  1. Remaining production replay scaffolds are still scoped to `js/fastforward.js` and `js/fastforward0002.js`.
  2. Remaining `_override_screen` debt is startup/menu/windowing, especially seed0002 chargen and seed8000 hardcoded menu strings.
  3. Untracked `debug/` replay-generation scripts exist, but they are not tracked production debt; do not treat them as subsystem truth.
  4. Tracked `scratch/` diagnostics remain lightweight, with `scratch/divergence-inventory.md` now regenerated from compact triage.
- Deep triage facts:
  1. `seed0116`: C consumes `distfleeck()` then kitten wanderer, then 17 `obj_resists()` calls in `dog_goal()` before candidate selection. JS currently consumes 14 `obj_resists()` calls, then starts dog movement candidate RNG. This is three missing object-scan entries, not a movement-selector bug.
  2. `seed0116`: at the active screen, JS has the kitten at roughly `(9,13)`, hero at `(11,14)`, 14 Wizard inventory objects, and no nearby retained floor objects. C's extra `obj_resists()` calls therefore point at missing/position-drifted floor/shop objects or inventory state around the pet, not a new RNG gate.
  3. `seed0383`: C consumes two apport `rn2(8)` failures and then a long run of `obj_resists()` calls from `dog_goal()`. JS reaches the same broad phase but remains sensitive to pet position and retained special-level floor objects around `(27..33,4..9)`.
  4. `seed0383`: when JS advances past the first mismatch, the nearby object set includes kelp at `(33,9)`, `(29,6)`, `(25,6)`, `(24,7)`, armor at `(33,6)`, and a tool at `(25,3)`. C's longer scan implies more `fobj` entries in the pet rectangle or a one-cell pet/hero placement drift changing the scan rectangle.
- Queue:
  1. Port enough `dogmove.c:dog_goal()` traceability into a reusable diagnostic so future loops can print scanned `fobj`/`gi.invent` entries without editing production code.
  2. For `seed0116`, identify the three missing object entries by comparing retained shop/floor generation near the pet after `T`.
  3. For `seed0383`, classify whether the extra `obj_resists()` run is caused by pet-arrival position drift, special `des.object()` placement, kelp/mineralize state, or object-class filtering.
  4. Once localized, implement the general subsystem owner: shop stocking/floor object retention, special-level object placement, or pet-arrival placement predicates.
  5. Keep startup override replay debt visible but secondary unless pet/object work blocks locally.
- Verification cadence: target triage after each production edit, sentinel after each meaningful edit, full suite after 3-5 meaningful implementation iterations or broad shared changes.

### Iteration 1 - Pet `dogfood()` Rock-Class Predicate

- Change: `js/dog.js:dogfood()` now returns `UNDEF` for rock-class objects after the upstream `obj_resists(obj,0,95)` front door. This removes a general pet-goal predicate mismatch where rocks could become apport goals in JS.
- Evidence: `seed0383` and `seed0116` target triage remained at the same first mismatch (`seed0383` FR 9716, `seed0116` FR 5532), classifying this as predicate-debt cleanup rather than the active blocker.
- Regression stability: sentinel suite stayed at 50/1063 screens and RNG 20420/64569.
- Current queue: build a reusable dog-goal scan diagnostic; then localize the three missing `seed0116` object scans and the longer `seed0383` special-level object scan.

### Iteration 2 - Reusable Dog-Goal Scan Diagnostic

- Change: added `scripts/trace-dog-goal.mjs`, a browser-production-safe Node diagnostic that runs a session prefix and prints the tame pet, hero, dog-goal search rectangle, retained floor objects, hero inventory, and optional RNG window.
- Evidence: `node scripts/trace-dog-goal.mjs seed0116 --moves 16 --rng 5510:5545` shows the kitten at `(9,13)`, hero at `(11,14)`, search rectangle `x=4..14,y=8..18`, zero retained floor objects, and 14 Wizard inventory objects. C consumes 17 `obj_resists()` calls before movement, so the active gap is three missing floor/shop/inventory object entries.
- Evidence: `node scripts/trace-dog-goal.mjs seed0383 --moves 140 --rng 9700:9725` shows the kitten at `(27,4)`, hero at `(27,5)`, six retained floor objects in the initial search rectangle, and 17 inventory objects including wishes. This gives future loops a stable state dump for the longer FR 9716 `obj_resists()` gap.
- Regression stability: sentinel suite stayed at 50/1063 screens and RNG 20420/64569.
- Current queue: inspect shop and floor-object generation for `seed0116` level 2 near the pet; then compare special-level object placement/pet-arrival rectangle drift for `seed0383`.

### Iteration 3 - Dog Movement `chcnt` Reset

- Change: `js/dog.js:dog_move()` now resets the equal-candidate reservoir counter when a strictly closer square is selected, matching `dogmove.c`'s `if (j < 0) chcnt = 0` rule.
- Evidence: `seed0116` and `seed0383` target triage stayed unchanged, so this selector fix is not the current first blocker.
- Regression stability: sentinel suite stayed at 50/1063 screens and RNG 20420/64569.
- Full-suite checkpoint: screens stayed 50/11406, 0/44 passing. Non-sentinel RNG prefixes shifted in pet/movement-sensitive sessions as expected from the general selector fix (`seed0014`, `seed0360`, `seed0361`, `seed2200`, `seed5006`), with no screen-count regressions.
- Current queue: keep the immediate focus on missing object-state scans, not candidate-selection order.

### Iteration 4 - Expected/Actual Dog-Goal RNG Trace

- Change: enhanced `scripts/trace-dog-goal.mjs` so an `--rng start:end` window prints expected C calls beside actual JS calls and marks the first mismatches.
- Evidence: `seed0116 --moves 16 --rng 5510:5540` now proves exact prefix parity through 14 `obj_resists()` calls, then C expects three more `obj_resists()` calls at 5532-5534 before dog movement candidate RNG starts.
- Evidence: `seed0383 --moves 163 --rng 9706:9724` proves exact prefix parity through the kitten wanderer gate, five floor-object resistance rolls, first apport roll, one more resistance roll, and second apport roll; JS then emits the follow-player `rn2(4)` where C has one more `obj_resists()` call.
- Regression stability: sentinel suite stayed at 50/1063 screens and RNG 20420/64569.
- Current queue: classify the missing `seed0116` three-object source first because it has exact prefix parity and a smaller object-count gap; then use the same trace on `seed0383` after any object-state or pet-position fix.

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

### Iteration 8 - Fog Effect Phase And Pet Visibility Gates

- Change: moved fog-cloud vapor from `mcalcmove()` into the `movemon_singlemon()`-shaped movement phase before the movement-budget check; added the C lighting/visibility front door to the pet apport branch; retained `mkcorpstat()` corpse/statue objects on the level instead of dropping the created object state.
- Evidence: `seed0383` moved from FR 9666 to FR 9713. JS now matches the fog-cloud `create_gas_cloud()` TTL, every subsequent `mcalcmove()` rounding roll through FR 9702, `maybe_generate_rnd_mon()`, `gethungry()`, the slippery-finger gate, and five `dog_goal()` object-resistance calls. The next mismatch is C rolling `rn2(8)` for apport while JS scans one additional object, so the active blocker is `dog_goal()` visibility/object ordering rather than fog or special-level monster order.
- Regression stability: sentinel screens stayed 50/1063; sentinel RNG is 20407/64569. Full suite screens stayed 50/11406, 0/44 passing.
- Current queue: refine `dog_goal()` object visibility/apport ordering using `seed0383` and the persistent `seed0116` missing-object evidence; then recheck special-level monster/list effects if dog movement advances.

### Iteration 9 - C-Like Floor Object Chain Order

- Change: `place_object()` and new gold piles now insert at the head of `level.objects`, matching C `fobj` head insertion instead of appending in creation order.
- Evidence: `seed0383` still blocks at FR 9713, but live inspection now shows dog floor-object scans in newest-first order. The unchanged first mismatch indicates the remaining problem is not JS list direction; likely candidates are extra/missing special-level floor objects near the pet or incomplete `dogfood()` classification for those objects.
- Regression stability: sentinel screens stayed 50/1063. Full suite screens stayed 50/11406, 0/44 passing; RNG totals shifted in object-order-sensitive sessions as expected from replacing reversed floor-list order.
- Current queue: compare `seed0383` nearby floor objects against C expectations through object type/classification; continue `seed0116` missing-object evidence in parallel as the same dog/floor-object subsystem.

### Iteration 10 - Pet Food And Terrain Reachability Gates

- Change: `dogfood()` now applies a partial C diet split for carnivorous cats/dogs and herbivorous ponies instead of treating all food as `DOGFOOD`; `could_reach_item()` now rejects pools and lava for pets that cannot enter them before allowing object goals.
- Evidence: `seed0383` moved from FR 9713 to FR 9715. The temporary early apport regression on nearby kelp classified the missing piece: non-swimming kittens should skip pool-square food instead of turning it into a reachable apport candidate. JS now reaches C's `rn2(8)` apport roll and diverges at the following movement/allocation call.
- Regression stability: sentinel screens stayed 50/1063; sentinel RNG is 20430/64569. `seed0116` remained stable at 16/127 and FR 5532.
- Current queue: inspect `seed0383` FR 9715 to determine whether the next call belongs to dog movement candidate selection or another monster movement allocation; keep `seed0116` missing floor/shop object evidence as the parallel pet/object target.

### Iteration 11 - Pet Apport Startup And Clear-Path Visibility

- Change: non-replay startup now zeros `u.acurr` before `makedog()`, matching C's `newgame()` order where the starting pet's `edog->apport` sees pre-inventory `ACURR(A_CHA)` and clamps to 3. The pet apport visibility check now uses exported `vision.clear_path()` for `m_cansee()` instead of a lit-or-adjacent approximation.
- Evidence: `seed0383` now matches the first failed apport roll and the second apport visibility roll, moving the first mismatch to FR 9716. The lower lagging RNG total is classified as structural: JS accepts the second floor-object goal and begins movement because it has no more nearby retained `fobj` entries, while C continues scanning additional floor objects before movement.
- Regression stability: sentinel screens stayed 50/1063; sentinel RNG is 20403/64569. `seed0116` remained stable at 16/127 and FR 5532.
- Current queue: classify missing/position-drifted floor objects near the `seed0383` pet after the second apport check; likely candidates are special-level terrain/floor-location fidelity and remaining object placement state, not dog movement allocation.

### Iteration 12 - Special-Level Wallify Map Pass

- Change: added the `des.wallify()`/`wallify_map()` pass used by `bigrm-12` before stair/object/trap/monster placement. This converts adjacent STONE cells around room/crosswall terrain into preliminary wall terrain without consuming RNG.
- Evidence: sentinel stayed stable and `seed0383` remained at FR 9716, so this was a geometry-fidelity cleanup rather than the active floor-object fix. The unchanged blocker keeps the queue focused on floor object population/position drift after the second apport check.
- Regression stability: sentinel screens stayed 50/1063; sentinel RNG is 20403/64569.
- Full-suite checkpoint: corpus screens remain 50/11406, 0/44 passing. Full-suite RNG prefixes are stable with the sentinel classification; `seed0383` is 9889/16915 and `seed0116` is 5650/12562.
- Current queue: continue classifying missing `fobj` entries around the `seed0383` pet; recheck display wall glyphs separately because this wallify pass alone did not change the first-screen mismatch.

### Iteration 13 - Retained Wizard Wish Inventory

- Change: wizard wish creation now keeps the wished `mksobj()` result in hero inventory after the wish timeout roll, matching `makewish()` handing the object to `hold_another_object()` instead of discarding it after RNG shape.
- Evidence: `seed0383` improved from 9889/16915 to 9906/16915. The first mismatch remains FR 9716, but raw comparison and a temporary in-memory trace reclassified it: JS matches the kitten wanderer gate, six nearby floor-object resistance checks, and two failed apport rolls; it then reaches the follow-player `rn2(4)` gate while C still has another `obj_resists()` from the `fobj` scan. `seed0116` remains at 16/127 screens and shifts to FR 5532 with retained wish inventory not on that path.
- Discarded direction: removing the kitten `is_wanderer()` gate before `dog_move()` was tested and reverted. C does consume that `rn2(4)` in `dochug()` before reaching `m_move()`/`dog_move()` because the ordinary movement-opportunity predicate is evaluated before the tame special case.
- Regression stability: sentinel screens stayed 50/1063; sentinel RNG is 20420/64569.
- Current queue: fix or classify the missing/position-drifted special-level floor object near the `seed0383` pet; then continue `seed0116` shop/floor object state and broader object placement fidelity.

### Iteration 14 - Trap-Victim Possession Retention

- Change: `mktrap_victim()` now places the trap-generated item, each cursed random possession, and optional gnome candle on the trap square instead of only consuming their RNG and retaining the final corpse. The remaining simplification is PIT/landmine `breaktest()` destruction for fragile possessions.
- Evidence: target and sentinel lagging counts were unchanged (`seed0383` 9906/16915 at FR 9716; `seed0116` 5650/12562 at FR 5532; sentinel 50/1063 screens and 20420/64569 RNG), so the active `seed0383` missing `fobj` is not this trap-victim pile. The patch still removes hidden floor-object debt for later pet, pickup, and display behavior.
- Current queue: classify whether the FR 9716 missing `fobj` comes from pet-arrival position drift, special-level terrain/kelp placement drift, or another retained object source; keep `seed0116` shop/floor object state as the secondary pet-object target.

### Iteration 15 - Retained Special Trap State

- Change: `bigrm-12` `des.trap()` now calls the trap-retention path after choosing each trap type, so the six special traps exist in `level.traps` before optional trap-victim decoration.
- Evidence: `seed0383` and the sentinel suite stayed unchanged (`seed0383` FR 9716, sentinel 50/1063 and 20420/64569). Live state now shows six retained `bigrm-12` traps. This removes special-level state debt but does not explain the current `dog_goal()` floor-object rectangle.
- Current classification: reconstructing the floor-object sequence shows C likely has the pet one square east of JS at the first live turn. From `(28,4)`, C's search rectangle would scan kelp at `(33,9)`, then the same nearby kelp objects, then the special object at `(33,6)`, matching the extra `obj_resists()` before movement. The next target is monster occupancy or placement drift that makes C reject earlier pet-arrival candidates.

### Iteration 16 - Monster Occupancy Placement Predicate

- Change: `enexto_core()`/`goodpos()` now rejects occupied monster squares regardless of `GP_AVOID_MONPOS`, matching C's normal placement check. `GP_AVOID_MONPOS` is stricter than ordinary placement, not the only monster-occupancy guard.
- Evidence: sentinel and target counts were unchanged (`seed0383` 9906/16915, `seed0116` 5650/12562, sentinel 50/1063 and 20420/64569), so JS was not losing the current pet-arrival square through group stacking in this evidence path. The predicate is still more faithful for future group and arrival placement.
- Current queue: the `seed0383` pet one-cell drift likely needs deeper special-level monster placement/selection comparison, or a C-side trace of monsters occupying the first ring around `(27,5)`. Move to another pet/object target if this local path stalls.

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

## Iteration 21 - Fog Cloud Region Maintenance

- Change: `age_gas_clouds()` now applies the `inside_gas_cloud()` maintenance rule for retained fog vapor regions: after positive TTL decrement, a fog cloud inside a region with TTL below 20 extends it by 5. This keeps retained gas regions alive across later monster phases instead of reopening false vapor creation RNG.
- Evidence: `seed0383-wizard-hallucinate` moved from FR 10646 / `R 10903/16915` to FR 10843 / `R 10970/16915`. The old extra `rn2(3)` was traced to fog-cloud vapor recreation; after this fix the first mismatch is the next turn-tail `exercise()` cadence gap.
- Score delta: public screens remain `143/11406`; focused evidence session screens remain `0/219`, but the first RNG mismatch moved later by 197 calls.
- Regression stability: target triage after the edit reports `seed0383` `S 0/219 R 10970/16915 FR 10843`; `seed0116` remains exact on RNG at `S 109/127 R 12562/12562`; sentinel suite is stable at total `S 143/1063 R 28406/64569`.
- Implementation delta: monster/region movement is closer to `region.c:run_regions()` plus `inside_gas_cloud()` behavior. No seed-specific branches, replay tables, or screen overrides were added.
- Discarded direction: temporary RNG stack tracing in `js/rng.js` identified the vapor gate and was removed; no trace/debug I/O remains in production paths.
- Current queue: classify `seed0383` FR 10843 by comparing C `attrib.c:exerchk()` / `exercise()` turn-tail calls with JS `allmain_turns.js`; then continue `seed0116` screen 109 object identity/color drift; keep `seed0383` dog-goal floor-object/state parity in view after the exercise cadence blocker.

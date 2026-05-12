# Feature Map — NetHack JS Port

Cross-reference of every major subsystem between the C reference and the JS port.
Use this to choose your next implementation target. Update the **Status** and **Notes** columns after each session.

**Status legend:**
- 🔴 Not started / fully stubbed
- 🟡 Partially implemented / hardcoded for specific seeds
- 🟢 Correct for all tested seeds
- ✅ Verified passing (screen-level parity confirmed)

**Metric column:** "gates Y screens" means getting this right is expected to unlock Y screens across the public corpus.
Treat screen totals as lagging evidence of subsystem progress, not as the optimization target.

---

## 🏗️ Harness & Infrastructure

| Feature | C Reference | JS Implementation | Status | Notes |
|---|---|---|---|---|
| `runSegment()` API contract | `nethack-c/upstream/unixmain.c` | `js/jsmain.js` `runSegment()` | ✅ | Entry point, contract correct. Segment `datetime` now reaches game state. Do not break. |
| Screen capture hook (pre-nhgetch) | `sys/tty/tty_getch()` | `js/jsmain.js` `_installCaptureHook()` | ✅ | Fires before every `nhgetch()` call. Captures exactly one screen and one cursor per input boundary via `terminal.serialize()`. Do not push raw override strings or import scorer-side screen decoders from production `js/`. |
| PRNG log accumulation | `rng.c` | `js/rng.js` + `frozen/isaac64.js` | ✅ | Frozen ISAAC64 engine. Log format must be `rn2(N)=M` etc. |
| Screen comparison / canonicalization | `frozen/ps_test_runner.mjs` | (frozen — do not modify) | ✅ | DEC→Unicode, SGR normalise, version banner sentinel. |
| Per-session regression runner | `frozen/ps_test_runner.mjs` | (frozen) | ✅ | `node frozen/ps_test_runner.mjs [session...]` |
| Full regression suite | `frozen/score.sh` | (frozen) | ✅ | Run before committing broad changes and before handoff. Regressions must be classified; accidental regressions should be fixed, while expected regressions from hack removal or upstream-shaped refactors should be documented. |
| Live public regression suite | hosted `/sessions/` | `scripts/fetch-live-public-sessions.mjs` | ✅ | `npm run score:live-public` fetches the current public session files into `.cache/live-sessions` before running the frozen scorer. Use this when comparing against leaderboard public totals. |
| Debug tooling convention | — | Reusable diagnostics in `scripts/`; generated/checkpoint notes in `scratch/` | 🟡 | Temp debug scripts MUST be deleted after use. Removed stale tracked one-off probes `scratch/check_features.mjs`, `scratch/check_mklev.mjs`, and `scratch/inspect_screens.mjs`; remaining tracked scratch files are checkpoint/generated triage outputs. `scripts/triage-corpus.mjs` regenerates `scratch/divergence-inventory.md` from compact triage data for subsystem-level planning. `scripts/trace-dog-goal.mjs` runs a session prefix and prints the tame pet, C-shaped dog-goal search rectangle, floor objects, inventory, and expected-vs-actual RNG window for pet/object parity work. Never leave `console.log` or `import('fs').writeFileSync` in production paths (jsmain.js, allmain.js). |

---

## 🎲 PRNG / RNG

| Feature | C Reference | JS Implementation | Status | Notes |
|---|---|---|---|---|
| Core PRNG engine (ISAAC64) | `rng.c` / `frozen/isaac64.js` | `frozen/isaac64.js` | ✅ | Frozen. Bit-exact with C. |
| `rn2(N)` | `rng.c:rn2()` | `js/rng.js:rn2()` | ✅ | |
| `rnd(N)` | `rng.c:rnd()` | `js/rng.js:rnd()` | ✅ | |
| `rn1(N,B)` | `rng.c:rn1()` | `js/rng.js:rn1()` | ✅ | |
| `rnl`, `rne`, `rnz`, `d` | `rng.c` | `js/rng.js` | 🟡 | Stubs or partial — verify log format matches C exactly |
| Three PRNG contexts (core / Lua / display) | `rng.c` context switching | `js/rng.js` | 🔴 | Hallucination/display context not implemented. Blocks `seed0383-wizard-hallucinate`. |

---

## 🗺️ Level Generation (mklev)

| Feature | C Reference | JS Implementation | Status | Notes |
|---|---|---|---|---|
| Room generation (random room count/size/pos) | `mkmaze.c`, `mkroom.c` | `js/mklev.js` | 🟡 | Produces correct room count for seed8000/seed0002. Verify other seeds. |
| Corridor generation | `mkmaze.c:makecorridors()` | `js/mklev.js` | 🟡 | Connected but exact corridor paths may differ from C for non-tested seeds. |
| Door placement | `mkmaze.c:makedoor()` | `js/mklev.js` | 🟡 | `dosdoor()` now keeps JS `flags` and `doormask` synchronized to mirror C's alias, fixing closed-door rendering/movement state exposed by `seed0116`. |
| Stair generation (down stairs) | `mklev.c:generate_stairs()` | `js/mklev.js:generate_stairs()` | 🟡 | Down stairs generated. |
| Stair generation (up stairs, dlvl≥2) | `mklev.c:generate_stairs()` | `js/mklev.js:generate_stairs()` | 🟡 | Correctly skipped on dlvl 1. |
| Branch entrance placement (Mines etc.) | `mklev.c:place_lregion()` | `js/mklev.js:place_lregion()` | 🟡 | `end1_up: true` hardcoded for seed8000. Verify with other seeds. |
| Wallification (corner/t-junction glyphs) | `mklev.c:wallification()` | `js/mklev.js` | 🟡 | Present but may have edge cases. |
| Monster/object fill (mkfill, mineralize) | `mklev.c`, `mkobj.c`, `makemon.c`, `engrave.c`, `rumors.c` | `js/mklev.js` + `js/random_text.js` + `js/monster_data.js` + startup fast-forward scaffolds | 🟡 | `mkobj()` consumes upstream-derived class/object probability and material metadata. `rndmonst_adj()` now walks a generated `include/monsters.h` table with C's weighted reservoir RNG shape and numeric dungeon/special alignment (`A_NONE` for unaligned special levels); trap constants match `trap.h`; `occupied()` rejects trap squares; `CORPSE`/`STATUE`, trap-victim role corpse range, no-corpse retry, egg init, grid bug gender, multigen projectile quantity, tin spinach/random-meat ordering, spider/snake hide-under `mkobj_at()`, kobold/giant/elven/centaur/troll/gnome/ogre/default `m_initweap()` slices, mummy inventory, `S_QUANTMECH` inventory, leprechaun gold/minvent state, `M2_GREEDY` money gates with minvent-shaped dice, adjusted-`m_lev` inventory gates, `mflags1` defensive-item predicates, golem fixed HP, shared offensive-item gate, `rnd_misc_item()` slices, amulet cursed-gate init, and `peace_minded()` predicates now consume closer C RNG. Random graffiti uses NetHack-style padded data-file selection and `wipeout_text()`. `level_finalize_topology()` calls real `mineralize()`, retains unburied mineralized gold/gems on `level.objects`, and skips buried gold/gems after kelp on most special levels. Evidence: `seed0116` now carries Soko zoo monsters/gold/objects into complete RNG parity; `seed0383` has moved beyond the earlier pet object scan and `mfndpos()` terrain denominator blocker and now blocks at FR 9933 where the second pet movement pass lacks C's adjacent melee target. `seed8000` screen parity remains `23/23`. |
| Shop generation | `mkroom.c:mkshop()` | `js/mklev.js:do_mkroom()` / `mkshop()` partial | 🟡 | The ordinary-level special-room decision now runs before fill. `mkshop()` can scan for an eligible one-door ordinary room and mark a shop type, but stocking, shopkeeper setup, `SHOPTYPE`, and full special-room fill remain incomplete. Evidence: `seed0116` moved past the level-2 shop chance gate to FR 4592. |
| Special level loading (Lua specials) | `sp_lev.c` | `js/mklev.js` static themed-map/bigroom/Soko slices | 🔴 | Full special level support is still absent. Static themed `des.map()` fragments now use exact upstream map literals for implemented shapes, enable `in_mk_themerooms` failure semantics, create irregular `filler_region()` rooms from flood-filled floor bounds, and use C-like irregular door search. `bigrm-12` now dispatches before ordinary level generation, consumes the random variant, Lua shuffle/init, applies the C-centered map offset (`x=3,y=1` for the 75x19 slice), runs scripted percent gates, applies `des.wallify()`'s preliminary `wallify_map()` pass, performs stair/object/trap/monster placement with retained `des.trap()` state, consumes the post-load `flip_level_rnd()` horizontal gate for `noflipy`, and skips special-level buried minerals after kelp. Soko1 slices now create filled irregular zoo room metadata, attach doors in x-major order, flip room/door metadata with the map, and run `fill_special_room()` after flip/fixup so zoo monsters, gold, and asleep state exist in the live level. Debug level teleport uses `place_lregion()` with monster-occupied teleport candidate rejection. Current `seed0116` blocker is screen 109 attr-only map/object color drift after Soko setup with full RNG parity. Current `seed0383` blocker is live movement/combat state at FR 9933 after bigroom setup, not special-level command or dog-goal floor-object state. |

---

## 🧑 Player Initialization (newgame / chargen)

| Feature | C Reference | JS Implementation | Status | Notes |
|---|---|---|---|---|
| Name prompt / character selection UI | `pline.c`, `sounds.c` | `js/allmain.js:player_selection()` | 🟡 | **Hardcoded `_override_screen` for seed0002 only.** Must be generalized. |
| Role/race/gender/align selection from nethackrc | `role.c:plnamesiz()` etc. | `js/options.js` + `js/allmain.js` + `js/roles.js` (partial) | 🟡 | Parsed role/race/gender/align now drive startup identity, level-1 rank, alignment record, welcome text, and status title where config supplies them. This still does not implement chargen RNG, stats, or inventory. |
| Random chargen (pick_role etc.) | `role.c:pick4u()` | `js/allmain.js` (hardcoded `rn2()` calls) | 🔴 | Hard-coded for seed0002. Not a real implementation. |
| Hero placement (`u_on_upstairs`) | `stairs.c:u_on_upstairs()` | `js/mklev.js:u_on_upstairs()` | 🟡 | Works for seed8000/seed0002. **seed0002 step 12 has 1-cell offset bug.** |
| Player stats (HP, Pw, AC, attributes) | `attrib.c`, `role.c` | `js/u_init.js` + `js/allmain.js` (partial) | 🟡 | Configured non-replay Wizard/Rogue/Healer/Tourist now use partial role-driven HP/Pw/AC/gold and `init_attr()`/`vary_init_attr()` RNG shape. Attribute storage follows C order (`Str, Int, Wis, Dex, Con, Cha`) and human race maxes are used during redist. `seed0116` first screen now matches; next visible mismatch is deferred armor AC/map state after welcome. Seed replay paths remain scoped. |
| Starting inventory (`ini_inv`) | `invent.c:ini_inv()` | `js/u_init.js` + `js/mklev.js` object creation (partial) | 🟡 | Wizard `ini_inv(Wizard)` now consumes the general `trobj` path for fixed/random wands, rings, potions, scrolls, spellbooks, and magic marker charges, using `mkobj()`/`mksobj()` rather than replay. The optional Wizard blindfold branch is retained behind its `!rn2(5)` gate. Initial-inventory erosion is suppressed via the upstream `moves <= 1 && !in_mklev` rule, and deferred startup wear now marks the Wizard cloak object worn after the first status render. Other roles and full inventory use/wear/discovery side effects remain incomplete. |
| `o_init` (object type shuffle) | `o_init.c` | `js/o_init.js` | 🟡 | General RNG shape for gem colors, description shuffle ranges, and `WAN_NOTHING` direction is implemented for non-replay sessions. Actual shuffled description/material state is not wired into object identity yet. |
| Welcome / lore screens | `sounds.c`, `pline.c`, `role.c:Hello()` | `js/allmain.js:newgame()` + `js/roles.js:roleGreeting()` | 🟡 | Welcome greeting is role-driven rather than seed-driven. Configured role/align splash text now uses role god/rank data for the generic quest intro overlay, but full chargen/menu flow and exact windowing remain incomplete. |
| Tutorial prompt | `pline.c`, `options.c:ask_do_tutorial()` | `js/cmd.js` prompt overlay + seed0002 override | 🟡 | General post-welcome tutorial prompt now appears when `tutorial` was not set in config, including Space/Enter invalid-choice redraw. Seed0002 still uses older startup override screens. |

---

## 👁️ Vision & Display

| Feature | C Reference | JS Implementation | Status | Notes |
|---|---|---|---|---|
| Shadow-casting vision (`vision_recalc`) | `vision.c` | `js/vision.js` | 🟡 | Implemented. Spot-checked for seed8000/seed0002. |
| Terrain glyph rendering | `display.c:newsym()` | `js/display.js:newsym()` + `terrain_glyph()` | 🟡 | Mostly correct. DEC line-drawing output works. TTY `CLR_GRAY` now normalizes to `NO_COLOR`, and ordinary stairs render in default color while branch stairs remain yellow. |
| Object rendering on map | `display.c:newsym()` | `js/display.js:newsym()` | 🟡 | Renders live objects from `game.level.objects[]` with upstream `objects[otyp].oc_color`. Remaining visible color mismatches with exact RNG should be treated as object identity/state drift, not class-default renderer drift. |
| Monster rendering on map | `display.c:newsym()` | `js/display.js:newsym()` | 🟡 | Renders from `game.level.monsters[]` — currently hardcoded per-seed. |
| Remembered glyph (out-of-sight) | `display.c` | `js/display.js` | 🟡 | Implemented via `remembered_glyph`. |
| Status line (bot) | `status.c` | `js/display.js:bot()` | ✅ | Verified passing for seed8000 (23/23). |
| Message line (pline) | `pline.c` | `js/display.js:pline()` + `js/cmd.js:rhack()` | 🟡 | Message lifetime now matches prompt-time capture better: persist through `nhgetch`, clear on next real command start, and preserve queued messages behind override `--More--` screens. More prompts are rendered into the terminal grid with row-0 cursor placement. Broader message production is still partial. |
| Sounds system | `sounds.c` | `js/sounds.js` | 🟡 | Basic `dosounds` with "slow drip" and the zoo room `rn2(200)` gate implemented. Broader room/noise messages are still partial. |
| Full-screen menus (inventory, attributes) | `pline.c`, `invent.c` | `_override_screen` injection | 🟡 | Multi-page menus fixed (ATTR1→ATTR2 via `_override_prev`). Still hardcoded strings for seed8000. |
| DEC line-drawing output | `curses.c` | `js/display.js` | ✅ | Outputs Unicode directly; runner translates DEC→Unicode for comparison. |
| `cls()` / `docrt()` | `display.c` | `js/display.js` | 🟡 | Functional. |
| Hallucination display context | `display.c` | — | 🔴 | Not implemented. Blocks `seed0383`, `seed0399`. |

---

## 🕹️ Command Dispatch (moveloop)

| Feature | C Reference | JS Implementation | Status | Notes |
|---|---|---|---|---|
| Main game loop (`moveloop_core`) | `allmain.c:moveloop_core()` | `js/allmain.js:moveloop_core()` | 🟡 | Basic loop. Fast-forward stubs for per-step RNG. |
| Command dispatch (`rhack`) | `cmd.c:rhack()` | `js/cmd.js:rhack()` | 🟡 | Move commands, uppercase vi run commands, rest/wait (`.`), search (`s`), empty-square pickup messaging, `#pay` no-shopkeeper message, basic drop, put-on/wear prompts for rings, amulets, and delayed armor evidence, zap-wand prompt/direction flow, wizard wishes for current object evidence including explicit BUC/enchantment state, zero-time `#wizintrinsic` hallucination prompt state, debug `^V` numeric/menu level teleport, and `#levelchange` prompt/level-gain RNG are present. Run commands and delayed armor occupations now consume repeated movement/turn loops before the next input boundary and apply deferred armor AC for the final occupation turn, but stop/turn/lookaround rules and message-interrupted occupations remain approximate. Most commands remain unimplemented. |
| Cardinal movement (`domove`) | `do.c:domove()` | `js/cmd.js:domove()` | 🟡 | Basic movement plus an occupied-monster front door: movement into a monster square now consumes a turn and leaves the hero in place instead of overlapping the monster. Full `uhitm()` hit/damage/passive effects, traps, and item pickup remain incomplete. |
| Zero-turn commands (inventory, ESC, etc.) | `cmd.c` | `js/cmd.js` | 🟡 | `g.context.move=0` on zero-turn commands confirmed in lessons. |
| Per-step monster movement / regen RNG | `monmove.c`, `regen.c`, `were.c` | `js/monmove.js` + partial turn consumers | 🟡 | Per-step replay is no longer called from `moveloop_core()`, and the dead `fastforward_step()` exports have been removed from the seed replay modules. `makemon()` now preserves C `fmon` head-insertion order, `movemon()` snapshots the pass like `iter_mons_safe()`, `mcalcmove()` handles slow/fast speed states, `mcalcdistress()` owns the human-form werecreature `were_change()` denominator gate before movement allocation, damaged-hero `regen_hp()` owns the post-generation `rn2(100)` turn-tail roll, fog clouds retain vapor regions and age them once per turn, uppercase run commands reuse the normal turn advancement loop, sleeping/frozen monsters and object/furniture-appearing hiders spend movement without entering `distfleeck()`, and ordinary non-pet monsters now take a minimal `dochug()`/`m_move()` path with post-`m_move()` `distfleeck()`, swallowed-bystander `MMOVE_MOVED`, `set_apparxy()`-style hero targeting, peaceful/light approach gates, `mtrack` backtracking rolls, partial `mfndpos()` terrain eligibility for flying/swimming/pool/lava squares, and a constrained post-move `mattacku()` front door for physical and current engulf evidence. Movement AI remains skeletal, but `seed0116` now has full RNG parity (`12562/12562`) and only a display attr mismatch remains. `seed8000` remains complete on screens, and `seed0383` now blocks at FR 10374 where C repeats the ice-vortex engulf sequence while JS reaches an intervening gnome `distfleeck()`, pointing at prior ordinary-monster movement state rather than engulf RNG. |
| Turn counter | `allmain.c` | `js/allmain.js` | ✅ | `g.moves++` conditional on `g.context.move`. |
| Game over (`gameover`) | `end.c` | `js/cmd.js` (stub) | 🔴 | Not implemented. Loop never terminates normally. |

---

## 🎒 Items & Objects

| Feature | C Reference | JS Implementation | Status | Notes |
|---|---|---|---|---|
| Object type table / `o_init` shuffle | `objects.c`, `o_init.c` | `js/object_data.js` + `js/o_init.js` | 🟡 | Static upstream object class/probability/charge/direction/material/color metadata is available for `mkobj` selection, erosion eligibility, and map display. `init_objects()` now consumes the general C description-shuffle RNG shape for non-replay sessions, reducing seed-specific startup replay reliance. Runtime object-description/material swaps, artifact selection/origin tracking, and item identity parity are still missing; current wished-object evidence carries explicit appearance names for the shuffled teleport-control ring and digging wand until the real description table is wired. |
| Random text data files | `rumors.c`, `engrave.c`, `makedefs.c`, `dat/rumors.*`, `dat/engrave.txt` | `js/random_text.js` + `js/random_text_data.js` | 🟡 | Random engraving/rumor selection builds padded/xcrypted virtual chunks from checked-in generated JS data and applies C-like `get_rnd_line()` and `wipeout_text()` RNG. Production JS is browser-safe and does not read upstream data files with `fs` at runtime. It currently serves graffiti generation; broader data-file consumers (epitaphs, bogus monsters, oracle text) still need integration. |
| Object placement on map | `mkobj.c:mksobj()` | `js/mklev.js:mksobj_at()` / `mkobj_at()` + legacy hardcoded arrays in `allmain.js` | 🟡 | Generated `_at` object creation now retains non-gold objects on `level.objects` with class glyph and upstream display-color state, uses C's newest-first `fobj` order, and `mkcorpstat()` now places created corpses/statues at the supplied coordinates instead of only consuming their init RNG. `mktrap_victim()` now retains the trap item, cursed random possessions, optional candle, and corpse at the trap square; unburied `mineralize()` gold/gems are retained, while buried object chains and PIT/landmine `breaktest()` destruction remain pending. Seed0002 still has legacy hardcoded startup objects, and object stacking/descriptions/material swaps/container contents remain incomplete. Evidence: `seed0116` dog blocker moved through the first run-turn mineral object scan; retained corpse/statue/trap-victim/mineral state and C-like floor-list order reduce hidden object-state debt for later dog/display/pickup work. |
| Gold | `mkobj.c` | hardcoded `g._goldCount` | 🔴 | Per-seed hardcoded. |
| Autopickup | `pickup.c` | — | 🔴 | |
| Inventory management | `invent.c` | `js/cmd.js` + `js/u_init.js` partial | 🟡 | Inventory is still not a full `invent.c` port, but carried objects now receive persistent `invlet` letters lazily, startup/wished stackable objects use conservative `addinv()`-style merge semantics, wizard wishes preserve explicit blessed/cursed/uncursed and enchantment text for current object evidence, startup inventory clears cursed state before role adjustments, basic drop places the object on `fobj`, `P`/`W`/`z` prompt filters use object class and worn state rather than current array position, and worn startup cloak/delayed armor state feeds later `W`/`T`/combat behavior. Evidence: `seed0116` now carries the wished teleport-control ring as `o` and the wished digging wand as `p`; `seed0383` Wizard duplicate scrolls now scan as one carried stack in `dog_goal()`, and delayed +3 gray dragon scale mail state advances the live movement/combat evidence. |

---

## 👾 Monsters

| Feature | C Reference | JS Implementation | Status | Notes |
|---|---|---|---|---|
| Monster placement (mklev fill) | `makemon.c`, `include/monsters.h`, `include/monflag.h` | `js/mklev.js:makemon()` + `js/monster_data.js` + hardcoded arrays in `allmain.js` | 🟡 | Random monster selection follows `rndmonst_adj()` reservoir sampling over generated `monsters.h` data and consumes `next_ident`, adjusted instance level/HP including golem fixed-HP no-RNG cases, generated `mattk[]` attack metadata, `peace_minded()` predicate/call order, broader selected-monster weapon/inventory gates, `mflags1` defensive-item predicates, leprechaun gold/minvent state, greedy gold dice/object creation, `rnd_misc_item()` slices, retained level monster records, `MM_ASLEEP`, Soko mimic boulder appearance state, spider/snake hide-under object creation during mklev, and `goodpos()` occupied-square rejection for placement even without `GP_AVOID_MONPOS`. Exact selected-monster initialization/equipment, some special-level placement/selection details, and real movement AI are still incomplete; current `seed0116` blocker is display attr drift at screen 109, current `seed0383` blocker is post-swallow live monster movement state before a repeated ice-vortex engulf, and current `seed8000` blocker is live monster movement at FR 2985. |
| Monster movement | `monmove.c`, `were.c` | `js/monmove.js` (partial) | 🟡 | Ordinary monsters now have movement budget ownership, a pass snapshot matching `iter_mons_safe()`, post-`m_move()` `distfleeck()` recalc, swallowed-bystander `MMOVE_MOVED`, `set_apparxy()`-style hero targeting, a narrow adjacent-candidate `m_move()` skeleton, retained `mtrack` backtracking rolls, the pre-allocation `mcalcdistress()`/human-were `were_change()` gate, retained fog gas regions aged once per turn for `m_everyturn_effect()`, C-shaped front doors for frozen/sleeping monsters, hidden mimics, peaceful neutral movement, stalker/bat/light approach, partial `mfndpos()` terrain eligibility for flying/swimming/pool/lava squares, and a constrained post-move `mattacku()` call for supported physical and engulf evidence. Doors, item pickup/search, tunneling, special movement, traps, transformations, and full `mfndpos()` flags remain incomplete. Current seed0116 evidence now has complete RNG parity; current seed0383 evidence has moved past the false tiger `mtrack` backtracking owner and now points at an intervening gnome movement-state/list-state drift before the repeated ice-vortex `gulpmu()` call at FR 10374. |
| Combat | `fight.c`, `uhitm.c`, `mhitm.c` | `js/cmd.js` + `js/dog.js` + `js/monmove.js` narrow front doors | 🔴 | Full hero combat and monster-vs-monster combat remain unimplemented. `domove()` now stops hero movement into occupied monster squares, prints a basic hit message, and consumes a turn without changing hero position; a narrow pet `mattackm()` front door consumes the current physical miss/passive and hit/damage/death/growth RNG shape for `dogmove.c` evidence, including `grow_up()` max-HP/current-HP state after pet kills. A constrained `mattacku()` front door now handles generated multiattack physical melee rows plus current single-attack `AT_ENGL` evidence: `AC_VALUE()`, occupation hit bonus, hit rolls, damage dice, initial swallow placement/timer, already-swallowed repeat damage without a new hit/timer roll, elemental cold/fire/electric gate, initial knockback rolls for physical rows, negative-AC reduction, and hero HP updates. Current seed0383 now blocks on an ordinary-monster ordering/state issue before the repeated ice-vortex `gulpmu()` sequence. These are position/RNG ownership front doors, not a general combat port. |
| Pet behavior | `dog.c`, `dogmove.c` | `js/dog.js` + `js/mklev.js:makemon()` + `js/monmove.js` (partial) | 🟡 | Starting pet creation is partially ported for configured non-replay roles: role/preferred-pet selection, `MM_EDOG|NO_MINVENT`, near-hero `collect_coords()` ring shuffling, pet tame/peaceful setup, pre-inventory `edog->apport` initialization, `edog->whistletime`, and kitten/little-dog/pony metadata. Tame monster turns now enter a partial `dog_move()` path with C-like `M2_WANDER` short-circuit behavior, C-like neighbor scan order, `whappr` suppression of worse-candidate backtracking, `chcnt` reset after strictly better candidates, boulder-occupied square rejection, Sokoban `m_avoid_soko_push_loc()` push-block avoidance, old/new square redraws, candidate-square pet melee after `mfndpos()`-style square reachability, adjusted-level/HP pet attack balking fed by `grow_up()` HP max/current state, and a narrow `pet_ranged_attk()`/`score_targ()` scan that consumes line-target fuzz before final movement. `dog_goal()` now scans retained floor objects and hero inventory stacks with `dogfood()`/`obj_resists()` guards for real numeric `otyp` objects; its apport branch has the C lighting/front-door predicate, `m_cansee()` via `clear_path()`, swallowed-master sight suppression, partial diet-aware food classification, rock-class `UNDEF` handling after the resistance roll, pool/lava/boulder reachability gates, and a conservative carry-capacity front door that rejects heavy tools for small domestic pets. Level-teleport pet arrival now preserves the migrating tame monster's movement/data across `mklev()` instead of recreating a fixed-movement pet. Current `seed0116` has moved beyond the earlier pet and post-dog movement blockers and now has full RNG parity. Current `seed0383` moved beyond the earlier `dog_goal()` inventory/floor-object blocker, the FR 9806 `mfndpos()` terrain denominator, the first pet melee miss, delayed-armor occupation timing, false ape melee, fog-region aging, false iguana melee, and swallowed dog-goal apport gating; it now blocks in ordinary monster movement after the post-swallow pet pass. Hunger, naming, saddles, full object fetching/eating, migration details, and interactions remain incomplete. |

---

## 📅 Time & World State

| Feature | C Reference | JS Implementation | Status | Notes |
|---|---|---|---|---|
| `datetime` parsing / moon phase | `calendar.c` / `hacklib.c:timerep()` | `js/hacklib.js` + `js/jsmain.js` | 🟡 | Segment `datetime` is parsed into C-like `tm_*` fields; `flags.moonphase`, `flags.friday13`, `iflags.at_night`, and `iflags.at_midnight` are initialized. Startup luck/message side effects and save/restore date handling are not wired yet. |

---

## 🔧 Options / Config

| Feature | C Reference | JS Implementation | Status | Notes |
|---|---|---|---|---|
| nethackrc parsing | `options.c` | `js/options.js:parseNethackrc()` | 🟡 | Parses the current OPTIONS= subset and exposes it on game state for startup. Still incomplete versus upstream options.c. |
| `OPTIONS=name:...` → chargen | `options.c` | `js/options.js` + `js/allmain.js` (partial) | 🟡 | Name plus parsed role/race/gender now flow into startup identity when present. Align, random role selection, stats, inventory, and menus remain incomplete. |
| `OPTIONS=!tutorial` | `options.c` | `js/options.js` | 🟡 | Parsed as flag. Not enforced in player_selection. |

---

## 📊 Current Score Summary

*(Update this section after every agent run — it is a lagging indicator of progress, not the definition of progress.)*

| Session | Matched | Total | Last Updated | Notes |
|---|---|---|---|---|
| seed8000-tourist-starter | **23** | 23 | 2026-05-12 | Screen parity preserved. First RNG mismatch remains in live monster movement after generalized ordinary-monster movement work; current lagging RNG is `3060/3130`. |
| seed0002-healer-reflection-drummer | 11 | 595 | 2026-05-12 | First visible screen mismatch unchanged at screen 11. Current lagging RNG evidence is `1274/27158` after generalized movement/object-state fixes. |
| seed0013-friday13-save-then-fullmoon-restore | 0 | 99 | 2026-05-12 | Sentinel evidence remains at `540/4804` RNG. Save/restore and datetime effects remain broad blockers. |
| seed0116-wizard-wear-shop | 109 | 127 | 2026-05-12 | Door-state aliasing, tutorial prompt lifecycle, rest command, debug `^V` prompt/Enter handling, static themed/Soko `des.map()`, irregular region bounds, corridor/vault accounting, random shop decision, level-teleport arrival placement, pet migration, normal Space handling, basic wear/takeoff/pickup/drop prompts, retained mineral objects, Soko zoo room/fill, leprechaun gold/minvent state, `rnd_misc_item()`, spider/snake hide-under objects, Soko mimic appearance state, sleeping/hider movement front doors, pet wanderer short-circuiting, partial `dog_goal()` object/inventory scans, Sokoban boulder avoidance, `whappr`, uppercase `L` run handling, ordinary non-pet `m_move()`/`mtrack` ownership, persistent inventory letters, wished ring/digging-wand retention, `P` ring put-on prompts, `z` wand selection/direction flow, room sound gates, lycanthrope distress, upstream object display colors, and tty gray normalization moved this evidence path to screen 109 with complete RNG parity (`12562/12562`). Current visible mismatch narrowed from 13 attr-only cells to 4 live object color cells: two potions, an arrow stack, and a ring whose glyphs are visible but whose object identities/colors differ from C. |
| seed0383-wizard-hallucinate | 0 | 219 | 2026-05-12 | Current lagging RNG is `10675/16915` with first mismatch FR 10374; `bigrm-12` map alignment, post-load flip, special mineralize skip, default/ogre weapon init, mummy inventory, adjusted-`m_lev` item gates, retained monster `m_lev`/`mhpmax`, generated monster attack metadata, `mflags1` defensive-item front door, greedy gold amount/object creation, golem fixed HP, teleport-region candidate rejection, wizard wish object init/retained wish inventory/explicit BUC+enchantment state, zero-time `#wizintrinsic` hallucination prompt state, Wizard startup/worn-state handling, initial inventory stack merging, `P`/`W` wearable selection timing with delayed armor occupation and final-turn AC state, pet-arrival movement, fog-cloud vapor region retention with turn-based aging, newest-first floor-object order, pre-inventory pet apport, `m_cansee()` clear-path visibility, partial pet food/reachability gates, pet ranged target scoring, ordinary monster movement front doors, flying/swimming `mfndpos()` terrain candidates, pet candidate melee with adjusted-level balking, pet kill `grow_up()` HP state, hero occupied-monster movement front door, first adjacent ape `mattacku()` physical multiattack, ice-vortex `AT_ENGL`/`gulpmu()` swallow RNG, damaged-hero `regen_hp()`, swallowed dog-goal apport suppression, swallowed-bystander movement, `set_apparxy()` targeting, and repeat already-swallowed engulf timing are now modeled. Current blocker is FR 10374: C repeats the ice-vortex `gulpmu()` damage roll while JS first runs a gnome `distfleeck()` call, so the next owner is the gnome's prior movement/list/state before the swallowed monster pass rather than engulf RNG. |
| All other sessions | 0 | 10,343 | 2026-05-12 | Non-replay sessions now run general `init_objects()`, partial `role_init`, data-driven `init_dungeons()`, partial `u_init_misc`, starting pet placement, Wizard `ini_inv`, and broader mklev/monster equipment RNG. Many RNG prefixes improved, but first-screen parity still awaits broader role/race/inventory side effects, shop/special-room handling, save/restore, and hallucination display context. |

**As of 2026-05-12: 143 / 11,406 public screens matched (~1.3%), 0/44 sessions fully passing**

---

## 🎯 Recommended Next Targets (Highest ROI first)

1. **Classify `seed0383` FR 10374 intervening gnome movement-state drift** — `seed0383` now matches the initial ice-vortex `AT_ENGL`/`gulpmu()` sequence, the damaged-hero regeneration roll, swallowed pet `dog_goal()` object resistance scan, candidate selection, pet ranged scoring, swallowed-bystander skips, and repeat-engulf no-hit/no-timer front door. The next mismatch is C repeating `gulpmu()` damage while JS first reaches a gnome `distfleeck()` (`rn2(5)`), so compare that gnome's prior movement budget, sleep/frozen/offmap/death state, and list order before changing `m_move()` selection.
2. **Classify Soko screen 109 remaining object identity/color drift** — seed0116 now has full RNG parity and renderer color defaults are closer to tty/upstream object metadata. The remaining four visible attr cells are live object type/color mismatches for two potions, an arrow stack, and a ring; treat this as object identity/description-state debt rather than terrain/display color.
3. **Broaden sleeping/hider front doors only from C evidence** — sleeping `disturb()` wake-up RNG and full mimic `set_mimic_sym()` are still partial. Port those predicates when a session reaches them instead of adding broad approximate wake-up rolls.
4. **Continue startup HP/Pw and hallucination setup** — `#levelchange` HP/Pw RNG is now modeled, but first-screen display still has map glyph drift and hallucination display context remains absent.

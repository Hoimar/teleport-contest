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
| Screen capture hook (pre-nhgetch) | `sys/tty/tty_getch()` | `js/jsmain.js` `_installCaptureHook()` | ✅ | Fires before every `nhgetch()` call. Captures exactly one screen and one cursor per input boundary. |
| PRNG log accumulation | `rng.c` | `js/rng.js` + `frozen/isaac64.js` | ✅ | Frozen ISAAC64 engine. Log format must be `rn2(N)=M` etc. |
| Screen comparison / canonicalization | `frozen/ps_test_runner.mjs` | (frozen — do not modify) | ✅ | DEC→Unicode, SGR normalise, version banner sentinel. |
| Per-session regression runner | `frozen/ps_test_runner.mjs` | (frozen) | ✅ | `node frozen/ps_test_runner.mjs [session...]` |
| Full regression suite | `frozen/score.sh` | (frozen) | ✅ | Run before committing any change. No regressions allowed. |
| Debug tooling convention | — | One-off scripts in `scratch/` or `debug/`; batch triage in `scripts/triage-corpus.mjs` | 🟡 | Temp debug scripts MUST be deleted after use. Removed dead tracked `scratch/run_test.mjs` stub; remaining tracked scratch scripts are diagnostics. `scripts/triage-corpus.mjs` regenerates `scratch/divergence-inventory.md` from compact triage data for subsystem-level planning. Never leave `console.log` or `import('fs').writeFileSync` in production paths (jsmain.js, allmain.js). |

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
| Monster/object fill (mkfill, mineralize) | `mklev.c`, `mkobj.c`, `makemon.c`, `engrave.c`, `rumors.c` | `js/mklev.js` + `js/random_text.js` + `js/monster_data.js` + startup fast-forward scaffolds | 🟡 | `mkobj()` consumes upstream-derived class/object probability and material metadata. `rndmonst_adj()` now walks a generated `include/monsters.h` table with C's weighted reservoir RNG shape and numeric dungeon alignment (`A_NONE` for Dungeons of Doom); trap constants match `trap.h`; `occupied()` rejects trap squares; `CORPSE`/`STATUE`, trap-victim role corpse range, no-corpse retry, egg init, grid bug gender, multigen projectile quantity, kobold/giant/elven `m_initweap()` slices, shared offensive-item gate, and defensive-item creation now consume closer C RNG. Random graffiti uses NetHack-style padded data-file selection and `wipeout_text()`. `level_finalize_topology()` calls real `mineralize()`. Evidence: `seed0383` moved through vault fill, room fill, bigroom monster selection, special bigroom group init, selected equipment, and defensive items to FR 3661; `seed8000` screen parity remains `23/23`. |
| Shop generation | `mkroom.c:mkshop()` | `js/mklev.js:do_mkroom()` / `mkshop()` partial | 🟡 | The ordinary-level special-room decision now runs before fill. `mkshop()` can scan for an eligible one-door ordinary room and mark a shop type, but stocking, shopkeeper setup, `SHOPTYPE`, and full special-room fill remain incomplete. Evidence: `seed0116` moved past the level-2 shop chance gate to FR 4592. |
| Special level loading (Lua specials) | `sp_lev.c` | `js/mklev.js` static themed-map/bigroom slices | 🔴 | Full special level support is still absent. Static themed `des.map()` fragments now use exact upstream map literals for implemented shapes, enable `in_mk_themerooms` failure semantics, create irregular `filler_region()` rooms from flood-filled floor bounds, and use C-like irregular door search. `bigrm-12` now dispatches before ordinary level generation, consumes the random variant, Lua shuffle/init, scripted percent gates, stair/object/trap placement, and reaches `des.monster()` through the general generated monster table plus special-bigroom group initialization; current blocker is deeper selected-monster initialization/equipment after elven gear, not a level-12 replay table. `seed0116` debug level teleport moved from FR 3011 (`lspo_map`) through room/corridor/vault accounting, arrival placement, and pet migration to dog-goal object scanning. |

---

## 🧑 Player Initialization (newgame / chargen)

| Feature | C Reference | JS Implementation | Status | Notes |
|---|---|---|---|---|
| Name prompt / character selection UI | `pline.c`, `sounds.c` | `js/allmain.js:player_selection()` | 🟡 | **Hardcoded `_override_screen` for seed0002 only.** Must be generalized. |
| Role/race/gender/align selection from nethackrc | `role.c:plnamesiz()` etc. | `js/options.js` + `js/allmain.js` + `js/roles.js` (partial) | 🟡 | Parsed role/race/gender/align now drive startup identity, level-1 rank, alignment record, welcome text, and status title where config supplies them. This still does not implement chargen RNG, stats, or inventory. |
| Random chargen (pick_role etc.) | `role.c:pick4u()` | `js/allmain.js` (hardcoded `rn2()` calls) | 🔴 | Hard-coded for seed0002. Not a real implementation. |
| Hero placement (`u_on_upstairs`) | `stairs.c:u_on_upstairs()` | `js/mklev.js:u_on_upstairs()` | 🟡 | Works for seed8000/seed0002. **seed0002 step 12 has 1-cell offset bug.** |
| Player stats (HP, Pw, AC, attributes) | `attrib.c`, `role.c` | `js/u_init.js` + `js/allmain.js` (partial) | 🟡 | Configured non-replay Wizard/Rogue/Healer/Tourist now use partial role-driven HP/Pw/AC/gold and `init_attr()`/`vary_init_attr()` RNG shape. Attribute storage follows C order (`Str, Int, Wis, Dex, Con, Cha`) and human race maxes are used during redist. `seed0116` first screen now matches; next visible mismatch is deferred armor AC/map state after welcome. Seed replay paths remain scoped. |
| Starting inventory (`ini_inv`) | `invent.c:ini_inv()` | `js/u_init.js` + `js/mklev.js` object creation (partial) | 🟡 | Wizard `ini_inv(Wizard)` now consumes the general `trobj` path for fixed/random wands, rings, potions, scrolls, spellbooks, and magic marker charges, using `mkobj()`/`mksobj()` rather than replay. The optional Wizard blindfold branch is retained behind its `!rn2(5)` gate. Initial-inventory erosion is suppressed via the upstream `moves <= 1 && !in_mklev` rule. Other roles and full inventory use/wear/discovery side effects remain incomplete. |
| `o_init` (object type shuffle) | `o_init.c` | `js/o_init.js` | 🟡 | General RNG shape for gem colors, description shuffle ranges, and `WAN_NOTHING` direction is implemented for non-replay sessions. Actual shuffled description/material state is not wired into object identity yet. |
| Welcome / lore screens | `sounds.c`, `pline.c`, `role.c:Hello()` | `js/allmain.js:newgame()` + `js/roles.js:roleGreeting()` | 🟡 | Welcome greeting is role-driven rather than seed-driven. Configured role/align splash text now uses role god/rank data for the generic quest intro overlay, but full chargen/menu flow and exact windowing remain incomplete. |
| Tutorial prompt | `pline.c`, `options.c:ask_do_tutorial()` | `js/cmd.js` prompt overlay + seed0002 override | 🟡 | General post-welcome tutorial prompt now appears when `tutorial` was not set in config, including Space/Enter invalid-choice redraw. Seed0002 still uses older startup override screens. |

---

## 👁️ Vision & Display

| Feature | C Reference | JS Implementation | Status | Notes |
|---|---|---|---|---|
| Shadow-casting vision (`vision_recalc`) | `vision.c` | `js/vision.js` | 🟡 | Implemented. Spot-checked for seed8000/seed0002. |
| Terrain glyph rendering | `display.c:newsym()` | `js/display.js:newsym()` + `terrain_glyph()` | 🟡 | Mostly correct. DEC line-drawing output works. |
| Object rendering on map | `display.c:newsym()` | `js/display.js:newsym()` | 🟡 | Renders from `game.level.objects[]` — currently hardcoded per-seed. |
| Monster rendering on map | `display.c:newsym()` | `js/display.js:newsym()` | 🟡 | Renders from `game.level.monsters[]` — currently hardcoded per-seed. |
| Remembered glyph (out-of-sight) | `display.c` | `js/display.js` | 🟡 | Implemented via `remembered_glyph`. |
| Status line (bot) | `status.c` | `js/display.js:bot()` | ✅ | Verified passing for seed8000 (23/23). |
| Message line (pline) | `pline.c` | `js/display.js:pline()` + `js/cmd.js:rhack()` | 🟡 | Message lifetime now matches prompt-time capture better: persist through `nhgetch`, clear on next real command start, and preserve queued messages behind override `--More--` screens. More prompts are rendered into the terminal grid with row-0 cursor placement. Broader message production is still partial. |
| Sounds system | `sounds.c` | `js/sounds.js` | 🟡 | Basic `dosounds` with "slow drip" implemented. |
| Full-screen menus (inventory, attributes) | `pline.c`, `invent.c` | `_override_screen` injection | 🟡 | Multi-page menus fixed (ATTR1→ATTR2 via `_override_prev`). Still hardcoded strings for seed8000. |
| DEC line-drawing output | `curses.c` | `js/display.js` | ✅ | Outputs Unicode directly; runner translates DEC→Unicode for comparison. |
| `cls()` / `docrt()` | `display.c` | `js/display.js` | 🟡 | Functional. |
| Hallucination display context | `display.c` | — | 🔴 | Not implemented. Blocks `seed0383`, `seed0399`. |

---

## 🕹️ Command Dispatch (moveloop)

| Feature | C Reference | JS Implementation | Status | Notes |
|---|---|---|---|---|
| Main game loop (`moveloop_core`) | `allmain.c:moveloop_core()` | `js/allmain.js:moveloop_core()` | 🟡 | Basic loop. Fast-forward stubs for per-step RNG. |
| Command dispatch (`rhack`) | `cmd.c:rhack()` | `js/cmd.js:rhack()` | 🟡 | Move commands, rest/wait (`.`), search (`s`), basic UI stubs, debug `^V` numeric/menu level teleport, and `#levelchange` prompt/level-gain RNG are present. Most commands remain unimplemented. |
| Cardinal movement (`domove`) | `do.c:domove()` | `js/cmd.js:domove()` | 🟡 | Basic movement. No combat, traps, or item pickup. |
| Zero-turn commands (inventory, ESC, etc.) | `cmd.c` | `js/cmd.js` | 🟡 | `g.context.move=0` on zero-turn commands confirmed in lessons. |
| Per-step monster movement / regen RNG | `monmove.c`, `regen.c` | `js/monmove.js` + partial turn consumers | 🟡 | Per-step replay is no longer called from `moveloop_core()`, and the dead `fastforward_step()` exports have been removed from the seed replay modules. `makemon()` now preserves C `fmon` head-insertion order, and `mcalcmove()` handles slow/fast speed states. Movement AI remains skeletal; `seed8000` now blocks at FR 2985 where C still has another monster ready for `distfleeck()` while JS begins the next movement allocation. |
| Turn counter | `allmain.c` | `js/allmain.js` | ✅ | `g.moves++` conditional on `g.context.move`. |
| Game over (`gameover`) | `end.c` | `js/cmd.js` (stub) | 🔴 | Not implemented. Loop never terminates normally. |

---

## 🎒 Items & Objects

| Feature | C Reference | JS Implementation | Status | Notes |
|---|---|---|---|---|
| Object type table / `o_init` shuffle | `objects.c`, `o_init.c` | `js/object_data.js` + `js/o_init.js` | 🟡 | Static upstream object class/probability/charge/direction/material metadata is available for `mkobj` selection and erosion eligibility. `init_objects()` now consumes the general C description-shuffle RNG shape for non-replay sessions, reducing seed-specific startup replay reliance. Runtime object-description/material swaps, artifact selection/origin tracking, and item identity parity are still missing. |
| Random text data files | `rumors.c`, `engrave.c`, `makedefs.c`, `dat/rumors.*`, `dat/engrave.txt` | `js/random_text.js` + `js/random_text_data.js` | 🟡 | Random engraving/rumor selection builds padded/xcrypted virtual chunks from checked-in generated JS data and applies C-like `get_rnd_line()` and `wipeout_text()` RNG. Production JS is browser-safe and does not read upstream data files with `fs` at runtime. It currently serves graffiti generation; broader data-file consumers (epitaphs, bogus monsters, oracle text) still need integration. |
| Object placement on map | `mkobj.c:mksobj()` | `js/mklev.js:mksobj_at()` / `mkobj_at()` + legacy hardcoded arrays in `allmain.js` | 🟡 | Generated `_at` object creation now retains non-gold objects on `level.objects` with class glyph state, so later systems can inspect floor objects. Seed0002 still has legacy hardcoded startup objects, and object stacking/descriptions/material swaps/container contents remain incomplete. Evidence: `seed0116` dog blocker moved to `dog_goal()` object reachability/resistance rather than missing the pet wanderer gate. |
| Gold | `mkobj.c` | hardcoded `g._goldCount` | 🔴 | Per-seed hardcoded. |
| Autopickup | `pickup.c` | — | 🔴 | |
| Inventory management | `invent.c` | — | 🔴 | |

---

## 👾 Monsters

| Feature | C Reference | JS Implementation | Status | Notes |
|---|---|---|---|---|
| Monster placement (mklev fill) | `makemon.c`, `include/monsters.h`, `include/monflag.h` | `js/mklev.js:makemon()` + `js/monster_data.js` + hardcoded arrays in `allmain.js` | 🟡 | Random monster selection follows `rndmonst_adj()` reservoir sampling over generated `monsters.h` data and consumes `next_ident`, HP, baseline inventory gates, and retained level monster records. Exact selected-monster initialization/equipment and real movement AI are still incomplete; current `seed8000` blocker is live monster movement at FR 2985. |
| Monster movement | `monmove.c` | — | 🔴 | Fast-forwarded via RNG stubs only. |
| Combat | `fight.c` | — | 🔴 | |
| Pet behavior | `dog.c`, `dogmove.c` | `js/dog.js` + `js/mklev.js:makemon()` + `js/monmove.js` (partial) | 🟡 | Starting pet creation is partially ported for configured non-replay roles: role/preferred-pet selection, `MM_EDOG|NO_MINVENT`, near-hero `collect_coords()` ring shuffling, pet tame/peaceful setup, and kitten/little-dog/pony metadata. Tame monster turns now enter a partial `dog_move()` path with the upstream kitten/pony `M2_WANDER` gate and C-like neighbor scan order. `dog_goal()` now scans retained floor objects and hero inventory with `dogfood()`/`obj_resists()` guards for real numeric `otyp` objects. Current `seed0116` blocker is missing three object-resistance calls after the 14 retained Wizard inventory items, likely incomplete floor/object state. Hunger, naming, saddles, full object fetching/eating, migration details, and interactions remain incomplete. |

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
| seed8000-tourist-starter | **23** | 23 | 2026-05-10 | Screen parity preserved. First RNG mismatch remains FR 2985 in live monster movement (`distfleeck()` vs movement allocation). |
| seed0002-healer-reflection-drummer | 11 | 595 | 2026-05-10 | First visible screen mismatch unchanged at screen 11. Current lagging RNG evidence improved to `1303/27158`; first RNG mismatch is FR 1215 after generalized pet/object-state fixes. |
| seed0116-wizard-wear-shop | 16 | 127 | 2026-05-10 | Door-state aliasing, tutorial prompt lifecycle, rest command, debug `^V` prompt/Enter handling, static themed `des.map()`, irregular region bounds, corridor/vault accounting, random shop decision, level-teleport arrival placement, pet migration, normal Space handling, basic wear/takeoff prompts, pet wanderer handling, and partial `dog_goal()` object/inventory scans moved the first RNG mismatch from FR 2978 to FR 5532. Current blocker is missing object state in `dog_goal()` after taking off the cloak. |
| seed0383-wizard-hallucinate | 0 | 219 | 2026-05-10 | Improved from `936/16915` to first mismatch FR 3661; vault fill, final special-room refill with gold merging, kobold/giant/elven weapon init slices, multigen projectile quantity, shared offensive-item gate, defensive-item creation, debug `#levelchange`, debug level-teleport menu, partial `bigrm-12` special loading, special bigroom group init, general generated `monsters.h` reservoir sampling, and generated object retention are now modeled. Current blocker is `makemon.c:peace_minded()` predicate coverage before moving the general peaceful call into ordinary monster creation. |
| All other sessions | 0 | 10,442 | 2026-05-10 | Non-replay sessions now run general `init_objects()`, partial `role_init`, data-driven `init_dungeons()`, partial `u_init_misc`, starting pet placement, Wizard `ini_inv`, and broader mklev/monster equipment RNG. Many RNG prefixes improved, but first-screen parity still awaits broader role/race/inventory side effects, shop/special-room handling, save/restore, and hallucination display context. |

**As of 2026-05-10: 50 / 11,406 public screens matched (~0.4%), 0/44 sessions fully passing**

---

## 🎯 Recommended Next Targets (Highest ROI first)

1. **Implement `peace_minded()` predicate coverage** — `seed0383` now reaches FR 3661, where C calls `peace_minded()` but JS cannot safely move the call earlier until `always_hostile`/`always_peaceful`, race, minion, and special-sound predicates prevent false RNG rolls.
2. **Complete `dog_goal()` object state (`dogmove.c`)** — `seed0116` now scans floor objects and hero inventory; current blocker is three missing `obj_resists()` calls before the pet chooses its square, likely incomplete floor/object state.
3. **Continue startup HP/Pw and hallucination setup** — `#levelchange` HP/Pw RNG is now modeled, but first-screen display still has map glyph drift and hallucination display context remains absent.
4. **Generalize remaining startup menu/windowing paths** — the tutorial prompt is now general, but seed0002 still relies on hardcoded startup override screens.

# Feature Map — NetHack JS Port

Cross-reference of every major subsystem between the C reference and the JS port.
Use this to choose your next implementation target. Update the **Status** and **Notes** columns after each session.

**Status legend:**
- 🔴 Not started / fully stubbed
- 🟡 Partially implemented / hardcoded for specific seeds
- 🟢 Correct for all tested seeds
- ✅ Verified passing (screen-level parity confirmed)

**Metric column:** "gates Y screens" means getting this right unlocks Y screens across the public corpus.
The headline metric is **total matched screens / total screens** summed across all 44 sessions.

---

## 🏗️ Harness & Infrastructure

| Feature | C Reference | JS Implementation | Status | Notes |
|---|---|---|---|---|
| `runSegment()` API contract | `nethack-c/upstream/unixmain.c` | `js/jsmain.js` `runSegment()` | ✅ | Entry point, contract correct. Do not break. |
| Screen capture hook (pre-nhgetch) | `sys/tty/tty_getch()` | `js/jsmain.js` `_installCaptureHook()` | ✅ | Fires before every `nhgetch()` call. Captures `_override_screen` or live terminal. |
| PRNG log accumulation | `rng.c` | `js/rng.js` + `frozen/isaac64.js` | ✅ | Frozen ISAAC64 engine. Log format must be `rn2(N)=M` etc. |
| Screen comparison / canonicalization | `frozen/ps_test_runner.mjs` | (frozen — do not modify) | ✅ | DEC→Unicode, SGR normalise, version banner sentinel. |
| Per-session regression runner | `frozen/ps_test_runner.mjs` | (frozen) | ✅ | `node frozen/ps_test_runner.mjs [session...]` |
| Full regression suite | `frozen/score.sh` | (frozen) | ✅ | Run before committing any change. No regressions allowed. |
| Debug tooling convention | — | One-off scripts in project root | 🟡 | Temp debug scripts MUST be deleted after use. Never leave `console.log` or `import('fs').writeFileSync` in production paths (jsmain.js, allmain.js). |

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
| Door placement | `mkmaze.c:makedoor()` | `js/mklev.js` | 🟡 | |
| Stair generation (down stairs) | `mklev.c:generate_stairs()` | `js/mklev.js:generate_stairs()` | 🟡 | Down stairs generated. |
| Stair generation (up stairs, dlvl≥2) | `mklev.c:generate_stairs()` | `js/mklev.js:generate_stairs()` | 🟡 | Correctly skipped on dlvl 1. |
| Branch entrance placement (Mines etc.) | `mklev.c:place_lregion()` | `js/mklev.js:place_lregion()` | 🟡 | `end1_up: true` hardcoded for seed8000. Verify with other seeds. |
| Wallification (corner/t-junction glyphs) | `mklev.c:wallification()` | `js/mklev.js` | 🟡 | Present but may have edge cases. |
| Monster/object fill (mkfill, mineralize) | `mklev.c`, `mkobj.c` | `js/fastforward.js` + `js/fastforward0002.js` | 🟡 | **Hardcoded fast-forward only for seed8000 and seed0002.** Blocks all other sessions. |
| Shop generation | `mkroom.c:mkshop()` | — | 🔴 | No shop impl. Blocks `seed0116-wizard-wear-shop` and others. |
| Special level loading (Lua specials) | `sp_lev.c` | — | 🔴 | No special level support. |

---

## 🧑 Player Initialization (newgame / chargen)

| Feature | C Reference | JS Implementation | Status | Notes |
|---|---|---|---|---|
| Name prompt / character selection UI | `pline.c`, `sounds.c` | `js/allmain.js:player_selection()` | 🟡 | **Hardcoded `_override_screen` for seed0002 only.** Must be generalized. |
| Role/race/gender/align selection from nethackrc | `role.c:plnamesiz()` etc. | `js/options.js` (partial) | 🟡 | `parseNethackrc` parses OPTIONS= but does not drive chargen RNG. |
| Random chargen (pick_role etc.) | `role.c:pick4u()` | `js/allmain.js` (hardcoded `rn2()` calls) | 🔴 | Hard-coded for seed0002. Not a real implementation. |
| Hero placement (`u_on_upstairs`) | `stairs.c:u_on_upstairs()` | `js/mklev.js:u_on_upstairs()` | 🟡 | Works for seed8000/seed0002. **seed0002 step 12 has 1-cell offset bug.** |
| Player stats (HP, Pw, AC, attributes) | `attrib.c`, `role.c` | `js/allmain.js` (hardcoded) | 🔴 | All stats are hardcoded per-seed. Must compute from PRNG + role data. |
| Starting inventory (`ini_inv`) | `invent.c:ini_inv()` | `js/fastforward.js` (RNG stub) | 🔴 | No real inventory. Items displayed are hardcoded per-seed. |
| `o_init` (object type shuffle) | `o_init.c` | `js/o_init.js` (stub) | 🔴 | Object type shuffle not implemented. Blocks all object IDs. |
| Welcome / lore screens | `sounds.c`, `pline.c` | `js/allmain.js:newgame()` | 🟡 | Hardcoded per seed. Needs proper role/align text lookup. |
| Tutorial prompt | `pline.c` | `js/allmain.js` (override) | 🟡 | Hardcoded for seed0002. |

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
| Message line (pline) | `pline.c` | `js/display.js:pline()` | 🟡 | Basic impl. `--More--` handled. Zero-turn message persistence confirmed. |
| Full-screen menus (inventory, attributes) | `pline.c`, `invent.c` | `_override_screen` injection | 🟡 | Multi-page menus fixed (ATTR1→ATTR2 via `_override_prev`). Still hardcoded strings for seed8000. |
| DEC line-drawing output | `curses.c` | `js/display.js` | ✅ | Outputs Unicode directly; runner translates DEC→Unicode for comparison. |
| `cls()` / `docrt()` | `display.c` | `js/display.js` | 🟡 | Functional. |
| Hallucination display context | `display.c` | — | 🔴 | Not implemented. Blocks `seed0383`, `seed0399`. |

---

## 🕹️ Command Dispatch (moveloop)

| Feature | C Reference | JS Implementation | Status | Notes |
|---|---|---|---|---|
| Main game loop (`moveloop_core`) | `allmain.c:moveloop_core()` | `js/allmain.js:moveloop_core()` | 🟡 | Basic loop. Fast-forward stubs for per-step RNG. |
| Command dispatch (`rhack`) | `cmd.c:rhack()` | `js/cmd.js:rhack()` | 🟡 | Only move commands (hjklyubn + `.` `,`) + basic UI stubs. |
| Cardinal movement (`domove`) | `do.c:domove()` | `js/cmd.js:domove()` | 🟡 | Basic movement. No combat, traps, or item pickup. |
| Zero-turn commands (inventory, ESC, etc.) | `cmd.c` | `js/cmd.js` | 🟡 | `g.context.move=0` on zero-turn commands confirmed in lessons. |
| Per-step monster movement / regen RNG | `monmove.c`, `regen.c` | `js/fastforward.js:fastforward_step()` | 🟡 | Hardcoded per-seed fast-forward only. |
| Turn counter | `allmain.c` | `js/allmain.js` | ✅ | `g.moves++` conditional on `g.context.move`. |
| Game over (`gameover`) | `end.c` | `js/cmd.js` (stub) | 🔴 | Not implemented. Loop never terminates normally. |

---

## 🎒 Items & Objects

| Feature | C Reference | JS Implementation | Status | Notes |
|---|---|---|---|---|
| Object type table / `o_init` shuffle | `objects.c`, `o_init.c` | — | 🔴 | **Fundamental blocker.** Without this, object IDs (potions, scrolls, etc.) cannot match C. |
| Object placement on map | `mkobj.c:mksobj()` | hardcoded arrays in `allmain.js` | 🔴 | Hardcoded per seed. Must be driven by real object generation. |
| Gold | `mkobj.c` | hardcoded `g._goldCount` | 🔴 | Per-seed hardcoded. |
| Autopickup | `pickup.c` | — | 🔴 | |
| Inventory management | `invent.c` | — | 🔴 | |

---

## 👾 Monsters

| Feature | C Reference | JS Implementation | Status | Notes |
|---|---|---|---|---|
| Monster placement (mklev fill) | `makemon.c` | hardcoded array in `allmain.js` | 🔴 | Per-seed hardcoded. |
| Monster movement | `monmove.c` | — | 🔴 | Fast-forwarded via RNG stubs only. |
| Combat | `fight.c` | — | 🔴 | |
| Pet behavior | `dog.c` | — | 🔴 | |

---

## 📅 Time & World State

| Feature | C Reference | JS Implementation | Status | Notes |
|---|---|---|---|---|
| `datetime` parsing / moon phase | `hacklib.c:timerep()` | not integrated | 🔴 | `datetime` passed in but not used. Blocks `seed0013-friday13`. |

---

## 🔧 Options / Config

| Feature | C Reference | JS Implementation | Status | Notes |
|---|---|---|---|---|
| nethackrc parsing | `options.c` | `js/options.js:parseNethackrc()` | 🟡 | Parses OPTIONS= block. Does not fully drive chargen. |
| `OPTIONS=name:...` → chargen | `options.c` | `js/options.js` (partial) | 🟡 | Name extracted. Role/race/gender/align parsing incomplete. |
| `OPTIONS=!tutorial` | `options.c` | `js/options.js` | 🟡 | Parsed as flag. Not enforced in player_selection. |

---

## 📊 Current Score Summary

*(Update this section after every agent run — it is the ground truth for progress.)*

| Session | Matched | Total | Last Updated | Notes |
|---|---|---|---|---|
| seed8000-tourist-starter | **23** | 23 | 2026-05-10 | ✅ **PASSING** — Full session passes! |
| seed0002-healer-reflection-drummer | 13 | 595 | 2026-05-10 | Diverges at step 14: hero position offset |
| All other sessions | 0 | ~10,650 | 2026-05-10 | Need generalized chargen + object/monster gen |

**As of 2026-05-10: ~36 / ~11,268 public screens matched (~0.3%), 1/44 sessions PASSING**

---

## 🎯 Recommended Next Targets (Highest ROI first)

1. **Fix seed0002 step 14 player position** — Hero placed 1 cell off from expected. Unlocks up to 595 screens.
2. **Generalize chargen from nethackrc** — Parse `OPTIONS=role:Healer,race:Human,...` and drive chargen properly. Removes all `player_selection` hardcoding. Unlocks all 44 sessions' startup screens.
3. **Implement real `o_init` / object shuffle** — Without this, item types (scrolls, potions) can't match C. Fundamental blocker for items-dependent sessions.
4. **Implement real `makemon` / monster placement** — Needed for sessions with combat.

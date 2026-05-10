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
| Monster/object fill (mkfill, mineralize) | `mklev.c`, `mkobj.c`, `makemon.c`, `engrave.c`, `rumors.c` | `js/mklev.js` + `js/random_text.js` + startup fast-forward scaffolds | 🟡 | `mkobj()` consumes upstream-derived class/object probability and material metadata. Early level-1 `rndmonst_adj()` uses C's weighted reservoir RNG shape; trap constants match `trap.h`; `occupied()` rejects trap squares; `CORPSE`/`STATUE` and egg init consume closer C RNG. Random graffiti uses NetHack-style padded data-file line selection and `wipeout_text()` rubouts. `level_finalize_topology()` now calls real `mineralize()` and consumes buried/place gates; the dead `fastforward_fill_mineralize()` replay exports were removed from seed replay modules. Evidence: `seed8000` screen parity remains `23/23`; first RNG mismatch is in the live monster movement loop at FR 2984. |
| Shop generation | `mkroom.c:mkshop()` | — | 🔴 | No shop impl. Blocks `seed0116-wizard-wear-shop` and others. |
| Special level loading (Lua specials) | `sp_lev.c` | — | 🔴 | No special level support. |

---

## 🧑 Player Initialization (newgame / chargen)

| Feature | C Reference | JS Implementation | Status | Notes |
|---|---|---|---|---|
| Name prompt / character selection UI | `pline.c`, `sounds.c` | `js/allmain.js:player_selection()` | 🟡 | **Hardcoded `_override_screen` for seed0002 only.** Must be generalized. |
| Role/race/gender/align selection from nethackrc | `role.c:plnamesiz()` etc. | `js/options.js` + `js/allmain.js` + `js/roles.js` (partial) | 🟡 | Parsed role/race/gender/align now drive startup identity, level-1 rank, alignment record, welcome text, and status title where config supplies them. This still does not implement chargen RNG, stats, or inventory. |
| Random chargen (pick_role etc.) | `role.c:pick4u()` | `js/allmain.js` (hardcoded `rn2()` calls) | 🔴 | Hard-coded for seed0002. Not a real implementation. |
| Hero placement (`u_on_upstairs`) | `stairs.c:u_on_upstairs()` | `js/mklev.js:u_on_upstairs()` | 🟡 | Works for seed8000/seed0002. **seed0002 step 12 has 1-cell offset bug.** |
| Player stats (HP, Pw, AC, attributes) | `attrib.c`, `role.c` | `js/allmain.js` (hardcoded) | 🔴 | All stats are hardcoded per-seed. Must compute from PRNG + role data. |
| Starting inventory (`ini_inv`) | `invent.c:ini_inv()` | `js/fastforward.js` (RNG stub) | 🔴 | No real inventory. Items displayed are hardcoded per-seed. |
| `o_init` (object type shuffle) | `o_init.c` | `js/o_init.js` (stub) | 🔴 | Object type shuffle not implemented. Blocks all object IDs. |
| Welcome / lore screens | `sounds.c`, `pline.c`, `role.c:Hello()` | `js/allmain.js:newgame()` + `js/roles.js:roleGreeting()` | 🟡 | Welcome greeting is role-driven rather than seed-driven. Configured role/align splash text now uses role god/rank data for the generic quest intro overlay, but full chargen/menu flow and exact windowing remain incomplete. |
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
| Message line (pline) | `pline.c` | `js/display.js:pline()` + `js/cmd.js:rhack()` | 🟡 | Message lifetime now matches prompt-time capture better: persist through `nhgetch`, clear on next command start. Broader message production is still partial. |
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
| Command dispatch (`rhack`) | `cmd.c:rhack()` | `js/cmd.js:rhack()` | 🟡 | Only move commands (hjklyubn + `.` `,`) + basic UI stubs. |
| Cardinal movement (`domove`) | `do.c:domove()` | `js/cmd.js:domove()` | 🟡 | Basic movement. No combat, traps, or item pickup. |
| Zero-turn commands (inventory, ESC, etc.) | `cmd.c` | `js/cmd.js` | 🟡 | `g.context.move=0` on zero-turn commands confirmed in lessons. |
| Per-step monster movement / regen RNG | `monmove.c`, `regen.c` | `js/monmove.js` + partial turn consumers | 🟡 | Per-step replay is no longer called from `moveloop_core()`, and the dead `fastforward_step()` exports have been removed from the seed replay modules. `makemon()` retains generated monsters on the level and time-taking commands now spend/allocate monster movement before random monster generation, `dosounds()`, hunger, and the engraving wipe gate. Movement AI remains skeletal; `seed8000` now blocks at FR 2984 where C has more monsters ready to act than the JS partial monster table/state. |
| Turn counter | `allmain.c` | `js/allmain.js` | ✅ | `g.moves++` conditional on `g.context.move`. |
| Game over (`gameover`) | `end.c` | `js/cmd.js` (stub) | 🔴 | Not implemented. Loop never terminates normally. |

---

## 🎒 Items & Objects

| Feature | C Reference | JS Implementation | Status | Notes |
|---|---|---|---|---|
| Object type table / `o_init` shuffle | `objects.c`, `o_init.c` | `js/object_data.js` + `js/o_init.js` | 🟡 | Static upstream object class/probability/charge/direction/material metadata is now available for `mkobj` selection and erosion eligibility, removing several bogus handwritten constants. Real `o_init` shuffles, artifact selection/origin tracking, and runtime object-description state are still missing, so item identity parity is not solved yet. |
| Random text data files | `rumors.c`, `engrave.c`, `makedefs.c` | `js/random_text.js` | 🟡 | Random engraving/rumor selection builds padded/xcrypted virtual chunks from upstream data files and applies C-like `get_rnd_line()` and `wipeout_text()` RNG. It currently serves graffiti generation; broader data-file consumers (epitaphs, bogus monsters, oracle text) still need integration. |
| Object placement on map | `mkobj.c:mksobj()` | hardcoded arrays in `allmain.js` | 🔴 | Hardcoded per seed. Must be driven by real object generation. |
| Gold | `mkobj.c` | hardcoded `g._goldCount` | 🔴 | Per-seed hardcoded. |
| Autopickup | `pickup.c` | — | 🔴 | |
| Inventory management | `invent.c` | — | 🔴 | |

---

## 👾 Monsters

| Feature | C Reference | JS Implementation | Status | Notes |
|---|---|---|---|---|
| Monster placement (mklev fill) | `makemon.c` | `js/mklev.js:makemon()` + hardcoded arrays in `allmain.js` | 🟡 | Early ordinary level-1 random monster selection follows `rndmonst_adj()` reservoir sampling and consumes `next_ident`, level-0 HP, baseline inventory gates, and retained level monster records. The full monster table, exact selected monster data, and real movement AI are incomplete; current `seed8000` blocker is live monster movement at FR 2984. |
| Monster movement | `monmove.c` | — | 🔴 | Fast-forwarded via RNG stubs only. |
| Combat | `fight.c` | — | 🔴 | |
| Pet behavior | `dog.c` | — | 🔴 | |

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
| seed8000-tourist-starter | **23** | 23 | 2026-05-10 | Screen parity preserved. Real mineralize and partial live-turn movement moved lagging RNG evidence to `2996/3130`; first RNG mismatch is FR 2984: expected another `distfleeck()` `rn2(5)`, actual `mcalcmove()` `rn2(12)`. |
| seed0002-healer-reflection-drummer | 11 | 595 | 2026-05-10 | First visible screen mismatch unchanged at screen 11. Current lagging RNG evidence is `1230/27158`; first RNG mismatch remains FR 1202 after seed8000 replay was scoped away from unrelated seeds. |
| All other sessions | 0 | 10,666 | 2026-05-10 | Seed8000 startup replay is no longer applied to unrelated seeds. Need real `o_init`, dungeon init, generalized chargen + object/monster generation + shop/inventory + datetime side effects + hallucination display context. |

**As of 2026-05-10: 34 / 11,284 public screens matched (~0.3%), 0/44 sessions fully passing**

---

## 🎯 Recommended Next Targets (Highest ROI first)

1. **Implement real monster table and movement state (`monsters.h`, `makemon.c`, `mon.c`, `monmove.c`)** — real mineralize is now in place, and `seed8000` reaches the live turn loop. The next blocker is that JS retained monsters do not have C-equivalent movement readiness; fix selected monster data and movement state before touching per-step behavior.
2. **Generalize chargen from nethackrc** — Parse `OPTIONS=role:Healer,race:Human,...` and drive chargen properly. Removes all `player_selection` hardcoding and startup overrides across the corpus.
3. **Implement real `o_init` / object shuffle** — Without this, item types (scrolls, potions) can't match C. Fundamental blocker for object-dependent parity.
4. **Implement real `makemon` / monster placement** — Needed to replace hardcoded monster arrays and unblock movement, pet, and combat work.

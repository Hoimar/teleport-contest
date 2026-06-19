# Teleport Implementation Loop

Live checkpoint only. For history, use `git log`, `git show`, `lessons.md` (avoid token-intensive full reads as explained in `AGENTS.md`'s "## Memory Routing"),
and `feature_map.md`.

## Context Rules

- Read this file fully before resuming a loop.
- Use `npm run agent:brief -- --target <target>` for targeted context.
- Search `lessons.md` and `feature_map.md`; do not full-read them by default.
- Regenerate broad corpus state with `node scripts/triage-corpus.mjs`.

## Current State

- Current branch in this workspace: `main`, ahead of origin.
- Latest verified repair unit: live `seed0361` Medusa-2/Fort Ludios repair.
- Checked-in public corpus is exact: `44/44 S 11405/11405 R 792838/792838 C 0`.
- Hosted public cache remains `public-session-drift` at
  `40/44 S 10506/10982 R 715024/840358 C 0`; leaderboard fetch failed.
- Scratch trace/checkpoint files are agent-toolkit state and may be committed
  when useful; keep production parity and scratch-tool commits coherent.
- Strict sentinels are exact:
  `5/5 S 1063/1063 R 64569/64569 C 0`.
- Current public classification: checked-in corpus has 44 exact local sessions;
  hosted cache differs from checked-in sessions, and leaderboard state remains
  secondary until refreshed.
- Current sentinel regression classification: none; strict sentinel is exact.
- Hack audit remains `hard=0 suspicious=2`; `memory:lint` reports
  `issues=0`. Production `js/` has no intentional debug I/O or imports from
  `frozen/`.

## Latest Loop Checkpoint

- Latest verified WIP on 2026-06-19:
  - Live `seed0361-archeologist-tour` now reaches
    `S 262/294 R 66518/70975` from the prior live Fort Ludios frontier
    `S 240/294 R 42671/70975`.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - Implementation truth:
    - `medusa-2` now dispatches through a static upstream-map loader with
      C-centered `(3,1)` origin, scripted lighting/rooms/stairs/lregions,
      statue/container/object/trap/monster payload, and final
      wallification/flip/fixup.
    - `knox` now dispatches through a Fort Ludios static loader with real
      court/zoo/barracks/arrival room metadata, roomless treasury lighting,
      immediate `add_doors_to_room()`-style door links, scripted treasure,
      traps, monsters, gems, lregions after wallification bounds, and the
      maze-court scripted-throne `fill_zoo()` path.
    - Croesus now receives the `PM_CROESUS` two-handed-sword `mitem` through
      the shared monster-init inventory front door.
    - Scratch RNG stack tooling can print focused `getbones()` traces to
      separate bones/prelude drift from later special-level payload drift.
  - Current live frontier: `seed0361` reaches Archeologist filler generation
    with first RNG mismatch `FR 66503: rn2(9)=7=>rn2(8)=1`. Expected enters
    `makemon.c:mkclass_aligned()`, while JS is still in
    `loadArcheologistFillerSpecial()`/`makecorridors()` door generation.
    Next work should inspect Arc filler room/corridor generation against
    `dat/Arc-fila.lua`, `dat/Arc-filb.lua`, and C corridor/join ordering.
  - First visible screen mismatch remains screen 229's materialize topline
    missing the C `--More--`; do not let that obscure the later proven RNG
    frontier unless display work is the selected subsystem target.
  - Verification covered `node --check` for `js/mklev.js` and scratch trace
    scripts, focused live `verify`, `sentinel:strict`, `hack:audit`,
    `memory:lint`, and `git diff --check`.

- Latest verified WIP on 2026-06-19:
  - Live `seed0360-wizard-world-tour` now reaches
    `S 298/618 R 102204/133910` from the prior live frontier
    `S 280/618 R 91652/133910`.
  - Checked-in `seed0360` remains exact:
    `S 833/833 R 120639/120639 C 0`.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - Full checked-in corpus remains exact:
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Implementation truth:
    - `makemon()` now records `mvitals[].born`/`G_EXTINCT` through the
      C-shaped `propagate()` birth limit path, so random-monster and class
      generation skip extinct species unless the caller uses `G_IGNORE`.
    - Initial shapeshifter `pick_nasty()` now resolves C enum-name nasties
      such as `PM_ELVEN_MONARCH` through generated JS monster names and
      applies the C demotion/genocide/out-of-place checks.
    - Scratch RNG stack tooling can print focused `mkclass` and `fill_zoo`
      traces for live-session frontier work.
  - Current live frontier: seed0360 late special-room `fill_zoo()`/gold
    creation at `FR 102039` (`rnd(2)`/`rn2(210)` order). A broad deferred
    `mkgold(rn1(...))` helper was rejected because it regressed checked-in
    Sokoban evidence at `FR 42526`; next work should reconcile placement,
    occupancy, or session-provenance before changing this ordering.
  - Verification covered `node --check` for `js/mklev.js` and
    `js/monstats.js`, focused live/checked-in `verify`, `sentinel:strict`,
    and the full checked-in public corpus.

- Latest verified WIP on 2026-06-19:
  - `seed0360-wizard-world-tour` special-level completion:
    `S 833/833 R 120639/120639 C 0`.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - Full checked-in corpus passed via `bash frozen/score.sh`:
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Live/public refresh remains `public-session-drift` because hosted public
    sessions differ from checked-in sessions; leaderboard fetch failed.
  - Implementation truth covered Mines End Catacombs `minend-3`, Sokoban
    first-try rock-thrower retry, live `mtmp->m_lev` weapon/offensive-item
    gates, real shopkeeper carried inventory for Orcus cleanup, Juiblex SWAMP
    finalization, Sanctum lregion/secret-door order, `light_region()` lit
    border behavior, and ice/drawbridge terrain glyphs.
  - Verification also covered `node --check` for `js/mklev.js` and
    `js/display.js`, `verify --target seed0360`, `sentinel:strict`,
    `hack:audit`, `memory:lint`, and `git diff --check`.
  - Next queue: choose the next live-public or hidden-session mismatch from a
    fresh `parity:state`/triage pass; checked-in public corpus is exact.

- Previous dehack and seed0360 completion detail is in git, `feature_map.md`,
  and `lessons.md`; keep this live checkpoint focused on active frontiers.

- Older checkpoint history lives in git and `feature_map.md`; keep this file
  focused on the active loop state and next queue.

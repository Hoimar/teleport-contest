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
- Latest committed parity repair before the current WIP: `1e15415` (`Port
  Barbarian Endgame planes tour`).
  Next target should come from checked-in public corpus divergences, not
  hosted/leaderboard drift.
- Last toolkit commit before the current WIP: `1e15415` (`Port Barbarian
  Endgame planes tour`).
- Latest verified WIP:
  - `seed0360-wizard-world-tour`: `S 833/833 R 120639/120639 C 0 OK`.
  - `seed4500-knight-coverage`: `S 1814/1814 R 108275/108275 C 0 OK`.
  - Guard `seed0373-barbarian-quest-tour`: triage `S 124/124 R 35386/35386
    C 1`; verify reports no first screen/RNG mismatch and one cursor-only
    boundary (`S 123/124 R 35386/35386 C 1`).
  - Guard `seed1150-caveman-explore-move`: `S 51/51 R 3137/3137 C 0 OK`.
  - Strict sentinels exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
  - Implementation: arrival materialize/temperature/smoke text now packs
    through tty topline width rules; full `docrt()` redraws clear `disp_*`
    state before memory/current redraw; unseen long-worm tail cells avoid
    warning overlays; iron bars use the special bar glyph only for `IN_SIGHT`
    cells (`C refs: do.c:goto_level()/temperature_change_msg()/
    hellish_smoke_mesg(), display.c:docrt_flags()/display_monster(),
    display.h:_mon_warning(), vision.h:IN_SIGHT/COULD_SEE,
    vision.c:vision_recalc()`).
- Previous verified parity repair:
  - `seed0373-barbarian-quest-tour`: triage `S 124/124 R 35386/35386 C 1`;
    verify reports no first screen/RNG mismatch and one cursor-only boundary.
  - Guard `seed1150-caveman-explore-move`: `S 51/51 R 3137/3137 C 0 OK`.
  - Strict sentinels exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
  - Implementation: Barbarian startup/quest and Endgame Plane travel are now
    live systems for current evidence: Fire/Air special loading, Air
    horizontal-flipped lregion bounds, `movebubbles()` and display memory,
    wizard Endgame prerequisite Amulet, arrival Wizard/wish/fumarole queueing,
    follower order, Amulet discovery, bimanual weapon wording, and debug `^X`
    Endgame/role-innate insight
    (`C refs: u_init.c:Barbarian_0[]/Barbarian_1[], dat/air.lua,
    mkmaze.c:movebubbles()/mv_bubble()/fumaroles(),
    teleport.c:level_tele(), do.c:goto_level(), o_init.c:dodiscovered(),
    insight.c:background_enlightenment()/attributes_enlightenment()`).
- Previous verified parity repair:
  - `seed4500-knight-coverage`: `S 1814/1814 R 108275/108275 C 0 OK`.
  - Strict sentinels exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
  - Extra guards: `seed0103-knight-ride-pony` exact and
    `seed0501-priest-cast-read-turn` exact.
  - Implementation: scoped startup tutorial More flags to actual
    welcome/preamble tutorial handoff, restored liquid avoidance swim-tip
    emission after the avoidance More, added the C final busy turn before
    spellbook `learn()` side effects, and defined `MZ_HUGE=4` in monster
    movement (`C refs: options.c:ask_do_tutorial()`,
    hack.c:swim_move_danger()/handle_tip(), spell.c:study_book()/learn(),
    allmain.c:moveloop_core(), include/monflag.h`).
- Scratch trace/checkpoint files are agent-toolkit state and may be committed
  when useful; keep production parity and scratch-tool commits coherent.
- Strict sentinels are exact:
  `5/5 S 1063/1063 R 64569/64569 C 0`.
- Regenerated checked-in corpus inventory after the current WIP:
  `35/44 S 9495/11405 R 634310/792838`, with remaining misses
  `seed0004`, `seed0006`, `seed0007`, `seed0009`, `seed0014`, `seed0077`,
  `seed0102`, `seed0367`, and `seed2600`.
- Latest `npm run parity:state -- --refresh-live` before the current WIP:
  checked-in public `exact 32/44 S 7388/11405 R 483381/792838 C 1`;
  hosted public cache `exact 30/44 S 7115/10982 R 428093/840358 C 1`;
  class `public-session-drift`; strict sentinel exact. Latest leaderboard
  refresh remains unavailable because sandbox networking failed and escalation
  hit the harness usage limit; use checked-in sessions for implementation
  truth.
- Current non-sentinel regression classification in this WIP: none among
  `seed0360`, `seed4500`, `seed0373`, `seed1150`, or strict sentinels.
  Remaining public misses should be selected from checked-in corpus/divergence
  inventory.
- Hack audit remains `hard=0 suspicious=45`; `memory:lint` reports
  `issues=0`. Production `js/` has no intentional debug I/O or imports from
  `frozen/`.

## Latest Loop Checkpoint

- Latest verified WIP on 2026-06-05:
  - `seed0360-wizard-world-tour`: exact
    `S 833/833 R 120639/120639 C 0`.
  - `seed4500-knight-coverage`: exact
    `S 1814/1814 R 108275/108275 C 0`.
  - Guard `seed0373-barbarian-quest-tour`: triage
    `S 124/124 R 35386/35386 C 1`; verify reports no first screen/RNG
    mismatch and one cursor-only boundary (`S 123/124 R 35386/35386 C 1`).
  - Guard `seed1150-caveman-explore-move`: exact
    `S 51/51 R 3137/3137 C 0`.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0360-wizard-world-tour`, `verify --target
    seed4500-knight-coverage`, `verify --target seed0373-barbarian-quest-tour`,
    and `verify --target seed1150-caveman-explore-move` all passed their target
    expectations plus strict sentinels, `hack:audit` (`hard=0 suspicious=45`),
    and `memory:lint` (`issues=0`).
  - Regenerated checked-in corpus inventory:
    `35/44 S 9495/11405 R 634310/792838`. Remaining queue:
    `seed2600`, `seed0004`, `seed0006`, `seed0007`, `seed0009`, `seed0014`,
    `seed0077`, `seed0102`, and `seed0367`.
  - Latest live `parity:state -- --refresh-live` predates this WIP:
    checked-in public `32/44 S 7388/11405 R 483381/792838 C 1`, hosted public
    `30/44 S 7115/10982 R 428093/840358 C 1`; leaderboard refresh remains
    unavailable due sandbox networking plus harness usage-limit rejection.
  - Subsystem truth: arrival temperature and smoke lines are pack-after tty
    topline work behind materialize; `docrt()` clears display state before
    redraw; unseen long-worm tail cells do not get warning overlays; and iron
    bars use the special bar glyph only when `IN_SIGHT`.
  - Next queue after committing this unit: choose the next checked-in public
    divergence from the current corpus state; do not chase hosted/leaderboard
    drift as local implementation truth.

- Older checkpoint history lives in git and `feature_map.md`; keep this file
  focused on the active loop state and next queue.

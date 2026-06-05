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
- Latest committed parity repair before the current WIP: `e9a92d3` (`Repair
  arrival display regressions`).
  Next target should come from checked-in public corpus divergences, not
  hosted/leaderboard drift.
- Last toolkit commit before the current WIP: `e9a92d3` (`Repair arrival
  display regressions`).
- Latest verified WIP:
  - `seed2600-wizard-custom-binds`: exact
    `S 38/38 R 11647/11647 C 0`.
  - `seed0360-wizard-world-tour`: `S 833/833 R 120639/120639 C 0 OK`.
  - `seed4500-knight-coverage`: `S 1814/1814 R 108275/108275 C 0 OK`.
  - Guard `seed0373-barbarian-quest-tour`: triage `S 124/124 R 35386/35386
    C 1`; verify reports no first screen/RNG mismatch and one cursor-only
    boundary (`S 123/124 R 35386/35386 C 1`).
  - Guard `seed1150-caveman-explore-move`: `S 51/51 R 3137/3137 C 0 OK`.
  - Strict sentinels exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
  - Implementation: `seed2600` now uses parsed `BIND=` command bindings,
    C-shaped startup object knowledge/discovery for `oc_uses_known` and
    `OBJ_DESCR()`, initial spellbook learning/display for clairvoyance,
    Bigroom-9 special loading with grown lit selections, static gas-region
    visibility, and the current Cloud room / Temple of the gods themed fills
    (`C refs: options.c:parsebindings(), cmd.c:cmdbind_get(),
    mkobj.c:unknow_object(), u_init.c:ini_inv_use_obj(),
    spell.c:initialspell()/dospellmenu(), dat/bigrm-9.lua,
    sp_lev.c:lspo_region()/get_location()/create_altar()/create_monster(),
    region.c:visible_region_at(), dat/themerms.lua`).
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
  `32/44 S 9526/11405 R 645539/792838`, with remaining misses
  `seed0004`, `seed0006`, `seed0007`, `seed0009`,
  `seed0013-rogue-friday13-combat`, `seed0014`, `seed0060`, `seed0077`,
  `seed0102`, `seed0361`, `seed0367`, and `seed1500`.
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
  - `seed2600-wizard-custom-binds`: exact
    `S 38/38 R 11647/11647 C 0`.
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
  - `verify --target seed2600-wizard-custom-binds` passed its target
    expectations plus strict sentinels, `hack:audit` (`hard=0 suspicious=45`),
    and `memory:lint` (`issues=0`).
  - Regenerated checked-in corpus inventory:
    `32/44 S 9526/11405 R 645539/792838`. Remaining queue:
    `seed0004`, `seed0006`, `seed0007`, `seed0009`,
    `seed0013-rogue-friday13-combat`, `seed0014`, `seed0060`, `seed0077`,
    `seed0102`, `seed0361`, `seed0367`, and `seed1500`.
  - Latest live `parity:state -- --refresh-live` predates this WIP:
    checked-in public `32/44 S 7388/11405 R 483381/792838 C 1`, hosted public
    `30/44 S 7115/10982 R 428093/840358 C 1`; leaderboard refresh remains
    unavailable due sandbox networking plus harness usage-limit rejection.
  - Subsystem truth: parsed `BIND=` command bindings, C object knowledge
    semantics for `oc_uses_known` and `OBJ_DESCR()`, Bigroom-9 static special
    loading and grown lit selections, themed Cloud/Temple fill front doors,
    static gas-region visibility, initial clairvoyance spell display, and
    worn-source antimagic insight are live for current evidence.
  - Next queue after committing this unit: choose the next checked-in public
    divergence from the current corpus state; do not chase hosted/leaderboard
    drift as local implementation truth.

- Older checkpoint history lives in git and `feature_map.md`; keep this file
  focused on the active loop state and next queue.

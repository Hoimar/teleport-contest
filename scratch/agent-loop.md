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
- Latest committed parity repair: `6faaa53` (`Port Barbarian Endgame planes tour`).
  Next target should come from checked-in public corpus divergences, not
  hosted/leaderboard drift.
- Last toolkit commit: `6faaa53` (`Port Barbarian Endgame planes tour`).
- Latest verified parity repair:
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
- `npm run parity:state -- --refresh-live` on the current verified WIP:
  checked-in public `exact 32/44 S 7388/11405 R 483381/792838 C 1`;
  hosted public cache `exact 30/44 S 7115/10982 R 428093/840358 C 1`;
  class `public-session-drift`; strict sentinel exact. Latest leaderboard
  refresh is unavailable because sandbox networking failed and escalation hit
  the harness usage limit; use checked-in sessions for implementation truth.
- Current non-sentinel regression classification in this WIP: none among
  `seed0373`, `seed1150`, or strict sentinels.
  Remaining public misses should be selected from checked-in corpus/divergence
  inventory.
- Hack audit remains `hard=0 suspicious=45`; `memory:lint` reports
  `issues=0`. Production `js/` has no intentional debug I/O or imports from
  `frozen/`.

## Latest Loop Checkpoint

- Latest verified WIP on 2026-06-05:
  - `seed0373-barbarian-quest-tour` exact under triage:
    `S 124/124 R 35386/35386 C 1`; verify reports no first screen/RNG
    mismatch and one cursor-only boundary.
  - Guard target exact: `seed1150-caveman-explore-move`
    `S 51/51 R 3137/3137 C 0`.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0373-barbarian-quest-tour` passed target, sentinels,
    `hack:audit` (`hard=0 suspicious=45`), and `memory:lint` (`issues=0`).
  - `parity:state -- --refresh-live` checked-in public:
    `32/44 S 7388/11405 R 483381/792838 C 1`; hosted public:
    `30/44 S 7115/10982 R 428093/840358 C 1`; class
    `public-session-drift`; leaderboard refreshed from
    `https://mazesofmenace.ai/leaderboard/data.json`.
  - Subsystem truth: Air lregions are flipped with C's solidfill-STONE bounds
    before waterlevel fixup; Air arrival then owns post-pet
    `movebubbles()`/cloud redraw. Endgame wizard level teleport inventories and
    prints a real Amulet before travel, the Amulet has fixed discovery text,
    and debug insight uses C Endgame names, move-1 wording, Air max carrying
    capacity, skill classes, and role-innate sources.
  - Next queue after committing this unit: choose the next checked-in public
    divergence from the current corpus state; do not chase hosted/leaderboard
    drift as local implementation truth.

- Latest verified repairs on 2026-06-04:
  - `seed0012-monk-vault-escort` committed at `7179887`, exact
    `S 308/308 R 13878/13878 C 0`, strict sentinels exact. Ported the vault
    escort cleanup boundary, fake-corridor restoration loop, active-guard sound
    suppression, and counted-search vault timing.
  - `seed0108-wizard-extcmd-wishlist` committed at `d71dd87`, exact
    `S 303/303 R 16958/16958 C 0`, strict sentinels exact. Fixed `#loot`
    take-out menu sequencing without RNG changes.
  - `seed0360-wizard-world-tour` committed at `8df43ef`, exact
    `S 833/833 R 120639/120639 C 0`; strict sentinels exact. The first
    frontier `FR 101871 rn2(5)=>rn2(19)` was a general wear/occupation timing
    issue: `Gloves_on()` side effects belong after the final immobile turn tail
    and use `makeknown()`/Wisdom, not a direct Strength exercise.
  - `seed0900-tourist-explore-actions` WIP exact after explore/discovery
    startup and counted-search timing repair:
    `S 84/84 R 2983/2983 C 0`; strict sentinels exact. The first blockers
    were general discover-mode and tty/timed-occupation front doors, not
    screen-specific fixes.
  - `seed4500-knight-coverage` exact after startup/tutorial, swim-tip, and
    spellbook occupation timing repairs:
    `S 1814/1814 R 108275/108275 C 0`; strict sentinels exact; `seed0103`
    and `seed0501` guards exact.
  - Regression classification: target screen-only UI drift repaired; strict
    sentinel stable; public vs hosted remains session-file drift, not a local
    engine regression.
  - Next queue: choose the next checked-in public divergence from
    `scratch/divergence-inventory.md`; current high-signal candidates include
    early startup/mklev-or-uinit frontiers such as `seed0361`,
    `seed1150`, `seed2600`, or the post-startup role/session buckets
    (`seed0004`, `seed0006`, `seed0007`, `seed0009`, `seed0014`,
    `seed0077`, `seed0367`, `seed0373`).

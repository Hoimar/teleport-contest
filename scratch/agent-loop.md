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
- Latest committed parity repair before the current WIP: `Repair seed0900 explore startup and search timing`
  (see `git log` for the current hash). Current verified WIP targets
  `seed0361-archeologist-tour` and is pending a coherent commit.
- Last toolkit commit: `7d2f959` (`Track scratch tracing toolkit`).
- Latest verified parity repair:
  - `seed0361-archeologist-tour`: `S 366/366 R 53865/53865 C 0 OK`.
  - Strict sentinels exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
  - Implementation: Archeologist startup stats/inventory/searching,
    quest leader/nemesis role metadata, Arc fillers/goal special slices,
    quest arrival/goal pager timing, one-line top-line quest pagers, level
    teleport floor-look resumption, object-mimic memory cleanup, discovery
    and object naming rows, weapon-tool startup use, automatic searching,
    monster movement/wear front doors, and focused object/wish/insight
    coverage (`C refs: role.c:role_init(), u_init.c:Archeologist[],
    attrib.c:arc_abil[], dat/Arc-*.lua, quest.c:on_goal(),
    questpgr.c:qt_pager(), pickup.c:check_here(), display.c:display_monster(),
    objnam.c:xname_flags()/doname_base(), worn.c:m_dowear(),
    muse.c:find_defensive(), allmain.c:moveloop_core()`).
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
- `npm run parity:state -- --refresh-live` on the current verified WIP
  (rerun with escalation for leaderboard network): checked-in public
  `exact 31/44 S 8273/11405 R 539419/792838 C 1`; hosted public cache
  `exact 29/44 S 7410/10982 R 411340/840358 C 1`; class
  `public-session-drift`; strict sentinel exact. Leaderboard source
  `https://mazesofmenace.ai/leaderboard/data.json`, team Hoimar, last scored
  `2026-06-05T11:15:01.696Z`, public exact `26/44 S 8876/11405
  R 547136/792838`, held-out `points 1735/11265 passing 1/44`.
- Current non-sentinel regression classification in this WIP:
  `seed0360-wizard-world-tour` is reopened at `S 786/833 R 114869/120639`
  with the first visible frontier at screen 781; `seed4500-knight-coverage`
  is reopened at `S 801/1814 R 52780/108275` after removing the broad
  synthetic debug venom discovery row. Do not reintroduce per-debug Venoms
  rows to recover that stale public pass.
- Hack audit remains `hard=0 suspicious=45`; `memory:lint` reports
  `issues=0`. Production `js/` has no intentional debug I/O or imports from
  `frozen/`.

## Latest Loop Checkpoint

- Latest verified WIP on 2026-06-05:
  - `seed0361-archeologist-tour` exact:
    `S 366/366 R 53865/53865 C 0`.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0361-archeologist-tour` passed target, sentinels,
    `hack:audit` (`hard=0 suspicious=45`), and `memory:lint` (`issues=0`).
  - Regression classification: target exact; strict sentinel stable; current
    local checked-in corpus is lower than the previous checkpoint because
    `seed0360` is reopened by broader subsystem WIP and `seed4500` lost a
    synthetic debug-wide venom discovery row. Hosted/public/leaderboard drift
    remains session-file drift plus lagging leaderboard evidence.
  - Next queue after committing this unit: start from `seed0360` screen 781 or
    another checked-in public divergence with `npm run agent:brief -- --target
    <session>`, then triage the first mismatch from C source rather than
    restoring removed replay/debug rows.

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

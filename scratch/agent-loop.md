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
- Latest committed parity repair: `Repair seed0900 explore startup and search timing`
  (see `git log` for the current hash).
- Last toolkit commit: `7d2f959` (`Track scratch tracing toolkit`).
- Latest verified parity repair:
  - `seed0900-tourist-explore-actions`: `S 84/84 R 2983/2983 C 0 OK`.
  - Strict sentinels exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
  - Guard sessions exact: `seed0012-monk-vault-escort`,
    `seed0002-healer-reflection-drummer`,
    `seed0700-samurai-explore-descend`, and `seed8000-tourist-starter`.
  - Implementation: explore/discovery `playmode` now sets discover state,
    skips bones RNG, grants the startup wand of wishing, and queues the
    non-scoring startup notice; TTY inventory placement, known tin/wand naming,
    and eat prompt-letter compaction follow the C menu/object front doors;
    counted search timed occupations resume across pet-combat `--More--`
    boundaries; explore `^X` uses magic enlightenment without wizard-only
    numeric detail (`C refs: options.c:optfn_playmode(), bones.c:getbones(),
    u_init.c:u_init_inventory_attrs(), sys/unix/unixmain.c:wd_message(),
    win/tty/wintty.c:tty_display_nhwindow(), cmd.c:timed_occupation(),
    insight.c:doattributes()`).
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
- `npm run parity:state -- --refresh-live` on the latest verified repair:
  checked-in public `exact 33/44 S 8970/11405 R 547136/792838 C 1`;
  hosted public cache `exact 31/44 S 8208/10982 R 442485/840358 C 1`;
  class `public-session-drift`; leaderboard fetch failed; strict sentinel exact.
- `node scripts/triage-corpus.mjs --markdown scratch/divergence-inventory.md`
  regenerated local divergence state after the `seed0900` fix: `33/44`
  local sessions pass, including `seed0012`, `seed0108`, `seed0360`,
  `seed0900`, and `seed4500`.
- Hack audit remains `hard=0 suspicious=42`; `memory:lint` reports
  `issues=0`. Production `js/` has no intentional debug I/O or imports from
  `frozen/`.

## Latest Loop Checkpoint

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

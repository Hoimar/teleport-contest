# Teleport Implementation Loop

Live checkpoint only. For history, use `git log`, `git show`, `lessons.md` (avoid token-intensive full reads as explained in `AGENTS.md`'s "## Memory Routing"),
and `feature_map.md`.

## Context Rules

- Read this file fully before resuming a loop.
- Use `npm run agent:brief -- --target <target>` for targeted context.
- Search `lessons.md` and `feature_map.md`; do not full-read them by default.
- Regenerate broad corpus state with `node scripts/triage-corpus.mjs`.

## Current State

- Current branch in this workspace: `main`.
- Baseline commit before the current JS batch: `c1611df`.
- Current target: `seed2200-wizard-quaff-zap-read` has advanced from
  `S 108/230 R 2983/3018 C 5` at the help-menu frontier to full focused
  cell/RNG/cursor parity `S 230/230 R 3018/3018 C 0`.
- `seed0360-wizard-world-tour` remains a full focused/frozen pass after the
  pet-combat status-latch cleanup (`S 833/833 R 120639/120639 C 0`).
- Frozen public passes in this workspace are `seed0002`, both `seed0013`
  sessions, `seed0101`, `seed0102`, `seed0116`, `seed0360`, `seed0383`,
  `seed0398`, `seed1500`, `seed1800`, `seed2200`, `seed5002`, and `seed8000`.

## Latest Loop Checkpoint

- Target: `seed2200-wizard-quaff-zap-read`, with `seed0360` regression
  cleanup before commit.
- Current verification: `seed2200` focused `S 230/230 R 3018/3018 C 0`;
  `seed0360` focused `S 833/833 R 120639/120639 C 0`.
- Sentinel verification after the seed2200 pass and status-latch cleanup:
  total `S 1063/1063 R 64569/64569`.
- Full verification totals after this pass are `S 2975/11405 R 265367/792838`.
- Frozen public score after this pass is `14/44` passing. Exact frozen passes:
  `seed0002`, `seed0013-friday13-save-then-fullmoon-restore`,
  `seed0013-rogue-friday13-combat`, `seed0101`, `seed0102`, `seed0116`,
  `seed0360`, `seed0383`, `seed0398`, `seed1500`, `seed1800`, `seed2200`,
  `seed5002`, and `seed8000`.
- Harness checks: hack audit `hard=0 suspicious=40`; memory lint is clean.
  The sandboxed `npm run score` failed with `spawnSync ... node EPERM`; the
  frozen scorer succeeded when rerun as approved `bash frozen/score.sh`
  outside the sandbox.
- Implemented subsystem truth in this iteration:
  - Wizard legacy quest-intro pager preserves the map left of the text window,
    matching `allmain.c:newgame()`/`com_pager("legacy")`.
  - Potion oil, directionless secret-door-detection wand, magic mapping scroll,
    invalid inventory-letter gaps, and fingertip dust engraving now follow the
    relevant C front doors (`potion.c:peffect_oil()`,
    `zap.c:zapnodir()`, `read.c:seffect_magic_mapping()`,
    `invent.c:getobj()`, `engrave.c:doengrave()`).
  - Wizard mapping uses `detect.c:do_mapping()`/`show_map_spot()` behavior:
    secret corridors become corridors, dark mapped corridors stay dark, and new
    traps/objects are not invented.
  - `/` look, farlook, typed data lookup, inventory lookup, object/monster/
    engraving lists, and uppercase getpos movement now use C-shaped tty/menu
    lifecycles (`pager.c:dowhatis()`, `getpos.c:getpos()`).
  - Global `?` help now covers the help menu, local data-file pager,
    generated options/key/menu-control/support/about pages, `dowhatdoes()`,
    and the one-time Lua runtime-info shuffle from `version.c:doextversion()`.
  - Spell, discovery, and attribute menus gained the current seed2200
    non-debug Wizard details, including create monster spell rows, magic
    mapping discovery names, and non-debug insight pages.
  - `:` look-here reads dust engravings via the `engrave.c:read_engr_at()`
    shape before ordinary feature text.
  - Monster-thrown projectiles roll the `mthrowu.c:ohitmon()` hit check
    before `weapon.c:dmgval()` damage when they hit another monster.
  - Pet inventory plines that block on tty More now resume the same monster
    turn before the next command reaches `dog_goal()`/attacks
    (`C ref: dogmove.c:dog_invent()`, `dogmove.c:dog_move()`).
  - Monster-to-hero hits whose pline is deferred behind a pet-combat More
    latch the old HP on that older More frame and clear the latch when the
    deferred hit line is displayed (`C ref: mhitu.c:hitmsg()`,
    `win/tty/topl.c:more()`).
- Current frontier:
  - Seed2200 has no focused cell/RNG/cursor frontier.
- Production `js/` has no intentional debug I/O or frozen imports.
- This batch is verified but not yet committed in this checkpoint file.
- Next queue:
  - `seed0108-wizard-extcmd-wishlist` is the highest current post-startup
    near-pass (`S 173/303 R 3231/16958`, first mismatch
    `170:char:mixed:Space`, `FR 3076:rn2(36)=>rn2(8)`).
  - Otherwise pick a startup bucket from `scratch/divergence-inventory.md`
    and start with `npm run agent:brief -- --target <session>`.

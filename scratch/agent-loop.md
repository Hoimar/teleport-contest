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
- Latest verified repair unit:
  - `seed0012-monk-vault-escort`: exact
    `S 308/308 R 13878/13878 C 0`.
  - Guard `seed0006-wizard-water-demon`: exact
    `S 123/123 R 6736/6736 C 0`.
  - Guard `seed0077-rogue-chargen`: improved from
    `S 29/33 R 3242/3242 C 0` to `S 30/33 R 3242/3242 C 0`; remaining
    first mismatch is later map glyph state at screen 15.
  - Strict sentinels exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0012-monk-vault-escort` passed target expectations
    plus strict sentinels, `hack:audit` (`hard=0 suspicious=45`), and
    `memory:lint` (`issues=0`).
  - Regenerated checked-in corpus inventory after this WIP:
    `30/44 S 9236/11405 R 653981/792838 C 0`. Remaining checked-in misses:
    `seed0004`, `seed0007`, `seed0009`,
    `seed0013-rogue-friday13-combat`, `seed0014`, `seed0030`, `seed0060`,
    `seed0077`, `seed0102`, `seed0361`, `seed0367`, `seed0399`,
    `seed4500`, and `seed1500`.
  - Implementation: C-shaped manual chargen confirmation menu width, with
    `role.c:plsel_startmenu(RS_filter)` identity-line sizing and
    `win/tty/wintty.c:tty_end_menu()/tty_display_nhwindow()` right-side
    placement. Short identity lines stay at the ordinary right-side column;
    longer identity lines still expand the menu leftward.
- Scratch trace/checkpoint files are agent-toolkit state and may be committed
  when useful; keep production parity and scratch-tool commits coherent.
- Strict sentinels are exact:
  `5/5 S 1063/1063 R 64569/64569 C 0`.
- Current public classification: checked-in corpus has 30 exact local sessions;
  hosted/leaderboard state remains secondary until a reliable refresh is
  available.
- Current sentinel regression classification: none; strict sentinel is exact.
- Hack audit remains `hard=0 suspicious=45`; `memory:lint` reports
  `issues=0`. Production `js/` has no intentional debug I/O or imports from
  `frozen/`.

## Latest Loop Checkpoint

- Latest verified WIP on 2026-06-06:
  - `seed0012-monk-vault-escort`: exact
    `S 308/308 R 13878/13878 C 0`.
  - Guard `seed0006-wizard-water-demon`: exact
    `S 123/123 R 6736/6736 C 0`.
  - Guard `seed0077-rogue-chargen`: improved to
    `S 30/33 R 3242/3242 C 0`; remaining first mismatch is later map glyph
    state at screen 15.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0012-monk-vault-escort` passed target expectations
    plus strict sentinels, `hack:audit` (`hard=0 suspicious=45`), and
    `memory:lint` (`issues=0`).
  - Regenerated checked-in corpus inventory:
    `30/44 S 9236/11405 R 653981/792838 C 0`.
  - Subsystem truth: role-selection confirmation windows use
    `plsel_startmenu(RS_filter)` identity-line sizing and tty right-side menu
    placement, so short confirmation lines stay at the standard right-side
    column while longer identity lines expand left.
  - Next queue after committing this unit: choose the next checked-in public
    divergence from the current corpus state; do not chase hosted/leaderboard
    drift as local implementation truth.

- Older checkpoint history lives in git and `feature_map.md`; keep this file
  focused on the active loop state and next queue.

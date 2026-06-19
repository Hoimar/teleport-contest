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
- Latest verified repair unit: help menu/text active-state retirement.
- Checked-in public corpus is exact: `44/44 S 11405/11405 R 792838/792838 C 0`.
- Hosted public cache remains `public-session-drift` at
  `40/44 S 10417/10982 R 629747/840358 C 0`; leaderboard fetch failed.
- Scratch trace/checkpoint files are agent-toolkit state and may be committed
  when useful; keep production parity and scratch-tool commits coherent.
- Strict sentinels are exact:
  `5/5 S 1063/1063 R 64569/64569 C 0`.
- Current public classification: checked-in corpus has 44 exact local sessions;
  hosted cache differs from checked-in sessions, and leaderboard state remains
  secondary until refreshed.
- Current sentinel regression classification: none; strict sentinel is exact.
- Hack audit remains `hard=0 suspicious=11`; `memory:lint` reports
  `issues=0`. Production `js/` has no intentional debug I/O or imports from
  `frozen/`.

## Latest Loop Checkpoint

- Latest verified WIP on 2026-06-19:
  - Help menu/text override-state retirement:
    `seed4500-knight-coverage` remains exact
    (`S 1814/1814 R 108275/108275 C 0`) and covers `?` -> `e`
    nested look-at redrawing; help/about guard `seed2200` and broad
    death/help guard `seed0030` remained exact.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed4500-knight-coverage` passed target,
    strict sentinels, `hack:audit` (`hard=0 suspicious=11`), and
    `memory:lint` (`issues=0`).
  - Full corpus inventory: 44 passing sessions, checked-in public
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Dehack truth:
    - Global help menu and help text pages are active tty states rendered by
      `display.js`, not generic `_override_prev` cases.
    - The nested `?` -> `e` `dowhatis()` path still runs the full
      `erase_menu_or_text()` redraw before drawing its corner overlay.
  - Next queue: remaining hack debt is `hard=0 suspicious=11`, dominated by
    generic override-screen plumbing plus the forbidden-file replay comments.

- Previous verified WIP on 2026-06-19:
  - Spell menu override-state retirement:
    `seed0383-wizard-hallucinate` remains exact
    (`S 219/219 R 16915/16915 C 0`) and covers active spell view under
    hallucination; focused guards for cast/view menus (`seed0501`,
    `seed0116`, `seed0200`) remained exact.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0383-wizard-hallucinate` passed target,
    strict sentinels, `hack:audit` (`hard=0 suspicious=11`), and
    `memory:lint` (`issues=0`).
  - Full corpus inventory: 44 passing sessions, checked-in public
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Dehack truth:
    - `+` known-spell view and `Z` cast-spell selection are active tty states
      rendered by `display.js`, not generic `_override_prev` cases.
    - The shared serialized-screen hook preserves styled menu header spaces
      for active full-screen tty states; cast selection redraws before spell
      effects, while invalid view selectors keep the menu active.
  - Next queue: remaining hack debt is `hard=0 suspicious=11`, dominated by
    generic override-screen plumbing plus the forbidden-file replay comments.

- Previous verified WIP on 2026-06-19:
  - Startup legacy pager override-state retirement:
    `seed0103-knight-ride-pony` remains exact
    (`S 60/60 R 2640/2640 C 0`) and covers legacy pager,
    queued welcome/tutorial handoff, and tutorial invalid-selector behavior.
    Focused legacy/no-legacy guards (`seed0017`, `seed1800`, `seed0101`,
    `seed0002`, `seed8000`, `seed0116`, `seed0361`, `seed0077`,
    `seed1150`) remained exact.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0103-knight-ride-pony` passed target,
    strict sentinels, `hack:audit` (`hard=0 suspicious=11`), and
    `memory:lint` (`issues=0`).
  - Full corpus inventory: 44 passing sessions, checked-in public
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Dehack truth:
    - The configured-role legacy lore pager is now dedicated startup tty state
      rendered by `display.js`, not a generic `_override_screen`.
    - Non-dismissal keys keep that pager active while queued welcome waits;
      dismissal applies deferred startup wear/AC and requests a map redraw.
  - Next queue: remaining hack debt is `hard=0 suspicious=11`, dominated by
    generic override-screen plumbing plus the forbidden-file replay comments.

- Older checkpoint history lives in git and `feature_map.md`; keep this file
  focused on the active loop state and next queue.

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
- Latest verified repair unit: option-window active-state retirement.
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
  - Option-window override-state retirement:
    `seed4500-knight-coverage` remains exact
    (`S 1814/1814 R 108275/108275 C 0`) and covers basic options plus
    fruit prompt; focused guards `seed0006`, `seed0007`, and `seed0014`
    remained exact for basic/full options and pickup-types.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed4500-knight-coverage` passed target,
    strict sentinels, `hack:audit` (`hard=0 suspicious=11`), and
    `memory:lint` (`issues=0`).
  - Full corpus inventory: 44 passing sessions, checked-in public
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Dehack truth:
    - `O`/`m-O`, pickup-types, and option fruit prompts are active
      serialized option tty-window states rendered by `display.js`.
    - Option overlays that rebuild from the terminal grid serialize through
      the base terminal serializer so the active serialize hook cannot return
      a stale previous option screen.
  - Next queue: remaining hack debt is `hard=0 suspicious=11`, dominated by
    generic override-screen plumbing plus the forbidden-file replay comments.

- Previous verified WIP on 2026-06-19:
  - Direction/getpos help override-state retirement:
    `seed0360-wizard-world-tour` remains exact
    (`S 833/833 R 120639/120639 C 0`) and covers getpos help dismissal;
    invalid-direction sentinel `seed0002`, broad direction/getpos guard
    `seed4500`, and help/farlook guard `seed2200` remained exact.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0360-wizard-world-tour` passed target,
    strict sentinels, `hack:audit` (`hard=0 suspicious=11`), and
    `memory:lint` (`issues=0`).
  - Full corpus inventory: 44 passing sessions, checked-in public
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Dehack truth:
    - Cmdassist invalid-direction help and getpos help are active serialized
      `dmore()` screens rendered by `display.js`, not generic overrides.
    - Dismissal clears More state and redraws the map at dismissal time before
      follow-up `Never mind.` text or the restored getpos cursor prompt.
  - Next queue: remaining hack debt is `hard=0 suspicious=11`, dominated by
    generic override-screen plumbing plus the forbidden-file replay comments.

- Previous verified WIP on 2026-06-19:
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

- Older checkpoint history lives in git and `feature_map.md`; keep this file
  focused on the active loop state and next queue.

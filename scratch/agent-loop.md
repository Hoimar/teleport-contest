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
- Latest verified repair unit: terrain-window active-state retirement.
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
  - Terrain-window override-state retirement:
    `seed0106-priest-extcmd-sweep` remains exact
    (`S 267/267 R 4194/4194 C 0`) and covers terrain selector ESC
    cancellation; `seed0013-friday13-save-then-fullmoon-restore` remains
    exact (`S 99/99 R 4804/4804 C 0`) for terrain view/tip/Done paths.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0106-priest-extcmd-sweep` passed target, strict
    sentinels, `hack:audit` (`hard=0 suspicious=11`), and `memory:lint`
    (`issues=0`).
  - Full corpus inventory: 44 passing sessions, checked-in public
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Dehack truth:
    - `#terrain` selector, sanitized known-map view, and Done More frames are
      active serialized terrain-window states rendered by `display.js`.
    - Installing terrain active state clears stale generic override state, and
      selector ESC cancellation requests a map redraw before the next capture.
  - Next queue: remaining hack debt is `hard=0 suspicious=11`, dominated by
    generic override-screen plumbing plus the forbidden-file replay comments.

- Previous verified WIP on 2026-06-19:
  - Travel-tip override-state retirement:
    `seed0101-ranger-quiver-throw-travel-engrave` remains exact
    (`S 27/27 R 2371/2371 C 0`) and covers travel tip dismissal; focused
    guards `seed0013`, `seed0360`, `seed0361`, and `seed4500` remained exact
    for terrain/farlook/travel handoffs.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0101-ranger-quiver-throw-travel-engrave` passed
    target, strict sentinels, `hack:audit` (`hard=0 suspicious=11`), and
    `memory:lint` (`issues=0`).
  - Full corpus inventory: 44 passing sessions, checked-in public
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Dehack truth:
    - Shared farlook/travel/terrain getpos tips are active serialized screens
      rendered by `display.js`, not generic overrides.
    - Installing a travel tip clears stale persistent terrain-view override
      state so the active tip screen takes serializer priority.
  - Next queue: remaining hack debt is `hard=0 suspicious=11`, dominated by
    generic override-screen plumbing plus the forbidden-file replay comments.

- Previous verified WIP on 2026-06-19:
  - Look-window override-state retirement:
    `seed2200-wizard-quaff-zap-read` remains exact
    (`S 230/230 R 3018/3018 C 0`) and covers help/lookup windows;
    focused guards `seed0360`, `seed0383`, and `seed4500` remained exact
    for look/farlook/menu handoffs.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed2200-wizard-quaff-zap-read` passed target,
    strict sentinels, `hack:audit` (`hard=0 suspicious=11`), and
    `memory:lint` (`issues=0`).
  - Full corpus inventory: 44 passing sessions, checked-in public
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Dehack truth:
    - The look-at chooser and lookup data/list windows are active serialized
      look tty-window states rendered by `display.js`.
    - Dismissal is owned by explicit look state and a full tty redraw, not
      generic `_override_prev`.
  - Next queue: remaining hack debt is `hard=0 suspicious=11`, dominated by
    generic override-screen plumbing plus the forbidden-file replay comments.

- Previous verified WIP on 2026-06-19:
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

- Older checkpoint history lives in git and `feature_map.md`; keep this file
  focused on the active loop state and next queue.

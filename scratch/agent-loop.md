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
- Latest verified repair unit: intrinsic-menu active-state retirement.
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
  - Intrinsic-menu override-state retirement:
    `seed4500-knight-coverage` remains exact
    (`S 1814/1814 R 108275/108275 C 0`) and covers `#wizintrinsic`;
    hallucination guard `seed0383` remained exact.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed4500-knight-coverage` passed target, strict
    sentinels, `hack:audit` (`hard=0 suspicious=11`), and `memory:lint`
    (`issues=0`).
  - Full corpus inventory: 44 passing sessions, checked-in public
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Dehack truth:
    - `#wizintrinsic` uses active serialized intrinsic-menu state rendered by
      `display.js`; menu page/count/selection behavior stays in `_intrinsic_menu`.
    - Commit/ESC clear the active screen before the redraw or selected
      intrinsic side-effect messages.
  - Next queue: remaining hack debt is `hard=0 suspicious=11`, dominated by
    generic override-screen plumbing plus the forbidden-file replay comments.

- Previous verified WIP on 2026-06-19:
  - Disclosure-window override-state retirement:
    `seed0106-priest-extcmd-sweep` remains exact
    (`S 267/267 R 4194/4194 C 0`) for `#conduct`, `#overview`, and
    `#vanquished`; death-disclosure guards `seed0030` and `seed0006`
    remained exact.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0106-priest-extcmd-sweep` passed target, strict
    sentinels, `hack:audit` (`hard=0 suspicious=11`), and `memory:lint`
    (`issues=0`).
  - Full corpus inventory: 44 passing sessions, checked-in public
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Dehack truth:
    - `#conduct`, `#vanquished`, and `#overview` are active serialized
      disclosure-window states rendered by `display.js`.
    - Final disclosure chaining uses the active window kind instead of
      generic `_override_prev`.
  - Next queue: remaining hack debt is `hard=0 suspicious=11`, dominated by
    generic override-screen plumbing plus the forbidden-file replay comments.

- Previous verified WIP on 2026-06-19:
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

- Older checkpoint history lives in git and `feature_map.md`; keep this file
  focused on the active loop state and next queue.

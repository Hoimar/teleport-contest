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
- Latest verified repair unit: attributes-window active-state retirement.
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
  - Attributes-window override-state retirement:
    `seed0383-wizard-hallucinate` remains exact
    (`S 219/219 R 16915/16915 C 0`) and covers Hallucination-sensitive
    `^X` page dismissal; focused guards `seed0360`, `seed4500`, `seed0116`,
    and `seed0106` remained exact.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0383-wizard-hallucinate` passed target, strict
    sentinels, `hack:audit` (`hard=0 suspicious=11`), and `memory:lint`
    (`issues=0`).
  - Full corpus inventory: 44 passing sessions, checked-in public
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Dehack truth:
    - Normal `^X` attributes pages are active serialized attributes-window
      state rendered by `display.js`, not generic `_override_prev` screens.
    - Page advance, ignored page keys, and final dismissal are owned by
      explicit attributes state.
  - Next queue: remaining hack debt is `hard=0 suspicious=11`, dominated by
    generic override-screen plumbing plus the forbidden-file replay comments.

- Previous verified WIP on 2026-06-19:
  - Discovery-window override-state retirement:
    `seed0116-wizard-wear-shop` remains exact
    (`S 127/127 R 12562/12562 C 0`) and covers multi-page discoveries;
    focused guards `seed0360`, `seed0373`, `seed2200`, `seed0101`, and
    `seed0700` remained exact.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0116-wizard-wear-shop` passed target, strict
    sentinels, `hack:audit` (`hard=0 suspicious=11`), and `memory:lint`
    (`issues=0`).
  - Full corpus inventory: 44 passing sessions, checked-in public
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Dehack truth:
    - `\` discoveries pages are active serialized discovery-window state
      rendered by `display.js`, not generic `_override_prev` screens.
    - Page advance and dismissal are owned by explicit discovery state.
  - Next queue: remaining hack debt is `hard=0 suspicious=11`, dominated by
    generic override-screen plumbing plus the forbidden-file replay comments.

- Previous verified WIP on 2026-06-19:
  - Enhance-menu override-state retirement:
    `seed0107-samurai-twoweapon-enhance` remains exact
    (`S 98/98 R 2902/2902 C 0`), `seed0106-priest-extcmd-sweep`
    remains exact (`S 267/267 R 4194/4194 C 0`), and the regression
    guard `seed4500-knight-coverage` remains exact
    (`S 1814/1814 R 108275/108275 C 0`).
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed4500-knight-coverage` passed target, strict
    sentinels, `hack:audit` (`hard=0 suspicious=11`), and `memory:lint`
    (`issues=0`).
  - Full corpus inventory: 44 passing sessions, checked-in public
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Dehack truth:
    - `#enhance` skills menu is active serialized enhance-menu state rendered
      by `display.js`, not a generic `_override_prev` screen.
    - Selected skill messages print after the menu erase/redraw boundary.
  - Next queue: remaining hack debt is `hard=0 suspicious=11`, dominated by
    generic override-screen plumbing plus the forbidden-file replay comments.

- Previous verified WIP on 2026-06-19:
  - Name-menu override-state retirement:
    `seed0102-ranger-name-cancel` remains exact
    (`S 25/25 R 4485/4485 C 0`) and covers `#name` menu cancel;
    `seed0106-priest-extcmd-sweep` remained exact
    (`S 267/267 R 4194/4194 C 0`).
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0102-ranger-name-cancel` passed target, strict
    sentinels, `hack:audit` (`hard=0 suspicious=11`), and `memory:lint`
    (`issues=0`).
  - Full corpus inventory: 44 passing sessions, checked-in public
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Dehack truth:
    - `#name` target chooser is active serialized name-menu state rendered by
      `display.js`, not a generic `_override_prev` screen.
    - Selection/cancel clears the active screen before the redraw and before
      annotation or inventory naming prompts.
  - Next queue: remaining hack debt is `hard=0 suspicious=11`, dominated by
    generic override-screen plumbing plus the forbidden-file replay comments.

- Older checkpoint history lives in git and `feature_map.md`; keep this file
  focused on the active loop state and next queue.

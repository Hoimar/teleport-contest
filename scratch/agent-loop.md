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
- Latest verified repair unit: inventory action menu active-state retirement.
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
  - Inventory action menu override-state retirement:
    `seed0108-wizard-extcmd-wishlist` remains exact
    (`S 303/303 R 16958/16958 C 0`), and regression guard
    `seed5002-wizard-coverage-pair` remains exact
    (`S 410/410 R 12167/12167 C 0`).
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0108-wizard-extcmd-wishlist` passed target, strict
    sentinels, `hack:audit` (`hard=0 suspicious=11`), and `memory:lint`
    (`issues=0`).
  - Full corpus inventory: 44 passing sessions, checked-in public
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Dehack truth:
    - Context-sensitive inventory item action menus are active serialized
      inventory-action state rendered by `display.js`, not generic
      `_override_prev` screens.
    - Throw action destroys/redraws the menu before the shared direction
      prompt, matching the `select_menu(PICK_ONE)` lifecycle.
  - Next queue: remaining hack debt is `hard=0 suspicious=11`, dominated by
    generic override-screen plumbing plus the forbidden-file replay comments.
- Previous verified WIP on 2026-06-19:
  - Death disclosure inventory/attributes override-state retirement:
    `seed0030-ten-diverse-deaths` remains exact
    (`S 1953/1953 R 105529/105529 C 0`) and covers broad death disclosure;
    focused guards `seed0006`, `seed0007`, `seed0009`, and `seed0103`
    remained exact.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0030-ten-diverse-deaths` passed target, strict
    sentinels, `hack:audit` (`hard=0 suspicious=11`), and `memory:lint`
    (`issues=0`).
  - Full corpus inventory: 44 passing sessions, checked-in public
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Dehack truth:
    - End-of-game inventory disclosure and final attributes pages are active
      disclosure-window state rendered by `display.js`, not generic
      `_override_prev` screens.
    - Page/dismissal handling clears active state before the next death
      disclosure prompt or page chain.
  - Next queue: remaining hack debt is `hard=0 suspicious=11`, dominated by
    generic override-screen plumbing plus the forbidden-file replay comments.

- Previous verified WIP on 2026-06-19:
  - Wizidentify-menu override-state retirement:
    `seed4500-knight-coverage` remains exact
    (`S 1814/1814 R 108275/108275 C 0`) and covers the no-unidentified-item
    `#wizidentify` menu/end-key path.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed4500-knight-coverage` passed target, strict
    sentinels, `hack:audit` (`hard=0 suspicious=11`), and `memory:lint`
    (`issues=0`).
  - Full corpus inventory: 44 passing sessions, checked-in public
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Dehack truth:
    - `#wizidentify` is active serialized menu state rendered by
      `display.js`, not a generic `_override_prev` screen.
    - Valid selection, cancel/end keys, and invalid-key redisplay are owned
      by explicit wizidentify menu state.
  - Next queue: remaining hack debt is `hard=0 suspicious=11`, dominated by
    generic override-screen plumbing plus the forbidden-file replay comments.

- Previous verified WIP on 2026-06-19:
  - Level-teleport-menu override-state retirement:
    `seed0373-barbarian-quest-tour` remains exact
    (`S 124/124 R 35386/35386 C 0`) and covers multi-page `^V ?`
    menu cursor/selection behavior; focused guards `seed0360`, `seed4500`,
    and `seed0383` remained exact.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0373-barbarian-quest-tour` passed target, strict
    sentinels, `hack:audit` (`hard=0 suspicious=11`), and `memory:lint`
    (`issues=0`).
  - Full corpus inventory: 44 passing sessions, checked-in public
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Dehack truth:
    - Wizard `^V ?` level-teleport menus are active serialized menu state
      rendered by `display.js`, not generic `_override_prev` screens.
    - Page controls, invalid-key redisplay, cancellation, and target selection
      are owned by explicit level-teleport menu state.
  - Next queue: remaining hack debt is `hard=0 suspicious=11`, dominated by
    generic override-screen plumbing plus the forbidden-file replay comments.

- Previous verified WIP on 2026-06-19:
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

- Older checkpoint history lives in git and `feature_map.md`; keep this file
  focused on the active loop state and next queue.

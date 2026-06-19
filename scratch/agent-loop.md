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
- Latest verified repair unit: inventory prompt menu active-state retirement.
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
  - Inventory prompt menu override-state retirement:
    `seed2200-wizard-quaff-zap-read`, `seed5002-wizard-coverage-pair`,
    `seed0012-monk-vault-escort`, `seed0108-wizard-extcmd-wishlist`, and
    `seed4500-knight-coverage` remain exact.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - Full checked-in corpus passed via `bash frozen/score.sh`:
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Initial sandboxed `npm run score` failed with `spawnSync node EPERM`;
    rerunning through the approved scorer path outside the sandbox succeeded.
  - Verification also covered `node --check js/cmd.js`, `git diff --check`,
    and the focused `verify --target` guard set above.
  - Dehack truth:
    - `getobj()` inventory prompt menus for read, zap, and apply are active
      serialized inventory-prompt state rendered by `display.js`, not generic
      `_override_prev` screens.
    - `select_menu()` selection, cancellation, no-selection, and invalid-key
      ownership stay inside explicit prompt-menu state until the tty redraw
      boundary runs.
  - Next queue: remaining `showOverride()` calls are loot contents More,
    wizard dump/save terminal screens, and the generic latched-More fallback;
    hack audit remains `hard=0 suspicious=11`.

- Previous verified WIP on 2026-06-19:
  - Here-command, loot, pay, inventory, potion, throw, inventory-action,
    wizidentify, and death-disclosure menu/window overrides were retired into
    active serialized state with checked-in corpus and strict sentinels exact.
  - Full corpus inventory: 44 passing sessions, checked-in public
    `44/44 S 11405/11405 R 792838/792838 C 0`.

- Older checkpoint history lives in git and `feature_map.md`; keep this file
  focused on the active loop state and next queue.

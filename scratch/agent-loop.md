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
- Latest verified repair unit: quest/post-arrival pager More override-state retirement.
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
  - Quest/post-arrival pager More override-state retirement:
    `seed0361-archeologist-tour`, `seed0373-barbarian-quest-tour`, and
    `seed0360-wizard-world-tour` remain exact.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - Full checked-in corpus passed via `bash frozen/score.sh`:
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Verification also covered `node --check js/cmd.js`, `git diff --check`,
    and the focused `verify --target` guard set above; `seed0361`,
    `seed0373`, and `seed0360` each passed strict sentinels, hack audit, and
    memory lint through `verify-change`.
  - Dehack truth:
    - Quest leader and post-arrival pager More frames already own explicit
      latched-More state, so they no longer also install a generic serialized
      override screen.
  - Next queue: remaining serialized override users are death/tombstone/top-ten
    disclosure and the wizard bones unlink prompt; hack audit remains
    `hard=0 suspicious=11`.

- Previous verified WIP on 2026-06-19:
  - Loot contents More, terminal-exit screens, read/zap/apply inventory prompt
    menus, here-command, loot, pay, inventory, potion, throw, inventory-action,
    wizidentify, and death disclosure menu/window overrides were retired into
    active or latched state with checked-in corpus and strict sentinels exact.
  - Full corpus inventory: 44 passing sessions, checked-in public
    `44/44 S 11405/11405 R 792838/792838 C 0`.

- Older checkpoint history lives in git and `feature_map.md`; keep this file
  focused on the active loop state and next queue.

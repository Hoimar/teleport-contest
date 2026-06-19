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
- Latest verified repair unit: wizard getbones unlink prompt display-state retirement.
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
  - Wizard getbones unlink prompt display-state retirement:
    `seed5006-tourist-stress-disaster` remains exact.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - Full checked-in corpus passed via `bash frozen/score.sh`:
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Verification also covered `triage -- seed5006`,
    `screen:diff -- seed5006 --first`, `node --check js/cmd.js`,
    `node --check js/display.js`, `node --check js/allmain.js`,
    `git diff --check`, and `verify --target seed5006`.
  - Dehack truth:
    - The wizard `Unlink bones?` prompt is asked inside
      `bones.c:getbones()` after the bones level has been read but before
      `goto_level()` redraws the destination. JS keeps the previous prompt
      screen with row 0 replaced via active bones-unlink prompt state, not
      generic `_override_screen` state.
  - Next queue: remaining command-side override use is the generic fallback
    path and shared override plumbing; hack audit remains
    `hard=0 suspicious=11`.

- Previous verified WIP on 2026-06-19:
  - Death/quit final disclosure, quest/post-arrival pager More, and loot
    contents More overrides, terminal-exit screens, read/zap/apply inventory
    prompt menus, here-command, loot, pay, inventory, potion, throw,
    inventory-action, wizidentify, and death disclosure menu/window overrides
    were retired into active or latched state with checked-in corpus and strict
    sentinels exact.
  - Full corpus inventory: 44 passing sessions, checked-in public
    `44/44 S 11405/11405 R 792838/792838 C 0`.

- Older checkpoint history lives in git and `feature_map.md`; keep this file
  focused on the active loop state and next queue.

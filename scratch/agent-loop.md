# Teleport Implementation Loop

Live checkpoint only. For history, use `git log`, `git show`, `lessons.md` (avoid token-intensive full reads as explained in `AGENTS.md`'s "## Memory Routing"),
and `feature_map.md`.

## Context Rules

- Read this file fully before resuming a loop.
- Use `npm run agent:brief -- --target <target>` for targeted context.
- Search `lessons.md` and `feature_map.md`; do not full-read them by default.
- Regenerate broad corpus state with `node scripts/triage-corpus.mjs`.

## Current State

- Current branch in this workspace: `main`.
- Baseline commit before the current `seed0002` pass: `ccbf286`.
- Current target: `seed0002-healer-reflection-drummer` has advanced from
  `S 83/595 R 5690/27158` to `S 234/595 R 10750/27158`.
- Recently completed targets still full after this pass: `seed0383`,
  `seed5002`, `seed0116`, `seed0360`, and `seed8000`.
- User-requested regression queue item `seed0360-wizard-world-tour` is fixed:
  `S 833/833 R 120639/120639`, exact screens, cursors, and RNG.

## Latest Loop Checkpoint

- Target: `seed0002-healer-reflection-drummer`.
- Current verification: `S 234/595 R 10750/27158`, `FS 232:char:map:x`,
  `FR 10404:rn2(5)=1=>rn2(12)=10`, `C 4`.
- Sentinel verification after the pass: total `S 603/1063 R 43945/64569`.
  `seed8000`, `seed0116`, `seed0383`, and `seed0360` remain full passes;
  `seed0013` remains first-screen blocked with `R 588/4804`.
- Frozen public score after the seed0360 cleanup pass was `5/44` passing,
  `S 1750/11405`, `R 234644/792838`, cells `1755/11405`, cursors
  `4081/11405`; rerun full frozen scoring before handoff or after broader
  shared changes.
- Harness checks: hack audit `hard=0 suspicious=39`; memory lint is clean.
- Implemented subsystem truth in this iteration:
  - Gold pickup/look-here, heavy chain-mail pickup, burden status, delayed
    armor finish, and chain-mail AC now follow the current C-shaped inventory,
    encumbrance, and `ARM_BONUS()` evidence.
  - Remove-curse and enchant-weapon scroll effects, sink look/quaff prompts,
    two-page inventory menus, gem grouping, and `#loot`/container command flow
    are live Healer evidence rather than prompt overrides.
  - Extended command completion filters wizard-only commands: non-wizard
    `# l` can complete `loot`, while Wizard `# l` remains ambiguous because
    `levelchange` is available.
  - Pet-combat kill/death side effects and small-pet heavy-object carry
    rejection are stable through screen 234, but the current dog-position
    mismatch is not a pet-display fix.
  - Temporary tracing identified the current `FR 10404` actual `rn2(12)` as
    ordinary `m_move()` backtracking in `js/monmove.js` during chain-mail wear;
    the involved monsters were a goblin and newt before the pet moves.
- Production `js/` has no intentional debug I/O or frozen imports.
- Coherent commit pending for: `js/allmain.js`, `js/cmd.js`,
  `js/display.js`, `js/dog.js`, `js/vision.js`, `feature_map.md`,
  `lessons.md`, and this checkpoint.
- Next queue:
  - Continue `seed0002` from screen 232 / `FR 10404`, comparing C
    `monmove.c:m_move()`/`mfndpos()` candidate and `mtrack` ownership for the
    goblin/newt turn during the chain-mail wear occupation.
  - Keep `seed0360` in the sentinel queue because the user reported a local
    frozen-score regression; current focused verification is full.

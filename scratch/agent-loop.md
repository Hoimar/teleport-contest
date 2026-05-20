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
  `S 83/595 R 5690/27158` to `S 252/595 R 10968/27158`.
- Recently completed targets still full after this pass: `seed0383`,
  `seed5002`, `seed0116`, `seed0360`, and `seed8000`.
- User-requested regression queue item `seed0360-wizard-world-tour` is fixed:
  `S 833/833 R 120639/120639`, exact screens, cursors, and RNG.

## Latest Loop Checkpoint

- Target: `seed0002-healer-reflection-drummer`.
- Current verification: `S 252/595 R 10968/27158`, `FS 252:char:map:Enter`,
  `FR 10588:rn2(5)=3=>d(3,8)=11`, `C 7`.
- Sentinel verification after the pass: total `S 621/1063 R 44163/64569`.
  `seed8000`, `seed0116`, `seed0383`, and `seed0360` remain full passes;
  `seed0013` remains first-screen blocked with `R 588/4804`.
- Frozen public score after this pass is `5/44` passing. Current exact
  passes are `seed0116`, `seed0360`, `seed0383`, `seed5002`, and
  `seed8000`; the user-reported `seed0360` frozen-score regression is absent
  locally (`S 833/833 R 120639/120639`).
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
  - Ranged `AT_WEAP` monsters now run the failed ranged-selection side effect
    before delayed-occupation suppression, so `weapon_check=NEED_WEAPON`
    feeds the later close hand-weapon wielding turn.
  - Potion of confusion now prints the C message, sets timed confusion with
    `rn1(7, 16 - 8*bcsign)`, discovers via WIS, shows `Conf`, and movement
    calls `u_maybe_impaired()`. Potion of booze now consumes `d(2+uhs,8)`,
    abuses WIS, and pauses for the call-potion prompt before turn tail.
  - Current `FR 10588` is not a booze effect bug: C still has a burdened
    extra monster allocation from the preceding move before the quaff effect.
    A naive broad `u.umovement` accumulator was tested and reverted because it
    regressed seed0002 around the pickup More and seed0116 around prayer/More.
- Production `js/` has no intentional debug I/O or frozen imports.
- Coherent commit pending for: `js/allmain.js`, `js/cmd.js`,
  `js/display.js`, `js/monmove.js`, `feature_map.md`, `lessons.md`, and this
  checkpoint.
- Next queue:
  - Continue `seed0002` from screen 252 / `FR 10588`. The next structural fix
    is burdened `u.umovement` cadence integrated with delayed pickup,
    occupations, and More resume points; do not reintroduce the naive
    always-on accumulator that regressed seed0116.
  - Keep `seed0360` in the sentinel queue because the user reported a local
    frozen-score regression; current frozen verification is full.

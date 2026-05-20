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
  `S 83/595 R 5690/27158` to focused verification
  `S 281/595 R 12754/27158` (`frozen/score.sh` cells `281/595`,
  cursor-inclusive screen score `273/595`).
- Recently completed targets still full after this pass: `seed0383`,
  `seed5002`, `seed0116`, `seed0360`, and `seed8000`.
- User-requested regression queue item `seed0360-wizard-world-tour` is fixed:
  `S 833/833 R 120639/120639`, exact screens, cursors, and RNG.

## Latest Loop Checkpoint

- Target: `seed0002-healer-reflection-drummer`.
- Current verification: `S 281/595 R 12754/27158`,
  `FS 279:char:map:H`, `FR 12556:rn2(100)=92=>rn2(5)=2`, `C 8`.
- Sentinel verification after the pass: total `S 650/1063 R 45949/64569`.
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
  - Timed confusion expiry now prints `You feel less confused now.` at the
    timeout edge, and counted wait/search prefixes use a timed-repeat queue
    with burdened movement debt rather than per-step replay.
  - Hero melee damage now applies weapon `spe`, so the +1 scalpel kills the
    goblin on the C frame; `xkilled()` then runs kill-treasure, corpse chance,
    `mkcorpstat(CORPSE,...,CORPSTAT_INIT)`, initial random corpse/timer RNG,
    the no-corpse species gate, and live goblin corpse display/eating state.
  - Floor-corpse eating prompts and finish text now use the actual corpse
    species for live corpses while preserving legacy numeric gnome corpses.
  - Pet/topline handling suppresses pet inventory text from overwriting
    floor-look and rotten-food occupation messages. Projectile-sourced pet
    inventory can be deferred past the projectile frame, but once it is real
    inventory, ordinary `dog_invent()` drop gates must be allowed to drop it;
    suppressing the drop skipped the later dog-goal object scan.
  - Current `FR 12556` is after the goblin corpse/eating path; the visible
    frontier is still an ordinary monster/newt movement square one column off
    after hidden eating turns, with RNG now pointing at object state/monster
    ordering before `distfleeck()`.
- Production `js/` has no intentional debug I/O or frozen imports.
- Coherent commit pending for: `js/dog.js`, `feature_map.md`,
  `lessons.md`, and this checkpoint.
- Next queue:
  - Continue `seed0002` from cells screen 281 / `FR 12556`. The next
    structural fix is object state or monster ordering during the hidden
    goblin-corpse eating turns; current visible drift is a newt one square off
    near screen row 18.
  - Keep `seed0360` in the sentinel queue because the user reported a local
    frozen-score regression; current frozen verification is full.

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
- Latest verified repair unit: live/checked-in `seed0367` Priest quest tour
  completion.
- Checked-in public corpus is exact: `44/44 S 11405/11405 R 792838/792838 C 0`.
- Last refreshed hosted public cache is `public-session-drift` at
  `43/44 S 10662/10982 R 808652/840358 C 0`; leaderboard fetch still fails.
- Scratch trace/checkpoint files are agent-toolkit state and may be committed
  when useful; keep production parity and scratch-tool commits coherent.
- Strict sentinels are exact:
  `5/5 S 1063/1063 R 64569/64569 C 0`.
- Current public classification: checked-in corpus has 44 exact local sessions;
  hosted cache differs from checked-in sessions, and leaderboard state remains
  secondary until refreshed.
- Current sentinel regression classification: none; strict sentinel is exact.
- Hack audit remains `hard=0 suspicious=2`. Production `js/` has no intentional
  debug I/O or imports from `frozen/`.

## Latest Loop Checkpoint

- Latest verified WIP on 2026-06-19:
  - Live `.cache` `seed0367-priest-quest-tour` is exact:
    `S 309/309 R 67217/67217 C 0`, from the prior live frontier
    `S 235/309 R 20587/67217` and later `S 273/309 R 47450/67217`.
  - Checked-in `seed0367-priest-quest-tour` remains exact:
    `S 324/324 R 50125/50125 C 0`.
  - Focused guards remain exact for checked-in `seed0360`
    (`S 833/833 R 120639/120639 C 0`) and `seed0373`
    (`S 124/124 R 35386/35386 C 0`). The live cached `seed0360`
    still shows hosted/public cache drift at `S 298/618 R 102204/133910`.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - Implementation truth:
    - `dog.c:mon_arrive(With_you)` only rolls exact follower arrival when the
      hero square is not already monster-occupied; otherwise the follower takes
      the adjacent `mnexto()` path.
    - Bigroom-1 is a real Lua special slice at `(3,3)`: it loads terrain,
      optional terrain patterns, lit-region growth, stairs, objects, traps,
      random monsters, then final wallification and `mkmaze.c:fixup_special()`
      for implicit branch lregions.
    - `invent.c:look_here()` prints the dungeon-feature line before a one-object
      sentence, so arrival feature text can pack behind `You materialize...`
      even when the object sentence must wait behind `--More--`.
    - `themerms.lua` Cloud rooms create each fog cloud through the scripted
      monster path before picking its location; Massacre rooms use Lua `d(5,5)`
      as five individual `rn2(5)` dice before placing role corpses.
    - `cmd.c:do_run()/do_rush()` make `G`/`g` silent movement prefixes and
      reject non-movement follow-ups with the prefix error; `getobj("zap",
      zap_ok)` no-candidate wording is `You don't have anything to zap.`
  - Regression classification: none for checked-in sessions or strict sentinels.
    The live `seed0360` result is classified as pre-existing hosted/public cache
    drift because checked-in `seed0360` verifies exact.
  - Verification covered `node --check js/cmd.js`, focused live/checked-in
    `seed0367`, checked-in `seed0360` and `seed0373`, live cached `seed0360`
    classification, `sentinel:strict`, and verify-embedded `hack:audit` /
    `memory:lint`.
  - Full checked-in corpus remains exact via `bash frozen/score.sh`:
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Refreshed parity state classifies hosted public as `public-session-drift`:
    `43/44 S 10662/10982 R 808652/840358 C 0`; leaderboard fetch still fails.
  - Next queue: choose the next hosted-public or hidden-session mismatch.

- Previous verified WIP on 2026-06-19:
  - Live `.cache` `seed5002-wizard-coverage-pair` is exact:
    `S 297/297 R 12214/12214 C 0`, from the prior live frontier
    `S 293/297 R 12214/12214`.
  - Checked-in `seed5002-wizard-coverage-pair` remains exact:
    `S 410/410 R 12167/12167 C 0`.
  - Death-heavy guard `seed0030-ten-diverse-deaths` remains exact:
    `S 1953/1953 R 105529/105529 C 0`.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - Full checked-in corpus remains exact via `bash frozen/score.sh`:
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Implementation truth:
    - `end.c:done()` prints `Do not pass Go.  Do not collect 200 zorkmids.`
      for deaths on move 1 before wizard-mode bones/disclosure prompts.
    - Fatal fire-wand self-bounces carry the raw killer phrase and RIP lines
      from the hero as zapper, matching the current `zap.c:weffects()` /
      `zap.c:zhitu()` death path.
    - Death/quit disclosure summaries use singular `move` for one-move runs.
  - Regression classification: none; this was a hosted live screen-only repair
    with unchanged RNG, while checked-in seed5002 and death-heavy guards remain
    exact.
  - Verification covered `node --check` for `js/cmd.js` and `js/allmain.js`,
    live/checked-in `seed5002`, death guard `seed0030`, `sentinel:strict`,
    `hack:audit`, `memory:lint`, `git diff --check`, and the full checked-in
    public corpus.
  - Next queue: refresh `parity:state -- --refresh-live` after committing;
    remaining hosted-public frontiers before this repair were `seed0360` and
    `seed0367`.

- Previous seed0361, seed5002, dehack, and seed0360 completion detail is in git,
  `feature_map.md`, and `lessons.md`; keep this live checkpoint focused on
  active frontiers.

- Older checkpoint history lives in git and `feature_map.md`; keep this file
  focused on the active loop state and next queue.

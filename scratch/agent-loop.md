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
- Latest verified repair unit: live/checked-in `seed5002` first-move
  wizard-death and fire self-zap tombstone completion.
- Checked-in public corpus is exact: `44/44 S 11405/11405 R 792838/792838 C 0`.
- Last refreshed hosted public cache remained `public-session-drift` at
  `41/44 S 10584/10982 R 762022/840358 C 0` before the focused seed5002
  live-target repair; refresh after committing. Leaderboard fetch failed.
- Scratch trace/checkpoint files are agent-toolkit state and may be committed
  when useful; keep production parity and scratch-tool commits coherent.
- Strict sentinels are exact:
  `5/5 S 1063/1063 R 64569/64569 C 0`.
- Current public classification: checked-in corpus has 44 exact local sessions;
  hosted cache differs from checked-in sessions, and leaderboard state remains
  secondary until refreshed.
- Current sentinel regression classification: none; strict sentinel is exact.
- Hack audit remains `hard=0 suspicious=2`; `memory:lint` reports
  `issues=0`. Production `js/` has no intentional debug I/O or imports from
  `frozen/`.

## Latest Loop Checkpoint

- Latest verified WIP on 2026-06-19:
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

- Latest verified WIP on 2026-06-19:
  - Live `.cache` `seed0361-archeologist-tour` is exact:
    `S 294/294 R 70975/70975 C 0`.
  - Checked-in `seed0361-archeologist-tour` remains exact:
    `S 366/366 R 53865/53865 C 0`.
  - Focused guards remain exact:
    `seed0360` `S 833/833 R 120639/120639 C 0`,
    `seed0373` `S 124/124 R 35386/35386 C 0`, and
    `seed4500` `S 1814/1814 R 108275/108275 C 0`.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - Implementation truth:
    - Fort Ludios/Knox arrival now follows `do.c:goto_level()`: first entry,
      and revisits while Croesus lives, wake non-dead monsters and print the
      high-security/alarm toplines.
    - Fort Ludios status and wall color now follow `botl.c:describe_level()`
      and `display.c` Knox wall glyphs, so the status reads `Fort Ludios` and
      Knox walls render yellow.
    - Fort Ludios scripted doors now preserve existing `SDOOR` terrain like
      `sp_lev.c:sel_set_door()` instead of revealing secret doors as `DOOR`.
    - One-line post-arrival quest text now uses `questpgr.c:deliver_by_pline()`;
      it blocks only when later arrival work such as `pickup(1)/look_here()`
      cannot pack after it.
    - Scratch RNG stack tooling can now print focused `getbones()`, corridor,
      and lregion traces for live-session frontier work.
  - Regression classification: an intermediate broad one-line quest pline
    change regressed checked-in `seed0361` at screen 340; the final boundary
    fix restores both checked-in and live variants to exact parity.
  - Verification covered `node --check` for `js/cmd.js`, `js/display.js`,
    `js/mklev.js`, and scratch trace scripts; focused live/checked-in
    `seed0361` verifies; guards `seed0360`, `seed0373`, and `seed4500`
    verify; the full checked-in public corpus passes via
    `bash frozen/score.sh` (`44/44`); `sentinel:strict`, `hack:audit`,
    `memory:lint`, and `git diff --check` are clean.
  - Next queue: refresh `parity:state -- --refresh-live` after committing and
    choose the next live-public or hidden-session mismatch.

- Previous dehack and seed0360 completion detail is in git, `feature_map.md`,
  and `lessons.md`; keep this live checkpoint focused on active frontiers.

- Older checkpoint history lives in git and `feature_map.md`; keep this file
  focused on the active loop state and next queue.

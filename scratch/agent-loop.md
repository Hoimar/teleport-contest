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
- Latest verified repair unit: Juiblex named-level topology predicate cleanup.
- Checked-in public corpus is exact: `44/44 S 11405/11405 R 792838/792838 C 0`.
- Last refreshed hosted public cache is exact:
  `44/44 S 10982/10982 R 840358/840358 C 0`. It still classifies as
  `public-session-drift` because 30 hosted session files differ from
  checked-in sessions, but both score surfaces are exact.
- Leaderboard fetch still fails from all known endpoints.
- Scratch trace/checkpoint files are agent-toolkit state and may be committed
  when useful; keep production parity and scratch-tool commits coherent.
- Strict sentinels are exact:
  `5/5 S 1063/1063 R 64569/64569 C 0`.
- Current public classification: checked-in and hosted public corpora are exact;
  leaderboard state remains unknown because endpoint fetches failed.
- Current sentinel regression classification: none; strict sentinel is exact.
- Hack audit is clean: `hard=0 suspicious=0`. Production `js/` has no
  intentional debug I/O or imports from `frozen/`.

## Latest Loop Checkpoint

- Latest verified WIP on 2026-06-28:
  - Subsystem truth: `js/dungeon.js` now records `game.juiblex_level` from the
    generated special-level map, and `js/const.js:Is_juiblex_level()` compares
    `dnum/dlevel` like the other named-level helpers.
  - C refs: `dungeon.c:level_map[]`, `include/dungeon.h:Is_juiblex_level()`.
  - Direct topology sanity: generated Juiblex level `{dnum:1,dlevel:5}` returns
    true; an unrelated level returns false.
  - Target verify: `seed0360-wizard-world-tour` exact
    `S 833/833 R 120639/120639 C 0`.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - Checked-in public corpus exact:
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Cached hosted public corpus exact:
    `44/44 S 10982/10982 R 840358/840358 C 0`; still classified as
    `public-session-drift` because 30 hosted session files differ from
    checked-in sessions, with exact score delta.
  - Maintenance checks: `hack:audit` is `hard=0 suspicious=0`,
    `memory:lint ok`, regenerated divergence inventory is one passing bucket
    with no live blockers.
  - Regression classification: none. Checked-in public, hosted public, target,
    and strict sentinels are exact. Leaderboard remains unknown because
    endpoint fetches failed.
  - Global next-step check: active queue is empty; use regenerated
    divergence-inventory buckets for the next live target. Broad startup,
    role, or display TODOs need fresh failing evidence before implementation.

- Older checkpoint history lives in git, `feature_map.md`, and `lessons.md`;
  keep this file focused on the active loop state and next queue.

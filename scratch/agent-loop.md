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
- Latest verified repair unit:
  - `seed0006-wizard-water-demon`: exact
    `S 123/123 R 6736/6736 C 0`.
  - `seed0383-wizard-hallucinate`: exact
    `S 219/219 R 16915/16915 C 0`.
  - Strict sentinels exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0006-wizard-water-demon` and
    `verify --target seed0383-wizard-hallucinate` passed their target
    expectations plus strict sentinels, `hack:audit`
    (`hard=0 suspicious=45`), and `memory:lint` (`issues=0`).
  - `git diff --check` passed.
  - Latest live `parity:state -- --refresh-live`: checked-in public
    `exact 28/44 S 8851/11405 R 637095/792838 C 1`; hosted public cache
    `exact 26/44 S 7947/10982 R 503231/840358 C 1`; class
    `public-session-drift`; strict sentinel exact. Leaderboard refresh was
    unavailable because the fetch failed.
  - Implementation: startup/manual chargen edge cases, pickup type menu/current
    column/run-stop behavior, fountain water demon creation and rare wish
    branch, tame/pet and stale display repairs, monster weapon/demon attack
    sequencing, ordinary death disclosure through inventory/attributes,
    vanquished/conduct/overview/final resting place, `mvitals[].died`-style
    death accounting, and deferred `AD_COLD` side-effect packing after a
    monster hit More (`C refs: role.c:ok_role()/ok_race()/ok_gend()/ok_align(),
    fountain.c:drinkfountain()/dowaterdemon()/dryup(),
    mhitu.c:mattacku()/hitmu(), end.c:disclose(),
    insight.c:list_vanquished()/show_conduct(),
    dungeon.c:show_overview(), botl.c:botl_score(),
    win/tty/topl.c:update_topl()`).
- Scratch trace/checkpoint files are agent-toolkit state and may be committed
  when useful; keep production parity and scratch-tool commits coherent.
- Strict sentinels are exact:
  `5/5 S 1063/1063 R 64569/64569 C 0`.
- Current public classification: checked-in and hosted public corpora differ
  from the local evidence cache (`public-session-drift`). Use checked-in
  sessions for implementation truth until the hosted/leaderboard source can be
  refreshed reliably.
- Current sentinel regression classification: none; strict sentinel is exact.
- Hack audit remains `hard=0 suspicious=45`; `memory:lint` reports
  `issues=0`. Production `js/` has no intentional debug I/O or imports from
  `frozen/`.

## Latest Loop Checkpoint

- Latest verified WIP on 2026-06-06:
  - `seed0006-wizard-water-demon`: exact
    `S 123/123 R 6736/6736 C 0`.
  - `seed0383-wizard-hallucinate`: exact
    `S 219/219 R 16915/16915 C 0`.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0006-wizard-water-demon` and
    `verify --target seed0383-wizard-hallucinate` passed their target
    expectations plus strict sentinels, `hack:audit` (`hard=0 suspicious=45`),
    and `memory:lint` (`issues=0`).
  - Latest live `parity:state -- --refresh-live`: checked-in public
    `28/44 S 8851/11405 R 637095/792838 C 1`, hosted public
    `26/44 S 7947/10982 R 503231/840358 C 1`, class
    `public-session-drift`; leaderboard refresh unavailable due fetch failure.
  - Subsystem truth: fountain water demon/wish behavior, monster weapon and
    demon attack sequencing, pet/death monster accounting, death disclosure
    menus and final overview, deepest-level death score, and deferred
    `AD_COLD` physical-hit side-effect packing are live for current evidence.
  - Next queue after committing this unit: choose the next checked-in public
    divergence from the current corpus state; do not chase hosted/leaderboard
    drift as local implementation truth.

- Older checkpoint history lives in git and `feature_map.md`; keep this file
  focused on the active loop state and next queue.

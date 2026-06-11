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
  - Current WIP after commit `756eb8f` restores
    `seed0361-archeologist-tour` from `S 204/366 R 4519/53865`
    to exact `S 366/366 R 53865/53865 C 0`.
  - Strict sentinels exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0361-archeologist-tour` passed target expectations
    plus strict sentinels, `hack:audit` (`hard=0 suspicious=45`), and
    `memory:lint` (`issues=0`).
  - Local parity refresh after this WIP:
    checked-in public `38/44 S 9822/11405 R 659847/792838 C 0`;
    cached hosted public `35/44 S 8921/10982 R 525993/840358 C 0`,
    classified `public-session-drift`; leaderboard fetch failed.
  - Implementation: door kick/open force uses condensed `ACURRSTR`
    (`C ref: src/attrib.c:acurrstr()`) instead of raw encoded Strength, and
    quest-leader pager dismissal resumes the monster pass paused in
    `quest_talk()`/`chat_with_leader()`.
  - Remaining checked-in misses: `seed0004`, `seed0006`, `seed0007`,
    `seed0009`, `seed0014`, and `seed0367`.
- Previous committed repair unit:
  - Commit `756eb8f` restored `seed0012-monk-vault-escort` from WIP
    `S 254/308 R 13359/13878` to exact
    `S 308/308 R 13878/13878 C 0`.
  - Teleport-arrival guards stayed exact:
    `seed0108-wizard-extcmd-wishlist`,
    `seed0360-wizard-world-tour`, and
    `seed4500-knight-coverage`.
  - Strict sentinels exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0012-monk-vault-escort` passed target expectations
    plus strict sentinels, `hack:audit` (`hard=0 suspicious=45`), and
    `memory:lint` (`issues=0`).
  - Local parity refresh after the committed WIP:
    checked-in public `37/44 S 9660/11405 R 610501/792838 C 0`;
    cached hosted public `35/44 S 8879/10982 R 505823/840358 C 0`,
    classified `public-session-drift`; leaderboard fetch failed.
  - Implementation: `teleds()` arrival pickup lines produced by
    `spoteffects(TRUE)`/`pickup(1)` after a materialize More are normal
    top-lines and must not synthetic-acknowledge-swallow the next input key.
  - Remaining checked-in misses: `seed0004`, `seed0006`, `seed0007`,
    `seed0009`, `seed0014`, `seed0361`, and `seed0367`.
- Scratch trace/checkpoint files are agent-toolkit state and may be committed
  when useful; keep production parity and scratch-tool commits coherent.
- Strict sentinels are exact:
  `5/5 S 1063/1063 R 64569/64569 C 0`.
- Current public classification: checked-in corpus has 38 exact local sessions;
  hosted cache differs from checked-in sessions, and leaderboard state remains
  secondary until refreshed.
- Current sentinel regression classification: none; strict sentinel is exact.
- Hack audit remains `hard=0 suspicious=45`; `memory:lint` reports
  `issues=0`. Production `js/` has no intentional debug I/O or imports from
  `frozen/`.

## Latest Loop Checkpoint

- Latest verified WIP on 2026-06-11:
  - `seed0361-archeologist-tour`: exact
    `S 366/366 R 53865/53865 C 0`.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0361-archeologist-tour` passed.
  - Local parity refresh:
    checked-in public `38/44 S 9822/11405 R 659847/792838 C 0`;
    cached hosted public `35/44 S 8921/10982 R 525993/840358 C 0`.
  - Subsystem truth: door-force formulas use condensed `ACURRSTR`, and a
    quest-leader pager that interrupts monster movement must resume that same
    monster pass after dismissal.
  - Next queue: `seed0367-priest-quest-tour` has the best screen prefix among
    failing sessions; startup-drift sessions remain grouped at RNG 0.

- Previous checkpoint:
  - `seed0012-monk-vault-escort`: exact
    `S 308/308 R 13878/13878 C 0`.
  - Teleport arrival guards `seed0108`, `seed0360`, and `seed4500` exact.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0012-monk-vault-escort` passed.
  - Local parity refresh:
    checked-in public `37/44 S 9660/11405 R 610501/792838 C 0`;
    cached hosted public `35/44 S 8879/10982 R 505823/840358 C 0`.
  - Subsystem truth: arrival pickup messages after a materialize More do not
    consume the next input key; they are ordinary top-lines before the next
    command dispatch.
  - Next queue: choose among remaining checked-in misses from the regenerated
    divergence inventory; `seed0361-archeologist-tour` had the best screen
    prefix among failing sessions.

- Older checkpoint history lives in git and `feature_map.md`; keep this file
  focused on the active loop state and next queue.

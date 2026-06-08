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
  - Current WIP after commit `5e8487a` restores
    `seed0012-monk-vault-escort` from `S 254/308 R 13359/13878`
    to exact `S 308/308 R 13878/13878 C 0`.
  - Teleport-arrival guards stayed exact:
    `seed0108-wizard-extcmd-wishlist`,
    `seed0360-wizard-world-tour`, and
    `seed4500-knight-coverage`.
  - Strict sentinels exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0012-monk-vault-escort` passed target expectations
    plus strict sentinels, `hack:audit` (`hard=0 suspicious=45`), and
    `memory:lint` (`issues=0`).
  - Local parity refresh after this WIP:
    checked-in public `37/44 S 9660/11405 R 610501/792838 C 0`;
    cached hosted public `35/44 S 8879/10982 R 505823/840358 C 0`,
    classified `public-session-drift`; leaderboard fetch failed.
  - Implementation: `teleds()` arrival pickup lines produced by
    `spoteffects(TRUE)`/`pickup(1)` after a materialize More are normal
    top-lines and must not synthetic-acknowledge-swallow the next input key.
  - Remaining checked-in misses: `seed0004`, `seed0006`, `seed0007`,
    `seed0009`, `seed0014`, `seed0361`, and `seed0367`.
- Previous committed repair unit:
  - Commit `5e8487a` restored `seed0399-wizard-hallu-actions` from WIP
    `S 500/532 R 11409/11409` to exact
    `S 532/532 R 11409/11409 C 0`.
  - Guard targets stayed exact:
    `seed0030-ten-diverse-deaths`
    `S 1953/1953 R 105529/105529 C 0`,
    `seed4500-knight-coverage`
    `S 1814/1814 R 108275/108275 C 0`, and
    `seed5002-wizard-coverage-pair`
    `S 410/410 R 12167/12167 C 0`.
  - Strict sentinels exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0399-wizard-hallu-actions` and
    `verify --target seed4500-knight-coverage` passed target expectations
    plus strict sentinels, `hack:audit` (`hard=0 suspicious=45`), and
    `memory:lint` (`issues=0`).
  - Local parity refresh after the committed WIP:
    checked-in public `36/44 S 9606/11405 R 609982/792838 C 0`;
    cached hosted public `34/44 S 8825/10982 R 505304/840358 C 0`,
    classified `public-session-drift`; leaderboard fetch failed.
  - Implementation: monster physical hit/topline handling now distinguishes
    non-command pending topline overflow that defers the current attack row
    from command-result `WIN_STOP` continue-behind, and fatal status latching
    distinguishes single deferred physical hits, packed simple hit chains, and
    deferred wand/after-message prompts.
  - Remaining checked-in misses: `seed0004`, `seed0006`, `seed0007`,
    `seed0009`, `seed0012`, `seed0014`, `seed0361`, and `seed0367`.
- Scratch trace/checkpoint files are agent-toolkit state and may be committed
  when useful; keep production parity and scratch-tool commits coherent.
- Strict sentinels are exact:
  `5/5 S 1063/1063 R 64569/64569 C 0`.
- Current public classification: checked-in corpus has 37 exact local sessions;
  hosted cache differs from checked-in sessions, and leaderboard state remains
  secondary until refreshed.
- Current sentinel regression classification: none; strict sentinel is exact.
- Hack audit remains `hard=0 suspicious=45`; `memory:lint` reports
  `issues=0`. Production `js/` has no intentional debug I/O or imports from
  `frozen/`.

## Latest Loop Checkpoint

- Latest verified WIP on 2026-06-08:
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
  - Next queue: `seed0361-archeologist-tour` has the best screen prefix among
    failing sessions; `seed0367-priest-quest-tour` has an early quest/role
    mismatch; startup-drift sessions remain grouped at RNG 0.

- Previous checkpoint:
  - `seed0399-wizard-hallu-actions`: exact
    `S 532/532 R 11409/11409 C 0`.
  - Guard targets `seed0030`, `seed4500`, and `seed5002` exact.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0399-wizard-hallu-actions` and
    `verify --target seed4500-knight-coverage` passed.
  - Local parity refresh:
    checked-in public `36/44 S 9606/11405 R 609982/792838 C 0`;
    cached hosted public `34/44 S 8825/10982 R 505304/840358 C 0`.
  - Subsystem truth: fatal monster-hit status is a tty-visible-topline rule:
    single deferred hits can preserve pre-damage HP, packed simple hit chains
    show HP 0, and deferred wand/after-message prompts can preserve HP behind
    an older command More.
  - Next queue: choose among remaining checked-in misses from the regenerated
    divergence inventory; `seed0361-archeologist-tour` has the best screen
    prefix among failing sessions, while `seed0012-monk-vault-escort` has the
    strongest RNG prefix.

- Older checkpoint history lives in git and `feature_map.md`; keep this file
  focused on the active loop state and next queue.

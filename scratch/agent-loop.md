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
  - `seed0102-ranger-name-cancel`: exact
    `S 25/25 R 4485/4485 C 0`.
  - Strict sentinels exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0102-ranger-name-cancel` passed target expectations
    plus strict sentinels, `hack:audit` (`hard=0 suspicious=45`), and
    `memory:lint` (`issues=0`).
  - Standalone `sentinel:strict` is exact.
  - Local parity refresh after this WIP:
    checked-in public `37/44 S 9610/11405 R 656902/792838 C 0`;
    cached hosted public `34/44 S 8707/10982 R 523048/840358 C 0`,
    classified `public-session-drift`.
  - Implementation: fireassist swap More dismissal with ESC follows tty
    `more()`/`WIN_STOP`, skipping the queued old-weapon `prinv()` line and
    resuming the canned `dofire()` retry at the direction prompt after the
    swap turn.
  - Remaining checked-in misses: `seed0004`, `seed0006`, `seed0007`,
    `seed0009`, `seed0014`, `seed0367`, and `seed0399`.
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

- Latest verified WIP on 2026-06-06:
  - `seed0102-ranger-name-cancel`: exact
    `S 25/25 R 4485/4485 C 0`.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0102-ranger-name-cancel` passed target expectations
    plus strict sentinels, `hack:audit` (`hard=0 suspicious=45`), and
    `memory:lint` (`issues=0`).
  - Local parity refresh:
    checked-in public `37/44 S 9610/11405 R 656902/792838 C 0`;
    cached hosted public `34/44 S 8707/10982 R 523048/840358 C 0`.
  - Subsystem truth: fireassist's queued secondary-weapon feedback is subject
    to tty `WIN_STOP`; ESC at the swap More skips that line, then the canned
    `dofire()` retry prompts for direction after the swap turn if no turn-tail
    topline blocks.
  - Next queue after committing this unit: choose among the remaining
    checked-in misses, with `seed0367-priest-quest-tour` a useful next target
    because it has an early RNG mismatch after a short exact prefix.

- Older checkpoint history lives in git and `feature_map.md`; keep this file
  focused on the active loop state and next queue.

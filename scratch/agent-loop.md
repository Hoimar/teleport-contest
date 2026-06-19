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
  - `seed0014-dequa-fountain-explore` is exact:
    `S 714/714 R 59178/59178 C 0` (pre-fix baseline was exact screens/RNG
    with cursor-only mismatches at screens 383 and 647).
  - Strict sentinels exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0014-dequa-fountain-explore` passed target
    expectations, strict sentinels, `hack:audit` (`hard=0 suspicious=47`),
    and `memory:lint` (`issues=0`). Focused guards also kept
    `seed0106-priest-extcmd-sweep` and `seed0360-wizard-world-tour` exact.
  - Local parity refresh after the repair is checked-in public
    `36/44 S 9552/11405 R 604772/792838 C 0`; cached hosted public remains
    `public-session-drift` at `33/44 S 8666/10982 R 472995/840358 C 0`, and
    leaderboard fetch failed.
  - Implementation: `tty_yn_function()` prompt cursors now account for the
    invisible trailing input space wrapping onto the continuation row
    (`C ref: win/tty/topl.c:tty_yn_function()`), and `goto_level()` clears the
    cached `_` travel target so the first post-level-change getpos prompt
    starts on the hero (`C refs: src/do.c:goto_level(), src/cmd.c:dotravel()`).
  - Remaining checked-in misses after the refresh: 8 public sessions remain
    non-exact; choose the next frontier from `npm run parity:state -- --full`
    or `scratch/divergence-inventory.md` rather than from older checkpoint rows.
- Previous committed repair unit:
  - Commit `47297f2` restored `seed0361-archeologist-tour` from WIP
    `S 204/366 R 4519/53865` to exact
    `S 366/366 R 53865/53865 C 0`.
  - Strict sentinels exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0361-archeologist-tour` passed target expectations
    plus strict sentinels, `hack:audit` (`hard=0 suspicious=45`), and
    `memory:lint` (`issues=0`).
  - Local parity refresh after the committed WIP:
    checked-in public `38/44 S 9822/11405 R 659847/792838 C 0`;
    cached hosted public `35/44 S 8921/10982 R 525993/840358 C 0`,
    classified `public-session-drift`; leaderboard fetch failed.
  - Implementation: door kick/open force uses condensed `ACURRSTR`
    (`C ref: src/attrib.c:acurrstr()`) instead of raw encoded Strength, and
    quest-leader pager dismissal resumes the monster pass paused in
    `quest_talk()`/`chat_with_leader()`.
  - Remaining checked-in misses: `seed0004`, `seed0006`, `seed0007`,
    `seed0009`, `seed0014`, and `seed0367`.
- Scratch trace/checkpoint files are agent-toolkit state and may be committed
  when useful; keep production parity and scratch-tool commits coherent.
- Strict sentinels are exact:
  `5/5 S 1063/1063 R 64569/64569 C 0`.
- Current public classification: checked-in corpus has 36 exact local sessions;
  hosted cache differs from checked-in sessions, and leaderboard state remains
  secondary until refreshed.
- Current sentinel regression classification: none; strict sentinel is exact.
- Hack audit remains `hard=0 suspicious=47`; `memory:lint` reports
  `issues=0`. Production `js/` has no intentional debug I/O or imports from
  `frozen/`.

## Latest Loop Checkpoint

- Latest verified WIP on 2026-06-11:
  - `seed0367-priest-quest-tour`: advanced to
    `S 221/324 R 4951/50125 C 0`; first mismatch is now screen 203
    at the level-teleport materialize More map redraw.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0367-priest-quest-tour` passed.
  - Local parity refresh:
    checked-in public `38/44 S 9824/11405 R 659847/792838 C 0`;
    cached hosted public `35/44 S 8923/10982 R 525993/840358 C 0`.
  - Subsystem truth: invalid selectors in the `+` known-spells view do not
    dismiss the menu, and dismissal does not force a full playfield redraw.
  - Next queue: continue `seed0367-priest-quest-tour` at screen 203
    (`You materialize on a different level!--More--` map cells); startup-drift
    sessions remain grouped at RNG 0.

- Previous checkpoint:
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
  - Next queue: `seed0367-priest-quest-tour` had the best screen prefix among
    failing sessions.

- Older checkpoint history lives in git and `feature_map.md`; keep this file
  focused on the active loop state and next queue.

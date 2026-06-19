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
  - `seed0399-wizard-hallu-actions` is exact:
    `S 532/532 R 11409/11409 C 0` (pre-fix WIP baseline was
    `S 42/532 R 3979/11409 C 0`, with JS aborting a special-level
    random-monster creation after null-`enexto()` returned an occupied square).
  - Strict sentinels exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0399-wizard-hallu-actions` passed target
    expectations, strict sentinels, `hack:audit` (`hard=0 suspicious=47`),
    and `memory:lint` (`issues=0`). Focused guards also kept
    `seed0030-ten-diverse-deaths`, `seed0360-wizard-world-tour`,
    `seed0361-archeologist-tour`, `seed0373-barbarian-quest-tour`, and
    `seed0108-wizard-extcmd-wishlist` exact; `seed4500` and `seed5006`
    retained their prior non-exact frontiers.
  - Local parity refresh after the repair is checked-in public
    `42/44 S 10225/11405 R 731986/792838 C 0`; cached hosted public remains
    `public-session-drift` at `38/44 S 9237/10982 R 568895/840358 C 0`;
    leaderboard fetch failed in the live refresh.
  - Implementation: `teleport.c:enexto()` with null monster data uses a fake
    hero-type monster for `goodpos()`, so occupied special-level random
    monster coordinates relocate before `makemon(NULL, x, y)` reaches
    `rndmonst_adj()` (`C refs: teleport.c:enexto()/goodpos(),
    sp_lev.c:create_monster(), dat/bigrm-7.lua`).
  - Remaining checked-in misses after the refresh:
    `seed4500-knight-coverage` and `seed5006-tourist-stress-disaster`.
- Scratch trace/checkpoint files are agent-toolkit state and may be committed
  when useful; keep production parity and scratch-tool commits coherent.
- Strict sentinels are exact:
  `5/5 S 1063/1063 R 64569/64569 C 0`.
- Current public classification: checked-in corpus has 42 exact local sessions;
  hosted cache differs from checked-in sessions, and leaderboard state remains
  secondary until refreshed.
- Current sentinel regression classification: none; strict sentinel is exact.
- Hack audit remains `hard=0 suspicious=47`; `memory:lint` reports
  `issues=0`. Production `js/` has no intentional debug I/O or imports from
  `frozen/`.

## Latest Loop Checkpoint

- Latest verified WIP on 2026-06-19:
  - `seed0399-wizard-hallu-actions`: restored exact parity after the
    null-`enexto()` placement repair:
    `S 532/532 R 11409/11409 C 0` (pre-fix WIP baseline was
    `S 42/532 R 3979/11409 C 0`).
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0399-wizard-hallu-actions` passed target
    expectations, strict sentinels, `hack:audit` (`hard=0 suspicious=47`),
    and `memory:lint` (`issues=0`).
  - Focused guards exact: `seed0030-ten-diverse-deaths`,
    `seed0360-wizard-world-tour`, `seed0361-archeologist-tour`,
    `seed0373-barbarian-quest-tour`, and
    `seed0108-wizard-extcmd-wishlist`.
  - Non-exact frontier classification unchanged for `seed4500-knight-coverage`
    (`S 752/1814 R 52801/108275`) and
    `seed5006-tourist-stress-disaster` (`S 131/249 R 8545/13923`).
  - Local parity refresh:
    checked-in public `42/44 S 10225/11405 R 731986/792838 C 0`;
    cached hosted public `38/44 S 9237/10982 R 568895/840358 C 0`;
    hosted cache remains `public-session-drift`, leaderboard fetch failed.
  - Subsystem truth:
    - `teleport.c:enexto()` converts null `mdat` into a fake monster using
      the hero's original monster type before calling `goodpos()`.
    - Special-level random `des.monster()` relocation with `pm == NULL` must
      reject occupied squares, relocate, and then let `makemon(NULL, x, y)`
      consume `rndmonst_adj()` on the relocated square.
  - Next checked-in queue: `seed4500-knight-coverage` and
    `seed5006-tourist-stress-disaster`.

- Earlier verified WIP on 2026-06-19:
  - `seed0361-archeologist-tour`: restored exact parity after the full-screen
    quest pager redraw repair:
    `S 366/366 R 53865/53865 C 0` (pre-fix WIP baseline was
    `S 356/366 R 53865/53865 C 0`).
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0361-archeologist-tour` passed target expectations,
    strict sentinels, `hack:audit` (`hard=0 suspicious=47`), and
    `memory:lint` (`issues=0`).
  - Focused guards exact: `seed0360-wizard-world-tour`,
    `seed0373-barbarian-quest-tour`, `seed0108-wizard-extcmd-wishlist`, and
    `seed5002-wizard-coverage-pair`.
  - Local parity refresh:
    checked-in public `41/44 S 9735/11405 R 724556/792838 C 0`;
    cached hosted public `37/44 S 8747/10982 R 561465/840358 C 0`;
    hosted cache remains `public-session-drift`, leaderboard fetch failed.
  - Subsystem truth:
    - `win/tty/wintty.c:erase_menu_or_text()` redraws the playfield after
      full-screen quest text windows, so JS must run the same redraw before
      follow-up `chat_with_leader()` toplines/prompts and post-arrival
      `on_start()`/`on_goal()` continuations.
    - Generic More dismissal must also clear the latched pending-topline mode
      bit so a later full-screen latch cannot inherit stale row-0 rewriting.
  - Next checked-in queue at that point: `seed0399-wizard-hallu-actions`,
    `seed4500-knight-coverage`, and `seed5006-tourist-stress-disaster`.

- Older checkpoint history lives in git and `feature_map.md`; keep this file
  focused on the active loop state and next queue.

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
  - Startup visible-state fixture retirement:
    `seed0002-healer-reflection-drummer` remains exact
    (`S 595/595 R 27158/27158 C 0`), `seed8000-tourist-starter` remains
    exact (`S 23/23 R 3130/3130 C 0`), and checked-in public remains
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Strict sentinels exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0002-healer-reflection-drummer` passed target
    expectations, strict sentinels, `hack:audit` (`hard=0 suspicious=16`), and
    `memory:lint` (`issues=0`).
  - Focused guards exact: `seed0002-healer-reflection-drummer`,
    `seed8000-tourist-starter`, `seed0077-rogue-chargen`, and
    `seed0900-tourist-explore-actions`.
  - Full corpus inventory after the dehack: 44 passing sessions.
  - Local parity refresh after the audit/comment cleanup was checked-in public
    `44/44 S 11405/11405 R 792838/792838 C 0`; cached hosted public remains
    `public-session-drift` at `40/44 S 10417/10982 R 629747/840358 C 0`;
    leaderboard fetch failed.
  - Implementation:
    - Seed0002 and seed8000 now use the shared live startup HP/Pw/AC/attribute
      result path after `u_init_role_inventory()`/`apply_startup_role_state()`.
    - The seed gate, hardcoded Healer/Tourist visible states, and
      startup-state capture/restore fixture are deleted from `js/allmain.js`.
    - `makedog()` still observes zeroed pre-inventory attributes for
      `edog.apport`, matching C ordering.
  - Remaining checked-in public misses after the refresh: none.
- Scratch trace/checkpoint files are agent-toolkit state and may be committed
  when useful; keep production parity and scratch-tool commits coherent.
- Strict sentinels are exact:
  `5/5 S 1063/1063 R 64569/64569 C 0`.
- Current public classification: checked-in corpus has 44 exact local sessions;
  hosted cache differs from checked-in sessions, and leaderboard state remains
  secondary until refreshed.
- Current sentinel regression classification: none; strict sentinel is exact.
- Hack audit remains `hard=0 suspicious=16`; `memory:lint` reports
  `issues=0`. Production `js/` has no intentional debug I/O or imports from
  `frozen/`.

## Latest Loop Checkpoint

- Latest verified WIP on 2026-06-19:
  - Startup visible-state fixture retirement:
    `seed0002-healer-reflection-drummer` remains exact
    (`S 595/595 R 27158/27158 C 0`) and `seed8000-tourist-starter`
    remains exact (`S 23/23 R 3130/3130 C 0`).
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0002-healer-reflection-drummer` passed target,
    strict sentinels, `hack:audit` (`hard=0 suspicious=16`), and
    `memory:lint` (`issues=0`).
  - Full corpus inventory: 44 passing sessions, checked-in public
    `44/44 S 11405/11405 R 792838/792838 C 0`.
  - Local parity refresh:
    checked-in public `44/44 S 11405/11405 R 792838/792838 C 0`;
    cached hosted public `40/44 S 10417/10982 R 629747/840358 C 0`;
    hosted cache remains `public-session-drift`, leaderboard fetch failed.
  - Dehack truth:
    - Seed-backed startup should flow through generic tty askname/autopick,
      live role inventory, live startup attributes, and ordinary AC deferral.
    - No visible initial HP/Pw/AC/attribute fixture remains for seed0002 or
      seed8000; generic override-screen plumbing remains visible debt.
  - Next queue: remaining hack debt is `hard=0 suspicious=16`, dominated by
    generic override-screen plumbing plus the forbidden-file replay comments.

- Previous verified WIP on 2026-06-19:
  - `seed5006-tourist-stress-disaster`: restored exact parity:
    `S 249/249 R 13923/13923 C 0` (pre-fix checked-in frontier was
    `S 131/249 R 8545/13923 C 0`; intermediate repair reached exact screens
    with `R 11009/13923` before the fatal self-zap learning fix).
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed5006-tourist-stress-disaster` passed target
    expectations, strict sentinels, `hack:audit` (`hard=0 suspicious=46`),
    and `memory:lint` (`issues=0`).
  - Focused guards exact: `seed0014-dequa-fountain-explore`,
    `seed4500-knight-coverage`, `seed5002-wizard-coverage-pair`,
    `seed0108-wizard-extcmd-wishlist`, `seed0030-ten-diverse-deaths`,
    `seed0360-wizard-world-tour`, `seed0361-archeologist-tour`, and
    `seed0367-priest-quest-tour`.
  - Local parity refresh:
    checked-in public `44/44 S 11405/11405 R 792838/792838 C 0`;
    cached hosted public `40/44 S 10417/10982 R 629747/840358 C 0`;
    hosted cache remains `public-session-drift`, leaderboard fetch failed.
  - Subsystem truth:
    - Pet-hit kill lines that fit can pack behind the dismissed pet hit More
      and clear prompt ownership without a second More.
    - A full-map redraw requested while a tty More frame is latched is still
      pending after the latched frame renders; the redraw happens after the
      More is dismissed.
    - Fatal WAN_DEATH self-zaps do not reach `learnwand()` before `done(DIED)`
      proceeds into bones; confusion impairment is the last pre-bones RNG.
  - Next visible-public queue at that point: none from checked-in public.

- Older checkpoint history lives in git and `feature_map.md`; keep this file
  focused on the active loop state and next queue.

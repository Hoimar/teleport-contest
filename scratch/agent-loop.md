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
  - `seed0009-swimmer-mforce` is exact:
    `S 73/73 R 3713/3713 C 0` (pre-fix baseline was
    `S 36/73 R 3713/3713 C 0`, one Tutorial secret-door glyph orientation
    mismatch repeated through later frames).
  - Strict sentinels exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0009-swimmer-mforce` passed target
    expectations, strict sentinels, `hack:audit` (`hard=0 suspicious=47`),
    and `memory:lint` (`issues=0`). Focused guards also kept
    `seed0014-dequa-fountain-explore`, `seed0360-wizard-world-tour`, and
    `seed2600-wizard-custom-binds` exact.
  - Local parity refresh after the repair is checked-in public
    `38/44 S 9590/11405 R 604772/792838 C 0`; cached hosted public remains
    `public-session-drift` at `35/44 S 8704/10982 R 472995/840358 C 0`;
    leaderboard was skipped in the full local scan.
  - Implementation: Tutorial `des.map()` secret doors run C's neighbor
    orientation pass after all terrain exists, so hidden `S` cells render as
    the correct wall direction (`C refs: src/sp_lev.c:set_door_orientation(),
    dat/tut-1.lua`).
  - Remaining checked-in misses after the refresh: 6 public sessions remain
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
- Current public classification: checked-in corpus has 38 exact local sessions;
  hosted cache differs from checked-in sessions, and leaderboard state remains
  secondary until refreshed.
- Current sentinel regression classification: none; strict sentinel is exact.
- Hack audit remains `hard=0 suspicious=47`; `memory:lint` reports
  `issues=0`. Production `js/` has no intentional debug I/O or imports from
  `frozen/`.

## Latest Loop Checkpoint

- Latest verified WIP on 2026-06-19:
  - `seed0030-ten-diverse-deaths`: restored exact parity after the current
    WIP batch:
    `S 1953/1953 R 105529/105529 C 0`.
  - `seed0014-dequa-fountain-explore` remains exact after startup discovery
    repair:
    `S 714/714 R 59178/59178 C 0`.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0030-ten-diverse-deaths` and
    `verify --target seed0014-dequa-fountain-explore` passed target
    expectations, strict sentinels, `hack:audit` (`hard=0 suspicious=47`),
    and `memory:lint` (`issues=0`).
  - Focused guards exact: `seed0009-swimmer-mforce`,
    `seed0106-priest-extcmd-sweep`, `seed5002-wizard-coverage-pair`,
    `seed0060-orc-rogue-kick-search`, and
    `seed0367-priest-quest-tour`.
  - Subsystem truth:
    - `monmove.c:m_search_items()` may let monsters pick up rocks, but rocks
      are skipped as movement goals.
    - `steal.c:mdrop_obj()` / `objnam.c:distant_name()` on nearby visible
      drops applies `observe_object()`-style dknown/encountered side effects,
      not armor type discovery.
    - `hack.c:moverock_core()` clears remembered invisible glyphs at a pushed
      boulder's destination before `movobj()` redraws it.
    - `u_init.c:u_init_role()` gives Valkyries `knows_class(ARMOR_CLASS)`,
      and `u_init.c:u_init_race()` pre-knows dwarvish objects for dwarves.
    - During an adjacent tame-pet kill with a blocking edible-corpse kill More,
      the C display focus can show the pet on the defender square while model
      movement/eating resumes only after the More.
  - Next queue after commit: run `parity:state -- --refresh-live` and pick the
    next checked-in divergence from the refreshed inventory.

- Previous checkpoint:
  - `seed0009-swimmer-mforce`: exact
    `S 73/73 R 3713/3713 C 0`.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0009-swimmer-mforce` passed.
  - Local parity refresh:
    checked-in public `38/44 S 9590/11405 R 604772/792838 C 0`;
    cached hosted public `35/44 S 8704/10982 R 472995/840358 C 0`.
  - Subsystem truth: Tutorial secret doors orient from neighboring terrain
    after `des.map()` terrain is installed.

- Older checkpoint history lives in git and `feature_map.md`; keep this file
  focused on the active loop state and next queue.

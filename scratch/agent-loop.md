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
  - `seed0077-rogue-chargen`: exact
    `S 33/33 R 3242/3242 C 0`.
  - Rogue guards remain exact:
    `seed0013-rogue-friday13-combat`
    (`S 59/59 R 4838/4838 C 0`),
    `seed0060-orc-rogue-kick-search`
    (`S 41/41 R 3626/3626 C 0`), and
    `seed1500-rogue-explore-move`
    (`S 40/40 R 2768/2768 C 0`).
  - Corpus regeneration also cleared `seed0361-archeologist-tour`
    (`S 366/366 R 53865/53865 C 0`).
  - Strict sentinels exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0077-rogue-chargen` passed target expectations
    plus strict sentinels, `hack:audit` (`hard=0 suspicious=45`), and
    `memory:lint` (`issues=0`).
  - Regenerated checked-in corpus inventory after this WIP:
    `35/44 S 9642/11405 R 653981/792838 C 0`. Remaining checked-in misses:
    `seed0004`, `seed0007`, `seed0009`, `seed0014`, `seed0030`,
    `seed0102`, `seed0367`, `seed0399`, and `seed4500`.
  - Implementation: Rogue startup calls the `knows_object(SACK)`-equivalent
    type discovery, plain sack fallback consults shared discovery rather than
    only per-object `knownName`, and visible pet/monster pickup names use the
    `distant_name(..., doname)`-shaped table-name path for no-description or
    known object types.
- Scratch trace/checkpoint files are agent-toolkit state and may be committed
  when useful; keep production parity and scratch-tool commits coherent.
- Strict sentinels are exact:
  `5/5 S 1063/1063 R 64569/64569 C 0`.
- Current public classification: checked-in corpus has 35 exact local sessions;
  hosted/leaderboard state remains secondary until a reliable refresh is
  available.
- Current sentinel regression classification: none; strict sentinel is exact.
- Hack audit remains `hard=0 suspicious=45`; `memory:lint` reports
  `issues=0`. Production `js/` has no intentional debug I/O or imports from
  `frozen/`.

## Latest Loop Checkpoint

- Latest verified WIP on 2026-06-06:
  - `seed0077-rogue-chargen`: exact
    `S 33/33 R 3242/3242 C 0`.
  - Guards `seed0013`, `seed0060`, and `seed1500` remain exact; corpus
    regeneration also reports `seed0361-archeologist-tour` exact.
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0077-rogue-chargen` passed target expectations
    plus strict sentinels, `hack:audit` (`hard=0 suspicious=45`), and
    `memory:lint` (`issues=0`).
  - Regenerated checked-in corpus inventory:
    `35/44 S 9642/11405 R 653981/792838 C 0`.
  - Subsystem truth: Rogue `u_init_role()` marks `SACK` known; known/discovered
    plain sacks print as `sack` while undiscovered plain sacks still print as
    `bag`, and pet/monster pickup lines use `distant_name(..., doname)` naming
    for no-description or known object types.
  - Next queue after committing this unit: classify the `seed4500` non-sentinel
    regression first, because it was exact in recent memory and now appears in
    the remaining checked-in misses.

- Older checkpoint history lives in git and `feature_map.md`; keep this file
  focused on the active loop state and next queue.

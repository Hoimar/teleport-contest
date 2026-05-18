# Teleport Implementation Loop

Live checkpoint only. For history, use `git log`, `git show`, `lessons.md` (avoid token-intensive full reads as explained in `AGENTS.md`'s "## Memory Routing"),
and `feature_map.md`.

## Context Rules

- Read this file fully before resuming a loop.
- Use `npm run agent:brief -- --target <target>` for targeted context.
- Search `lessons.md` and `feature_map.md`; do not full-read them by default.
- Regenerate broad corpus state with `node scripts/triage-corpus.mjs`.

## Current State

- Current branch in this workspace: `main`.
- Baseline commit before this pass: `0fc7dd3`.
- Active target: `seed0360-wizard-world-tour`.
- Active hypothesis: Orcus now loads as a special level; the remaining
  seed0360 blocker is late Orcus companion monster initialization.

## Latest Loop Checkpoint

- Target: `seed0360-wizard-world-tour`.
- Current verification: `S 318/833 R 79328/120639`,
  `FS 290:char:map:h`, `FR 79278:rn2(4)=0=>rn2(75)=37`, `C 1`.
- Sentinel verification: total `S 429/1063 R 38854/64569`; seed8000 and
  seed0116 pass; seed0002/seed0013/seed0383 unchanged from the prior failing
  sentinel baselines.
- Clean-end full verification: `S 1183/11405 R 189639/792838`; hack audit
  `hard=0 suspicious=37`; memory lint clean.
- Implemented subsystem truth in this iteration:
  - `newmonhp()` now returns C's stored monster level as well as HP, so
    fixed-HP high-`mlevel` monsters use `mhp / 4` for later `m_initinv()`
    defensive/misc gates.
  - Lua string monster creation now distinguishes gendered names such as
    `"vampire lord"` from ungendered species names for the `find_montype()`
    random gender front door.
  - Coherent commit pending for this iteration; `feature_map.md` and
    `lessons.md` updated for the changed truth.
- Current trace split:
  - C and JS now match through Orcus fixed monsters and the first random
    vampire lord placement up to RNG index `79277`.
  - New split: C enters `m_initweap()` for the level-18 vampire lord with
    `rn2(4)=0`; JS emits `rn2(75)=37`, consistent with missing or misordered
    vampire lord weapon initialization before the offensive-item gate.
  - First visible mismatch is still screen `290:char:map:h`, rows
    `5,6,7,8,12,13+6`; cursor remains OK.
  - Production `js/` has no debug I/O or frozen imports.
- Remaining hypothesis: the next pass should identify why JS performs an extra
  coordinate-selection loop before the next special's `nhlib` shuffle, using the
  current trace window `76617..76624` and local C refs in `allmain.c`,
  `bones.c`, `mklev.c`, `mkmaze.c`, and the next target special's Lua loader.

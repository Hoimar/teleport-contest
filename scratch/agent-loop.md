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
- Baseline commit before the current Priest JS batch: `c00d1cd`.
- Current completed target: `seed5002-wizard-coverage-pair` is restored to
  full focused parity `S 410/410 R 12167/12167 C 0`.
- `seed0105-valk-chat-lamp-ration`,
  `seed0015-valk-level2-pit-dog-wait`, `seed0360-wizard-world-tour`,
  `seed0107-samurai-twoweapon-enhance`, `seed0108-wizard-extcmd-wishlist`,
  `seed0501-priest-cast-read-turn`, `seed5002-wizard-coverage-pair`,
  and the standing sentinel set remain full focused passes after the Priest
  startup/extcmd/combat batch and the seed5002 More-boundary restoration.
- Frozen public passes in this workspace are `seed0002`, both `seed0013`
  sessions, `seed0015`, `seed0101`, `seed0102`, `seed0105`, `seed0106`,
  `seed0107`, `seed0108`, `seed0116`, `seed0360`, `seed0383`, `seed0398`,
  `seed0501`, `seed1500`, `seed1800`, `seed2200`, `seed5002`, and
  `seed8000`. Local full verification/corpus state has 20 passing sessions.

## Latest Loop Checkpoint

- Target: `seed5002-wizard-coverage-pair`.
- Current verification: focused target `S 410/410 R 12167/12167 C 0`.
- Sentinel verification after the seed5002 restoration: total
  `S 1063/1063 R 64569/64569`.
- Full verification totals after this pass are `S 3576/11405 R 296698/792838`.
- Local corpus inventory now reports 20 passing sessions out of 44.
- Harness checks: hack audit `hard=0 suspicious=40`; memory lint is clean.
- Implemented subsystem truth in this iteration:
  - Deferred pet-combat return-hit text with pending defender death snapshots
    the pre-clear More latch, queues its own `--More--`, and applies
    `monkilled()`/`corpse_chance()`/`grow_up()` only after that More is
    dismissed (`C refs: mhitm.c:mattackm()`, `mon.c:monkilled()`,
    `win/tty/topl.c:more()`).
- Current frontier:
  - Seed5002 has no focused cell/RNG/cursor frontier.
- Production `js/` has no intentional debug I/O or frozen imports.
- This batch is verified and ready to commit; `scratch/divergence-inventory.md`
  was intentionally refreshed after the seed5002 restoration.
- Next queue:
  - After committing the seed5002 batch, consider
    `seed0700-samurai-explore-descend` as a narrow screen-only frontier
    (`S 1/51 R 3230/3230`), then re-check the generated divergence inventory.

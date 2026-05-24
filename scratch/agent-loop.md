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
- Current completed target: `seed0700-samurai-explore-descend` has full
  focused parity `S 51/51 R 3230/3230 C 0`.
- `seed0105-valk-chat-lamp-ration`,
  `seed0015-valk-level2-pit-dog-wait`, `seed0360-wizard-world-tour`,
  `seed0107-samurai-twoweapon-enhance`, `seed0108-wizard-extcmd-wishlist`,
  `seed0501-priest-cast-read-turn`, `seed0700-samurai-explore-descend`,
  `seed5002-wizard-coverage-pair`, and the standing sentinel set remain full
  focused passes after the Priest startup/extcmd/combat batch, the seed5002
  More-boundary restoration, and the seed0700 Samurai display/pet/insight pass.
- Frozen public passes in this workspace are `seed0002`, both `seed0013`
  sessions, `seed0015`, `seed0101`, `seed0102`, `seed0105`, `seed0106`,
  `seed0107`, `seed0108`, `seed0116`, `seed0360`, `seed0383`, `seed0398`,
  `seed0501`, `seed0700`, `seed1500`, `seed1800`, `seed2200`, `seed5002`,
  and `seed8000`. Local full verification/corpus state has 21 passing sessions.

## Latest Loop Checkpoint

- Target: `seed0700-samurai-explore-descend`.
- Current verification: focused target `S 51/51 R 3230/3230 C 0`.
- Sentinel verification after the seed0700 pass: total
  `S 1063/1063 R 64569/64569`.
- Full verification totals after this pass are `S 3626/11405 R 296698/792838`.
- Local corpus inventory now reports 21 passing sessions out of 44.
- Harness checks: hack audit `hard=0 suspicious=40`; memory lint is clean.
- Implemented subsystem truth in this iteration:
  - Status and `^X` attributes format C exceptional Strength values instead
    of raw JS numbers (`C refs: botl.c:get_strength_str()`,
    `insight.c:attrval()`, `attrib.c:acurr()`).
  - `makedog()` honors configured pet names and role-default little-dog names,
    so Samurai's default pet is `Hachi`; named pet swap/pet messages suppress
    `your`/`the` like `x_monnam()` (`C refs: dog.c:makedog()`,
    `do_name.c:x_monnam()`).
  - Samurai `^X` reports wielded katana by the long-sword skill class and
    basic startup skill (`C refs: insight.c:attributes_enlightenment()`,
    `weapon.c:skill_init()`).
- Current frontier:
  - Seed0700 has no focused cell/RNG/cursor frontier.
- Production `js/` has no intentional debug I/O or frozen imports.
- This batch is verified and ready to commit; `scratch/divergence-inventory.md`
  was intentionally refreshed after the seed0700 pass.
- Next queue:
  - After committing the seed0700 batch, consider
    `seed0017-samurai-altar-pray` (`S 1/67 R 3309/3465`) as a nearby
    Samurai late-startup frontier, or status/RNG late-startup candidates
    `seed0016-healer-newmoon-eat-zap` and `seed0060-orc-rogue-kick-search`.

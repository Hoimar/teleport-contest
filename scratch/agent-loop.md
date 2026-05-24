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
- Current completed target: `seed0017-samurai-altar-pray` has full
  focused parity `S 67/67 R 3465/3465 C 0`.
- `seed0105-valk-chat-lamp-ration`,
  `seed0015-valk-level2-pit-dog-wait`, `seed0360-wizard-world-tour`,
  `seed0107-samurai-twoweapon-enhance`, `seed0108-wizard-extcmd-wishlist`,
  `seed0501-priest-cast-read-turn`, `seed0700-samurai-explore-descend`,
  `seed0017-samurai-altar-pray`, `seed5002-wizard-coverage-pair`, and the
  standing sentinel set remain full focused passes after the Priest
  startup/extcmd/combat batch, the seed5002 More-boundary restoration, and
  the Samurai startup/display/pet/insight passes.
- Frozen public passes in this workspace are `seed0002`, both `seed0013`
  sessions, `seed0015`, `seed0101`, `seed0102`, `seed0105`, `seed0106`,
  `seed0107`, `seed0108`, `seed0116`, `seed0360`, `seed0383`, `seed0398`,
  `seed0501`, `seed0700`, `seed1500`, `seed1800`, `seed2200`, `seed5002`,
  `seed8000`, and `seed0017`. Local full verification/corpus state has 22
  passing sessions.

## Latest Loop Checkpoint

- Target: `seed0017-samurai-altar-pray`.
- Current verification: focused target `S 67/67 R 3465/3465 C 0`.
- Sentinel verification after the seed0017 pass: total
  `S 1063/1063 R 64569/64569`.
- Full verification totals after this pass are `S 3692/11405 R 296988/792838`.
- Local corpus inventory now reports 22 passing sessions out of 44.
- Harness checks: hack audit `hard=0 suspicious=41`; memory lint is clean.
- Implemented subsystem truth in this iteration:
  - configured no-name starts still run the tty askname prompt before
    startup RNG (`C refs: src/role.c:plnamesuffix()`,
    `win/tty/wintty.c:tty_askname()`);
  - role `initrecord` initializes alignment record and affects prayer
    anger (`C refs: src/attrib.c:newhp()`, `include/you.h:Role`);
  - legacy pager dismissal does not by itself force a welcome `--More--`
    when tutorial/preamble do not follow (`C refs: src/allmain.c:welcome()`,
    `src/options.c:ask_do_tutorial()`);
  - intrinsically-fast ordinary prayers need the extra movement allocation
    before `prayer_done()` (`C refs: src/pray.c:dopray()`,
    `src/allmain.c:u_calc_moveamt()`);
  - `^X` autopickup text uses `pickup_types` and `pickup_thrown`
    (`C ref: src/insight.c:attributes_enlightenment()`).
- Production `js/` has no intentional debug I/O or frozen imports.
- This batch is verified and ready to commit; `scratch/divergence-inventory.md`
  was intentionally refreshed after the seed0017 pass.
- Next queue:
  - After committing the seed0017 batch, consider late-startup status/RNG
    candidates `seed0016-healer-newmoon-eat-zap`,
    `seed0060-orc-rogue-kick-search`, or `seed0030-ten-diverse-deaths`.

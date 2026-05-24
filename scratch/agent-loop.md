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
- Current completed target: `seed0106-priest-extcmd-sweep` advanced to
  full focused/frozen parity `S 267/267 R 4194/4194 C 0`.
- `seed0105-valk-chat-lamp-ration`,
  `seed0015-valk-level2-pit-dog-wait`, `seed0360-wizard-world-tour`,
  `seed0107-samurai-twoweapon-enhance`, `seed0108-wizard-extcmd-wishlist`,
  and the standing sentinel set remain full focused passes after the Priest
  startup/extcmd/combat batch.
- Frozen public passes in this workspace are `seed0002`, both `seed0013`
  sessions, `seed0015`, `seed0101`, `seed0102`, `seed0105`, `seed0106`,
  `seed0108`, `seed0116`, `seed0360`, `seed0383`, `seed0398`, `seed1500`,
  `seed1800`, `seed2200`, `seed5002`, and `seed8000`. The frozen public
  scorer has not been re-run after the seed0106 implementation.

## Latest Loop Checkpoint

- Target: `seed0106-priest-extcmd-sweep`.
- Current verification: focused target `S 267/267 R 4194/4194 C 0`.
- Sentinel verification after the seed0106 pass: total
  `S 1063/1063 R 64569/64569`.
- Full verification totals after this pass are `S 3468/11405 R 296425/792838`.
- Frozen public score after the previous seed0105 pass was `17/44` passing;
  re-run it after committing if current public-pass evidence is needed.
- Harness checks: hack audit `hard=0 suspicious=40`; memory lint is clean.
- Implemented subsystem truth in this iteration:
  - Priest startup now copies a random pantheon, uses role-driven
    attributes/HP/Pw/AC, creates the mace/robe/shield/water/garlic/wolfsbane
    and random spellbooks, teaches starting spells, and applies Priest object
    naming/spell/insight rules (`C refs: role.c:role_init()`,
    `u_init.c:Priest[]`, `spell.c:initialspell()`,
    `objnam.c:doname_base()`, `spell.c:percent_success()`,
    `insight.c:one_characteristic()`).
  - Priest command evidence now covers ordinary prayer/angry-gods, `#chat`,
    `#dip`, `#offer`, `#enhance`, `#chronicle`, `#conduct`, `#overview`,
    `#terrain`, `#vanquished`, `#genocided`, `#adjust`, inventory, spell,
    discovery, and attribute menu/prompt cursor behavior (`C refs:
    pray.c:dopray()`, `pray.c:angrygods()`, `sounds.c:dochat()`,
    `potion.c:dodip()`, `fountain.c:dipfountain()`, `cmd.c:doterrain()`).
  - Monster-thrown darts now model multishot stack splitting, `next_ident()`,
    catch/hit/damage/drop/break behavior, and projectile-only exclusion from
    HTH weapon selection; hero-killed monsters drop minvent before corpse/loot
    (`C refs: mthrowu.c:monmulti()`, `mthrowu.c:thrwmu()`,
    `weapon.c:select_hwep()`, `mon.c:m_detach()`).
- Current frontier:
  - Seed0106 has no focused cell/RNG/cursor frontier.
- Production `js/` has no intentional debug I/O or frozen imports.
- This batch is verified and ready to commit; do not stage
  `scratch/divergence-inventory.md` unless intentionally refreshing corpus
  inventory.
- Next queue:
  - After committing the seed0106 batch, choose the next narrow public target
    with `npm run agent:brief -- --target <target>` and `npm run triage -- <target>`.

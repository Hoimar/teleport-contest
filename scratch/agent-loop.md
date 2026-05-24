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
- Current completed target: `seed0501-priest-cast-read-turn` advanced to
  full focused/frozen parity `S 28/28 R 2238/2238 C 0`.
- `seed0105-valk-chat-lamp-ration`,
  `seed0015-valk-level2-pit-dog-wait`, `seed0360-wizard-world-tour`,
  `seed0107-samurai-twoweapon-enhance`, `seed0108-wizard-extcmd-wishlist`,
  and the standing sentinel set remain full focused passes after the Priest
  startup/extcmd/combat batch.
- Frozen public passes in this workspace are `seed0002`, both `seed0013`
  sessions, `seed0015`, `seed0101`, `seed0102`, `seed0105`, `seed0106`,
  `seed0108`, `seed0116`, `seed0360`, `seed0383`, `seed0398`, `seed0501`, `seed1500`,
  `seed1800`, `seed2200`, `seed5002`, and `seed8000`. The frozen public
  scorer has not been re-run after the seed0106 implementation.

## Latest Loop Checkpoint

- Target: `seed0501-priest-cast-read-turn`.
- Current verification: focused target `S 28/28 R 2238/2238 C 0`.
- Sentinel verification after the seed0501 pass: total
  `S 1063/1063 R 64569/64569`.
- Full verification totals after this pass are `S 3495/11405 R 296421/792838`.
- Frozen public score after the previous seed0105 pass was `17/44` passing;
  re-run it after committing if current public-pass evidence is needed.
- Harness checks: hack audit `hard=0 suspicious=40`; memory lint is clean.
- Implemented subsystem truth in this iteration:
  - Priest random starting spellbooks now reject restricted spell disciplines
    in `ini_inv_mkobj_filter()` using the Priest skill list, so rejected
    enchantment/matter/attack books still consume their ordinary object RNG
    before allowed healing/divination/clerical books are accepted (`C refs:
    u_init.c:ini_inv_mkobj_filter()`, `u_init.c:restricted_spell_discipline()`,
    `u_init.c:Skill_P[]`).
  - `Z` now opens the cast-spell tty menu, selection consumes the
    `spelleffects_check()` success roll, spends power, exercises Wisdom,
    creates the pseudo spell object, and prompts for direction. Current
    Priest evidence includes self-cast healing through `zapyourself()` and the
    known-spellbook reread More/refresh prompt chain (`C refs:
    spell.c:docast()`, `spell.c:spelleffects_check()`,
    `zap.c:zapyourself()`, `spell.c:study_book()`).
- Current frontier:
  - Seed0501 has no focused cell/RNG/cursor frontier.
- Production `js/` has no intentional debug I/O or frozen imports.
- This batch is verified and ready to commit; do not stage
  `scratch/divergence-inventory.md` unless intentionally refreshing corpus
  inventory.
- Next queue:
  - After committing the seed0501 batch, choose the next narrow public target
    with `npm run agent:brief -- --target <target>` and `npm run triage -- <target>`.

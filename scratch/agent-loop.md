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
- Baseline commit before the current JS batch: `ae8a4ed`.
- Current completed target: `seed0107-samurai-twoweapon-enhance` advanced to
  full focused/frozen parity `S 98/98 R 2902/2902 C 0`.
- `seed0105-valk-chat-lamp-ration`,
  `seed0015-valk-level2-pit-dog-wait`, `seed0360-wizard-world-tour`,
  `seed0108-wizard-extcmd-wishlist`, and the standing sentinel set remain full
  focused passes after the Samurai startup/two-weapon batch.
- Frozen public passes in this workspace are `seed0002`, both `seed0013`
  sessions, `seed0015`, `seed0101`, `seed0102`, `seed0105`, `seed0108`,
  `seed0116`, `seed0360`, `seed0383`, `seed0398`, `seed1500`, `seed1800`,
  `seed2200`, `seed5002`, and `seed8000`. The frozen public scorer has not
  been re-run after the seed0107 implementation.

## Latest Loop Checkpoint

- Target: `seed0107-samurai-twoweapon-enhance`.
- Current verification: focused target `S 98/98 R 2902/2902 C 0`.
- Sentinel verification after the seed0107 pass: total
  `S 1063/1063 R 64569/64569`.
- Full verification totals after this pass are `S 3279/11405 R 290458/792838`.
- Frozen public score after the previous seed0105 pass was `17/44` passing;
  re-run it after committing if current public-pass evidence is needed.
- Harness checks: hack audit `hard=0 suspicious=40`; memory lint is clean.
- Implemented subsystem truth in this iteration:
  - Samurai startup now uses role-driven attributes/HP/Pw/AC, starting
    katana/wakizashi/yumi/ya/lacquered splint mail, preknown
    weapon/armor/food-ration discoveries, and level-1 intrinsic Fast
    (`C refs: role.c:roles[]`, `u_init.c:Samurai[]`,
    `u_init.c:u_init_role()`, `attrib.c:sam_abil[]`,
    `allmain.c:u_calc_moveamt()`).
  - Legacy open-door glyph orientation now follows `back_to_glyph()`/`defsym.h`
    in live and premap display (`rm.horizontal` draws `|`, non-horizontal draws
    `-`; DECgraphics remains checkerboard).
  - Samurai-facing command evidence now covers `#twoweapon`, two-weapon melee
    front-door to-hit/secondary-swing behavior, `#enhance`, `#sit`, Japanese
    object names, quivered bow ammo wording, and two-weapon insight text
    (`C refs: wield.c:dotwoweapon()`, `uhitm.c:find_roll_to_hit()`,
    `weapon.c:weapon_hit_bonus()`, `u_init.c:Skill_S[]`,
    `sit.c:dosit()`, `objnam.c:Japanese_item_name()`).
- Current frontier:
  - Seed0107 has no focused cell/RNG/cursor frontier.
- Production `js/` has no intentional debug I/O or frozen imports.
- This batch is verified and ready to commit; do not stage
  `scratch/divergence-inventory.md` unless intentionally refreshing corpus
  inventory.
- Next queue:
  - Start `seed0106-priest-extcmd-sweep` with
    `npm run agent:brief -- --target seed0106-priest-extcmd-sweep`, then triage
    the first mismatch.

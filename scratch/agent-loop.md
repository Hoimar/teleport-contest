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
- Baseline commit before the current JS batch: `c1611df`.
- Current completed target: `seed0015-valk-level2-pit-dog-wait` advanced from
  `S 0/44 R 391/8563 C 0` to full focused/frozen parity
  `S 44/44 R 8563/8563 C 0`.
- `seed0360-wizard-world-tour`, `seed0108-wizard-extcmd-wishlist`, and the
  standing sentinel set remain full focused passes after the Valkyrie/pit
  batch.
- Frozen public passes in this workspace are `seed0002`, both `seed0013`
  sessions, `seed0015`, `seed0101`, `seed0102`, `seed0108`, `seed0116`,
  `seed0360`, `seed0383`, `seed0398`, `seed1500`, `seed1800`, `seed2200`,
  `seed5002`, and `seed8000`.

## Latest Loop Checkpoint

- Target: `seed0015-valk-level2-pit-dog-wait`.
- Current verification: focused target `S 44/44 R 8563/8563 C 0`.
- Sentinel verification after the seed0015 pass: total
  `S 1063/1063 R 64569/64569`.
- Full verification totals after this pass are `S 3149/11405 R 287378/792838`.
- Frozen public score after this pass is `16/44` passing. Exact frozen passes:
  `seed0002`, `seed0013-friday13-save-then-fullmoon-restore`,
  `seed0013-rogue-friday13-combat`, `seed0015`, `seed0101`, `seed0102`,
  `seed0108`, `seed0116`, `seed0360`, `seed0383`, `seed0398`, `seed1500`,
  `seed1800`, `seed2200`, `seed5002`, and `seed8000`.
- Harness checks: hack audit `hard=0 suspicious=40`; memory lint is clean.
  The frozen scorer reports `16/44 passing`.
- Implemented subsystem truth in this iteration:
  - `Ghost of an Adventurer` themed-room fill now follows Lua selection
    coordinate order, scripted ghost creation, induced alignment, and
    percent-gated not-blessed loot object creation (`C refs:
    dat/themerms.lua`, `selvar.c:selection_rndcoord()`,
    `sp_lev.c:create_monster()`, `sp_lev.c:create_object()`).
  - Valkyrie startup now creates the spear/dagger/shield/ration inventory,
    optional oil-lamp gate, current weapon discovery rows, role HP/Pw/attrs,
    deferred legacy AC, forced-gender welcome/insight wording, and basic
    starting spear skill (`C refs: u_init.c:Valkyrie[]`,
    `u_init.c:u_init_role()`, `allmain.c:welcome()`,
    `insight.c:background_enlightenment()`, `weapon.c:skill_init()`).
  - Monster pit/spiked-pit `mintrap()` now owns visible fall/death plines,
    trap damage, `corpse_chance()`, and runtime corpse timeout creation for
    current evidence (`C refs: trap.c:mintrap()`,
    `trap.c:trapeffect_pit()`, `mon.c:corpse_chance()`,
    `mkobj.c:start_corpse_timeout()`).
- Current frontier:
  - Seed0015 has no focused cell/RNG/cursor frontier.
- Production `js/` has no intentional debug I/O or frozen imports.
- This batch is verified and ready to commit; do not stage
  `scratch/divergence-inventory.md` unless intentionally refreshing corpus
  inventory.
- Next queue:
  - `seed0105-valk-chat-lamp-ration` is a narrow Valkyrie follow-up
    (`0/30`, frozen RNG `987/2499`) that may reuse seed0015 startup truth and
    expose chat/lamp/ration command work.
  - Otherwise pick a startup/role bucket from
    `scratch/divergence-inventory.md` and start with
    `npm run agent:brief -- --target <session>`.

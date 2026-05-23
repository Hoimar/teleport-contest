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
- Baseline commit before the current JS batch: `ac3a636`.
- Current completed target: `seed0105-valk-chat-lamp-ration` advanced from
  `S 0/30 R 987/2499 C 0` to full focused/frozen parity
  `S 30/30 R 2499/2499 C 0`.
- `seed0015-valk-level2-pit-dog-wait`, `seed0360-wizard-world-tour`,
  `seed0108-wizard-extcmd-wishlist`, and the standing sentinel set remain full
  focused passes after the niche-engraving/eat-prompt batch.
- Frozen public passes in this workspace are `seed0002`, both `seed0013`
  sessions, `seed0015`, `seed0101`, `seed0102`, `seed0105`, `seed0108`,
  `seed0116`, `seed0360`, `seed0383`, `seed0398`, `seed1500`, `seed1800`,
  `seed2200`, `seed5002`, and `seed8000`.

## Latest Loop Checkpoint

- Target: `seed0105-valk-chat-lamp-ration`.
- Current verification: focused target `S 30/30 R 2499/2499 C 0`.
- Sentinel verification after the seed0105 pass: total
  `S 1063/1063 R 64569/64569`.
- Full verification totals after this pass are `S 3179/11405 R 288877/792838`.
- Frozen public score after this pass is `17/44` passing. Exact frozen passes:
  `seed0002`, `seed0013-friday13-save-then-fullmoon-restore`,
  `seed0013-rogue-friday13-combat`, `seed0015`, `seed0101`, `seed0102`,
  `seed0105`, `seed0108`, `seed0116`, `seed0360`, `seed0383`, `seed0398`,
  `seed1500`, `seed1800`, `seed2200`, `seed5002`, and `seed8000`.
- Harness checks: hack audit `hard=0 suspicious=40`; memory lint is clean.
  The frozen scorer reports `17/44 passing`.
- Implemented subsystem truth in this iteration:
  - `makeniche()` now creates trapdoor/teleport dust engravings, marks
    non-rock traps one-shot, and runs C-shaped `wipe_engr_at()`/`wipeout_text()`
    decay for current evidence (`C refs: mklev.c:makeniche()`,
    `engrave.c:wipe_engr_at()`, `engrave.c:wipeout_text()`).
  - Map display now renders visible/remembered spot-shown engravings as
    bright-blue room/corridor glyphs below floor objects and above terrain
    (`C refs: display.c:_map_location()`,
    `engrave.h:engraving_to_defsym()`).
  - `invent.c:getobj()` prompt semantics now cover invalid eat letters:
    non-dismiss keys stay on `You don't have that object.--More--`, and
    Space/Enter/Esc redraws the eat prompt. Empty apply with no applicable
    objects now uses C's `You don't have anything to use or apply.` wording.
- Current frontier:
  - Seed0105 has no focused cell/RNG/cursor frontier.
- Production `js/` has no intentional debug I/O or frozen imports.
- This batch is verified and ready to commit; do not stage
  `scratch/divergence-inventory.md` unless intentionally refreshing corpus
  inventory.
- Next queue:
  - Pick a startup/role bucket from `scratch/divergence-inventory.md`, or use
    a narrow remaining public path such as `seed0106-priest-extcmd-sweep` or
    `seed0107-samurai-twoweapon-enhance`.
  - Start the next target with `npm run agent:brief -- --target <session>`.

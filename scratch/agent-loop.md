# Teleport Implementation Loop

Live checkpoint only. For history, use `git log`, `git show`, `lessons.md`,
and `feature_map.md`.

## Context Rules

- Read this file fully before resuming a loop.
- Use `npm run agent:brief -- --target <target>` for targeted context.
- Search `lessons.md` and `feature_map.md`; do not full-read them by default.
- Regenerate broad corpus state with `node scripts/triage-corpus.mjs`.

## Current State

- Current branch in this workspace: `main`.
- Baseline commit before this pass: `5dea6bd`.
- Active target: `seed0360-wizard-world-tour`.
- Active hypothesis: the wished speed-boots and amulet setup now follows more
  of the general wear/pet-combat path. The current seed0360 blocker is a
  paused delayed-occupation turn-tail resume gap: C consumes an `exercise()`
  roll on the Space that clears the pet-combat `--More--` before printing the
  speed-boots finish line, while JS reaches the next pet attack one RNG call
  early.

## Latest Verification

Run:

```bash
npm run verify -- --target seed0360-wizard-world-tour
```

Result:

- Target: `seed0360-wizard-world-tour`
  `S 139/833 R 3037/120639`, first screen 139 (`q`), first RNG 1355.
- Sentinel total: `S 428/1063 R 38856/64569`.
- Sentinel details:
  - `seed8000-tourist-starter`: `S 23/23 R 3130/3130`, pass.
  - `seed0002-healer-reflection-drummer`: `S 83/595 R 5669/27158`, first RNG `4518`; remaining pet map offset persists.
  - `seed0013-friday13-save-then-fullmoon-restore`: `S 0/99 R 580/4804`, first RNG `540`.
  - `seed0116-wizard-wear-shop`: `S 127/127 R 12562/12562`, pass.
  - `seed0383-wizard-hallucinate`: `S 195/219 R 16915/16915`, first screen 195.
- Full public suite: not rerun for the narrow prompt-timing change.
- Hack-debt audit: hard `0`, suspicious `37` existing replay/override/seed findings.
- Memory lint: clean.

## Current Queue

1. Continue `seed0360` delayed occupation / pet-combat resume.
   - Current target evidence: `S 139/833 R 3037/120639`.
   - New general behavior kept: wished `+3 speed boots` use the namedesc RNG
     shape and pair naming, speed boots give base boot AC plus enchantment,
     delayed `Boots_on()` appends the speed-up message and activates very-fast
     turn-tail `rn2(3)`, invalid apply letters distinguish absent inventory
     from inapplicable non-tools, and a weapon user can spend its pet-combat
     counterattack wielding its weapon.
   - Current first visible mismatch: screen 139 (`q`), expected
     `The kitten misses the goblin.`, actual `The kitten bites the goblin.`
   - Localized cause: session step 147 (`Space`) has expected
     `rn2(19)=14 @ exercise(attrib.c:509)` before the speed-boots finish
     screen. JS currently resumes the delayed occupation finish without that
     roll, so the later `mattackm()` roll is early.
2. Continue `seed0002` pet/monster ordering after potion-call naming.
   - Latest verified target after zero-time call naming:
     `S 83/595 R 5669/27158`, first screen 83 (`Enter`).
   - The turn-count status mismatch on screen 83 is gone; remaining cells show
     the pet at the wrong map square. First RNG mismatch is still FR4518,
     expected `rn2(100)` `obj_resists()` while JS enters `distfleeck()`.
   - A neutral source-shaped cleanup now probes candidate-square pet food
     before cursed reluctance and far-backtracking gates (`dogmove.c:dog_move()`).
   - The object-call prompt completion is coherent truth (`docall()` style
     naming is zero-time after the quaff turn) even though the public RNG
     count drops by removing the accidental extra turn.
3. Continue `seed0383` hallucinated level-arrival display timing.
   - Use `npm run screen:diff -- seed0383-wizard-hallucinate --first`.
   - Current diff is screen 195 (`c`): C and JS both show the materialize
     message and cursor exactly, but the hallucinated arrival-level soldier and
     two nearby object glyphs differ.
   - Core RNG is complete (`R 16915/16915`). Do not change combat RNG for this
     blocker; compare `goto_level()` display ordering: `vision_reset()`,
     `reset_glyphmap()`, `docrt()`, visible object redraws, and monster overlay.
   - Broad probes tested and reverted/withheld: pre-switch `vision_recalc(2)`
     plus C-shaped `docrt()` ordering regressed `seed0116` screen 114; removing
     prompt suppression regressed `seed0383` screen 192. Full-screen menu
     Hallucination refresh remains an open lifecycle question.
   - Neutral lifecycle cleanup kept: numeric and menu `^V` targets now defer
     level change until after `rhack()` returns, matching C `schedule_goto()` /
     `deferred_goto()`.
4. Broaden `o_init`/`objnam`/discovery state away from limited evidence tables.
5. Broaden sleeping/hider front doors only when current C evidence reaches them.

## Regression Notes

- `seed0116` is a full pass. Treat regressions there as high-priority unless
  they are classified dehack fallout.
- Prior broad corpse-timer changes regressed startup sentinels; keep corpse
  timing caller-aware.
- Two pet-order probes were tested and reverted: a global dog-inventory-before-
  `distfleeck()` reorder regressed seed0002 to screen 27, and an
  occupation-scoped variant had no effect at FR4518 because the relevant pet
  pass occurs after JS occupation flags have already cleared.
- Recorder rebuild for display RNG was blocked by network fetching Lua. Use
  source reasoning or existing recorded evidence until recorder dependencies are
  available.
- `js/bogusmon_data.js` is generated by
  `node scripts/generate-bogusmon-data.mjs`.

## Verification Cadence

- Target triage after every production edit.
- `npm run verify -- --target <session>` after every meaningful edit.
- Add `--full` after broad shared changes, every 3-5 meaningful iterations, and
  before a valid final handoff.
- Update `feature_map.md` and `lessons.md` only when subsystem truth changes.
- Make local commits after coherent, verified implementation improvements; do
  not push unless requested.

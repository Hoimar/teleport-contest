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
- Active target: `seed0383-wizard-hallucinate`.
- Active hypothesis: the remaining seed0383 blocker is hallucinated level
  arrival redraw ownership. The latest kept change redraws visible objects once
  after `docrt()` and before the materialize pline; the remaining cells are one
  hallucinated monster glyph and one object glyph/color choice.

## Latest Verification

Run:

```bash
npm run verify -- --target seed0383-wizard-hallucinate
```

Result:

- Target: `seed0383-wizard-hallucinate`
  `S 196/219 R 16915/16915`, first screen 195 (`c`), full RNG parity.
- Sentinel total: `S 429/1063 R 38856/64569`.
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

1. Continue `seed0383` hallucinated level-arrival display timing.
   - Current diff is screen 195 (`c`): message and cursor match; remaining
     cells are a hallucinated monster glyph at row 6 col 67 and object
     glyph/color choices at rows 7/8.
   - Kept change: after level-change `docrt()`, redraw visible objects once
     before `You materialize on a different level!`. Removing the pre-`docrt()`
     `vision_recalc(0)` regresses map memory, including seed0116, so keep it.
   - Probes tested and reverted: dropping `vision_recalc(0)` globally, dropping
     it only while hallucinating, double object redraw, and adding a post-object
     monster redraw.
2. Continue `seed0360` delayed occupation / pet-combat resume.
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
3. Continue `seed0002` pet/monster ordering after potion-call naming.
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

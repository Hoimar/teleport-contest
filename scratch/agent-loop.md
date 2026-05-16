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
- Baseline commit at harness cleanup: `f0fdc38`.
- Pre-existing dirty gameplay/docs from prior Spark work:
  `feature_map.md`, `js/cmd.js`, `js/display.js`, this checkpoint.
- Active target: `seed5002-wizard-coverage-pair`.
- Active hypothesis: the first segment is now past the wizard wish namedesc
  denominator, the fire-wand destruction/death RNG chain, the first
  Storeroom/mimic/niche generation debts on the level-teleport destination,
  command-layer apply/stethoscope/search/close/open/magic-marker evidence, the
  first pet-combat `mattackm()` return-attack `--More--` split, wizard-mode
  death confirmation/default `savelife()` prompt, the following `nomovemsg`,
  hostile `ALLOW_U` movement candidate denominator, generated inventory menu,
  item-action menu, read-prompt invalid-object loop, and `m` search prefix.
  The remaining visible blocker is pet-combat More placement at screen 323,
  while the first RNG boundary is `FR 11838` (`rn2(3)` expected vs
  `d(1,6)` actual), pointing at the next `mattackm()`/pet-combat timing gap.

## Latest Verification

Run:

```bash
npm run verify -- --target seed5002-wizard-coverage-pair
```

Result:

- Target: `seed5002-wizard-coverage-pair` `S 326/410 R 11857/12167`,
  first screen `323:message:message:s`, first RNG
  `11838:rn2(3)=1=>d(1,6)=2`, cursor-only `7`.
- Sentinel total: `S 336/1063 R 35775/64569`.
- Sentinel details:
  - `seed8000-tourist-starter`: `S 23/23 R 3060/3130`, first RNG `3047`.
  - `seed0002-healer-reflection-drummer`: `S 11/595 R 2665/27158`, first RNG `2375`.
  - `seed0013-friday13-save-then-fullmoon-restore`: `S 0/99 R 573/4804`, first RNG `540`.
  - `seed0116-wizard-wear-shop`: `S 127/127 R 12562/12562`, pass.
  - `seed0383-wizard-hallucinate`: `S 175/219 R 16915/16915`.
- Hack-debt audit: hard `0`, suspicious `37` existing replay/override/seed findings.
- Memory lint: clean after this compaction target.
- Full suite after the earlier shared turn/message change: `S 723/11405 R 102300/792838`.

## Current Queue

1. Continue `seed5002-wizard-coverage-pair` post-fire/restart boundary.
   - Use `npm run triage -- seed5002-wizard-coverage-pair` and
     `node scratch/trace-rng-window.mjs seed5002-wizard-coverage-pair --moves 123 --rng 8796:8830`
     or the second segment equivalent after checking the flattened index.
   - Current state: `S 326/410 R 11857/12167`.
   - Search safety now prints the expected `You already found a monster...`
     zero-time warning, `m` prefixes force the following search, close/open and
     inventory-action throw use `In what direction?` plus cmdassist
     invalid-direction `--More--`, applying the magic marker enters the
     write-on target prompt, and `r` enters the read prompt, re-prompting after
     `You don't have that object.` until Space cancels with `Never mind.`
   - Pet-combat `mattackm()` now covers the giant bat return attack and the
     tty `--More--` interruption/resume through the following bat hit without
     moving sentinels. Monster-hit death now enters `You die...--More--`,
     blocks invalid `Die? [yn] (n)` keys, default-Enter resumes with
     `OK, so you don't die.` plus the queued kitten hit, and the follow-up
     `nomovemsg` prints after More dismissal. `o` now uses the shared
     direction prompt and open-specific invalid-direction `Never mind.` tail.
     Hostile `m_move()` now counts the hero square as an `ALLOW_U` candidate.
   - First visible mismatch is screen 323: JS appends `--More--` to
     `The kitten misses the giant bat.  The giant bat bites!` but C leaves the
     topline unblocked.
   - First RNG mismatch is `FR 11838` (`rn2(3)` expected vs `d(1,6)` actual),
     after fire-wand destruction, nested `--More--` messages, wizard-mode death
     prompt handling, Storeroom mimic shape/default inventory/explicit chest
     appearance, niche `mkclass(S_HUMAN)`, sorted `mongen_order`, post-teleport
     tool wishes, apply prompt, stethoscope self/adjacent use, mimic
     reveal/status, search safety, close/open/throw prompts, magic-marker write
     prompt, inventory/action/read menus, `m` search prefix, the first
     pet-combat More split, wizard-mode death confirmation, and savelife resume.
   - Immediate hypothesis: inspect pet-combat More latching around
     `mattackm()`/`hitmm()` after forced search; the first kitten-miss/bat-bite
     topline should not block, while the later screen 328/329 chained pet
     combat messages should.
   - Implement general restart/object/level-generation truth; do not pin the
     level-teleport room or cursor.
2. Continue `seed0383` post-expulsion visible-map hallucination redraw ownership.
   - Use `npm run screen:diff -- seed0383-wizard-hallucinate --first`.
   - Current diff is hallucinated visible-map glyphs on screen 172 (`Space`)
     after expulsion More is dismissed; screen 171 message/cursor/status now
     match `You get expelled!--More--`, and core RNG remains exact.
   - Stay on the remaining display-RNG ownership inside the post-expulsion
     visible-map refresh. The duplicate Warning refresh is gone; remaining
     evidence points at earlier `docrt()`/`newsym()` display-RNG state and
     retained glyph timing rather than core RNG or per-screen forcing.
   - Do not add seed-specific color sequences.
3. Continue `seed0002-healer-reflection-drummer` movement/pet-goal ordering.
   - Current remembered state: `R 2672/27158`.
   - Next boundary: `FR 2375` (`rn2(5)` expected vs `rn2(100)` actual).
   - Suspect retained object placement/order or later pet-goal movement state.
4. Broaden `o_init`/`objnam`/discovery state away from limited evidence tables.
5. Broaden sleeping/hider front doors only when current C evidence reaches them.

## Regression Notes

- `seed0116` is a full pass. Treat regressions there as high-priority unless
  they are classified dehack fallout.
- Prior broad corpse-timer changes regressed startup sentinels; keep corpse
  timing caller-aware.
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

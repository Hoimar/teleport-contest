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
- Active target: `seed0002-healer-reflection-drummer`.
- Active hypothesis: seed0002 is now past the legacy tutorial prompt,
  startup wand color mismatch, floor-look/pickup, safe pet-displacement,
  engraving-wipe success amount, carried Healer money object, startup
  `seer_turn`, ambient sound packing, and startup discovery naming. The next
  visible blocker is screen 31 (`l`): C misses the grid bug and receives its
  passive shock attack, while JS hits it. First RNG evidence points at hero
  combat hit/miss and grid-bug retaliation, not the earlier dog-object scan.

## Latest Verification

Run:

```bash
npm run verify -- --target seed0002-healer-reflection-drummer
```

Result:

- Target: `seed0002-healer-reflection-drummer` `S 31/595 R 3197/27158`,
  first screen `31:char:mixed:l`, first RNG
  `3044:rn2(3)=2=>rn2(19)=15`, cursor-only `0`.
- Sentinel total: `S 354/1063 R 30825/64569`.
- Sentinel details:
  - `seed8000-tourist-starter`: `S 23/23 R 3060/3130`, first RNG `3047`.
  - `seed0002-healer-reflection-drummer`: `S 31/595 R 3197/27158`, first RNG `3044`.
  - `seed0013-friday13-save-then-fullmoon-restore`: `S 0/99 R 583/4804`, first RNG `540`.
  - `seed0116-wizard-wear-shop`: `S 127/127 R 12562/12562`, pass.
  - `seed0383-wizard-hallucinate`: `S 173/219 R 11423/16915`.
- Hack-debt audit: hard `0`, suspicious `37` existing replay/override/seed findings.
- Memory lint: clean after this compaction target.
- Full suite after the latest pet-combat/death timing change: `S 826/11405 R 102576/792838`.

## Current Queue

1. Continue `seed5002-wizard-coverage-pair` post-fire/restart boundary.
   - Use `npm run triage -- seed5002-wizard-coverage-pair` and
     `node scratch/trace-rng-window.mjs seed5002-wizard-coverage-pair --segment 1 --moves 285 --rng 12105:12145`
     for the current second-segment tail.
   - Current state: `S 407/410 R 12127/12167`.
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
   - Pet combat now uses C's `find_mac(defender) + attacker level > dieroll`
     hit comparison for current kitten/rat/bat evidence, suppresses fitting
     packed monster/death More at C-like boundaries, allows defender return
     attacks outside the savelife resume, delays defender-kills-attacker death
     side effects until after the hit-message More, and clears the dead pet
     resume marker so the live defender can continue the pass.
   - Death prompts now latch HP 0/cursor and non-paused savelife packs the
     `You survived...` message onto the OK line. `e` with no food now prints
     `You don't have anything to eat.`. Hero melee now prints the kill line
     before `xkilled()` side effects for the current lethal giant-bat hit.
     Fatal non-pet monster hits now pause before turn-tail `regen_hp()`/hunger
     and resume only the pending tail after wizard-mode `savelife()`, while the
     pet-combat savelife path still resumes combat after the OK line.
   - First visible mismatch is screen 407: C prints `The small mimic hits!`
     and drops HP to 4, while JS has no message and remains at HP 12.
   - First RNG mismatch is `FR 12117` (`rn2(5)` expected vs `rn2(8)` actual),
     after fire-wand destruction, nested `--More--` messages, wizard-mode death
     prompt handling, Storeroom mimic shape/default inventory/explicit chest
     appearance, niche `mkclass(S_HUMAN)`, sorted `mongen_order`, post-teleport
     tool wishes, apply prompt, stethoscope self/adjacent use, mimic
     reveal/status, search safety, close/open/throw prompts, magic-marker write
     prompt, inventory/action/read menus, `m` search prefix, the first
     pet-combat More split, wizard-mode death confirmation, and savelife resume.
   - Immediate hypothesis: late `m_move()` candidate ordering leaves the final
     small mimic outside attack range.
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
3. Continue `seed0002-healer-reflection-drummer` hero/grid-bug combat work.
   - Current state: `S 31/595 R 3197/27158`.
   - First visible mismatch is screen 31 (`l`): expected
     `You miss the grid bug.  The grid bug bites!  You get zapped!`, actual
     `You hit the grid bug.`
   - First RNG mismatch is `FR 3044` (`rn2(3)` expected vs `rn2(19)` actual).
   - The previous dog-goal gap was carried startup gold, not missing floor
     objects. Startup `seer_turn`, sound packing, and known `WAN_SLEEP` naming
     are fixed. Next inspect C refs `uhitm.c` and grid bug passive/active
     attack handling before changing monster movement.
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

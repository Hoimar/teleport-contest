# Scoreboard Divergence Fix Plan - 2026-07-04

## 2026-07-05 status

This plan is superseded by the competitor-control audit and DEC serialization
repair in `scratch/scoreboard-divergence-competitor-controls-2026-07-05.md`.
The original harness/operations scope was still useful, but the stronger
competitor controls showed a real local false-positive class: Hoimar emitted
visual-equivalent Unicode/non-DEC terminal cells for many DECgraphics frames.

Implemented follow-up:

- terminal grid cells now retain raw DEC payload metadata;
- the base serializer emits SO/SI around marked DEC cells while active text
  screens still return their stored serialized bytes;
- DEC metadata round-trips through `renderTextScreen()`;
- liquid, tree, iron-bars, altar, loot-frame, and swallowed-frame DECgraphics
  payloads are marked from `dat/symbols`;
- the base terminal serializer now preserves C tty cursor-forward gaps,
  bright-black darkroom wire color, and single-purpose SGR transition ordering;
- active tty screens trim invisible trailing blank rows for the currently known
  prompt, inventory, and death-disclosure cases.

Current verification:

- checked-in public exact `44/44 S 11405/11405 R 792838/792838 C 0`;
- strict sentinels exact `5/5 S 1063/1063 R 64569/64569 C 0`;
- full-public false-positive audit now has `invisibleSgr=0` and `DEC=0`;
- current remaining accepted non-exact output is byte-string-only terminal form
  (`1639` full-public frames, `1518` on the current online-failed subset)
  after preserving DEC metadata, cursor-run behavior, darkroom wire color, and
  several tty string/padding forms.

Remaining open question: this removes the DEC/Unicode and invisible-space
cell-state false-positive classes, but the online row's sparse `54` missed
cell-grid screens are still not reproduced by broad local strictness
predicates. The current live row also cannot reflect this tree until the
local-ahead commits are pushed and rescored.

## 2026-07-05 implementation update

The production follow-up is now implemented in `js/display.js`:

- C `docrt()` darkroom memory conversion is applied to out-of-sight remembered
  room floors (`C refs: src/display.c:docrt_flags(), src/vision.c:vision_recalc()`);
- C `magic_map_background()` darkroom conversion is applied when magic mapping
  stores/shows out-of-sight, not-remembered-lit room floor;
- visible corridor memory is guarded from the darkening helper after
  `seed0900` exposed the over-broad corridor case.
- `#wipe` clears cream blindness through the JS blindness-toggle vision redraw
  path rather than stale-memory `docrt()`, matching
  `C ref: src/potion.c:toggle_blindness()`.

Final verification for this plan state:

- official checked-in public score: `44/44 S 11405/11405 R 792838/792838 C 0`;
- strict sentinels: `5/5 S 1063/1063 R 64569/64569 C 0`;
- focused targets exact: `seed0012`, `seed0108`, `seed0900`, `seed2200`,
  `seed4500`;
- clean-process exact-string audit: `489` remaining non-exact full-public
  frames, down from `1639` after the prior tty string cleanup.

## Diagnosis to preserve

The online 30/44 plateau is not a production gameplay parity bug reproduced in
this checkout. It is a leaderboard-only scorer/deployment/comparator/data-path
split. The current row's exact RNG and cursor totals, plus exact local
visual/browser/play-assets/Actions results, make a production `js/` output
change the wrong fix.

## Fix scope

Implement a harness/operations fix:

1. Add a command that reads the same `/leaderboard/data.json` advisory consumed
   by the online Session Viewer hub mode.
2. Print the current team public score, last-scored timestamp, all failed
   sessions, missed-screen counts, and the aggregate screen/cell/cursor/RNG
   signature.
3. Support saved snapshots with `--leaderboard-json` so reports remain
   reproducible after the live endpoint moves.
4. Add a package script for the command.
5. Verify the command against the current saved `.cache/leaderboard-data.json`,
   then rerun strict sentinels and the focused online-failed-surface probe.

## Non-goals

- No production `js/` change.
- No per-seed/session workaround.
- No local comparator weakening to declare the online row fixed.
- No attempt to spoof the public leaderboard's sparse 59 missed screens.

## Expected behavior

Example command:

```bash
npm run score:online-viewer -- --leaderboard-json .cache/leaderboard-data.json --failed
```

Expected output should show:

- source snapshot `2026-07-04T07:37:10.615Z`;
- team `Hoimar`, last scored `2026-07-04T07:13:46.843Z`;
- public `29/44 S 11346/11405 R 792838/792838`;
- failures `15`, missed screens `59`;
- full RNG `15/15`, full cursors `15/15`, full cells `0/15`,
  cells-only equals combined `15/15`;
- the same 15 failed sessions listed in the RCA.

## Verification

Run:

```bash
npm run score:online-viewer -- --leaderboard-json .cache/leaderboard-data.json --failed
npm run score:leaderboard-failures -- --leaderboard-json .cache/leaderboard-data.json --full
npm run sentinel:strict
git diff --check
```

Passing criteria:

- New command faithfully reports the viewer/leaderboard advisory rows.
- Focused local scorer surfaces remain exact for the online-failed subset.
- Strict sentinel suite remains exact.
- No forbidden files are modified.

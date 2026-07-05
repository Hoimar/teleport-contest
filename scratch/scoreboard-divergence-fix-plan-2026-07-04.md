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
- premapped Sokoban traps now use `trap_to_defsym()` colors instead of a
  hardcoded gray/brown `^`;
- stale terminal-grid room floors are not recolored from the current map during
  final serialization; stored terminal cell color is now authoritative until
  explicit retained `S_room`/`S_darkroom` identity is ported;
- active tty screens trim invisible trailing blank rows for the currently known
  prompt, inventory, and death-disclosure cases.
- leading cursor-forward gaps preserve the first skipped blank cell's stored
  color/attribute state, and final top-ten screens trim trailing empty rows.

Current verification:

- checked-in public exact `44/44 S 11405/11405 R 792838/792838 C 0`;
- strict sentinels exact `5/5 S 1063/1063 R 64569/64569 C 0`;
- full-public false-positive audit now has `invisibleSgr=0` and `DEC=0`;
- current remaining accepted non-exact output is byte-string-only terminal form
  (`60` full-public frames, `7` on the current online-failed subset) after
  preserving DEC metadata, cursor-run behavior, darkroom wire color, Sokoban
  trap memory colors, stored terminal-cell color, active-screen blank-run
  serialization, top-ten trimming, and several tty string/padding forms.

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
- storage-aware false-positive audit: `276` remaining non-exact full-public
  byte-string-only frames, down from `1639` after the prior tty string cleanup.

## 2026-07-05 second implementation update

The next root-cause pass found two remaining local false-positive classes in
the online-failed set, both exposed by `seed0360`:

- Sokoban premapped traps used a local gray/brown shortcut instead of C trap
  symbol colors (`C ref: include/defsym.h trap PCHAR rows via
  rm.h:trap_to_defsym()`), leaving pit traps as visually accepted but
  byte-string-wrong `^` glyphs;
- normal map frames could keep stale default-color DEC room floors in the
  terminal grid after sight changed, while C `newsym()`/`back_to_glyph()`
  emits out-of-sight remembered room floor as `S_darkroom`
  (`C refs: src/display.c:newsym(), src/display.c:back_to_glyph()`).

Implementation:

- `js/mklev.js` now maps premapped Sokoban traps through a general
  `premapTrapGlyph()` color table;
- `js/display.js` now uses one `darkRoomMapFloorColor()` helper for map-cell
  writes, map-row serialization, terrain-only map views, and terminal-grid
  serialization fallback.

Verification:

- `seed0360` stayed exact under `npm run verify -- --target seed0360` and now
  has `acceptedNonExact=0`, `exactTerminal=833`;
- before the active-screen follow-up, full-public false-positive audit was down
  to `158` non-exact byte-string-only frames (`11247/11405` exact strings);
- before the active-screen follow-up, the current leaderboard-failed subset
  audit was down to `102` non-exact byte-string-only frames (`8297/8399` exact
  strings);
- live `parity:state --refresh-live` still reported local public `44/44`, while
  the leaderboard row was `31/44` from an older unpushed/ahead tree.

## 2026-07-05 third implementation update

The next local false-positive pass targeted active tty screens that bypass the
base terminal-grid serializer. The first remaining accepted byte mismatch was
a `seed2200` help/about page with literal long spaces in JS and cursor-forward
gaps in the C-recorded terminal string; follow-up `seed4500` samples exposed
the same class in `#enhance`, `#wizintrinsic`, and compact final `#wizwhere`
pages.

Root cause:

- C text windows store literal row text and `process_text_window()` cursors to
  column 1 before printing each row; C does not rewrite row text into
  cursor-forward escapes (`C refs: win/tty/wintty.c:tty_putstr(),
  win/tty/wintty.c:process_text_window()`);
- JS active help-text screens are pre-serialized strings returned by
  `display.js:activeSerializedTextScreen()`, so they bypass the terminal-grid
  serializer that already converts blank cell runs longer than four columns to
  `ESC[nC`;
- manually stored active menu screens have the same bypass, but inverse and
  underline spaces are painted tty cells and must remain literal.

Implementation:

- `js/cmd.js` now serializes active help-text, enhance, and intrinsic menu rows
  through the same default-blank-run wire normalization used by the terminal
  serializer;
- compact final help pages trim trailing blank rows after their inline More
  prompt;
- this is a general active tty-screen serialization rule, not a seed-specific
  patch and not a claim that C rewrites stored text-window spaces.

Verification:

- `seed2200` remains exact: `S 230/230 R 3018/3018 C 0`;
- targeted exact-terminal audit is clean:
  `acceptedNonExact=0`, `exactTerminal=230`;
- `seed4500` remains exact and its accepted byte-string-only frames dropped
  from `18` to `7`;
- full-public false-positive audit is down to `101` non-exact byte-string-only
  frames (`11304/11405` exact strings);
- then-current leaderboard-failed subset audit was down to `48` non-exact
  byte-string-only frames (`8351/8399` exact strings);
- focused text/help guards remain exact: `seed0108`,
  `seed0013-friday13-save-then-fullmoon-restore`,
  `seed0013-rogue-friday13-combat`, plus earlier `seed0360`, `seed4500`,
  `seed0030`, and `seed0106`;
- strict sentinels remain exact in each `verify` run.

## 2026-07-05 fourth implementation update

The next false-positive pass cleaned up the byte-form cases that were caused
by final terminal serialization rather than gameplay:

- `seed0373` had a leading Air-row cursor-forward gap where the skipped blank
  cells were cyan in the terminal grid. The serializer now enters the first
  skipped cell's stored color/attribute state before emitting `ESC[nC`;
- `seed4500`, `seed0360`, and `seed0002` showed that the earlier map-color
  fallback over-recolored stale room-floor cells from current `game.level`
  state. Final serialization now uses the stored terminal cell color instead
  of recomputing `S_darkroom` from the map at the end of the frame;
- `seed0030` had a terminal-exit top-ten screen with one invisible trailing
  empty row. The generated top-ten text window now trims trailing empty rows.

Verification:

- focused targets exact: `seed0030`, `seed0373`, `seed4500`, `seed0360`,
  `seed0002`, `seed0012`, and `seed0367`;
- targeted exact-terminal audits are clean for `seed0030` and `seed0373`;
- live online-failed subset audit is down to `7` non-exact byte-string-only
  frames (`8716/8723` exact strings);
- full-public false-positive audit is down to `60` non-exact byte-string-only
  frames (`11345/11405` exact strings);
- all local cell-state variants still miss `0` screens on the current
  online-failed set.

The remaining `seed0002`/`seed0012` byte-form edges are both darkroom
placement cases where color is only a proxy. A full cleanup should retain a
C-like glyph identity for remembered cells (`S_room` versus `S_darkroom`) so
the serializer does not have to infer identity from current color or map state.

## Diagnosis to preserve

The online 30/44 plateau is not a production gameplay parity bug reproduced in
this checkout. Competitor controls proved that local visual false positives
were real, so production terminal-byte serialization fixes were in scope. After
those fixes, the current local tree still has exact local visual parity and
no cell-state false positives on the live-failed set; the remaining local
differences are byte-string-only and do not reproduce the online row's sparse
cell-grid misses.

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

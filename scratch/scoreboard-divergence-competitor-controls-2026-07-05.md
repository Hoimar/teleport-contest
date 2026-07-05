# Scoreboard Divergence Competitor Controls - 2026-07-05

## Live state

`npm run scoreboard:state` refreshed the live row at
`2026-07-05T01:10:27.461Z`.

- Hoimar local/clean-ref public: `44/44 S 11405/11405 R 792838/792838 C 0`.
- Hoimar leaderboard public: `31/44 S 11351/11405 R 792838/792838`.
- Current online miss shape: 13 failed public sessions, 54 missed screens,
  full RNG, full RNG-steps, and full cursors on all failed sessions.
- Latest successful GitHub Score run: `#127` for `25be420`, after the
  leaderboard `lastScored`; Actions artifact remains exact `44/44`.

## Competitor controls

Control repos were selected from the current leaderboard:

| Team | Repo | Online public | Local clone commit | Local score |
|---|---|---:|---|---:|
| `kevinjosethomas` | `kevinjosethomas/teleport-contest` | `44/44` | `1ccf809` | `44/44` |
| `serteal` | `serteal/teleport-contest` | `44/44` | `1d90456` | `44/44` |
| `xeophon` | `xeophon/teleport-contest` | `43/44` | `761b032` | `43/44` |

The control clone commands were:

```bash
git clone --depth 1 https://github.com/kevinjosethomas/teleport-contest.git /tmp/teleport-competitors-20260705-kevinjosethomas
git clone --depth 1 https://github.com/serteal/teleport-contest.git /tmp/teleport-competitors-20260705-serteal
git clone --depth 1 https://github.com/xeophon/teleport-contest.git /tmp/teleport-competitors-20260705-xeophon
```

Initial sandboxed `npm run score` attempts were invalid because nested Node
workers failed with `spawnSync ... node EPERM`; the approved reruns produced
the table above.

`xeophon` is the useful negative control: it fails locally and online on the
same public session, `seed0009-swimmer-mforce`, with exact RNG/cursors and
`66/73` screens.

## Exact-terminal audit

`scripts/score-false-positive-audit.mjs` now accepts `--project-root <dir>` so
the same audit logic can replay an external checkout's `js/` against that
checkout's sessions. It also accepts `--samples N`, `--sample-class <class>`,
and `--sample-per-session` for concrete accepted-difference examples.

Full-public audit totals:

| Checkout | Visual score | Accepted non-exact screens | Split | Exact terminal screens |
|---|---:|---:|---|---:|
| Hoimar `25be420` | `11405/11405` | `10922` | invisible SGR `6924`, DEC `3521`, other `477` | `483` |
| kevinjosethomas `1ccf809` | `11405/11405` | `0` | invisible SGR `0`, DEC `0`, other `0` | `11405` |
| serteal `1d90456` | `11405/11405` | `0` | invisible SGR `0`, DEC `0`, other `0` | `11405` |
| xeophon `761b032` | `11398/11405` | `10874` | invisible SGR `7501`, DEC `0`, other `3373` | `524` |

Current Hoimar online-failed subset:

- local visual: `8399/8399`;
- online missed screens: `54`;
- locally accepted non-exact screens: `8112`;
- split: invisible SGR `5730`, DEC `2235`, other `147`;
- exact terminal/string screens: `287`;
- broad local variants still miss either `0`, `5730`, or `7965` screens, not
  the online `54`.

Per-session DEC samples from the current online-failed set are consistent:
Hoimar emits Unicode box glyphs such as `┌` or `│` with `decgfx=0`, while the
canonical session expects raw DEC characters such as `l` or `x` with
`decgfx=1`.

Per-session string-only samples are mostly cursor-forward compression
differences in menus/status text. Example: Hoimar emits literal spaces after
`Copyright 1985-2026`, while the canonical session emits `ESC[13C` before the
same visible text. These decode to the same grid and are separate from the DEC
glyph issue.

The public Session Viewer source was fetched from
`https://mazesofmenace.ai/sessions-viewer/viz.mjs`. Hub mode imports
`/play/<fork>/js/jsmain.js`, loads canonical `/sessions/`, and reads
`/leaderboard/data.json` only as a per-session advisory. It does not expose the
backend leaderboard's per-screen miss indices; it recomputes timeline diffs in
the browser with the same `diffCell` visual comparator.

## Interpretation

The controls weaken the previous blanket "online scorer issue" conclusion.
Two online-44 controls emit exact terminal strings for all public frames, while
Hoimar's local 44/44 depends heavily on the visual comparator accepting raw
terminal differences.

However, broad accepted non-exact output is not sufficient by itself:
`xeophon` has many accepted non-exact frames and still matches its online
43/44 shape. The distinguishing difference in this sample is DEC graphics:
Hoimar has thousands of DEC-vs-Unicode accepted frames, while `xeophon` has
zero DEC accepted frames.

The likely actionable hypothesis is now narrower:

> Hoimar may be locally false-positive on a subset of DEC/Unicode or
> terminal-string frames that the online scorer rejects sparsely. The local
> audit proves the broad class is real, but it has not yet identified the
> online scorer's exact 54-screen predicate.

## Rejected implementation attempt

A broad production serializer experiment tried to reconstruct raw DEC map rows
from `loc.disp_*` while preserving browser Unicode rendering. It was rejected
before commit because it regressed visual parity on transient menu/travel-tip
screens and only reduced accepted non-exact frames from `10922` to roughly
`10109`. That is too little improvement for the behavioral risk.

Do not take a broad serializer rewrite as the next fix. A safe production fix
needs a row/screen-level predicate that preserves every transient text/menu
screen and measurably collapses the DEC accepted bucket without reducing
visual parity.

## Implemented DEC serialization fix

The broad rewrite above was replaced with a narrow terminal-grid metadata fix:

- install the serialized-screen hook at segment startup;
- preserve raw DEC payload bytes on terminal grid cells while browser-visible
  cells remain Unicode;
- make the base serializer DEC-aware but keep active serialized text screens as
  the outer override;
- round-trip DEC metadata through `renderTextScreen()`;
- mark DECgraphics liquid, tree, iron-bars, and swallowed-frame payload bytes
  according to `dat/symbols`.

Verification after the fix:

- checked-in public remains exact:
  `44/44 S 11405/11405 R 792838/792838 C 0`;
- strict sentinels remain exact:
  `5/5 S 1063/1063 R 64569/64569 C 0`;
- `seed4500-knight-coverage` remains exact:
  `S 1814/1814 R 108275/108275 C 0`;
- full-public false-positive audit still has visual `11405/11405`, but the DEC
  bucket is now `0` (`10919` accepted non-exact frames remain:
  invisible SGR `6924`, other string/encoding `3995`);
- online-failed subset visual remains `8399/8399`, and its DEC bucket is now
  `0` (`8112` accepted non-exact frames remain: invisible SGR `5730`, other
  string/encoding `2382`).

This repairs a real local false-positive class, but it still does not reproduce
the online scorer's sparse `54` cell-grid misses. The next layer is not
DEC/Unicode; it is the remaining cursor-forward/string compression and
invisible SGR state, or a backend predicate not exposed by the public viewer.

## Implemented terminal-grid follow-up

After the DEC repair, a focused strict-display scan found one residual
cell-state false-positive class: `seed0373-barbarian-quest-tour` had 11 Air
screens where a blank cell decoded as cyan locally but default in the canonical
tty transcript. The canonical string used `ESC[5C` to move over a run of five
cyan Air blanks; the old base serializer wrote five literal spaces, which
painted invisible foreground state into the decoded grid.

Follow-up implementation:

- added `putDecstr()` so tty-window overlays can write browser-visible Unicode
  while preserving raw DEC payload bytes on terminal cells;
- changed the loot put-in gold menu to draw its DEC frame/filler with raw
  `l/q/x/~` payloads instead of literal Unicode `┌/─/│/·`;
- marked DECgraphics altars as raw DEC payload `{` (`C ref: dat/symbols
  DECGraphics S_altar`);
- normalized plain `CLR_GRAY` spaces to default color in terminal-grid
  serialization;
- compressed internal uniform blank runs longer than four cells to `ESC[nC`
  when the cells have no visible inverse/underline attribute and no DEC
  metadata, preserving the active SGR state without painting skipped cells.

Verification after this follow-up:

- `seed0373-barbarian-quest-tour` remains exact:
  `S 124/124 R 35386/35386 C 0`;
- strict sentinels remain exact:
  `5/5 S 1063/1063 R 64569/64569 C 0`;
- online-failed subset remains local visual exact:
  `8399/8399`, with accepted non-exact terminal screens reduced to `6709`
  (`invisibleSgr=0`, `dec=0`, `other=6709`, exact terminal/string `1690`);
- full public corpus remains local visual exact:
  `11405/11405`, with accepted non-exact terminal screens reduced to `7576`
  (`invisibleSgr=0`, `dec=0`, `other=7576`, exact terminal/string `3829`);
- all ranked cell-state comparator variants now miss `0` screens on the
  current 13 online-failed sessions.

This is the strongest local false-positive cleanup so far: broad local visual
acceptance no longer hides DEC state, invisible SGR-on-space state, or raw DEC
cell-state differences. The remaining non-exact output is byte-string form
only, mostly C tty SGR placement around DEC floor glyphs and cursor movement
choices. That still does not explain the leaderboard's `54` sparse cell-grid
misses by itself.

## Implemented darkroom wire-color follow-up

The next largest string-only class was C tty's `S_darkroom` handling. Upstream
keeps the same room-floor glyph for unseen remembered room cells but changes
the cmap color to `CLR_BLACK` when `dark_room` and tty color are enabled
(`C refs: display.c:newsym()`, `display.c:map_background()`,
`dat/symbols S_darkroom`). Tty emits that black as bright-black `ESC[90m`;
the frozen decoder maps `90` to the same default visual color, so this was a
pure byte-string difference until we preserved the wire color.

Follow-up implementation:

- `tty_color()` no longer discards `CLR_BLACK`;
- the DEC-aware base serializer now uses the C tty `ANSI_COLOR` table, so
  `CLR_BLACK` serializes as `ESC[90m` instead of plain black `ESC[30m`;
- out-of-sight remembered room-floor glyphs are rewritten to `CLR_BLACK`
  under `dark_room`+color while preserving the same visible glyph and DEC
  payload.

Verification after this follow-up:

- `seed0002-healer-reflection-drummer` remains visual exact and improves from
  `58` exact terminal/string frames after the first DEC fix to `593/595`;
- online-failed subset remains local visual exact:
  `8399/8399`, with accepted non-exact terminal screens reduced to `1618`
  (`invisibleSgr=0`, `dec=0`, `other=1618`, exact terminal/string `6781`);
- full public corpus remains local visual exact:
  `11405/11405`, with accepted non-exact terminal screens reduced to `1773`
  (`invisibleSgr=0`, `dec=0`, `other=1773`, exact terminal/string `9632`).

The remaining string-only classes are now concentrated in tty windows and a
few row-state ordering differences: option menu inverse headers/column gaps,
overview depth lists, some final text-window trailing-newline trimming, and
isolated DEC/SI-vs-SGR ordering. They are still much broader than the online
`54` sparse cell-grid misses and all local cell-state comparator variants
remain exact.

## Implemented tty string-serialization follow-up

The next pass cleaned up several C tty byte-string forms while keeping the
visual scorer surface unchanged:

- basic and simple options now use C-like cursor-forward gaps for column runs
  longer than four cells, and basic option headings keep inverse video active
  across the padded heading field;
- active prompt/menu screens trim trailing blank rows instead of materializing
  24-row byte strings for fruit prompts, death inventory disclosure pages, and
  inventory/throw-inventory second pages;
- terminal SGR serialization now emits ordered single-purpose SGR sequences
  (`ESC[7m ESC[31m`, `ESC[27m ESC[97m`) instead of combined forms not present
  in the recorded C corpus;
- unreachable wizard level-teleport menu rows use cursor-forward padding in
  place of the missing selector, matching `dungeon.c:tport_menu()`;
- overview disclosure capture uses the DEC-aware base serializer instead of
  the frozen terminal fallback.

Verification after this follow-up:

- official checked-in public score remains exact:
  `44/44 S 11405/11405 R 792838/792838 C 0`;
- strict sentinels remain exact:
  `5/5 S 1063/1063 R 64569/64569 C 0`;
- focused targets stayed exact for `seed0007`, `seed0012`, `seed0360`,
  `seed0361`, `seed0373`, `seed2200`, and `seed4500`;
- online-failed subset remains local visual exact:
  `8399/8399`, with accepted non-exact terminal screens reduced to `1518`
  (`invisibleSgr=0`, `dec=0`, `other=1518`, exact terminal/string `6881`);
- full public corpus remains local visual exact:
  `11405/11405`, with accepted non-exact terminal screens reduced to `1639`
  (`invisibleSgr=0`, `dec=0`, `other=1639`, exact terminal/string `9766`);
- all ranked cell-state comparator variants still miss `0` screens on the
  current 13 online-failed sessions.

The remaining non-exact output is still byte-string-only and still much
broader than the online `54`: mostly C tty SGR placement around DEC floor
glyphs, terminal-exit trailing blank/newline trimming, enhance/skill menu
cursor gaps, and a few DEC/SI-vs-SGR ordering cases.

Live refresh after the implementation still classified the public row as
`local-dirty-or-unpushed`: the leaderboard last scored Hoimar at
`2026-07-04T22:30:17.282Z`, before this local tree, and the workspace was
ahead of `origin/main` with uncommitted serializer changes. Do not expect the
online row to move until the relevant commits are pushed and rescored.

## Implemented darkroom memory follow-up

The next pass found that several high-volume `ESC[90m~` misses were stale
map-memory color state rather than terminal serialization:

- `docrt()` in C calls `vision_recalc(2)` before displaying `lev->glyph`, so
  out-of-sight remembered `S_room` floors are converted to `S_darkroom`
  (`C refs: src/display.c:docrt_flags(), src/vision.c:vision_recalc()`);
- magic mapping uses `magic_map_background()`, which converts out-of-sight,
  not-remembered-lit `ROOM` floor from `S_room` to `DARKROOMSYM`
  (`C ref: src/display.c:magic_map_background()`);
- `S_room`/`S_ndoor` and `S_darkroom` share DEC raw `~`, but only
  `S_darkroom` carries `CLR_BLACK` and serializes as `ESC[90m`.

Implementation:

- factored remembered map-glyph correction in `display.js`;
- applied the C `docrt()` darkroom correction to remembered room floors;
- applied the C magic-mapping darkroom correction to mapped room background;
- guarded corridor darkening with `!cansee(x,y)` after `seed0900` exposed that
  visible remembered corridors must retain lit-corridor white.

Verification after this follow-up:

- official checked-in public score is exact:
  `44/44 S 11405/11405 R 792838/792838 C 0`;
- strict sentinels remain exact:
  `5/5 S 1063/1063 R 64569/64569 C 0`;
- focused targets stayed exact for `seed0012`, `seed0900`, `seed2200`, and
  `seed4500`;
- clean-process full-public exact-string audit now has `672` non-exact frames
  (`10733/11405` exact strings), down from `1639` after the tty
  string-serialization follow-up.

## Next fix plan

1. Keep `--project-root` and sample flags in the false-positive audit so
   competitor controls can be rerun without copying scripts into clones.
2. Push/score timing is now a first-class branch-state issue: this checkout is
   ahead of `origin/main`, so the current leaderboard cannot validate these
   repairs yet.
3. If the scorer still reports a sparse 30/44-style row after these commits are
   pushed and rescored, request or recover the backend's first failed screen
   indices; the public viewer advisory does not expose them.
4. Only after that predicate is known, implement the smallest serialization or
   display-state change that removes it while keeping:
   - checked-in public exact `44/44`;
   - strict sentinels exact;
   - `score:false-positive-audit --full` improved against the targeted
     bucket;
   - competitor controls still reproducible via `--project-root`.
5. With DEC, invisible-space, darkroom wire-color, darkroom memory,
   SGR-combination, and several tty-window padding differences eliminated, rank
   remaining string-only differences by screen/session coverage. Current broad
   cell predicates miss `0` screens, while exact-string strictness still misses
   `672` full-public frames, not the online sparse miss shape.

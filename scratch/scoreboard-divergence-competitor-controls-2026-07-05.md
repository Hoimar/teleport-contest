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

## Next fix plan

1. Keep `--project-root` in the false-positive audit so competitor controls can
   be rerun without copying scripts into clones.
2. Add a focused diagnostic that prints the first accepted DEC/string
   difference per selected screen, including raw actual/expected escape
   context. Implemented as `--samples`, `--sample-class`, and
   `--sample-per-session`.
3. Compare Hoimar's DEC accepted frames against `xeophon`'s non-DEC accepted
   frames and the current 54 online misses; look for a predicate that selects
   dozens of Hoimar screens, not thousands.
4. Only after that predicate is known, implement the smallest serialization or
   display-state change that removes that predicate while keeping:
   - checked-in public exact `44/44`;
   - strict sentinels exact;
   - `score:false-positive-audit --limit=0` improved against the targeted
     bucket;
   - competitor controls still reproducible via `--project-root`.

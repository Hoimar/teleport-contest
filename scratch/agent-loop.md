# Teleport Implementation Loop

Live checkpoint only. For history, use `git log`, `git show`, `lessons.md` (avoid token-intensive full reads as explained in `AGENTS.md`'s "## Memory Routing"),
and `feature_map.md`.

## Context Rules

- Read this file fully before resuming a loop.
- Use `npm run agent:brief -- --target <target>` for targeted context.
- Search `lessons.md` and `feature_map.md`; do not full-read them by default.
- Regenerate broad corpus state with `node scripts/triage-corpus.mjs`.

## Current State

- Current branch in this workspace: `main`, ahead of origin.
- Latest verified repair unit:
  - `seed5006-tourist-stress-disaster` is exact:
    `S 249/249 R 13923/13923 C 0` (pre-fix checked-in frontier after
    the previous repair unit was `S 131/249 R 8545/13923 C 0`).
  - Strict sentinels exact: `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed5006-tourist-stress-disaster` passed target
    expectations, strict sentinels, `hack:audit` (`hard=0 suspicious=46`),
    and `memory:lint` (`issues=0`). A later explicit `hack:audit` reported
    `hard=0 suspicious=46`, and `memory:lint` stayed clean.
  - Focused guards exact: `seed0014-dequa-fountain-explore`,
    `seed4500-knight-coverage`, `seed5002-wizard-coverage-pair`,
    `seed0108-wizard-extcmd-wishlist`, `seed0030-ten-diverse-deaths`,
    `seed0360-wizard-world-tour`, `seed0361-archeologist-tour`, and
    `seed0367-priest-quest-tour`.
  - Local parity refresh after the repair is checked-in public
    `44/44 S 11405/11405 R 792838/792838 C 0`; cached hosted public remains
    `public-session-drift` at `40/44 S 10417/10982 R 629747/840358 C 0`;
    leaderboard fetch failed in the live refresh.
  - Implementation:
    - Visible pet-hit kill lines can pack after the dismissed hit More without
      creating a second prompt (`C refs: mhitm.c:hitmm()/mdamagem(),
      mon.c:monkilled(), win/tty/topl.c:update_topl()`).
    - `goto_level()` arrival redraw performs `docrt(); flush_screen(-1);`
      before materialize text, and a full-map redraw requested while an old
      More screen is latched must survive until that More is dismissed
      (`C refs: do.c:goto_level(), display.c:docrt(), win/tty/topl.c:more()`).
    - Fatal wand-of-death self-zaps consume confused-direction impairment RNG
      before death handling but do not reach `learnwand()`/Wisdom exercise
      before bones (`C refs: zap.c:dozap()/zapyourself(),
      hack.c:u_maybe_impaired(), end.c:done()`).
  - Remaining checked-in public misses after the refresh: none.
- Scratch trace/checkpoint files are agent-toolkit state and may be committed
  when useful; keep production parity and scratch-tool commits coherent.
- Strict sentinels are exact:
  `5/5 S 1063/1063 R 64569/64569 C 0`.
- Current public classification: checked-in corpus has 44 exact local sessions;
  hosted cache differs from checked-in sessions, and leaderboard state remains
  secondary until refreshed.
- Current sentinel regression classification: none; strict sentinel is exact.
- Hack audit remains `hard=0 suspicious=46`; `memory:lint` reports
  `issues=0`. Production `js/` has no intentional debug I/O or imports from
  `frozen/`.

## Latest Loop Checkpoint

- Latest verified WIP on 2026-06-19:
  - `seed5006-tourist-stress-disaster`: restored exact parity:
    `S 249/249 R 13923/13923 C 0` (pre-fix checked-in frontier was
    `S 131/249 R 8545/13923 C 0`; intermediate repair reached exact screens
    with `R 11009/13923` before the fatal self-zap learning fix).
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed5006-tourist-stress-disaster` passed target
    expectations, strict sentinels, `hack:audit` (`hard=0 suspicious=46`),
    and `memory:lint` (`issues=0`).
  - Focused guards exact: `seed0014-dequa-fountain-explore`,
    `seed4500-knight-coverage`, `seed5002-wizard-coverage-pair`,
    `seed0108-wizard-extcmd-wishlist`, `seed0030-ten-diverse-deaths`,
    `seed0360-wizard-world-tour`, `seed0361-archeologist-tour`, and
    `seed0367-priest-quest-tour`.
  - Local parity refresh:
    checked-in public `44/44 S 11405/11405 R 792838/792838 C 0`;
    cached hosted public `40/44 S 10417/10982 R 629747/840358 C 0`;
    hosted cache remains `public-session-drift`, leaderboard fetch failed.
  - Subsystem truth:
    - Pet-hit kill lines that fit can pack behind the dismissed pet hit More
      and clear prompt ownership without a second More.
    - A full-map redraw requested while a tty More frame is latched is still
      pending after the latched frame renders; the redraw happens after the
      More is dismissed.
    - Fatal WAN_DEATH self-zaps do not reach `learnwand()` before `done(DIED)`
      proceeds into bones; confusion impairment is the last pre-bones RNG.
  - Next visible-public queue: none from checked-in public; continue by
    refreshing live state/brief and looking for protected, hidden, or hack-debt
    frontiers.

- Latest verified WIP on 2026-06-19:
  - `seed0399-wizard-hallu-actions`: restored exact parity after the
    null-`enexto()` placement repair:
    `S 532/532 R 11409/11409 C 0` (pre-fix WIP baseline was
    `S 42/532 R 3979/11409 C 0`).
  - Strict sentinel exact:
    `5/5 S 1063/1063 R 64569/64569 C 0`.
  - `verify --target seed0399-wizard-hallu-actions` passed target
    expectations, strict sentinels, `hack:audit` (`hard=0 suspicious=47`),
    and `memory:lint` (`issues=0`).
  - Focused guards exact: `seed0030-ten-diverse-deaths`,
    `seed0360-wizard-world-tour`, `seed0361-archeologist-tour`,
    `seed0373-barbarian-quest-tour`, and
    `seed0108-wizard-extcmd-wishlist`.
  - Non-exact frontier classification unchanged for `seed4500-knight-coverage`
    (`S 752/1814 R 52801/108275`) and
    `seed5006-tourist-stress-disaster` (`S 131/249 R 8545/13923`).
  - Local parity refresh:
    checked-in public `42/44 S 10225/11405 R 731986/792838 C 0`;
    cached hosted public `38/44 S 9237/10982 R 568895/840358 C 0`;
    hosted cache remains `public-session-drift`, leaderboard fetch failed.
  - Subsystem truth:
    - `teleport.c:enexto()` converts null `mdat` into a fake monster using
      the hero's original monster type before calling `goodpos()`.
    - Special-level random `des.monster()` relocation with `pm == NULL` must
      reject occupied squares, relocate, and then let `makemon(NULL, x, y)`
      consume `rndmonst_adj()` on the relocated square.
  - Next checked-in queue: `seed4500-knight-coverage` and
    `seed5006-tourist-stress-disaster`.

- Older checkpoint history lives in git and `feature_map.md`; keep this file
  focused on the active loop state and next queue.

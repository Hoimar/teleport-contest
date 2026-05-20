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
- Baseline commit before this pass: `d2752ec`.
- Just-completed target: `seed0360-wizard-world-tour`.
- Active hypothesis for the next pass: use the completed Wizard world-tour
  path as evidence, then retarget a shorter sentinel with exact RNG but visible
  drift, likely `seed0383-wizard-hallucinate`.

## Latest Loop Checkpoint

- Target: `seed0360-wizard-world-tour`.
- Current verification: full pass, `S 833/833 R 120639/120639`, `FS -`,
  `FR -`, `C 11`.
- Sentinel verification after the pass: total `S 430/1063 R 38877/64569`.
  `seed8000` and `seed0116` remain full passes; `seed0383` is
  `S 197/219 R 16915/16915`; `seed0002` is
  `S 83/595 R 5690/27158`; `seed0013` remains
  `S 0/99 R 580/4804`.
- Clean-end full verification: `S 1699/11405 R 233570/792838`; hack audit
  `hard=0 suspicious=38`; memory lint was clean before this checkpoint update.
- Implemented subsystem truth in this iteration:
  - `maketrap(WEB)` creates a guarding giant spider before the victim gate in
    ordinary and Mines-End trap creation (`C ref: trap.c:maketrap()`,
    `mklev.c:mktrap()`).
  - Runtime non-vampire shapeshifters now run `decide_to_shapeshift()`'s
    `newcham(NULL)` path, including `mspec_used`, gender, HP-fraction
    preservation, doppel role/guardian/general humanoid form selection, and the
    chameleon animal branch (`C ref: mon.c:decide_to_shapeshift()`,
    `mon.c:select_newcham_form()`, `mon.c:newcham()`,
    `mondata.h:humanoid()`).
  - Level teleport now migrates all nearby `keepdogs(FALSE)` followers, not only
    the tame pet; hostile Wizard/stalker followers arrive through the same
    `mon_arrive(With_you)` denominator shape (`C ref: dog.c:keepdogs()`,
    `dog.c:mon_arrive()`).
  - Wizard evidence menus now use current inventory/spell/object state for the
    late `i`, `+`, `\`, and `^X` pages, including partial
    `spell.c:percent_success()`/`spellretention()`, `skill_based_spellbook_id()`
    discovery rows, live encountered weapon descriptions, and rank/next-XP
    attribute text. Discovery/attribute strings remain limited evidence debt
    rather than a full `o_init.c`/`invent.c`/`pager.c`/`insight.c` port.
  - Delayed speed boots become known on occupation finish; wounded-leg timeout
    handling and restore-time hider catchup remain in the coherent dirty set.
- Production `js/` has no intentional debug I/O or frozen imports.
- Coherent commit pending for: `js/allmain.js`, `js/cmd.js`, `js/display.js`,
  `js/dog.js`, `js/mklev.js`, `js/monmove.js`, `feature_map.md`, `lessons.md`,
  and this checkpoint.
- Next queue:
  - Commit the completed `seed0360` truth after memory lint.
  - Retarget `seed0383-wizard-hallucinate`: RNG is complete, first visible
    blocker is hallucinated new-level map/redraw drift after screen 195/196.

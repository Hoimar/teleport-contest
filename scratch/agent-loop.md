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
- Baseline commit before the completed `seed0383` pass: `b64e22b`.
- Just-completed targets: `seed0383-wizard-hallucinate`,
  `seed0360-wizard-world-tour`, and `seed5002-wizard-coverage-pair` all verify
  as full passes with exact RNG.
- Active hypothesis for the next pass: choose the next non-full sentinel or
  public target after commit; `seed0002-healer-reflection-drummer` is the most
  visible sentinel queue item at `S 83/595 R 5690/27158`.

## Latest Loop Checkpoint

- Target: `seed0383-wizard-hallucinate`.
- Current verification: `S 219/219 R 16915/16915`, `FS -`, `FR -`, `C 0`.
- User-requested regression check: `seed0360-wizard-world-tour` is full again
  under both `npm run verify -- --target seed0360-wizard-world-tour` and
  `bash frozen/score.sh`: `S 833/833 R 120639/120639`, `FS -`, `FR -`, `C 0`.
- Regression classification: the temporary `seed5002` public-suite movement was
  cursor-only at `^G` (`Create what kind of monster?`), fixed by applying the
  tty `getlin()` invisible trailing input-space cursor rule; `seed5002` is back
  to `S 410/410 R 12167/12167`, `C 0`.
- Sentinel verification after the pass: total `S 452/1063 R 38877/64569`.
  `seed8000`, `seed0116`, and `seed0383` remain full passes; `seed0002`
  remains `S 83/595 R 5690/27158`; `seed0013` remains
  `S 0/99 R 580/4804`.
- Frozen public score after the pass: `5/44` passing, `S 1717/11405`,
  `R 233547/792838`. Screen score improved from the last recorded `1699`; the
  lower aggregate RNG total is post-divergence churn in already failing public
  sessions, not a focused-target or sentinel regression.
- Harness checks: hack audit `hard=0 suspicious=39`; memory lint is clean.
- Implemented subsystem truth in this iteration:
  - Monster wear now scans C-like armor slots during creation and turn-time
    wear, with turn-time hallucinated `mon_nam()` side effects.
  - Monster movement now emits visible wield, pickup, and trapped-door
    explosion messages at C-like boundaries, with current weapon/floor object
    names.
  - Inventory, spell, discovery, and insight windows use more live state:
    menu object glyphs consume display RNG, startup spellbooks populate known
    spells, charged rings show enchantment, discovery/attribute dismissals
    redraw like tty text windows, and insight pages include basic HP, XP,
    luck, prayer timeout, magic cancellation, and page row budget behavior.
  - Armor occupation completion marks finished armor known and updates AC at
    the C finish boundary; initial spellbooks are learned through the
    `ini_inv_use_obj()` startup path.
  - TTY `getlin()` prompts with invisible input blanks place the cursor one
    column beyond trimmed visible text for `#wizgenesis`.
- Production `js/` has no intentional debug I/O or frozen imports.
- Coherent commit pending for: `js/allmain.js`, `js/cmd.js`, `js/display.js`,
  `js/mon_wear.js`, `js/monmove.js`, `js/random_text.js`, `js/u_init.js`,
  `feature_map.md`, `lessons.md`, and this checkpoint.
- Next queue:
  - Start a fresh pass on `seed0002-healer-reflection-drummer` unless a newer
    user target arrives. First mismatch remains a live pet/object scan and
    turn-tail movement issue after the ruby-potion naming prompt; use
    `npm run agent:brief -- --target seed0002-healer-reflection-drummer`.

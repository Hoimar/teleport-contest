export async function load(url, context, nextLoad) {
    const result = await nextLoad(url, context);
    let source = String(result.source);
    if (url.endsWith('/js/allmain.js')) source = source.replace(
        `    // C ref: src/allmain.c:moveloop_core().  Automatic Searching runs before
    // warning, trap warnings, and ambient sounds; the return value is ignored.`,
        `    if ((globalThis.__teleportRngTraceIndex || 0) >= 3238 && (globalThis.__teleportRngTraceIndex || 0) <= 3254)
        console.error('[turn-tail-before-search]', JSON.stringify({
            rng: globalThis.__teleportRngTraceIndex || 0,
            moves: g.moves || 0,
            delayed: delayedOccupationPending(g),
            turns: g._occupation_turns_remaining || 0,
            finish: g._occupation_finish_message || '',
            pending: g._pending_message || '',
        }));
    // C ref: src/allmain.c:moveloop_core().  Automatic Searching runs before
    // warning, trap warnings, and ambient sounds; the return value is ignored.`
    );
    if (url.endsWith('/js/allmain.js')) source = source.replace(
        `    if (g.u?.uprops?.searching && !delayedOccupationPending(g)
        && !g.level?.flags?.noautosearch && (g.context?.multi ?? 0) >= 0)
        await dosearch0_basic(true);`,
        `    if (g.u?.uprops?.searching) {
        const traceEntry = {
            rng: globalThis.__teleportRngTraceIndex || 0,
            moves: g.moves || 0,
            delayed: delayedOccupationPending(g),
            turns: g._occupation_turns_remaining || 0,
            finish: g._occupation_finish_message || '',
            noauto: !!g.level?.flags?.noautosearch,
            multi: g.context?.multi ?? 0,
            pending: g._pending_message || '',
        };
        if (traceEntry.rng >= 3238 && traceEntry.rng <= 3254)
            console.error('[autosearch]', JSON.stringify(traceEntry));
    }
    if (g.u?.uprops?.searching && !delayedOccupationPending(g)
        && !g.level?.flags?.noautosearch && (g.context?.multi ?? 0) >= 0)
        await dosearch0_basic(true);`,
    );
    if (url.endsWith('/js/allmain.js')) source = source.replace(
        `    if (await dosounds()) return;
    await finishPostDosoundsTurnTail(g);`,
        `    if ((globalThis.__teleportRngTraceIndex || 0) >= 3238 && (globalThis.__teleportRngTraceIndex || 0) <= 3254)
        console.error('[before-dosounds]', JSON.stringify({
            rng: globalThis.__teleportRngTraceIndex || 0,
            moves: g.moves || 0,
            delayed: delayedOccupationPending(g),
            turns: g._occupation_turns_remaining || 0,
            finish: g._occupation_finish_message || '',
            pending: g._pending_message || '',
        }));
    if (await dosounds()) return;
    if ((globalThis.__teleportRngTraceIndex || 0) >= 3238 && (globalThis.__teleportRngTraceIndex || 0) <= 3256)
        console.error('[before-finish-tail]', JSON.stringify({
            rng: globalThis.__teleportRngTraceIndex || 0,
            moves: g.moves || 0,
            pending: g._pending_message || '',
        }));
    await finishPostDosoundsTurnTail(g);
    if ((globalThis.__teleportRngTraceIndex || 0) >= 3238 && (globalThis.__teleportRngTraceIndex || 0) <= 3258)
        console.error('[after-finish-tail]', JSON.stringify({
            rng: globalThis.__teleportRngTraceIndex || 0,
            moves: g.moves || 0,
            pending: g._pending_message || '',
        }));`,
    );
    if (url.endsWith('/js/rng.js')) {
        source = source
            .replaceAll(
                "if (_rngLogEnabled) _rngLog.push(`rn2(${x})=${val}`);",
                "if (_rngLogEnabled) { _rngLog.push(`rn2(${x})=${val}`); globalThis.__teleportRngTraceIndex = _rngLog.length; }",
            )
            .replaceAll(
                "if (_rngLogEnabled) _rngLog.push(`rnd(${x})=${val}`);",
                "if (_rngLogEnabled) { _rngLog.push(`rnd(${x})=${val}`); globalThis.__teleportRngTraceIndex = _rngLog.length; }",
            )
            .replaceAll(
                "if (_rngLogEnabled) _rngLog.push(`rnl(${x})=${val}`);",
                "if (_rngLogEnabled) { _rngLog.push(`rnl(${x})=${val}`); globalThis.__teleportRngTraceIndex = _rngLog.length; }",
            )
            .replaceAll(
                "if (_rngLogEnabled) _rngLog.push(`d(${n},${x})=${sum}`);",
                "if (_rngLogEnabled) { _rngLog.push(`d(${n},${x})=${sum}`); globalThis.__teleportRngTraceIndex = _rngLog.length; }",
            );
    }
    return { ...result, source };
}

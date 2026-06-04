export async function load(url, context, nextLoad) {
    const result = await nextLoad(url, context);
    if (!url.endsWith('/js/allmain.js')) return result;
    let source = String(result.source);
    const guard = `
function __zeroCurrentTrace(event) {
    const idx = globalThis.__teleportRngTraceIndex || 0;
    const start = globalThis.__zeroCurrentStart ?? -Infinity;
    const end = globalThis.__zeroCurrentEnd ?? Infinity;
    if (idx < start || idx > end) return;
    (globalThis.__zeroCurrentTrace ||= []).push({
        idx,
        moves: game.moves,
        more: !!game._more,
        monsterPaused: !!game._monster_turn_paused_for_more,
        pending: game._pending_message || '',
        fastExtra: !!game._fast_extra_action_pending,
        resumeZero: !!game._resume_zero_move_poly_catchup_after_more,
        spotPause: !!game._spot_effects_more_pauses_zero_move_catchup,
        zeroActive: !!game._zero_move_poly_catchup_active,
        zeroMovement: game._zero_move_poly_movement,
        poly: game.u?._poly_form?.name || '',
        uencumber: game.u?.uencumber || 0,
        stack: String(new Error().stack || '').split('\\n').slice(2, 7).map((line) => line.trim()),
        ...event,
    });
}
`;
    source = source.replace('const PL_NSIZ = 32;', `const PL_NSIZ = 32;\n${guard}`);
    source = source.replace(
        'async function finishZeroMovePolyCatchup(g) {\n    const form = g.u?._poly_form || null;',
        `async function finishZeroMovePolyCatchup(g) {
    __zeroCurrentTrace({ event: 'zero-enter' });
    const form = g.u?._poly_form || null;`
    );
    source = source.replace(
        "        queue_more_prompt();\n        return false;\n    }\n    if (g._more && g._spot_effects_more_pauses_zero_move_catchup) {",
        "        __zeroCurrentTrace({ event: 'zero-no-take-pause' });\n        queue_more_prompt();\n        return false;\n    }\n    if (g._more && g._spot_effects_more_pauses_zero_move_catchup) {"
    );
    source = source.replace(
        '    for (let guard = 0; guard < 20; guard++) {\n        if (creditSpeedGrant()) return true;\n        await advanceTurn();',
        `    for (let guard = 0; guard < 20; guard++) {
        __zeroCurrentTrace({ event: 'zero-loop', guard, movement });
        if (creditSpeedGrant()) {
            __zeroCurrentTrace({ event: 'zero-credit-speed', guard, movement });
            return true;
        }
        await advanceTurn();
        __zeroCurrentTrace({ event: 'zero-after-advance', guard, movement });`
    );
    return { ...result, source };
}

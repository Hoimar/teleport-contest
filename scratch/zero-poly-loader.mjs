export async function load(url, context, nextLoad) {
    const result = await nextLoad(url, context);
    if (!url.endsWith('/js/allmain.js')) return result;
    let source = String(result.source);
    const guard = `
function __zeroPolyTrace(event) {
    const idx = globalThis.__teleportRngTraceIndex || 0;
    const start = globalThis.__zeroPolyStart ?? -Infinity;
    const end = globalThis.__zeroPolyEnd ?? Infinity;
    if (idx >= start && idx <= end) {
        (globalThis.__zeroPolyTrace ||= []).push({
            idx,
            moves: game.moves,
            fastExtra: !!game._fast_extra_action_pending,
            more: !!game._more,
            pending: game._pending_message || '',
            simpleRepeats: game._simple_timed_repeats_remaining || 0,
            contextMulti: game.context?.multi || 0,
            uencumber: game.u?.uencumber || 0,
            poly: game.u?._poly_form?.name || '',
            stack: String(new Error().stack || '').split('\\n').slice(2, 8).map((line) => line.trim()),
            ...event,
        });
    }
}
`;
    source = source.replace('const PL_NSIZ = 32;', `const PL_NSIZ = 32;\n${guard}`);
    source = source.replace(
        'export async function advanceTurn() {\n    const g = game;',
        `export async function advanceTurn() {
    const g = game;
    __zeroPolyTrace({ event: 'advance-enter' });`
    );
    source = source.replace(
        '    if (await dosounds()) return;\n    finishPostDosoundsTurnTail(g);',
        `    __zeroPolyTrace({ event: 'before-dosounds' });
    if (await dosounds()) {
        __zeroPolyTrace({ event: 'dosounds-blocked' });
        return;
    }
    finishPostDosoundsTurnTail(g);
    __zeroPolyTrace({ event: 'advance-exit' });`
    );
    source = source.replace(
        'function applyHeroMovementRation(g) {\n    // C ref: src/allmain.c:u_calc_moveamt().',
        `function applyHeroMovementRation(g) {
    __zeroPolyTrace({ event: 'ration-enter' });
    // C ref: src/allmain.c:u_calc_moveamt().`
    );
    source = source.replace(
        '        g._fast_extra_action_pending = rn2(3) === 0 && !ballDragSuppressesExtra;\n    }\n}',
        `        const __roll = rn2(3);
        g._fast_extra_action_pending = __roll === 0 && !ballDragSuppressesExtra;
        __zeroPolyTrace({ event: 'ration-fast-intrinsic', roll: __roll, ballDragSuppressesExtra });
    }
    __zeroPolyTrace({ event: 'ration-exit' });
}`
    );
    source = source.replace(
        'async function finishZeroMovePolyCatchup(g) {\n    const form = g.u?._poly_form || null;',
        `async function finishZeroMovePolyCatchup(g) {
    __zeroPolyTrace({ event: 'zero-enter' });
    const form = g.u?._poly_form || null;`
    );
    source = source.replace(
        '        if (g._fast_extra_action_pending) {\n            g._fast_extra_action_pending = false;\n            return true;\n        }\n        await advanceTurn();',
        `        __zeroPolyTrace({ event: 'zero-loop', guard });
        if (g._fast_extra_action_pending) {
            __zeroPolyTrace({ event: 'zero-consume-fast', guard });
            g._fast_extra_action_pending = false;
            return true;
        }
        await advanceTurn();`
    );
    source = source.replace(
        '        if (g._more || g._monster_turn_paused_for_more) return false;\n    }\n    return true;\n}',
        `        if (g._more || g._monster_turn_paused_for_more) {
            __zeroPolyTrace({ event: 'zero-paused', guard });
            return false;
        }
    }
    __zeroPolyTrace({ event: 'zero-guard-exit' });
    return true;
}`
    );
    return { ...result, source };
}

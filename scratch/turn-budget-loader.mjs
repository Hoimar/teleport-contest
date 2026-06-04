export async function load(url, context, nextLoad) {
    const result = await nextLoad(url, context);
    if (!url.endsWith('/js/monmove.js')) return result;
    let source = String(result.source);
    const guard = `
function __turnBudgetTrace(event) {
    const idx = globalThis.__teleportRngTraceIndex || 0;
    const start = globalThis.__teleportBudgetStart ?? -Infinity;
    const end = globalThis.__teleportBudgetEnd ?? Infinity;
    if (idx >= start && idx <= end) (globalThis.__teleportBudgetTrace ||= []).push({ idx, ...event });
}
`;
    source = source.replace('const FOOD_CLASS = 7;', `const FOOD_CLASS = 7;\n${guard}`);
    source = source.replace(
        'export function mcalcmove(mtmp, m_moving) {\n    let mmove = mtmp.data.mmove;',
        `export function mcalcmove(mtmp, m_moving) {
    const __beforeMovement = mtmp?.movement ?? 0;
    let mmove = mtmp.data.mmove;`
    );
    source = source.replace(
        '    return mmove;\n}\n\nexport function distfleeck',
        `    __turnBudgetTrace({ event: 'mcalcmove', name: mtmp?.data?.name, x: mtmp?.mx, y: mtmp?.my, beforeMovement: __beforeMovement, result: mmove });
    return mmove;
}

export function distfleeck`
    );
    source = source.replace(
        'export function distfleeck(mtmp) {\n    // C ref: monmove.c:538',
        `export function distfleeck(mtmp) {
    const __distIdx = globalThis.__teleportRngTraceIndex || 0;
    // C ref: monmove.c:538`
    );
    source = source.replace(
        '    return {\n        inrange: d2 <= BOLT_LIM * BOLT_LIM,\n        nearby: monnear_basic(mtmp, targetX, targetY),\n        // Elbereth, sanctuary, and light-fleeing behavior are not modeled yet.\n        scared: false,\n    };\n}',
        `    const __state = {
        inrange: d2 <= BOLT_LIM * BOLT_LIM,
        nearby: monnear_basic(mtmp, targetX, targetY),
        // Elbereth, sanctuary, and light-fleeing behavior are not modeled yet.
        scared: false,
    };
    __turnBudgetTrace({ event: 'distfleeck', callIdx: __distIdx, name: mtmp?.data?.name, x: mtmp?.mx, y: mtmp?.my, movement: mtmp?.movement ?? 0, targetX, targetY, state: __state });
    return __state;
}`
    );
    source = source.replace(
        'async function maybe_finish_post_move_attack(g, mtmp, moveStatus, postMoveState, somebody_can_move) {\n    if (!((moveStatus !== MMOVE_MOVED && moveStatus !== MMOVE_DONE && can_standard_attack_basic(postMoveState))',
        `async function maybe_finish_post_move_attack(g, mtmp, moveStatus, postMoveState, somebody_can_move) {
    const __willAttack = ((moveStatus !== MMOVE_MOVED && moveStatus !== MMOVE_DONE && can_standard_attack_basic(postMoveState))
        || (moveStatus === MMOVE_MOVED && can_attack_after_move_basic(mtmp, postMoveState)));
    __turnBudgetTrace({ event: 'maybe_attack', name: mtmp?.data?.name, x: mtmp?.mx, y: mtmp?.my, movement: mtmp?.movement ?? 0, moveStatus, state: postMoveState, willAttack: __willAttack });
    if (!((moveStatus !== MMOVE_MOVED && moveStatus !== MMOVE_DONE && can_standard_attack_basic(postMoveState))`
    );
    source = source.replace(
        '        if (mtmp.movement < NORMAL_SPEED) continue;',
        `        if (mtmp.movement < NORMAL_SPEED) {
            __turnBudgetTrace({ event: 'skip-low-movement', name: mtmp?.data?.name, x: mtmp?.mx, y: mtmp?.my, movement: mtmp?.movement ?? 0 });
            continue;
        }`
    );
    source = source.replace(
        '        mtmp.movement -= NORMAL_SPEED;\n        if (mtmp.movement >= NORMAL_SPEED) somebody_can_move = true;',
        `        __turnBudgetTrace({ event: 'spend-movement-before', name: mtmp?.data?.name, x: mtmp?.mx, y: mtmp?.my, movement: mtmp?.movement ?? 0 });
        mtmp.movement -= NORMAL_SPEED;
        __turnBudgetTrace({ event: 'spend-movement-after', name: mtmp?.data?.name, x: mtmp?.mx, y: mtmp?.my, movement: mtmp?.movement ?? 0 });
        if (mtmp.movement >= NORMAL_SPEED) somebody_can_move = true;`
    );
    return { ...result, source };
}

export async function load(url, context, defaultLoad) {
    const result = await defaultLoad(url, context, defaultLoad);
    if (result.format !== 'module') return result;
    let source = typeof result.source === 'string'
        ? result.source
        : result.source ? Buffer.from(result.source).toString('utf8') : '';
    if (!source) return result;

    const traceGuard = "globalThis.__teleportCombatStatusTrace && (!globalThis.__teleportCombatStatusTraceMove || (game.moves || 0) >= globalThis.__teleportCombatStatusTraceMove)";

    if (url.endsWith('/js/monmove.js')) {
        source = source.replace(
            'async function show_blocking_monster_message(line) {\n    if (!line) return;',
            `async function show_blocking_monster_message(line) {
    if (${traceGuard}) console.log('[show-blocking-enter]', JSON.stringify({
        moves: game.moves || 0,
        line,
        pending: game._pending_message || '',
        after: game._after_more_message || '',
        more: !!game._more,
        followupNeedsMore: !!game._monster_followup_physical_topline_needs_more,
        nomovemsg: game._nomovemsg || '',
    }));
    if (!line) return;`
        );
        source = source.replace(
            'if (followupPhysicalNeedsMore) {\n        game._monster_followup_physical_topline_needs_more = false;\n        queue_more_prompt();',
            `if (followupPhysicalNeedsMore) {
        if (${traceGuard}) console.log('[show-blocking-followup-more]', JSON.stringify({
            moves: game.moves || 0,
            line,
            pending: game._pending_message || '',
            more: !!game._more,
        }));
        game._monster_followup_physical_topline_needs_more = false;
        queue_more_prompt();`
        );
        source = source.replace(
            'function apply_monster_hit_adtyp_basic(mtmp, attack, rawDamage, hitMessages = null) {\n    const [, adtyp] = attack || [];',
            `function apply_monster_hit_adtyp_basic(mtmp, attack, rawDamage, hitMessages = null) {
    const [, adtyp] = attack || [];
    if (${traceGuard}) console.log('[adtyp-enter]', JSON.stringify({
        moves: game.moves || 0,
        mon: mtmp?.data?.name,
        attack,
        rawDamage,
        hp: game.u?.uhp,
        hpmax: game.u?.uhpmax,
        pw: game.u?.uen,
        pwmax: game.u?.uenmax,
        level: game.u?.ulevel,
        xp: game.u?.uexp,
        attrs: game.u?.acurr?.a || null,
        pending: game._pending_message || '',
        after: game._after_more_message || '',
        more: !!game._more,
    }));`
        );
        source = source.replaceAll(
            'damage = apply_monster_hit_adtyp_basic(mtmp, attack, damage, hitMessages);',
            `damage = apply_monster_hit_adtyp_basic(mtmp, attack, damage, hitMessages);
            if (${traceGuard}) console.log('[adtyp-exit]', JSON.stringify({
                moves: game.moves || 0,
                mon: mtmp?.data?.name,
                attack,
                damage,
                hitMessages,
                hp: game.u?.uhp,
                hpmax: game.u?.uhpmax,
                pw: game.u?.uen,
                pwmax: game.u?.uenmax,
                level: game.u?.ulevel,
                xp: game.u?.uexp,
                attrs: game.u?.acurr?.a || null,
                pending: game._pending_message || '',
                after: game._after_more_message || '',
                more: !!game._more,
            }));`
        );
        source = source.replaceAll(
            'damage = apply_monster_hit_adtyp_basic(mtmp, attack, damage, poisonMessages);',
            `damage = apply_monster_hit_adtyp_basic(mtmp, attack, damage, poisonMessages);
            if (${traceGuard}) console.log('[deferred-adtyp-exit]', JSON.stringify({
                moves: game.moves || 0,
                mon: mtmp?.data?.name,
                attack,
                damage,
                poisonMessages,
                hp: game.u?.uhp,
                hpmax: game.u?.uhpmax,
                pw: game.u?.uen,
                pwmax: game.u?.uenmax,
                level: game.u?.ulevel,
                xp: game.u?.uexp,
                attrs: game.u?.acurr?.a || null,
                pending: game._pending_message || '',
                after: game._after_more_message || '',
                more: !!game._more,
            }));`
        );
        source = source.replace(
            'export async function finish_deferred_monster_physical_attack() {\n    const pending = game._deferred_monster_physical_attack;',
            `export async function finish_deferred_monster_physical_attack() {
    if (${traceGuard}) console.log('[finish-deferred-physical]', JSON.stringify({
        moves: game.moves || 0,
        pending: game._deferred_monster_physical_attack || null,
        hp: game.u?.uhp,
        hpmax: game.u?.uhpmax,
        pw: game.u?.uen,
        pwmax: game.u?.uenmax,
        level: game.u?.ulevel,
        xp: game.u?.uexp,
        attrs: game.u?.acurr?.a || null,
        msg: game._pending_message || '',
        after: game._after_more_message || '',
        more: !!game._more,
    }));
    const pending = game._deferred_monster_physical_attack;`
        );
    }

    if (url.endsWith('/js/cmd.js')) {
        source = source.replace(
            'game._monster_followup_physical_topline_needs_more = true;',
            `game._monster_followup_physical_topline_needs_more = true;
                    if (${traceGuard}) console.log('[set-followup-physical-more]', JSON.stringify({
                        moves: game.moves || 0,
                        msg,
                        pending: game._pending_message || '',
                        after: game._after_more_message || '',
                        more: !!game._more,
                    }));`
        );
    }

    if (url.endsWith('/js/display.js')) {
        source = source.replace(
            'export async function pline(msg) {\n    game._topline_residue = \'\';',
            `export async function pline(msg) {
    if (${traceGuard} && game._monster_followup_physical_topline_needs_more)
        console.log('[pline-with-followup-marker]', JSON.stringify({
            moves: game.moves || 0,
            msg,
            pending: game._pending_message || '',
            after: game._after_more_message || '',
            more: !!game._more,
            stack: (new Error()).stack?.split('\\n').slice(1, 5),
        }));
    game._topline_residue = '';`
        );
    }

    if (url.endsWith('/js/allmain_turns.js')) {
        source = source.replace(
            'export function exerchk(moveNumber = (game.moves || 1) + 1) {\n    // C ref: attrib.c:exerper().',
            `export function exerchk(moveNumber = (game.moves || 1) + 1) {
    if (${traceGuard}) console.log('[exerchk-enter]', JSON.stringify({
        moves: game.moves || 0,
        moveNumber,
        hp: game.u?.uhp,
        hpmax: game.u?.uhpmax,
        pw: game.u?.uen,
        pwmax: game.u?.uenmax,
        level: game.u?.ulevel,
        xp: game.u?.uexp,
        attrs: game.u?.acurr?.a || null,
        aexe: game.u?.aexe || null,
        next: game.context?.next_attrib_check,
    }));
    // C ref: attrib.c:exerper().`
        );
        source = source.replace(
            '    context.next_attrib_check += rn2(200) + 800;\n}',
            `    context.next_attrib_check += rn2(200) + 800;
    if (${traceGuard}) console.log('[exerchk-exit]', JSON.stringify({
        moves: game.moves || 0,
        hp: game.u?.uhp,
        hpmax: game.u?.uhpmax,
        pw: game.u?.uen,
        pwmax: game.u?.uenmax,
        level: game.u?.ulevel,
        xp: game.u?.uexp,
        attrs: game.u?.acurr?.a || null,
        aexe: game.u?.aexe || null,
        next: game.context?.next_attrib_check,
    }));
}`
        );
    }

    return { ...result, source };
}

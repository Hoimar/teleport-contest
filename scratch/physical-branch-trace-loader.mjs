export async function load(url, context, defaultLoad) {
    const result = await defaultLoad(url, context, defaultLoad);
    if (result.format !== 'module' || !url.endsWith('/js/monmove.js')) return result;
    let source = typeof result.source === 'string'
        ? result.source
        : result.source ? Buffer.from(result.source).toString('utf8') : '';
    if (!source) return result;

    const guard = "(game.moves || 0) >= Number(process.env.TRACE_PHYS_MOVE || 0)";
    const state = `{
        moves: game.moves || 0,
        mon: mtmp?.data?.name,
        i,
        displayLine,
        hitMessages: [...hitMessages],
        pending: game._pending_message || '',
        after: game._after_more_message || '',
        afterNeeds: !!game._after_more_needs_prompt,
        more: !!game._more,
        latchedTailStart,
    }`;

    source = source.replace(
        "const displayLine = [hiddenLine, line].filter(Boolean).join('  ');",
        `const displayLine = [hiddenLine, line].filter(Boolean).join('  ');
            if (${guard} && (displayLine || hitMessages.length || game._pending_message))
                console.log('[phys-line]', JSON.stringify(${state}));`,
    );
    source = source.replace(
        "if (!tty_topline_can_pack_message_basic(pendingPrefix, displayLine)) {\n                    // C refs: src/mhitu.c:hitmu(), win/tty/topl.c:update_topl().",
        `if (!tty_topline_can_pack_message_basic(pendingPrefix, displayLine)) {
                    if (${guard}) console.log('[phys-pending-overflow]', JSON.stringify({ ...${state}, pendingPrefix }));
                    // C refs: src/mhitu.c:hitmu(), win/tty/topl.c:update_topl().`,
    );
    source = source.replace(
        "if (!tty_topline_can_pack_message_basic(pendingPrefix, displayLine)\n                    && await latch_monster_attack_more_frame(pendingPrefix)) {",
        `if (!tty_topline_can_pack_message_basic(pendingPrefix, displayLine)
                    && ((${guard}) ? (console.log('[phys-generic-overflow]', JSON.stringify({ ...${state}, pendingPrefix })), true) : true)
                    && await latch_monster_attack_more_frame(pendingPrefix)) {`,
    );
    source = source.replace(
        "if (passiveBlock) {\n                            if (!passiveBlock.passiveVisible",
        `if (passiveBlock) {
                            if (${guard}) console.log('[phys-passive-block]', JSON.stringify({ ...${state}, passiveOutcome, passivePrefix, passiveBlock }));
                            if (!passiveBlock.passiveVisible`,
    );
    source = source.replace(
        "if (latchedTailStart != null && !game._after_more_message) {\n        game._after_more_message = hitMessages.slice(latchedTailStart).join('  ');",
        `if (latchedTailStart != null && !game._after_more_message) {
        if (${guard}) console.log('[phys-tail-final]', JSON.stringify({
            moves: game.moves || 0,
            hitMessages: [...hitMessages],
            pending: game._pending_message || '',
            more: !!game._more,
            latchedTailStart,
        }));
        game._after_more_message = hitMessages.slice(latchedTailStart).join('  ');`,
    );
    source = source.replace(
        "function append_deferred_physical_attack_line(line) {\n    if (!line) return;",
        `function append_deferred_physical_attack_line(line) {
    if (${guard}) console.log('[append-deferred-line-enter]', JSON.stringify({
        moves: game.moves || 0,
        line,
        pending: game._pending_message || '',
        after: game._after_more_message || '',
        afterNeeds: !!game._after_more_needs_prompt,
        more: !!game._more,
    }));
    if (!line) return;`,
    );
    source = source.replace(
        "game._after_more_needs_prompt = true;\n            game._monster_topline_deferred = true;\n            return;",
        `game._after_more_needs_prompt = true;
            if (${guard}) console.log('[append-deferred-line-needs]', JSON.stringify({
                moves: game.moves || 0,
                line,
                pending: game._pending_message || '',
                after: game._after_more_message || '',
                more: !!game._more,
            }));
            game._monster_topline_deferred = true;
            return;`,
    );

    return { ...result, source };
}

export async function load(url, context, defaultLoad) {
    const result = await defaultLoad(url, context, defaultLoad);
    if (!url.endsWith('/js/monmove.js')) return result;
    let source = typeof result.source === 'string'
        ? result.source
        : result.source ? Buffer.from(result.source).toString('utf8') : '';
    if (!source) return result;
    source = source.replace(
        "async function show_blocking_monster_message(line) {\n    if (!line) return;",
        `async function show_blocking_monster_message(line) {
    if ((line || '').includes('soldier ant') || (game._pending_message || '').includes('soldier ant')) console.log('[block-entry]', JSON.stringify({moves:game.moves||0,line,pending:game._pending_message||'',more:!!game._more,after:game._after_more_message||'',tail:!!(game._monster_attack_tail_pending_pack && game._after_more_message),len:String((game._pending_message || '') + '  ' + (line || '')).length}));
    if (!line) return;`,
    );
    source = source.replace(
        "if (monster_attack_tail_pack_pending()) {\n        await append_monster_effect_topline(line, { needsPrompt: true });\n        return;\n    }",
        `if (monster_attack_tail_pack_pending()) {
        if ((line || '').includes('soldier ant') || (game._pending_message || '').includes('soldier ant')) console.log('[block-branch]', 'tail_pack');
        await append_monster_effect_topline(line, { needsPrompt: true });
        return;
    }`,
    );
    source = source.replace(
        "if (pendingPetCombatBoundary && game._pending_message && !game._more) {\n        game._pet_combat_pending_boundary = false;",
        `if (pendingPetCombatBoundary && game._pending_message && !game._more) {
        if ((line || '').includes('soldier ant') || (game._pending_message || '').includes('soldier ant')) console.log('[block-branch]', 'pet_boundary');
        game._pet_combat_pending_boundary = false;`,
    );
    source = source.replace(
        "if (/^You (miss|hit) /.test(game._pending_message || '') && !game._more\n        && `${game._pending_message}  ${line}`.length < 80) {\n        game._pending_message = `${game._pending_message}  ${line}`;",
        "if (/^You (miss|hit) /.test(game._pending_message || '') && !game._more\n        && `${game._pending_message}  ${line}`.length < 80) {\n        if ((line || '').includes('soldier ant') || (game._pending_message || '').includes('soldier ant')) console.log('[block-branch]', 'you_hit_pack');\n        game._pending_message = `${game._pending_message}  ${line}`;",
    );
    source = source.replace(
        "if (game._pending_message && !game._more && `${game._pending_message}  ${line}`.length < 80) {\n        if (game._savelife_resume_followup_more_shown",
        "if (game._pending_message && !game._more && `${game._pending_message}  ${line}`.length < 80) {\n        if ((line || '').includes('soldier ant') || (game._pending_message || '').includes('soldier ant')) console.log('[block-branch]', 'generic_pack_start');\n        if (game._savelife_resume_followup_more_shown",
    );
    source = source.replace(
        "if (game._pending_message && !game._more) {\n        // C ref: win/tty/topl.c:update_topl().",
        "if (game._pending_message && !game._more) {\n        if ((line || '').includes('soldier ant') || (game._pending_message || '').includes('soldier ant')) console.log('[block-branch]', 'generic_defer');\n        // C ref: win/tty/topl.c:update_topl().",
    );
    return { ...result, source };
}

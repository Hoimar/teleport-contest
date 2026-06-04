export async function load(url, context, defaultLoad) {
    const result = await defaultLoad(url, context, defaultLoad);
    if (!url.endsWith('/js/monmove.js')) return result;
    let source = typeof result.source === 'string'
        ? result.source
        : result.source ? Buffer.from(result.source).toString('utf8') : '';
    if (!source) return result;
    source = source.replace(
        "async function show_blocking_monster_message(line) {\n    if (!line) return;",
        "async function show_blocking_monster_message(line) {\n    if ((line || '').includes('soldier ant') || (line || '').includes('straw golem') || (game._pending_message || '').includes('soldier ant')) console.log('[savelife-blocking]', JSON.stringify({moves:game.moves||0,line,pending:game._pending_message||'',more:!!game._more,nomove:game._nomovemsg||'',shown:!!game._savelife_resume_followup_more_shown,silent:!!game._life_saving_silent_monster_resume,after:game._after_more_message||''}));\n    if (!line) return;",
    );
    source = source.replace(
        "if (game._savelife_resume_followup_more_shown) {\n            // C refs: src/end.c:savelife(), win/tty/topl.c:update_topl().",
        "if (game._savelife_resume_followup_more_shown) {\n            console.log('[savelife-first-only]', JSON.stringify({moves:game.moves||0,line,pending:game._pending_message||''}));\n            // C refs: src/end.c:savelife(), win/tty/topl.c:update_topl().",
    );
    source = source.replace(
        "if (game._savelife_resume_followup_more_shown\n            && is_simple_monster_hit_you_chain(game._pending_message)",
        "if (game._savelife_resume_followup_more_shown\n            && is_simple_monster_hit_you_chain(game._pending_message)",
    );
    return { ...result, source };
}

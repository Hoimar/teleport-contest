export async function load(url, context, defaultLoad) {
    const result = await defaultLoad(url, context, defaultLoad);
    if (!url.endsWith('/js/display.js')) return result;
    let source = typeof result.source === 'string'
        ? result.source
        : result.source ? Buffer.from(result.source).toString('utf8') : '';
    if (!source) return result;
    source = source.replace(
        "export function queue_more_prompt(count = 1) {\n    game._more_dismissals_remaining",
        "export function queue_more_prompt(count = 1) {\n    if ((game._pending_message || '').includes('soldier ant') && (game.moves || 0) >= 7) console.log('[queue-more-stack]', JSON.stringify({moves:game.moves||0,pending:game._pending_message||'',after:game._after_more_message||'',stack:(new Error()).stack.split('\\n').slice(1,7)}));\n    game._more_dismissals_remaining",
    );
    return { ...result, source };
}

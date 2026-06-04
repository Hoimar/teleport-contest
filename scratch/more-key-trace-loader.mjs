export async function load(url, context, defaultLoad) {
    if (process.env.TRACE_MORE_KEYS) globalThis.__teleportMoreKeyTrace = true;
    const result = await defaultLoad(url, context, defaultLoad);
    if (!url.endsWith('/js/cmd.js')) return result;
    let source = typeof result.source === 'string'
        ? result.source
        : result.source ? Buffer.from(result.source).toString('utf8') : '';
    if (!source) return result;
    source = source.replace(
        "    let ch = String.fromCharCode(key);\n",
        "    let ch = String.fromCharCode(key);\n    if (globalThis.__teleportMoreKeyTrace) {\n        const prev = game._override_prev || '';\n        console.log('[more-key]', JSON.stringify({\n            rng: game.rng?.count ?? game.rng?.idx ?? null,\n            moves: game.moves || 0,\n            key: ch,\n            more: !!game._more,\n            dismissals: game._more_dismissals_remaining || 0,\n            pending: game._pending_message || '',\n            overridePrev: !!game._override_prev,\n            overrideHasMore: typeof prev === 'string' && prev.includes('--More--'),\n            latched: !!game._latched_more_screen,\n            latchedKeep: !!game._latched_more_keep_until_dismiss,\n        }));\n    }\n",
    );
    return { ...result, source };
}

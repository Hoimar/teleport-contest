export async function load(url, context, defaultLoad) {
    const result = await defaultLoad(url, context);
    if (result.format !== 'module') return result;
    let source = String(result.source);
    if (url.endsWith('/js/display.js')) {
        source = source.replace(
            "export async function flush_screen(mode) {\n    const fullMap = !!game._full_map_redraw_pending;\n    game._full_map_redraw_pending = false;\n    _buildScreenOutput({ fullMap });\n}",
            "export async function flush_screen(mode) {\n    const fullMap = !!game._full_map_redraw_pending;\n    if (process.env.__teleportTraceStartupFlush && (game.moves || 0) <= 1) console.log(`[flush:before] mode=${mode} full=${fullMap} pending=${JSON.stringify(game._pending_message || '')} more=${!!game._more} override=${!!game._override_screen} ser=${!!game._override_serialized_screen} serPersist=${!!game._override_serialized_persistent} latched=${!!game._latched_more_screen}`);\n    game._full_map_redraw_pending = false;\n    _buildScreenOutput({ fullMap });\n    if (process.env.__teleportTraceStartupFlush && (game.moves || 0) <= 1) {\n        const rows = (game.nhDisplay?.terminal?.serialize?.() || '').split('\\n');\n        console.log(`[flush:after] row0=${JSON.stringify(rows[0] || '')} row2=${JSON.stringify(rows[2] || '')} row17=${JSON.stringify(rows[17] || '')}`);\n    }\n}",
        );
    }
    if (url.endsWith('/js/jsmain.js')) {
        source = source.replace(
            "nhGame._screens.push(term?.serialize ? term.serialize() : '');",
            "const __screenForTrace = term?.serialize ? term.serialize() : '';\n            if (process.env.__teleportTraceStartupFlush && nhGame._screens.length <= 13) {\n                const __rows = __screenForTrace.split('\\n');\n                console.log(`[capture] idx=${nhGame._screens.length} keyIdx=${keyIdx} row0=${JSON.stringify(__rows[0] || '')} row2=${JSON.stringify(__rows[2] || '')} row17=${JSON.stringify(__rows[17] || '')} override=${!!game._override_screen} ser=${!!game._override_serialized_screen} serPersist=${!!game._override_serialized_persistent} latched=${!!game._latched_more_screen}`);\n            }\n            nhGame._screens.push(__screenForTrace);",
        );
    }
    return { ...result, source };
}

export async function load(url, context, nextLoad) {
    const result = await nextLoad(url, context);
    if (!url.endsWith('/js/allmain_turns.js')) return result;

    let source = String(result.source);
    source = source.replace(
        'export function adjalign(n) {\n    const u = game.u || (game.u = {});\n    const align = u.ualign || (u.ualign = { type: 0, record: 0, abuse: 0 });',
        `export function adjalign(n) {
    const u = game.u || (game.u = {});
    const align = u.ualign || (u.ualign = { type: 0, record: 0, abuse: 0 });
    const __before = align.record ?? 0;
    const __entry = {
        screen: globalThis.__alignTraceScreen ?? null,
        moves: game.moves,
        delta: n,
        before: __before,
        stack: String(new Error().stack || '').split('\\n').slice(2, 8).map((line) => line.trim()),
    };
    (globalThis.__alignTrace ||= []).push(__entry);`
    );
    source = source.replace(
        `    } else if (newalign > align.record) {
        const alignlim = 10 + Math.trunc((game.moves || 0) / 200);
        align.record = Math.min(newalign, alignlim);
    }
}`,
        `    } else if (newalign > align.record) {
        const alignlim = 10 + Math.trunc((game.moves || 0) / 200);
        align.record = Math.min(newalign, alignlim);
    }
    __entry.after = align.record;
}`
    );
    return { ...result, source };
}

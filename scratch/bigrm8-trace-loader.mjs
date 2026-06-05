export async function load(url, context, nextLoad) {
    const result = await nextLoad(url, context);

    if (url.endsWith('/js/rng.js')) {
        let source = String(result.source);
        source = source.replace(
            "export function pushRngLogEntry(entry) { if (_rngLogEnabled) _rngLog.push(entry); }",
            `export function pushRngLogEntry(entry) { if (_rngLogEnabled) _rngLog.push(entry); }

function __bigrm8TraceRngEntry(entry) {
    globalThis.__teleportRngTraceIndex = (globalThis.__teleportRngTraceIndex || 0) + 1;
    if (_rngLogEnabled) _rngLog.push(entry);
}`
        );
        source = source.replaceAll("if (_rngLogEnabled) _rngLog.push(`rn2(${x})=${val}`);", "__bigrm8TraceRngEntry(`rn2(${x})=${val}`);");
        source = source.replaceAll("if (_rngLogEnabled) _rngLog.push(`rnd(${x})=${val}`);", "__bigrm8TraceRngEntry(`rnd(${x})=${val}`);");
        source = source.replaceAll("if (_rngLogEnabled) _rngLog.push(`rnl(${x})=${val}`);", "__bigrm8TraceRngEntry(`rnl(${x})=${val}`);");
        source = source.replaceAll("if (_rngLogEnabled) _rngLog.push(`d(${n},${x})=${sum}`);", "__bigrm8TraceRngEntry(`d(${n},${x})=${sum}`);");
        source = source.replaceAll("if (_rngLogEnabled) _rngLog.push(`rne(${x})=${tmp}`);", "__bigrm8TraceRngEntry(`rne(${x})=${tmp}`);");
        source = source.replaceAll("if (_rngLogEnabled) _rngLog.push(`rnz(${i})=${x}`);", "__bigrm8TraceRngEntry(`rnz(${i})=${x}`);");
        return { ...result, source };
    }

    if (url.endsWith('/js/mklev.js')) {
        let source = String(result.source);
        source = source.replace(
            '    return makemon(ptr, x, y, mmflags);\n}',
            `    const __bigrm8Req = { x, y, ptr: ptr?.name || null, mmflags };
    const __bigrm8Before = globalThis.__teleportRngTraceIndex || 0;
    const __bigrm8Mon = makemon(ptr, x, y, mmflags);
    if (game._last_special_protofile === 'bigrm-8') {
        const __bigrm8After = globalThis.__teleportRngTraceIndex || 0;
        console.log('[bigrm8-mon]', JSON.stringify({
            rng: __bigrm8Before,
            rngAfter: __bigrm8After,
            req: __bigrm8Req,
            mon: __bigrm8Mon ? {
                id: __bigrm8Mon.m_id,
                name: __bigrm8Mon.data?.name || null,
                x: __bigrm8Mon.mx,
                y: __bigrm8Mon.my,
                m_ap_type: __bigrm8Mon.m_ap_type,
                mappearance: __bigrm8Mon.mappearance,
                mundetected: __bigrm8Mon.mundetected,
                sleeping: __bigrm8Mon.msleeping,
            } : null,
        }));
    }
    return __bigrm8Mon;
}`
        );
        source = source.replace(
            '    if (flp) flip_level(flp);\n    return flp;\n}',
            `    if (flp) flip_level(flp);
    if (game._last_special_protofile === 'bigrm-8') {
        console.log('[bigrm8-flip]', JSON.stringify({
            rng: globalThis.__teleportRngTraceIndex || 0,
            allow_flips,
            flp,
            ext: get_level_extends(),
            monsters: (game.level?.monsters || []).map((mon) => ({
                id: mon.m_id,
                name: mon.data?.name || null,
                x: mon.mx,
                y: mon.my,
                m_ap_type: mon.m_ap_type,
                mappearance: mon.mappearance,
                mundetected: mon.mundetected,
            })),
        }));
    }
    return flp;
}`
        );
        return { ...result, source };
    }

    return result;
}

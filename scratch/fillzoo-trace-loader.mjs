export async function load(url, context, nextLoad) {
    const result = await nextLoad(url, context);

    if (url.endsWith('/js/rng.js')) {
        let source = String(result.source);
        source = source.replace(
            "export function pushRngLogEntry(entry) { if (_rngLogEnabled) _rngLog.push(entry); }",
            `export function pushRngLogEntry(entry) { if (_rngLogEnabled) _rngLog.push(entry); }

function __fillZooTraceRngEntry(entry) {
    globalThis.__teleportRngTraceIndex = (globalThis.__teleportRngTraceIndex || 0) + 1;
    if (_rngLogEnabled) _rngLog.push(entry);
}`
        );
        source = source.replaceAll("if (_rngLogEnabled) _rngLog.push(`rn2(${x})=${val}`);", "__fillZooTraceRngEntry(`rn2(${x})=${val}`);");
        source = source.replaceAll("if (_rngLogEnabled) _rngLog.push(`rnd(${x})=${val}`);", "__fillZooTraceRngEntry(`rnd(${x})=${val}`);");
        source = source.replaceAll("if (_rngLogEnabled) _rngLog.push(`rnl(${x})=${val}`);", "__fillZooTraceRngEntry(`rnl(${x})=${val}`);");
        source = source.replaceAll("if (_rngLogEnabled) _rngLog.push(`d(${n},${x})=${sum}`);", "__fillZooTraceRngEntry(`d(${n},${x})=${sum}`);");
        source = source.replaceAll("if (_rngLogEnabled) _rngLog.push(`rne(${x})=${tmp}`);", "__fillZooTraceRngEntry(`rne(${x})=${tmp}`);");
        source = source.replaceAll("if (_rngLogEnabled) _rngLog.push(`rnz(${i})=${x}`);", "__fillZooTraceRngEntry(`rnz(${i})=${x}`);");
        return { ...result, source };
    }

    if (url.endsWith('/js/mklev.js')) {
        let source = String(result.source);
        source = source.replace(
            `            let mdat = null;
            if (type === COURT) mdat = courtmon();`,
            `            console.log('[fillzoo-cell]', JSON.stringify({
                rng: globalThis.__teleportRngTraceIndex || 0,
                type,
                sx,
                sy,
                locTyp: loc?.typ,
                roomno: loc?.roomno,
                edge: loc?.edge,
                door,
                occupied: occupied(sx, sy),
                monAt: !!m_at(sx, sy),
                objects: (game.level?.objects || []).filter((obj) => obj.ox === sx && obj.oy === sy).map((obj) => obj.otyp),
                traps: (game.level?.traps || []).filter((trap) => trap.tx === sx && trap.ty === sy).map((trap) => trap.ttyp),
            }));
            let mdat = null;
            if (type === COURT) mdat = courtmon();`
        );
        source = source.replace(
            `            makemon(mdat, sx, sy, MM_ASLEEP | MM_NOGRP);
            const mon = game.level.monsters?.[0];`,
            `            const __fillZooBeforeMakemon = globalThis.__teleportRngTraceIndex || 0;
            const __fillZooMon = makemon(mdat, sx, sy, MM_ASLEEP | MM_NOGRP);
            console.log('[fillzoo-mon]', JSON.stringify({
                rng: __fillZooBeforeMakemon,
                rngAfter: globalThis.__teleportRngTraceIndex || 0,
                sx,
                sy,
                ptr: mdat?.name || null,
                mon: __fillZooMon ? { id: __fillZooMon.m_id, name: __fillZooMon.data?.name, x: __fillZooMon.mx, y: __fillZooMon.my } : null,
            }));
            const mon = game.level.monsters?.[0];`
        );
        source = source.replace(
            `                if (amountRange >= goldlim) amountRange = 5 * level_difficulty();
                goldlim -= amountRange;
                mkgold(rn1(amountRange, 10), sx, sy);`,
            `                if (amountRange >= goldlim) amountRange = 5 * level_difficulty();
                goldlim -= amountRange;
                console.log('[fillzoo-gold]', JSON.stringify({
                    rng: globalThis.__teleportRngTraceIndex || 0,
                    sx,
                    sy,
                    amountRange,
                    goldlim,
                }));
                mkgold(rn1(amountRange, 10), sx, sy);`
        );
        return { ...result, source };
    }

    return result;
}

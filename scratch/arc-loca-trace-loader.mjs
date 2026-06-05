export async function load(url, context, nextLoad) {
    const result = await nextLoad(url, context);
    if (url.endsWith('/js/rng.js')) {
        let source = String(result.source);
        source = source.replace(
            "export function pushRngLogEntry(entry) { if (_rngLogEnabled) _rngLog.push(entry); }",
            "export function pushRngLogEntry(entry) { if (_rngLogEnabled) _rngLog.push(entry); }\nfunction __arcTraceRngEntry(entry) { const idx = globalThis.__teleportRngTraceIndex || 0; globalThis.__teleportRngTraceIndex = idx + 1; if (_rngLogEnabled) _rngLog.push(entry); }"
        );
        source = source.replaceAll("if (_rngLogEnabled) _rngLog.push(`rn2(${x})=${val}`);", "__arcTraceRngEntry(`rn2(${x})=${val}`);");
        source = source.replaceAll("if (_rngLogEnabled) _rngLog.push(`rnd(${x})=${val}`);", "__arcTraceRngEntry(`rnd(${x})=${val}`);");
        source = source.replaceAll("if (_rngLogEnabled) _rngLog.push(`rnl(${x})=${val}`);", "__arcTraceRngEntry(`rnl(${x})=${val}`);");
        source = source.replaceAll("if (_rngLogEnabled) _rngLog.push(`d(${n},${x})=${sum}`);", "__arcTraceRngEntry(`d(${n},${x})=${sum}`);");
        source = source.replaceAll("if (_rngLogEnabled) _rngLog.push(`rne(${x})=${tmp}`);", "__arcTraceRngEntry(`rne(${x})=${tmp}`);");
        source = source.replaceAll("if (_rngLogEnabled) _rngLog.push(`rnz(${i})=${x}`);", "__arcTraceRngEntry(`rnz(${i})=${x}`);");
        return { ...result, source };
    }
    if (!url.endsWith('/js/mklev.js')) return result;
    let source = String(result.source);
    source = source.replace(
        `function arcLocaMonsterLocation(ptr) {
    let x = ARC_LOCA_X, y = ARC_LOCA_Y;
    let trycnt = 0;
    do {
        x = ARC_LOCA_X + rn2(ARC_LOCA_MAP[0].length);
        y = ARC_LOCA_Y + rn2(ARC_LOCA_MAP.length);
        if (specialMonsterLocationOk(x, y, ptr)) return { x, y };
    } while (++trycnt < 100);
    return arcLocaDryLocation();
}`,
        `function arcLocaMonsterLocation(ptr) {
    let x = ARC_LOCA_X, y = ARC_LOCA_Y;
    let trycnt = 0;
    const __trace = (event) => {
        const rng = globalThis.__teleportRngTraceIndex || 0;
        if (rng < 23960 || rng > 24045) return;
        const loc = game.level?.at(x, y);
        const boulder = sobj_at(BOULDER, x, y);
        console.error('[arc-loca-monloc]', JSON.stringify({
            rng, trycnt, ptr: ptr?.name || null, mlet: ptr?.mlet || null,
            x, y, lx: x - ARC_LOCA_X, ly: y - ARC_LOCA_Y,
            typ: loc?.typ, boulder: !!boulder, boulderTyp: boulder?.otyp,
            monster: m_at(x, y)?.data?.name || null,
            trap: game.level?.traps?.find?.((t) => t.tx === x && t.ty === y)?.ttyp ?? null,
            ...event,
        }));
    };
    do {
        x = ARC_LOCA_X + rn2(ARC_LOCA_MAP[0].length);
        y = ARC_LOCA_Y + rn2(ARC_LOCA_MAP.length);
        const ok = specialMonsterLocationOk(x, y, ptr);
        __trace({ phase: 'candidate', ok });
        if (ok) {
            __trace({ phase: 'return' });
            return { x, y };
        }
    } while (++trycnt < 100);
    __trace({ phase: 'fallback' });
    return arcLocaDryLocation();
}`
    );
    source = source.replace(
        `    const loc = arcLocaMonsterLocation(ptr);
    return apply_monster_name_gender(makemon(ptr, loc.x, loc.y, mmflags), id);`,
        `    const loc = arcLocaMonsterLocation(ptr);
    const __beforeCreateRng = globalThis.__teleportRngTraceIndex || 0;
    const __created = makemon(ptr, loc.x, loc.y, mmflags);
    const __afterCreateRng = globalThis.__teleportRngTraceIndex || 0;
    if (__beforeCreateRng >= 23600 && __beforeCreateRng <= 24100) {
        console.error('[arc-loca-create]', JSON.stringify({
            rng: __beforeCreateRng,
            rngAfter: __afterCreateRng,
            id,
            ptr: ptr?.name || null,
            loc,
            created: __created ? { name: __created.data?.name, mx: __created.mx, my: __created.my } : null,
        }));
    }
    return apply_monster_name_gender(__created, id);`
    );
    source = source.replace(
        `    const loc = arcLocaMonsterLocation(ptr);
    if (!loc) return null;
    if (m_at(loc.x, loc.y)) {
        const cc = enexto_core(loc.x, loc.y, ptr, GP_CHECKSCARY)
            || enexto_core(loc.x, loc.y, ptr, 0);
        if (cc) {
            loc.x = cc.x;
            loc.y = cc.y;
        }
    }
    return apply_monster_name_gender(makemon(ptr, loc.x, loc.y, mmflags), id);`,
        `    const loc = arcLocaMonsterLocation(ptr);
    if (!loc) return null;
    if (m_at(loc.x, loc.y)) {
        const cc = enexto_core(loc.x, loc.y, ptr, GP_CHECKSCARY)
            || enexto_core(loc.x, loc.y, ptr, 0);
        if (cc) {
            loc.x = cc.x;
            loc.y = cc.y;
        }
    }
    const __beforeCreateRng = globalThis.__teleportRngTraceIndex || 0;
    const __created = makemon(ptr, loc.x, loc.y, mmflags);
    const __afterCreateRng = globalThis.__teleportRngTraceIndex || 0;
    if (__beforeCreateRng >= 23000 && __beforeCreateRng <= 31700) {
        const __obj = __created ? obj_at(__created.mx, __created.my) : null;
        console.error('[arc-loca-create]', JSON.stringify({
            rng: __beforeCreateRng,
            rngAfter: __afterCreateRng,
            id,
            ptr: ptr?.name || null,
            loc,
            created: __created ? {
                id: __created.m_id,
                name: __created.data?.name,
                mx: __created.mx,
                my: __created.my,
                mundetected: __created.mundetected || 0,
                m_ap_type: __created.m_ap_type || 0,
            } : null,
            obj: __obj ? {
                otyp: __obj.otyp,
                oclass: __obj.oclass,
                quan: __obj.quan,
                corpsenm: __obj.corpsenm,
            } : null,
        }));
    }
    return apply_monster_name_gender(__created, id);`
    );
    source = source.replace(
        `function arcLocaTrap(kind, x = null, y = null) {
    const loc = x == null ? arcLocaTrapLocation() : { x: arcLocaX(x), y: arcLocaY(y) };
    const trap = maketrap(loc.x, loc.y, kind);
    maybeTrapVictim(trap);
    return trap;
}`,
        `function arcLocaTrap(kind, x = null, y = null) {
    const __beforeTrapRng = globalThis.__teleportRngTraceIndex || 0;
    const loc = x == null ? arcLocaTrapLocation() : { x: arcLocaX(x), y: arcLocaY(y) };
    const trap = maketrap(loc.x, loc.y, kind);
    maybeTrapVictim(trap);
    const __afterTrapRng = globalThis.__teleportRngTraceIndex || 0;
    console.error('[arc-loca-trap]', JSON.stringify({
        rng: __beforeTrapRng,
        rngAfter: __afterTrapRng,
        kind,
        explicit: x != null && y != null,
        loc,
        trap: trap ? { ttyp: trap.ttyp, x: trap.tx, y: trap.ty } : null,
    }));
    return trap;
}`
    );
    return { ...result, source };
}

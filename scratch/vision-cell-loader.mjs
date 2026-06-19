export async function load(url, context, defaultLoad) {
    const result = await defaultLoad(url, context);
    if (result.format !== 'module') return result;
    let source = String(result.source);
    if (url.endsWith('/js/vision.js')) {
        source = source.replace(
            "function newsymOrIronBars(x, y) {\n    const loc = game.level?.at(x, y);",
            "function __traceVisionCell(label, x, y, extra = {}) {\n    const raw = globalThis.__teleportTraceVisionCell || process.env.__teleportTraceVisionCell;\n    if (!raw) return;\n    const [tx, ty] = String(raw).split(',').map(Number);\n    if (x !== tx || y !== ty) return;\n    const minMove = Number(globalThis.__teleportTraceVisionMove || process.env.__teleportTraceVisionMove || 0);\n    if ((game.moves || 0) < minMove) return;\n    const loc = game.level?.at(x, y);\n    console.log(`[vision-cell] ${label} move=${game.moves || 0} u=${game.u?.ux},${game.u?.uy} uz=${game.u?.uz?.dnum},${game.u?.uz?.dlevel} x=${x},${y} typ=${loc?.typ} lit=${!!loc?.lit} waslit=${!!loc?.waslit} seenv=${loc?.seenv || 0} viz=${game.viz_array?.[y]?.[x] || 0} mem=${loc?.remembered_glyph?.ch || ''} disp=${loc?.disp_ch || ''} ${JSON.stringify(extra)}`);\n}\n\nfunction newsymOrIronBars(x, y) {\n    __traceVisionCell('newsymOrIronBars', x, y);\n    const loc = game.level?.at(x, y);",
        );
        source = source.replace(
            "                if (nv & IN_SIGHT) {\n                    const oldseenv = loc.seenv || 0;",
            "                if (nv & IN_SIGHT) {\n                    __traceVisionCell('branch:already_in_sight', col, row, { nv, ov });\n                    const oldseenv = loc.seenv || 0;",
        );
        source = source.replace(
            "                } else if ((nv & COULD_SEE) && (loc.lit || (nv & TEMP_LIT))) {\n                    if ((IS_WALL(loc.typ) || loc.typ === DOOR || loc.typ === SDOOR)",
            "                } else if ((nv & COULD_SEE) && (loc.lit || (nv & TEMP_LIT))) {\n                    __traceVisionCell('branch:could_see_lit', col, row, { nv, ov });\n                    if ((IS_WALL(loc.typ) || loc.typ === DOOR || loc.typ === SDOOR)",
        );
        source = source.replace(
            "                        if (adjLoc?.lit || (next[row + dy]?.[col + dx] & TEMP_LIT)) {\n                            next_row[col] |= IN_SIGHT;",
            "                        __traceVisionCell('branch:could_see_lit_blocker_adj', col, row, { nv, ov, dx, dy, adjLit: !!adjLoc?.lit, adjTemp: !!(next[row + dy]?.[col + dx] & TEMP_LIT) });\n                        if (adjLoc?.lit || (next[row + dy]?.[col + dx] & TEMP_LIT)) {\n                            __traceVisionCell('branch:promote_blocker', col, row, { nv, ov, dx, dy });\n                            next_row[col] |= IN_SIGHT;",
        );
        source = source.replace(
            "                    } else {\n                        next_row[col] |= IN_SIGHT;\n                        const oldseenv = loc.seenv || 0;",
            "                    } else {\n                        __traceVisionCell('branch:promote_lit_clear', col, row, { nv, ov });\n                        next_row[col] |= IN_SIGHT;\n                        const oldseenv = loc.seenv || 0;",
        );
        source = source.replace(
            "                } else if ((nv & COULD_SEE) && loc.waslit) {\n                    loc.waslit = 0;",
            "                } else if ((nv & COULD_SEE) && loc.waslit) {\n                    __traceVisionCell('branch:clear_waslit', col, row, { nv, ov });\n                    loc.waslit = 0;",
        );
        source = source.replace(
            "                } else {\n                    if ((ov & IN_SIGHT)",
            "                } else {\n                    __traceVisionCell('branch:not_in_sight', col, row, { nv, ov });\n                    if ((ov & IN_SIGHT)",
        );
    }
    return { ...result, source };
}

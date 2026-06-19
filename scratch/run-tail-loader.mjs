export async function load(url, context, nextLoad) {
    const result = await nextLoad(url, context);
    if (url.endsWith('/js/cmd.js')) {
        let source = String(result.source);
        source = source.replace(
            '    let step = run.travel ? findTravelStep(run.target) : { dx: run.dx, dy: run.dy };\n    if (!step) {\n',
            `    let step = run.travel ? findTravelStep(run.target) : { dx: run.dx, dy: run.dy };
    if (globalThis.__teleportRunStepTrace) {
        const around = [];
        for (let x = (game.u?.ux ?? 0) - 2; x <= (game.u?.ux ?? 0) + 2; x++) {
            for (let y = (game.u?.uy ?? 0) - 2; y <= (game.u?.uy ?? 0) + 2; y++) {
                const loc = game.level?.at(x, y);
                if (!loc) continue;
                around.push({
                    x, y,
                    typ: loc.typ,
                    seenv: loc.seenv,
                    could: typeof couldsee === 'function' ? couldsee(x, y) : false,
                    pathKnown: typeof travelPathCellKnown === 'function' ? travelPathCellKnown(x, y) : false,
                    disp: loc.disp_ch,
                    obj: (game.level?.objects || []).filter((o) => o.ox === x && o.oy === y).map((o) => o.otyp),
                    trap: (game.level?.traps || []).filter((t) => t.tx === x && t.ty === y).map((t) => ({ ttyp: t.ttyp, tseen: !!t.tseen })),
                });
            }
        }
        globalThis.__teleportRunStepTrace.push({
            rng: globalThis.__teleportRngTraceIndex || 0,
            moves: game.moves,
            ux: game.u?.ux,
            uy: game.u?.uy,
            dx: game.u?.dx,
            dy: game.u?.dy,
            pending: game._pending_message || '',
            target: run.target,
            step,
            initialAttempt: !!run.initialAttempt,
            stopAfter: !!run._travel_stop_after_step,
            stopMessage: run._travel_stop_message || '',
            branch: run._traceTravelBranch || '',
            travelmap: run._travelmap ? Array.from(run._travelmap) : [],
            around,
        });
    }
    if (!step) {
`
        );
        source = source.replace(
            '    const direct = findTravelStepToKnownTarget(target, run);\n    if (direct) return direct;\n',
            `    const direct = findTravelStepToKnownTarget(target, run);
    if (direct) {
        if (run) run._traceTravelBranch = 'direct';
        return direct;
    }
`
        );
        source = source.replace(
            '        return travelMoveAllowed(game.u.ux, game.u.uy, dx, dy) ? { dx, dy } : direct;\n',
            `        const fallback = travelMoveAllowed(game.u.ux, game.u.uy, dx, dy) ? { dx, dy } : direct;
        if (run) run._traceTravelBranch = 'guess-general-direction';
        return fallback;
`
        );
        source = source.replace(
            '    return findTravelStepToKnownTarget(guess, run) || direct;\n',
            `    const guessedStep = findTravelStepToKnownTarget(guess, run) || direct;
    if (run) run._traceTravelBranch = 'guess-path';
    return guessedStep;
`
        );
        source = source.replace(
            '    const moved = await withCommandNopick(!!run.nopick, () => domove(step.dx, step.dy));\n    if (run.travel) setTravelMapCursor();\n',
            `    const moved = await withCommandNopick(!!run.nopick, () => domove(step.dx, step.dy));
    if (globalThis.__teleportRunStepTrace) {
        globalThis.__teleportRunStepTrace.push({
            phase: 'after-domove',
            moves: game.moves,
            ux: game.u?.ux,
            uy: game.u?.uy,
            step,
            moved,
            run: game.context?.run ? JSON.parse(JSON.stringify(game.context.run)) : null,
            stopAfterMove: !!game._run_stop_after_move,
            more: !!game._more,
            pending: game._pending_message || '',
        });
    }
    if (run.travel) setTravelMapCursor();
`
        );
        source = source.replace(
            '    if (!moved || game._run_stop_after_move || run._travel_stop_after_step) {\n        game.context.run = null;\n        game._run_stop_after_move = false;\n    }\n    return moved || initialTravelAttempt;\n',
            `    if (!moved || game._run_stop_after_move || run._travel_stop_after_step) {
        if (globalThis.__teleportRunStepTrace) {
            globalThis.__teleportRunStepTrace.push({
                phase: 'clear-run',
                moves: game.moves,
                ux: game.u?.ux,
                uy: game.u?.uy,
                moved,
                stopAfterMove: !!game._run_stop_after_move,
                travelStopAfterStep: !!run._travel_stop_after_step,
                run: game.context?.run ? JSON.parse(JSON.stringify(game.context.run)) : null,
            });
        }
        game.context.run = null;
        game._run_stop_after_move = false;
    }
    if (globalThis.__teleportRunStepTrace) {
        globalThis.__teleportRunStepTrace.push({
            phase: 'return',
            moves: game.moves,
            ux: game.u?.ux,
            uy: game.u?.uy,
            result: moved || initialTravelAttempt,
            run: game.context?.run ? JSON.parse(JSON.stringify(game.context.run)) : null,
        });
    }
    return moved || initialTravelAttempt;
`
        );
        return { ...result, source };
    }
    if (!url.endsWith('/js/allmain.js')) return result;
    let source = String(result.source);
    source = source.replace(
        '    while (g.context?.run) {\n',
        `    while (g.context?.run) {
        if (globalThis.__teleportRunTailTrace) {
            const cells = [];
            for (let x = (g.u?.ux ?? 0) - 1; x <= (g.u?.ux ?? 0) + 1; x++) {
                for (let y = (g.u?.uy ?? 0) - 1; y <= (g.u?.uy ?? 0) + 1; y++) {
                    const loc = g.level?.at(x, y);
                    const mon = (g.level?.monsters || []).find((m) => m.mx === x && m.my === y);
                    const trap = (g.level?.traps || []).find((t) => t.tx === x && t.ty === y);
                    const objects = (g.level?.objects || [])
                        .filter((o) => o.ox === x && o.oy === y)
                        .map((o) => o.otyp);
                    cells.push({
                        x, y,
                        typ: loc?.typ,
                        doormask: loc?.doormask,
                        seenv: loc?.seenv,
                        disp: loc?.disp_ch,
                        mon: mon ? { id: mon.m_id, name: mon.data?.name, peaceful: !!mon.mpeaceful, tame: !!mon.mtame } : null,
                        trap: trap ? { ttyp: trap.ttyp, tseen: !!trap.tseen } : null,
                        objects,
                    });
                }
            }
            globalThis.__teleportRunTailTrace.push({
                rng: globalThis.__teleportRngTraceIndex || 0,
                moves: g.moves,
                ux: g.u?.ux,
                uy: g.u?.uy,
                ux0: g.u?.ux0,
                uy0: g.u?.uy0,
                dx: g.u?.dx,
                dy: g.u?.dy,
                pending: g._pending_message || '',
                run: g.context?.run ? JSON.parse(JSON.stringify(g.context.run)) : null,
                cells,
            });
            const stopAtMove = Number(globalThis.__teleportRunTailStopAtMove || 0);
            if (globalThis.__teleportRunTailStopAfterFirst
                && (!stopAtMove || (g.moves || 0) >= stopAtMove)) {
                g.context.run = null;
                break;
            }
        }
`
    );
    return { ...result, source };
}

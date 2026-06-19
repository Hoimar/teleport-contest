import { readFileSync } from 'node:fs';
import { normalizeSession } from '../frozen/session_loader.mjs';
import { runSegment } from '../js/jsmain.js';
import { game } from '../js/gstate.js';
import { couldsee } from '../js/vision.js';
import * as C from '../js/const.js';

const BOULDER = 475;
const TRAVP_TRAVEL = 0;
const TRAVP_GUESS = 1;
const DIRS_ORD = [
    [-1, 0], [0, -1], [1, 0], [0, 1],
    [-1, -1], [1, -1], [1, 1], [-1, 1],
];

function usage() {
    return 'Usage: node --loader ./scratch/run-tail-loader.mjs scratch/trace-travel-path.mjs <session> --moves N [--segment N] [--stop-tail-move N]';
}

function optionValue(name, fallback = null) {
    const idx = process.argv.indexOf(name);
    if (idx < 0) return fallback;
    const value = process.argv[idx + 1];
    if (value == null || value.startsWith('--')) throw new Error(usage());
    return value;
}

const sessionPath = process.argv[2];
const moveCount = Number(optionValue('--moves', '0'));
const segmentIndex = Number(optionValue('--segment', '0'));
const stopTailMove = Number(optionValue('--stop-tail-move', '0'));
const traceFromMove = Number(optionValue('--trace-from-move', String(stopTailMove || 0)));
if (!sessionPath || !moveCount) throw new Error(usage());

function isok(x, y) {
    return x >= 1 && x < C.COLNO && y >= 0 && y < C.ROWNO;
}

function locAt(x, y) {
    return game.level?.at?.(x, y) || null;
}

function keyOf(x, y) {
    return `${x},${y}`;
}

function uAt(x, y) {
    return game.u?.ux === x && game.u?.uy === y;
}

function closedDoorAt(x, y) {
    const loc = locAt(x, y);
    return loc?.typ === C.DOOR && !!(loc.doormask & (C.D_CLOSED | C.D_LOCKED));
}

function doorlessDoorAt(x, y) {
    const loc = locAt(x, y);
    return loc?.typ === C.DOOR && !!(loc.doormask & (C.D_NODOOR | C.D_BROKEN));
}

function sobjAt(otyp, x, y) {
    return (game.level?.objects || []).some((obj) => obj.otyp === otyp && obj.ox === x && obj.oy === y);
}

function trapAt(x, y) {
    return (game.level?.traps || []).find((trap) => trap.tx === x && trap.ty === y) || null;
}

function heroBlind() {
    return !!(game.u?.ublind || game.u?.uprops?.blind);
}

function cellKnownForTravel(x, y) {
    const loc = locAt(x, y);
    return !!(loc && (loc.seenv || (!heroBlind() && couldsee(x, y))));
}

function badRockForHero(x, y) {
    const loc = locAt(x, y);
    return !loc || C.IS_OBSTRUCTED(loc.typ);
}

function tightDiagonalBlocked(x, y, dx, dy) {
    if (!dx || !dy) return false;
    if (!(badRockForHero(x, y + dy) && badRockForHero(x + dx, y))) return false;
    return false;
}

function knownTrapOrLiquidForTravel(x, y) {
    if (!uAt(x, y)) {
        const trap = trapAt(x, y);
        if (trap?.tseen && trap.ttyp !== C.VIBRATING_SQUARE) return 'trap';
        const loc = locAt(x, y);
        if (loc?.seenv && (C.IS_POOL(loc.typ) || C.IS_LAVA(loc.typ))) {
            const u = game.u || {};
            if (u.uprops?.levitation || u.uprops?.flying) return '';
            if (C.IS_POOL(loc.typ) && u.uprops?.water_walking) return '';
            if (C.IS_LAVA(loc.typ) && u.uprops?.lava_walking && C.IS_LAVA(locAt(u.ux, u.uy)?.typ)) return '';
            return 'liquid';
        }
    }
    return '';
}

function physicalTargetBlocked(x, y, dx, dy, mode) {
    const nx = x + dx;
    const ny = y + dy;
    const target = locAt(nx, ny);
    if (!target) return true;
    if (C.IS_OBSTRUCTED(target.typ) || target.typ === C.IRONBARS) return true;
    if (target.typ === C.DOOR && closedDoorAt(nx, ny)) {
        if (mode === 'trav' || mode === 'trap') {
            if (dx && dy && !doorlessDoorAt(nx, ny)) return true;
            return false;
        }
        return true;
    }
    if (dx && dy && target.typ === C.DOOR && !doorlessDoorAt(nx, ny)) return true;
    return false;
}

function testMoveTrap(x, y, dx, dy) {
    const nx = x + dx;
    const ny = y + dy;
    if (!isok(nx, ny)) return false;
    if (physicalTargetBlocked(x, y, dx, dy, 'trap')) return false;
    if (tightDiagonalBlocked(x, y, dx, dy)) return false;
    return !!knownTrapOrLiquidForTravel(nx, ny);
}

function testMoveTrav(x, y, dx, dy) {
    const nx = x + dx;
    const ny = y + dy;
    if (!isok(nx, ny)) return false;
    if (physicalTargetBlocked(x, y, dx, dy, 'trav')) return false;
    if (dx && dy && locAt(x, y)?.typ === C.DOOR && !doorlessDoorAt(x, y)) return false;
    if (tightDiagonalBlocked(x, y, dx, dy)) return false;
    if (knownTrapOrLiquidForTravel(nx, ny)) return false;
    return true;
}

function cStyleFindTravelPath(target, mode, travelmap) {
    const startUx = game.u?.ux || 0;
    const startUy = game.u?.uy || 0;
    const originalTarget = { x: target.x, y: target.y };

    let tx;
    let ty;
    let ux;
    let uy;
    if (mode === TRAVP_GUESS) {
        tx = startUx;
        ty = startUy;
        ux = originalTarget.x;
        uy = originalTarget.y;
    } else {
        tx = originalTarget.x;
        ty = originalTarget.y;
        ux = startUx;
        uy = startUy;
    }

    for (;;) {
        const travel = new Map();
        let current = [{ x: tx, y: ty }];
        let set = 0;
        let radius = 1;
        const expansionSample = [];

        while (current.length) {
            const next = [];
            for (const here of current) {
                let alreadyRepeated = false;
                for (const [dx, dy] of DIRS_ORD) {
                    const nx = here.x + dx;
                    const ny = here.y + dy;
                    if (!isok(nx, ny) || (mode === TRAVP_GUESS && !couldsee(nx, ny))) continue;

                    const sourceKey = keyOf(here.x, here.y);
                    const sourceRadius = travel.get(sourceKey) || 0;
                    if (closedDoorAt(here.x, here.y)
                        || sobjAt(BOULDER, here.x, here.y)
                        || testMoveTrap(here.x, here.y, dx, dy)) {
                        if (sourceRadius > radius - 3) {
                            if (!alreadyRepeated) {
                                next.push(here);
                                alreadyRepeated = true;
                            }
                            continue;
                        }
                    }

                    if (testMoveTrav(here.x, here.y, dx, dy) && cellKnownForTravel(nx, ny)) {
                        if (nx === ux && ny === uy) {
                            if (mode === TRAVP_TRAVEL) {
                                const visited = travelmap.has(keyOf(here.x, here.y));
                                const stop = (here.x === originalTarget.x && here.y === originalTarget.y) || visited;
                                travelmap.add(keyOf(startUx, startUy));
                                return {
                                    found: true,
                                    mode: 'travel',
                                    dx: here.x - ux,
                                    dy: here.y - uy,
                                    via: { x: here.x, y: here.y },
                                    visited,
                                    stop,
                                    travelmap: Array.from(travelmap),
                                    expansionSample,
                                };
                            }
                        } else if (!travel.has(keyOf(nx, ny))) {
                            next.push({ x: nx, y: ny });
                            travel.set(keyOf(nx, ny), radius);
                            if (expansionSample.length < 40) {
                                expansionSample.push({
                                    radius,
                                    from: { x: here.x, y: here.y },
                                    to: { x: nx, y: ny },
                                });
                            }
                        }
                    }
                }
            }
            current = next;
            set = 1 - set;
            radius++;
            if (radius > C.COLNO * C.ROWNO) break;
        }

        if (mode === TRAVP_GUESS) {
            let px = tx;
            let py = ty;
            let bestDist = Math.max(Math.abs(ux - tx), Math.abs(uy - ty));
            let bestD2 = (ux - tx) ** 2 + (uy - ty) ** 2;
            let bestTravel = C.COLNO * C.ROWNO;
            for (let x = 1; x < C.COLNO; x++) {
                for (let y = 0; y < C.ROWNO; y++) {
                    const ctrav = travel.get(keyOf(x, y)) || 0;
                    if (!ctrav || !couldsee(x, y)) continue;
                    const nextDist = Math.max(Math.abs(ux - x), Math.abs(uy - y));
                    const nextD2 = (ux - x) ** 2 + (uy - y) ** 2;
                    if ((nextDist === bestDist && ctrav < bestTravel && nextD2 < bestD2)
                        || nextDist < bestDist) {
                        px = x;
                        py = y;
                        bestDist = nextDist;
                        bestD2 = nextD2;
                        bestTravel = ctrav;
                    }
                }
            }
            if (px === startUx && py === startUy) {
                const dx = Math.sign(originalTarget.x - startUx);
                const dy = Math.sign(originalTarget.y - startUy);
                if (testMoveTrav(startUx, startUy, dx, dy)) {
                    travelmap.add(keyOf(startUx, startUy));
                    return {
                        found: true,
                        mode: 'guess-general',
                        dx,
                        dy,
                        guessedTarget: { x: px, y: py },
                        travelmap: Array.from(travelmap),
                        expansionSample,
                    };
                }
                return {
                    found: false,
                    mode: 'guess-general-blocked',
                    guessedTarget: { x: px, y: py },
                    expansionSample,
                };
            }
            tx = px;
            ty = py;
            ux = startUx;
            uy = startUy;
            mode = TRAVP_TRAVEL;
            continue;
        }
        return { found: false, mode: mode === TRAVP_TRAVEL ? 'travel' : 'guess', expansionSample };
    }
}

const session = normalizeSession(JSON.parse(readFileSync(sessionPath, 'utf8')));
const seg = session.segments[segmentIndex];
if (!seg) throw new Error(`segment ${segmentIndex} not found`);

if (stopTailMove || traceFromMove) {
    globalThis.__teleportRunTailTrace = [];
    globalThis.__teleportRunStepTrace = [];
}
if (stopTailMove) {
    globalThis.__teleportRunTailStopAfterFirst = true;
    globalThis.__teleportRunTailStopAtMove = stopTailMove;
}

await runSegment({
    seed: seg.seed,
    datetime: seg.datetime,
    nethackrc: seg.nethackrc,
    moves: (seg.moves || '').slice(0, moveCount),
});

const runTailTrace = (globalThis.__teleportRunTailTrace || [])
    .filter((entry) => !traceFromMove || (entry.moves || 0) >= traceFromMove);
const runStepTrace = (globalThis.__teleportRunStepTrace || [])
    .filter((entry) => !traceFromMove || (entry.moves || 0) >= traceFromMove);
const tail = runTailTrace.at(-1) || (globalThis.__teleportRunTailTrace || []).at(-1) || null;
const run = tail?.run || game.context?.run || {};
const target = run.target || game._travel_cached_target || { x: game.u?.tx, y: game.u?.ty };
const traceTravelMap = Array.isArray(run._travelmap) ? run._travelmap : [];
const travelmap = new Set(traceTravelMap);
const result = cStyleFindTravelPath(target, TRAVP_TRAVEL, travelmap);
let guessResult = null;
if (!result.found) guessResult = cStyleFindTravelPath(target, TRAVP_GUESS, new Set(traceTravelMap));

const pathCells = [];
for (let x = Math.min(game.u.ux, target.x) - 2; x <= Math.max(game.u.ux, target.x) + 2; x++) {
    for (let y = Math.min(game.u.uy, target.y) - 2; y <= Math.max(game.u.uy, target.y) + 2; y++) {
        if (!isok(x, y)) continue;
        const loc = locAt(x, y);
        pathCells.push({
            x, y,
            typ: loc?.typ,
            doormask: loc?.doormask,
            seenv: loc?.seenv,
            could: couldsee(x, y),
            known: cellKnownForTravel(x, y),
            trap: trapAt(x, y) ? { ttyp: trapAt(x, y).ttyp, tseen: !!trapAt(x, y).tseen } : null,
            obj: (game.level?.objects || []).filter((obj) => obj.ox === x && obj.oy === y).map((obj) => obj.otyp),
        });
    }
}

console.log(JSON.stringify({
    moves: game.moves,
    hero: { x: game.u?.ux, y: game.u?.uy, dx: game.u?.dx, dy: game.u?.dy },
    pending: game._pending_message || '',
    target,
    run,
    tail,
    tailTrace: runTailTrace,
    stepTrace: runStepTrace,
    direct: result,
    guess: guessResult,
    cells: pathCells,
}, null, 2));

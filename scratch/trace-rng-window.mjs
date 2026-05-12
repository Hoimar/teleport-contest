#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { normalizeSession } from '../frozen/session_loader.mjs';
import { runSegment } from '../js/jsmain.js';
import { game } from '../js/gstate.js';
import { resolveSessionRef } from '../scripts/triage-lib.mjs';

function parseArgs(argv) {
    const opts = { ref: null, moves: null, rng: null, monmove: false, traceFilter: null };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--moves') {
            opts.moves = Number(argv[++i]);
        } else if (arg === '--rng') {
            opts.rng = argv[++i];
        } else if (arg === '--monmove') {
            opts.monmove = true;
        } else if (arg === '--trace-filter') {
            opts.traceFilter = argv[++i];
        } else if (!opts.ref) {
            opts.ref = arg;
        } else {
            throw new Error(`unexpected argument ${arg}`);
        }
    }
    if (!opts.ref || !opts.rng) {
        throw new Error('Usage: node scratch/trace-rng-window.mjs <session> --moves <n> --rng <start>:<end> [--monmove] [--trace-filter <text>]');
    }
    return opts;
}

function isRngCall(entry) {
    return /^(?:rn2|rnd|rn1|rnl|rne|rnz|d)\(/.test(entry);
}

function norm(entry) {
    return String(entry || '').replace(/^\d+\s+/, '').trim();
}

function expectedRngCalls(session) {
    const calls = [];
    for (const seg of session.segments) {
        for (const step of seg.steps || []) {
            for (const entry of step.rng || []) {
                const normalized = norm(entry);
                if (isRngCall(normalized)) calls.push(normalized);
            }
        }
    }
    return calls;
}

function parseWindow(spec) {
    const [rawStart, rawEnd] = spec.split(':');
    const start = Number(rawStart);
    const end = Number(rawEnd);
    if (!Number.isInteger(start) || !Number.isInteger(end) || start < 0 || end < start) {
        throw new Error('--rng must be start:end');
    }
    return { start, end };
}

function monsterSummary(mon, index) {
    return {
        index,
        name: mon.data?.name,
        mx: mon.mx,
        my: mon.my,
        movement: mon.movement ?? 0,
        mmove: mon.data?.mmove,
        mtame: mon.mtame ?? 0,
        mpeaceful: mon.mpeaceful ?? 0,
        msleeping: mon.msleeping ?? 0,
        mflee: mon.mflee ?? 0,
        mcanmove: mon.mcanmove ?? 1,
        mtrack: mon.mtrack || [],
    };
}

async function main() {
    const opts = parseArgs(process.argv.slice(2));
    const sessionPath = resolveSessionRef(opts.ref);
    const session = normalizeSession(JSON.parse(readFileSync(sessionPath, 'utf8')));
    const seg = session.segments[0];
    const moves = opts.moves == null ? seg.moves : seg.moves.slice(0, opts.moves);
    const window = parseWindow(opts.rng);

    globalThis.__teleportTraceMonMove = opts.monmove;
    const nhGame = await runSegment({
        seed: seg.seed,
        datetime: seg.datetime,
        nethackrc: seg.nethackrc,
        moves,
    }, null);
    globalThis.__teleportTraceMonMove = false;

    const expected = expectedRngCalls(session);
    const fullLog = nhGame.getRngLog?.() || [];
    console.log(`session ${path.relative(process.cwd(), sessionPath)} moves ${moves.length}/${seg.moves.length}`);
    console.log(`screens ${nhGame.getScreens?.().length ?? 0} fullLog ${fullLog.length}`);
    console.log('hero', JSON.stringify({ ux: game.u?.ux, uy: game.u?.uy, uswallow: game.u?.uswallow, ustuck: game.u?.ustuck?.data?.name }));
    console.log('monsters', JSON.stringify((game.level?.monsters || []).map(monsterSummary)));
    console.log('nearObjects', JSON.stringify((game.level?.objects || [])
        .filter((obj) => Math.abs((obj.ox ?? -99) - (game.u?.ux ?? 0)) <= 3
            && Math.abs((obj.oy ?? -99) - (game.u?.uy ?? 0)) <= 3)
        .map((obj) => ({ otyp: obj.otyp, oclass: obj.oclass, ox: obj.ox, oy: obj.oy, cursed: obj.cursed, blessed: obj.blessed }))));
    console.log('nearEngravings', JSON.stringify((game.level?.engravings || [])
        .filter((ep) => Math.abs((ep.x ?? -99) - (game.u?.ux ?? 0)) <= 5
            && Math.abs((ep.y ?? -99) - (game.u?.uy ?? 0)) <= 5)));

    let rngIndex = 0;
    for (const raw of fullLog) {
        const entry = norm(raw);
        const rng = isRngCall(entry);
        const filterHit = opts.traceFilter && !rng && entry.includes(opts.traceFilter);
        const markerInWindow = !rng && rngIndex >= window.start - 8 && rngIndex <= window.end + 8;
        const rngInWindow = rng && rngIndex >= window.start && rngIndex < window.end;
        if (markerInWindow || rngInWindow || filterHit) {
            if (rng) {
                const expectedEntry = expected[rngIndex] ?? '<missing>';
                const mark = expectedEntry === entry ? ' ' : '!';
                console.log(`${mark} R${rngIndex}: exp ${expectedEntry} | act ${entry}`);
            } else {
                console.log(`  M@R${rngIndex}: ${entry}`);
            }
        }
        if (rng) rngIndex++;
    }
}

main().catch((err) => {
    console.error(err.stack || err.message);
    process.exit(1);
});

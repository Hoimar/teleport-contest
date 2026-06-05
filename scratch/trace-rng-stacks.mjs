#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { normalizeSession } from '../frozen/session_loader.mjs';
import { runSegment } from '../js/jsmain.js';
import { resolveSessionRef } from '../scripts/triage-lib.mjs';

function parseArgs(argv) {
    const opts = { ref: null, moves: null, rng: null, segment: 0, rngOnly: false };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--moves') opts.moves = Number(argv[++i]);
        else if (arg === '--rng') opts.rng = argv[++i];
        else if (arg === '--segment') opts.segment = Number(argv[++i]);
        else if (arg === '--rng-only') opts.rngOnly = true;
        else if (!opts.ref) opts.ref = arg;
        else throw new Error(`unexpected argument ${arg}`);
    }
    if (!opts.ref || !opts.rng) {
        throw new Error('Usage: node --loader ./scratch/rng-stack-loader.mjs scratch/trace-rng-stacks.mjs <session> --moves <n> --rng <start>:<end>');
    }
    const [rawStart, rawEnd] = opts.rng.split(':');
    opts.start = Number(rawStart);
    opts.end = Number(rawEnd);
    if (!Number.isInteger(opts.start) || !Number.isInteger(opts.end) || opts.end < opts.start) {
        throw new Error('--rng must be start:end');
    }
    return opts;
}

async function main() {
    const opts = parseArgs(process.argv.slice(2));
    globalThis.__teleportRngStackTrace = true;
    globalThis.__teleportRngTrace = [];
    globalThis.__teleportRngTraceIndex = 0;
    globalThis.__teleportApparxyTrace = [];
    globalThis.__teleportApparxyStart = opts.start - 8;
    globalThis.__teleportApparxyEnd = opts.end + 8;

    const sessionPath = resolveSessionRef(opts.ref);
    const session = normalizeSession(JSON.parse(readFileSync(sessionPath, 'utf8')));
    let nhGame = null;
    for (let i = 0; i <= opts.segment; i++) {
        const seg = session.segments[i];
        const moves = i === opts.segment && opts.moves != null
            ? seg.moves.slice(0, opts.moves)
            : seg.moves;
        nhGame = await runSegment({
            seed: seg.seed,
            datetime: seg.datetime,
            nethackrc: seg.nethackrc,
            moves,
        }, nhGame);
    }

    console.log(`rng trace entries ${globalThis.__teleportRngTrace.length}; logged ${nhGame.getRngLog?.().length ?? 0}`);
    for (const item of globalThis.__teleportRngTrace) {
        if (item.idx < opts.start || item.idx >= opts.end) continue;
        console.log(`R${item.idx} ${item.entry}`);
        if (item.monster) console.log(`  monster ${JSON.stringify(item.monster)}`);
        for (const line of item.stack) console.log(`  ${line}`);
    }
    if (opts.rngOnly) return;
    if (globalThis.__teleportApparxyTrace?.length) {
        console.log('apparxy trace');
        for (const item of globalThis.__teleportApparxyTrace) {
            console.log(`  A@${item.idx} ${JSON.stringify(item)}`);
        }
    }
    if (globalThis.__teleportTrackTrace?.length) {
        console.log('track trace');
        for (const item of globalThis.__teleportTrackTrace) {
            console.log(`  T@${item.rng} ${JSON.stringify(item)}`);
        }
    }
    if (globalThis.__teleportCandidateTrace?.length) {
        console.log('candidate trace');
        for (const item of globalThis.__teleportCandidateTrace) {
            console.log(`  C@${item.idx} ${JSON.stringify(item)}`);
        }
    }
    if (globalThis.__teleportMonScanTrace?.length) {
        console.log('mon scan trace');
        for (const item of globalThis.__teleportMonScanTrace) {
            console.log(`  S@${item.idx} ${JSON.stringify(item)}`);
        }
    }
    if (globalThis.__teleportMonAllocTrace?.length) {
        console.log('mon alloc trace');
        for (const item of globalThis.__teleportMonAllocTrace) {
            console.log(`  A@${item.idx} ${JSON.stringify(item)}`);
        }
    }
    if (globalThis.__teleportAdvanceTrace?.length) {
        console.log('advance trace');
        for (const item of globalThis.__teleportAdvanceTrace) {
            console.log(`  V@${item.idx} ${JSON.stringify(item)}`);
        }
    }
    if (globalThis.__teleportThrowTrace?.length) {
        console.log('throw trace');
        for (const item of globalThis.__teleportThrowTrace) {
            console.log(`  W@${item.idx} ${JSON.stringify(item)}`);
        }
    }
    if (globalThis.__teleportDecisionTrace?.length) {
        console.log('decision trace');
        for (const item of globalThis.__teleportDecisionTrace) {
            console.log(`  D@${item.idx} ${JSON.stringify(item)}`);
        }
    }
    if (globalThis.__teleportMazeWalkTrace?.length) {
        console.log('maze walk trace');
        for (const item of globalThis.__teleportMazeWalkTrace) {
            console.log(`  M@${item.idx} ${JSON.stringify(item)}`);
        }
    }
}

main().catch((err) => {
    console.error(err.stack || err.message);
    process.exit(1);
});

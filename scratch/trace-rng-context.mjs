#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { normalizeSession } from '../frozen/session_loader.mjs';
import { runSegment } from '../js/jsmain.js';
import { resolveSessionRef } from '../scripts/triage-lib.mjs';

function parseArgs(argv) {
    const opts = { ref: null, rng: null, segment: 0 };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--rng') opts.rng = argv[++i];
        else if (arg === '--segment') opts.segment = Number(argv[++i]);
        else if (!opts.ref) opts.ref = arg;
        else throw new Error(`unexpected argument ${arg}`);
    }
    if (!opts.ref || !opts.rng) throw new Error('Usage: trace-rng-context <session> --rng start:end');
    const [rawStart, rawEnd] = opts.rng.split(':');
    opts.start = Number(rawStart);
    opts.end = Number(rawEnd);
    return opts;
}

const opts = parseArgs(process.argv.slice(2));
globalThis.__teleportRngStackTrace = true;
globalThis.__teleportRngTrace = [];
globalThis.__teleportRngTraceIndex = 0;
globalThis.__teleportApparxyStart = opts.start - 8;
globalThis.__teleportApparxyEnd = opts.end + 8;

const sessionPath = resolveSessionRef(opts.ref);
const session = normalizeSession(JSON.parse(readFileSync(sessionPath, 'utf8')));
let nhGame = null;
for (let i = 0; i <= opts.segment; i++) {
    const seg = session.segments[i];
    nhGame = await runSegment({
        seed: seg.seed,
        datetime: seg.datetime,
        nethackrc: seg.nethackrc,
        moves: seg.moves,
    }, nhGame);
}

for (const item of globalThis.__teleportRngTrace) {
    if (item.idx < opts.start || item.idx >= opts.end) continue;
    const frames = item.stack
        .map((line) => line.match(/at ([^( ]+)/)?.[1])
        .filter(Boolean)
        .slice(0, 4)
        .join(' <- ');
    const lines = item.stack.slice(0, 3).join(' | ');
    console.log(`R${item.idx} ${item.entry} ${JSON.stringify(item.monster)} ${frames} :: ${lines}`);
}

for (const item of globalThis.__teleportShapeTrace || []) {
    if (item.idx < opts.start - 50 || item.idx >= opts.end + 5) continue;
    console.log(`SHAPE ${JSON.stringify(item)}`);
}
for (const item of globalThis.__teleportMonfleeTrace || []) {
    if (item.idx < opts.start - 50 || item.idx >= opts.end + 5) continue;
    console.log(`MONFLEE ${JSON.stringify(item)}`);
}
for (const item of globalThis.__teleportMonTrackTrace || []) {
    if (item.idx < opts.start - 50 || item.idx >= opts.end + 5) continue;
    console.log(`MONTRACK ${JSON.stringify(item)}`);
}
for (const item of globalThis.__teleportDecisionTrace || []) {
    if (item.idx < opts.start - 50 || item.idx >= opts.end + 5) continue;
    console.log(`DECISION ${JSON.stringify(item)}`);
}
for (const item of globalThis.__teleportMonScanTrace || []) {
    if (item.idx < opts.start - 20 || item.idx >= opts.end + 5) continue;
    console.log(`MONSCAN ${JSON.stringify(item)}`);
}
for (const item of globalThis.__teleportMonAllocTrace || []) {
    if (item.idx < opts.start - 20 || item.idx >= opts.end + 5) continue;
    console.log(`MONALLOC ${JSON.stringify(item)}`);
}
for (const item of globalThis.__teleportCandidateTrace || []) {
    if (item.idx < opts.start - 20 || item.idx >= opts.end + 5) continue;
    console.log(`CANDIDATES ${JSON.stringify(item)}`);
}
for (const item of globalThis.__teleportAdvanceTrace || []) {
    if (item.idx < opts.start - 20 || item.idx >= opts.end + 5) continue;
    console.log(`ADVANCE ${JSON.stringify(item)}`);
}

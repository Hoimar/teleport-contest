#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { normalizeSession } from '../frozen/session_loader.mjs';
import { runSegment } from '../js/jsmain.js';
import { resolveSessionRef } from '../scripts/triage-lib.mjs';

const [ref, range = '0:Infinity'] = process.argv.slice(2);
if (!ref) throw new Error('usage: trace-zero-current <session> [start:end]');
const [startRaw, endRaw] = range.split(':');
globalThis.__zeroCurrentStart = Number(startRaw);
globalThis.__zeroCurrentEnd = endRaw === 'Infinity' ? Infinity : Number(endRaw);
globalThis.__zeroCurrentTrace = [];

const session = normalizeSession(JSON.parse(readFileSync(resolveSessionRef(ref), 'utf8')));
const seg = session.segments[0];
await runSegment({
    seed: seg.seed,
    datetime: seg.datetime,
    nethackrc: seg.nethackrc,
    moves: seg.moves,
});

for (const item of globalThis.__zeroCurrentTrace || []) {
    console.log(JSON.stringify(item));
}

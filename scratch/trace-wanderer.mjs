import { readFileSync } from 'node:fs';
import { normalizeSession } from '../frozen/session_loader.mjs';
import { NethackGame } from '../js/jsmain.js';
import { moveloop_core } from '../js/allmain.js';
import { GameDisplay } from '../js/game_display.js';

function usage() {
    return 'Usage: node --loader ./scratch/wanderer-trace-loader.mjs scratch/trace-wanderer.mjs <session.json> [max-iterations]';
}

const [sessionPath, maxIterArg] = process.argv.slice(2);
if (!sessionPath) throw new Error(usage());

globalThis.__teleportWandererTrace = true;
globalThis.__teleportWandererEvents = [];
globalThis.__teleportDogMoveEvents = [];

const session = normalizeSession(JSON.parse(readFileSync(sessionPath, 'utf8')));
const seg = session.segments[0];
const storage = {
    data: new Map(),
    getItem(k) { return this.data.has(k) ? this.data.get(k) : null; },
    setItem(k, v) { this.data.set(k, String(v)); },
    removeItem(k) { this.data.delete(k); },
    get length() { return this.data.size; },
    key(i) { return Array.from(this.data.keys())[i] ?? null; },
};
const nhGame = new NethackGame({
    seed: seg.seed,
    datetime: seg.datetime,
    nethackrc: seg.nethackrc,
    storage,
});
const display = new GameDisplay(null);
display.onEmptyQueue = () => { throw new Error('Input queue empty'); };
nhGame._pendingDisplay = display;
for (const ch of seg.moves || '') display.pushKey(ch.charCodeAt(0));

await nhGame.start();
const maxIter = Number.parseInt(maxIterArg || '', 10)
    || Math.max((seg.moves || '').length * 8, 1024);
for (let iter = 0; iter < maxIter; iter++) {
    try {
        await moveloop_core();
    } catch (e) {
        if (String(e?.message || '').includes('Input queue empty')) break;
        throw e;
    }
}

for (const ev of globalThis.__teleportWandererEvents || []) {
    console.log(`wanderer ${JSON.stringify(ev)}`);
}
for (const ev of globalThis.__teleportDogMoveEvents || []) {
    console.log(`dog_move ${JSON.stringify(ev)}`);
}

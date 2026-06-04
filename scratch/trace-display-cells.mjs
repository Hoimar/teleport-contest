import { readFileSync } from 'node:fs';
import { normalizeSession } from '../frozen/session_loader.mjs';
import { NethackGame } from '../js/jsmain.js';
import { moveloop_core } from '../js/allmain.js';
import { game } from '../js/gstate.js';
import { GameDisplay } from '../js/game_display.js';

function usage() {
    return 'Usage: node --loader ./scratch/display-cell-trace-loader.mjs scratch/trace-display-cells.mjs <session.json> <move-start>:<move-end> <x,y>...';
}

function parseRange(raw) {
    const m = /^(\d+):(\d+)$/.exec(raw || '');
    if (!m) throw new Error(usage());
    return { start: Number(m[1]), end: Number(m[2]) };
}

const [sessionPath, rangeRaw, ...cellArgs] = process.argv.slice(2);
if (!sessionPath || !rangeRaw) throw new Error(usage());
const { start, end } = parseRange(rangeRaw);

globalThis.__teleportDisplayCellTrace = true;
globalThis.__teleportDisplayTraceMoveStart = start;
globalThis.__teleportDisplayTraceMoveEnd = end;
globalThis.__teleportDisplayTraceCells = cellArgs.length ? new Set(cellArgs) : null;
globalThis.__teleportDisplayCellEvents = [];
globalThis.__teleportDisplayScreenIndex = -1;

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
const originalHook = game._preNhgetchHook;
game._preNhgetchHook = async () => {
    await originalHook();
    globalThis.__teleportDisplayScreenIndex = nhGame.getScreens().length - 1;
};

const maxIter = Math.max((seg.moves || '').length * 8, 1024);
for (let iter = 0; iter < maxIter; iter++) {
    try {
        await moveloop_core();
    } catch (e) {
        if (String(e?.message || '').includes('Input queue empty')) break;
        throw e;
    }
}

for (const ev of globalThis.__teleportDisplayCellEvents || []) {
    console.log(JSON.stringify(ev));
}

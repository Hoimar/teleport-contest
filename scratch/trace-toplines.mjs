import { readFileSync } from 'node:fs';
import { normalizeSession } from '../frozen/session_loader.mjs';
import { NethackGame, runSegment } from '../js/jsmain.js';
import { game } from '../js/gstate.js';
import { GameDisplay } from '../js/game_display.js';

function usage() {
    return 'Usage: node scratch/trace-toplines.mjs <session.json> <start>:<end> [--segment N]';
}

function parseRange(raw) {
    const match = /^(\d+):(\d+)$/.exec(raw || '');
    if (!match) throw new Error(usage());
    return { start: Number(match[1]), end: Number(match[2]) };
}

function optionValue(name, fallback = null) {
    const idx = process.argv.indexOf(name);
    if (idx < 0) return fallback;
    const value = process.argv[idx + 1];
    if (value == null || value.startsWith('--')) throw new Error(usage());
    return value;
}

function topLine(screen) {
    return String(screen || '').split('\n')[0] || '';
}

const positional = process.argv.slice(2).filter((arg, idx, all) => {
    if (all[idx - 1] === '--segment') return false;
    return arg !== '--segment';
});
const [sessionPath, rangeRaw] = positional;
if (!sessionPath || !rangeRaw) throw new Error(usage());

const { start, end } = parseRange(rangeRaw);
const segmentIndex = Number(optionValue('--segment', '0'));
const session = normalizeSession(JSON.parse(readFileSync(sessionPath, 'utf8')));
const seg = session.segments[segmentIndex];
if (!seg) throw new Error(`segment ${segmentIndex} not found`);

const storage = {
    data: new Map(),
    getItem(k) { return this.data.has(k) ? this.data.get(k) : null; },
    setItem(k, v) { this.data.set(k, String(v)); },
    removeItem(k) { this.data.delete(k); },
    get length() { return this.data.size; },
    key(i) { return Array.from(this.data.keys())[i] ?? null; },
};

for (let i = 0; i < segmentIndex; i++) {
    const prior = session.segments[i];
    await runSegment({
        seed: prior.seed,
        datetime: prior.datetime,
        nethackrc: prior.nethackrc,
        moves: prior.moves,
        storage,
    });
}

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
let boundary = 0;
game._preNhgetchHook = async () => {
    await originalHook();
    const screenIndex = nhGame.getScreens().length - 1;
    if (screenIndex >= start && screenIndex <= end) {
        const actual = topLine(nhGame.getScreens().at(-1) || '');
        const expected = topLine(seg.steps?.[screenIndex]?.screen || '');
        const uprops = game.u?.uprops || {};
        console.log(JSON.stringify({
            boundary,
            screenIndex,
            key: seg.steps?.[screenIndex]?.key ?? null,
            moves: game.moves || 0,
            ux: game.u?.ux,
            uy: game.u?.uy,
            ux0: game.u?.ux0,
            uy0: game.u?.uy0,
            timeout: uprops.fumbling_timeout ?? null,
            fumbling: !!uprops.fumbling,
            pending: game._pending_message || '',
            more: !!game._more,
            actual,
            expected,
            match: actual === expected,
        }));
    }
    boundary++;
};

try {
    await moveloop_core_import();
} catch (err) {
    if (!/Input queue empty/.test(String(err?.message || err))) throw err;
}

async function moveloop_core_import() {
    const { moveloop_core } = await import('../js/allmain.js');
    for (;;) await moveloop_core();
}

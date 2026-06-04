import { readFileSync } from 'node:fs';
import { normalizeSession } from '../frozen/session_loader.mjs';
import { NethackGame, runSegment } from '../js/jsmain.js';
import { moveloop_core } from '../js/allmain.js';
import { game } from '../js/gstate.js';
import { GameDisplay } from '../js/game_display.js';

function usage() {
    return 'Usage: node --loader ./scratch/vault-trace-loader.mjs scratch/trace-vault-session.mjs <session.json> [start:end] [--segment N]';
}

function optionValue(name, fallback = null) {
    const idx = process.argv.indexOf(name);
    if (idx < 0) return fallback;
    const value = process.argv[idx + 1];
    if (value == null || value.startsWith('--')) throw new Error(usage());
    return value;
}

function parseRange(raw) {
    if (!raw) return { start: 0, end: Infinity };
    const m = /^(\d+):(\d+)$/.exec(raw);
    if (!m) throw new Error(usage());
    return { start: Number(m[1]), end: Number(m[2]) };
}

const positional = process.argv.slice(2).filter((arg, idx, all) => {
    if (all[idx - 1] === '--segment') return false;
    return arg !== '--segment';
});
const [sessionPath, rangeRaw] = positional;
if (!sessionPath) throw new Error(usage());
const { start, end } = parseRange(rangeRaw);
const segmentIndex = Number(optionValue('--segment', '0'));

const session = normalizeSession(JSON.parse(readFileSync(sessionPath, 'utf8')));
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

const seg = session.segments[segmentIndex];
if (!seg) throw new Error(`segment ${segmentIndex} not found`);
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

globalThis.__teleportVaultTrace = true;
globalThis.__teleportRngTraceIndex = 0;

await nhGame.start();
let boundary = 0;
const originalHook = game._preNhgetchHook;
game._preNhgetchHook = async () => {
    await originalHook();
    const screenIndex = nhGame.getScreens().length - 1;
    if (screenIndex >= start && screenIndex <= end) {
        const expected = seg.steps?.[screenIndex] || {};
        console.log('[boundary]', JSON.stringify({
            boundary,
            screenIndex,
            rawKey: seg.moves?.[boundary],
            expectedKey: expected.key,
            moves: game.moves || 0,
            ux: game.u?.ux,
            uy: game.u?.uy,
            urooms: game.u?.urooms || [],
            urooms0: game.u?.urooms0 || [],
            uinvault: game.u?.uinvault || 0,
            simpleRepeats: game._simple_timed_repeats_remaining || 0,
            simpleText: game._simple_timed_repeat_text || '',
            contextMulti: game.context?.multi || 0,
            rng: globalThis.__teleportRngTraceIndex || 0,
            pending: game._pending_message || '',
            more: !!game._more,
        }));
    }
    boundary++;
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

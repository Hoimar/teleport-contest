#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { normalizeSession } from '../frozen/session_loader.mjs';
import { resolveSessionRef } from '../scripts/triage-lib.mjs';
import { NethackGame } from '../js/jsmain.js';
import { moveloop_core } from '../js/allmain.js';
import { game } from '../js/gstate.js';
import { GameDisplay } from '../js/game_display.js';
import { getRngLog } from '../js/rng.js';

function usage() {
    return 'Usage: node scratch/trace-screen-positions.mjs <session> <start>:<end> [--ids a,b,c]';
}

function parseRange(raw) {
    const m = /^(\d+):(\d+)$/.exec(raw || '');
    if (!m) throw new Error(usage());
    return { start: Number(m[1]), end: Number(m[2]) };
}

function parseIds(argv) {
    const idx = argv.indexOf('--ids');
    if (idx < 0) return null;
    return new Set(String(argv[idx + 1] || '').split(',').filter(Boolean).map(Number));
}

const argv = process.argv.slice(2);
const ref = argv[0];
const rangeRaw = argv[1];
if (!ref || !rangeRaw) throw new Error(usage());
const { start, end } = parseRange(rangeRaw);
const ids = parseIds(argv);

const sessionPath = resolveSessionRef(ref);
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
let boundary = 0;
game._preNhgetchHook = async () => {
    await originalHook();
    const screenIndex = nhGame.getScreens().length - 1;
    if (screenIndex >= start && screenIndex <= end) {
        const screen = nhGame.getScreens().at(-1) || '';
        const top = String(screen).split('\n')[0] || '';
        const expected = seg.steps?.[screenIndex] || {};
        const monsters = (game.level?.monsters || [])
            .filter((mon) => !ids || ids.has(mon.m_id))
            .map((mon, index) => ({
                index,
                id: mon.m_id,
                name: mon.data?.name,
                x: mon.mx,
                y: mon.my,
                move: mon.movement,
                tame: mon.mtame || 0,
                peaceful: mon.mpeaceful || 0,
                track: mon.mtrack || [],
            }));
        console.log(JSON.stringify({
            boundary,
            screenIndex,
            rawKey: seg.moves?.[boundary] || '',
            expectedKey: expected.key ?? null,
            rng: getRngLog().length,
            moves: game.moves,
            top,
            pending: game._pending_message || '',
            afterMoreMessage: game._after_more_message || '',
            afterMoreNeedsPrompt: !!game._after_more_needs_prompt,
            more: !!game._more,
            ux: game.u?.ux,
            uy: game.u?.uy,
            monsters,
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

#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import { normalizeSession } from '../frozen/session_loader.mjs';
import { NethackGame, runSegment } from '../js/jsmain.js';
import { moveloop_core } from '../js/allmain.js';
import { game } from '../js/gstate.js';
import { GameDisplay } from '../js/game_display.js';
import { getRngLog } from '../js/rng.js';

function usage() {
    return 'Usage: node scratch/trace-cell-history.mjs <session.json> <x,y[;x,y...]> [--segment N]';
}

function optionValue(name, fallback = null) {
    const idx = process.argv.indexOf(name);
    if (idx < 0) return fallback;
    const value = process.argv[idx + 1];
    if (value == null || value.startsWith('--')) throw new Error(usage());
    return value;
}

function parseCells(raw) {
    return String(raw || '').split(';').filter(Boolean).map((part) => {
        const [x, y] = part.split(',').map(Number);
        if (!Number.isInteger(x) || !Number.isInteger(y)) throw new Error(usage());
        return { x, y, key: `${x},${y}` };
    });
}

const positional = process.argv.slice(2).filter((arg, idx, all) => {
    if (all[idx - 1] === '--segment') return false;
    return arg !== '--segment';
});
const [sessionPath, cellsRaw] = positional;
if (!sessionPath || !cellsRaw) throw new Error(usage());
const segmentIndex = Number(optionValue('--segment', '0'));
const cells = parseCells(cellsRaw);

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

function snapshot(cell) {
    const loc = game.level?.at(cell.x, cell.y);
    return {
        uz: game.u?.uz ? { ...game.u.uz } : null,
        ux: game.u?.ux,
        uy: game.u?.uy,
        typ: loc?.typ ?? null,
        viz: game.viz_array?.[cell.y]?.[cell.x] ?? null,
        lit: !!loc?.lit,
        waslit: !!loc?.waslit,
        roomno: loc?.roomno ?? null,
        edge: loc?.edge ?? null,
        seenv: loc?.seenv ?? null,
        remembered: loc?.remembered_glyph || null,
        disp: loc ? { ch: loc.disp_ch, color: loc.disp_color, dec: loc.disp_decgfx } : null,
    };
}

function stablePart(snap) {
    return JSON.stringify({
        uz: snap.uz,
        typ: snap.typ,
        viz: snap.viz,
        lit: snap.lit,
        waslit: snap.waslit,
        roomno: snap.roomno,
        edge: snap.edge,
        seenv: snap.seenv,
        remembered: snap.remembered,
        disp: snap.disp,
    });
}

const last = new Map();
function maybePrint(boundary, phase) {
    const screenIndex = nhGame.getScreens().length - 1;
    for (const cell of cells) {
        const snap = snapshot(cell);
        const stable = stablePart(snap);
        if (last.get(cell.key) === stable) continue;
        last.set(cell.key, stable);
        console.log(JSON.stringify({
            phase,
            boundary,
            screenIndex,
            key: seg.steps?.[screenIndex]?.key ?? null,
            rawKey: seg.moves?.[boundary] ?? null,
            moves: game.moves,
            rng: getRngLog()?.length ?? 0,
            cell: cell.key,
            ...snap,
        }));
    }
}

await nhGame.start();
maybePrint(0, 'start');
const originalHook = game._preNhgetchHook;
let boundary = 0;
game._preNhgetchHook = async () => {
    await originalHook();
    maybePrint(boundary, 'input');
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

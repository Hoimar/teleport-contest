import { readFileSync } from 'node:fs';
import { normalizeSession } from '../frozen/session_loader.mjs';
import { NethackGame, runSegment } from '../js/jsmain.js';
import { moveloop_core } from '../js/allmain.js';
import { game } from '../js/gstate.js';
import { GameDisplay } from '../js/game_display.js';
import { clear_path } from '../js/vision.js';

function usage() {
    return 'Usage: node scratch/trace-vision-frontier.mjs <session.json> <screen-index> <x1:y1:x2:y2> [--segment N]';
}

function parseBox(raw) {
    const parts = String(raw || '').split(':').map(Number);
    if (parts.length !== 4 || parts.some((n) => !Number.isFinite(n))) throw new Error(usage());
    const [x1, y1, x2, y2] = parts;
    return {
        x1: Math.min(x1, x2),
        y1: Math.min(y1, y2),
        x2: Math.max(x1, x2),
        y2: Math.max(y1, y2),
    };
}

function optionValue(name, fallback = null) {
    const idx = process.argv.indexOf(name);
    if (idx < 0) return fallback;
    const value = process.argv[idx + 1];
    if (value == null || value.startsWith('--')) throw new Error(usage());
    return value;
}

const [sessionPath, screenRaw, boxRaw] = process.argv.slice(2).filter((arg, idx, all) => {
    if (all[idx - 1] === '--segment') return false;
    return arg !== '--segment';
});
if (!sessionPath || !screenRaw || !boxRaw) throw new Error(usage());
const targetScreen = Number(screenRaw);
const box = parseBox(boxRaw);
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
let printed = false;
game._preNhgetchHook = async () => {
    await originalHook();
    const screenIndex = nhGame.getScreens().length - 1;
    if (printed || screenIndex !== targetScreen) return;
    printed = true;
    const u = game.u || {};
    console.log(`screen=${screenIndex} key=${JSON.stringify(seg.steps?.[screenIndex]?.key)} u=${u.ux},${u.uy} old=${u.ux0},${u.uy0} more=${!!game._more}`);
    console.log(`box=${box.x1},${box.y1}..${box.x2},${box.y2}`);
    const width = box.x2 - box.x1 + 1;
    const header = Array.from({ length: width }, (_, i) => String((box.x1 + i) % 10)).join('');
    console.log(`x ${header}`);
    for (let y = box.y1; y <= box.y2; y++) {
        let terrain = '';
        let viz = '';
        let los = '';
        let mem = '';
        let disp = '';
        for (let x = box.x1; x <= box.x2; x++) {
            const loc = game.level?.at(x, y);
            terrain += terrainChar(loc?.typ);
            viz += vizChar(game.viz_array?.[y]?.[x] || 0);
            los += clear_path(u.ux, u.uy, x, y) ? 'L' : '.';
            mem += loc?.remembered_glyph?.ch ? glyphChar(loc.remembered_glyph.ch) : '.';
            disp += loc?.disp_ch ? glyphChar(loc.disp_ch) : '.';
        }
        console.log(`y=${String(y).padStart(2)} typ ${terrain}`);
        console.log(`     viz ${viz}`);
        console.log(`     los ${los}`);
        console.log(`     mem ${mem}`);
        console.log(`     dsp ${disp}`);
    }
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

function terrainChar(typ) {
    switch (typ) {
    case 0: return ' ';
    case 1: return '|';
    case 2: return '-';
    case 3: return '+';
    case 4: return '+';
    case 23: return 'D';
    case 24: return '#';
    case 25: return '.';
    default: return '?';
    }
}

function vizChar(v) {
    if ((v & 3) === 3) return 'S';
    if (v & 1) return 'c';
    if (v & 2) return 's';
    return '.';
}

function glyphChar(ch) {
    if (ch === '~') return '.';
    if (ch === '-' || ch === '|') return ch;
    if (ch === 'm') return '+';
    return ch;
}

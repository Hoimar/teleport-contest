import { readFileSync } from 'node:fs';
import path from 'node:path';

import { normalizeSession } from '../frozen/session_loader.mjs';
import { decodeScreen } from '../frozen/screen-decode.mjs';
import { NethackGame } from '../js/jsmain.js';
import { moveloop_core } from '../js/allmain.js';
import { game } from '../js/gstate.js';
import { GameDisplay } from '../js/game_display.js';
import { cansee, couldsee } from '../js/vision.js';
import { terrain_glyph } from '../js/display.js';

function usage() {
    return 'Usage: node scratch/trace-medusa-vision.mjs <session.json> <screen-index>';
}

const [sessionPath, indexRaw] = process.argv.slice(2);
const targetIndex = Number(indexRaw);
if (!sessionPath || !Number.isInteger(targetIndex)) throw new Error(usage());

const session = normalizeSession(JSON.parse(readFileSync(sessionPath, 'utf8')));
const seg = session.segments[0];
const nhGame = new NethackGame({
    seed: seg.seed,
    datetime: seg.datetime,
    nethackrc: seg.nethackrc,
    storage: new Map(),
});
const display = new GameDisplay(null);
display.onEmptyQueue = () => { throw new Error('Input queue empty'); };
nhGame._pendingDisplay = display;
for (const ch of seg.moves || '') display.pushKey(ch.charCodeAt(0));

function rowText(grid, row) {
    return grid[row].map((cell) => cell.ch).join('');
}

function cellDump(x, y) {
    const loc = game.level?.at?.(x, y);
    const glyph = loc ? terrain_glyph(loc, x, y) : null;
    return {
        x, y,
        typ: loc?.typ,
        lit: loc?.lit,
        waslit: loc?.waslit,
        roomno: loc?.roomno,
        edge: loc?.edge,
        seenv: loc?.seenv,
        cansee: cansee(x, y),
        couldsee: couldsee(x, y),
        viz: game.viz_array?.[y]?.[x],
        remembered: loc?.remembered_glyph ?? null,
        disp: loc?.disp_ch ?? null,
        glyph,
    };
}

await nhGame.start();
const originalHook = game._preNhgetchHook;
let boundary = 0;
game._preNhgetchHook = async () => {
    await originalHook();
    if (boundary === targetIndex) {
        const actualScreen = nhGame.getScreens().at(-1) || '';
        const expectedStep = seg.steps?.[boundary] || {};
        const actual = decodeScreen(actualScreen);
        const expected = decodeScreen(expectedStep.screen || '');
        const u = game.u || {};

        console.log(`session=${path.basename(sessionPath)} index=${targetIndex}`);
        console.log(`key=${JSON.stringify(seg.moves?.[boundary] || '')} moves=${game.moves} uz=${JSON.stringify(u.uz)} ux=${u.ux} uy=${u.uy}`);
        console.log(`cursor expected=${JSON.stringify(expectedStep.cursor || null)} actual=${JSON.stringify(nhGame.getCursors().at(-1) || null)}`);
        const stairList = [];
        for (let st = game.stairs; st; st = st.next) stairList.push(st);
        console.log(`stairs=${JSON.stringify(stairList)}`);
        console.log(`upstair=${JSON.stringify(game.level?.upstair || null)} dnstair=${JSON.stringify(game.level?.dnstair || null)}`);
        console.log(`medusa=${JSON.stringify((game.level?.monsters || []).filter((mon) => mon.data?.name === 'MEDUSA').map((mon) => ({ x: mon.mx, y: mon.my, hp: mon.mhp, asleep: mon.msleeping })) )}`);
        for (let row = 0; row <= 8; row++) {
            console.log(`E${String(row).padStart(2, '0')}: ${rowText(expected, row)}`);
            console.log(`A${String(row).padStart(2, '0')}: ${rowText(actual, row)}`);
        }
        for (let row = 15; row <= 18; row++) {
            console.log(`E${String(row).padStart(2, '0')}: ${rowText(expected, row)}`);
            console.log(`A${String(row).padStart(2, '0')}: ${rowText(actual, row)}`);
        }
        for (const [x, y] of [[12, 6], [32, 16], [11, 7], [49, 16], [70, 7], [70, 14]]) {
            console.log(JSON.stringify({ explicit: [x, y], state: cellDump(x, y) }));
        }
        for (const [sr, sc] of [[2, 39], [3, 39]]) {
            console.log(`screen[${sr},${sc}] expected=${JSON.stringify(expected[sr][sc])} actual=${JSON.stringify(actual[sr][sc])}`);
            for (const [dx, dy] of [[0, 0], [1, 0], [0, -1], [1, -1], [0, 1], [1, 1]]) {
                const x = sc + 1 + dx;
                const y = sr - 1 + dy;
                console.log(JSON.stringify({ fromScreen: [sr, sc], candidate: [x, y], state: cellDump(x, y) }));
            }
        }
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

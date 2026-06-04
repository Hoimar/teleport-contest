#!/usr/bin/env node

import { readFileSync } from 'node:fs';

const session = JSON.parse(readFileSync('sessions/seed4500-knight-coverage.session.json', 'utf8'));
const rng = [];
for (const step of session.segments[0].steps) {
    for (const entry of step.rng || []) rng.push(entry);
}

const expected = rng
    .map((entry, idx) => ({ entry, idx }))
    .filter(({ idx, entry }) => idx >= 90863 && entry.includes('walkfrom'))
    .map(({ entry, idx }) => {
        const m = entry.match(/rn2\((\d+)\)=(\d+)/);
        return { idx, q: Number(m[1]), val: Number(m[2]), entry };
    });

function move(x, y, dir) {
    switch (dir) {
    case 0: return [x, y - 1];
    case 1: return [x + 1, y];
    case 2: return [x, y + 1];
    case 3: return [x - 1, y];
    default: return [x, y];
    }
}

function simulate(opt) {
    const COLNO = 80, ROWNO = 21;
    const STONE = 0, HWALL = 1, ROOM = 2;
    const grid = Array.from({ length: COLNO }, () => Array(ROWNO).fill(STONE));
    for (let x = opt.fillX1; x <= opt.fillX2; x++) {
        for (let y = opt.fillY1; y <= opt.fillY2; y++) {
            grid[x][y] = (y < opt.stoneRows || ((x % 2) && (y % 2))) ? STONE : HWALL;
        }
    }
    let x = 1 + opt.xstartAdd;
    let y = 10 + opt.ystartAdd;
    x++;
    if (grid[x]?.[y] != null) grid[x][y] = ROOM;
    if (!(x % 2)) {
        x++;
        if (grid[x]?.[y] != null) grid[x][y] = ROOM;
    }
    if (!(y % 2)) y--;

    let pos = 0;
    const stack = [[x, y, 0]];
    while (stack.length) {
        const frame = stack[stack.length - 1];
        x = frame[0];
        y = frame[1];
        if (frame[2] === 0 && grid[x]?.[y] != null) grid[x][y] = ROOM;
        frame[2] = 1;
        const dirs = [];
        for (let dir = 0; dir < 4; dir++) {
            let [tx, ty] = move(x, y, dir);
            [tx, ty] = move(tx, ty, dir);
            if (tx >= opt.minOkX && ty >= opt.minOkY && tx <= opt.xMax && ty <= opt.yMax
                && grid[tx]?.[ty] === STONE) dirs.push(dir);
        }
        if (!dirs.length) {
            stack.pop();
            continue;
        }
        const exp = expected[pos];
        if (!exp || dirs.length !== exp.q || exp.val >= dirs.length) {
            return {
                matched: pos,
                idx: exp?.idx,
                gotQ: dirs.length,
                expQ: exp?.q,
                x,
                y,
                dirs,
                opt,
            };
        }
        const dir = dirs[exp.val];
        let [mx, my] = move(x, y, dir);
        grid[mx][my] = ROOM;
        let [nx, ny] = move(mx, my, dir);
        stack.push([nx, ny, 0]);
        pos++;
    }
    return { matched: pos, opt };
}

const variants = [];
for (const xstartAdd of [0, 1])
    for (const ystartAdd of [0])
        for (const fillX1 of [1, 2])
            for (const fillX2 of [78, 79])
                for (const fillY1 of [0])
                    for (const fillY2 of [20])
                        for (const stoneRows of [1, 2])
                            for (const minOkX of [2, 3])
                                for (const minOkY of [2, 3])
                                    for (const xMax of [78, 79])
                                        for (const yMax of [20]) {
                                            variants.push({ xstartAdd, ystartAdd, fillX1, fillX2, fillY1, fillY2, stoneRows, minOkX, minOkY, xMax, yMax });
                                        }

const results = variants.map(simulate).sort((a, b) => b.matched - a.matched);
for (const result of results.slice(0, 20)) {
    console.log(JSON.stringify(result));
}

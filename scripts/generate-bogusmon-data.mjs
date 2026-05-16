#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE = path.join(ROOT, 'nethack-c', 'upstream', 'dat', 'bogusmon.txt');
const OUT = path.join(ROOT, 'js', 'bogusmon_data.js');

const source = readFileSync(SOURCE, 'utf8').replace(/\r\n/g, '\n');
const lines = ['grue\n'];
for (const raw of source.split('\n')) {
    const line = `${raw}\n`;
    if (line[0] !== '#' && line !== '\n') lines.push(line);
}

writeFileSync(OUT, [
    '// Generated from nethack-c/upstream/dat/bogusmon.txt (NetHack 5.0).',
    '// C refs: util/makedefs.c:do_rnd_access_file(), do_name.c:bogusmon().',
    '// Keep this browser-safe: production JS must not read files at runtime.',
    `export const BOGUSMON_LINES = ${JSON.stringify(lines, null, 4)};`,
    '',
].join('\n'));

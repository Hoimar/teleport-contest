import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DAT_DIR = path.join(ROOT, 'nethack-c', 'upstream', 'dat');
const OUT = path.join(ROOT, 'js', 'help_data.js');
const FILES = [
    'help',
    'hh',
    'history',
    'opthelp',
    'optmenu',
    'cmdhelp',
    'usagehlp',
    'license',
    'wizhelp',
    'keyhelp',
];

const lines = [
    '// Generated from nethack-c/upstream/dat help files.',
    '// C refs: pager.c:dohelp(), windows.c:genl_display_file(), dlb.c:dlb_fopen().',
    '// Keep this browser-safe: production JS must not read files at runtime.',
    'export const HELP_DATA_FILES = Object.freeze({',
];

for (const name of FILES) {
    const text = readFileSync(path.join(DAT_DIR, name), 'utf8');
    lines.push(`    ${JSON.stringify(name)}: ${JSON.stringify(text)},`);
}
lines.push('});', '');

writeFileSync(OUT, lines.join('\n'));

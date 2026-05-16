#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { normalizeSession } from '../frozen/session_loader.mjs';
import { analyzeSession, compareScreen, keyToDisplay, resolveSessionRef } from './triage-lib.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..');

function usage() {
    return 'Usage: node scripts/screen-diff.mjs <session> [--first|--index N] [--all-cells]';
}

function parseArgs(argv) {
    const out = { session: null, first: false, index: null, all: false };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--first') out.first = true;
        else if (arg === '--all-cells') out.all = true;
        else if (arg === '--index') out.index = Number(argv[++i]);
        else if (arg.startsWith('--index=')) out.index = Number(arg.slice(8));
        else if (!arg.startsWith('--') && !out.session) out.session = arg;
        else throw new Error(`unknown argument ${arg}`);
    }
    if (!out.session) throw new Error(usage());
    return out;
}

async function runScreens(sessionPath) {
    const raw = JSON.parse(readFileSync(sessionPath, 'utf8'));
    const session = normalizeSession(raw);
    const { runSegment } = await import(path.join(ROOT, 'js', 'jsmain.js'));
    let game = null;
    for (const seg of session.segments) {
        game = await runSegment({
            seed: seg.seed,
            datetime: seg.datetime,
            nethackrc: seg.nethackrc,
            moves: seg.moves,
        }, game);
    }
    const steps = [];
    for (const seg of session.segments) {
        for (const step of seg.steps || []) {
            steps.push({
                key: step.key ?? null,
                screen: step.screen || '',
                cursor: step.cursor || null,
            });
        }
    }
    return { steps, screens: game?.getScreens?.() || [], cursors: game?.getCursors?.() || [] };
}

function sampleText(sample) {
    const exp = `${JSON.stringify(sample.expected.ch)}/${sample.expected.color}`;
    const act = `${JSON.stringify(sample.actual.ch)}/${sample.actual.color}`;
    return `[${sample.row},${sample.col}] ${sample.kind} ${exp} -> ${act}`;
}

async function main() {
    const args = parseArgs(process.argv.slice(2));
    const sessionPath = resolveSessionRef(args.session);
    let index = args.index;
    if (args.first || index == null) {
        const triage = await analyzeSession(args.session, { sampleLimit: args.all ? 2000 : 8 });
        index = triage.firstScreenMismatch?.index ?? 0;
    }

    const { steps, screens, cursors } = await runScreens(sessionPath);
    const expected = steps[index];
    if (!expected) throw new Error(`screen index ${index} is outside session`);
    const actual = screens[index] || '';
    const diff = compareScreen(actual, expected.screen, args.all ? 2000 : 12);
    const actualCursor = cursors[index] || null;

    console.log(`${path.basename(sessionPath)} screen ${index} key=${keyToDisplay(expected.key)} ${diff.kind}/${diff.surface}`);
    console.log(`rows=${diff.rows.join(',') || '-'} char=${diff.charDiffs} attr=${diff.attrDiffs}`);
    console.log(`msg exp=${JSON.stringify(diff.message.expected)}`);
    console.log(`msg act=${JSON.stringify(diff.message.actual)}`);
    console.log(`cursor exp=${JSON.stringify(expected.cursor)} act=${JSON.stringify(actualCursor)}`);
    if (diff.samples.length) console.log(`cells ${diff.samples.map(sampleText).join(' ; ')}`);
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});

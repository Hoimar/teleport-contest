#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { analyzeSession } from './triage-lib.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');
const MANIFEST_PATH = path.join(PROJECT_ROOT, 'sessions', 'manifest.json');

const FR_BANDS = [
    { name: '0-250', min: 0, max: 250 },
    { name: '251-1200', min: 251, max: 1200 },
    { name: '>1200', min: 1201, max: Infinity },
];

const KNOWN_BLOCKERS = new Map([
    [
        'seed0116-wizard-wear-shop.session.json',
        {
            hypothesis: 'Pet behavior: dog_goal() object scan, reachability, carry checks, and object resistance in dogmove.c.',
            owner: 'Monsters / pets',
            needsDeeperDebug: true,
        },
    ],
    [
        'seed0383-wizard-hallucinate.session.json',
        {
            hypothesis: 'Special-level monster setup: des.monster() selected-monster initialization, equipment, and hallucination display context.',
            owner: 'Special levels / monsters',
            needsDeeperDebug: true,
        },
    ],
    [
        'seed8000-tourist-starter.session.json',
        {
            hypothesis: 'Live turn loop: post-screen monster movement RNG ownership after visible screen parity.',
            owner: 'Turn loop / monster movement',
            needsDeeperDebug: true,
        },
    ],
]);

function usage() {
    return [
        'Usage: node scripts/triage-corpus.mjs [--json] [--markdown <path>] [session-ref ...]',
        '',
        'When no session refs are supplied, all sessions from sessions/manifest.json are analyzed.',
    ].join('\n');
}

function parseArgs(argv) {
    const options = {
        json: false,
        markdownPath: null,
        refs: [],
    };

    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--help' || arg === '-h') {
            console.log(usage());
            process.exit(0);
        }
        if (arg === '--json') {
            options.json = true;
            continue;
        }
        if (arg === '--markdown') {
            const outPath = argv[++i];
            if (!outPath || outPath.startsWith('--')) {
                throw new Error('--markdown requires an output path');
            }
            options.markdownPath = outPath;
            continue;
        }
        if (arg.startsWith('--markdown=')) {
            options.markdownPath = arg.slice('--markdown='.length);
            if (!options.markdownPath) throw new Error('--markdown requires an output path');
            continue;
        }
        if (arg.startsWith('--')) {
            throw new Error(`unknown option ${arg}`);
        }
        options.refs.push(arg);
    }

    return options;
}

function loadManifestRefs() {
    return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
}

function stripSessionSuffix(session) {
    return session.replace(/\.session\.json$/, '');
}

function rngCallShape(entry) {
    if (entry == null) return null;
    const text = String(entry).trim();
    const match = text.match(/^([a-z0-9_]+\([^=]*\))/i);
    return match ? match[1] : text.replace(/=.*/, '');
}

function rngSignature(firstRngMismatch) {
    if (!firstRngMismatch) return '-';
    const expected = rngCallShape(firstRngMismatch.expected) ?? 'null';
    const actual = rngCallShape(firstRngMismatch.actual) ?? 'null';
    return `${expected}=>${actual}`;
}

function firstRngIndex(result) {
    return result.firstRngMismatch?.index ?? null;
}

function firstScreenIndex(result) {
    return result.firstScreenMismatch?.index ?? null;
}

function frBand(index) {
    if (index == null) return 'none';
    for (const band of FR_BANDS) {
        if (index >= band.min && index <= band.max) return band.name;
    }
    return 'none';
}

function screenHead(result) {
    const first = result.firstScreenMismatch;
    if (!first) return '-';
    return `${first.index}:${first.mismatchClass}:${first.screen.surface}:${first.keyDisplay}`;
}

function rngHead(result) {
    const first = result.firstRngMismatch;
    if (!first) return '-';
    return `${first.index}:${rngSignature(first)}`;
}

function phaseBucket(result) {
    const fs = firstScreenIndex(result);
    const fr = firstRngIndex(result);
    const surface = result.firstScreenMismatch?.screen.surface ?? 'none';

    if (fs == null) {
        if (fr != null) return 'post-screen-rng';
        return 'passing';
    }

    if (fs === 0) {
        if (fr == null || fr <= 250) return 'early-startup';
        if (fr <= 1200) return 'mklev-or-uinit';
        return 'late-startup';
    }

    if (surface === 'map') return 'post-startup-live';
    return 'post-startup-live';
}

function defaultHypothesis(record) {
    const fs = record.firstScreenMismatchIndex;
    const fr = record.firstRngMismatchIndex;
    const surface = record.surface;

    if (record.phaseBucket === 'passing') {
        return {
            hypothesis: 'No compact divergence found for this corpus run.',
            owner: 'None',
            needsDeeperDebug: false,
        };
    }

    if (record.phaseBucket === 'post-screen-rng') {
        return {
            hypothesis: 'Hidden turn-loop, delayed side effect, or monster movement RNG ownership after visible screens match.',
            owner: 'Turn loop / monster movement',
            needsDeeperDebug: true,
        };
    }

    if (fs === 0 && (fr == null || fr <= 250)) {
        return {
            hypothesis: 'Chargen, role/race/gender/align selection, options parsing, or early startup RNG ordering.',
            owner: 'Player initialization / options',
            needsDeeperDebug: surface === 'mixed',
        };
    }

    if (fs === 0 && fr <= 1200) {
        return {
            hypothesis: 'u_init, mklev, dungeon initialization, initial inventory, or level topology setup.',
            owner: 'Startup level generation / u_init',
            needsDeeperDebug: surface === 'mixed',
        };
    }

    if (fs === 0) {
        return {
            hypothesis: 'Late startup side effects, special levels, monster/object initialization, or display setup.',
            owner: 'Mklev / objects / monsters / display',
            needsDeeperDebug: true,
        };
    }

    if (surface === 'message') {
        return {
            hypothesis: 'Message buffer, prompt/menu lifecycle, or command dispatch timing after startup.',
            owner: 'Messages / command dispatch',
            needsDeeperDebug: false,
        };
    }

    if (surface === 'map') {
        return {
            hypothesis: 'Live command effects, movement, pet/monster behavior, or retained object/map state.',
            owner: 'Commands / monsters / objects',
            needsDeeperDebug: record.mismatchClass === 'char+attr',
        };
    }

    return {
        hypothesis: 'Mixed live-state divergence spanning display, status, messages, or command side effects.',
        owner: 'Display / command dispatch',
        needsDeeperDebug: true,
    };
}

function recordHypothesis(record) {
    return KNOWN_BLOCKERS.get(record.session) ?? defaultHypothesis(record);
}

function sampleCells(firstScreenMismatch) {
    if (!firstScreenMismatch) return [];
    return firstScreenMismatch.screen.samples.map((sample) => ({
        row: sample.row,
        col: sample.col,
        kind: sample.kind,
        expected: `${sample.expected.ch}/${sample.expected.color}`,
        actual: `${sample.actual.ch}/${sample.actual.color}`,
    }));
}

function makeRecord(result) {
    const firstScreen = result.firstScreenMismatch;
    const firstRng = result.firstRngMismatch;
    const record = {
        session: result.session,
        matchedScreens: result.metrics.screens.matched,
        totalScreens: result.metrics.screens.total,
        actualScreens: result.metrics.screens.actualTotal,
        matchedRngCalls: result.metrics.rngCalls.matched,
        totalRngCalls: result.metrics.rngCalls.total,
        actualRngCalls: result.metrics.rngCalls.actualTotal,
        firstScreenMismatchIndex: firstScreen?.index ?? null,
        keyDisplay: firstScreen?.keyDisplay ?? '-',
        mismatchClass: firstScreen?.mismatchClass ?? 'none',
        surface: firstScreen?.screen.surface ?? 'none',
        rowSummary: firstScreen?.rowSummary ?? '-',
        firstRngMismatchIndex: firstRng?.index ?? null,
        rngSignature: rngSignature(firstRng),
        firstSampleCells: sampleCells(firstScreen),
        cursorOnlyMismatches: result.metrics.cursorOnly.count,
        error: result.error ?? null,
        warnings: result.warnings,
    };
    record.phaseBucket = phaseBucket(result);
    record.bucketKey = [
        record.phaseBucket,
        `FS=${record.firstScreenMismatchIndex ?? 'pass'}`,
        `FR=${frBand(record.firstRngMismatchIndex)}`,
        `${record.mismatchClass}/${record.surface}`,
        record.rngSignature,
        `rows=${record.rowSummary}`,
    ].join(' | ');
    Object.assign(record, recordHypothesis(record));
    return record;
}

function makeBuckets(records) {
    const byKey = new Map();
    for (const record of records) {
        if (!byKey.has(record.bucketKey)) {
            byKey.set(record.bucketKey, {
                key: record.bucketKey,
                phaseBucket: record.phaseBucket,
                count: 0,
                sessions: [],
                canonicalSession: record.session,
                canonicalSummary: {
                    screens: `${record.matchedScreens}/${record.totalScreens}`,
                    rngCalls: `${record.matchedRngCalls}/${record.totalRngCalls}`,
                    firstScreen: record.firstScreenMismatchIndex,
                    firstRng: record.firstRngMismatchIndex,
                    rngSignature: record.rngSignature,
                    surface: record.surface,
                    mismatchClass: record.mismatchClass,
                    rowSummary: record.rowSummary,
                    sampleCells: record.firstSampleCells,
                },
                hypothesis: record.hypothesis,
                owner: record.owner,
                needsDeeperDebug: record.needsDeeperDebug,
            });
        }
        const bucket = byKey.get(record.bucketKey);
        bucket.count++;
        bucket.sessions.push(record.session);
        if (record.needsDeeperDebug) bucket.needsDeeperDebug = true;
        if (KNOWN_BLOCKERS.has(record.session) && !KNOWN_BLOCKERS.has(bucket.canonicalSession)) {
            bucket.canonicalSession = record.session;
            bucket.canonicalSummary = {
                screens: `${record.matchedScreens}/${record.totalScreens}`,
                rngCalls: `${record.matchedRngCalls}/${record.totalRngCalls}`,
                firstScreen: record.firstScreenMismatchIndex,
                firstRng: record.firstRngMismatchIndex,
                rngSignature: record.rngSignature,
                surface: record.surface,
                mismatchClass: record.mismatchClass,
                rowSummary: record.rowSummary,
                sampleCells: record.firstSampleCells,
            };
            bucket.hypothesis = record.hypothesis;
            bucket.owner = record.owner;
        }
    }

    return [...byKey.values()].sort((a, b) => {
        if (b.count !== a.count) return b.count - a.count;
        return a.key.localeCompare(b.key);
    });
}

function totals(records) {
    return records.reduce((acc, record) => {
        acc.sessions++;
        acc.matchedScreens += record.matchedScreens;
        acc.totalScreens += record.totalScreens;
        acc.matchedRngCalls += record.matchedRngCalls;
        acc.totalRngCalls += record.totalRngCalls;
        if (record.error) acc.errors++;
        return acc;
    }, {
        sessions: 0,
        matchedScreens: 0,
        totalScreens: 0,
        matchedRngCalls: 0,
        totalRngCalls: 0,
        errors: 0,
    });
}

function pad(text, width) {
    const str = String(text);
    return str.length >= width ? str.slice(0, width - 1) + '~' : str.padEnd(width, ' ');
}

function formatTable(records, buckets) {
    const lines = [];
    lines.push(`corpus ${records.length} sessions, ${buckets.length} buckets`);
    lines.push([
        pad('session', 39),
        pad('S', 9),
        pad('R', 13),
        pad('phase', 18),
        pad('FS', 20),
        pad('FR', 26),
        pad('rows', 10),
    ].join(' '));

    for (const record of records) {
        lines.push([
            pad(stripSessionSuffix(record.session), 39),
            pad(`${record.matchedScreens}/${record.totalScreens}`, 9),
            pad(`${record.matchedRngCalls}/${record.totalRngCalls}`, 13),
            pad(record.phaseBucket, 18),
            pad(`${record.firstScreenMismatchIndex ?? '-'}:${record.mismatchClass}:${record.surface}`, 20),
            pad(`${record.firstRngMismatchIndex ?? '-'}:${record.rngSignature}`, 26),
            pad(record.rowSummary, 10),
        ].join(' '));
    }

    lines.push('');
    lines.push('bucket summary');
    for (const bucket of buckets) {
        lines.push(`${String(bucket.count).padStart(2, ' ')} ${bucket.phaseBucket} ${bucket.key}`);
    }
    return lines.join('\n');
}

function escapeMd(text) {
    return String(text).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function markdownTable(headers, rows) {
    const out = [];
    out.push(`| ${headers.map(escapeMd).join(' | ')} |`);
    out.push(`| ${headers.map(() => '---').join(' | ')} |`);
    for (const row of rows) out.push(`| ${row.map(escapeMd).join(' | ')} |`);
    return out.join('\n');
}

function formatSampleCells(cells) {
    if (!cells.length) return '-';
    return cells.map((cell) => {
        return `[${cell.row},${cell.col}] ${cell.kind} ${cell.expected} -> ${cell.actual}`;
    }).join('; ');
}

function renderMarkdown(records, buckets, summary) {
    const lines = [];
    lines.push('# Divergence Inventory');
    lines.push('');
    lines.push('Generated by `node scripts/triage-corpus.mjs --markdown scratch/divergence-inventory.md`.');
    lines.push('Sessions are evidence for subsystem hypotheses, not targets for seed-specific fixes.');
    lines.push('');
    lines.push('## Corpus Summary');
    lines.push('');
    lines.push(markdownTable(
        ['Sessions', 'Buckets', 'Screens', 'RNG calls', 'Errors'],
        [[
            summary.sessions,
            buckets.length,
            `${summary.matchedScreens}/${summary.totalScreens}`,
            `${summary.matchedRngCalls}/${summary.totalRngCalls}`,
            summary.errors,
        ]],
    ));
    lines.push('');
    lines.push('## Bucket Summary');
    lines.push('');
    lines.push(markdownTable(
        ['Count', 'Phase', 'Canonical evidence', 'Subsystem hypothesis', 'Owner', 'Needs deeper debug'],
        buckets.map((bucket) => [
            bucket.count,
            bucket.phaseBucket,
            stripSessionSuffix(bucket.canonicalSession),
            bucket.hypothesis,
            bucket.owner,
            bucket.needsDeeperDebug ? 'yes' : 'no',
        ]),
    ));
    lines.push('');
    lines.push('## Bucket Details');
    for (const bucket of buckets) {
        lines.push('');
        lines.push(`### ${bucket.phaseBucket}: ${stripSessionSuffix(bucket.canonicalSession)}`);
        lines.push('');
        lines.push(`- Count: ${bucket.count}`);
        lines.push(`- Bucket key: \`${bucket.key}\``);
        lines.push(`- Canonical screens: ${bucket.canonicalSummary.screens}`);
        lines.push(`- Canonical RNG: ${bucket.canonicalSummary.rngCalls}`);
        lines.push(`- First screen mismatch: ${bucket.canonicalSummary.firstScreen ?? '-'} (${bucket.canonicalSummary.mismatchClass}/${bucket.canonicalSummary.surface}, rows ${bucket.canonicalSummary.rowSummary})`);
        lines.push(`- First RNG mismatch: ${bucket.canonicalSummary.firstRng ?? '-'} (${bucket.canonicalSummary.rngSignature})`);
        lines.push(`- Sample cells: ${formatSampleCells(bucket.canonicalSummary.sampleCells)}`);
        lines.push(`- Hypothesis: ${bucket.hypothesis}`);
        lines.push(`- Next owner: ${bucket.owner}`);
        lines.push(`- Needs deeper debug: ${bucket.needsDeeperDebug ? 'yes' : 'no'}`);
        lines.push(`- Sessions: ${bucket.sessions.map(stripSessionSuffix).join(', ')}`);
    }
    lines.push('');
    lines.push('## Known Live Blockers');
    lines.push('');
    lines.push(markdownTable(
        ['Session', 'Screens', 'RNG', 'First screen', 'First RNG', 'Hypothesis'],
        [...KNOWN_BLOCKERS.keys()].map((session) => {
            const record = records.find((candidate) => candidate.session === session);
            if (!record) return [stripSessionSuffix(session), '-', '-', '-', '-', 'not in selected corpus'];
            return [
                stripSessionSuffix(session),
                `${record.matchedScreens}/${record.totalScreens}`,
                `${record.matchedRngCalls}/${record.totalRngCalls}`,
                `${record.firstScreenMismatchIndex ?? '-'}:${record.mismatchClass}:${record.surface}:${record.keyDisplay}`,
                `${record.firstRngMismatchIndex ?? '-'}:${record.rngSignature}`,
                record.hypothesis,
            ];
        }),
    ));
    lines.push('');
    lines.push('## Session Inventory');
    lines.push('');
    lines.push(markdownTable(
        ['Session', 'Screens', 'RNG', 'Phase', 'First screen', 'First RNG', 'Rows', 'Samples'],
        records.map((record) => [
            stripSessionSuffix(record.session),
            `${record.matchedScreens}/${record.totalScreens}`,
            `${record.matchedRngCalls}/${record.totalRngCalls}`,
            record.phaseBucket,
            `${record.firstScreenMismatchIndex ?? '-'}:${record.mismatchClass}:${record.surface}:${record.keyDisplay}`,
            `${record.firstRngMismatchIndex ?? '-'}:${record.rngSignature}`,
            record.rowSummary,
            formatSampleCells(record.firstSampleCells),
        ]),
    ));
    lines.push('');
    return lines.join('\n');
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    const refs = options.refs.length ? options.refs : loadManifestRefs();
    const results = [];

    for (const ref of refs) {
        results.push(await analyzeSession(ref, { sampleLimit: 5, cursorStepLimit: 6 }));
    }

    const records = results.map(makeRecord);
    const buckets = makeBuckets(records);
    const summary = totals(records);
    const output = { summary, sessions: records, buckets };

    if (options.markdownPath) {
        const outPath = path.resolve(PROJECT_ROOT, options.markdownPath);
        writeFileSync(outPath, renderMarkdown(records, buckets, summary));
    }

    if (options.json) {
        console.log(JSON.stringify(output, null, 2));
        return;
    }

    console.log(formatTable(records, buckets));
}

main().catch((err) => {
    console.error(err.message);
    process.exit(1);
});

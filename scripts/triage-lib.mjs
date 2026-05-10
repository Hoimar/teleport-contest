import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { normalizeSession } from '../frozen/session_loader.mjs';
import { decodeScreen, diffCell, renderCell, ROWS_24, COLS_80 } from '../frozen/screen-decode.mjs';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(SCRIPT_DIR, '..');
const SESSIONS_DIR = path.join(PROJECT_ROOT, 'sessions');
const MANIFEST_PATH = path.join(SESSIONS_DIR, 'manifest.json');

const STARTUP_VARIANT_LINES = [
    /Version\s+\d+\.\d+\.\d+[^\n]*/,
];

const FROZEN_JS_FILES = [
    ['frozen/isaac64.js', 'js/isaac64.js'],
    ['frozen/terminal.js', 'js/terminal.js'],
    ['frozen/storage.js', 'js/storage.js'],
];

export const DEFAULT_SENTINEL_SUITE = [
    'seed8000-tourist-starter.session.json',
    'seed0002-healer-reflection-drummer.session.json',
    'seed0013-friday13-save-then-fullmoon-restore.session.json',
    'seed0116-wizard-wear-shop.session.json',
    'seed0383-wizard-hallucinate.session.json',
];

function loadManifestSessions() {
    return JSON.parse(readFileSync(MANIFEST_PATH, 'utf8'));
}

export function resolveSessionRef(ref) {
    const exactCandidates = [
        ref,
        path.join(PROJECT_ROOT, ref),
        path.join(SESSIONS_DIR, ref),
    ];
    for (const candidate of exactCandidates) {
        if (candidate && path.extname(candidate) === '.json' && existsSync(candidate)) {
            return path.resolve(candidate);
        }
    }

    const manifest = loadManifestSessions();
    const normalized = ref.endsWith('.session.json') ? ref : `${ref}.session.json`;
    const exact = manifest.find((name) => name === normalized || name === ref);
    if (exact) return path.join(SESSIONS_DIR, exact);

    const fuzzy = manifest.filter((name) => name.includes(ref));
    if (fuzzy.length === 1) return path.join(SESSIONS_DIR, fuzzy[0]);
    if (fuzzy.length > 1) {
        throw new Error(`ambiguous session ref "${ref}": ${fuzzy.join(', ')}`);
    }

    throw new Error(`unknown session ref "${ref}"`);
}

export function keyToDisplay(key) {
    if (key == null) return 'init';
    if (key === '\x1b') return 'ESC';
    if (key === ' ') return 'Space';
    if (key === '\r' || key === '\n') return 'Enter';
    if (key === '\t') return 'Tab';
    if (key.length === 1) {
        const code = key.charCodeAt(0);
        if (code < 32) return `^${String.fromCharCode(code + 64)}`;
        return key;
    }
    return JSON.stringify(key);
}

function preDecode(s) {
    let cur = String(s || '');
    for (const re of STARTUP_VARIANT_LINES) {
        cur = cur.replace(re, '<<VERSION_BANNER>>');
    }
    cur = cur.replace(/^\d{2}:\d{2}:\d{2}\.$/gm, '<time>.');
    return cur;
}

function decodeComparable(s) {
    return decodeScreen(preDecode(s));
}

function gridRowText(grid, row) {
    let out = '';
    for (let c = 0; c < COLS_80; c++) out += renderCell(grid[row][c]);
    return out.trimEnd();
}

function compareScreen(actual, expected, sampleLimit = 5) {
    const ga = decodeComparable(actual);
    const gb = decodeComparable(expected);
    let charDiffs = 0;
    let attrDiffs = 0;
    const rows = new Set();
    const samples = [];

    for (let r = 0; r < ROWS_24; r++) {
        for (let c = 0; c < COLS_80; c++) {
            const kind = diffCell(ga[r][c], gb[r][c]);
            if (!kind) continue;
            rows.add(r);
            if (kind === 'ch') charDiffs++;
            else attrDiffs++;
            if (samples.length < sampleLimit) {
                samples.push({
                    row: r,
                    col: c,
                    kind,
                    expected: {
                        ch: renderCell(gb[r][c]),
                        color: gb[r][c].color,
                        attr: gb[r][c].attr,
                    },
                    actual: {
                        ch: renderCell(ga[r][c]),
                        color: ga[r][c].color,
                        attr: ga[r][c].attr,
                    },
                });
            }
        }
    }

    const rowList = [...rows].sort((a, b) => a - b);
    let surface = 'mixed';
    if (rowList.length > 0 && rowList.every((r) => r === 0)) surface = 'message';
    else if (rowList.length > 0 && rowList.every((r) => r >= 22)) surface = 'status';
    else if (rowList.length > 0 && rowList.every((r) => r >= 1 && r <= 21)) surface = 'map';

    let kind = 'none';
    if (charDiffs > 0 && attrDiffs > 0) kind = 'char+attr';
    else if (charDiffs > 0) kind = surface === 'message' ? 'message' : 'char';
    else if (attrDiffs > 0) kind = 'attr';

    return {
        equal: charDiffs === 0 && attrDiffs === 0,
        kind,
        surface,
        charDiffs,
        attrDiffs,
        rows: rowList,
        samples,
        message: {
            expected: gridRowText(gb, 0),
            actual: gridRowText(ga, 0),
        },
    };
}

function normalizeRng(entry) {
    return String(entry || '').replace(/\s*@\s.*$/, '').replace(/^\d+\s+/, '').trim();
}

function isRngCall(entry) {
    return /^(?:rn2|rnd|rn1|rnl|rne|rnz|d)\(/.test(normalizeRng(entry));
}

function extractRngCalls(rng) {
    return (rng || []).filter(isRngCall).map(normalizeRng);
}

function sameCursor(actual, expected) {
    return JSON.stringify(actual || null) === JSON.stringify(expected || null);
}

function summarizeRows(rows) {
    if (!rows.length) return '-';
    if (rows.length <= 6) return rows.join(',');
    return `${rows.slice(0, 6).join(',')}+${rows.length - 6}`;
}

function frozenConsistencyWarnings() {
    const warnings = [];
    for (const [frozenRel, liveRel] of FROZEN_JS_FILES) {
        const frozenPath = path.join(PROJECT_ROOT, frozenRel);
        const livePath = path.join(PROJECT_ROOT, liveRel);
        if (readFileSync(frozenPath, 'utf8') !== readFileSync(livePath, 'utf8')) {
            warnings.push(`${liveRel} differs from ${frozenRel}`);
        }
    }
    return warnings;
}

async function loadRunSegment() {
    const mod = await import(path.join(PROJECT_ROOT, 'js', 'jsmain.js'));
    return mod.runSegment;
}

export async function analyzeSession(sessionRef, options = {}) {
    const sampleLimit = options.sampleLimit ?? 5;
    const cursorStepLimit = options.cursorStepLimit ?? 10;
    const sessionPath = resolveSessionRef(sessionRef);
    const rawSession = JSON.parse(readFileSync(sessionPath, 'utf8'));
    const session = normalizeSession(rawSession);
    const runSegment = await loadRunSegment();

    const canonicalSteps = [];
    const canonicalRng = [];
    for (let segIdx = 0; segIdx < session.segments.length; segIdx++) {
        const seg = session.segments[segIdx];
        for (let stepIdx = 0; stepIdx < (seg.steps || []).length; stepIdx++) {
            const step = seg.steps[stepIdx];
            canonicalSteps.push({
                segmentIndex: segIdx,
                segmentStepIndex: stepIdx,
                key: step.key ?? null,
                screen: step.screen || '',
                cursor: step.cursor || null,
            });
            canonicalRng.push(...extractRngCalls(step.rng));
        }
    }

    let game = null;
    let jsError = null;
    try {
        for (const seg of session.segments) {
            game = await runSegment({
                seed: seg.seed,
                datetime: seg.datetime,
                nethackrc: seg.nethackrc,
                moves: seg.moves,
            }, game);
        }
    } catch (err) {
        jsError = err instanceof Error ? err.message : String(err);
    }

    const jsRng = extractRngCalls(game?.getRngLog?.() || []);
    const jsScreens = game?.getScreens?.() || [];
    const jsCursors = game?.getCursors?.() || [];

    let rngMatched = 0;
    let firstRngMismatch = null;
    for (let i = 0; i < canonicalRng.length; i++) {
        const expected = canonicalRng[i] || null;
        const actual = jsRng[i] || null;
        if (expected === actual) {
            rngMatched++;
            continue;
        }
        if (!firstRngMismatch) {
            firstRngMismatch = { index: i, expected, actual };
        }
    }
    if (!firstRngMismatch && jsRng.length > canonicalRng.length) {
        firstRngMismatch = {
            index: canonicalRng.length,
            expected: null,
            actual: jsRng[canonicalRng.length],
        };
    }

    let screenMatched = 0;
    let firstScreenMismatch = null;
    let firstCursorOnlyMismatch = null;
    let cursorOnlyCount = 0;
    const cursorOnlyMismatchSteps = [];
    for (let i = 0; i < canonicalSteps.length; i++) {
        const expected = canonicalSteps[i];
        const actualScreen = jsScreens[i] || '';
        const actualCursor = jsCursors[i] || null;
        const screen = compareScreen(actualScreen, expected.screen, sampleLimit);
        const cursorEqual = sameCursor(actualCursor, expected.cursor);

        if (screen.equal) screenMatched++;
        if (screen.equal && !cursorEqual) {
            cursorOnlyCount++;
            if (!firstCursorOnlyMismatch) {
                firstCursorOnlyMismatch = {
                    index: i,
                    segmentIndex: expected.segmentIndex,
                    segmentStepIndex: expected.segmentStepIndex,
                    key: expected.key,
                    keyDisplay: keyToDisplay(expected.key),
                    cursor: {
                        expected: expected.cursor,
                        actual: actualCursor,
                    },
                };
            }
            if (cursorOnlyMismatchSteps.length < cursorStepLimit) {
                cursorOnlyMismatchSteps.push(i);
            }
        }

        if (!firstScreenMismatch && !screen.equal) {
            firstScreenMismatch = {
                index: i,
                segmentIndex: expected.segmentIndex,
                segmentStepIndex: expected.segmentStepIndex,
                key: expected.key,
                keyDisplay: keyToDisplay(expected.key),
                screen,
                cursor: {
                    expected: expected.cursor,
                    actual: actualCursor,
                    equal: cursorEqual,
                },
                mismatchClass: screen.kind,
                rowSummary: summarizeRows(screen.rows),
            };
        }
    }

    return {
        session: path.basename(sessionPath),
        sessionPath,
        warnings: frozenConsistencyWarnings(),
        error: jsError,
        metrics: {
            rngCalls: {
                matched: rngMatched,
                total: canonicalRng.length,
                actualTotal: jsRng.length,
            },
            screens: {
                matched: screenMatched,
                total: canonicalSteps.length,
                actualTotal: jsScreens.length,
            },
            cursorOnly: {
                count: cursorOnlyCount,
                steps: cursorOnlyMismatchSteps,
            },
        },
        firstRngMismatch,
        firstScreenMismatch,
        firstCursorOnlyMismatch,
    };
}

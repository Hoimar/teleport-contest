#!/usr/bin/env node

import { createServer } from 'node:http';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { basename, extname, isAbsolute, join, normalize, relative, resolve, sep } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const SCRIPT_PATH = fileURLToPath(import.meta.url);
let PROJECT_ROOT = resolve(process.env.BROWSER_SCORE_ROOT || new URL('..', import.meta.url).pathname);

function sessionsDir() {
    return join(PROJECT_ROOT, 'sessions');
}

const NODE_BUILTIN_SHIM = `
const fail = (name) => () => { throw new Error(name + ' was called in the browser; this fork uses Node-only APIs'); };
export const env = {};
export const argv = [];
export const platform = 'browser';
export const version = 'browser';
export const versions = { node: '0.0.0' };
export const stdout = { write: (s) => console.log(String(s)) };
export const stderr = { write: (s) => console.error(String(s)) };
export const cwd = () => '/';
export const nextTick = (fn, ...args) => Promise.resolve().then(() => fn(...args));
export const exit = fail('process.exit()');
export const kill = fail('process.kill()');
export const chdir = fail('process.chdir()');
export default { env, argv, platform, version, versions, stdout, stderr, cwd, nextTick, exit, kill, chdir };
`;

function usage() {
    return [
        'Usage: node scripts/browser-score.mjs [--mode official|viewer|both] [--browser PATH] [file-or-dir...]',
        '',
        'Runs public sessions inside headless Chromium against browser-loaded ESM',
        'modules. This probes scorer drift that Node frozen scoring cannot see.',
    ].join('\n');
}

function parseArgs(argv) {
    const out = {
        targets: [],
        mode: 'both',
        browser: process.env.CHROMIUM || process.env.BROWSER || null,
        timeoutMs: Number(process.env.BROWSER_SCORE_TIMEOUT_MS || 180000),
        full: false,
        limit: 20,
        dumpRunner: false,
        root: null,
    };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--help' || arg === '-h') {
            console.log(usage());
            process.exit(0);
        } else if (arg === '--mode') {
            out.mode = argv[++i];
        } else if (arg.startsWith('--mode=')) {
            out.mode = arg.slice('--mode='.length);
        } else if (arg === '--browser') {
            out.browser = argv[++i];
        } else if (arg.startsWith('--browser=')) {
            out.browser = arg.slice('--browser='.length);
        } else if (arg === '--root') {
            out.root = resolve(argv[++i]);
        } else if (arg.startsWith('--root=')) {
            out.root = resolve(arg.slice('--root='.length));
        } else if (arg === '--timeout-ms') {
            out.timeoutMs = Number(argv[++i]);
        } else if (arg.startsWith('--timeout-ms=')) {
            out.timeoutMs = Number(arg.slice('--timeout-ms='.length));
        } else if (arg === '--full') {
            out.full = true;
        } else if (arg === '--dump-runner') {
            out.dumpRunner = true;
        } else if (arg === '--limit') {
            out.limit = Number(argv[++i]);
        } else if (arg.startsWith('--limit=')) {
            out.limit = Number(arg.slice('--limit='.length));
        } else if (arg.startsWith('--')) {
            throw new Error(`unknown argument ${arg}`);
        } else {
            out.targets.push(arg);
        }
    }
    if (!['official', 'viewer', 'both'].includes(out.mode)) {
        throw new Error('--mode must be official, viewer, or both');
    }
    if (out.dumpRunner) return out;
    if (!Number.isFinite(out.timeoutMs) || out.timeoutMs <= 0) {
        throw new Error('--timeout-ms must be a positive number');
    }
    if (!Number.isFinite(out.limit) || out.limit < 0) {
        throw new Error('--limit must be a non-negative number');
    }
    if (out.root) PROJECT_ROOT = out.root;
    if (out.targets.length === 0) out.targets.push(sessionsDir());
    out.browser ||= findBrowser();
    if (!out.browser) throw new Error('Chromium not found; pass --browser /path/to/chromium');
    return out;
}

function findBrowser() {
    for (const path of [
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/usr/bin/google-chrome',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ]) {
        if (existsSync(path)) return path;
    }
    return null;
}

function resolveSessionFiles(targets) {
    const files = [];
    const defaultSessionsDir = sessionsDir();
    const manifest = existsSync(defaultSessionsDir)
        ? readdirSync(defaultSessionsDir).filter(file => file.endsWith('.session.json')).sort()
        : [];
    for (const target of targets) {
        const targetPath = target.startsWith('/') ? target : join(PROJECT_ROOT, target);
        if (!existsSync(targetPath)) {
            const normalized = target.endsWith('.session.json') ? target : `${target}.session.json`;
            const exact = manifest.find(file => file === normalized || file === target);
            if (exact) {
                files.push(join(defaultSessionsDir, exact));
                continue;
            }
            const fuzzy = manifest.filter(file => file.includes(target));
            if (fuzzy.length === 1) {
                files.push(join(defaultSessionsDir, fuzzy[0]));
                continue;
            }
            if (fuzzy.length > 1) {
                throw new Error(`ambiguous session ref "${target}": ${fuzzy.join(', ')}`);
            }
            throw new Error(`not found: ${target}`);
        }
        const st = statSync(targetPath);
        if (st.isFile() && targetPath.endsWith('.session.json')) {
            files.push(targetPath);
        } else if (st.isDirectory()) {
            for (const file of readdirSync(targetPath)) {
                if (file.endsWith('.session.json')) files.push(join(targetPath, file));
            }
        }
    }
    return [...new Set(files)].sort();
}

function sessionToWebPath(file) {
    const rel = relative(PROJECT_ROOT, file).split(sep).join('/');
    if (rel.startsWith('..')) throw new Error(`session outside project root: ${file}`);
    return `/${rel}`;
}

const MIME = new Map([
    ['.html', 'text/html; charset=utf-8'],
    ['.js', 'text/javascript; charset=utf-8'],
    ['.mjs', 'text/javascript; charset=utf-8'],
    ['.json', 'application/json; charset=utf-8'],
    ['.css', 'text/css; charset=utf-8'],
]);

function isInsideRoot(path) {
    const rel = relative(PROJECT_ROOT, path);
    return rel === '' || (!rel.startsWith('..') && !isAbsolute(rel));
}

function htmlPage() {
    return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<title>browser-score</title>
<script type="importmap">
{
  "imports": {
    "module": "/__node_builtin_shim.mjs",
    "node:module": "/__node_builtin_shim.mjs",
    "fs": "/__node_builtin_shim.mjs",
    "node:fs": "/__node_builtin_shim.mjs",
    "fs/promises": "/__node_builtin_shim.mjs",
    "node:fs/promises": "/__node_builtin_shim.mjs",
    "path": "/__node_builtin_shim.mjs",
    "node:path": "/__node_builtin_shim.mjs",
    "url": "/__node_builtin_shim.mjs",
    "node:url": "/__node_builtin_shim.mjs",
    "os": "/__node_builtin_shim.mjs",
    "node:os": "/__node_builtin_shim.mjs",
    "process": "/__node_builtin_shim.mjs",
    "node:process": "/__node_builtin_shim.mjs"
  }
}
</script>
<script>
if (typeof globalThis.process === 'undefined') {
  const fail = (name) => () => { throw new Error(name + ' was called in the browser; this fork uses Node-only APIs'); };
  globalThis.process = {
    env: {}, argv: [], platform: 'browser', version: 'browser', versions: { node: '0.0.0' },
    cwd: () => '/', nextTick: (fn, ...args) => Promise.resolve().then(() => fn(...args)),
    stdout: { write: (s) => console.log(String(s)) },
    stderr: { write: (s) => console.error(String(s)) },
    exit: fail('process.exit()'), kill: fail('process.kill()'), chdir: fail('process.chdir()')
  };
}
function __browserScoreProgress(kind, detail) {
  fetch('/__browser_score_progress', {
    method: 'POST',
    headers: { 'content-type': 'text/plain; charset=utf-8' },
    body: kind + ': ' + detail,
  }).catch(() => {});
}
window.addEventListener('error', (event) => {
  const detail = [
    event.message || 'error',
    event.filename || '',
    event.lineno || '',
    event.colno || '',
    event.error && (event.error.stack || event.error.message || String(event.error)),
  ].filter(Boolean).join(' | ');
  __browserScoreProgress('window.error', detail);
});
window.addEventListener('unhandledrejection', (event) => {
  const reason = event.reason;
  __browserScoreProgress('unhandledrejection', reason && (reason.stack || reason.message || String(reason)) || 'unknown');
});
__browserScoreProgress('page', 'inline-ready');
</script>
</head>
<body>
<pre id="status">starting</pre>
<script type="module" src="/__browser_score_runner.mjs"></script>
</body>
</html>`;
}

function runnerModule() {
    return `
let runSegment;
let normalizeSession;
let decodeScreen;
let diffCell;
let ROWS_24;
let COLS_80;

const STARTUP_VARIANT_LINES = [
    /Version\\s+\\d+\\.\\d+\\.\\d+[^\\n]*/,
];

function setStatus(text) {
    const el = document.querySelector('#status');
    if (el) el.textContent = text;
    fetch('/__browser_score_progress', {
        method: 'POST',
        headers: { 'content-type': 'text/plain; charset=utf-8' },
        body: String(text),
    }).catch(() => {});
}

function preDecode(s) {
    let cur = String(s || '');
    for (const re of STARTUP_VARIANT_LINES) cur = cur.replace(re, '<<VERSION_BANNER>>');
    cur = cur.replace(/^\\d{2}:\\d{2}:\\d{2}\\.$/gm, '<time>.');
    return cur;
}

function visualCellsEqual(actual, expected) {
    const ga = decodeScreen(preDecode(actual));
    const gb = decodeScreen(preDecode(expected));
    for (let r = 0; r < ROWS_24; r++) {
        for (let c = 0; c < COLS_80; c++) {
            if (diffCell(ga[r][c], gb[r][c])) return false;
        }
    }
    return true;
}

function normalizeRng(entry) {
    return String(entry || '').replace(/\\s*@\\s.*$/, '').replace(/^\\d+\\s+/, '').trim();
}

function isRngCall(entry) {
    return /^(?:rn2|rnd|rn1|rnl|rne|rnz|d)\\(/.test(normalizeRng(entry));
}

function extractRngCalls(rng) {
    return (rng || []).filter(isRngCall).map(normalizeRng);
}

function pushAll(dst, src) {
    if (!src || !src.length) return;
    const CHUNK = 0x8000;
    for (let i = 0; i < src.length; i += CHUNK) dst.push(...src.slice(i, i + CHUNK));
}

function sameCursor(actual, expected) {
    if (!Array.isArray(expected)) return true;
    return Array.isArray(actual) &&
        actual[0] === expected[0] &&
        actual[1] === expected[1] &&
        actual[2] === expected[2];
}

function makeStorageHandle() {
    const storage = new Map();
    return {
        getItem(k) { return storage.has(k) ? storage.get(k) : null; },
        setItem(k, v) { storage.set(k, String(v)); },
        removeItem(k) { storage.delete(k); },
        get length() { return storage.size; },
        key(i) {
            let n = 0;
            for (const k of storage.keys()) { if (n === i) return k; n++; }
            return null;
        },
    };
}

function replayInputFor(segment) {
    return {
        seed: segment.seed,
        datetime: segment.datetime,
        nethackrc: segment.nethackrc,
        moves: segment.moves,
    };
}

function flattenCanonical(session) {
    const rng = [];
    const screens = [];
    const cursors = [];
    for (const seg of session.segments) {
        for (const step of seg.steps || []) {
            pushAll(rng, extractRngCalls(step.rng));
            if (step.screen) {
                screens.push(step.screen);
                cursors.push(Array.isArray(step.cursor) ? step.cursor : null);
            }
        }
    }
    return { rng, screens, cursors };
}

function compareRun(name, canonical, jsRng, jsScreens, jsCursors, jsError) {
    let rngMatched = 0;
    for (let i = 0; i < canonical.rng.length; i++) {
        if (normalizeRng(canonical.rng[i]) === normalizeRng(jsRng[i])) rngMatched++;
    }

    let screenMatched = 0;
    let cellsMatched = 0;
    let cursorsMatched = 0;
    let firstMismatch = null;
    for (let i = 0; i < canonical.screens.length; i++) {
        const cellsOk = visualCellsEqual(jsScreens[i] || '', canonical.screens[i] || '');
        const cursorOk = sameCursor(jsCursors[i], canonical.cursors[i]);
        if (cellsOk) cellsMatched++;
        if (cursorOk) cursorsMatched++;
        if (cellsOk && cursorOk) {
            screenMatched++;
        } else if (!firstMismatch) {
            firstMismatch = { index: i, cellsOk, cursorOk };
        }
    }

    return {
        session: name,
        passed: !jsError &&
            rngMatched === canonical.rng.length &&
            screenMatched === canonical.screens.length,
        metrics: {
            rngCalls: { matched: rngMatched, total: canonical.rng.length },
            screens: { matched: screenMatched, total: canonical.screens.length },
            cellsOnly: { matched: cellsMatched, total: canonical.screens.length },
            cursors: { matched: cursorsMatched, total: canonical.screens.length },
        },
        firstMismatch,
        error: jsError,
    };
}

async function runOfficial(session, name) {
    const canonical = flattenCanonical(session);
    const storage = makeStorageHandle();
    const jsRng = [];
    const jsScreens = [];
    const jsCursors = [];
    let jsError = null;
    try {
        for (let idx = 0; idx < session.segments.length; idx++) {
            const seg = session.segments[idx];
            setStatus('official ' + name + ' segment ' + idx + ' start');
            const game = await runSegment({ ...replayInputFor(seg), storage });
            setStatus('official ' + name + ' segment ' + idx + ' collect');
            pushAll(jsRng, extractRngCalls(game.getRngLog?.() || []));
            pushAll(jsScreens, game.getScreens?.() || []);
            pushAll(jsCursors, game.getCursors?.() || []);
        }
    } catch (err) {
        jsError = err?.message || String(err);
    }
    return compareRun(name, canonical, jsRng, jsScreens, jsCursors, jsError);
}

async function runViewer(session, name) {
    const canonical = flattenCanonical(session);
    let prevGame = null;
    let priorCaptureCount = 0;
    const jsRng = [];
    const jsScreens = [];
    const jsCursors = [];
    let jsError = null;
    try {
        for (let idx = 0; idx < session.segments.length; idx++) {
            const seg = session.segments[idx];
            setStatus('viewer ' + name + ' segment ' + idx + ' start');
            const game = await runSegment(replayInputFor(seg), prevGame);
            setStatus('viewer ' + name + ' segment ' + idx + ' collect');
            const allScreens = game.getScreens?.() || [];
            const allCursors = game.getCursors?.() || [];
            const allRngSlices = game.getRngSlices?.() || [];
            for (let i = 0; i < (seg.steps || []).length; i++) {
                const j = priorCaptureCount + i;
                jsScreens.push(allScreens[j] || '');
                jsCursors.push(allCursors[j] || null);
                pushAll(jsRng, extractRngCalls(allRngSlices[j] || []));
            }
            priorCaptureCount = allScreens.length;
            prevGame = game;
        }
    } catch (err) {
        jsError = err?.message || String(err);
    }
    return compareRun(name, canonical, jsRng, jsScreens, jsCursors, jsError);
}

function summarize(results) {
    return results.reduce((acc, result) => {
        acc.sessions++;
        if (result.passed) acc.passing++;
        acc.screenMatched += result.metrics.screens.matched;
        acc.screenTotal += result.metrics.screens.total;
        acc.cellMatched += result.metrics.cellsOnly.matched;
        acc.cursorMatched += result.metrics.cursors.matched;
        acc.rngMatched += result.metrics.rngCalls.matched;
        acc.rngTotal += result.metrics.rngCalls.total;
        return acc;
    }, {
        sessions: 0,
        passing: 0,
        screenMatched: 0,
        screenTotal: 0,
        cellMatched: 0,
        cursorMatched: 0,
        rngMatched: 0,
        rngTotal: 0,
    });
}

async function postResult(payload) {
    await fetch('/__browser_score_result', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
    });
}

async function main() {
    setStatus('loading config');
    const config = await (await fetch('/__browser_score_config.json', { cache: 'no-store' })).json();
    setStatus('loaded config');
    setStatus('importing modules');
    const [mainMod, loaderMod, screenMod] = await Promise.all([
        import('/js/jsmain.js'),
        import('/frozen/session_loader.mjs'),
        import('/frozen/screen-decode.mjs'),
    ]);
    runSegment = mainMod.runSegment;
    normalizeSession = loaderMod.normalizeSession;
    decodeScreen = screenMod.decodeScreen;
    diffCell = screenMod.diffCell;
    ROWS_24 = screenMod.ROWS_24;
    COLS_80 = screenMod.COLS_80;
    setStatus('imported modules');
    const modes = config.mode === 'both' ? ['official', 'viewer'] : [config.mode];
    const byMode = Object.fromEntries(modes.map((mode) => [mode, []]));
    for (let i = 0; i < config.sessions.length; i++) {
        const item = config.sessions[i];
        setStatus('running ' + (i + 1) + '/' + config.sessions.length + ' ' + item.name);
        const raw = await (await fetch(item.url, { cache: 'no-store' })).json();
        setStatus('normalizing ' + item.name);
        const session = normalizeSession(raw);
        if (modes.includes('official')) byMode.official.push(await runOfficial(session, item.name));
        if (modes.includes('viewer')) byMode.viewer.push(await runViewer(session, item.name));
    }
    const payload = {
        userAgent: navigator.userAgent,
        modes: Object.fromEntries(Object.entries(byMode).map(([mode, results]) => [mode, {
            summary: summarize(results),
            results,
        }])),
    };
    setStatus(JSON.stringify(payload, null, 2));
    await postResult(payload);
}

main().catch(async (err) => {
    await postResult({ error: err?.stack || err?.message || String(err) });
});
`;
}

function makeServer(config, onResult, onProgress) {
    const server = createServer((req, res) => {
        const url = new URL(req.url || '/', 'http://127.0.0.1');
        onProgress({ type: 'request', method: req.method, path: url.pathname });
        if (req.method === 'POST' && url.pathname === '/__browser_score_result') {
            let body = '';
            req.setEncoding('utf8');
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                try {
                    onResult(JSON.parse(body));
                    res.writeHead(204).end();
                } catch (err) {
                    res.writeHead(400, { 'content-type': 'text/plain; charset=utf-8' }).end(err.message);
                }
            });
            return;
        }
        if (req.method === 'POST' && url.pathname === '/__browser_score_progress') {
            let body = '';
            req.setEncoding('utf8');
            req.on('data', chunk => { body += chunk; });
            req.on('end', () => {
                onProgress({ type: 'progress', message: body.slice(0, 500) });
                res.writeHead(204).end();
            });
            return;
        }

        if (url.pathname === '/__browser_score.html') {
            res.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
            res.end(htmlPage());
            return;
        }
        if (url.pathname === '/__browser_score_runner.mjs') {
            res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'no-store' });
            res.end(runnerModule());
            return;
        }
        if (url.pathname === '/__browser_score_config.json') {
            res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
            res.end(JSON.stringify(config));
            return;
        }
        if (url.pathname === '/__node_builtin_shim.mjs') {
            res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'no-store' });
            res.end(NODE_BUILTIN_SHIM);
            return;
        }

        const decoded = decodeURIComponent(url.pathname);
        const safeRel = normalize(decoded).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/, '');
        const filePath = join(PROJECT_ROOT, safeRel);
        if (!isInsideRoot(filePath) || !existsSync(filePath) || !statSync(filePath).isFile()) {
            res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
            res.end('not found');
            return;
        }
        const type = MIME.get(extname(filePath)) || 'application/octet-stream';
        res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store' });
        res.end(readFileSync(filePath));
    });
    return server;
}

function listen(server) {
    return new Promise((resolveListen, rejectListen) => {
        server.once('error', rejectListen);
        server.listen(0, '127.0.0.1', () => {
            server.off('error', rejectListen);
            resolveListen(server.address().port);
        });
    });
}

function fmtCount(value, total) {
    return `${value}/${total}`;
}

function printPayload(payload, options) {
    if (payload.error) {
        console.log(`Browser score failed: ${payload.error}`);
        if (payload.diagnostics) {
            console.log(`- last progress: ${payload.diagnostics.lastProgress || '(none)'}`);
            if (payload.diagnostics.recentRequests?.length) {
                console.log(`- recent requests: ${payload.diagnostics.recentRequests.join(', ')}`);
            }
        }
        return;
    }
    console.log(`Browser score: ${payload.userAgent || 'unknown browser'}`);
    for (const [mode, data] of Object.entries(payload.modes || {})) {
        const s = data.summary;
        console.log(`- ${mode}: ${s.passing}/${s.sessions} passing ` +
            `S ${fmtCount(s.screenMatched, s.screenTotal)} ` +
            `cells ${fmtCount(s.cellMatched, s.screenTotal)} ` +
            `cursors ${fmtCount(s.cursorMatched, s.screenTotal)} ` +
            `R ${fmtCount(s.rngMatched, s.rngTotal)}`);
        const failing = (data.results || []).filter(result => !result.passed);
        const rows = options.full ? failing : failing.slice(0, options.limit);
        for (const row of rows) {
            const first = row.firstMismatch
                ? ` first=${row.firstMismatch.index} cells=${row.firstMismatch.cellsOk ? 'ok' : 'miss'} cursor=${row.firstMismatch.cursorOk ? 'ok' : 'miss'}`
                : '';
            const err = row.error ? ` error=${JSON.stringify(row.error)}` : '';
            console.log(`  ${row.session}: S ${fmtCount(row.metrics.screens.matched, row.metrics.screens.total)} ` +
                `cells ${fmtCount(row.metrics.cellsOnly.matched, row.metrics.cellsOnly.total)} ` +
                `cursors ${fmtCount(row.metrics.cursors.matched, row.metrics.cursors.total)} ` +
                `R ${fmtCount(row.metrics.rngCalls.matched, row.metrics.rngCalls.total)}${first}${err}`);
        }
        if (!options.full && rows.length < failing.length) {
            console.log(`  showing ${rows.length}/${failing.length}; rerun with --full`);
        }
    }
}

async function runBrowser(options, sessions) {
    let resultPayload = null;
    let lastProgress = null;
    const recentRequests = [];
    let resolveResult;
    const resultPromise = new Promise((resolve) => { resolveResult = resolve; });
    const config = {
        mode: options.mode,
        sessions: sessions.map(file => ({
            name: basename(file),
            url: sessionToWebPath(file),
        })),
    };
    const server = makeServer(config, (payload) => {
        resultPayload = payload;
        resolveResult(payload);
    }, (event) => {
        if (event.type === 'progress') lastProgress = event.message;
        else if (event.type === 'request') {
            recentRequests.push(`${event.method} ${event.path}`);
            if (recentRequests.length > 30) recentRequests.shift();
        }
    });
    const port = await listen(server);
    const url = `http://127.0.0.1:${port}/__browser_score.html`;
    const child = spawn(options.browser, [
        '--headless=new',
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--no-sandbox',
        '--disable-background-networking',
        '--disable-extensions',
        '--mute-audio',
        url,
    ], {
        cwd: PROJECT_ROOT,
        stdio: ['ignore', 'pipe', 'pipe'],
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', chunk => { stdout += chunk; });
    child.stderr.on('data', chunk => { stderr += chunk; });

    const timeout = setTimeout(() => {
        child.kill('SIGTERM');
        resolveResult({
            error: `browser score timed out after ${options.timeoutMs}ms` +
                (lastProgress ? `; lastProgress=${JSON.stringify(lastProgress)}` : '; lastProgress=(none)') +
                (recentRequests.length ? `; recentRequests=${JSON.stringify(recentRequests.slice(-12))}` : '') +
                (stderr ? `; stderr=${stderr.slice(-1000)}` : ''),
        });
    }, options.timeoutMs);

    const exitPromise = new Promise((resolveExit) => {
        child.on('exit', (code, signal) => resolveExit({ code, signal }));
        child.on('error', (err) => resolveExit({ error: err }));
    });

    const payload = await Promise.race([
        resultPromise,
        exitPromise.then((exit) => {
            if (resultPayload) return resultPayload;
            if (exit.error) return { error: exit.error.message };
            return {
                error: `browser exited before posting results: code=${exit.code} signal=${exit.signal}` +
                    (stderr ? `; stderr=${stderr.slice(-1000)}` : '') +
                    (stdout ? `; stdout=${stdout.slice(-1000)}` : ''),
            };
        }),
    ]);

    clearTimeout(timeout);
    if (!child.killed) child.kill('SIGTERM');
    server.close();
    if (payload?.error) {
        payload.diagnostics = {
            lastProgress,
            recentRequests: recentRequests.slice(-30),
        };
    }
    return payload;
}

async function main() {
    const options = parseArgs(process.argv.slice(2));
    if (options.dumpRunner) {
        console.log(runnerModule());
        return;
    }
    const sessions = resolveSessionFiles(options.targets);
    if (!sessions.length) throw new Error('no session files found');
    const payload = await runBrowser(options, sessions);
    printPayload(payload, options);
    if (payload.error) process.exit(1);
}

if (process.argv[1] === SCRIPT_PATH) {
    main().catch((err) => {
        console.error(err.message);
        process.exit(1);
    });
}

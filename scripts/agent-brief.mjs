#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SCRIPT_DIR, '..');

function read(rel) {
    const p = path.join(ROOT, rel);
    return existsSync(p) ? readFileSync(p, 'utf8') : '';
}

function sh(args) {
    try {
        return execFileSync(args[0], args.slice(1), {
            cwd: ROOT,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore'],
        }).trim();
    } catch {
        return '';
    }
}

function parseArgs(argv) {
    const out = { target: null, lines: 8 };
    for (let i = 0; i < argv.length; i++) {
        const arg = argv[i];
        if (arg === '--target') out.target = argv[++i] || null;
        else if (arg.startsWith('--target=')) out.target = arg.slice(9);
        else if (arg === '--lines') out.lines = Number(argv[++i] || out.lines);
        else if (!arg.startsWith('--') && !out.target) out.target = arg;
    }
    return out;
}

function currentTarget(checkpoint) {
    const match = checkpoint.match(/^- Current target:\s*`?([^`\n]+)`?/m);
    return match ? match[1].trim() : null;
}

function targetTerms(target) {
    if (!target) return [];
    const base = path.basename(target).replace(/\.session\.json$/, '');
    const parts = new Set([target, base]);
    const seed = base.match(/seed\d{4}/)?.[0];
    if (seed) parts.add(seed);
    return [...parts].filter(Boolean);
}

function grepLines(text, terms, limit) {
    if (!terms.length) return [];
    const lowerTerms = terms.map((term) => term.toLowerCase());
    const lines = text.split(/\r?\n/);
    const hits = [];
    for (let i = 0; i < lines.length; i++) {
        const lower = lines[i].toLowerCase();
        if (!lowerTerms.some((term) => lower.includes(term))) continue;
        hits.push(`${i + 1}: ${lines[i]}`);
        if (hits.length >= limit) break;
    }
    return hits;
}

function section(text, heading, maxLines = 12) {
    const lines = text.split(/\r?\n/);
    const idx = lines.findIndex((line) => line.trim() === heading);
    if (idx < 0) return [];
    const out = [];
    for (let i = idx + 1; i < lines.length && out.length < maxLines; i++) {
        if (lines[i].startsWith('## ') && out.length) break;
        if (lines[i].trim()) out.push(lines[i]);
    }
    return out;
}

function clip(line, width = 220) {
    const text = String(line);
    return text.length > width ? `${text.slice(0, width - 1)}~` : text;
}

function printBlock(title, lines) {
    console.log(`\n## ${title}`);
    if (!lines.length) {
        console.log('-');
        return;
    }
    for (const line of lines) console.log(clip(line));
}

function limitLines(lines, limit) {
    if (lines.length <= limit) return lines;
    return [...lines.slice(0, limit), `... ${lines.length - limit} more; use git status --short for full list`];
}

function statusSummary(lines) {
    const counts = new Map();
    for (const line of lines) {
        const code = line.slice(0, 2).trim() || line.slice(0, 2);
        counts.set(code, (counts.get(code) || 0) + 1);
    }
    return [...counts.entries()].map(([code, count]) => `${code}=${count}`).join(' ');
}

function main() {
    const options = parseArgs(process.argv.slice(2));
    const checkpoint = read('scratch/agent-loop.md');
    const target = options.target || currentTarget(checkpoint);
    const terms = targetTerms(target);
    const status = sh(['git', 'status', '--short', '--branch']);
    const commit = sh(['git', 'rev-parse', '--short', 'HEAD']);
    const featureMap = read('feature_map.md');
    const lessons = read('lessons.md');
    const dirty = status.split('\n').slice(1);

    console.log('# Agent Brief');
    console.log(`- Branch/status: ${status.split('\n')[0] || '-'}`);
    console.log(`- Commit: ${commit || '-'}`);
    console.log(`- Target: ${target || '-'}`);
    console.log('- Required policy: read `AGENTS.md`; use targeted reads for linked docs.');
    console.log(`- Human summary: ${dirty.length} dirty file(s)${dirty.length ? ` (${statusSummary(dirty)})` : ''}; start with brief-linked context, then triage before editing.`);
    console.log('- Commit rule: after verified truth or harness changes, stage only the coherent files and commit.');

    printBlock('Dirty Files Sample', dirty.length ? limitLines(dirty.map((line) => `- ${line}`), 12) : ['- none']);
    printBlock('Checkpoint Current State', section(checkpoint, '## Current State', 10));
    printBlock('Checkpoint Queue', section(checkpoint, '## Current Queue', 16));
    printBlock('Feature Map Hits', grepLines(featureMap, terms, options.lines));
    printBlock('Lesson Hits', grepLines(lessons, terms, options.lines));

    const gitPath = terms.find((term) => term.includes('/')) || null;
    const logArgs = gitPath
        ? ['git', 'log', '--oneline', '--max-count=8', '--', gitPath]
        : ['git', 'log', '--oneline', '--max-count=8'];
    printBlock('Recent Git', sh(logArgs).split('\n').filter(Boolean).map((line) => `- ${line}`));

    console.log('\n## Next Commands');
    if (target && target.includes('seed')) {
        console.log(`- npm run triage -- ${target}`);
        console.log(`- npm run verify -- --target ${target}`);
    } else {
        console.log('- npm run sentinel');
        console.log('- node scripts/triage-corpus.mjs --markdown scratch/divergence-inventory.md');
    }
    console.log('- npm run hack:audit');
    console.log('- docs/agent/script-reference.md explains output fields and direct node commands');
}

main();

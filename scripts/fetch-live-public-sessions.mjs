#!/usr/bin/env node
import { mkdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const DEFAULT_BASE_URL = 'https://mazesofmenace.ai';
const DEFAULT_OUT_DIR = '.cache/live-sessions';

function usage() {
    return [
        'Usage: node scripts/fetch-live-public-sessions.mjs [out-dir]',
        '',
        'Environment:',
        `  MOM_BASE_URL  Override source site (default ${DEFAULT_BASE_URL})`,
    ].join('\n');
}

async function fetchText(url) {
    const errors = [];
    for (let attempt = 0; attempt < 2; attempt++) {
        try {
            const res = await fetch(url, { cache: 'no-store' });
            if (!res.ok) throw new Error(`${url} returned HTTP ${res.status}`);
            return await res.text();
        } catch (err) {
            const code = err?.cause?.code || err?.code;
            errors.push(`fetch attempt ${attempt + 1}: ${code ? `${err.message} (${code})` : err.message}`);
            await new Promise((resolve) => setTimeout(resolve, 250 * (attempt + 1)));
        }
    }
    const child = spawnSync('curl', ['-L', '--silent', '--show-error', '--fail', '--max-time', '20', url], {
        encoding: 'utf8',
        maxBuffer: 32 * 1024 * 1024,
    });
    if (child.error || child.status !== 0) {
        errors.push(`curl fallback: ${child.error?.message || child.stderr.trim() || child.stdout.trim() || `curl exited ${child.status ?? 1}`}`);
        throw new Error(`${url} fetch failed; ${errors.join('; ')}`);
    }
    return child.stdout;
}

async function main() {
    const args = process.argv.slice(2);
    if (args.includes('-h') || args.includes('--help')) {
        console.log(usage());
        return;
    }
    if (args.length > 1) throw new Error(usage());

    const baseUrl = (process.env.MOM_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, '');
    const outDir = path.resolve(args[0] || DEFAULT_OUT_DIR);
    const manifestUrl = `${baseUrl}/sessions/manifest.json`;

    await mkdir(outDir, { recursive: true });
    const manifest = JSON.parse(await fetchText(manifestUrl));
    if (!Array.isArray(manifest)) {
        throw new Error(`unexpected manifest shape from ${manifestUrl}`);
    }

    for (const name of manifest) {
        if (typeof name !== 'string' || !name.endsWith('.session.json') || name.includes('/')) {
            throw new Error(`unsafe session name in manifest: ${JSON.stringify(name)}`);
        }
        const sessionUrl = `${baseUrl}/sessions/${encodeURIComponent(name)}`;
        const text = await fetchText(sessionUrl);
        await writeFile(path.join(outDir, name), text);
        process.stderr.write(`fetched ${name}\n`);
    }

    await writeFile(path.join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
    await writeFile(path.join(outDir, 'metadata.json'), `${JSON.stringify({
        source: baseUrl,
        manifestUrl,
        fetchedAt: new Date().toISOString(),
        sessions: manifest.length,
    }, null, 2)}\n`);

    console.error(`wrote ${manifest.length} live public sessions to ${outDir}`);
}

main().catch((err) => {
    console.error(`Fatal: ${err.message}`);
    process.exit(1);
});

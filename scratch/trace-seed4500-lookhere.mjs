#!/usr/bin/env node

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { normalizeSession } from '../frozen/session_loader.mjs';
import { game } from '../js/gstate.js';
import { NethackGame, runSegment } from '../js/jsmain.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sessionPath = path.join(ROOT, 'sessions', 'seed4500-knight-coverage.session.json');
const raw = JSON.parse(readFileSync(sessionPath, 'utf8'));
const session = normalizeSession(raw);
const steps = session.segments.flatMap((seg) => seg.steps || []);

const start = Number(process.argv[2] || 780);
const end = Number(process.argv[3] || 792);

function firstLine(screen) {
    return String(screen || '').split('\n')[0] || '';
}

function compactStack() {
    return new Error().stack
        ?.split('\n')
        .slice(3, 8)
        .map((line) => line.trim().replace(/^at /, ''))
        .join(' | ');
}

const originalInstall = NethackGame.prototype._installCaptureHook;
let lastBoundary = -1;
let trackingInstalled = false;

function installTracking() {
    if (trackingInstalled) return;
    trackingInstalled = true;
    for (const prop of [
        '_more',
        '_pending_message',
        '_resume_look_here_after_more',
        '_resume_teleport_arrival_after_more',
        '_resume_look_here_feature_line_after_more',
        '_floor_list_restore_message_after_more',
        '_prompt_cursor',
    ]) {
        let value = game[prop];
        Object.defineProperty(game, prop, {
            configurable: true,
            get() { return value; },
            set(next) {
                if (lastBoundary >= start - 2 && lastBoundary <= end + 1
                    && JSON.stringify(value) !== JSON.stringify(next)) {
                    console.log(JSON.stringify({
                        setAfter: lastBoundary,
                        prop,
                        from: value,
                        to: next,
                        stack: compactStack(),
                    }));
                }
                value = next;
            },
        });
    }
}

NethackGame.prototype._installCaptureHook = function installTracingCaptureHook() {
    originalInstall.call(this);
    const capture = game._preNhgetchHook;
    game._preNhgetchHook = async () => {
        await capture();
        const idx = this._screens.length - 1;
        lastBoundary = idx;
        if (idx === start - 2) installTracking();
        if (idx < start || idx > end) return;
        const step = steps[idx] || {};
        const actual = firstLine(this._screens[idx]);
        const expected = firstLine(step.screen);
        console.log(JSON.stringify({
            idx,
            key: step.key ?? null,
            expected,
            actual,
            cursorExpected: step.cursor || null,
            cursorActual: this._cursors?.[idx] || null,
            more: !!game._more,
            pendingMessage: game._pending_message || '',
            resumeLookHere: !!game._resume_look_here_after_more,
            resumeTeleportArrival: !!game._resume_teleport_arrival_after_more,
            resumeFeature: game._resume_look_here_feature_line_after_more || '',
            floorRestore: game._floor_list_restore_message_after_more || '',
            promptCursor: game._prompt_cursor || null,
            contextMove: game.context?.move ?? null,
            run: !!game.context?.run,
        }));
    };
};

let current = null;
for (const seg of session.segments) {
    current = await runSegment({
        seed: seg.seed,
        datetime: seg.datetime,
        nethackrc: seg.nethackrc,
        moves: seg.moves,
    }, current);
}

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

function messageLine(screen) {
    return String(screen || '').split('\n')[0] || '';
}

const originalInstall = NethackGame.prototype._installCaptureHook;
let trackingInstalled = false;
let lastBoundary = -1;

function installTracking() {
    if (trackingInstalled) return;
    trackingInstalled = true;
    for (const prop of ['_more', '_avoid_pool_tip_pending', '_pending_message']) {
        let value = game[prop];
        Object.defineProperty(game, prop, {
            configurable: true,
            get() { return value; },
            set(next) {
                if (lastBoundary >= 327 && lastBoundary <= 329 && value !== next) {
                    const stack = new Error().stack
                        ?.split('\n')
                        .slice(2, 7)
                        .map((line) => line.trim())
                        .join(' | ');
                    console.log(`set ${prop} ${JSON.stringify(value)} -> ${JSON.stringify(next)} after ${lastBoundary}: ${stack}`);
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
        if (idx === 326) installTracking();
        if (idx < 320 || idx > 332) return;
        const step = steps[idx] || {};
        console.log(JSON.stringify({
            idx,
            key: step.key ?? null,
            msg: messageLine(this._screens[idx]),
            more: !!game._more,
            moreDismissals: game._more_dismissals_remaining ?? null,
            swimTipPending: !!game._avoid_pool_tip_pending,
            pendingMessage: game._pending_message || '',
            levelchangeTarget: game._levelchange_target ?? null,
            pendingLevelTeleport: game._pending_level_teleport_target ?? null,
            pendingTerrainView: !!game._terrain_view_active,
            pendingFloorList: Array.isArray(game._floor_list_lines),
            overridePrev: !!game._override_prev,
            contextMove: game.context?.move ?? null,
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

import { readFileSync } from 'node:fs';
import { normalizeSession } from '../frozen/session_loader.mjs';
import { NethackGame } from '../js/jsmain.js';
import { moveloop_core } from '../js/allmain.js';
import { game } from '../js/gstate.js';
import { GameDisplay } from '../js/game_display.js';
import { getRngLog } from '../js/rng.js';

const [sessionPath, rangeRaw] = process.argv.slice(2);
const [start, end] = String(rangeRaw || '').split(':').map(Number);
if (!sessionPath || !Number.isInteger(start) || !Number.isInteger(end)) {
    throw new Error('Usage: node scratch/trace-rng-boundaries.mjs <session.json> <start>:<end>');
}

const session = normalizeSession(JSON.parse(readFileSync(sessionPath, 'utf8')));
const seg = session.segments[0];
const storage = {
    data: new Map(),
    getItem(k) { return this.data.has(k) ? this.data.get(k) : null; },
    setItem(k, v) { this.data.set(k, String(v)); },
    removeItem(k) { this.data.delete(k); },
    get length() { return this.data.size; },
    key(i) { return Array.from(this.data.keys())[i] ?? null; },
};
const nhGame = new NethackGame({
    seed: seg.seed,
    datetime: seg.datetime,
    nethackrc: seg.nethackrc,
    storage,
});
const display = new GameDisplay(null);
display.onEmptyQueue = () => { throw new Error('Input queue empty'); };
nhGame._pendingDisplay = display;
for (const ch of seg.moves || '') display.pushKey(ch.charCodeAt(0));

await nhGame.start();
const originalHook = game._preNhgetchHook;
let boundary = 0;
game._preNhgetchHook = async () => {
    await originalHook();
    const totalRng = (getRngLog() || []).length;
    if (totalRng >= start - 40 && totalRng <= end + 40) {
        const screenIndex = nhGame.getScreens().length - 1;
        const expected = seg.steps?.[screenIndex] || {};
        console.log(JSON.stringify({
            boundary,
            screenIndex,
            nextRawKey: seg.moves?.[boundary],
            expectedKey: expected.key,
            totalRng,
            moves: game.moves,
            contextMove: game.context?.move,
            more: !!game._more,
            pending: game._pending_message || '',
            afterMoreMessage: game._after_more_message || '',
            monsterPaused: !!game._monster_turn_paused_for_more,
            resumeMonsterTurn: !!game._resume_monster_turn,
            resumeTailOnly: !!game._resume_turn_tail_after_more,
            deferredPreTurn: !!game._deferred_pre_turn_after_more,
            monsterAttackWaiting: !!game._monster_attack_more_waiting,
            fastExtra: !!game._fast_extra_action_pending,
            uencumber: game.u?.uencumber || 0,
            extraEncumberedTurnPending: !!game._extra_encumbered_turn_pending,
            encumberedMoveDebt: game._encumbered_move_debt ?? null,
        }));
    }
    boundary++;
};

const maxIter = Math.max((seg.moves || '').length * 8, 1024);
for (let iter = 0; iter < maxIter; iter++) {
    try {
        await moveloop_core();
    } catch (e) {
        if (String(e?.message || '').includes('Input queue empty')) break;
        throw e;
    }
}

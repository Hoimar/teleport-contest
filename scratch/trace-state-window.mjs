import { readFileSync } from 'node:fs';
import { normalizeSession } from '../frozen/session_loader.mjs';
import { NethackGame, runSegment } from '../js/jsmain.js';
import { moveloop_core } from '../js/allmain.js';
import { game } from '../js/gstate.js';
import { GameDisplay } from '../js/game_display.js';
import { getRngLog } from '../js/rng.js';

function usage() {
    return 'Usage: node scratch/trace-state-window.mjs <session.json> <start>:<end> [--segment N]';
}

function parseRange(raw) {
    const m = /^(\d+):(\d+)$/.exec(raw || '');
    if (!m) throw new Error(usage());
    return { start: Number(m[1]), end: Number(m[2]) };
}

function statusLine(screen) {
    const lines = String(screen || '').split('\n');
    return lines[23] || '';
}

function topLine(screen) {
    const lines = String(screen || '').split('\n');
    return lines[0] || '';
}

function optionValue(name, fallback = null) {
    const idx = process.argv.indexOf(name);
    if (idx < 0) return fallback;
    const value = process.argv[idx + 1];
    if (value == null || value.startsWith('--')) throw new Error(usage());
    return value;
}

function optionList(name) {
    const raw = optionValue(name, '');
    const text = String(raw || '').trim();
    if (!text) return [];
    if (text.includes(';')) return text.split(';').filter(Boolean);
    const parts = text.split(',').filter(Boolean);
    if (parts.length > 1 && parts.length % 2 === 0)
        return parts.reduce((acc, part, i) => {
            if (i % 2 === 0) acc.push(`${part},${parts[i + 1]}`);
            return acc;
        }, []);
    return parts;
}

const positional = process.argv.slice(2).filter((arg, idx, all) => {
    if (all[idx - 1] === '--segment') return false;
    return arg !== '--segment';
});
const [sessionPath, rangeRaw] = positional;
if (!sessionPath || !rangeRaw) throw new Error(usage());
const { start, end } = parseRange(rangeRaw);
const compact = process.argv.includes('--compact');
const segmentIndex = Number(optionValue('--segment', '0'));
const requestedCells = optionList('--cells');
const session = normalizeSession(JSON.parse(readFileSync(sessionPath, 'utf8')));
const seg = session.segments[segmentIndex];
if (!seg) throw new Error(`segment ${segmentIndex} not found`);
const storage = {
    data: new Map(),
    getItem(k) { return this.data.has(k) ? this.data.get(k) : null; },
    setItem(k, v) { this.data.set(k, String(v)); },
    removeItem(k) { this.data.delete(k); },
    get length() { return this.data.size; },
    key(i) { return Array.from(this.data.keys())[i] ?? null; },
};
for (let i = 0; i < segmentIndex; i++) {
    const prior = session.segments[i];
    await runSegment({
        seed: prior.seed,
        datetime: prior.datetime,
        nethackrc: prior.nethackrc,
        moves: prior.moves,
        storage,
    });
}
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
game._trace_more_debug = process.argv.includes('--more-debug');
const originalHook = game._preNhgetchHook;
let boundary = 0;
game._preNhgetchHook = async () => {
    await originalHook();
    const screenIndex = nhGame.getScreens().length - 1;
    if (screenIndex >= start && screenIndex <= end) {
        const screen = nhGame.getScreens().at(-1) || '';
        const expected = seg.steps?.[screenIndex] || {};
        const rngCount = (nhGame.getRngSlices().at(-1) || []).length;
        const totalRng = (getRngLog() || []).length;
        const u = game.u || {};
        const adjacent = compact ? [] : (game.level?.monsters || [])
            .filter((mon) => Math.abs((mon.mx ?? 0) - (u.ux ?? 0)) <= 1
                && Math.abs((mon.my ?? 0) - (u.uy ?? 0)) <= 1)
            .map((mon) => {
                const loc = game.level?.locations?.[mon.my]?.[mon.mx] || {};
                return {
                    id: mon.m_id,
                    name: mon.data?.name,
                    x: mon.mx,
                    y: mon.my,
                    hp: mon.mhp,
                    msize: mon.data?.msize,
                    minvis: mon.minvis,
                    mundetected: mon.mundetected,
                    m_ap_type: mon.m_ap_type,
                    openedUnseenDoor: mon._opened_unseen_door,
                    viz: game.viz_array?.[mon.my]?.[mon.mx],
                    locTyp: loc.typ,
                    lit: loc.lit,
                    waslit: loc.waslit,
                    roomno: loc.roomno,
                    edge: loc.edge,
                    glyph: loc.glyph,
                    remembered: loc.remembered_glyph,
                };
            });
        const nearbyMonsters = compact ? [] : (game.level?.monsters || [])
            .filter((mon) => Math.abs((mon.mx ?? 0) - (u.ux ?? 0)) <= 8
                && Math.abs((mon.my ?? 0) - (u.uy ?? 0)) <= 8)
            .map((mon) => ({
                id: mon.m_id,
                name: mon.data?.name,
                x: mon.mx,
                y: mon.my,
                hp: mon.mhp,
                hpmax: mon.mhpmax,
                movement: mon.movement,
                mcansee: mon.mcansee,
                mcan: mon.mcan,
                mspec_used: mon.mspec_used,
                mflee: mon.mflee,
                mpeaceful: mon.mpeaceful,
                mtame: mon.mtame,
                minvis: mon.minvis,
                inventory: (mon.inventory || []).map((obj) => ({
                    otyp: obj?.otyp,
                    oclass: obj?.oclass,
                    spe: obj?.spe,
                    quan: obj?.quan,
                })),
                viz: game.viz_array?.[mon.my]?.[mon.mx],
                mux: mon.mux,
                muy: mon.muy,
                mtrack: mon.mtrack || [],
                attacks: mon.data?.mattk,
            }));
        const inspectCells = [];
        const wantedCells = new Set([
            '49,7', '26,16', '39,8', '38,9',
            // Current seed0399 first-diff cells from screen:diff.
            '59,5', '61,5', '59,6', '60,6', '35,7', '59,7', '60,7',
            '35,8', '31,10', '32,10', '10,13', '9,14',
            // seed0361 Arc-loca single-cell screen 307 diff.
            '57,13', '58,13', '59,13', '60,13',
            '57,14', '58,14', '59,14', '60,14',
            '57,15', '58,15', '59,15', '60,15',
        ]);
        for (let yy = 14; yy <= 16; yy++)
            for (let xx = 14; xx <= 16; xx++)
                wantedCells.add(`${xx},${yy}`);
        for (let yy = (u.uy ?? 0) - 1; yy <= (u.uy ?? 0) + 3; yy++) {
            for (let xx = (u.ux ?? 0) - 2; xx <= (u.ux ?? 0) + 2; xx++) wantedCells.add(`${xx},${yy}`);
        }
        for (const cell of requestedCells) wantedCells.add(cell);
        const cellsToInspect = compact && requestedCells.length ? requestedCells : wantedCells;
        if (!compact || requestedCells.length) for (const key of cellsToInspect) {
            const [xx, yy] = key.split(',').map(Number);
                const loc = game.level?.at?.(xx, yy) || null;
                inspectCells.push({
                    x: xx,
                    y: yy,
                    typ: loc?.typ,
                    viz: game.viz_array?.[yy]?.[xx],
                    lit: loc?.lit,
                    waslit: loc?.waslit,
                    roomno: loc?.roomno,
                    edge: loc?.edge,
                    seenv: loc?.seenv,
                    glyph: loc?.glyph,
                    remembered: loc?.remembered_glyph,
                    disp: { ch: loc?.disp_ch, color: loc?.disp_color, dec: loc?.disp_decgfx },
                    obj: (game.level?.objects || [])
                        .filter((obj) => obj.ox === xx && obj.oy === yy)
                        .map((obj) => ({ otyp: obj.otyp, oclass: obj.oclass, corpsenm: obj.corpsenm })),
                    mon: (game.level?.monsters || [])
                        .filter((mon) => mon.mx === xx && mon.my === yy)
                        .map((mon) => ({
                            id: mon.m_id,
                            name: mon.data?.name,
                            hp: mon.mhp,
                            m_ap_type: mon.m_ap_type,
                            mappearance: mon.mappearance,
                            mcorpsenm: mon.mcorpsenm,
                        })),
                    tail: (game.level?.monsters || [])
                        .filter((mon) => (mon.wsegs || []).some((seg) => seg.wx === xx && seg.wy === yy))
                        .map((mon) => ({
                            id: mon.m_id,
                            name: mon.data?.name,
                            head: { x: mon.mx, y: mon.my },
                            hp: mon.mhp,
                        })),
                });
        }
        console.log(JSON.stringify({
            boundary,
            screenIndex,
            rawKey: seg.moves?.[boundary],
            expectedKey: expected.key,
            moves: game.moves,
            uz: u.uz,
            ux: u.ux,
            uy: u.uy,
            ux0: u.ux0,
            uy0: u.uy0,
            acurr: u.acurr?.a,
            uprops: u.uprops || {},
            uhp: u.uhp,
            uhpmax: u.uhpmax,
            latchedStatusHp: game._latched_status_uhp ?? null,
            clearLatchedStatusAfterMore: !!game._clear_latched_status_after_more,
            clearLatchedStatusBeforeAfterMore: !!game._clear_latched_status_before_after_more,
            uhunger: u.uhunger,
            uhs: u.uhs,
            uencumber: u.uencumber,
            extraEncumberedTurnPending: !!game._extra_encumbered_turn_pending,
            encumberedMoveDebt: game._encumbered_move_debt ?? null,
            seerTurnUpdatePending: !!game._seer_turn_update_pending,
            polyForm: u._poly_form ? {
                name: u._poly_form.name,
                mmove: u._poly_form.mmove,
                encumbered: u._poly_form.encumbered,
            } : null,
            fast: u.uprops?.fast,
            intrinsicFast: u.uprops?.intrinsic_fast,
            invulnerable: u.uprops?.invulnerable,
            uinvulnerable: u.uinvulnerable,
            blind: {
                ublind: u.ublind,
                blind: u.blind,
                propBlind: u.uprops?.blind,
                propBlinded: u.uprops?.blinded,
                ucreamed: u.ucreamed,
            },
            umoved: u.umoved,
            contextMove: game.context?.move,
            contextMulti: game.context?.multi || 0,
            simpleRepeats: game._simple_timed_repeats_remaining || 0,
            simpleRepeatText: game._simple_timed_repeat_text || '',
            farlookCursor: game._farlook_cursor ? { ...game._farlook_cursor } : null,
            awaitingFarlook: !!game._awaiting_farlook_prompt,
            nomul: game._nomul_turns_remaining || 0,
            prayerTurns: game._prayer_turns_remaining || 0,
            pendingPrayerFinish: !!game._pending_prayer_finish_message,
            awaitingPrayerDoneMore: !!game._awaiting_prayer_done_more,
            prayerInline: !!game._prayer_finish_result_inline,
            prayerForceBudgetAdjust: !!game._prayer_force_intrinsic_budget_adjust,
            prayerBlindMovesCredit: !!game._prayer_force_blind_moves_credit,
            prayerFirstRestored: !!game._prayer_interrupted_first_turn_restored,
            prayerFullNoRestore: !!game._prayer_full_budget_no_restore,
            more: !!game._more,
            dismissals: game._more_dismissals_remaining || 0,
            monsterMoreAnyKey: !!game._monster_more_accepts_any_key,
            resumePostDosounds: !!game._resume_post_dosounds_turn_tail,
            fastExtra: !!game._fast_extra_action_pending,
            zeroMovePolyMovement: game._zero_move_poly_movement ?? null,
            zeroMovePolyCatchupActive: !!game._zero_move_poly_catchup_active,
            afterMoreMessage: game._after_more_message || '',
            afterMoreNeedsPrompt: !!game._after_more_needs_prompt,
            afterMoreStrict: !!game._after_more_strict_keys,
            deferredPhysical: game._deferred_monster_physical_attack ? {
                name: game._deferred_monster_physical_attack.mtmp?.data?.name,
                nextIndex: game._deferred_monster_physical_attack.nextIndex,
                attacks: game._deferred_monster_physical_attack.attacks,
                current: game._deferred_monster_physical_attack.current,
            } : null,
            monsterAttackMoreWaiting: !!game._monster_attack_more_waiting,
            monsterAttackResumeBehind: !!game._monster_attack_resume_behind_after_more,
            monsterPhysicalPackBehindActiveMore: !!game._monster_physical_pack_behind_active_more,
            monsterAttackTailTransientAfterMore: !!game._monster_attack_tail_transient_after_more,
            monsterToplineDeferred: !!game._monster_topline_deferred,
            monsterAttackTailPendingPack: !!game._monster_attack_tail_pending_pack,
            monsterPaused: !!game._monster_turn_paused_for_more,
            monsterDeathPending: !!game._monster_death_pending,
            fatalMonsterAttackPaused: !!game._fatal_monster_attack_paused,
            deathPromptActive: !!game._death_prompt_active,
            deathBonesChecked: !!game._death_bones_checked,
            deathBonesPending: !!game._death_bones_check_pending,
            nomovemsg: game._nomovemsg || '',
            savelifeFollowupMoreShown: !!game._savelife_resume_followup_more_shown,
            savelifeSilentMonsterResume: !!game._life_saving_silent_monster_resume,
            monsterToplineStopAfterEscMore: !!game._monster_topline_stop_after_esc_more,
            resumeMonsterTurn: !!game._resume_monster_turn,
            stairArrivalEffects: !!game._stair_arrival_effects_after_more,
            stairFallDamage: !!game._stair_fall_damage_after_more,
            stairArrivalRedraw: !!game._stair_arrival_redraw_pending,
            arrivalFloorLook: !!game._arrival_floor_look_after_more,
            floorListPauses: !!game._floor_list_pauses_turn,
            resumeFloorList: !!game._resume_floor_list_turn,
            deferredMoveFloorList: game._deferred_move_floor_list ? { ...game._deferred_move_floor_list } : null,
            deferredMoveFloorListResumeSpotEffects: !!game._deferred_move_floor_list_resume_spot_effects,
            deferredMoveFloorListResumeMonsterScan: !!game._deferred_move_floor_list_resume_monster_scan,
            deferredMoveFloorListResumeTurnTail: !!game._deferred_move_floor_list_resume_turn_tail,
            petMissPromptAfterResume: !!game._pet_miss_prompt_after_resume,
            deferredPetMissPassive: !!game._deferred_pet_miss_passive,
            petCombatPendingBoundary: !!game._pet_combat_pending_boundary,
            petMissPreserveOnDismiss: !!game._pet_miss_prompt_preserve_on_dismiss,
            petCombatMoreLatched: !!game._pet_combat_more_latched,
            arrivalFloorListNoTurn: !!game._arrival_floor_list_no_turn,
            stairArrivalResumeFloor: !!game._stair_arrival_resume_after_floor_list,
            floorLines: Array.isArray(game._floor_list_lines) ? game._floor_list_lines.length : 0,
            punishment: {
                punished: !!game._punished,
                ball: game.uball ? {
                    x: game.uball.ox, y: game.uball.oy,
                    where: game.uball.where, otyp: game.uball.otyp,
                    index: game.level?.objects?.indexOf(game.uball),
                } : null,
                chain: game.uchain ? {
                    x: game.uchain.ox, y: game.uchain.oy,
                    where: game.uchain.where, otyp: game.uchain.otyp,
                    index: game.level?.objects?.indexOf(game.uchain),
                } : null,
                nearbyObjects: (game.level?.objects || [])
                    .map((obj, index) => ({ index, otyp: obj.otyp, oclass: obj.oclass, x: obj.ox, y: obj.oy }))
                    .filter((obj) => Math.abs((obj.x ?? -99) - (u.ux ?? 0)) <= 4
                        && Math.abs((obj.y ?? -99) - (u.uy ?? 0)) <= 2),
            },
            pending: game._pending_message || '',
            inventory: (game.inventory || []).map((obj) => ({
                invlet: obj?.invlet,
                otyp: obj?.otyp,
                oclass: obj?.oclass,
                quan: obj?.quan,
                spe: obj?.spe,
                oartifact: obj?.oartifact,
                oname: obj?.oname,
                onamelth: obj?.onamelth,
                wielded: !!obj?.wielded,
                owornmask: obj?.owornmask,
                appearanceName: obj?.appearanceName,
                known: obj?.known,
                knownName: obj?.knownName,
            })),
            combatTrace: (globalThis.__teleportCombatTrace || []).slice(-8),
            nextInvlet: game._next_invlet_code || null,
            rngCount,
            totalRng,
            actualTop: topLine(screen),
            expectedTop: topLine(expected.screen || ''),
            actualRow10: String(screen || '').split('\n')[10] || '',
            expectedRow10: String(expected.screen || '').split('\n')[10] || '',
            actualStatus: statusLine(screen),
            expectedStatus: statusLine(expected.screen || ''),
            adjacent,
            nearbyMonsters,
            traps: (game.level?.traps || []).map((trap) => ({
                ttyp: trap.ttyp,
                x: trap.tx,
                y: trap.ty,
                tseen: trap.tseen,
                launch: trap.launch,
            })),
            allMonsters: compact ? [] : (game.level?.monsters || []).map((mon, index) => ({
                index,
                id: mon.m_id,
                name: mon.data?.name,
                x: mon.mx,
                y: mon.my,
                movement: mon.movement,
                mmove: mon.data?.mmove,
                sleeping: mon.msleeping,
                canmove: mon.mcanmove,
                peaceful: mon.mpeaceful,
                tame: mon.mtame,
                mflee: mon.mflee,
                mtrack: mon.mtrack || [],
            })),
            inspectCells,
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

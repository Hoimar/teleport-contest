import { game } from './gstate.js';
import { rn2 } from './rng.js';
import { dosounds } from './sounds.js';
import { A_CON, A_DEX } from './const.js';

export function maybe_generate_rnd_mon() {
    // C ref: allmain.c:166
    rn2(70);
}

export function gethungry() {
    // C ref: eat.c:3191
    rn2(20);
}

function currentAttr(index) {
    return game.u?.acurr?.a?.[index] ?? 10;
}

export function exercise(index, increase) {
    if (!game.u) return;
    if (!game.u.aexe) game.u.aexe = [0, 0, 0, 0, 0, 0];
    if (Math.abs(game.u.aexe[index] || 0) >= 50) return;
    if (increase) {
        if (rn2(19) > currentAttr(index)) game.u.aexe[index]++;
    } else {
        game.u.aexe[index] -= rn2(2);
    }
}

export function exerchk() {
    // C ref: attrib.c:exerper().  This covers the ordinary early-game
    // hunger/encumbrance shape; status, polymorph, and encumbrance side
    // effects are still future work.
    const moves = (game.moves || 1) + 1;
    if (moves % 10 === 0) {
        const hunger = game.u?.uhunger ?? 900;
        if (hunger > 150 && hunger <= 1000) exercise(A_CON, true);
    }
}

export function maybe_wipe_engraving() {
    // C ref: allmain.c:360 — !rn2(40 + ACURR(A_DEX) * 3)
    const dex = currentAttr(A_DEX);
    rn2(40 + dex * 3);
}

export function maybe_update_seer_turn() {
    const context = game.context || (game.context = {});
    if (context.seer_turn == null) return;
    const moves = (game.moves || 1) + 1;
    if (moves >= context.seer_turn) {
        context.seer_turn = moves + rn2(31) + 15;
    }
}

export { dosounds };

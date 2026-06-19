// Generated RNG tail for the tourist starter session.
// Live init_objects(), init_dungeons(), u_init_misc_rng(), and mklev run before this.
//
// Source session: seed8000-tourist-starter.session.json

import { game } from "./gstate.js";
import { rn2, rnd } from "./rng.js";

// Post-mklev startup: u_init_role, ini_inv, attributes, moveloop_preamble
// 124 leaf RNG calls (regenerated from session data)
function play(calls) {
    let last = null;
    for (const call of calls) {
        if (call.f === 'rn2') last = rn2(call.b);
        else if (call.f === 'rnd') last = rnd(call.b);
    }
    return last;
}

export function fastforward_post_mklev(options = {}) {
    const calls = [
        { f: 'rnd', b: 1000 }, { f: 'rn2', b: 20 }, { f: 'rnd', b: 2 }, { f: 'rn2', b: 6 },
        { f: 'rn2', b: 11 }, { f: 'rn2', b: 10 }, { f: 'rn2', b: 10 }, { f: 'rn2', b: 100 },
        { f: 'rn2', b: 20 }, { f: 'rn2', b: 1 }, { f: 'rnd', b: 1000 }, { f: 'rnd', b: 2 },
        { f: 'rn2', b: 6 }, { f: 'rnd', b: 1000 }, { f: 'rnd', b: 2 }, { f: 'rn2', b: 6 },
        { f: 'rnd', b: 1000 }, { f: 'rnd', b: 2 }, { f: 'rn2', b: 6 }, { f: 'rnd', b: 1000 },
        { f: 'rnd', b: 2 }, { f: 'rn2', b: 6 }, { f: 'rnd', b: 1000 }, { f: 'rnd', b: 2 },
        { f: 'rn2', b: 6 }, { f: 'rnd', b: 1000 }, { f: 'rnd', b: 2 }, { f: 'rn2', b: 6 },
        { f: 'rnd', b: 1000 }, { f: 'rnd', b: 2 }, { f: 'rn2', b: 6 }, { f: 'rnd', b: 1000 },
        { f: 'rnd', b: 2 }, { f: 'rn2', b: 6 }, { f: 'rnd', b: 1000 }, { f: 'rnd', b: 2 },
        { f: 'rn2', b: 6 }, { f: 'rnd', b: 1000 }, { f: 'rnd', b: 2 }, { f: 'rn2', b: 6 },
        { f: 'rn2', b: 3 }, { f: 'rn2', b: 4 }, { f: 'rn2', b: 5 }, { f: 'rn2', b: 7 },
        { f: 'rn2', b: 8 }, { f: 'rn2', b: 11 }, { f: 'rn2', b: 15 }, { f: 'rn2', b: 16 },
        { f: 'rn2', b: 21 }, { f: 'rn2', b: 15 }, { f: 'rn2', b: 10 }, { f: 'rn2', b: 6 },
        { f: 'rn2', b: 1 }, { f: 'rnd', b: 2 }, { f: 'rn2', b: 4 }, { f: 'rn2', b: 2 },
        { f: 'rnd', b: 2 }, { f: 'rn2', b: 4 }, { f: 'rn2', b: 2 }, { f: 'rn2', b: 1 },
        { f: 'rnd', b: 2 }, { f: 'rn2', b: 4 }, { f: 'rnd', b: 2 }, { f: 'rn2', b: 4 },
        { f: 'rnd', b: 2 }, { f: 'rn2', b: 4 }, { f: 'rnd', b: 2 }, { f: 'rn2', b: 4 },
        { f: 'rn2', b: 1 }, { f: 'rnd', b: 2 }, { f: 'rn2', b: 10 }, { f: 'rn2', b: 11 },
        { f: 'rn2', b: 10 }, { f: 'rn2', b: 10 }, { f: 'rn2', b: 1 }, { f: 'rnd', b: 2 },
        { f: 'rn2', b: 70 }, { f: 'rn2', b: 1 }, { f: 'rn2', b: 1 }, { f: 'rnd', b: 2 },
        { f: 'rn2', b: 1 }, { f: 'rn2', b: 25 }, { f: 'rn2', b: 25 }, { f: 'rn2', b: 25 },
        { f: 'rn2', b: 20 }, { f: 'rn2', b: 1 }, { f: 'rnd', b: 2 }, { f: 'rn2', b: 100 },
        { f: 'rn2', b: 100 }, { f: 'rn2', b: 100 }, { f: 'rn2', b: 100 }, { f: 'rn2', b: 100 },
        { f: 'rn2', b: 100 }, { f: 'rn2', b: 100 }, { f: 'rn2', b: 100 }, { f: 'rn2', b: 100 },
        { f: 'rn2', b: 100 }, { f: 'rn2', b: 100 }, { f: 'rn2', b: 100 }, { f: 'rn2', b: 100 },
        { f: 'rn2', b: 100 }, { f: 'rn2', b: 100 }, { f: 'rn2', b: 100 }, { f: 'rn2', b: 100 },
        { f: 'rn2', b: 100 }, { f: 'rn2', b: 100 }, { f: 'rn2', b: 100 }, { f: 'rn2', b: 100 },
        { f: 'rn2', b: 100 }, { f: 'rn2', b: 100 }, { f: 'rn2', b: 100 }, { f: 'rn2', b: 100 },
        { f: 'rn2', b: 100 }, { f: 'rn2', b: 100 }, { f: 'rn2', b: 100 }, { f: 'rn2', b: 20 },
        { f: 'rn2', b: 20 }, { f: 'rn2', b: 20 }, { f: 'rn2', b: 7 }, { f: 'rn2', b: 20 },
        { f: 'rn2', b: 20 }, { f: 'rn2', b: 20 }, { f: 'rnd', b: 9000 }, { f: 'rnd', b: 30 },
    ];
    const played = options.skipUInitRoleInventory ? calls.slice(87) : calls;
    const last = play(played);
    if (played.at(-1)?.f === 'rnd' && played.at(-1)?.b === 30) {
        game.context = game.context || {};
        game.context.seer_turn = last;
    }
}

export function fastforward_post_mklev_after_u_init_role_inventory() {
    fastforward_post_mklev({ skipUInitRoleInventory: true });
}

#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';

const ROOT = new URL('../', import.meta.url);
const MONSTERS_H = new URL('nethack-c/upstream/include/monsters.h', ROOT);
const OUT = new URL('js/monster_data.js', ROOT);

const GEN = {
    G_FREQ: 0x0007,
    G_GENO: 0x0020,
    G_LGROUP: 0x0040,
    G_SGROUP: 0x0080,
    G_VLGROUP: 0x0100,
    G_NOGEN: 0x0200,
    G_HELL: 0x0400,
    G_NOHELL: 0x0800,
    G_UNIQ: 0x1000,
    G_NOCORPSE: 0x0010,
};

const M2 = {
    M2_NOPOLY: 0x00000001,
    M2_UNDEAD: 0x00000002,
    M2_WERE: 0x00000004,
    M2_HUMAN: 0x00000008,
    M2_ELF: 0x00000010,
    M2_DWARF: 0x00000020,
    M2_GNOME: 0x00000040,
    M2_ORC: 0x00000080,
    M2_DEMON: 0x00000100,
    M2_MERC: 0x00000200,
    M2_LORD: 0x00000400,
    M2_PRINCE: 0x00000800,
    M2_MINION: 0x00001000,
    M2_GIANT: 0x00002000,
    M2_SHAPESHIFTER: 0x00004000,
    M2_MALE: 0x00010000,
    M2_FEMALE: 0x00020000,
    M2_NEUTER: 0x00040000,
    M2_PNAME: 0x00080000,
    M2_HOSTILE: 0x00100000,
    M2_PEACEFUL: 0x00200000,
    M2_DOMESTIC: 0x00400000,
    M2_WANDER: 0x00800000,
    M2_STALK: 0x01000000,
    M2_NASTY: 0x02000000,
    M2_STRONG: 0x04000000,
    M2_ROCKTHROW: 0x08000000,
    M2_GREEDY: 0x10000000,
    M2_JEWELS: 0x20000000,
    M2_COLLECT: 0x40000000,
    M2_MAGIC: 0x80000000,
};

const M3 = {
    M3_WANTSAMUL: 0x0001,
    M3_WANTSBELL: 0x0002,
    M3_WANTSBOOK: 0x0004,
    M3_WANTSCAND: 0x0008,
    M3_WANTSARTI: 0x0010,
    M3_WANTSALL: 0x001f,
    M3_WAITFORU: 0x0040,
    M3_CLOSE: 0x0080,
    M3_COVETOUS: 0x001f,
    M3_WAITMASK: 0x00c0,
    M3_INFRAVISION: 0x0100,
    M3_INFRAVISIBLE: 0x0200,
    M3_DISPLACES: 0x0400,
};

const M1 = {
    M1_FLY: 0x00000001,
    M1_SWIM: 0x00000002,
    M1_AMORPHOUS: 0x00000004,
    M1_WALLWALK: 0x00000008,
    M1_CLING: 0x00000010,
    M1_TUNNEL: 0x00000020,
    M1_NEEDPICK: 0x00000040,
    M1_CONCEAL: 0x00000080,
    M1_HIDE: 0x00000100,
    M1_AMPHIBIOUS: 0x00000200,
    M1_BREATHLESS: 0x00000400,
    M1_NOTAKE: 0x00000800,
    M1_NOEYES: 0x00001000,
    M1_NOHANDS: 0x00002000,
    M1_NOLIMBS: 0x00006000,
    M1_NOHEAD: 0x00008000,
    M1_MINDLESS: 0x00010000,
    M1_HUMANOID: 0x00020000,
    M1_ANIMAL: 0x00040000,
    M1_SLITHY: 0x00080000,
    M1_UNSOLID: 0x00100000,
    M1_THICK_HIDE: 0x00200000,
    M1_OVIPAROUS: 0x00400000,
    M1_REGEN: 0x00800000,
    M1_SEE_INVIS: 0x01000000,
    M1_TPORT: 0x02000000,
    M1_TPORT_CNTRL: 0x04000000,
    M1_ACID: 0x08000000,
    M1_POIS: 0x10000000,
    M1_CARNIVORE: 0x20000000,
    M1_HERBIVORE: 0x40000000,
    M1_OMNIVORE: 0x60000000,
    M1_METALLIVORE: 0x80000000,
};

const MR = {
    MR_NONE: 0x00,
    MR_FIRE: 0x01,
    MR_COLD: 0x02,
    MR_SLEEP: 0x04,
    MR_DISINT: 0x08,
    MR_ELEC: 0x10,
    MR_POISON: 0x20,
    MR_ACID: 0x40,
    MR_STONE: 0x80,
};

const MS = {
    MS_SILENT: 0,
    MS_BARK: 1,
    MS_MEW: 2,
    MS_ROAR: 3,
    MS_BELLOW: 4,
    MS_GROWL: 5,
    MS_SQEEK: 6,
    MS_SQAWK: 7,
    MS_CHIRP: 8,
    MS_HISS: 9,
    MS_BUZZ: 10,
    MS_GRUNT: 11,
    MS_NEIGH: 12,
    MS_MOO: 13,
    MS_WAIL: 14,
    MS_GURGLE: 15,
    MS_BURBLE: 16,
    MS_TRUMPET: 17,
    MS_ANIMAL: 17,
    MS_SHRIEK: 18,
    MS_BONES: 19,
    MS_LAUGH: 20,
    MS_MUMBLE: 21,
    MS_IMITATE: 22,
    MS_WERE: 23,
    MS_ORC: 24,
    MS_HUMANOID: 25,
    MS_ARREST: 26,
    MS_SOLDIER: 27,
    MS_GUARD: 28,
    MS_DJINNI: 29,
    MS_NURSE: 30,
    MS_SEDUCE: 31,
    MS_VAMPIRE: 32,
    MS_BRIBE: 33,
    MS_CUSS: 34,
    MS_RIDER: 35,
    MS_LEADER: 36,
    MS_NEMESIS: 37,
    MS_GUARDIAN: 38,
    MS_SELL: 39,
    MS_ORACLE: 40,
    MS_PRIEST: 41,
    MS_SPELL: 42,
    MS_BOAST: 43,
    MS_GROAN: 44,
    MS_FERRY: 45,
};

const CLR = {
    CLR_BLACK: 0,
    CLR_RED: 1,
    CLR_GREEN: 2,
    CLR_BROWN: 3,
    CLR_BLUE: 4,
    CLR_MAGENTA: 5,
    CLR_CYAN: 6,
    CLR_GRAY: 7,
    NO_COLOR: 8,
    CLR_ORANGE: 9,
    CLR_BRIGHT_GREEN: 10,
    CLR_YELLOW: 11,
    CLR_BRIGHT_BLUE: 12,
    CLR_BRIGHT_MAGENTA: 13,
    CLR_BRIGHT_CYAN: 14,
    CLR_WHITE: 15,
    HI_DOMESTIC: 15,
    HI_LORD: 5,
    HI_OVERLORD: 13,
    HI_METAL: 6,
    HI_GOLD: 11,
    HI_LEATHER: 3,
    HI_WOOD: 3,
    HI_PAPER: 15,
    HI_ZAP: 12,
    DRAGON_SILVER: 14,
};

const CONSTS = { ...GEN, ...M1, ...M2, ...M3, ...MR, ...MS, ...CLR };
CONSTS.A_NONE = 0;

const ATTACK_MACROS = {
    SEDUCTION_ATTACKS_YES: 'A(ATTK(AT_BITE, AD_SSEX, 0, 0), ATTK(AT_CLAW, AD_PHYS, 1, 3), ATTK(AT_CLAW, AD_PHYS, 1, 3), NO_ATTK, NO_ATTK, NO_ATTK)',
    SEDUCTION_ATTACKS_NO: 'A(ATTK(AT_CLAW, AD_PHYS, 1, 3), ATTK(AT_CLAW, AD_PHYS, 1, 3), ATTK(AT_BITE, AD_DRLI, 2, 6), NO_ATTK, NO_ATTK, NO_ATTK)',
};

function splitTopLevel(s) {
    const out = [];
    let depth = 0;
    let start = 0;
    let inString = false;
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (ch === '"' && s[i - 1] !== '\\') inString = !inString;
        if (inString) continue;
        if (ch === '(') depth++;
        else if (ch === ')') depth--;
        else if (ch === ',' && depth === 0) {
            out.push(s.slice(start, i).trim());
            start = i + 1;
        }
    }
    out.push(s.slice(start).trim());
    return out;
}

function insideCall(s, name) {
    const start = s.indexOf(`${name}(`);
    if (start < 0) throw new Error(`missing ${name}() in ${s}`);
    let depth = 0;
    for (let i = start + name.length; i < s.length; i++) {
        if (s[i] === '(') {
            if (depth++ === 0) var bodyStart = i + 1;
        } else if (s[i] === ')' && --depth === 0) {
            return s.slice(bodyStart, i);
        }
    }
    throw new Error(`unterminated ${name}() in ${s}`);
}

function evalMask(expr) {
    const cleaned = expr.replace(/\/\*[\s\S]*?\*\//g, '').replace(/[()]/g, ' ');
    let value = 0n;
    for (const raw of cleaned.split('|')) {
        let token = raw.trim();
        if (/^0x[0-9a-f]+[UL]+$/i.test(token) || /^-?\d+[UL]+$/i.test(token)) {
            token = token.replace(/[UL]+$/gi, '');
        }
        if (!token) continue;
        if (/^0x[0-9a-f]+$/i.test(token)) value |= BigInt(token);
        else if (/^-?\d+$/.test(token)) value |= BigInt(Number(token));
        else if (CONSTS[token] !== undefined) value |= BigInt(CONSTS[token]);
        else throw new Error(`unknown mask token ${token} in ${expr}`);
    }
    return Number(value);
}

function monsterName(nameArg, fallback) {
    const quoted = nameArg.match(/"([^"]+)"/);
    if (!quoted) return fallback.trim();
    return quoted[1].toUpperCase().replace(/[^A-Z0-9]+/g, '_').replace(/^_|_$/g, '');
}

function parseAttacks(expr) {
    expr = ATTACK_MACROS[expr.trim()] ?? expr;
    const attacks = splitTopLevel(insideCall(expr, 'A'));
    return attacks.map((entry) => {
        if (entry === 'NO_ATTK') return null;
        const parts = splitTopLevel(insideCall(entry, 'ATTK'));
        return [parts[0].trim(), parts[1].trim(), Number(parts[2]), Number(parts[3])];
    });
}

function collectMonsters(text) {
    const rows = [];
    for (let pos = 0; (pos = text.indexOf('MON(', pos)) >= 0;) {
        let depth = 0;
        let bodyStart = -1;
        let end = -1;
        for (let i = pos + 3; i < text.length; i++) {
            if (text[i] === '(') {
                if (depth++ === 0) bodyStart = i + 1;
            } else if (text[i] === ')' && --depth === 0) {
                end = i;
                break;
            }
        }
        if (end < 0) break;
        const body = text.slice(bodyStart, end).replace(/\/\*[\s\S]*?\*\//g, '');
        pos = end + 1;
        if (!body.includes('LVL(') || !body.includes('SIZ(')) continue;
        const args = splitTopLevel(body);
        const lvl = splitTopLevel(insideCall(args[2], 'LVL'));
        const siz = splitTopLevel(insideCall(args[5], 'SIZ'));
        const name = monsterName(args[0], args[13]);
        const mattk = parseAttacks(args[4]);
        const mlet = args[1].trim();
        const mlevel = Number(lvl[0]);
        const mmove = Number(lvl[1]);
        const maligntyp = CONSTS[lvl[4]?.trim()] ?? Number(lvl[4]);
        const geno = evalMask(args[3]);
        const msound = evalMask(siz[2]);
        const mresists = evalMask(args[6]);
        const mconveys = evalMask(args[7]);
        const mflags1 = evalMask(args[8]);
        const mflags2 = evalMask(args[9]);
        const mflags3 = evalMask(args[10]);
        const difficulty = Number(args[11]);
        const color = evalMask(args[12]);
        const neuter = (mflags2 & M2.M2_NEUTER) !== 0 ? 1 : 0;
        const male = (mflags2 & M2.M2_MALE) !== 0 ? 1 : 0;
        const female = (mflags2 & M2.M2_FEMALE) !== 0 ? 1 : 0;
        rows.push([
            name, mlet, mlevel, mmove, maligntyp, geno, difficulty, color,
            neuter, male, female, msound, mresists, mconveys, mflags1, mflags2, mflags3, mattk,
        ]);
    }
    return rows;
}

const source = readFileSync(MONSTERS_H, 'utf8')
    .replace(/^#if 0[\s\S]*?^#endif/gm, '')
    .replace(/^#ifdef CHARON[\s\S]*?^#endif/gm, '');
const rows = collectMonsters(source);
const lines = [
    '// Generated from nethack-c/upstream/include/monsters.h (NetHack 5.0).',
    '// C refs: include/monsters.h MON() rows, include/monflag.h G_* flags, makemon.c:rndmonst_adj().',
    '// Fields: name, mlet, mlevel, mmove, maligntyp, geno, difficulty, color, neuter, male, female, msound, mresists, mconveys, mflags1, mflags2, mflags3, mattk.',
    'export const MONSTER_DATA = [',
    ...rows.map((row) => `    ${JSON.stringify(row)},`),
    '];',
    '',
];
writeFileSync(OUT, lines.join('\n'));

export async function load(url, context, nextLoad) {
    const result = await nextLoad(url, context);
    if (!url.endsWith('/js/cmd.js')) return result;
    let source = String(result.source);
    source = source.replace(
        `    const baseDamage = Math.max(1, damage + heroMeleeDamageBonus(weapon));
    return baseDamage + artifactDamageBonus(weapon, mon, baseDamage);`,
        `    const artifactBonus = artifactDamageBonus(weapon, mon, damage);
    const skillBonus = heroMeleeDamageBonus(weapon);
    const totalDamage = Math.max(1, damage + artifactBonus + skillBonus);
    (globalThis.__teleportCombatTrace ||= []).push({
        rng: globalThis.__teleportRngTraceIndex || 0,
        mon: mon?.data?.name,
        monId: mon?.m_id,
        hpBefore: mon?.mhp,
        hpmax: mon?.mhpmax,
        weapon: weapon ? {
            invlet: weapon.invlet,
            otyp: weapon.otyp,
            oclass: weapon.oclass,
            spe: weapon.spe,
            oartifact: weapon.oartifact,
            oname: weapon.oname,
            onamelth: weapon.onamelth,
            wielded: !!weapon.wielded,
            owornmask: weapon.owornmask,
        } : null,
        baseRollDamage: damage,
        bonus: skillBonus,
        baseDamage: damage,
        artifactBonus,
        totalDamage,
    });
    return totalDamage;`
    );
    return { ...result, source };
}

export async function load(url, context, defaultLoad) {
    const result = await defaultLoad(url, context, defaultLoad);
    if (!url.endsWith('/js/cmd.js')) return result;
    let source = typeof result.source === 'string'
        ? result.source
        : result.source ? Buffer.from(result.source).toString('utf8') : '';
    if (!source) return result;
    source = source.replace(
        "    if (game._stair_arrival_resume_after_floor_list\n        && (game._more_dismissals_remaining || 0) <= 0) {\n",
        "    if (game._stair_arrival_resume_after_floor_list\n        && (game._more_dismissals_remaining || 0) <= 0) {\n        console.log('[hm-early-stair]', JSON.stringify({more:!!game._more,dismissals:game._more_dismissals_remaining||0,monsterPaused:!!game._monster_turn_paused_for_more,pending:game._pending_message||''}));\n",
    );
    source = source.replace(
        "            const pendingPhysicalSplit = splitDeferredMonsterPhysicalTopline(game._pending_message || '');\n",
        "            const pendingPhysicalSplit = splitDeferredMonsterPhysicalTopline(game._pending_message || '');\n            if ((game._pending_message || '').includes('soldier ant') || (game._after_more_message || '').includes('elf-lord')) console.log('[hm-after-more-start]', JSON.stringify({moves:game.moves,more:!!game._more,dismissals:game._more_dismissals_remaining||0,pausedMonsterTurn,afterMsg:game._after_more_message||'',msg,rest,pending:game._pending_message||'',pendingPhysicalSplit,afterMoreNeedsPrompt:!!game._after_more_needs_prompt,extraEncumbered:!!game._extra_encumbered_turn_pending,attackResume:!!game._monster_attack_resume_behind_after_more}));\n",
    );
    source = source.replace(
        "            if (needsPrompt) {\n",
        "            if ((game._pending_message || '').includes('soldier ant') || msg.includes('elf-lord')) console.log('[hm-before-needs]', JSON.stringify({moves:game.moves,needsPrompt,more:!!game._more,dismissals:game._more_dismissals_remaining||0,pausedMonsterTurn,msg,pending:game._pending_message||'',afterMsg:game._after_more_message||'',pendingPhysicalSplit,extraEncumbered:!!game._extra_encumbered_turn_pending,attackResume:!!game._monster_attack_resume_behind_after_more}));\n            if (needsPrompt) {\n",
    );
    source = source.replace(
        "                    resumeMonsterBehindNewMore = true;\n                    game._monster_attack_resume_behind_after_more = false;\n",
        "                    resumeMonsterBehindNewMore = true;\n                    console.log('[hm-resume-behind-new-more]', JSON.stringify({moves:game.moves,msg,pending:game._pending_message||'',afterMsg:game._after_more_message||'',pendingPhysicalSplit,extraEncumbered:!!game._extra_encumbered_turn_pending,attackResume:!!game._monster_attack_resume_behind_after_more}));\n                    game._monster_attack_resume_behind_after_more = false;\n",
    );
    source = source.replace(
        "    if (pausedFloorListTurn\n        && game._more\n",
        "    if (pausedFloorListTurn || game._stair_arrival_resume_after_floor_list || (game._pending_message || '').includes('elf-lord') || (game._pending_message || '').includes('soldier ant')) console.log('[hm-bottom]', JSON.stringify({pausedFloorListTurn, resumeMonsterBehindNewMore, pausedMonsterTurn, more:!!game._more, dismissals:game._more_dismissals_remaining||0, after:game._after_more_message||'', pending:game._pending_message||'', q:game._more_message_queue?.length||0, resumeFloor:!!game._resume_floor_list_turn, stairResume:!!game._stair_arrival_resume_after_floor_list, monsterPaused:!!game._monster_turn_paused_for_more, resumeMonster:!!game._resume_monster_turn}));\n    if (pausedFloorListTurn\n        && game._more\n",
    );
    source = source.replace(
        "    } else if (pausedFloorListTurn && !game._more) {\n",
        "    } else if (pausedFloorListTurn && !game._more) {\n        console.log('[hm-floor-branch]', JSON.stringify({stairResume:!!game._stair_arrival_resume_after_floor_list, monsterPaused:!!game._monster_turn_paused_for_more}));\n",
    );
    return { ...result, source };
}

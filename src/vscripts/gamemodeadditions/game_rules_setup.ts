import { GameMode } from "../GameMode";
import { onThink } from "./functions/listener_functions";

const game_rules_setup_experienceMultiplier = 3;
const game_rules_setup_goldMultiplier = 3;
const game_rules_setup_onThinkTime = IsInToolsMode() ? 0.1 : 1;

export function SetupGameRules(gameMode: GameMode) {
    const heroSelectionTime = 20;

    // Setup ability draft gamemode type
    Convars.SetBool("sv_cheats", true);
    SendToServerConsole("dota_ability_draft_force_gamemode_flag 0");

    GameRules.SetCustomGameAllowBattleMusic(false);
    GameRules.SetCustomGameAllowHeroPickMusic(false);
    GameRules.SetCustomGameAllowMusicAtGameStart(false);

    GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.GOODGUYS, 5);
    GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.BADGUYS, 5);
    GameRules.SetHeroSelectionTime(heroSelectionTime);
    GameRules.SetCustomGameSetupTimeout(30);
    GameRules.SetStrategyTime(10);
    GameRules.SetPreGameTime(10000);
    GameRules.SetUseUniversalShopMode(true);
    GameRules.SetGoldPerTick(4);
    GameRules.SetStartingGold(1000);

    if (IsInToolsMode()) {
        GameRules.SetShowcaseTime(10);
    }
    GameRules.GetGameModeEntity().SetModifyExperienceFilter(
        (event) => modifyExperienceFilter(event),
        gameMode
    );

    GameRules.GetGameModeEntity().SetModifyGoldFilter((event) => {
        return modifyGoldFilter(event);
    }, gameMode);
    GameRules.GetGameModeEntity().SetThink(
        (entity: CBaseEntity) => {
            onThink(entity);
            return game_rules_setup_onThinkTime; // Return the amount (in seconds) OnThink triggers
        },
        undefined,
        undefined,
        0
    );

    const gameModeEntity = GameRules.GetGameModeEntity();
    gameModeEntity.SetAnnouncerDisabled(true);
    gameModeEntity.SetFreeCourierModeEnabled(true);
    gameModeEntity.SetUseTurboCouriers(true);
    gameModeEntity.SetRespawnTimeScale(0.2);
    gameModeEntity.SetAllowNeutralItemDrops(true);
    gameModeEntity.SetDraftingBanningTimeOverride(15);
}

function modifyExperienceFilter(event: ModifyExperienceFilterEvent): boolean {
    event.experience = event.experience * game_rules_setup_experienceMultiplier;
    return true; // Return true to update new values, false does not modify
}

function modifyGoldFilter(event: ModifyGoldFilterEvent): boolean {
    event.gold = event.gold * game_rules_setup_goldMultiplier;
    return true; // Return true to update new values, false does not modify
}

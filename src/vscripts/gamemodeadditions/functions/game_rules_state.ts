import { AbilitySelection } from "../../lib/ability_selection";

export class GameRulesState {
    private static instance: GameRulesState | undefined = undefined;

    // State variables
    abilitySelection: AbilitySelection | undefined = undefined;
    abilityPickPhaseEnded: boolean = false;
    balancerCanGetAdded: boolean = true;
    heroList: string[] = [];

    static getInstance() {
        if (this.instance === undefined) {
            this.instance = new GameRulesState();
        }
        return this.instance;
    }

    // State callback functions
    onAbilityPickPhaseCompleted(): void {
        // Key Mappings Part
        const playerAbilityMappings: TestEvent[] = [];
        for (let i = 0; i < 16; i++) {
            const player = PlayerResource.GetPlayer(i as PlayerID);
            if (!player) {
                continue;
            }
            const namesToExclude: string[] = [
                "generic_hidden",
                "ability_capture",
                "abyssal_underlord_portal_warp",
                "twin_gate_portal_warp",
                "ability_lamp_use",
                "ability_pluck_famango",
            ];
            const playerAbilities: string[] = [];
            const hero = PlayerResource.GetSelectedHeroEntity(i as PlayerID);
            // Get all abilities on the hero that are visible
            const abilities = hero!.GetAbilityCount();
            for (let j = 0; j < abilities; j++) {
                const ability = hero!.GetAbilityByIndex(j);
                if (
                    ability?.IsAttributeBonus() ||
                    ability?.IsItem() ||
                    ability?.IsNull() ||
                    ability?.GetAbilityName() === undefined ||
                    namesToExclude.includes(ability.GetAbilityName())
                ) {
                    continue;
                }
                if (ability?.GetAbilityName() !== undefined) {
                    playerAbilities.push(ability.GetAbilityName());
                }
            }
            playerAbilityMappings.push({
                abilities: playerAbilities,
                playerID: i as PlayerID,
            });
        }
        CustomGameEventManager.Send_ServerToAllClients(
            "on_create_ability_swap_ui",
            playerAbilityMappings
        );

        // Game Setup Part
        SendToServerConsole("dota_ability_draft_force_gamemode_flag 1");
        const timeTillForceStart = IsInToolsMode() ? 1 : 30;
        // Remove the panic modifier from all heroes
        for (let i = 0; i < 16; i++) {
            const player = PlayerResource.GetPlayer(i as PlayerID);
            if (!player) {
                continue;
            }
            const hero = PlayerResource.GetSelectedHeroEntity(i as PlayerID);
            hero?.RemoveModifierByName("modifier_panic");
        }
        Timers.CreateTimer(timeTillForceStart, () => {
            GameRules.ForceGameStart();
            Timers.CreateTimer(20, () => {
                GameRules.SetCreepSpawningEnabled(true);
                GameRules.SpawnAndReleaseCreeps();
            });
        });
        // Send a message to all players indicating time till game start without using CustomGameEventManager
        const message = `Game starting in ${timeTillForceStart} seconds! Please ignore the Pre Game Clock!`;
        GameRules.SendCustomMessage(message, 0, 0);

        const gameModeEntity = GameRules.GetGameModeEntity();
        gameModeEntity.SetAnnouncerDisabled(false);

        GameRulesState.getInstance().abilityPickPhaseEnded = true;
    }
}

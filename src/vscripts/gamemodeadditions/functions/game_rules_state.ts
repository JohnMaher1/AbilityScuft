import { AbilitySelection } from "../../lib/ability_selection";

export class GameRulesState {
    private static instance: GameRulesState | undefined = undefined;

    // State variables. Prefix with _ to show at top of class
    _abilitySelection: AbilitySelection | undefined = undefined;
    _abilityPickPhaseEnded: boolean = false;
    _balancerCanGetAdded: boolean = true;
    _heroList: string[] = [];
    _canRunAbilitySelectionOnThink: boolean = true;
    _playerAbilityMappings: AbilitySwapCreateEvent[] = [];
    _unselectedAbilities: AbilityInformation[] = [];

    static getInstance() {
        if (this.instance === undefined) {
            this.instance = new GameRulesState();
        }
        return this.instance;
    }

    // Functions
    initAbilitySwap(): void {
        this._playerAbilityMappings = [];
        for (let i = 0; i < 16; i++) {
            const player = PlayerResource.GetPlayer(i as PlayerID);
            if (!player) {
                continue;
            }
            GameRulesState.getInstance().createPlayerAbilitySwapMenu(
                player.GetPlayerID()
            );
        }
        CustomGameEventManager.Send_ServerToAllClients(
            "on_create_ability_swap_ui",
            this._playerAbilityMappings
        );
    }

    getPlayerAbilities(playerID: PlayerID): string[] {
        const namesToExclude: string[] = [
            "generic_hidden",
            "ability_capture",
            "abyssal_underlord_portal_warp",
            "twin_gate_portal_warp",
            "ability_lamp_use",
            "ability_pluck_famango",
        ];
        const playerAbilities: string[] = [];
        const hero = PlayerResource.GetSelectedHeroEntity(playerID);
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
        return playerAbilities;
    }

    createPlayerAbilitySwapMenu(
        playerID: PlayerID,
        singlePlayer?: boolean
    ): void {
        const playerAbilities = this.getPlayerAbilities(playerID);
        if (singlePlayer) {
            this._playerAbilityMappings.find(
                (x) => x.playerID === playerID
            )!.abilities = playerAbilities;
            CustomGameEventManager.Send_ServerToPlayer(
                PlayerResource.GetPlayer(playerID)!,
                "on_create_ability_swap_ui",
                this._playerAbilityMappings
            );
            return;
        }
        this._playerAbilityMappings.push({
            abilities: playerAbilities,
            playerID: playerID,
        });
    }
    // State callback functions
    onAbilityPickPhaseCompleted(): void {
        GameRulesState.getInstance().initAbilitySwap();

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
            GameRules.SetCreepSpawningEnabled(true);
            GameRules.SpawnAndReleaseCreeps();
        });
        // Send a message to all players indicating time till game start without using CustomGameEventManager
        const message = `Game starting in ${timeTillForceStart} seconds! Please ignore the Pre Game Clock!`;
        GameRules.SendCustomMessage(message, 0, 0);

        const gameModeEntity = GameRules.GetGameModeEntity();
        gameModeEntity.SetAnnouncerDisabled(false);

        GameRulesState.getInstance()._abilityPickPhaseEnded = true;
    }
}

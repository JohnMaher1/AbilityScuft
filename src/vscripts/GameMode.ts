import {
    HasHiddenAbility,
    HasInateAbility,
    HasInateTag,
    IsAttributeTypeAbility,
    IsNotLearnableAbility,
    isSpecialAbility,
} from "./lib/util";
import { reloadable } from "./lib/tstl-utils";
import { modifier_panic } from "./modifiers/modifier_panic";
import { AbilitySelection } from "./lib/ability_selection";

const heroSelectionTime = 20;
const onThinkTime = IsInToolsMode() ? 0.25 : 1;

let abilitySelection: AbilitySelection;
let mockPickDebug = true;

interface DebugParameters {
    abilityNames: string[];
}

declare global {
    interface CDOTAGameRules {
        Addon: GameMode;
    }
}

@reloadable
export class GameMode {
    public static Precache(this: void, context: CScriptPrecacheContext) {
        PrecacheResource(
            "particle",
            "particles/units/heroes/hero_meepo/meepo_earthbind_projectile_fx.vpcf",
            context
        );
        PrecacheResource(
            "soundfile",
            "soundevents/game_sounds_heroes/game_sounds_meepo.vsndevts",
            context
        );
    }

    public static Activate(this: void) {
        // When the addon activates, create a new instance of this GameMode class.
        GameRules.Addon = new GameMode();
    }

    constructor() {
        this.configure();
        // Register event listeners for dota engine events
        ListenToGameEvent(
            "game_rules_state_change",
            () => this.OnStateChange(),
            undefined
        );
        ListenToGameEvent(
            "npc_spawned",
            (event) => this.OnNpcSpawned(event),
            undefined
        );

        // Register event listeners for events from the UI
        CustomGameEventManager.RegisterListener(
            "ui_panel_closed",
            (_, data) => {
                print(`Player ${data.PlayerID} has closed their UI panel.`);

                // Respond by sending back an example event
                const player = PlayerResource.GetPlayer(data.PlayerID)!;
                CustomGameEventManager.Send_ServerToPlayer(
                    player,
                    "example_event",
                    {
                        myNumber: 42,
                        myBoolean: true,
                        myString: "Hello!",
                        myArrayOfNumbers: [1.414, 2.718, 3.142],
                    }
                );

                // Also apply the panic modifier to the sending player's hero
                const hero = player.GetAssignedHero();
                hero.AddNewModifier(hero, undefined, modifier_panic.name, {
                    duration: 5,
                });
            }
        );
    }

    private onAbilityPickPhaseCompleted(): void {
        GameRules.SetPreGameTime(30);
        Timers.CreateTimer(30, () => {
            GameRules.ForceGameStart();
        });
        const gameModeEntity = GameRules.GetGameModeEntity();
        gameModeEntity.SetAnnouncerDisabled(false);
    }

    // Next goal. Set option to autopick abilities for players

    private configure(): void {
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.GOODGUYS, 5);
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.BADGUYS, 5);
        GameRules.SetHeroSelectionTime(10);
        GameRules.SetCustomGameSetupTimeout(10);

        Timers.CreateTimer(10, () => {
            //GameRules.FinishCustomGameSetup();
        });

        GameRules.SetStrategyTime(10);
        GameRules.SetPreGameTime(100);
        GameRules.SetUseUniversalShopMode(true);
        GameRules.SetGoldPerTick(4);

        const gameModeEntity = GameRules.GetGameModeEntity();
        gameModeEntity.SetAnnouncerDisabled(true);
        gameModeEntity.SetFreeCourierModeEnabled(true);
        GameRules.SetShowcaseTime(IsInToolsMode() ? 0 : 10);
        GameRules.SetHeroSelectionTime(heroSelectionTime);
        GameRules.GetGameModeEntity().SetThink(
            (entity: CBaseEntity) => {
                this.OnThink(entity);
                return onThinkTime; // Return the amount (in seconds) OnThink triggers
            },
            undefined,
            undefined,
            0
        );
    }

    public OnStateChange(): void {
        const state = GameRules.State_Get();
        // Add 4 bots to lobby in tools
        if (IsInToolsMode() && state == GameState.CUSTOM_GAME_SETUP) {
            // Force pick a hero for dev
            for (let i = 0; i < 5; i++) {
                Tutorial.AddBot("npc_dota_hero_lina", "", "", false);
            }
            for (let i = 1; i < 5; i++) {
                Tutorial.AddBot("npc_dota_hero_lina", "", "", true);
            }
        }

        if (state === GameState.CUSTOM_GAME_SETUP) {
            // Automatically skip setup in tools
            if (IsInToolsMode()) {
                Timers.CreateTimer(3, () => {
                    //GameRules.FinishCustomGameSetup();
                });
            }
        }

        // Start game once pregame hits
        if (state === GameState.PRE_GAME) {
            Timers.CreateTimer(1, () => this.StartGame());
        }
    }

    private StartGame(): void {
        this.ReloadAndStartGame();
        // Do some stuff here
    }

    private ReloadAndStartGame(): void {
        const debugParameters = this.ReadAllHeroFiles();
        abilitySelection = new AbilitySelection(
            debugParameters.abilityNames,
            this.onAbilityPickPhaseCompleted
        );
        abilitySelection.init();
    }

    private ModifyExperienceFilter(
        event: ModifyExperienceFilterEvent
    ): boolean {
        event.experience = event.experience * 3;
        return true; // Return true to update new values, false does not modify
    }

    private ReadAllHeroFiles(): DebugParameters {
        const heroList = LoadKeyValues("scripts/npc/hero_list.txt");
        const abilities: AbilityInformation[] = [];

        const abilityTotalCount = 105;
        const heroEntries = Object.entries(heroList);
        const heroListLength = heroEntries.length;

        GameRules.GetGameModeEntity().SetModifyExperienceFilter(
            (event) => this.ModifyExperienceFilter(event),
            this
        );

        for (let i = 0; i < heroListLength; i++) {
            const random = Math.floor(Math.random() * heroListLength);
            const [key, value] = heroEntries[random];

            const file = LoadKeyValues("scripts/npc/heroes/" + key + ".txt");
            Object.entries(file).forEach(([abilityName, abilityValues]) => {
                let canAddAbility: boolean = true;
                if (
                    typeof abilityValues !== "number" &&
                    !isSpecialAbility(abilityName)
                ) {
                    Object.entries(abilityValues as any).forEach(
                        ([abilityKey, abilityValue]) => {
                            let abilityValueString = abilityValue as string;
                            if (
                                abilityKey === "AbilityBehavior" &&
                                (HasHiddenAbility(abilityValueString) ||
                                    HasInateAbility(abilityValueString) ||
                                    IsNotLearnableAbility(abilityValueString) ||
                                    IsAttributeTypeAbility(abilityValueString))
                            ) {
                                canAddAbility = false;
                            }
                        }
                    );

                    // Check for innates
                    const keys = Object.keys(abilityValues);
                    if (HasInateTag(keys)) {
                        canAddAbility = false;
                    }

                    if (canAddAbility) {
                        abilities.push({
                            abilityName: abilityName,
                            abilityNumber: 1,
                        });
                    }
                }
            });
        }

        // Shuffle items in the abilities array
        let abilitiesAdded = 0;
        let shuffledAbilities: string[] = [];
        while (abilitiesAdded < abilityTotalCount + 1) {
            const random = Math.floor(Math.random() * abilities.length);
            print(abilities[random].abilityName);
            if (shuffledAbilities.includes(abilities[random].abilityName)) {
                continue;
            }
            shuffledAbilities.push(abilities[random].abilityName);
            abilitiesAdded++;
        }

        // Make a copy of the array that includes the first 90 elements
        shuffledAbilities.splice(abilityTotalCount);

        CustomGameEventManager.Send_ServerToAllClients(
            "on_abilities_load",
            shuffledAbilities
        );
        return { abilityNames: shuffledAbilities };
    }

    // Called on script_reload
    public Reload() {
        print("Script reloaded!");
        this.ReloadAndStartGame();
        //this.ReadAllHeroFiles();
    }

    public OnThink(entity: CBaseEntity): void {
        if (abilitySelection && mockPickDebug) {
            abilitySelection.mockPick();
        }
        CustomGameEventManager.Send_ServerToAllClients("on_think", {} as never);
        this.HandleGoldGain();
    }

    private HandleGoldGain(): void {
        // Check game state is in progress
        if (GameRules.State_Get() !== GameState.GAME_IN_PROGRESS) {
            return;
        }
        const playerIDs = PlayerResource.GetPlayerCount();
        for (let i = 0; i < playerIDs; i++) {
            const player = PlayerResource.GetPlayer(i as PlayerID);
            const hero = player?.GetAssignedHero();
            // if (hero) {
            //     PlayerResource.ModifyGold(
            //         i as PlayerID,
            //         5,
            //         true,
            //         ModifyGoldReason.UNSPECIFIED
            //     );
            // }
        }
    }

    private OnNpcSpawned(event: NpcSpawnedEvent) {
        // After a hero unit spawns, apply modifier_panic for 8 seconds
        const unit = EntIndexToHScript(event.entindex) as CDOTA_BaseNPC; // Cast to npc since this is the 'npc_spawned' event

        // Give all real heroes (not illusions) the meepo_earthbind_ts_example spell
        if (unit.IsRealHero()) {
            if (!unit.HasAbility("meepo_earthbind_ts_example")) {
                // Add lua ability to the unit
                unit.AddAbility("meepo_earthbind_ts_example");
            }
        }
    }
}

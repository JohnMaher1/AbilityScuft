import {
    HasHiddenAbility,
    HasInateAbility,
    HasInateTag,
    IsAttributeTypeAbility,
    IsNotLearnableAbility,
    isSpecialAbility,
} from "./lib/util";
import { BaseAbility, registerAbility } from "./lib/dota_ts_adapter";
import { reloadable } from "./lib/tstl-utils";
import { modifier_panic } from "./modifiers/modifier_panic";
import { AbilitySelection } from "./lib/ability_selection";

const heroSelectionTime = 20;

let abilitySelection: AbilitySelection;

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

    private configure(): void {
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.GOODGUYS, 3);
        GameRules.SetCustomGameTeamMaxPlayers(DotaTeam.BADGUYS, 3);
        GameRules.SetHeroSelectionTime(3);
        GameRules.SetStrategyTime(3);
        // Setup Ability Selection
        // GameRules.SetCustomGameSetupTimeout(3);

        // Timers.CreateTimer(3, () => {
        //     GameRules.FinishCustomGameSetup();
        // });

        // // Make all setup including hero selection in this setup phase
        // // Custom Game Phase 1: Settings, stuff like team selection, gold gain etc
        // // Custom Game Phase 2: Hero Selection (pre straight forward)
        // // Custom Game Phase 3: Ability Selection (oh yeah)
        // // End Custom Game Setup and go for it

        GameRules.SetPreGameTime(500);
        GameRules.SetShowcaseTime(0);
        GameRules.SetHeroSelectionTime(heroSelectionTime);
        GameRules.GetGameModeEntity().SetThink(
            (entity: CBaseEntity) => {
                this.OnThink(entity);
                return 0.25; // Return the amount (in seconds) OnThink triggers
            },
            undefined,
            undefined,
            0
        );
        GameRules.SetGoldPerTick(1000);
    }

    public OnStateChange(): void {
        const state = GameRules.State_Get();
        // Add 4 bots to lobby in tools
        if (IsInToolsMode() && state == GameState.CUSTOM_GAME_SETUP) {
            // Force pick a hero for dev
            PlayerResource.GetPlayer(0)!.MakeRandomHeroSelection();
            for (let i = 0; i < 4; i++) {
                Tutorial.AddBot("npc_dota_hero_lina", "", "", false);
                //Tutorial.AddBot("npc_dota_hero_lina", "", "", true);
            }
        }

        if (state === GameState.CUSTOM_GAME_SETUP) {
            // Automatically skip setup in tools
            if (IsInToolsMode()) {
                Timers.CreateTimer(3, () => {
                    GameRules.FinishCustomGameSetup();
                });
            }
        }

        // Start game once pregame hits
        if (state === GameState.PRE_GAME) {
            Timers.CreateTimer(1, () => this.StartGame());
        }
    }

    private StartGame(): void {
        print("Game starting!");
        this.ReloadAndStartGame();
        print("HMMM");
        // Do some stuff here
    }

    private ReloadAndStartGame(): void {
        this.ReadAllHeroFiles();
        abilitySelection = new AbilitySelection();
        abilitySelection.init();
    }

    private ReadAllHeroFiles() {
        const heroList = LoadKeyValues("scripts/npc/hero_list.txt");
        let index = 1;
        const abilities: AbilityInformation[] = [];

        // Randomize Object.entries(heroList) to get a random hero

        const abilityTotalCount = 105;
        const heroEntries = Object.entries(heroList);
        const heroListLength = heroEntries.length;

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
        const abilityNames = abilities.map((ability) => ability.abilityName);
        for (let i = abilityNames.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [abilityNames[i], abilityNames[j]] = [
                abilityNames[j],
                abilityNames[i],
            ];
        }
        abilities.forEach((ability, index) => {
            ability.abilityName = abilityNames[index];
        });

        // Make a copy of the array that includes the first 90 elements
        abilities.splice(abilityTotalCount);

        CustomGameEventManager.Send_ServerToAllClients(
            "on_abilities_load",
            abilities
        );
    }

    // Called on script_reload
    public Reload() {
        print("Script reloaded!");
        this.ReloadAndStartGame();
        //this.ReadAllHeroFiles();
    }

    public OnThink(entity: CBaseEntity): void {
        CustomGameEventManager.Send_ServerToAllClients("on_think", {} as never);
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

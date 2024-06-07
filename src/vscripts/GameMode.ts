import {
    HasHiddenAbility,
    HasInateAbility,
    HasInateTag,
    IsAttributeTypeAbility,
    IsNotLearnableAbility,
    abilityNamesToIgnore,
    isSpecialAbility,
} from "./lib/util";
import { reloadable } from "./lib/tstl-utils";
import { modifier_panic } from "./modifiers/modifier_panic";
import { AbilitySelection } from "./lib/ability_selection";
import { hero_kv_readAllHeroFiles } from "./lib/hero_kv_file_helper";

class SettingsState {
    forceRandomAbilities: boolean = false;
}

const heroSelectionTime = 20;
const onThinkTime = IsInToolsMode() ? 0.1 : 1;
let abilityPickPhaseEnded: boolean = false;
const goldMultiplier = 3;
const experienceMultiplier = 3;

let abilitySelection: AbilitySelection;
const settingsState = new SettingsState();

declare global {
    interface CDOTAGameRules {
        Addon: GameMode;
    }
}

const getHeroToSoundNameMapping = (heroName: string): string => {
    switch (heroName) {
        case "night_stalker":
            return "nightstalker";
        case "drow_ranger":
            return "drowranger";
        case "shadow_shaman":
            return "shadowshaman";
        case "skeleton_king":
            return "skeletonking";
        case "crystal_maiden":
            return "crystalmaiden";
        case "witch_doctor":
            return "witchdoctor";
        case "storm_spirit":
            return "stormspirit";
        case "sand_king":
            return "sandking";
        case "doom_bringer":
            return "doombringer";
        default:
            return heroName;
    }
};

@reloadable
export class GameMode {
    public static Precache(this: void, context: CScriptPrecacheContext) {
        // PrecacheResource(
        //     "particle",
        //     "particles/units/heroes/hero_meepo/meepo_earthbind_projectile_fx.vpcf",
        //     context
        // );
        // PrecacheResource(
        //     "soundfile",
        //     "soundevents/game_sounds_heroes/game_sounds_meepo.vsndevts",
        //     context
        // );
        // const heroList = LoadKeyValues("scripts/npc/hero_list.txt");
        // const heroNames = Object.keys(heroList);
        // const particleList = LoadKeyValues(
        //     "scripts/particles/hero_particles.txt"
        // );
        // const particleNames = Object.keys(particleList);
        // // Particle Effects
        // for (const key of particleNames) {
        //     const keyCopy = key.substring(0, key.length - 2);
        //     PrecacheResource(
        //         "particle",
        //         `particles/units/heroes/${keyCopy}`,
        //         context
        //     );
        // }
        // // Hero Sounds
        // for (const key of heroNames) {
        //     const heroName = key.replace("npc_dota_hero_", "");
        //     const heroSoundName = getHeroToSoundNameMapping(heroName);
        //     PrecacheResource(
        //         "soundfile",
        //         `soundevents/game_sounds_heroes/game_sounds_${heroSoundName}.vsndevts`,
        //         context
        //     );
        // }
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

        ListenToGameEvent(
            "item_purchased",
            (event) => this.OnItemPurchased(event),
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

        CustomGameEventManager.RegisterListener(
            "on_start_button_clicked",
            (_, data) => {
                print("Start button clicked event recieved by server");
                GameRules.FinishCustomGameSetup();
            }
        );

        CustomGameEventManager.RegisterListener(
            "on_settings_toggle",
            (_, data) => {
                print(
                    data.toggleEventName,
                    " is now",
                    data.isActive === 1 ? "Active" : "Inactive"
                );
                if (data.toggleEventName === "forceRandomAbilities") {
                    settingsState.forceRandomAbilities = data.isActive === 1;
                    print(
                        "Force random abilities state: ",
                        settingsState.forceRandomAbilities
                    );
                }
            }
        );
    }
    OnItemPurchased(
        event: GameEventProvidedProperties & ItemPurchasedEvent
    ): void {
        const player = PlayerResource.GetPlayer(
            event.splitscreenplayer as PlayerID
        );
    }

    private onAbilityPickPhaseCompleted(): void {
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

        abilityPickPhaseEnded = true;
    }

    private configure(): void {
        // Allow cheats when deployed
        Convars.SetBool("sv_cheats", true);

        // Run a console command
        SendToServerConsole("dota_ability_draft_force_gamemode_flag 1");

        // Disable player movement and pointer events
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

        // Set the shop to be able to be used anywhere

        // Reduce cooldown on TP Scrolls
        Convars.SetFloat("dota_ability_teleport_cooldown", 25);

        GameRules.SetShowcaseTime(IsInToolsMode() ? 0 : 10);
        GameRules.GetGameModeEntity().SetModifyExperienceFilter(
            (event) => this.ModifyExperienceFilter(event),
            this
        );

        GameRules.GetGameModeEntity().SetModifyGoldFilter((event) => {
            return this.ModifyGoldFilter(event);
        }, this);
        GameRules.GetGameModeEntity().SetThink(
            (entity: CBaseEntity) => {
                this.OnThink(entity);
                return onThinkTime; // Return the amount (in seconds) OnThink triggers
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

    private AddModifierToHeroToPreventMovement() {
        for (let i = 0; i < DOTA_MAX_PLAYERS; i++) {
            const player = PlayerResource.GetPlayer(i as PlayerID);
            if (!player) {
                continue;
            }
            const hero = PlayerResource.GetSelectedHeroEntity(i as PlayerID);
            hero?.AddNewModifier(hero, undefined, "modifier_panic", {
                duration: 50000,
            });
        }
    }

    private StartGame(): void {
        this.AddModifierToHeroToPreventMovement();
        this.ReloadAndStartGame();
        // Do some stuff here
    }

    private ReloadAndStartGame(): void {
        const debugParameters = hero_kv_readAllHeroFiles();
        print(
            "Starting the game with force abilities set to: ",
            settingsState.forceRandomAbilities
        );
        abilitySelection = new AbilitySelection(
            debugParameters.abilityNames,
            this.onAbilityPickPhaseCompleted,
            settingsState.forceRandomAbilities
        );
        abilitySelection.init();
    }

    private ModifyExperienceFilter(
        event: ModifyExperienceFilterEvent
    ): boolean {
        event.experience = event.experience * experienceMultiplier;
        return true; // Return true to update new values, false does not modify
    }

    private ModifyGoldFilter(event: ModifyGoldFilterEvent): boolean {
        event.gold = event.gold * goldMultiplier;
        return true; // Return true to update new values, false does not modify
    }

    // Called on script_reload
    public Reload() {
        print("Script reloaded!");
        this.ReloadAndStartGame();
        //this.ReadAllHeroFiles();
    }

    public OnThink(entity: CBaseEntity): void {
        CustomGameEventManager.Send_ServerToAllClients("on_think", {} as never);
        this.HandleGoldGain();
        if (settingsState.forceRandomAbilities && !abilityPickPhaseEnded) {
            abilitySelection?.mockPick();
        }
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
        // const unit = EntIndexToHScript(event.entindex) as CDOTA_BaseNPC; // Cast to npc since this is the 'npc_spawned' event
        // // Give all real heroes (not illusions) the meepo_earthbind_ts_example spell
        // if (unit.IsRealHero()) {
        //     if (!unit.HasAbility("meepo_earthbind_ts_example")) {
        //         // Add lua ability to the unit
        //         unit.AddAbility("meepo_earthbind_ts_example");
        //     }
        // }
    }
}

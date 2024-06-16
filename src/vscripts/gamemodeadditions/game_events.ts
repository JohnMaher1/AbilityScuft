import { modifier_panic } from "../modifiers/modifier_panic";
import {
    handleAbilitySwapEvent,
    handleDotaPlayerUsedAbility,
    handlePlayerReconnect,
    onNpcSpawned,
    onStateChange,
} from "./functions/listener_functions";
import { SettingsState } from "./functions/settings_state";

// Listeners
export const ListenToGameEvents = () => {
    ListenToGameEvent(
        "game_rules_state_change",
        () => onStateChange(),
        undefined
    );
    ListenToGameEvent("npc_spawned", (event) => onNpcSpawned(event), undefined);
    ListenToGameEvent(
        "dota_player_used_ability",
        (event) => {
            handleDotaPlayerUsedAbility(event);
        },
        undefined
    );
    // Could see the players and background, no ability images are shwon
    ListenToGameEvent(
        "dota_player_reconnected",
        (event) => {
            handlePlayerReconnect(event);
        },
        undefined
    );
};

export const ListenToCustomEvents = () => {
    // Register event listeners for events from the UI
    CustomGameEventManager.RegisterListener("ui_panel_closed", (_, data) => {
        print(`Player ${data.PlayerID} has closed their UI panel.`);

        // Respond by sending back an example event
        const player = PlayerResource.GetPlayer(data.PlayerID)!;
        CustomGameEventManager.Send_ServerToPlayer(player, "example_event", {
            myNumber: 42,
            myBoolean: true,
            myString: "Hello!",
            myArrayOfNumbers: [1.414, 2.718, 3.142],
        });

        // Also apply the panic modifier to the sending player's hero
        const hero = player.GetAssignedHero();
        hero.AddNewModifier(hero, undefined, modifier_panic.name, {
            duration: 5,
        });
    });

    CustomGameEventManager.RegisterListener(
        "on_start_button_clicked",
        (_, data) => {
            print("Start button clicked event recieved by server");
            GameRules.FinishCustomGameSetup();
        }
    );

    CustomGameEventManager.RegisterListener("on_setting_change", (_, data) => {
        SettingsState.getInstance().handleSettingsChange(data);
    });

    CustomGameEventManager.RegisterListener("on_ability_swap", (_, data) => {
        handleAbilitySwapEvent(data);
    });
};

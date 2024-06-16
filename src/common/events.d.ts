/**
 * This file contains types for the events you want to send between the UI (Panorama)
 * and the server (VScripts).
 *
 * IMPORTANT:
 *
 * The dota engine will change the type of event data slightly when it is sent, so on the
 * Panorama side your event handlers will have to handle NetworkedData<EventType>, changes are:
 *   - Booleans are turned to 0 | 1
 *   - Arrays are automatically translated to objects when sending them as event. You have
 *     to change them back into arrays yourself! See 'toArray()' in src/panorama/hud.ts
 */

// To declare an event for use, add it to this table with the type of its data
interface CustomGameEventDeclarations {
    example_event: ExampleEventData;
    ui_panel_closed: UIPanelClosedEventData;
    on_think: never;
    on_abilities_load: string[];
    on_ability_clicked: AbilityClickedEventData;
    on_ability_handled: AbilityClickedEventData;
    on_turn_change: PlayerTurnChangedEvent;
    on_player_ability_select: PlayerAbilitySelectEvent;
    on_ability_pick_phase_completed: never;
    on_start_button_clicked: never;
    on_setting_change: SettingsChangeEvent;
    on_create_ability_swap_ui: TestEvent[];
    on_keybind_submit: KeybindSubmitEvent;
    on_ability_swap: AbilitySwapEvent;
    on_player_reconnect: PlayerReconnectedEvent;
    on_ability_time_allowed_expired: never;
    on_all_players_selected_abilties: never;
}

type SettingsName = "forceRandomAbilities" | "n/a";

interface AbilitySwapEvent {
    playerID: PlayerID;
    abilityName1: string;
    abilityName2: string;
}
interface AbilitySelectionClickEvent {
    abilityName: string;
    playerID: PlayerID;
}

interface SettingsChangeEvent {
    settingName: SettingsName;
    isActive?: boolean;
    input?: string;
}

interface KeybindSubmitEvent {
    playerID: PlayerID;
    key: string;
    abilityName: string;
}

interface TestEvent {
    abilities: string[];
    playerID: PlayerID;
}

interface PlayerAbilitySelectEvent {
    playerID: PlayerID;
    abilityName: string;
    abilityPosition: number;
}

interface PlayerTurnChangedEvent {
    playerTurnID: PlayerID;
}

interface AbilityInformation {
    heroName: string;
    abilityName: string;
    abilityNumber: number;
}

interface AbilityClickedEventData {
    player: PlayerID;
    abilityName: string;
}

// Define the type of data sent by the example_event event
interface ExampleEventData {
    myNumber: number;
    myBoolean: boolean;
    myString: string;
    myArrayOfNumbers: number[];
}

// This event has no data
interface UIPanelClosedEventData {}

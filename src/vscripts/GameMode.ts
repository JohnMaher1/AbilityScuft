import {
    ListenToCustomEvents,
    ListenToGameEvents,
} from "./gamemodeadditions/game_events";
import { SetupGameRules } from "./gamemodeadditions/game_rules_setup";
import { PrecacheResources } from "./gamemodeadditions/setup_helpers";
import { reloadable } from "./lib/tstl-utils";

declare global {
    interface CDOTAGameRules {
        Addon: GameMode;
    }
}

@reloadable
export class GameMode {
    public static Precache(this: void, context: CScriptPrecacheContext) {
        PrecacheResources(context);
    }

    public static Activate(this: void) {
        // When the addon activates, create a new instance of this GameMode class.
        GameRules.Addon = new GameMode();
    }

    constructor() {
        this.Init();
    }

    private Init() {
        this.configure();
    }

    private configure(): void {
        ListenToGameEvents();
        ListenToCustomEvents();
        SetupGameRules(this);
    }

    // Called on script_reload
    public Reload() {
        print("Script reloaded!");
    }
}

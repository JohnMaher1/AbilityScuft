export class SettingsState {
    public forceRandomAbilities: boolean = false;
    private static instance: SettingsState | undefined = undefined;

    static getInstance() {
        if (this.instance === undefined) {
            this.instance = new SettingsState();
        }
        return this.instance;
    }

    handleSettingsChange(data: {
        settingName: SettingsName;
        isActive?: 0 | 1 | undefined;
        input?: string | undefined;
        PlayerID: PlayerID;
    }) {
        if (data.settingName === "forceRandomAbilities") {
            SettingsState.getInstance().forceRandomAbilities =
                data.isActive === 1;
            print(
                "Force random abilities state: ",
                SettingsState.getInstance().forceRandomAbilities
            );
        }
    }
}

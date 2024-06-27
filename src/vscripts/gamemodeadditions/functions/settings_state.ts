export class SettingsState {
    public forceRandomAbilities: boolean = false;
    public allowPassives: boolean = true;
    private static instance: SettingsState | undefined = undefined;

    static getInstance() {
        if (this.instance === undefined) {
            this.instance = new SettingsState();
        }
        return this.instance;
    }

    setAllowPassives(value: boolean) {
        this.allowPassives = value;
    }

    setForceRandomAbilities(value: boolean) {
        this.forceRandomAbilities = value;
    }

    handleSettingsChange(data: {
        settingName: SettingsName;
        isActive?: 0 | 1 | undefined;
        input?: string | undefined;
        PlayerID: PlayerID;
    }) {
        if (data.settingName === ("forceRandomAbilities" as SettingsName)) {
            SettingsState.getInstance().setForceRandomAbilities(
                data.isActive === 1
            );
        }
        if (data.settingName === ("allowPassives" as SettingsName)) {
            SettingsState.getInstance().setAllowPassives(data.isActive === 1);
        }
    }
}

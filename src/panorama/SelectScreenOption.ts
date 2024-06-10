enum OptionType {
    TOGGLE,
    TEXT,
    NUMBER,
}

class SelectScreenOption {
    // Instance variables
    panel: Panel;
    toggle: ToggleButton;
    label: LabelPanel;
    optionName: SettingsChangeEvent["settingName"];

    constructor(parent: Panel, optionType: OptionType) {
        // Create new panel
        const panel = $.CreatePanel("Panel", parent, "");
        this.panel = panel;
        // Load snippet into panel
        panel.BLoadLayoutSnippet("PreGameOption");

        GameEvents.Subscribe("on_setting_change", (event) => {
            if (event.settingName === this.optionName) {
                switch (optionType) {
                    case OptionType.TOGGLE:
                        if (event.isActive === 0) {
                            this.toggle.style.backgroundColor = "red";
                            this.toggle.checked = false;
                        } else {
                            this.toggle.style.backgroundColor = "green";
                            this.toggle.checked = true;
                        }
                }
            }
        });

        // Find components
        this.label = panel.FindChild("OptionLabel") as LabelPanel;

        if (optionType === OptionType.TOGGLE) {
            this.toggle = panel.FindChild("OptionToggle") as ToggleButton;

            this.toggle.SetPanelEvent("onactivate", () => {
                if (!isPlayerAllowedToToggle()) {
                    return;
                }
                GameEvents.SendCustomGameEventToServer("on_setting_change", {
                    settingName: this.optionName,
                    isActive: this.toggle.checked === true,
                });
                GameEvents.SendCustomGameEventToAllClients(
                    "on_setting_change",
                    {
                        settingName: this.optionName,
                        isActive: this.toggle.checked === true,
                    }
                );
            });
        }

        const isPlayerAllowedToToggle = (): boolean => {
            const playerId = Players.GetLocalPlayer();
            const playerName = Players.GetPlayerName(playerId);
            return playerId === 0 || playerName === "Floppers";
        };
    }
}

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
    optionName: SettingsToggleEvent["toggleEventName"];

    constructor(parent: Panel, optionType: OptionType) {
        // Create new panel
        const panel = $.CreatePanel("Panel", parent, "");
        this.panel = panel;
        // Load snippet into panel
        panel.BLoadLayoutSnippet("PreGameOption");

        // Find components
        this.label = panel.FindChild("OptionLabel") as LabelPanel;

        if (optionType === OptionType.TOGGLE) {
            this.toggle = panel.FindChild("OptionToggle") as ToggleButton;

            this.toggle.SetPanelEvent("onactivate", () => {
                const playerId = Players.GetLocalPlayer();
                if (playerId !== 0) {
                    return;
                }

                $.Msg("Toggle clicked by host");
                switch (this.toggle.checked) {
                    case true:
                        this.toggle.style.backgroundColor = "red";
                        break;
                    case false:
                        this.toggle.style.backgroundColor = "green";
                        break;
                }
                GameEvents.SendCustomGameEventToServer("on_settings_toggle", {
                    isActive: this.toggle.checked,
                    toggleEventName: "forceRandomAbilities",
                });
            });
        }
    }
}

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
                switch (this.toggle.checked) {
                    case false:
                        this.toggle.style.backgroundColor = "red";
                        this.toggle.checked = false;
                        break;
                    case true:
                        this.toggle.style.backgroundColor = "green";
                        this.toggle.checked = true;
                        break;
                }
                $.Msg("Toggle clicked", this.toggle.checked, this.optionName);
                GameEvents.SendCustomGameEventToServer("on_settings_toggle", {
                    isActive: this.toggle.checked === true,
                    toggleEventName: this.optionName,
                });
            });
        }
    }
}

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
        }
    }
}

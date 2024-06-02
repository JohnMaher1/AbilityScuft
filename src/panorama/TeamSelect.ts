interface OptionToggle {
    onToggle: (checked: boolean) => void;
    labelText: string;
}

class TeamSelect {
    panel: Panel;
    options: Partial<Record<number, SelectScreenOption>> = {};
    constructor(panel: Panel) {
        this.panel = panel;
        const container = this.panel.FindChild("OptionPanel")!;
        const optionsList = container.FindChild("OptionsList")!;
        optionsList.RemoveAndDeleteChildren();
        $.Msg("TeamSelect constructor", optionsList);
        let abilityImage = this.panel.FindChild(
            "TeamSelectBackgroundImage"
        )! as ImagePanel;
        abilityImage.SetImage(
            "file://{images}/custom_game/ability_background.jpg"
        );
        this.CreateNewToggleOption(
            "Force Random Abilities",
            "forceRandomAbilities"
        );
        this.CreateNewToggleOption("Does nothing :)", "n/a");
    }

    private CreateNewToggleOption(
        name: string,
        optionName: SettingsToggleEvent["toggleEventName"]
    ) {
        const container = this.panel.FindChild("OptionPanel")!;
        const optionsList = container.FindChild("OptionsList")!;
        $.Msg("Creating new toggle option", optionsList);
        const newOption = new SelectScreenOption(
            optionsList,
            OptionType.TOGGLE
        );
        const optionsIndex = Object.keys(this.options).length;
        this.options[optionsIndex] = newOption;
        newOption.label.text = name;
        newOption.optionName = optionName;
    }
}

let ui2 = new TeamSelect($.GetContextPanel());

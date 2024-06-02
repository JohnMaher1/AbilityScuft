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
        const forceRandomAbilities = new SelectScreenOption(
            optionsList,
            OptionType.TOGGLE
        );
        this.options[0] = forceRandomAbilities;
        this.options[0].label.text = "Force Random Abilities";
        const newOption2 = new SelectScreenOption(
            optionsList,
            OptionType.TOGGLE
        );
        this.options[1] = newOption2;
        this.options[1].label.text = "Toggle a thing";
    }
}

let ui2 = new TeamSelect($.GetContextPanel());

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

        const startButtonPanel = this.panel.FindChild("StartButtonPanel")!;
        const startButton = startButtonPanel.FindChild("StartButton")!;
        startButton.SetPanelEvent("onactivate", () => {
            if (!this.isPlayerAllowedToToggle()) {
                return;
            }
            GameEvents.SendCustomGameEventToServer(
                "on_start_button_clicked",
                {} as never
            );
        });

        GameEvents.Subscribe("on_ability_pick_phase_completed", () => {
            // const startButtonPanel = this.panel.FindChild("StartButtonPanel");
            // startButtonPanel?.GetParent()?.RemoveAndDeleteChildren();
        });
    }

    private CreateNewToggleOption(
        name: string,
        optionName: SettingsChangeEvent["settingName"]
    ) {
        const container = this.panel.FindChild("OptionPanel")!;
        const optionsList = container.FindChild("OptionsList")!;
        const newOption = new SelectScreenOption(
            optionsList,
            OptionType.TOGGLE
        );
        const optionsIndex = Object.keys(this.options).length;
        this.options[optionsIndex] = newOption;
        newOption.label.text = name;
        newOption.optionName = optionName;
    }

    isPlayerAllowedToToggle = (): boolean => {
        const playerId = Players.GetLocalPlayer();
        const playerName = Players.GetPlayerName(playerId);
        return playerId === 0 || playerName === "Floppers";
    };
}

let ui2 = new TeamSelect($.GetContextPanel());
